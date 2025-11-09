const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Get all system settings
// @route   GET /api/settings
// @access  Private/Admin
const getSystemSettings = asyncHandler(async (req, res) => {
    const settingsList = await prisma.systemSetting.findMany();

    // Convert the array of key-value pairs into a single settings object
    const settingsObject = settingsList.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
    }, {});
    
    // If no settings are in the DB, you might want to return a default object
    // to match the frontend's expected structure.
    const defaultSettings = {
        siteName: 'EduVersePro',
        siteDescription: 'Advanced Student Management System',
        maintenanceMode: false,
        allowRegistration: true,
        features: {
            onlineExams: true,
            attendanceTracking: true,
            feeManagement: true,
            onlineClasses: true,
            notifications: true
        },
        academicYear: '2024-2025',
        semester: 'Fall'
    };

    res.json({ ...defaultSettings, ...settingsObject });
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSystemSettings = asyncHandler(async (req, res) => {
    const settingsData = req.body;

    // Use a transaction to perform all updates together
    const updateOperations = Object.keys(settingsData).map(key => {
        return prisma.systemSetting.upsert({
            where: { key: key },
            update: { value: settingsData[key] },
            create: { key: key, value: settingsData[key] },
        });
    });

    await prisma.$transaction(updateOperations);

    res.json({ message: 'Settings updated successfully' });
});

module.exports = {
    getSystemSettings,
    updateSystemSettings,
};