const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
const validate = require('../middleware/validate');
const Joi = require('joi');

const createSchema = Joi.object({
  customer: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      qty: Joi.number().min(1).required(),
      price: Joi.number().min(0).required()
    })
  ).min(1).required()
});

const actionSchema = Joi.object({
  action: Joi.string().valid('confirm', 'complete', 'cancel').required()
});

router.use(protect);

router.route('/')
  .get(authorizeAction('sales', 'read'), salesController.getAll)
  .post(authorizeAction('sales', 'write'), validate(createSchema), salesController.create);

router.route('/:id')
  .get(authorizeAction('sales', 'read'), salesController.getById)
  .patch(authorizeAction('sales', 'write'), validate(actionSchema), salesController.updateStatus);

module.exports = router;
