const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    complaintTitle: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    roomNumber: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending'
    },
    adminRemark: { type: String, trim: true },
    assignedTo: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
