const inventoryService = require('../services/inventoryService');
const stockService = require('../services/stockService');
const { sendSuccess, sendError } = require('../utils/response');
const mongoose = require('mongoose');

const getAll = async (req, res, next) => {
  try {
    const result = await inventoryService.getProducts(req.query);
    res.status(200).json({ success: true, ...result, message: 'Products fetched' });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const product = await inventoryService.createProduct(req.body);
    sendSuccess(res, product, 'Product created', 201);
  } catch (error) {
    if (error.message === 'Duplicate SKU') return sendError(res, error.message, 400);
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await inventoryService.updateProduct(req.params.id, req.body);
    sendSuccess(res, product, 'Product updated');
  } catch (error) {
    if (error.message === 'Duplicate SKU') return sendError(res, error.message, 400);
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await inventoryService.deleteProduct(req.params.id);
    sendSuccess(res, null, 'Product deactivated');
  } catch (error) { next(error); }
};

const adjustStock = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { change, reason } = req.body;
    const result = await stockService.adjustStock(req.params.id, change, reason, 'Manual', null, req.user, session);
    await session.commitTransaction();
    session.endSession();
    sendSuccess(res, result, 'Stock adjusted successfully');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.message.includes('Insufficient stock') || error.message.includes('cannot be zero')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const products = await stockService.getLowStockProducts();
    sendSuccess(res, products, 'Low stock products fetched');
  } catch (error) { next(error); }
};

module.exports = { getAll, create, update, remove, adjustStock, getLowStock };
