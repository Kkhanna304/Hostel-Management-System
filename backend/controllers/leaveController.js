const Leave = require('../models/Leave');

// Apply Leave (Student)
const applyLeave = async (req, res) => {
    try {
        const { fromDate, toDate, reason } = req.body;

        const leave = await Leave.create({
            student: req.user.id,
            fromDate,
            toDate,
            reason
        });

        res.status(201).json({
            message: 'Leave applied successfully',
            leave
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get My Leaves (Student)
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'name email');

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Leaves (Admin)
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .sort({ createdAt: -1 })
            .populate('student', 'name email')
            .populate('reviewedBy', 'name email');

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Leave Status (Admin)
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote = '' } = req.body;

        const leave = await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Use approved or rejected'
            });
        }

        leave.status = status;
        leave.adminNote = adminNote;
        leave.reviewedBy = req.user.id;
        leave.reviewedAt = new Date();
        await leave.save();

        const updatedLeave = await Leave.findById(leave._id)
            .populate('student', 'name email')
            .populate('reviewedBy', 'name email');

        res.json({
            message: `Leave ${status}`,
            leave: updatedLeave
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};
