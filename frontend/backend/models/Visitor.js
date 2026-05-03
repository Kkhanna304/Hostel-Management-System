const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visitorName: {
        type: String,
        required: true
    },
    relation: {
        type: String,
        required: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    visitorId: {
        type: String,
        unique: true,
        sparse: true
    },
    idCardExpiresAt: {
        type: Date
    },
    adminNote: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visitor', visitorSchema);
