const mongoose = require('mongoose');

const BUSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BusinessUnit', BUSchema);
