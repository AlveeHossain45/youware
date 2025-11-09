const express = require('express');
const router = express.Router();
const { recordPayment } = require('../controllers/payment.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All payment routes are protected
router.use(protect);

router.route('/')
    .post(checkRole(['admin', 'accountant']), recordPayment);

module.exports = router;