const { body } = require('express-validator');

const registerStudentRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('roomNumber').isInt({ min: 1 }).withMessage('Room number must be a valid number'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginRules = [
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['student', 'admin', 'Student', 'Admin']).withMessage('Role must be Student or Admin'),
  body().custom((value) => {
    if (!value.identifier && !value.email && !value.rollNumber) {
      throw new Error('Email, roll number, or identifier is required');
    }
    return true;
  })
];

module.exports = { registerStudentRules, loginRules };
