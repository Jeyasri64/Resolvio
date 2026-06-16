const router = require('express').Router();
const { adminDashboard } = require('../controllers/dashboardController');
const {
  getComplaint,
  listComplaints,
  updateComplaint
} = require('../controllers/complaintController');
const { listFeedback } = require('../controllers/feedbackController');
const { generateReport } = require('../controllers/reportController');
const { getProfile, updateProfile, createAdmin, listUsers, updateUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const { updateComplaintRules } = require('../validators/complaintValidators');
const { createAdminRules, updateUserStatusRules, updateProfileRules } = require('../validators/userValidators');

router.use(protect, authorize('admin'));

router.get('/dashboard', adminDashboard);
router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfileRules, validate, updateProfile);
router.get('/complaints', listComplaints);
router.get('/complaints/:id', getComplaint);
router.patch('/complaints/:id', updateComplaintRules, validate, updateComplaint);
router.get('/users', listUsers);
router.post('/users/admins', createAdminRules, validate, createAdmin);
router.patch('/users/:id/status', updateUserStatusRules, validate, updateUserStatus);
router.get('/feedback', listFeedback);
router.get('/reports', generateReport);

module.exports = router;
