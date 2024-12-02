// const mongoose = require('mongoose');

// const targetSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: [true,"Please select Business Unit Head."],
//     },
//     month: {
//       type: Number,
//       required: [true,"Month is required."],
//       min: 1,
//       max: 12,
//     },
//     year: {
//       type: Number,
//     },
//     amount: {
//       type: Number,
//     },
//   },
//   { timestamps: true },
// );

// const acheivedSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     month: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 12,
//     },
//     year: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true },
// );

// const budgetSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },

//     month: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 12,
//     },
//     year: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true },
// );

// const expenseSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     description: {
//       type: String,
//       default: '',
//     },
//     month: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 12,
//     },
//     year: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true },
// );

// const refundSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     month: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 12,
//     },
//     year: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true },
// );

// const chargebackSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     month: {
//       type: Number,
//       required: true,
//       min: 1,
//       max: 12,
//     },
//     year: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true },
// );

// const Target = mongoose.model('Target', targetSchema);
// const Achieved = mongoose.model('Acheived', acheivedSchema);
// const Budget = mongoose.model('Budget', budgetSchema);
// const Expense = mongoose.model('Expense', expenseSchema);
// const Refund = mongoose.model('Refund', refundSchema);
// const Chargeback = mongoose.model('Chargeback', chargebackSchema);

// module.exports = {
//   Target,
//   Achieved,
//   Budget,
//   Expense,
//   Refund,
//   Chargeback,
// };
