const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
} = require('../controllers/leaveController');

// Student → Apply leave
router.post('/', protect, authorizeRoles('student'), applyLeave);

// Student → View own leaves
router.get('/my', protect, authorizeRoles('student'), getMyLeaves);

// Admin → View all leaves
router.get('/', protect, authorizeRoles('admin'), getAllLeaves);

// Admin → Approve / Reject leave
router.put('/:id', protect, authorizeRoles('admin'), updateLeaveStatus);

module.exports = router;
