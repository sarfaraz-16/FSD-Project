const purchaseService = require('../services/purchaseService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await purchaseService.getPurchaseOrders(req.query);
    res.status(200).json({ success: true, ...result, message: 'Purchase orders fetched' });
  } catch (error) { next(error); }
};

const getById = async (req, res, next) => {
  try {
    const order = await purchaseService.getPurchaseOrderById(req.params.id);
    sendSuccess(res, order, 'Purchase order fetched');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const order = await purchaseService.createOrder(req.body, req.user);
    sendSuccess(res, order, 'Draft purchase order created', 201);
  } catch (error) { next(error); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { action } = req.body; // 'ordered', 'receive', 'cancel'
    let order;
    if (action === 'ordered') order = await purchaseService.markOrdered(req.params.id);
    else if (action === 'receive') order = await purchaseService.receiveOrder(req.params.id, req.user);
    else if (action === 'cancel') order = await purchaseService.cancelOrder(req.params.id);
    else throw new Error('Invalid action');
    
    sendSuccess(res, order, `Purchase order ${action === 'receive' ? 'received' : action + 'ed'}`);
  } catch (error) {
    if (error.message.includes('already received') || error.message.includes('Only ordered items')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { getAll, getById, create, updateStatus };
