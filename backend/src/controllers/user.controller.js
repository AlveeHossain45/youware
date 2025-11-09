// backend/src/controllers/user.controller.js

const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// @desc    Get all users (with filtering)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, search, excludeRoles } = req.query; // <-- Added excludeRoles
    let where = {};

    if (role && role !== 'all') {
        where.role = role; // Prisma enums are case-sensitive
    }
    
    // NEW LOGIC: Handle excluding roles
    if (excludeRoles) {
        const rolesToExclude = excludeRoles.split(','); // e.g., "student,teacher"
        where.role = {
            ...where.role,
            notIn: rolesToExclude
        };
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true, name: true, email: true, role: true, status: true, createdAt: true, avatar: true
        }
    });
    res.json(users);
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate if the role is valid
    const validRoles = ['admin', 'teacher', 'student', 'accountant', 'clerk', 'librarian', 'staff'];
    if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error('Invalid user role specified.');
    }

    const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
        },
    });
    
    const { password: _, ...newUser } = user;
    res.status(201).json(newUser);
});


// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true, name: true, email: true, role: true, status: true, createdAt: true, avatar: true
        }
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

// @desc    Update a user's profile
// @route   PUT /api/users/:id
// @access  Private (Admin or User themselves)
const updateUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        res.status(403);
        throw new Error('Forbidden: You are not authorized to update this user');
    }

    const { name, email, role, status } = req.body;
    const dataToUpdate = { name, email, status };
    
    if (req.user.role === 'admin' && role) {
        const validRoles = ['admin', 'teacher', 'student', 'accountant', 'clerk', 'librarian', 'staff'];
        if (validRoles.includes(role)) {
            dataToUpdate.role = role;
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: dataToUpdate,
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, avatar: true }
    });

    res.json(updatedUser);
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
});


module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
};