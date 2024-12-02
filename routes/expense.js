const router = require('express').Router();
const expenseController = require('../controller/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes for Expense Categories
router.post('/categories', authMiddleware, expenseController.addCategory);
router.get('/categories', authMiddleware, expenseController.getCategories);

// Routes for Expenses
router.post('/add', authMiddleware, expenseController.addExpense);
router.get('/get-all', authMiddleware, expenseController.getExpenses);
router.patch('/:id', authMiddleware, expenseController.updateExpense);

// Routes for Opening Balance
router.post('/opening-balance', authMiddleware, expenseController.setOpeningBalance);
// router.get('/opening-balance', expenseController.getOpeningBalance);

router.get('/reports/get-all', expenseController.getAllReports);
module.exports = router;
