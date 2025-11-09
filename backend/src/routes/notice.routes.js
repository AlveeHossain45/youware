const express = require('express');
const router = express.Router();
const { 
    createNotice, 
    getNotices, 
    updateNotice, 
    deleteNotice 
} = require('../controllers/notice.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All notice routes are protected
router.use(protect);

router.route('/')
    .get(getNotices) // Controller handles role-based visibility
    .post(checkRole(['admin', 'teacher']), createNotice);

router.route('/:id')
    .put(checkRole(['admin', 'teacher']), updateNotice) // Controller checks for ownership
    .delete(checkRole(['admin', 'teacher']), deleteNotice); // Controller checks for ownership

module.exports = router;