const router = require('express').Router();
const {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { categoryRules } = require('../validators/categoryValidators');

router.get('/', protect, listCategories);
router.post('/', protect, authorize('admin'), categoryRules, validate, createCategory);
router.put('/:id', protect, authorize('admin'), categoryRules, validate, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
