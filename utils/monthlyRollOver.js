// utils/monthlyRollOver.js

const cron = require('node-cron');
const { OpeningBalance, Expense } = require('../model/expenseModel'); // Adjust path as necessary

cron.schedule(
  '0 0 1 * *',
  async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-based, so add 1
      const currentYear = currentDate.getFullYear();

      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const previousOpeningBalance = await OpeningBalance.findOne({
        month: previousMonth,
        year: previousYear,
      });

      if (!previousOpeningBalance) {
        console.log('No opening balance found for the previous month');
        return;
      }

      // Fetch the total expenses for the previous month
      const totalExpenses = await Expense.aggregate([
        { $match: { month: previousMonth, year: previousYear } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]);

      const totalExpensesAmount = totalExpenses[0]?.totalAmount || 0;

      const remainingBalance = previousOpeningBalance.totalOpeningBalance - totalExpensesAmount;

      await OpeningBalance.create({
        totalOpeningBalance: remainingBalance,
        note: 'Rollover Amount from Last Month',
        month: currentMonth,
        year: currentYear,
        history: [{ amount: remainingBalance, date: new Date() }],
      });

      console.log(
        `Successfully rolled over remaining balance of ${remainingBalance} after deducting expenses of ${totalExpensesAmount} for ${previousMonth}/${previousYear} to ${currentMonth}/${currentYear}`,
      );
    } catch (err) {
      console.error('Error in monthly rollover task:', err);
    }
  },
  {
    scheduled: true,
    timezone: 'Asia/Karachi',
  },
);
