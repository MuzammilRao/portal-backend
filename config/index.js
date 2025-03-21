const dotenv = require('dotenv');

dotenv.config({ path: '../config.env' });

exports.config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  MONGO_URI: process.env.MONGO_URI,
  LOCAL_MONGO_URI: process.env.LOCAL_MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL,
  BACKEND_URL: process.env.BACKEND_URL,
  SECRET: process.env.SECRET,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_KEY,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  WEB_INVENTIX_STRIPE_SECRET_KEY: process.env.WEB_INVENTIX_STRIPE_SECRET_KEY,
  WIZ_PUB_STRIPE_SECRET_KEY: process.env.WIZ_PUB_STRIPE_SECRET_KEY,

  PAYPAL_CLIENT_ID_FINITIVE: process.env.PAYPAL_CLIENT_ID_FINITIVE,
  PAYPAL_CLIENT_SECRET_FINITIVE: process.env.PAYPAL_CLIENT_SECRET_FINITIVE,
  PAYPAL_CLIENT_ID_AXOLOT: process.env.PAYPAL_CLIENT_ID_AXOLOT,
  PAYPAL_CLIENT_SECRET_AXOLOT: process.env.PAYPAL_CLIENT_SECRET_AXOLOT,
  PAYPAL_MODE: process.env.PAYPAL_MODE,
  PAYARC_ACCESS_TOKEN: process.env.PAYARC_ACCESS_TOKEN,
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 465,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME || 'invoiceapp0@gmail.com',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'juqkiexfrrjuaawf',
};
