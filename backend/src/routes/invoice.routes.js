const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices } = require('../controllers/invoice.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All invoice routes are protected
router.use(protect);

router.route('/')
    .get(getInvoices) // Controller handles role-based access
    .post(checkRole(['admin', 'accountant']), createInvoice);

module.exports = router;