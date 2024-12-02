const express = require('express');
const router = express.Router();

const authController = require('../controller/authController');
const userController = require('../controller/userController');

// router.post('/signup', authController.signupUser);
router.post('/login', authController.loginUser);
router.post('/signup/:token', authController.signupUser);
router.get('/verify/:token', authController.emailVerifiaction);

router.patch('/:id', authController.updateUsers);
router.post('/forget-password', authController.forgotPassword);

router.get('/reset-password/:id/:token', authController.resetPassword);
router.patch('/reset-password/:id', authController.resetPasswordUpdate);

const authMiddleware = require('../middleware/authMiddleware');
router.use(authMiddleware);
router.get('/getMe', userController.getMe);
router.patch('/password/modify', userController.modifyPassword);

router.post('/target-acheived', userController.createTargetAcheived);
router.post('/expense', userController.createExpense);
router.post('/chargeback', userController.createChargeBack);
router.post('/refund', userController.createRefund);

router.get('/target-acheived', userController.getTargetAcheived);
router.get('/expense', userController.getExpenses);
router.get('/chargeback', userController.getChargeBacks);
router.get('/refund', userController.getRefunds);

router.get('/merchants', userController.getUserMerchants);

module.exports = router;
