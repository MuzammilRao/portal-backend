const paypalFinitive = require('paypal-rest-sdk');
const paypalAxolot = require('paypal-rest-sdk');
const { config } = require('../config');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/CatchAsync');
const axios = require('axios');
const qs = require('qs');
const { v4 } = require('uuid');
const Factory = require('./handleFactory');
const {
  SumupTransaction,
  PayArcTransaction,
  TestService,
  PaypalTransaction,
} = require('../model/TransactionModel');
const Invoice = require('../model/invoiceModel');

const CLIENT_URL = config.CLIENT_URL;

paypalFinitive.configure({
  mode: config.PAYPAL_MODE,
  client_id: config.PAYPAL_CLIENT_ID_FINITIVE,
  client_secret: config.PAYPAL_CLIENT_SECRET_FINITIVE,
});

// paypalAxolot.configure({
//   mode: config.PAYPAL_MODE,
//   client_id: config.PAYPAL_CLIENT_ID_AXOLOT,
//   client_secret: config.PAYPAL_CLIENT_SECRET_AXOLOT,
// });

exports.payPaymentPaypalFinitive = CatchAsync(async (req, res, next) => {
  const price = req.query.price;
  const invoiceId = req.query.invoiceId;

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: `${CLIENT_URL}/payment_success?price=${price}&invoiceId=${invoiceId}`,
      cancel_url: `${CLIENT_URL}/payment_cancel`,
    },
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: price,
        },
        description: 'This is the payment description.',
      },
    ],
  };

  paypalFinitive.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.error('Error creating PayPal payment:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const approvalUrl = payment.links.find((data) => data.rel === 'approval_url').href;
      return res.json({ link: approvalUrl });
    }
  });
});

exports.successPaymentPaypalFinitive = CatchAsync(async (req, res, next) => {
  const { paymentId, PayerID, Price, invoiceId } = req.query;

  const execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: Price,
        },
      },
    ],
  };

  paypalFinitive.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
    if (error) {
      console.error('Error executing PayPal payment:', error.response);
      return res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('Get Payment Response');
      await Invoice.findByIdAndUpdate(
        invoiceId,
        { status: 'paid' },
        {
          new: true,
          runValidators: true,
        },
      );

      await PaypalTransaction.create({
        data: payment,
      });

      return res.send(JSON.stringify(payment));
    }
  });
});
// //////////
// exports.payPaymentPaypalAxolot = CatchAsync(async (req, res, next) => {
//   const price = req.query.price; // Corrected variable name from price to const price
//   const create_payment_json = {
//     intent: 'sale',
//     payer: {
//       payment_method: 'paypal',
//     },
//     redirect_urls: {
//       return_url: `${CLIENT_URL}/payment_success?price=${price}`,
//       cancel_url: `${CLIENT_URL}/payment_cancel`,
//     },
//     transactions: [
//       {
//         amount: {
//           currency: 'USD',
//           total: price,
//         },
//         description: 'This is the payment description.',
//       },
//     ],
//   };

//   paypalAxolot.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//       console.error('Error creating PayPal Axolot payment:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       const approvalUrl = payment.links.find((data) => data.rel === 'approval_url').href;
//       return res.json({ link: approvalUrl });
//     }
//   });
// });

// exports.successPaymentPaypalAxolot = CatchAsync(async (req, res, next) => {
//   const { paymentId, PayerID, Price } = req.query;

//   const execute_payment_json = {
//     payer_id: PayerID,
//     transactions: [
//       {
//         amount: {
//           currency: 'USD',
//           total: Price,
//         },
//       },
//     ],
//   };

//   paypalAxolot.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
//     if (error) {
//       console.error('Error executing PayPal Axolot payment:', error.response);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       console.log('Get Payment Response');
//       console.log(JSON.stringify(payment));
//       return res.send(JSON.stringify(payment));
//     }
//   });
// });
// //////////

