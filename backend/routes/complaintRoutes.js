const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
} = require('../controllers/complaintController');

// Student → Create complaint
router.post('/', protect, authorizeRoles('student'), createComplaint);

// Student → View own complaints
router.get('/my', protect, authorizeRoles('student'), getMyComplaints);

// Admin → View all complaints
router.get('/', protect, authorizeRoles('admin'), getAllComplaints);

// Admin → Update complaint status
router.put('/:id', protect, authorizeRoles('admin'), updateComplaintStatus);

module.exports = router;