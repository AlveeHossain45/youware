const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard stats for Admin/Accountant
// @route   GET /api/finance/dashboard-stats
// @access  Private/Admin or Accountant
const getFinancialDashboardStats = asyncHandler(async (req, res) => {
    // Use a transaction for efficiency
    const [
        totalRevenueResult,
        pendingInvoices,
        paidInvoicesCount,
        studentCount,
        totalAttendance,
        presentAttendance
    ] = await prisma.$transaction([
        prisma.payment.aggregate({
            _sum: { amountPaid: true },
        }),
        prisma.invoice.findMany({
            where: { status: { in: ['pending', 'overdue', 'partial'] } },
            include: { payments: true },
        }),
        prisma.invoice.count({
            where: { status: 'paid' },
        }),
        prisma.user.count({
            where: { role: 'student' },
        }),
        prisma.attendance.count(),
        prisma.attendance.count({ where: { status: 'present' } })
    ]);

    // Calculate total pending fees accurately
    const totalPendingFees = pendingInvoices.reduce((total, invoice) => {
        const totalPaidForInvoice = invoice.payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const balance = invoice.amount - totalPaidForInvoice;
        return total + (balance > 0 ? balance : 0);
    }, 0);

    const attendanceRate = totalAttendance > 0 ? ((presentAttendance / totalAttendance) * 100).toFixed(1) : 0;
    
    // This structure matches what your frontend dashboards expect
    const stats = {
        totalRevenue: totalRevenueResult._sum.amountPaid || 0,
        pendingFees: totalPendingFees,
        paidFees: paidInvoicesCount,
        totalStudents: studentCount,
        attendanceRate: parseFloat(attendanceRate)
    };
    
    res.json(stats);
});

module.exports = {
    getFinancialDashboardStats,
};