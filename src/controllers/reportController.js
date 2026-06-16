const Feedback = require('../models/Feedback');
const { complaintStats } = require('./dashboardController');
const asyncHandler = require('../utils/asyncHandler');

const generateReport = asyncHandler(async (req, res) => {
  const stats = await complaintStats();
  const feedbackSummary = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 }
      }
    }
  ]);

  res.json({
    reportId: `report-${Date.now()}`,
    ...stats,
    averageRating: feedbackSummary[0]?.averageRating || 0,
    totalFeedback: feedbackSummary[0]?.totalFeedback || 0,
    generatedDate: new Date()
  });
});

module.exports = { generateReport };
