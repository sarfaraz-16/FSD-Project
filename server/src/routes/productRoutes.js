const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
const validate = require('../middleware/validate');
const Joi = require('joi');

const productSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().required(),
  costPrice: Joi.number().min(0).required(),
  sellPrice: Joi.number().min(0).required(),
  stockQty: Joi.number().min(0).optional(),
  reorderLevel: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

const adjustSchema = Joi.object({
  change: Joi.number().invalid(0).required(),
  reason: Joi.string().valid('Manual Adjustment', 'Sales Order', 'Purchase Order', 'Return', 'Damage').required(),
});

router.use(protect);

router.route('/')
  .get(authorizeAction('inventory', 'read'), productController.getAll)
  .post(authorizeAction('inventory', 'write'), validate(productSchema), productController.create);

router.get('/low-stock', authorizeAction('inventory', 'read'), productController.getLowStock);

router.route('/:id')
  .put(authorizeAction('inventory', 'write'), validate(productSchema), productController.update)
  .delete(authorizeAction('inventory', 'write'), productController.remove);

router.post('/:id/adjust', authorizeAction('inventory', 'write'), validate(adjustSchema), productController.adjustStock);

module.exports = router;
