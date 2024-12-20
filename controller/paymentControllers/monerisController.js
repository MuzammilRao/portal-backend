const AppError = require('../../utils/appError');
const CatchAsync = require('../../utils/CatchAsync');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const MonerisPayment = require('../../model/monerisModel');

exports.processPayment = CatchAsync(async (req, res, next) => {
  const {
    first_name,
    last_name,
    address,
    city,
    province,
    postal_code,
    phone_number,
    email,
    amount,
    pan,
    expiry_date,
    store_name,
    company_name = 'wizpub',
    country = 'United States',
    country_code,
    invoice_id,
  } = req.body;

  const paymentPayload = {
    amount: parseFloat(amount).toFixed(1),
    pan,
    expiry_date,
    first_name,
    last_name,
    email,
    company_name,
    address,
    city,
    province,
    postal_code,
    country,
    phone_number,
    country_code,
    store_name,
  };

  // console.log(paymentPayload);

  try {
    const response = await axios.post(
      'https://stagging-server786.com/moneris-payments/payment3.php',
      paymentPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(response.data.data);
    // console.log('--->', response.data.data.Message);
    const payment = await MonerisPayment.create({
      invoice_id,
      amount: paymentPayload.amount,
      pan: paymentPayload.pan,
      expiry_date: paymentPayload.expiry_date,
      first_name: paymentPayload.first_name,
      last_name: paymentPayload.last_name,
      email: paymentPayload.email,
      company_name: paymentPayload.company_name,
      address: paymentPayload.address,
      city: paymentPayload.city,
      province: paymentPayload.province,
      postal_code: paymentPayload.postal_code,
      country: paymentPayload.country,
      phone_number: paymentPayload.phone_number,
      country_code: paymentPayload.country_code,
      store_name: paymentPayload.store_name,
      response: response.data.data,
    });

    if (!response.data.data.Message.includes('APPROVED')) {
      return next(new AppError('Transaction Failed', 400));
    }

    // Save the payment details to the database

    res.status(200).json({
      status: 'success',
      data: payment,
    });
  } catch (error) {
    console.error('Payment API Error:', error.response ? error.response.data : error.message);
    return next(new AppError('Payment processing failed', 500));
  }
});

// const AppError = require('../../utils/appError');
// const CatchAsync = require('../../utils/CatchAsync');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');

// exports.processPayment = CatchAsync(async (req, res, next) => {
//   const {
//     first_name,
//     last_name,
//     address,
//     city,
//     province,
//     postal_code,
//     phone_number,
//     email,
//     amount,
//     pan,
//     expiry_date,
//     store_name,
//     company_name = 'wizpub',
//     country = 'United States',
//     country_code,
//     invoice_id,
//   } = req.body;

//   const paymentPayload = {
//     amount: parseFloat(amount).toFixed(1),
//     pan,
//     expiry_date,
//     first_name,
//     last_name,
//     email,
//     company_name,
//     address: address,
//     city,
//     province,
//     postal_code,
//     country,
//     phone_number,
//     country_code,
//     store_name,
//     // store_name: 'wizpub',
//     // store_name: 'web-inventix',
//   };

//   console.log(paymentPayload);

//   try {
//     const response = await axios.post(
//       'https://stagging-server786.com/moneris-payments/payment3.php',
//       paymentPayload,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     );

//     console.log(response.data.data);
//     console.log('--->', response.data.data.Message);

//     if (!response.data.data.Message.includes('APPROVED')) {
//       return next(new AppError('Transaction Failed', 400));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: response.data.data,
//     });
//   } catch (error) {
//     console.error('Payment API Error:', error.response ? error.response.data : error.message);
//     return next(new AppError('Payment processing failed', 500));
//   }
// });
