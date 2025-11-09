const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private/Admin or Teacher
const createNotice = asyncHandler(async (req, res) => {
    const { title, content, audience, priority, isPinned } = req.body;
    const notice = await prisma.notice.create({
        data: {
            title,
            content,
            audience,
            priority,
            isPinned,
            authorId: req.user.id,
        },
    });
    res.status(201).json(notice);
});

// @desc    Get all relevant notices
// @route   GET /api/notices
// @access  Private
const getNotices = asyncHandler(async (req, res) => {
    let audienceFilter = ['Everyone'];
    if (req.user.role === 'student') {
        audienceFilter.push('Students');
    } else if (req.user.role === 'teacher') {
        audienceFilter.push('Teachers');
    } else if (req.user.role === 'admin') {
        audienceFilter = ['Everyone', 'Students', 'Teachers'];
    }

    const notices = await prisma.notice.findMany({
        where: { audience: { in: audienceFilter } },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: { author: { select: { name: true } } }
    });
    res.json(notices);
});

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private/Admin or Teacher
const updateNotice = asyncHandler(async (req, res) => {
    const notice = await prisma.notice.findUnique({ where: { id: req.params.id } });
    if (!notice) {
        res.status(404);
        throw new Error('Notice not found');
    }
    // Security: Only the author or an admin can update
    if (notice.authorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this notice');
    }

    const updatedNotice = await prisma.notice.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(updatedNotice);
});

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin or Teacher
const deleteNotice = asyncHandler(async (req, res) => {
    const notice = await prisma.notice.findUnique({ where: { id: req.params.id } });
    if (!notice) {
        res.status(404);
        throw new Error('Notice not found');
    }
     // Security: Only the author or an admin can delete
    if (notice.authorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this notice');
    }

    await prisma.notice.delete({ where: { id: req.params.id } });
    res.json({ message: 'Notice deleted' });
});

module.exports = {
    createNotice,
    getNotices,
    updateNotice,
    deleteNotice,
};