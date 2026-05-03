const Complaint = require('../models/Complaint');

// Create Complaint (Student)
const createComplaint = async (req, res) => {
    try {
        const { message } = req.body;

        const complaint = await Complaint.create({
            student: req.user.id,
            message
        });

        res.status(201).json({
            message: 'Complaint submitted successfully',
            complaint
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get My Complaints (Student)
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'name email');

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Complaints (Admin)
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .populate('student', 'name email')
            .populate('reviewedBy', 'name email');

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Complaint Status (Admin)
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status = 'resolved', adminNote = '' } = req.body;

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (!['pending', 'in_progress', 'resolved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status'
            });
        }

        complaint.status = status;
        complaint.adminNote = adminNote;
        complaint.reviewedBy = req.user.id;
        complaint.reviewedAt = new Date();
        await complaint.save();

        const updatedComplaint = await Complaint.findById(complaint._id)
            .populate('student', 'name email')
            .populate('reviewedBy', 'name email');

        res.json({
            message: `Complaint ${status}`,
            complaint: updatedComplaint
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
};
