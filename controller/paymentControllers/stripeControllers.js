const { config } = require('../../config');
const geoip = require('geoip-lite');
const WI_STRIPE = require('stripe')(config.WEB_INVENTIX_STRIPE_SECRET_KEY);
const WIZ_PUB = require('stripe')(config.WIZ_PUB_STRIPE_SECRET_KEY);

const AppError = require('../../utils/appError');
const CatchAsync = require('../../utils/CatchAsync');

exports.createPaymentIntentWI = CatchAsync(async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  console.log('---IP', req.ip);
  // Lookup IP location
  const geo = geoip.lookup(ip);
  console.log(`Geo Info for IP (${ip}):`, geo);

  // Define allowed countries
  const allowedCountries = ['US', 'CA', 'GB']; // ISO country codes for US, Canada, and UK

  if (!geo || !allowedCountries.includes(geo.country)) {
    return next(new AppError('Location Blocked', 403)); // Use 403 Forbidden for blocked location
  }

  const customer = await WI_STRIPE.customers.create({
    // name: `${req.body.firstName} ${req.body.lastName}`,
    name: `${req.body.firstName}`,
    email: req.body.email,
    address: {
      line1: req.body.address,
      city: req.body.city,
      postal_code: req.body.zip,
      state: req.body.state,
      country: req.body.country,
    },
  });

  const ephemeralKey = await WI_STRIPE.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2022-08-01' },
  );
  console.log('default', Math.imul(req.body.amount, 100));
  const paymentIntent = await WI_STRIPE.paymentIntents.create({
    amount: Math.imul(req.body.amount, 100),
    currency: 'usd',
    customer: customer.id,
    automatic_payment_methods: { enabled: true },
  });

  if (!paymentIntent || !customer || !ephemeralKey) {
    return next(new AppError('Error while creating payment', 500));
  }

  // Return the secret
  res.status(200).json({
    paymentIntent,
    ephemeralKey: ephemeralKey.secret,
    customerId: customer.id,
  });
});

exports.createPaymentIntentWizPub = CatchAsync(async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  console.log('---IP', req.ip);
  // Lookup IP location
  const geo = geoip.lookup(ip);
  console.log(`Geo Info for IP (${ip}):`, geo);

  // Define allowed countries
  const allowedCountries = ['US', 'CA', 'GB']; // ISO country codes for US, Canada, and UK

  if (!geo || !allowedCountries.includes(geo.country)) {
    return next(new AppError('Location Blocked', 403)); // Use 403 Forbidden for blocked location
  }

  const customer = await WIZ_PUB.customers.create({
    // name: `${req.body.firstName} ${req.body.lastName}`,
    name: `${req.body.firstName}`,
    email: req.body.email,
    address: {
      line1: req.body.address,
      city: req.body.city,
      postal_code: req.body.zip,
      state: req.body.state,
      country: req.body.country,
    },
  });

  const ephemeralKey = await WIZ_PUB.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2022-08-01' },
  );
  console.log('default', Math.imul(req.body.amount, 100));
  const paymentIntent = await WIZ_PUB.paymentIntents.create({
    amount: Math.imul(req.body.amount, 100),
    currency: 'usd',
    customer: customer.id,
    automatic_payment_methods: { enabled: true },
  });

  if (!paymentIntent || !customer || !ephemeralKey) {
    return next(new AppError('Error while creating payment', 500));
  }

  // Return the secret
  res.status(200).json({
    paymentIntent,
    ephemeralKey: ephemeralKey.secret,
    customerId: customer.id,
  });
});
