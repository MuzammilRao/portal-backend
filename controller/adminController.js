const CatchAsync = require('../utils/CatchAsync');

const AppError = require('../utils/appError');
const Factory = require('./handleFactory');
const bcrypt = require('bcrypt');

const BusinessUnit = require('../model/businessUnit');
const Brand = require('../model/brandModel');
const User = require('../model/userModel');
const Client = require('../model/clientModel');
const Invoice = require('../model/invoiceModel');
const Invitation = require('../model/invitationModel');
const { Target, Budget, Achieved, Chargeback, Expense, Refund } = require('../model/MonetaryModel');

const { generateUniqueToken, sendEmail } = require('../utils/helpers');
const { config } = require('../config');
const cloudinary = require('../utils/cloudinary');
const APIFeatures = require('../utils/APIFeatures');
const Merchants = require('../model/MerchantsModel');
const catchAsync = require('../utils/CatchAsync');
const { logAction } = require('../utils/Logging');
const { LOG_ACTIONS } = require('../constants');

exports.sendInvitation = CatchAsync(async (req, res, next) => {
  const { email } = req.body;
  const token = generateUniqueToken();

  const hashedToken = await bcrypt.hash(token, 10);
  const invitationExist = await Invitation.findOne({ email });
  if (invitationExist) {
    await Invitation.findOneAndUpdate(
      { email },
      { $set: { token: hashedToken, expiresAt: Date.now() + 60 * 60 * 1000 } },
      { new: true },
    );
  } else {
    await Invitation.create({
      email,
      token: hashedToken,
    });
  }
  console.log('Sending Mail');

  const signupLink = `${config.CLIENT_URL}/signup/${token}`;
  // const signupLink = `https://beta.secure-terminal.com/signup/${token}`;

  const mailOptions = {
    from: config.EMAIL,
    to: email,
    subject: 'Tecxeo Portal | Invitation',
    text: `${signupLink}`,
  };
  sendEmail(mailOptions);
  console.log('mail sent');

  return res.status(200).json({
    status: 'success',
    message: 'Email Sent',
  });
});
// Business Units
exports.createBusinessUnit = Factory.createOne(BusinessUnit);
exports.getBusinessUnits = Factory.getAll(BusinessUnit);

// Brands
exports.getBrands = Factory.getAll(Brand, {}, ['name']);
exports.getBrand = Factory.getOne(Brand);
exports.deleteBrand = Factory.softDelete(Brand);

exports.updateBrand = CatchAsync(async (req, res, next) => {
  let doc;
  if (!req.body.logo) {
    const { name, email, address } = req.body;
    doc = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, email, address },
      {
        new: true,
        runValidators: true,
      },
    );
  } else {
    const logo = req.body.logo;
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    const uploadRes = await cloudinary.uploader.upload(logo, options);
    imageUrl = uploadRes.url;
    doc = await Brand.findByIdAndUpdate(
      req.params.id,
      { ...req.body, logo: imageUrl },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.createBrand = CatchAsync(async (req, res, next) => {
  const {
    name,
    email,
    address,
    city,
    state,
    country,
    zip,
    textColorPrimary,
    textColorSecondary,
    invoiceBgColor,
    letterHead,
    logo,
    termsAndConditions,
  } = req.body;
  if (!name || !email || !address || !city || !state || !country || !zip || !logo) {
    return next(new AppError('All fields are required', 400));
  }

  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    upload_preset: 'inviz_brand_logos',
  };

  const uploadRes = await cloudinary.uploader.upload(logo, options);
  let logoUrl =
    uploadRes.url ??
    'https://st3.depositphotos.com/23594922/31822/v/450/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg';

  const uploadRes2 = await cloudinary.uploader.upload(letterHead, options);
  let letterHeadURL = uploadRes2.url ?? 'https://www.printlipi.com/images/a4-letterhead.gif';

  const data = await Brand.create({
    name,
    email,
    address,
    city,
    state,
    country,
    zip,
    textColorPrimary: textColorPrimary ? textColorPrimary : undefined,
    textColorSecondary: textColorSecondary ? textColorSecondary : undefined,
    invoiceBgColor: invoiceBgColor ? invoiceBgColor : undefined,
    logo: logoUrl,
    letterHead: letterHeadURL,
    termsAndConditions,
  });
  return res.status(201).json({
    status: 'success',
    data: data,
  });
});

exports.approveUser = CatchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User Not Found', 400));
  }
  const { role, businessUnit, brands, merchants } = req.body;
  // console.log(req.body);
  if (!businessUnit) {
    return next(new AppError('Business Unit Missing', 400));
  }
  if (!role) {
    return next(new AppError('Role Missing', 400));
  }
  const data = await User.findByIdAndUpdate(
    id,
    {
      active: true,
      role: role,
      businessUnit: businessUnit,
      brands: brands,
      merchants: merchants,
    },
    { new: true },
  );
  if (!data) {
    return next(new AppError('Error Approving User', 500));
  }

  return res.status(200).json({
    status: 'success',
    message: 'User approved',
  });
});

