const Factory = require('./handleFactory');
const { Achieved, Expense, Chargeback, Refund, Budget, Target } = require('../model/MonetaryModel');
const CatchAsync = require('../utils/CatchAsync');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');
const APIFeatures = require('../utils/APIFeatures');

exports.getMe = CatchAsync(async (req, res, next) => {
  const query = User.findById(req.user._id).populate('leads');
  const features = new APIFeatures(query, req.query).limitFields();

  const user = await features.query;

  res.status(200).json({ status: 'success', user });
});

exports.modifyPassword = CatchAsync(async (req, res, next) => {
  const { oldPassword, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new AppError('Passwords donot match'));
  }
  const user = await User.findById(req.user._id);

  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match) {
    return next(new AppError('Incorrect password'));
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const updateUser = await User.findByIdAndUpdate(req.user._id, { password: hash });
  if (!updateUser) {
    return next(new AppError('Error modifying password'));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Password Changed Successfully',
  });
});

exports.getBudgets = Factory.getAllCustomSorted(Budget, { user: 'user._id' }, '-year,-month');
exports.getTarget = Factory.getAllCustomSorted(Target, { user: 'user._id' }, '-year,-month');

exports.createTargetAcheived = Factory.createOne(Achieved);
exports.getTargetAcheived = Factory.getAllCustomSorted(
  Achieved,
  { user: 'user._id' },
  '-year,-month',
);
exports.updateTargetAcheived = Factory.updateOne(Achieved);

exports.createExpense = Factory.createOne(Expense);
exports.getExpenses = Factory.getAllCustomSorted(Expense, { user: 'user._id' }, '-year,-month');
exports.updateExpenses = Factory.updateOne(Expense);

exports.createChargeBack = Factory.createOne(Chargeback);
exports.getChargeBacks = Factory.getAllCustomSorted(
  Chargeback,
  { user: 'user._id' },
  '-year,-month',
);
exports.updateChargeBacks = Factory.updateOne(Chargeback);

exports.createRefund = Factory.createOne(Refund);
exports.getRefunds = Factory.getAllCustomSorted(Refund, { user: 'user._id' }, '-year,-month');
exports.updateRefunds = Factory.updateOne(Refund);

exports.getUserMerchants = CatchAsync(async (req, res, next) => {
  const merchants = await User.findById(req.user._id).select('merchants').populate('merchants');

  return res.status(200).json({
    status: 'success',
    data: merchants,
  });
});
