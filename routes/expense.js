const router = require('express').Router();
const expenseController = require('../controller/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes for Expense Categories
router.post('/categories', authMiddleware, expenseController.addCategory);
router.get('/categories', authMiddleware, expenseController.getCategories);

router.post('/opening-balance', authMiddleware, expenseController.addOpeningAmount);
router.get('/opening-balance', authMiddleware, expenseController.getOpeningBalances);

// Routes for Expenses
router.post('/add', authMiddleware, expenseController.addExpense);
router.get('/get-all', authMiddleware, expenseController.getAllExpenses);
router.patch('/:id', authMiddleware, expenseController.updateExpense);
// router.get('/expenses/monthly', authMiddleware, expenseController.getMonthlyExpenses);
router.get('/get-monthly-summary', authMiddleware, expenseController.getMonthlySummary);

// router.post('/calculate-balance', authMiddleware, expenseController.calculateMonthlyBalance);

// Routes for Opening Balance

router.get('/reports/get-all', expenseController.getOverviewReport);
module.exports = router;
