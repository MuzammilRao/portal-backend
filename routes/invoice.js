const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const invoiceController = require('../controller/invoiceController');

const router = express.Router();

router
  .route('/')
  .post(authMiddleware, invoiceController.create)
  .get(authMiddleware, invoiceController.getAllInvoices);

router.route('/send/:id').post(invoiceController.sendInvoiceThroughEmail);
// router
//   .route('/:id')
//   .get(authMiddleware, invoiceController.getInvoice)
//   .delete(authMiddleware, invoiceController.deleteInvoice)
//   .patch(authMiddleware, invoiceController.updateInvoice);
router
  .route('/:id')
  .get( invoiceController.getInvoice)
  .delete( invoiceController.deleteInvoice)
  .patch( invoiceController.updateInvoice);

module.exports = router;
