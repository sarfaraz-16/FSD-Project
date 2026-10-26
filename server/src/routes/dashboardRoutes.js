const express = require('express');
const { getSummary, getSalesTrend, getTopProducts, getStockByCategory } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/sales-trend', getSalesTrend);
router.get('/top-products', getTopProducts);
router.get('/stock-by-category', getStockByCategory);

module.exports = router;
