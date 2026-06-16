const ApiError = require('../utils/apiError');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw new ApiError(404, 'Notification not found');
  res.json(notification);
});

module.exports = { listNotifications, markNotificationRead };