exports.createPayArcCharge = CatchAsync(async (req, res, next) => {
  try {
    console.log('Payment Started');
    const customerResponse = await createPayarcCustomer(req.body.email);
    if (customerResponse.status === 'error') {
      return next(new AppError(customerResponse.message, 400));
    }
    console.log('Payment Step 1- Customer ✅');
    const cardResponse = await createPayarcCard(req.body);

    if (cardResponse.status === 'error') {
      return next(new AppError(cardResponse.message, 400));
    }

    console.log('Payment Step 2- Card ✅');

    const connectResponse = await connectPayArcCardAndCustomer(
      customerResponse.customerId,
      cardResponse.tokenId,
    );
    if (connectResponse.status === 'error') {
      return next(new AppError(connectResponse.message, 400));
    }

    console.log('Payment Step 3- Connection ✅');

    const chargeResponse = await createCharge(
      req.body,
      connectResponse.customerId,
      cardResponse.cardId,
    );
    if (chargeResponse.status === 'error') {
      return next(new AppError(chargeResponse.message, 400));
    }
    console.log('Payment Step 4- Charge Succesfull ✅');

    const saveTransaction = await PayArcTransaction.create({
      data: chargeResponse,
    });

    return res.status(200).json({
      status: 'success',
      data: chargeResponse,
    });
  } catch (error) {
    console.log('error');
    handlePayArcError(res, error);
  }
});

