const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
const validate = require('../middleware/validate');
const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(),
  department: Joi.string().required(),
  designation: Joi.string().required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  joinDate: Joi.date().required(),
  status: Joi.string().valid('active', 'inactive')
});

router.use(protect);

router.route('/')
  .get(authorizeAction('employees', 'read'), employeeController.getAll)
  .post(authorizeAction('employees', 'write'), validate(schema), employeeController.create);

router.route('/:id')
  .get(authorizeAction('employees', 'read'), employeeController.getById)
  .put(authorizeAction('employees', 'write'), validate(schema), employeeController.update)
  .delete(authorizeAction('employees', 'write'), employeeController.remove);

module.exports = router;
