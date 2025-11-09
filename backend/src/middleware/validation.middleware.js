const { body, validationResult } = require('express-validator');

// A reusable middleware to run the validation checks
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    // To make errors more readable, we extract them into an array
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(400).json({
        message: 'Validation failed',
        errors: extractedErrors,
    });
};

// --- Define Validation Chains for different routes ---

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role')
        .isIn(['student', 'teacher', 'accountant', 'admin']).withMessage('Invalid user role'),
];

const loginValidation = [
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// You can add more validation chains here for other features, e.g., createClassValidation
const createClassValidation = [
    body('name').trim().notEmpty().withMessage('Class name is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('teacherId').isUUID().withMessage('A valid teacher ID is required'), // Assuming CUIDs are UUID-like
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    createClassValidation,
    // ... export other validation chains as you create them
};