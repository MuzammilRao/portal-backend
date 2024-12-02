const mongoose = require('mongoose');
const validator = require('validator');

const InvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      // validate: [
      //   {
      //     validator: function (value) {
      //       return value.endsWith('@inviztechnologies.net');
      //     },
      //     message: 'Invalid Email',
      //   },
      // ],
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: String,
      default: Date.now() + 60 * 60 * 1000,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Invitation', InvitationSchema);
