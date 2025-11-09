const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

/**
 * @desc Middleware to protect routes by verifying JWT.
 * It decodes the token, finds the user in the database, and attaches the user object to the request.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header: "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verify token signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token's ID and attach to request object
            // SECURITY: Exclude the password hash from being attached to the request
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                },
            });
            
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next(); // Proceed to the next middleware or controller
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }
});

/**
 * @desc Middleware factory to check if the logged-in user has one of the required roles.
 * @param {Array<string>} roles - An array of roles that are allowed to access the route.
 * @example router.get('/', protect, checkRole(['admin', 'teacher']), controllerFunction);
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403); // 403 Forbidden is more appropriate than 401 Unauthorized here
            throw new Error(`Forbidden: You must have one of the following roles to access this resource: ${roles.join(', ')}`);
        }
        next();
    };
};

module.exports = { protect, checkRole };