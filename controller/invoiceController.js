// const puppeteer = require('puppeteer');
const Invoice = require('../model/invoiceModel');
const CatchAsync = require('../utils/CatchAsync');
const Client = require('../model/clientModel');
const Brand = require('../model/brandModel');
const path = require('path');

const AppError = require('../utils/appError');

// const hbs = require('handlebars');
const fs = require('fs-extra');

const Factory = require('./handleFactory');
const APIFeatures = require('../utils/APIFeatures');
const { logAction } = require('../utils/Logging');
const { LOG_ACTIONS, LOG_ENTITIES } = require('../constants');
const { sendInvoiceEmail } = require('../services/email');

const getOnboardedEmailTemplate = (clientName, invoiceLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Onboard</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      padding: 20px;
      background-color: #f8f9fa;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #0056b3;
      color: white;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: white;
      border-radius: 0 0 5px 5px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      color: #666;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0056b3;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .highlight {
      color: #0056b3;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome Onboard!</h1>
    </div>
    <div class="content">
      <p>Dear ${clientName},</p>
      
      <p>Thank you for your order – we're excited to have you on board! Your assigned project manager will be in touch with you shortly.</p>
      
      <p>In the meantime, please complete the Website Brief Questionnaire using the link below. Based on your responses, we'll create and share a mock-up design of your website within 24–48 hours.</p>
      
      <p style="text-align: center;">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLScAL0fPPACuaiDdCZ2VEx_5LaqJEye1GaTIBY-H9MqDfFKdDA/viewform" class="button">Complete Website Brief</a>
      </p>
      
      <p>Your invoice for the payment received is available below for your records:</p>
      
      <p style="text-align: center;">
        <a href="${invoiceLink}" class="button">View Invoice</a>
      </p>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>
      <span class="highlight">Project Management Team</span><br>
      Web Craft Pros</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Web Craft Pros. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const getRecurringEmailTemplate = (clientName, invoiceLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Payment</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      padding: 20px;
      background-color: #f8f9fa;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #28a745;
      color: white;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: white;
      border-radius: 0 0 5px 5px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      color: #666;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .highlight {
      color: #28a745;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You!</h1>
    </div>
    <div class="content">
      <p>Dear ${clientName},</p>
      
      <p>Thank you for your continued business! We've received your payment and appreciate your trust in our services.</p>
      
      <p>Your invoice is available below for your records:</p>
      
      <p style="text-align: center;">
        <a href="${invoiceLink}" class="button">View Invoice</a>
      </p>
      
      <p>If you have any questions about your invoice or our services, please don't hesitate to reach out to your account manager.</p>
      
      <p>We look forward to continuing our partnership!</p>
      
      <p>Best regards,<br>
      <span class="highlight">Web Craft Pros Team</span></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Web Craft Pros. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

exports.create = CatchAsync(async (req, res, next) => {
  const createdInvoice = await Invoice.create({
    ...req.body,
    user: req.user._id,
  });

  const client = await Client.findById(createdInvoice.client);
  client.invoice.push(createdInvoice._id);
  await client.save();

  const brand = await Brand.findById(req.body.brand);
  brand.invoiceNumber = brand.invoiceNumber + 1;
  await brand.save();

  // Log the invoice creation action
  await logAction(
    req.user._id,
    LOG_ACTIONS.CREATE,
    LOG_ENTITIES.INVOICE,
    createdInvoice._id,
    req.body,
  );

  return res.status(201).json({
    status: 'success',
    message: 'Invoice Created Successfully!',
    data: createdInvoice,
  });
});

exports.getAllInvoices = CatchAsync(async (req, res, next) => {
  let query = Invoice.find({ user: req.user._id, isDeleted: false });

  let search = ['brandName', 'clientName', 'clientEmail', 'invoiceNumber', 'status'];
  const features = new APIFeatures(query, req.query, search)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await features.query;
  total = await Invoice.count({ isDeleted: false, user: req.user._id });

  await logAction(req.user._id, LOG_ACTIONS.READ, LOG_ENTITIES.INVOICE, null);

  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    total: total,
    results: doc.length,
    data: doc,
  });
});

