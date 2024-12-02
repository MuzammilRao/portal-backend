const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minlength: [3, 'First Name must be atleast three character long'],
      required: [true, 'The client must have a First Name'],
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    businessName: {
      type: String,
      trim: true,
      // required: [true, 'The Client must have a Business Name'],
    },
    clientEmail: {
      type: String,
      lowercase: true,
      sparse: true,
      index: true,
      trim: true,
    },
    additionalEmails: [String],
    website: {
      type: String,
      trim: true,
      default: '',
    },
    phone: String,
    country: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand is Required'],
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      // required: [true, 'Merchant  is Required'],
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    city: String,
    state: String,
    zip: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },

    invoice: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Client', clientSchema);
