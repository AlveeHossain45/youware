const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Get all classes based on user role
// @route   GET /api/classes
// @access  Private
const getAllClasses = asyncHandler(async (req, res) => {
    let classes;
    const includeOptions = {
        teacher: { select: { name: true } },
        _count: { select: { enrollments: true } }
    };

    if (req.user.role === 'admin') {
        classes = await prisma.class.findMany({ include: includeOptions });
    } else if (req.user.role === 'teacher') {
        classes = await prisma.class.findMany({
            where: { teacherId: req.user.id },
            include: includeOptions,
        });
    } else { // Student
        classes = await prisma.class.findMany({
            where: { enrollments: { some: { studentId: req.user.id } } },
            include: includeOptions,
        });
    }

    // Map to match frontend's expected format if needed
    const formattedClasses = classes.map(c => ({
        ...c,
        studentCount: c._count.enrollments,
        teacherName: c.teacher.name
    }));

    res.json(formattedClasses);
});

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = asyncHandler(async (req, res) => {
    const { name, description, subject, teacherId, schedule, room } = req.body;
    
    const newClass = await prisma.class.create({
        data: { name, description, subject, teacherId, schedule, room },
    });
    res.status(201).json(newClass);
});

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = asyncHandler(async (req, res) => {
    const updatedClass = await prisma.class.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(updatedClass);
});

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = asyncHandler(async (req, res) => {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: 'Class deleted successfully' });
});

module.exports = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass,
};