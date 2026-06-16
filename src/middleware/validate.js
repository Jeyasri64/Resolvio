const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((error) => error.msg).join(', ');
    return next(new ApiError(400, message));
  }
  next();
};
