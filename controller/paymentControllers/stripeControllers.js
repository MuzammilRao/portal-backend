const { config } = require('../../config');
const geoip = require('geoip-lite');
const WI_STRIPE = require('stripe')(config.WEB_INVENTIX_STRIPE_SECRET_KEY);
const WIZ_PUB = require('stripe')(config.WIZ_PUB_STRIPE_SECRET_KEY);

const AppError = require('../../utils/appError');
const CatchAsync = require('../../utils/CatchAsync');

exports.createPaymentIntentWI = CatchAsync(async (req, res, next) => {
  try {
    // IP validation
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const geo = geoip.lookup(ip);
    const allowedCountries = ['US', 'CA', 'GB'];

    if (!geo || !allowedCountries.includes(geo.country)) {
      return next(new AppError('Location Blocked', 403));
    }

    // Set default values for address fields if not provided
    const defaultAddress = {
      line1: '180 John St',
      city: 'Toronto',
      postal_code: 'M5T 1X5',
      state: 'ON',
      country: 'CA',
    };

    // Only validate essential fields
    const essentialFields = ['amount', 'currencyCode'];
    for (const field of essentialFields) {
      if (!req.body[field]) {
        return next(
          new AppError(
            'Something went wrong with your payment. Please try again later or contact support.',
            400,
          ),
        );
      }
    }

    // Use provided fields or defaults
    const firstName = req.body.firstName || 'Customer';
    const email = req.body.email || 'customer@webinventix.com';
    const address = req.body.address || defaultAddress.line1;
    const city = req.body.city || defaultAddress.city;
    const zip = req.body.zip || defaultAddress.postal_code;
    const state = req.body.state || defaultAddress.state;
    const country = req.body.country || defaultAddress.country;

    // Check if customer already exists
    let customer;
    try {
      const customers = await WI_STRIPE.customers.list({
        email: req.body.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];

        // Update customer information if they already exist
        customer = await WI_STRIPE.customers.update(customer.id, {
          name: firstName,
          address: {
            line1: address,
            city: city,
            postal_code: zip,
            state: state,
            country: country,
          },
        });
      } else {
        // Create new customer if not found
        customer = await WI_STRIPE.customers.create({
          name: firstName,
          email: email,
          address: {
            line1: address,
            city: city,
            postal_code: zip,
            state: state,
            country: country,
          },
        });
      }
    } catch (error) {
      console.error(`Error managing customer: ${error.message}`);
      return next(
        new AppError(
          'Payment processing failed. Please try again later or contact the service provider for assistance.',
          500,
        ),
      );
    }

    // Create ephemeral key with the same Stripe instance that created the customer
    let ephemeralKey;
    try {
      ephemeralKey = await WI_STRIPE.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2022-08-01' },
      );
    } catch (error) {
      console.error(`Error creating ephemeral key: ${error.message}`);
      return next(
        new AppError(
          'Payment processing failed. Please try again later or contact the service provider for assistance.',
          500,
        ),
      );
    }

    // Create payment intent with the same Stripe instance that created the customer
    let paymentIntent;
    try {
      // CRITICAL FIX: Use WI_STRIPE instead of WIZ_PUB
      paymentIntent = await WI_STRIPE.paymentIntents.create({
        amount: Math.round(parseFloat(req.body.amount) * 100), // Use Math.round for better precision
        currency: req.body.currencyCode,
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        description: `Payment for Client ${req.body.email}`,
      });
    } catch (error) {
      console.error(`Error creating payment intent: ${error.message}`);
      return next(
        new AppError(
          'Payment processing failed. Please try again later or contact the service provider for assistance.',
          500,
        ),
      );
    }

    res.status(200).json({
      success: true,
      paymentIntent,
      ephemeralKey: ephemeralKey.secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return next(
      new AppError(
        'Payment processing failed. Please try again later or contact the service provider for assistance.',
        500,
      ),
    );
  }
});

exports.createPaymentIntentWizPub = CatchAsync(async (req, res, next) => {
  try {
    // IP validation
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const geo = geoip.lookup(ip);
    const allowedCountries = ['US', 'CA', 'GB'];

    if (!geo || !allowedCountries.includes(geo.country)) {
      return next(new AppError('Location Blocked', 403));
    }

    // Set default values for address fields if not provided
    const defaultAddress = {
      line1: '175-61 Hillside Ave. # 202',
      city: 'Jamaica',
      postal_code: '11432',
      state: 'NY',
      country: 'US',
    };

    // Only validate essential fields
    const essentialFields = ['amount', 'currencyCode'];
    for (const field of essentialFields) {
      if (!req.body[field]) {
        return next(
          new AppError(
            'Something went wrong with your payment. Please try again later or contact support.',
            400,
          ),
        );
      }
    }

    // Use provided fields or defaults
    const firstName = req.body.firstName || 'Customer';
    const email = req.body.email || 'customer@wizpub.com';
    const address = req.body.address || defaultAddress.line1;
    const city = req.body.city || defaultAddress.city;
    const zip = req.body.zip || defaultAddress.postal_code;
    const state = req.body.state || defaultAddress.state;
    const country = req.body.country || defaultAddress.country;

    // Check if customer already exists
    let customer;
    try {
      const customers = await WIZ_PUB.customers.list({
        email: req.body.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];

        // Update customer information if they already exist
        customer = await WIZ_PUB.customers.update(customer.id, {
          name: firstName,
          email: email,
          address: {
            line1: address,
            city: city,
            postal_code: zip,
            state: state,
            country: country,
          },
        });
      } else {
        // Create new customer if not found
        customer = await WIZ_PUB.customers.create({
          name: firstName,
          email: email,
          address: {
            line1: address,
            city: city,
            postal_code: zip,
            state: state,
            country: country,
          },
        });
      }
    } catch (error) {
      return next(new AppError(`Error managing customer: ${error.message}`, 500));
    }

    // Create ephemeral key
    let ephemeralKey;
    try {
      ephemeralKey = await WIZ_PUB.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2022-08-01' },
      );
    } catch (error) {
      return next(new AppError(`Error creating ephemeral key: ${error.message}`, 500));
    }

    // Create payment intent
    let paymentIntent;
    try {
      paymentIntent = await WIZ_PUB.paymentIntents.create({
        amount: Math.round(parseFloat(req.body.amount) * 100), // Use Math.round for better precision
        currency: req.body.currencyCode,
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
        description: `Payment for Client ${req.body.email}`,
      });
    } catch (error) {
      return next(new AppError(`Error creating payment intent: ${error.message}`, 500));
    }

    res.status(200).json({
      success: true,
      paymentIntent,
      ephemeralKey: ephemeralKey.secret,
      customerId: customer.id,
    });
  } catch (error) {
    return next(new AppError(`Unexpected error: ${error.message}`, 500));
  }
});
