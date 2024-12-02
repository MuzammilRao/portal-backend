const Lead = require('../model/leadModel');
const APIFeatures = require('../utils/APIFeatures');
const CatchAsync = require('../utils/CatchAsync');
const Factory = require('./handleFactory');

exports.getUserLeads = CatchAsync(async (req, res, next) => {
  let query = Lead.find({ assignedTo: req.user._id });

  const features = new APIFeatures(query, req.query, [
    ['email', 'clientName', 'leadType', 'status'],
  ])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const doc = await features.query;

  return res.status(200).json({
    status: 'success',
    results: doc.length,
    data: doc,
  });
});

exports.createLead = Factory.createOne(Lead);
exports.getAllLeads = Factory.getAll(Lead, { isDeleted: false }, [
  'email',
  'clientName',
  'leadType',
  'status',
]);
exports.getLead = Factory.getOne(Lead, 'assignmentHistory.assignedTo');
exports.updateLead = Factory.updateOneWithSave(Lead);
exports.deleteLead = Factory.softDelete(Lead);