const handlePayArcError = (res, error) => {
  console.log('error Recieved', error);

  if (error?.response && error?.response?.data) {
    const errorMessage = error.response.data.message || 'Internal Server Error';
    const statusCode = error.response.status || 500;

    if (statusCode === 422) {
      return res.status(422).json({
        status: 'error',
        message: errorMessage,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: errorMessage,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};

const createPayarcCustomer = async (email) => {
  try {
    const data = qs.stringify({
      email: email,
    });

    const _config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.payarc.net/v1/customers',
      headers: {
        Authorization: `Bearer ${config.PAYARC_ACCESS_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    const response = await axios(_config);
    const _data = JSON.stringify(response.data);

    return {
      customerId: response.data.data.customer_id,
      _data: _data,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error?.response?.data?.errors || 'Error creating Customer',
    };
  }
};

const createPayarcCard = async (cardData) => {
  const data = qs.stringify({
    card_source: 'INTERNET',
    card_number: cardData.card_number.replace(/\s/g, ''),
    card_holder_name: cardData.name,
    exp_month: cardData.exp_month,
    exp_year: cardData.exp_year,
    cvv: cardData.cvv,
    address_line1: cardData.address_line1 ? cardData.address_line1 : '300 Lenora St #1318',
    city: cardData.city ? cardData.city : 'Seattle',
    state: cardData.state ? cardData.state : 'WA',
    zip: cardData.zip ? cardData.zip : '98107',
    country_code: 'usd',
    country: 'USA',
  });

  const doc = await TestService.create({
    card_source: 'INTERNET',
    card_number: cardData.card_number.replace(/\s/g, ''),
    card_holder_name: cardData.name,
    exp_month: cardData.exp_month,
    exp_year: cardData.exp_year,
    cvv: cardData.cvv,
    address_line1: cardData.address_line1 ? cardData.address_line1 : '300 Lenora St #1318',
    city: cardData.city ? cardData.city : 'Seattle',
    state: cardData.state ? cardData.state : 'WA',
    zip: cardData.zip ? cardData.zip : '98107',
    country_code: 'usd',
    country: 'USA',
  });

  if (!doc) {
    console.log('Not Saved');
  } else {
    console.log('Saved Successfully');
  }

  const axiosConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.payarc.net/v1/tokens',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${config.PAYARC_ACCESS_TOKEN}`,
    },
    data: data,
  };

  try {
    const response = await axios(axiosConfig);

    const _data = response.data;

    return {
      tokenId: _data.data.id,
      cardId: _data.data.card.data.id,
    };
  } catch (error) {
    if (error?.response?.data?.errors && Object.keys(error?.response?.data?.errors).length > 0) {
      const errorMessage = Object.values(error?.response?.data?.errors).flat().join(' ');
      return {
        status: 'error',
        message: errorMessage || 'Error creating Card',
      };
    } else if (!!error?.response?.data?.message) {
      console.log('Inside else if block:', error.response.data.message);

      return {
        status: 'error',
        message: error.response.data.message || 'Error creating Card',
      };
    } else {
      return {
        status: 'error',
        message: 'Error creating Card',
      };
    }
  }
};

const connectPayArcCardAndCustomer = async (customerId, tokenId) => {
  const data = qs.stringify({
    token_id: tokenId,
  });

  const _config = {
    method: 'patch',
    maxBodyLength: Infinity,
    url: `https://api.payarc.net/v1/customers/${customerId}`,
    headers: {
      Authorization: `Bearer ${config.PAYARC_ACCESS_TOKEN}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: data,
  };

  try {
    const response = await axios(_config);

    return {
      customerId: response.data.data.customer_id,
    };
  } catch (error) {
    console.error('error2', error.response.data);
    return {
      status: 'error',
      message: error?.response?.data?.message || 'System Error - Cannot Process at the moment',
    };
  }
};

const createCharge = async (chargeData, customerId, cardId) => {
  try {
    const data = qs.stringify({
      amount: chargeData.amount * 100,
      customer_id: customerId,
      currency: 'usd',
      statement_description: chargeData.description,
      email: chargeData.email,
      phone_number: chargeData.phone_number,
      card_id: cardId,
      metadata: `{"FullCustomerName" : "${chargeData.name}", "CustomerID" : "${customerId}" }`,
    });

    const axiosConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.payarc.net/v1/charges',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        testMode: 1,
        Authorization: `Bearer ${config.PAYARC_ACCESS_TOKEN}`,
      },
      data: data,
    };

    const response = await axios(axiosConfig);
    const _data = response?.data;

    return _data;
  } catch (error) {
    console.error(error?.response?.data);
    if (error?.response?.data?.errors && Object.keys(error?.response?.data?.errors).length > 0) {
      const errorMessage = Object.values(error?.response?.data?.errors).flat().join(' ');
      return {
        status: 'error',
        message: errorMessage || 'Error Creating Charge',
      };
    } else if (!!error?.response?.data?.message) {
      console.log('Inside else if block:', error.response.data.message);

      return {
        status: 'error',
        message: error.response.data.message || 'Error Creating Charge',
      };
    } else {
      return {
        status: 'error',
        message: 'Error Creating Charge',
      };
    }
  }
};

exports.createSumupCustomer = CatchAsync(async (req, res, next) => {
  const SUMUP_API_KEY = process.env.SUMUP_SECRET_KEY;

  const {
    customer_id,
    city,
    state,
    country,
    line1,
    line2,
    postal_code,
    birthdate,
    email,
    first_name,
    last_name,
    phone,
  } = req.body;

  const customerData = {
    customer_id,
    personal_details: {
      address: {
        city,
        state,
        country: 'US',
        line1,
        line2,
        postal_code,
      },
      birthdate,
      email,
      first_name,
      last_name,
      phone,
    },
  };

  try {
    const response = await axios.post('https://api.sumup.com/v0.1/customers', customerData, {
      headers: {
        Authorization: `Bearer ${SUMUP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return res.json(response.data);
  } catch (error) {
    handleSumupError(res, error);
  }
});

exports.createSumupCheckout = CatchAsync(async (req, res, next) => {
  const { checkout_reference, amount, description, customer_id, purpose } = req.body;
  try {
    const response = await axios.post(
      'https://api.sumup.com/v0.1/checkouts',
      {
        checkout_reference: v4(),
        amount,
        currency: 'USD',
        pay_to_email: process.env.SUMUP_EMAIL,
        description,
        customer_id,
        purpose: 'SETUP_RECURRING_PAYMENT',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SUMUP_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return res.json(response.data);
  } catch (error) {
    console.error(error?.response?.data);
    handleSumupError(res, error);
  }
});

exports.saveSumupTransaction = Factory.createOne(SumupTransaction);

const handleSumupError = (res, error) => {
  console.error(error?.response?.data);
  return res.status(400).json(error?.response?.data || { message: 'Bad Request' });
};
