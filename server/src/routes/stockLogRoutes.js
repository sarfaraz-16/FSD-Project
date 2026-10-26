const express = require('express');
const router = express.Router();
const stockLogController = require('../controllers/stockLogController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
router.use(protect);

router.get('/', authorizeAction('inventory', 'read'), stockLogController.getLogs);

module.exports = router;
