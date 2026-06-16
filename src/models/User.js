const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    rollNumber: {
      type: String,
      required: function requiredForStudent() {
        return this.role === 'student';
      },
      unique: true,
      sparse: true,
      trim: true
    },
    roomNumber: {
      type: Number,
      required: function requiredForStudent() {
        return this.role === 'student';
      }
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phoneNumber: { type: String, trim: true },
    profileImage: { type: String, trim: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student', required: true },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
