const express = require('express');
const router = express.Router();
const { getAvailableReports, generateReport } = require('../controllers/report.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All report routes are protected
router.use(protect);

// Allow Admins and Accountants to access reports
router.use(checkRole(['admin', 'accountant']));

router.get('/', getAvailableReports);
router.get('/:type', generateReport);

module.exports = router;
