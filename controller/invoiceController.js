// const puppeteer = require('puppeteer');
const Invoice = require('../model/invoiceModel');
const CatchAsync = require('../utils/CatchAsync');
const Client = require('../model/clientModel');
const Brand = require('../model/brandModel');
const path = require('path');
const sendInvoice = require('../utils/sendInvoice');
const AppError = require('../utils/appError');
const sendInvoiceWithRecipients = require('../utils/sendInvoiceWithRecipients');
// const hbs = require('handlebars');
const fs = require('fs-extra');
const differenceInDays = require('date-fns/differenceInDays');
const getMonth = require('date-fns/getMonth');
const Factory = require('./handleFactory');
const APIFeatures = require('../utils/APIFeatures');
const { logAction } = require('../utils/Logging');
const { LOG_ACTIONS, LOG_ENTITIES } = require('../constants');

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
exports.updateInvoice = Factory.updateOne(Invoice);
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
