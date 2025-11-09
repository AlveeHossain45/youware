const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Teacher
const createExam = asyncHandler(async (req, res) => {
    const { title, description, duration, totalMarks, scheduledDate, classId, questions } = req.body;
    const teacherId = req.user.id;

    const newExam = await prisma.exam.create({
        data: {
            title,
            description,
            duration,
            totalMarks,
            scheduledDate: new Date(scheduledDate),
            class: { connect: { id: classId } },
            questions: {
                create: questions.map(q => ({
                    questionText: q.question,
                    marks: q.marks,
                    options: {
                        create: q.options.map((opt, index) => ({
                            optionText: opt,
                            isCorrect: index === q.correctAnswer,
                        })),
                    },
                })),
            },
        },
    });
    res.status(201).json(newExam);
});

// @desc    Get all exams for the user's context
// @route   GET /api/exams
// @access  Private
const getAllExams = asyncHandler(async (req, res) => {
    let where = {};
    if (req.user.role === 'teacher') {
        const teacherClasses = await prisma.class.findMany({ where: { teacherId: req.user.id }, select: { id: true } });
        const classIds = teacherClasses.map(c => c.id);
        where = { classId: { in: classIds } };
    } else if (req.user.role === 'student') {
        const studentEnrollments = await prisma.studentClassEnrollment.findMany({ where: { studentId: req.user.id }, select: { classId: true } });
        const classIds = studentEnrollments.map(e => e.classId);
        where = { classId: { in: classIds } };
    }
    // Admin gets all

    const exams = await prisma.exam.findMany({ 
        where, 
        include: { class: { select: { name: true } } }
    });
    res.json(exams);
});

// @desc    Get a single exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = asyncHandler(async (req, res) => {
    let includeOptions = {
        questions: {
            include: {
                options: {
                    // Security: DO NOT send isCorrect to students taking the exam
                    select: { id: true, optionText: true }
                }
            }
        }
    };
    
    // If the user is a teacher or admin, they can see the correct answers
    if (req.user.role !== 'student') {
        includeOptions.questions.include.options.select.isCorrect = true;
    }

    const exam = await prisma.exam.findUnique({
        where: { id: req.params.id },
        include: includeOptions
    });

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }
    res.json(exam);
});

// @desc    Submit answers for an exam
// @route   POST /api/exams/:id/submit
// @access  Private/Student
const submitExam = asyncHandler(async (req, res) => {
    const { answers, timeTaken } = req.body; // answers is an object like { questionId: optionId }
    const studentId = req.user.id;
    const examId = req.params.id;

    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
            questions: { include: { options: true } }
        }
    });

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }
    
    let score = 0;
    exam.questions.forEach(question => {
        const correctOption = question.options.find(opt => opt.isCorrect);
        const studentAnswerId = answers[question.id];
        if (correctOption && correctOption.id === studentAnswerId) {
            score += question.marks;
        }
    });

    const result = await prisma.examResult.create({
        data: {
            score,
            totalMarks: exam.totalMarks,
            timeTaken,
            examId,
            studentId,
        }
    });

    res.status(201).json(result);
});


module.exports = {
    createExam,
    getAllExams,
    getExamById,
    submitExam,
};