const router = require('express').Router();
const adminController = require('../controller/adminController');
const moduleController = require('../controller/moduleController');
const roleController = require('../controller/roleController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/invite', adminController.sendInvitation);
// BU
router.post('/business-unit', adminController.createBusinessUnit);
router.get('/business-unit', adminController.getBusinessUnits);

// Brand
router.post('/brand', adminController.createBrand);
router.get('/brand', adminController.getBrands);
router.get('/brand/:id', adminController.getBrand);
router.patch('/brand/:id', adminController.updateBrand);
router.delete('/brand/:id', adminController.deleteBrand);

// User
router.get('/user', adminController.getUsers);
router.get('/user/:id', adminController.getUser);
router.patch('/user/:id', adminController.updateUser);
router.patch('/user/:id/reset-password', adminController.updateUserPassword);
router.delete('/user/:id', adminController.deleteUser);
router.patch('/approve-user/:id', adminController.approveUser);

// Clients or Customers
router.post('/client', adminController.createClient);
router.get('/client', adminController.getClients);
router.get('/client/:id', adminController.getClient);
router.patch('/client/:id', authMiddleware, adminController.updateClient);
router.delete('/client/:id', adminController.deleteClient);

//Invoice
router.post('/invoice', adminController.createInvoice);
router.get('/invoice', adminController.getInvoices);
router.get('/invoice/:id', adminController.getInvoice);
router.patch('/invoice/:id', adminController.updateInvoice);
router.delete('/invoice/:id', adminController.deleteInvoice);

router.post('/target', adminController.createTarget);
router.get('/target', adminController.getTargets);

router.post('/budget', adminController.createBudget);
router.get('/budget', adminController.getBudgets);

router.get('/target-acheived', adminController.getTargetAcheived);
router.get('/expense', adminController.getExpenses);
router.get('/chargeback', adminController.getChargeBacks);
router.get('/refund', adminController.getRefunds);

router.post('/merchant', adminController.addMerchants);
router.get('/merchant', adminController.getMerchants);

router.post('/module', moduleController.createModule);
router.get('/module', moduleController.getModules);
router.post('/role', roleController.createRole);
router.get('/role', roleController.getRoles);
router.delete('/role/:id', roleController.softDeleteRole);

module.exports = router;
