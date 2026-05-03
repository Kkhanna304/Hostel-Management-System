const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feeType: {
        type: String,
        enum: ['monthly_hostel', 'mess', 'fine', 'other'],
        default: 'monthly_hostel'
    },
    amount: {
        type: Number,
        required: true
    },
    lateFee: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
