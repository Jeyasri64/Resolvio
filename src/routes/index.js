const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/student', require('./studentRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/categories', require('./categoryRoutes'));

module.exports = router;
