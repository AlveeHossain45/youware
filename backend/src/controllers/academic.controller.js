const asyncHandler = require('express-async-handler');

// NOTE: The Prisma schema does not currently contain models for Departments, Courses, or Grading Systems.
// The functions below return mock data to match the frontend structure.
// To make this fully functional, you would need to add these models to `schema.prisma` and query them here.

// @desc    Get all departments
// @route   GET /api/academic/departments
// @access  Private/Admin
const getDepartments = asyncHandler(async (req, res) => {
    // Mock data - replace with Prisma query when model exists
    const mockDepartments = [
        { id: 'dept_01', name: 'Science', head: 'Dr. Alan Grant', courseCount: 5 },
        { id: 'dept_02', name: 'Mathematics', head: 'Dr. Ian Malcolm', courseCount: 4 },
        { id: 'dept_03', name: 'Humanities', head: 'Dr. Ellie Sattler', courseCount: 6 },
    ];
    res.json(mockDepartments);
});

// @desc    Get all courses/subjects
// @route   GET /api/academic/courses
// @access  Private/Admin
const getCourses = asyncHandler(async (req, res) => {
    // Mock data - replace with Prisma query when model exists
    const mockCourses = [
        { id: 'course_01', name: 'Physics 101', code: 'PHY101', department: 'Science' },
        { id: 'course_02', name: 'Calculus I', code: 'MTH101', department: 'Mathematics' },
        { id: 'course_03', name: 'World History', code: 'HIS101', department: 'Humanities' },
    ];
    res.json(mockCourses);
});

// @desc    Get grading system configuration
// @route   GET /api/academic/grading
// @access  Private/Admin
const getGradingSystem = asyncHandler(async (req, res) => {
    // Mock data - replace with Prisma query when model exists
    const mockGradingSystem = [
        { grade: 'A', range: '90-100%' },
        { grade: 'B', range: '80-89%' },
        { grade: 'C', range: '70-79%' },
        { grade: 'D', range: '60-69%' },
        { grade: 'F', range: 'Below 60%' },
    ];
    res.json(mockGradingSystem);
});


module.exports = {
    getDepartments,
    getCourses,
    getGradingSystem,
};