const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
const validate = require('../middleware/validate');
const Joi = require('joi');

const createSchema = Joi.object({
  supplier: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),
      qty: Joi.number().min(1).required(),
      cost: Joi.number().min(0).required()
    })
  ).min(1).required()
});

const actionSchema = Joi.object({
  action: Joi.string().valid('ordered', 'receive', 'cancel').required()
});

router.use(protect);


router.route('/')
  .get(authorizeAction('purchases', 'read'), purchaseController.getAll)
  .post(authorizeAction('purchases', 'write'), validate(createSchema), purchaseController.create);

router.route('/:id')
  .get(authorizeAction('purchases', 'read'), purchaseController.getById)
  .patch(authorizeAction('purchases', 'write'), validate(actionSchema), purchaseController.updateStatus);

module.exports = router;
