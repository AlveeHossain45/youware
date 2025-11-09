const express = require('express');
const router = express.Router();
const { getSystemSettings, updateSystemSettings } = require('../controllers/settings.controller');
const { protect, checkRole } = require('../middleware/auth.middleware');

// All system settings routes are protected and admin-only
router.use(protect, checkRole(['admin']));

router.route('/')
    .get(getSystemSettings)
    .put(updateSystemSettings);

module.exports = router;
