const mongoose = require('mongoose');
const validator = require('validator');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is Required'],
    },
    email: {
      type: String,
      required: [true, 'Email is Required'],
      lowercase: true,
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: Number, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    textColorPrimary: { type: String, default: '#141414' },
    textColorSecondary: { type: String, default: '#222423' },
    invoiceBgColor: { type: String, default: '#ffffff' },
    termsAndConditions: { type: String },
    invoicePrefix: String,
    invoiceNumber: Number,
    letterHead: {
      type: String,
      default: 'https://www.printlipi.com/images/a4-letterhead.gif',
    },
    logo: {
      type: String,
      default:
        'https://st3.depositphotos.com/23594922/31822/v/450/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Brand', brandSchema);
