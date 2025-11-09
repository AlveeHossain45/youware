const express = require('express');
const router = express.Router();
const { 
    createExam, 
    getAllExams, 
    getExamById, 
    submitExam 
} = require('../controllers/exam.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All exam routes are protected
router.use(protect);

router.route('/')
    .get(getAllExams) // Controller handles role-based fetching
    .post(checkRole(['teacher']), createExam);

// A student needs to be able to fetch the exam to take it
router.get('/:id', getExamById); 

// Only students can submit an exam
router.post('/:id/submit', checkRole(['student']), submitExam);

module.exports = router;