const express = require('express');
const router = express.Router();
const { 
    getDepartments, 
    getCourses, 
    getGradingSystem 
} = require('../controllers/academic.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All academic routes are protected and admin-only
router.use(protect, checkRole(['admin']));

router.get('/departments', getDepartments);
router.get('/courses', getCourses);
router.get('/grading', getGradingSystem);

module.exports = router;