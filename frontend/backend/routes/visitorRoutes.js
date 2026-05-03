const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
    createVisitor,
    getMyVisitors,
    getAllVisitors,
    updateVisitorStatus,
    downloadVisitorIdCard
} = require('../controllers/visitorController');

// Student → Create visitor request
router.post('/', protect, authorizeRoles('student'), createVisitor);

// Student → View own visitors
router.get('/my', protect, authorizeRoles('student'), getMyVisitors);

// Admin → View all visitor requests
router.get('/', protect, authorizeRoles('admin'), getAllVisitors);

router.get('/:id/id-card', protect, authorizeRoles('student', 'admin'), downloadVisitorIdCard);

// Admin → Approve / Reject visitor
router.put('/:id', protect, authorizeRoles('admin'), updateVisitorStatus);

module.exports = router;
