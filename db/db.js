const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { config } = require('../config');
const { exit } = require('process');

const MONGO_URI = config.NODE_ENV === 'development' ? config.LOCAL_MONGO_URI : config.MONGO_URI;

exports.connectDB = () => {
  mongoose
    .connect(MONGO_URI)
    .then((e) => console.log(`Connected to database->: ${e.connections[0].host}`))
    .catch((err) => {
      console.error(`Error: ${err.message}`);
      console.error(`Error: Database not connected`);
      exit(1);
    });
};
