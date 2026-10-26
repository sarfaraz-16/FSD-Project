const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const summary = await reportService.getDashboardSummary(req.user.role);
    sendSuccess(res, summary, 'Dashboard summary fetched');
  } catch (error) { next(error); }
};

const getSalesTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const trend = await reportService.getSalesTrend(days);
    sendSuccess(res, trend, 'Sales trend fetched');
  } catch (error) { next(error); }
};

const getTopProducts = async (req, res, next) => {
  try {
    const top = await reportService.getTopProducts();
    sendSuccess(res, top, 'Top products fetched');
  } catch (error) { next(error); }
};

const getStockByCategory = async (req, res, next) => {
  try {
    const stock = await reportService.getStockByCategory();
    
    if (req.user.role === 'staff') {
      const filtered = stock.map(s => ({ _id: s._id, name: s.name, totalStock: s.totalStock }));
      return sendSuccess(res, filtered, 'Stock by category fetched');
    }
    
    sendSuccess(res, stock, 'Stock by category fetched');
  } catch (error) { next(error); }
};

module.exports = { getSummary, getSalesTrend, getTopProducts, getStockByCategory };
