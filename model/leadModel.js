const mongoose = require('mongoose');
const validator = require('validator');

const leadSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'A lead must have a name'],
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, 'A lead must have an email'],
    validate: [validator.isEmail, 'Invalid Email! Please enter a valid email'],
  },
  address: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: [true, 'A lead must have a phone number'],
    minLength: [7, 'Minimum number length should be of 7 digits'],
    maxLength: [15, "Number can't be greater than 15 digits"],
  },
  service: {
    type: String,
    // required: [true, 'A lead must have a service'],
    default: '',
  },
  leadType: {
    type: String,
    default: '',
  },
  leadCost: {
    type: Number,
    default: null,
  },
  leadDate: {
    type: Date,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedAt: {
    type: Date,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
  },
  status: {
    type: String,
    enum: [
      'assigned',
      'un-assigned',
      'hot-lead',
      'nurchering',
      'prospectering',
      'closed',
      'dead',
      'dnc/dhu',
    ],
    default: 'un-assigned',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  assignmentHistory: [
    {
      leadDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leads',
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      assignedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
      },
    },
  ],
});
// // Apply the virtual to the schema
// leadSchema.set('toObject', { virtuals: true });
// leadSchema.set('toJSON', { virtuals: true });

// Pre-update middleware for findByIdAndUpdate
leadSchema.pre('save', async function (next) {
  if (!this.isModified('assignedTo') || !this.assignedTo) return next();
  const _assignmentHistory = {
    leadDetails: this._id,
    assignedTo: this.assignedTo,
    assignedAt: this.assignedAt || Date.now(),
    status: this.status,
  };
  this.assignmentHistory.push(_assignmentHistory);
});

// PRE QUERY MIDDLEWARE
leadSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'brand assignedTo',
    select: 'name',
  });
  next();
});

module.exports = mongoose.model('Leads', leadSchema);

// assignmentHistory.leadDetails assignmentHistory.assignedTo
