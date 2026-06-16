const ApiError = require('../utils/apiError');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');

const submitFeedback = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({
    _id: req.body.complaintId,
    student: req.user._id,
    status: 'resolved'
  });

  if (!complaint) {
    throw new ApiError(400, 'Feedback can be submitted only for your resolved complaint');
  }

  const feedback = await Feedback.create({
    complaint: complaint._id,
    student: req.user._id,
    rating: req.body.rating,
    feedbackMessage: req.body.feedbackMessage
  });

  res.status(201).json(feedback);
});

const listFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find()
    .populate('student', 'fullName rollNumber roomNumber email')
    .populate('complaint', 'complaintTitle category status')
    .sort({ createdAt: -1 });

  res.json(feedback);
});

module.exports = { submitFeedback, listFeedback };
