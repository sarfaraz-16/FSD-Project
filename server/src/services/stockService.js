const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

const adjustStock = async (productId, change, reason, refType, refId, user, session = null) => {
  if (change === 0) {
    throw new Error('Stock change cannot be zero');
  }

  const product = await Product.findById(productId).session(session);
  if (!product) {
    throw new Error('Product not found');
  }

  const newStockQty = product.stockQty + change;
  if (newStockQty < 0) {
    throw new Error(`Insufficient stock for ${product.name}. Current: ${product.stockQty}, Requested: ${Math.abs(change)}`);
  }

  product.stockQty = newStockQty;
  await product.save({ session });

  const stockLog = new StockLog({
    product: productId,
    change,
    reason,
    refType: refType || 'Manual',
    refId: refId || null,
    by: user._id,
  });
  await stockLog.save({ session });

  return { product, stockLog };
};

const getLowStockProducts = async () => {
  return await Product.find({
    $expr: { $lte: ['$stockQty', '$reorderLevel'] },
    isActive: true,
  }).populate('category', 'name');
};

module.exports = {
  adjustStock,
  getLowStockProducts,
};
