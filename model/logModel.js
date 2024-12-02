

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String },
    entity: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entity' }, 
    description: { type: String },
    changes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
