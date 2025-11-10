// backend/src/controllers/invoice.controller.js

const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private/Accountant or Admin
const createInvoice = asyncHandler(async (req, res) => {
    const { studentId, description, amount, dueDate } = req.body;

    if (!studentId || !description || !amount || !dueDate) {
        res.status(400);
        throw new Error('Please provide all required fields.');
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
        res.status(400);
        throw new Error('Invalid amount provided.');
    }
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
        res.status(400);
        throw new Error('Invalid dueDate format.');
    }

    const invoice = await prisma.invoice.create({
        data: {
            studentId,
            description,
            amount: parsedAmount,
            dueDate: parsedDate,
            status: 'pending',
        },
    });
    
    res.status(201).json(invoice);
});

// @desc    Get invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
    let where = {};
    const { studentId } = req.query;

    // --- মূল পরিবর্তন এখানে ---
    // যদি ব্যবহারকারী অ্যাডমিন বা অ্যাকাউন্টেন্ট না হন, তবে শুধুমাত্র তাদের নিজেদের ডেটা দেখার অনুমতি দিন
    if (req.user.role !== 'admin' && req.user.role !== 'accountant') {
        where.studentId = req.user.id;
    } 
    // যদি অ্যাডমিন কোনো নির্দিষ্ট ছাত্রের ডেটা চান, তাহলে ফিল্টার করুন
    else if (studentId) {
        where.studentId = studentId;
    }
    
    const invoices = await prisma.invoice.findMany({ 
        where, 
        include: { 
            student: { select: { name: true } }, 
            payments: true 
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.json(invoices);
});

module.exports = { createInvoice, getInvoices };