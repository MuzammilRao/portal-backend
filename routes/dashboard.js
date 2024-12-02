const router = require('express').Router();
const dashboardController = require('../controller/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, dashboardController.getDashboardReports);
// router.get('/', authMiddleware, brandController.getAllBrands);
// router.get('/', authMiddleware, brandController.getAllBrands);
module.exports = router;
