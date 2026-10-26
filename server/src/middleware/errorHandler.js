const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return sendError(res, 'Validation Error', 400, messages);
  }

  if (err.code === 11000) {
    return sendError(res, 'Duplicate field value entered', 400);
  }

  sendError(res, err.message || 'Server Error', 500);
};

module.exports = errorHandler;
