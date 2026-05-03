const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
    makePayment,
    getMyPayments,
    getAllPayments,
    updatePaymentStatus,
    downloadReceipt
} = require('../controllers/paymentController');

// Student → Make payment
router.post('/', protect, authorizeRoles('admin'), makePayment);
router.put('/:id/status', protect, authorizeRoles('admin'), updatePaymentStatus);
router.get('/:id/receipt', protect, downloadReceipt);
// Student → View own payments
router.get('/my', protect, authorizeRoles('student'), getMyPayments);

// Admin → View all payments
router.get('/', protect, authorizeRoles('admin'), getAllPayments);

module.exports = router;
