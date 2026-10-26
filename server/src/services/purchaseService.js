const PurchaseOrder = require('../models/PurchaseOrder');
const { adjustStock } = require('./stockService');
const mongoose = require('mongoose');

const getPurchaseOrders = async (query) => {
  const { status, page = 1, limit = 10 } = query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const total = await PurchaseOrder.countDocuments(filter);
  const items = await PurchaseOrder.find(filter)
    .populate('supplier', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { items, page: Number(page), limit: Number(limit), total };
};

const getPurchaseOrderById = async (id) => {
  return PurchaseOrder.findById(id)
    .populate('supplier')
    .populate('items.product', 'name sku costPrice')
    .populate('createdBy', 'name');
};

const createOrder = async (data, user) => {
  const total = data.items.reduce((sum, item) => sum + (item.qty * item.cost), 0);
  return PurchaseOrder.create({ ...data, total, status: 'draft', createdBy: user._id });
};

const markOrdered = async (id) => {
  const order = await PurchaseOrder.findById(id);
  if (!order) throw new Error('Order not found');
  if (order.status !== 'draft') throw new Error('Only draft orders can be marked as ordered');
  order.status = 'ordered';
  return order.save();
};

const receiveOrder = async (id, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await PurchaseOrder.findById(id).session(session);
    if (!order) throw new Error('Order not found');
    if (order.status === 'received') throw new Error('Order is already received');
    if (order.status !== 'ordered') throw new Error('Only ordered items can be received');

    for (const item of order.items) {
      await adjustStock(
        item.product,
        item.qty, // increase stock
        'Purchase Order',
        'PurchaseOrder',
        order._id,
        user,
        session
      );
    }

    order.status = 'received';
    order.receivedAt = new Date();
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelOrder = async (id) => {
  const order = await PurchaseOrder.findById(id);
  if (!order) throw new Error('Order not found');
  if (order.status === 'received' || order.status === 'cancelled') {
    throw new Error('Order cannot be cancelled at this stage');
  }
  
  order.status = 'cancelled';
  return order.save();
};

module.exports = { getPurchaseOrders, getPurchaseOrderById, createOrder, markOrdered, receiveOrder, cancelOrder };
