const nodemailer = require('nodemailer');
const { config } = require('../config');

const sendEmail = (email, verificationLink) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,

    auth: {
      user: 'invoiceapp0@gmail.com',
      pass: 'juqkiexfrrjuaawf',
    },
  });

  const mailOptions = {
    from: config.EMAIL,
    to: email,
    subject: 'Verification Email - Torrel Invoice App',
    text: `Email verification Link\n${verificationLink}`,
    message: verificationLink,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email Sent Sucessfully!');
    }
  });
};

module.exports = sendEmail;
