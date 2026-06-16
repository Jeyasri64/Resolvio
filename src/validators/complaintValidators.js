const { body } = require('express-validator');

const createComplaintRules = [
  body('complaintTitle').trim().notEmpty().withMessage('Complaint title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('roomNumber').isInt({ min: 1 }).withMessage('Room number must be a valid number'),
  body('description').trim().notEmpty().withMessage('Description is required')
];

const updateComplaintRules = [
  body('status').optional().isIn(['pending', 'in-progress', 'resolved', 'rejected']).withMessage('Invalid status'),
  body('adminRemark').optional().trim(),
  body('assignedTo').optional().trim(),
  body('student.fullName').optional().trim().notEmpty().withMessage('Student name cannot be empty'),
  body('student.rollNumber').optional().trim(),
  body('student.roomNumber').optional().isInt({ min: 1 }).withMessage('Student room number must be valid'),
  body('student.email').optional().isEmail().withMessage('Valid student email is required').normalizeEmail()
];

module.exports = { createComplaintRules, updateComplaintRules };
