const nodemailer = require('nodemailer');
const { config } = require('../config');

const sendInvoice = (email, filename) => {
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
    subject: 'Invoice - Torrel Invoice App',
    text: `Mr Torrel Sent You this Email `,
    attachments: [
      {
        filename: filename,
        path: process.cwd() + `/${filename}`,
        cid: `/${filename}`,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(400).json({ message: 'Error!' });
    } else {
      console.log('Email Sent Sucessfully!');
    }
  });
};

module.exports = sendInvoice;
