const Client = require('../model/clientModel');
const Invoice = require('../model/invoiceModel');
const CatchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handleFactory');
const APIFeatures = require('../utils/APIFeatures');
const { logAction } = require('../utils/Logging');
const { LOG_ACTIONS, LOG_ENTITIES } = require('../constants');

// Done
exports.createClients = CatchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const doc = await Client.create(req.body);

  await logAction(req.user._id, LOG_ACTIONS.CREATE, LOG_ENTITIES.CLIENT, doc._id);

  return res.status(201).json({
    status: 'success',
    data: doc,
  });
});

// Done
exports.getAllClients = CatchAsync(async (req, res, next) => {
  let query = Client.find({ user: req.user._id, isDeleted: false });

  let populations = ['user', 'name pseudo email', 'brand', null];

  populations.forEach((populate, index) => {
    if (index % 2 === 0) {
      const populateRef = populate;
      const poplateFields = populations[index + 1];
      query = query.populate(populateRef, poplateFields);
    }
  });

  let search = [];
  const features = new APIFeatures(query, req.query, search)
    .filter()
    .sort()
    .limitFields();

  const doc = await features.query;

  total = await Client.count({ isDeleted: false, user: req.user._id });

  await logAction(req.user._id, LOG_ACTIONS.READ, LOG_ENTITIES.CLIENT, null);

  // SEND RESPONSE
  return res.status(200).json({
    status: 'success',
    total: total,
    results: doc.length,
    data: doc,
  });
});

// Done
exports.getSingleClients = Factory.getOne(
  Client,
  'user',
  'name pseudo email',
  'brand',
  null,
  'merchant',
  'name',
  'invoice',
);

// Done
exports.updateClients = (req, res, next) => {
  let user = req.user;
  return Factory.updateOne(Client)(req, res, next, user);
};

// Done
exports.deleteClients = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const client = await Client.findById(id);

  if (!client) {
    return next(new AppError('Invalid Id!', 404));
  }

  // Soft delete invoices by setting `isDeleted` to true
  await Invoice.updateMany({ _id: { $in: client.invoice } }, { isDeleted: true });

  // Soft delete the client by setting `isDeleted` to true
  const updatedClient = await Client.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  // Log the soft delete action for both client and invoices
  await logAction(req.user._id, LOG_ACTIONS.DELETE, LOG_ENTITIES.CLIENT, updatedClient._id, {
    isDeleted: { from: false, to: true },
  });

  return res.status(200).json({
    status: 'Success',
    message: 'Client and associated invoices marked as deleted successfully!',
  });
});
