const express = require('express');

// const paymentController = require('../controller/paymentController');
const stripeController = require('../controller/paymentControllers/stripeControllers');
const monerisController = require('../controller/paymentControllers/monerisController');

const router = express.Router();

router.route('/wi-stripe/create-payment').post(stripeController.createPaymentIntentWI);

router.route('/wp-moneris/create-payment').post(monerisController.processPayment);

// router.route('/paypal/finitive/pay').get(paymentController.payPaymentPaypalFinitive);
// router.route('/paypal/finitive/success').get(paymentController.successPaymentPaypalFinitive);

// router.route('/paypal/axolot/pay').get(paymentController.payPaymentPaypalAxolot);
// router.route('/paypal/axolot/success').get(paymentController.successPaymentPaypalAxolot);

// router.route('/payarc/create-charge').post(paymentController.createPayArcCharge);

// router.route('/sumup/create-customer').post(paymentController.createSumupCustomer);
// router.route('/sumup/create-checkout').post(paymentController.createSumupCheckout);
// router.route('/sumup/save-transaction').post(paymentController.saveSumupTransaction);

module.exports = router;
