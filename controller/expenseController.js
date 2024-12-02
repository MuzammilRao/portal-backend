const { Expense, ExpenseCategory, OpeningBalance } = require('../model/expenseModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/CatchAsync');
const Factory = require('./handleFactory');

/**
 * Add a new category
 */
exports.addCategory = CatchAsync(async (req, res, next) => {
  req.body.createdBy = req.user._id;
  const { name } = req.body;

  const categoryExists = await ExpenseCategory.findOne({ name });
  if (categoryExists) {
    return next(new AppError('Category already exists', 400));
  }

  const category = await ExpenseCategory.create({ ...req.body });

  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
});

/**
 * Get all categories
 */
exports.getCategories = CatchAsync(async (req, res, next) => {
  const categories = await ExpenseCategory.find();

  res.status(200).json({
    status: 'success',
    data: {
      categories,
    },
  });
});

/**
 * Add a new expense
 */
exports.addExpense = CatchAsync(async (req, res, next) => {
  req.body.createdBy = req.user._id;
  const { title, amount, category } = req.body;

  const categoryExists = await ExpenseCategory.findById(category);
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  // console.log(req.body);

  const expense = await Expense.create({ ...req.body });

  res.status(201).json({
    status: 'success',
    data: {
      expense,
    },
  });
});

/**
 * Get all expenses
 */
exports.getExpenses = CatchAsync(async (req, res, next) => {
  const expenses = await Expense.find().populate('category').sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      expenses,
    },
  });
});

exports.updateExpense = Factory.updateOne(Expense);
/**
 * Set or Update Opening Balance
 */
exports.setOpeningBalance = CatchAsync(async (req, res, next) => {
  req.body.createdBy = req.user._id;
  const { amount } = req.body;
  let _amount = parseFloat(amount);

  let balance = await OpeningBalance.findOne();

  if (!balance) {
    balance = await OpeningBalance.create({
      totalOpeningBalance: _amount,
      history: [{ amount: _amount }],
      createdBy: req.user._id,
    });
  } else {
    balance.totalOpeningBalance += _amount;
    balance.history.push({ amount: _amount });
    await balance.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      balance,
    },
  });
});

/**
 * Get Current Opening Balance and History
 */
exports.getOpeningBalance = CatchAsync(async (req, res, next) => {
  let balance = await OpeningBalance.findOne();

  // Return a default balance if not found
  if (!balance) {
    balance = {
      totalOpeningBalance: 0,
      history: [],
    };
  }

  res.status(200).json({
    status: 'success',
    data: balance,
  });
});

/**
 * Get Current Balance After Expenses
 */
exports.getAllReports = CatchAsync(async (req, res, next) => {
  let balance = await OpeningBalance.findOne();
  // console.log(balance);

  if (!balance) {
    balance = {
      totalOpeningBalance: 0,
    };
  }

  const expenses = await Expense.find();
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const remainingAmount = balance.totalOpeningBalance - totalExpenses;
  const totalOpeningBalance = balance.totalOpeningBalance;
  const openingBalanceHistory = balance.history;

  res.status(200).json({
    status: 'success',
    data: {
      remainingAmount,
      totalExpenses,
      totalOpeningBalance,
      openingBalanceHistory,
    },
  });
});
