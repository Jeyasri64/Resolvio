const router = require('express').Router();
const { studentDashboard } = require('../controllers/dashboardController');
const {
  createComplaint,
  getMyComplaint,
  myComplaints
} = require('../controllers/complaintController');
const { submitFeedback } = require('../controllers/feedbackController');
const {
  listNotifications,
  markNotificationRead
} = require('../controllers/notificationController');
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const { createComplaintRules } = require('../validators/complaintValidators');
const { feedbackRules } = require('../validators/feedbackValidators');
const { updateProfileRules } = require('../validators/userValidators');

router.use(protect, authorize('student'));

router.get('/dashboard', studentDashboard);
router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfileRules, validate, updateProfile);
router.post('/complaints', upload.single('image'), createComplaintRules, validate, createComplaint);
router.get('/complaints', myComplaints);
router.get('/complaints/:id', getMyComplaint);
router.get('/notifications', listNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/feedback', feedbackRules, validate, submitFeedback);

module.exports = router;
