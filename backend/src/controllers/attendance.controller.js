const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Mark attendance for a class
// @route   POST /api/attendance
// @access  Private/Teacher
const markAttendance = asyncHandler(async (req, res) => {
    const { classId, date, attendanceData } = req.body; // attendanceData: [{ studentId, status }]
    const markedById = req.user.id;
    const attendanceDate = new Date(date);

    const operations = attendanceData.map(({ studentId, status }) => 
        prisma.attendance.upsert({
            where: {
                studentId_classId_date: {
                    studentId,
                    classId,
                    date: attendanceDate,
                },
            },
            update: { status },
            create: {
                studentId,
                classId,
                date: attendanceDate,
                status,
                markedById,
            },
        })
    );
    
    await prisma.$transaction(operations);
    
    res.status(201).json({ message: 'Attendance marked successfully' });
});

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
    const { classId, studentId, date } = req.query;
    let where = {};

    // Security: Students can only see their own attendance
    if (req.user.role === 'student') {
        where.studentId = req.user.id;
    } else {
        if (studentId) where.studentId = studentId;
    }

    if (classId) where.classId = classId;
    if (date) where.date = new Date(date);

    const attendanceRecords = await prisma.attendance.findMany({
        where,
        include: {
            student: { select: { name: true } },
            class: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
    });

    res.json(attendanceRecords);
});

module.exports = {
    markAttendance,
    getAttendance,
};