const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
const validate = require('../middleware/validate');
const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'staff').required(),
  employeeId: Joi.string().allow('', null)
});

const updateSchema = Joi.object({
  role: Joi.string().valid('admin', 'manager', 'staff'),
  isActive: Joi.boolean(),
  password: Joi.string().min(6).allow('', null)
});

router.use(protect);

router.route('/')
  .get(authorizeAction('users', 'read'), userController.getAll)
  .post(authorizeAction('users', 'write'), validate(createSchema), userController.create);

router.route('/:id')
  .patch(authorizeAction('users', 'write'), validate(updateSchema), userController.update);

module.exports = router;
