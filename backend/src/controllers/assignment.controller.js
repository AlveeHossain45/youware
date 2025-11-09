const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
const createAssignment = asyncHandler(async (req, res) => {
    const { title, description, points, dueDate, classId } = req.body;
    const assignment = await prisma.assignment.create({
        data: {
            title,
            description,
            points,
            dueDate: new Date(dueDate),
            classId,
            teacherId: req.user.id,
        },
    });
    res.status(201).json(assignment);
});

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
    let where = {};
    if(req.user.role === 'student'){
        const enrollments = await prisma.studentClassEnrollment.findMany({
            where: { studentId: req.user.id },
            select: { classId: true }
        });
        const classIds = enrollments.map(e => e.classId);
        where = { classId: { in: classIds } };
    } else if(req.user.role === 'teacher') {
        where = { teacherId: req.user.id };
    }

    const assignments = await prisma.assignment.findMany({ where });
    res.json(assignments);
});

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const submission = await prisma.submission.create({
        data: {
            content,
            assignmentId: req.params.id,
            studentId: req.user.id,
        },
    });
    res.status(201).json(submission);
});


// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Teacher
const getSubmissions = asyncHandler(async (req, res) => {
    const submissions = await prisma.submission.findMany({
        where: { assignmentId: req.params.id },
        include: { student: { select: { name: true, avatar: true } } },
    });
    res.json(submissions);
});


module.exports = {
    createAssignment,
    getAssignments,
    submitAssignment,
    getSubmissions,
};