const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance } = require('../controllers/attendance.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All attendance routes are protected
router.use(protect);

router.route('/')
    .get(getAttendance) // Controller handles role-based logic
    .post(checkRole(['teacher']), markAttendance);

module.exports = router;