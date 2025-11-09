const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    createUser, 
    getUserById, 
    updateUser, 
    deleteUser 
} = require('../controllers/user.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All routes starting with /api/users are protected
router.use(protect);

// Admin-only routes
router.route('/')
    .get(checkRole(['admin']), getAllUsers)
    .post(checkRole(['admin']), createUser);

router.route('/:id')
    .get(checkRole(['admin']), getUserById)
    .delete(checkRole(['admin']), deleteUser);

// This route is special: Admins can update anyone, but users can also update their own profile.
// The authorization logic is handled inside the controller.
router.put('/:id', updateUser);


module.exports = router;
