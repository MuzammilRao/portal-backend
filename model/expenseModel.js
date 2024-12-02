const mongoose = require('mongoose');

/**
 * Expense Category Schema
 */
const ExpenseCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

/**
 * Expense Schema
 */
const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String },
    amount: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    month: { type: Number },
    year: { type: Number },
  },
  { timestamps: true },
);

/**
 * Opening Balance Schema
 */
const OpeningBalanceSchema = new mongoose.Schema(
  {
    totalOpeningBalance: { type: Number, required: true, default: 0 },
    history: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// Check and reuse models to avoid OverwriteModelError
const ExpenseCategory =
  mongoose.models.ExpenseCategory || mongoose.model('ExpenseCategory', ExpenseCategorySchema);
const Expense = mongoose.models.Expense || mongoose.model('Expenses', ExpenseSchema);
const OpeningBalance =
  mongoose.models.OpeningBalance || mongoose.model('OpeningBalance', OpeningBalanceSchema);

module.exports = {
  ExpenseCategory,
  Expense,
  OpeningBalance,
};
