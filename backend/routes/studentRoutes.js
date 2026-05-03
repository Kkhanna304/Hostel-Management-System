const express = require('express');
const router = express.Router();
const authorizeRoles = require('../middleware/roleMiddleware');

const protect = require('../middleware/authMiddleware');

const { 
    getProfile, 
    updateProfile, 
    getAllStudents, 
    deleteStudent 
} = require('../controllers/studentController');
// Get Profile (Protected)
router.get('/profile', protect, getProfile);

// Update Profile (Protected)
router.put('/profile', protect, updateProfile);
// Admin - Get all students
router.get('/', protect, authorizeRoles('admin'), getAllStudents);

// Admin - Delete student
router.delete('/:id', protect, authorizeRoles('admin'), deleteStudent);

module.exports = router;