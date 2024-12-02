const router = require('express').Router();
const brandController = require('../controller/brandController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, brandController.getAllBrands);
module.exports = router;
