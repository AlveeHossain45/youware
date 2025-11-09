const express = require('express');
const router = express.Router();
const { 
    createAssignment, 
    getAssignments, 
    submitAssignment, 
    getSubmissions 
} = require('../controllers/assignment.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All assignment routes are protected
router.use(protect);

router.route('/')
    .get(getAssignments) // Role logic is in controller
    .post(checkRole(['teacher']), createAssignment);

router.post('/:id/submit', checkRole(['student']), submitAssignment);
router.get('/:id/submissions', checkRole(['teacher']), getSubmissions);

module.exports = router;