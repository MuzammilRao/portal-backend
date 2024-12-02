const mongoose = require('mongoose');

const merchantsSchema = new mongoose.Schema({
  name: String,
});

module.exports = mongoose.model('Merchant', merchantsSchema);
