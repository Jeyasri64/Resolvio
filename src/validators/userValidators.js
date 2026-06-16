const { body } = require('express-validator');

const updateProfileRules = [
  // treat empty strings as missing so optional fields don't fail validation
  body('fullName').optional({ checkFalsy: true }).trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('roomNumber').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Room number must be valid'),
  body('phoneNumber').optional({ checkFalsy: true }).trim()
];

const createAdminRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const updateUserStatusRules = [
  body('status').isIn(['active', 'inactive', 'blocked']).withMessage('Invalid status')
];

module.exports = { updateProfileRules, createAdminRules, updateUserStatusRules };
