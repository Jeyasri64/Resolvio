const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication token is required');
  }

  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.id).select('-password');

  if (!user || user.status !== 'active') {
    throw new ApiError(401, 'User is not authorized');
  }

  req.user = user;
  next();
});

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission for this action'));
    }
    next();
  };
}

module.exports = { protect, authorize };
