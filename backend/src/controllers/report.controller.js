const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Get a list of available reports
// @route   GET /api/reports
// @access  Private/Admin
const getAvailableReports = asyncHandler(async (req, res) => {
    // This list matches the mock data in your frontend
    const reports = [
        {
          id: 1,
          title: 'Student Performance Report',
          type: 'academic',
          description: 'An overview of student grades and exam performance.'
        },
        {
          id: 2,
          title: 'Attendance Summary',
          type: 'attendance',
          description: 'A summary of attendance rates by class and student.'
        },
        {
          id: 3,
          title: 'Financial Overview',
          type: 'financial',
          description: 'A report on revenue, pending payments, and financial health.'
        }
    ];
    res.json(reports);
});

// @desc    Generate a specific report
// @route   GET /api/reports/:type
// @access  Private/Admin or Accountant
const generateReport = asyncHandler(async (req, res) => {
    const { type } = req.params;
    let reportData = {};

    switch (type) {
        case 'financial':
            const totalRevenue = await prisma.payment.aggregate({ _sum: { amountPaid: true } });
            const pendingInvoices = await prisma.invoice.count({ where: { status: { in: ['pending', 'overdue', 'partial'] } } });
            reportData = {
                title: 'Financial Overview',
                generatedAt: new Date(),
                summary: {
                    totalRevenue: totalRevenue._sum.amountPaid || 0,
                    pendingInvoicesCount: pendingInvoices,
                }
            };
            break;
            
        case 'attendance':
            const totalRecords = await prisma.attendance.count();
            const presentRecords = await prisma.attendance.count({ where: { status: 'present' } });
            const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords * 100).toFixed(2) : 0;
            reportData = {
                title: 'Attendance Summary',
                generatedAt: new Date(),
                summary: {
                    totalRecords,
                    presentRecords,
                    overallAttendanceRate: `${attendanceRate}%`
                }
            };
            break;
            
        // Add more cases for other report types
        default:
            res.status(400);
            throw new Error('Invalid report type');
    }

    // In a real application, you would generate a PDF/CSV file here.
    // For now, we return JSON data.
    res.json(reportData);
});

module.exports = {
    getAvailableReports,
    generateReport,
};