const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['Manual Adjustment', 'Sales Order', 'Purchase Order', 'Return', 'Damage'],
    },
    refType: {
      type: String,
      enum: ['Manual', 'SalesOrder', 'PurchaseOrder'],
      default: 'Manual',
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockLog', stockLogSchema);
