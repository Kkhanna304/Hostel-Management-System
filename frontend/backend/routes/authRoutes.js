const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');


const { registerUser, loginUser } = require('../controllers/authController');

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);
router.get('/profile', protect, (req, res) => {
    res.json({
        message: 'Protected route accessed',
        user: req.user
    });
});
router.get('/admin', protect, authorizeRoles('admin'), (req, res) => {
    res.json({
        message: 'Welcome Admin 🎯'
    });
});


module.exports = router;