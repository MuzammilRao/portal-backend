const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
