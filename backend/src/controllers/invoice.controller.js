// backend/src/controllers/invoice.controller.js

const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private/Accountant or Admin
const createInvoice = asyncHandler(async (req, res) => {
    const { studentId, description, amount, dueDate } = req.body;

    // --- নতুন ভ্যালিডেশন এবং ডেটা পার্সিং ---

    // ১. সব ফিল্ড দেওয়া হয়েছে কিনা তা চেক করা
    if (!studentId || !description || !amount || !dueDate) {
        res.status(400); // 400 Bad Request
        throw new Error('Please provide all required fields: studentId, description, amount, and dueDate.');
    }

    // ২. amount-কে স্ট্রিং থেকে নাম্বারে রূপান্তর করা
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
        res.status(400);
        throw new Error('Invalid amount provided. Must be a positive number.');
    }

    // ৩. dueDate-কে স্ট্রিং থেকে সঠিক Date অবজেক্টে রূপান্তর করা
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
        res.status(400);
        throw new Error('Invalid dueDate format provided. Use YYYY-MM-DD format.');
    }

    // --- এখন সঠিক ফরম্যাটের ডেটা দিয়ে ইনভয়েস তৈরি করা হবে ---
    const invoice = await prisma.invoice.create({
        data: {
            studentId,
            description,
            amount: parsedAmount,   // পার্স করা নাম্বার ব্যবহার করা হচ্ছে
            dueDate: parsedDate,     // পার্স করা ডেট অবজেক্ট ব্যবহার করা হচ্ছে
            status: 'pending',       // <-- ★★★ এই লাইনটিই মূল সমাধান ★★★
        },
    });
    
    res.status(201).json(invoice);
});

// @desc    Get invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
    let where = {};
    const { studentId } = req.query; // <-- studentId অনুযায়ী ফিল্টার করার সুবিধা যোগ করা হলো

    if (req.user.role === 'student') {
        where.studentId = req.user.id;
    } else if (studentId) {
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