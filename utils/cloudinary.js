const cloudinary = require('cloudinary').v2;
const { config } = require('../config');

cloudinary.config({
  // cloud_name: config.CLOUD_NAME,
  // api_key: config.API_KEY,
  // api_secret: config.API_SECRET,
  cloud_name: 'dautl8x6a',
  api_key: 846946648111537,
  api_secret: '90OPKl5XiI125ABF4hgMZAcIjJQ',
  secure: true,
});

module.exports = cloudinary;
