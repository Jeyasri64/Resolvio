const { body } = require('express-validator');

const categoryRules = [
  body('categoryName').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim()
];

module.exports = { categoryRules };
