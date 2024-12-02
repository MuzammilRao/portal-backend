const mongoose = require('mongoose');

const sumupSchema = new mongoose.Schema({
  amount: Number,
  checkout_reference: String,
  currency: String,
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  date: Date,
  description: String,
  id: String,
  mandate: {
    type: { type: String },
    status: String,
    merchant_code: String,
  },
  merchant_code: String,
  merchant_country: String,
  merchant_name: String,
  pay_to_email: String,
  payment_instrument: {
    token: String,
  },
  purpose: String,
  status: String,
  transaction_code: String,
  transaction_id: String,
  transactions: [
    {
      amount: Number,
      currency: String,
      entry_mode: String,
      id: String,
      installments_count: Number,
      internal_id: Number,
      merchant_code: String,
      payment_type: String,
      status: String,
      timestamp: Date,
      tip_amount: Number,
      transaction_code: String,
      vat_amount: Number,
    },
  ],
});

const payArcSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
});
const PaypalSchema = new mongoose.Schema({
  data: mongoose.Schema.Types.Mixed,
});

const testSchema = new mongoose.Schema({
  card_source: {
    type: String,
  },
  card_number: {
    type: String,
  },
  card_holder_name: {
    type: String,
  },
  exp_month: {
    type: Number,
  },
  exp_year: {
    type: Number,
  },
  cvv: {
    type: String,
  },
  address_line1: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
  country_code: {
    type: String,
  },
  country: {
    type: String,
  },
});

const SumupTransaction = mongoose.model('SumupTransaction', sumupSchema);
const PayArcTransaction = mongoose.model('PayArcTransaction', payArcSchema);
const PaypalTransaction = mongoose.model('PaypalFinitiveTransaction', PaypalSchema);
const TestService = mongoose.model('testService', testSchema);

module.exports = {
  SumupTransaction,
  PayArcTransaction,
  TestService,
  PaypalTransaction
};
