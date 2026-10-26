const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    sendSuccess(res, user, 'User registered successfully', 201);
  } catch (error) {
    if (error.message === 'User already exists') {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, expectedRole } = req.body;
    const data = await authService.loginUser(email, password, expectedRole);
    sendSuccess(res, data, 'Login successful');
  } catch (error) {
    if (error.statusCode === 403) {
      return sendError(res, error.message, 403);
    }
    if (error.message === 'Invalid credentials') {
      return sendError(res, error.message, 401);
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, { user: req.user }, 'User data retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
