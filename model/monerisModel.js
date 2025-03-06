const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    amount: {
      type: String,
      //   required: true,
    },
    pan: {
      type: String,
      //   required: true,
    },
    expiry_date: {
      type: String,
      //   required: true,
    },
    cvc: { type: String },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
    },
    company_name: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    province: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    country: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    country_code: {
      type: String,
    },
    store_name: {
      type: String,
    },
    response: {
      CardType: {
        type: String,
        default: null,
      },
      TransAmount: {
        type: String,
        default: null,
      },
      TxnNumber: {
        type: String,
        default: null,
      },
      ReceiptId: {
        type: String,
        default: null,
      },
      TransType: {
        type: String,
        default: null,
      },
      ReferenceNum: {
        type: String,
        default: null,
      },
      ResponseCode: {
        type: String,
        default: null,
      },
      ISO: {
        type: String,
        default: null,
      },
      Message: {
        type: String,
        default: null,
      },
      IsVisaDebit: {
        type: String,
        default: null,
      },
      AuthCode: {
        type: String,
        default: null,
      },
      Complete: {
        type: Boolean,
        default: false,
      },
      TransDate: {
        type: String,
        default: null,
      },
      TransTime: {
        type: String,
        default: null,
      },
      Ticket: {
        type: String,
        default: null,
      },
      TimedOut: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Moneris', paymentSchema);
