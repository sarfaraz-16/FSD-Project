const salesService = require('../services/salesService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await salesService.getSalesOrders(req.query);
    res.status(200).json({ success: true, ...result, message: 'Sales orders fetched' });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const order = await salesService.getSalesOrderById(req.params.id);
    sendSuccess(res, order, 'Sales order fetched');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const order = await salesService.createDraft(req.body, req.user);
    sendSuccess(res, order, 'Draft sales order created', 201);
  } catch (error) { next(error); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { action } = req.body; // 'confirm', 'complete', 'cancel'
    let order;
    if (action === 'confirm') order = await salesService.confirmOrder(req.params.id, req.user);
    else if (action === 'complete') order = await salesService.completeOrder(req.params.id);
    else if (action === 'cancel') order = await salesService.cancelOrder(req.params.id, req.user);
    else throw new Error('Invalid action');
    
    sendSuccess(res, order, `Sales order ${action}ed`);
  } catch (error) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Only draft orders') || error.message.includes('Order cannot be cancelled')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { getAll, getById, create, updateStatus };
