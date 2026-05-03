const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Leave = require('../models/Leave');
const Visitor = require('../models/Visitor');
const RoomRequest = require('../models/RoomRequest');

const getDashboardStats = async (req, res) => {
    try {
        // Total Students
        const totalStudents = await User.countDocuments({ role: 'student' });

        // Total Rooms
        const totalRooms = await Room.countDocuments();

        // Occupied Rooms
        const occupiedRooms = await Room.countDocuments({
            occupants: { $exists: true, $not: { $size: 0 } }
        });
        const availableRooms = totalRooms - occupiedRooms;

        // Complaints
        const totalComplaints = await Complaint.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
        const inProgressComplaints = await Complaint.countDocuments({ status: 'in_progress' });

        // Revenue
        const payments = await Payment.find({ status: 'paid' });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount + (p.lateFee || 0), 0);
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
        const pendingVisitors = await Visitor.countDocuments({ status: 'pending' });
        const pendingRoomRequests = await RoomRequest.countDocuments({ status: 'pending' });
        const unassignedStudents = await User.countDocuments({
            role: 'student',
            _id: { $nin: await Room.distinct('occupants') }
        });

        const recentPayments = await Payment.find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('student', 'name email');

        const recentComplaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('student', 'name email');

        res.json({
            totalStudents,
            totalRooms,
            occupiedRooms,
            availableRooms,
            unassignedStudents,
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            pendingPayments,
            pendingLeaves,
            pendingVisitors,
            pendingRoomRequests,
            recentPayments,
            recentComplaints,
            totalRevenue
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};
