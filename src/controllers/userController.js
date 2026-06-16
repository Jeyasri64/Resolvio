const ApiError = require('../utils/apiError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  const user = req.user.toObject();
  if (user.profileImage && user.profileImage.startsWith('/')) {
    user.profileImageUrl = `${req.protocol}://${req.get('host')}${user.profileImage}`;
  } else {
    user.profileImageUrl = user.profileImage;
  }
  res.json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  // Manually map and coerce incoming fields to avoid accidental type issues
  if (req.body.fullName !== undefined) {
    req.user.fullName = String(req.body.fullName).trim();
  }

  if (req.body.roomNumber !== undefined) {
    // allow numeric strings, cast to Number for schema
    const rn = req.body.roomNumber === '' ? undefined : Number(req.body.roomNumber);
    if (rn !== undefined && !Number.isNaN(rn)) req.user.roomNumber = rn;
  }

  if (req.body.phoneNumber !== undefined) {
    // keep phone as trimmed string (allow empty string if intentionally cleared)
    req.user.phoneNumber = String(req.body.phoneNumber).trim();
  }

  if (req.file) {
    req.user.profileImage = `/uploads/${req.file.filename}`;
  }

  await req.user.save();
  const user = req.user.toObject();
  if (user.profileImage && user.profileImage.startsWith('/')) {
    user.profileImageUrl = `${req.protocol}://${req.get('host')}${user.profileImage}`;
  } else {
    user.profileImageUrl = user.profileImage;
  }
  res.json(user);
});

const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

const createAdmin = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new ApiError(409, 'Email already exists');

  const admin = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    role: 'admin'
  });

  res.status(201).json({
    id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    role: admin.role,
    status: admin.status
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.status = req.body.status;
  await user.save();
  res.json(user);
});

module.exports = { getProfile, updateProfile, listUsers, createAdmin, updateUserStatus };
