const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');

async function complaintStats(filter = {}) {
  const [stats] = await Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const rows = await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = rows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  return {
    totalComplaints: Object.values(counts).reduce((sum, count) => sum + count, 0),
    pendingComplaints: counts.pending || 0,
    inProgressComplaints: counts['in-progress'] || 0,
    resolvedComplaints: counts.resolved || 0,
    rejectedComplaints: counts.rejected || 0
  };
}

const studentDashboard = asyncHandler(async (req, res) => {
  const stats = await complaintStats({ student: req.user._id });
  delete stats.rejectedComplaints;
  res.json(stats);
});

const adminDashboard = asyncHandler(async (req, res) => {
  res.json(await complaintStats());
});

module.exports = { studentDashboard, adminDashboard, complaintStats };
