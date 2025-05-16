const nodemailer = require('nodemailer');
const appConfig = require('../config/index');

exports.sendEmail = async (mailOptions) => {
  const transporter = await nodemailer.createTransport({
    service: 'gmail',
    host: appConfig.EMAIL_HOST,
    secure: true,
    port: appConfig.EMAIL_PORT,
    auth: {
      user: appConfig.EMAIL_USERNAME,
      pass: appConfig.EMAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: appConfig.EMAIL_USERNAME,
    to: mailOptions.userEmail,
    subject: mailOptions.subject,
    text: mailOptions.message,
  });
};

exports.sendInvoiceEmail = async (options) => {
  // Create a transporter with the billing@inventixcrew.com credentials
  const transporter = nodemailer.createTransport({
    host: 'mail.inventixcrew.com',

    secure: true,
    auth: {
      user: 'billing@inventixcrew.com',
      pass: 'j#oh]VtPuE!W',
    },
  });

  // Define the email options
  const mailOptions = {
    from: `"Web Craft Pros" <billing@inventixcrew.com>`,
    to: options.email,
    subject: options.subject,
  };

  // Add either HTML or plain text content
  if (options.html) {
    mailOptions.html = options.html;
  } else if (options.message) {
    mailOptions.text = options.message;
  }

  // Add attachments if provided
  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  }

  // Send the email and return the result
  return await transporter.sendMail(mailOptions);
};
