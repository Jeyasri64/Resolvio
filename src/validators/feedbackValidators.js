const { body } = require('express-validator');

const feedbackRules = [
  body('complaintId').isMongoId().withMessage('Valid complaint id is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedbackMessage').optional().trim()
];

module.exports = { feedbackRules };
