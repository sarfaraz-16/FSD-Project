const inventoryService = require('../services/inventoryService');
const { sendSuccess, sendError } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const categories = await inventoryService.getCategories();
    sendSuccess(res, categories, 'Categories fetched');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const category = await inventoryService.createCategory(req.body);
    sendSuccess(res, category, 'Category created', 201);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const category = await inventoryService.updateCategory(req.params.id, req.body);
    sendSuccess(res, category, 'Category updated');
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    await inventoryService.deleteCategory(req.params.id);
    sendSuccess(res, null, 'Category deleted');
  } catch (error) {
    if (error.message === 'Cannot delete category with products') return sendError(res, error.message, 400);
    next(error);
  }
};

module.exports = { getAll, create, update, remove };
