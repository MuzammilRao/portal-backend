const nodemailer = require('nodemailer');
const config = require('../config');
const uuid = require('uuid');

exports.generateUniqueToken = () => {
  return uuid.v4();
};

exports.sendEmail = (mailOptions) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,

    auth: {
      user: 'info@webinventix.com',
      pass: 'ilbuaeenzblmfepb',
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email Sent Sucessfully!');
    }
  });
};
