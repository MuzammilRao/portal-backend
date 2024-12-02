const router = require('express').Router();
const logController = require('../controller/logController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, logController.getLogs);

module.exports = router;
