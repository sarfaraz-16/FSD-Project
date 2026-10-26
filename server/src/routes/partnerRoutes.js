const express = require('express');
const router = express.Router({ mergeParams: true });
const partnerController = require('../controllers/partnerController');
const { protect } = require('../middleware/auth');
const authorizeAction = require('../middleware/authorizeAction');
const validate = require('../middleware/validate');
const Joi = require('joi');

const partnerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().allow('', null),
  address: Joi.string().allow('', null),
});

router.use(protect);

router.route('/')
  .get(authorizeAction('sales', 'read'), partnerController.getAll)
  .post(authorizeAction('sales', 'write'), validate(partnerSchema), (req, res, next) => {
    if (req.user.role === 'staff' && req.params.type === 'supplier') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage suppliers' });
    }
    next();
  }, partnerController.create);

router.route('/:id')
  .put(authorizeAction('sales', 'write'), validate(partnerSchema), (req, res, next) => {
    if (req.user.role === 'staff' && req.params.type === 'supplier') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage suppliers' });
    }
    next();
  }, partnerController.update)
  .delete(authorizeAction('sales', 'write'), (req, res, next) => {
    if (req.user.role === 'staff' && req.params.type === 'supplier') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage suppliers' });
    }
    next();
  }, partnerController.remove);

module.exports = router;
