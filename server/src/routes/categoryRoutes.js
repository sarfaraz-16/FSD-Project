const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
const validate = require('../middleware/validate');
const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
});

router.use(protect);

router.route('/')
  .get(authorizeAction('inventory', 'read'), categoryController.getAll)
  .post(authorizeAction('inventory', 'write'), validate(categorySchema), categoryController.create);

router.route('/:id')
  .put(authorizeAction('inventory', 'write'), validate(categorySchema), categoryController.update)
  .delete(authorizeAction('inventory', 'write'), categoryController.remove);

module.exports = router;
