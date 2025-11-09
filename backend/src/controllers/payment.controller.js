const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Record a new payment
// @route   POST /api/payments
// @access  Private/Accountant or Admin
const recordPayment = asyncHandler(async (req, res) => {
    const { invoiceId, amountPaid, paymentMethod, transactionId } = req.body;
    
    const payment = await prisma.payment.create({
        data: {
            invoiceId,
            amountPaid,
            paymentMethod,
            transactionId,
        },
    });

    // Update the invoice status
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
    });
    
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountPaid, 0);

    let newStatus = 'partial';
    if (totalPaid >= invoice.amount) {
        newStatus = 'paid';
    }

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
    });
    
    res.status(201).json(payment);
});

module.exports = { recordPayment };