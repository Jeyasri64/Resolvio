const ApiError = require('../utils/apiError');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ categoryName: 1 });
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ message: 'Category deleted' });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
