const express = require('express');
const { getSalesReport, getPurchasesReport, getLowStockReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');

const router = express.Router();

router.use(protect);
router.use(authorizeAction('reports', 'read'));

router.get('/sales', getSalesReport);
router.get('/purchases', getPurchasesReport);
router.get('/low-stock', getLowStockReport);

module.exports = router;
