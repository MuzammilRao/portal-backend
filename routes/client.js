const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const clientController = require('../controller/clientController');

router
  .route('/')
  .get(authMiddleware, clientController.getAllClients)
  .post(authMiddleware, clientController.createClients);

router
  .route('/:id')
  .get(authMiddleware, clientController.getSingleClients)
  .patch(authMiddleware, clientController.updateClients)
  .delete(authMiddleware, clientController.deleteClients);

module.exports = router;
