const mongoose = require('mongoose');

const businessSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    businessName: {
      type: String,
      required: [true, 'A users must have a Business Name'],
    },
    businessPhone: {
      type: Number,
      minlength: [10, 'Phone should be atleast 10 character long.'],
    },
    mobilePhone: {
      type: Number,
      minlength: [10, 'Mobile Number should be atleast 10 character long.'],
    },
    country: String,
    address: String,
    address2: String,
    city: String,
    state: String,
    zipCode: Number,
    invoiceNumber: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Business', businessSchema);
