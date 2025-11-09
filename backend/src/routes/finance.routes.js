const express = require('express');
const router = express.Router();
const { getFinancialDashboardStats } = require('../controllers/finance.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All finance routes are protected
router.use(protect);

// This is for the summary data shown on Admin and Accountant dashboards
router.get('/dashboard-stats', checkRole(['admin', 'accountant']), getFinancialDashboardStats);

module.exports = router;