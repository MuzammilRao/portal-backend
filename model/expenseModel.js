const mongoose = require('mongoose');

/**
 * Expense Category Schema
 */
const ExpenseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
  },
  { timestamps: true },
);

/**
 * Expense Schema
 */
const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Expense amount cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      required: [true, 'Expense category is required'],
    },
    file: String,
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    month: {
      type: Number,
      required: [true, 'Expense month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Expense year is required'],
    },
  },
  { timestamps: true },
);

/**
 * Opening Balance Schema
 */
const OpeningBalanceSchema = new mongoose.Schema(
  {
    totalOpeningBalance: {
      type: Number,
      default: 0,
      min: [0, 'Opening balance cannot be negative'],
    },
    note: {
      type: String,
    },
    month: {
      type: Number,
      required: [true, 'Opening balance month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Opening balance year is required'],
    },
    history: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    // },
  },
  { timestamps: true },
);

/**
 * Export Models - Prevent OverwriteModelError
 */
const ExpenseCategory =
  mongoose.models.ExpenseCategory || mongoose.model('ExpenseCategory', ExpenseCategorySchema);

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

const OpeningBalance =
  mongoose.models.OpeningBalance || mongoose.model('OpeningBalance', OpeningBalanceSchema);

module.exports = { ExpenseCategory, Expense, OpeningBalance };