exports.getUsers = Factory.getAll(User, { isDeleted: false }, ['name', 'email', 'pseudo'], 'role');
exports.getUser = Factory.getOne(User);
exports.updateUser = Factory.updateOne(User);
exports.deleteUser = Factory.softDelete(User);

// Clients
// exports.createClient = Factory.createOne(Client);

// exports.createClient = CatchAsync(async (req, res, next) => {
//   const doc = await Client.create(req.body);

//   console.log(req.user._id, LOG_ACTIONS.CREATE, LOG_ENTITIES.CLIENT, doc._id);

//   await logAction(req.user._id, LOG_ACTIONS.CREATE, LOG_ENTITIES.CLIENT, doc._id);

//   return res.status(201).json({
//     status: 'success',
//     data: doc,
//   });
// });
exports.createClient = Factory.createOne(Client);

exports.getClients = Factory.getAll(
  Client,
  { isDeleted: false },
  [],
  'user',
  'name pseudo email',
  'brand',
  'name',
);
exports.getClient = Factory.getOne(
  Client,
  'user',
  'name pseudo email',
  'brand',
  null,
  'merchant',
  'name',
  'invoice',
);
exports.updateClient = async (req, res, next) => {
  console.log('inside update controller');
  return Factory.updateOne(Client)(req, res, next, req.user);
};
exports.deleteClient = Factory.softDelete(Client);

// Invoice

exports.createInvoice = CatchAsync(async (req, res, next) => {
  const createdInvoice = await Invoice.create({
    ...req.body,
    // user: req.user._id,
  });

  const client = await Client.findById({ _id: createdInvoice.client });

  client.invoice.push(createdInvoice._id);
  await client.save();

  const brand = await Brand.findById(req.body.brand);
  brand.invoiceNumber = brand.invoiceNumber + 1;
  await brand.save();

  return res.status(201).json({
    status: 'success',
    message: 'Invoice Created Successfully!',
    data: createdInvoice,
  });
});

// exports.getInvoices = Factory.getAll(
//   Invoice,
//   { isDeleted: false },
//   ['brandName', 'clientName', 'clientEmail', 'invoiceNumber', 'status'],
//   'user',
//   'email name ',
// );
exports.getInvoices = catchAsync(async (req, res, next) => {
  // Base filter - only non-deleted invoices
  const filter = { isDeleted: false };

  // Get user with role
  const user = await User.findById(req.user._id).populate('role');

  // Apply user filter if not admin
  if (
    user.role.name !== 'Admin' &&
    user.role.name !== 'super-admin' &&
    user.role.name !== 'sub-admin'
  ) {
    filter.user = req.user._id;
  }

  // Handle filters from query params
  if (req.query.filters && req.query.filters.status) {
    filter.status = req.query.filters.status;
  }
  // Alternative format support
  else if (req.query.status) {
    filter.status = req.query.status;
  }

  // Handle search parameter
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { invoiceNumber: searchRegex },
      { clientName: searchRegex },
      { clientEmail: searchRegex },
      { brandName: searchRegex },
    ];
  }

  // Debug: log the final filter
  console.log('Final MongoDB filter:', JSON.stringify(filter, null, 2));

  // Build and execute query
  const invoices = await Invoice.find(filter)
    .populate('user', 'email name')
    .populate({
      path: 'user',
      populate: { path: 'role', select: 'name' },
    })
    .select('brandName clientName clientEmail invoiceNumber status createdAt merchant totalDue')
    .sort(req.query.sort || '-createdAt')
    .skip((parseInt(req.query.page, 10) - 1 || 0) * (parseInt(req.query.limit, 10) || 50))
    .limit(parseInt(req.query.limit, 10) || 50);

  const total = await Invoice.countDocuments(filter);

  await logAction(req.user._id, LOG_ACTIONS.READ, 'Invoice', null);

  res.status(200).json({
    status: 'success',
    total,
    results: invoices.length,
    data: invoices,
  });
});
exports.getInvoice = Factory.getOne(Invoice);
exports.updateInvoice = Factory.updateOne(Invoice);
exports.deleteInvoice = Factory.softDelete(Invoice);

// Targets
exports.createTarget = Factory.createOne(Target);
exports.getTargets = Factory.getAllCustomSorted(Target, {}, '-year,-month', 'user', 'name');

exports.createBudget = Factory.createOne(Budget);
exports.getBudgets = Factory.getAllCustomSorted(Budget, {}, '-year,-month', 'user', 'name');

exports.getTargetAcheived = Factory.getAllCustomSorted(
  Achieved,
  {},
  '-year,-month',
  'user',
  'name',
);
exports.getExpenses = Factory.getAllCustomSorted(Expense, {}, '-year,-month', 'user', 'name');
exports.getChargeBacks = Factory.getAllCustomSorted(Chargeback, {}, '-year,-month', 'user', 'name');
exports.getRefunds = Factory.getAllCustomSorted(Refund, {}, '-year,-month', 'user', 'name');

exports.addMerchants = Factory.createOne(Merchants);
exports.getMerchants = Factory.getAll(Merchants);
