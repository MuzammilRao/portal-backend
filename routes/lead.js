const router = require('express').Router();
const leadController = require('../controller/leadController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.route('/').get(leadController.getAllLeads).post(leadController.createLead);
router.route('/user/all').get(leadController.getUserLeads);
router
  .route('/:id')
  .get(leadController.getLead)
  .patch(leadController.updateLead)
  .delete(leadController.deleteLead);

module.exports = router;
