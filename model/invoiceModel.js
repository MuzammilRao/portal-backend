const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    logo: { type: String },
    title: { type: String },
    name: { type: String },
    brandName: { type: String },
    brandAddress: { type: String },
    brandCity: { type: String },
    brandState: { type: String },
    brandZip: { type: String },
    brandCountry: { type: String },
    clientBusinessName: { type: String },
    clientName: { type: String },
    clientAddress: { type: String },
    clientCity: { type: String },
    clientZip: { type: String },
    clientCountry: { type: String },
    clientEmail: { type: String },
    invoiceTitle: { type: String },
    invoiceNumber: { type: String },
    invoiceDate: { type: String },
    invoiceDueDate: { type: String },
    productLines: [
      {
        description: { type: String },
        quantity: { type: String },
        rate: { type: String },
      },
    ],
    taxPercent: { type: String },
    taxAmount: { type: Number },
    subTotal: { type: Number },
    totalDue: {
      type: Number,
      get: (value) => value.toFixed(2),
      set: (value) => parseFloat(value.toFixed(2)),
    },
    currency: { type: String },
    notes: { type: String },
    terms: { type: String },
    status: { type: String, default: 'unpaid', enum: ['unpaid', 'paid'] },
    merchant: { type: String, required: [true, 'Merchant  is Required'] },
    // merchant: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Merchant',
    //   required: [true, 'Merchant  is Required'],
    // },
    invoiceBgColor: { type: String },
    textColorPrimary: { type: String },
    textColorSecondary: { type: String },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Invoice', invoiceSchema);
