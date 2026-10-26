const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const { sendSuccess } = require('../utils/response');

const getModel = (type) => type === 'supplier' ? Supplier : Customer;

const getAll = async (req, res, next) => {
  try {
    const Model = getModel(req.params.type);
    const items = await Model.find().sort({ name: 1 });
    sendSuccess(res, items, `${req.params.type}s fetched`);
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const Model = getModel(req.params.type);
    const item = await Model.create(req.body);
    sendSuccess(res, item, `${req.params.type} created`, 201);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const Model = getModel(req.params.type);
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    sendSuccess(res, item, `${req.params.type} updated`);
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const Model = getModel(req.params.type);
    await Model.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, `${req.params.type} deleted`);
  } catch (error) { next(error); }
};

module.exports = { getAll, create, update, remove };
