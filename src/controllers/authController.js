const ApiError = require('../utils/apiError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');

function userResponse(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    rollNumber: user.rollNumber,
    roomNumber: user.roomNumber,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status
  };
}

const registerStudent = asyncHandler(async (req, res) => {
  const { fullName, rollNumber, roomNumber, email, password } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { rollNumber }] });
  if (exists) throw new ApiError(409, 'Email or roll number already exists');

  const user = await User.create({
    fullName,
    rollNumber,
    roomNumber,
    email,
    password,
    role: 'student'
  });

  res.status(201).json({
    token: generateToken(user),
    user: userResponse(user)
  });
});

const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already exists');

  const user = await User.create({
    fullName,
    email,
    password,
    role: 'admin'
  });

  res.status(201).json({
    token: generateToken(user),
    user: userResponse(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { identifier, email, rollNumber, password, role } = req.body;
  const normalizedRole = role.toLowerCase();
  const loginId = identifier || email || rollNumber;

  // Debug log: record login attempts (avoid logging passwords)
  console.log('Login attempt:', { loginId, role: normalizedRole, ip: req.ip });

  const query = normalizedRole === 'admin'
    ? { email: loginId, role: 'admin' }
    : { $or: [{ email: loginId }, { rollNumber: loginId }], role: 'student' };

  const user = await User.findOne(query).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid login credentials');
  }

  if (user.status !== 'active') {
    throw new ApiError(403, 'Account is not active');
  }

  res.json({
    token: generateToken(user),
    user: userResponse(user)
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});

module.exports = { registerStudent, registerAdmin, login, me };
