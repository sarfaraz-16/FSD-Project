const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true, sparse: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  total: { type: Number, required: true, min: 0, set: v => Math.round(v * 100) / 100 },
  status: { type: String, enum: ['draft', 'confirmed', 'completed', 'cancelled'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
