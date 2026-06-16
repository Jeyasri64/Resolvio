const router = require('express').Router();
const { login, me, registerAdmin, registerStudent } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { loginRules, registerStudentRules } = require('../validators/authValidators');
const { createAdminRules } = require('../validators/userValidators');

router.post('/register', registerStudentRules, validate, registerStudent);
router.post('/admin/register', createAdminRules, validate, registerAdmin);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, me);

module.exports = router;
