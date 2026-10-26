const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    sendSuccess(res, users, 'Users fetched');
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    sendSuccess(res, user, 'User created', 201);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    sendSuccess(res, user, 'User updated');
  } catch (error) {
    if (error.message.includes('Cannot change your own role') || error.message.includes('Cannot deactivate your own account')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { getAll, create, update };
