const StockLog = require('../models/StockLog');

const getLogs = async (req, res, next) => {
  try {
    const { product, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (product) filter.product = product;

    const skip = (page - 1) * limit;
    const total = await StockLog.countDocuments(filter);
    const items = await StockLog.find(filter)
      .populate('product', 'name sku')
      .populate('by', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, items, page: Number(page), limit: Number(limit), total, message: 'Stock logs fetched' });
  } catch (error) { next(error); }
};

module.exports = { getLogs };
