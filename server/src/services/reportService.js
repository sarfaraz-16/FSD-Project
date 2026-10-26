const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');

const getDashboardSummary = async (role) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [sales] = await SalesOrder.aggregate([
    { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, totalValue: { $sum: '$total' }, count: { $sum: 1 } } }
  ]);

  const [pendingOrders] = await SalesOrder.aggregate([
    { $match: { status: 'draft' } },
    { $group: { _id: null, count: { $sum: 1 } } }
  ]);

  const lowStockCount = await Product.countDocuments({
    $expr: { $lte: ['$stockQty', '$reorderLevel'] },
    isActive: true
  });

  const [stockValue] = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stockQty', '$costPrice'] } } } }
  ]);

  const summary = {
    todaySalesTotal: sales ? sales.totalValue : 0,
    todaySalesCount: sales ? sales.count : 0,
    pendingOrdersCount: pendingOrders ? pendingOrders.count : 0,
    lowStockCount
  };

  // Restrict cost/profit info for staff
  if (role !== 'staff') {
    summary.totalStockValue = stockValue ? stockValue.totalValue : 0;
  }

  return summary;
};

const getSalesTrend = async (days) => {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);
  dateLimit.setHours(0, 0, 0, 0);

  const trend = await SalesOrder.aggregate([
    { $match: { createdAt: { $gte: dateLimit }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return trend.map(item => ({ date: item._id, totalSales: item.totalSales, orderCount: item.orderCount }));
};

const getTopProducts = async () => {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const topProducts = await SalesOrder.aggregate([
    { $match: { createdAt: { $gte: last30Days }, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQty: { $sum: '$items.qty' },
        totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } }
      }
    },
    { $sort: { totalQty: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $project: {
        name: '$productInfo.name',
        sku: '$productInfo.sku',
        totalQty: 1,
        totalRevenue: 1
      }
    }
  ]);
  return topProducts;
};

const getStockByCategory = async () => {
  const stockByCategory = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        totalStock: { $sum: '$stockQty' },
        totalValue: { $sum: { $multiply: ['$stockQty', '$costPrice'] } }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' },
    {
      $project: {
        name: '$categoryInfo.name',
        totalStock: 1,
        totalValue: 1
      }
    }
  ]);
  return stockByCategory;
};

const getSalesReport = async (query) => {
  const { startDate, endDate, page = 1, limit = 10, format } = query;
  
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const queryObj = SalesOrder.find(filter).populate('customer', 'name phone').sort({ createdAt: -1 });

  if (format === 'csv') {
    const data = await queryObj.lean();
    return data;
  }

  const skip = (page - 1) * limit;
  const total = await SalesOrder.countDocuments(filter);
  const items = await queryObj.skip(skip).limit(Number(limit));

  return { items, page: Number(page), limit: Number(limit), total };
};

const getPurchasesReport = async (query) => {
  const { startDate, endDate, page = 1, limit = 10, format } = query;
  
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const queryObj = PurchaseOrder.find(filter).populate('supplier', 'name').sort({ createdAt: -1 });

  if (format === 'csv') {
    const data = await queryObj.lean();
    return data;
  }

  const skip = (page - 1) * limit;
  const total = await PurchaseOrder.countDocuments(filter);
  const items = await queryObj.skip(skip).limit(Number(limit));

  return { items, page: Number(page), limit: Number(limit), total };
};

const getLowStockReport = async (query) => {
  const { format, page = 1, limit = 10 } = query;
  const filter = {
    $expr: { $lte: ['$stockQty', '$reorderLevel'] },
    isActive: true
  };

  const queryObj = Product.find(filter).populate('category', 'name').sort({ stockQty: 1 });

  if (format === 'csv') {
    return await queryObj.lean();
  }

  const skip = (page - 1) * limit;
  const total = await Product.countDocuments(filter);
  const items = await queryObj.skip(skip).limit(Number(limit));

  return { items, page: Number(page), limit: Number(limit), total };
};

module.exports = {
  getDashboardSummary,
  getSalesTrend,
  getTopProducts,
  getStockByCategory,
  getSalesReport,
  getPurchasesReport,
  getLowStockReport
};
