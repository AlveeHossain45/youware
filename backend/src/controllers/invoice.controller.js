const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private/Accountant or Admin
const createInvoice = asyncHandler(async (req, res) => {
    const { studentId, description, amount, dueDate } = req.body;
    const invoice = await prisma.invoice.create({
        data: {
            studentId,
            description,
            amount,
            dueDate: new Date(dueDate),
        },
    });
    res.status(201).json(invoice);
});

// @desc    Get invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
    let where = {};
    if (req.user.role === 'student') {
        where.studentId = req.user.id;
    }
    // Accountants and admins can see all
    const invoices = await prisma.invoice.findMany({ 
        where, 
        include: { student: { select: { name: true } }, payments: true } 
    });
    res.json(invoices);
});

module.exports = { createInvoice, getInvoices };