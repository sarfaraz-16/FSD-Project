const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalSalesValue: { type: Number, default: 0 },
  totalSalesCount: { type: Number, default: 0 },
  totalPurchaseValue: { type: Number, default: 0 },
  totalPurchaseCount: { type: Number, default: 0 },
  lowStockItemsCount: { type: Number, default: 0 },
  lowStockItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: String,
    name: String,
    stockQty: Number,
    reorderLevel: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
