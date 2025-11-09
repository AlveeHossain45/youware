const express = require('express');
const router = express.Router();
const { 
    getAllClasses, 
    createClass, 
    updateClass, 
    deleteClass 
} = require('../controllers/class.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All class routes are protected
router.use(protect);

router.route('/')
    .get(getAllClasses) // Controller handles role-based filtering
    .post(checkRole(['admin']), createClass);

router.route('/:id')
    // A simple GET for a single class can be open to all authenticated users
    // If you want more granular control, add it here.
    .put(checkRole(['admin']), updateClass)
    .delete(checkRole(['admin']), deleteClass);

module.exports = router;