exports.getInvoice = Factory.getOne(Invoice);

// exports.updateInvoice = Factory.updateOne(Invoice);

exports.deleteInvoice = Factory.softDelete(Invoice);

exports.sendInvoiceThroughEmail = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = await Invoice.findById(id).lean();

  const compile = async function (templateName, data) {
    try {
      const filePath = path.join(__dirname, '../views/', `${templateName}.hbs`);
      const html = await fs.readFile(filePath, 'utf8');
      return hbs.compile(html)(data);
    } catch (error) {
      console.log(error);
    }
  };

  hbs.registerHelper('multiplyFunction', function (thing1, thing2) {
    return +thing1 * +thing2;
  });

  // const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const content = await compile('invoice-template', data);
  await page.setContent(content);
  await page.pdf({
    path: 'projectInvoice.pdf',
    format: 'A4',
    printBackground: true,
  });

  // sendInvoice(clientEmail, 'projectInvoice.pdf');

  await browser.close();

  return res.json({
    status: 200,
    message: 'Invoice Successfully Sent to Email',
  });
});

exports.updateInvoice = CatchAsync(async (req, res, next) => {
  // Find the original document before updating
  const originalDoc = await Invoice.findById(req.params.id).lean();

  if (!originalDoc) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  // Check if status is being updated to "paid"
  const isBeingPaid = req.body.status === 'paid' && originalDoc.status !== 'paid';

  // Update the invoice
  const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('client');

  // Log the changes if user is present
  if (!!req.user) {
    const changes = {};

    Object.keys(req.body).forEach((key) => {
      const originalValue = originalDoc[key];
      const newValue = req.body[key];

      if (
        key === '_id' ||
        key === 'createdAt' ||
        key === 'updatedAt' ||
        _.isEqual(originalValue, newValue) ||
        (Array.isArray(newValue) && newValue.length === 0 && originalValue === undefined) ||
        (newValue === '' && originalValue === undefined) ||
        (typeof newValue === 'object' && newValue?._id)
      ) {
        return;
      }

      // Capture only actual changes
      changes[key] = {
        from: originalValue,
        to: newValue,
      };
    });

    if (Object.keys(changes).length > 0) {
      await logAction(req.user._id, LOG_ACTIONS.UPDATE, 'Invoice', updatedInvoice._id, changes);
    }
  }

  // Handle email sending if invoice is being paid
  if (isBeingPaid) {
    try {
      const template = updatedInvoice.template || 'none';
      const clientName = updatedInvoice.client
        ? `${updatedInvoice.client.firstName} ${updatedInvoice.client.lastName}`
        : 'Client';
      const clientEmail = updatedInvoice.client
        ? updatedInvoice.client.clientEmail
        : updatedInvoice.clientEmail;
      const invoiceLink = `https://billing.inventixcrew.com/invoice/payment-link/${updatedInvoice._id}`;

      if (template === 'Onboarded') {
        // Send onboarding email template with HTML
        await sendInvoiceEmail({
          email: clientEmail,
          subject: 'Welcome Onboard & Invoice Receipt',
          html: getOnboardedEmailTemplate(clientName, invoiceLink),
        });
        console.log(clientEmail);
        console.log(clientName);
        console.log(invoiceLink);

        console.log('Onboarding email sent successfully');
      } else if (template === 'Recurring') {
        await sendInvoiceEmail({
          email: clientEmail,
          subject: 'Thank You for Your Payment',
          html: getRecurringEmailTemplate(clientName, invoiceLink),
        });

        console.log('Recurring client email sent successfully');
      } else {
        // No email for 'none' template
        console.log('No email template selected, skipping email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // We don't want to fail the update if email sending fails
    }
  }

  return res.status(200).json({
    status: 'success',
    data: updatedInvoice,
  });
});
