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
