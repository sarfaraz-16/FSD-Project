const SalesOrder = require('../models/SalesOrder');
const { adjustStock } = require('./stockService');
const { generateInvoiceNumber } = require('./invoiceService');
const mongoose = require('mongoose');

const getSalesOrders = async (query) => {
  const { status, page = 1, limit = 10 } = query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const total = await SalesOrder.countDocuments(filter);
  const items = await SalesOrder.find(filter)
    .populate('customer', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { items, page: Number(page), limit: Number(limit), total };
};

const getSalesOrderById = async (id) => {
  return SalesOrder.findById(id)
    .populate('customer')
    .populate('items.product', 'name sku sellPrice')
    .populate('createdBy', 'name');
};

const createDraft = async (data, user) => {
  const total = data.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  return SalesOrder.create({ ...data, total, status: 'draft', createdBy: user._id });
};

const confirmOrder = async (id, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await SalesOrder.findById(id).session(session);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'draft') throw new Error('Only draft orders can be confirmed');

    // Generate Invoice Number
    order.invoiceNo = await generateInvoiceNumber(session);
    
    // Adjust stock for each item
    for (const item of order.items) {
      await adjustStock(
        item.product,
        -item.qty, // negative change
        'Sales Order',
        'SalesOrder',
        order._id,
        user,
        session
      );
    }

    order.status = 'confirmed';
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

const cancelOrder = async (id, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await SalesOrder.findById(id).session(session);
    if (!order) throw new Error('Order not found');
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new Error('Order cannot be cancelled');
    }

    if (order.status === 'confirmed') {
      for (const item of order.items) {
        await adjustStock(
          item.product,
          item.qty,
          'Return',
          'SalesOrder',
          order._id,
          user,
          session
        );
      }
    }

    order.status = 'cancelled';
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

const completeOrder = async (id) => {
  const order = await SalesOrder.findById(id);
  if (!order) throw new Error('Order not found');
  if (order.status !== 'confirmed') throw new Error('Only confirmed orders can be completed');
  
  order.status = 'completed';
  return order.save();
};

module.exports = { getSalesOrders, getSalesOrderById, createDraft, confirmOrder, cancelOrder, completeOrder };
