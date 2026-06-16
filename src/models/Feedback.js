const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedbackMessage: { type: String, trim: true }
  },
  { timestamps: true }
);

feedbackSchema.index({ complaint: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
