const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { getDashboardStats } = require('../controllers/dashboardController');

// Admin → Get dashboard stats
router.get('/', protect, authorizeRoles('admin'), getDashboardStats);

module.exports = router;