const router = require('express').Router();
const expenseController = require('../controller/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes for Expense Categories
router.post('/categories', authMiddleware, expenseController.addCategory);
router.get('/categories', authMiddleware, expenseController.getCategories);
router.delete('/categories/:id', expenseController.deleteCategory);

router.post('/opening-balance', authMiddleware, expenseController.addOpeningAmount);
router.get('/opening-balance', authMiddleware, expenseController.getOpeningBalances);
router.delete('/opening-balance/:id', expenseController.deleteOpeningBalance);

// Routes for Expenses
router.post('/add', authMiddleware, expenseController.addExpense);
router.get('/get-all', authMiddleware, expenseController.getAllExpenses);
router.delete('/delete-expenses/:id', expenseController.deleteExpense);
router.patch('/:id', authMiddleware, expenseController.updateExpense);


router.get('/get-monthly-summary', authMiddleware, expenseController.getMonthlySummary);
router.get('/reports/get-all', expenseController.getOverviewReport);

module.exports = router;

