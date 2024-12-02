const { config } = require('dotenv');
const nodemailer = require('nodemailer');
// const { env } = require("process");

const sendInvoice = (email, filename, recipients) => {
  // create reusable transporter object using the default SMTP transport
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
    cc: recipients,
    subject: 'Invoice - Inviz',
    text: `Invoice`,
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
      //   return res.status(400).json({ message: "Error!" });
      console.log(error);
    } else {
      console.log('Email Sent Sucessfully!');
      // alert("Email Sent Sucessfully!");
      // res.render('invoice-template')
    }
    // return res.status(200).json({ message: "Email Sent Sucessfully!" });
  });
};

module.exports = sendInvoice;
