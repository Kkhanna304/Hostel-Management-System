const Room = require('../models/Room');
const User = require('../models/User');
const RoomRequest = require('../models/RoomRequest');

const assignStudent = async (roomId, studentId) => {
    const room = await Room.findById(roomId);
    const student = await User.findById(studentId);

    if (!room || !student) {
        const error = new Error('Room or Student not found');
        error.statusCode = 404;
        throw error;
    }

    if (student.role !== 'student') {
        const error = new Error('Only students can be assigned to rooms');
        error.statusCode = 400;
        throw error;
    }

    const existingRoom = await Room.findOne({ occupants: studentId });

    if (existingRoom) {
        const error = new Error('Student is already assigned to another room');
        error.statusCode = 400;
        throw error;
    }

    if (room.occupants.length >= room.capacity) {
        const error = new Error('Room is full');
        error.statusCode = 400;
        throw error;
    }

    if (room.occupants.includes(studentId)) {
        const error = new Error('Student already assigned');
        error.statusCode = 400;
        throw error;
    }

    room.occupants.push(studentId);
    await room.save();

    return room;
};

// Create Room (Admin Only)
const createRoom = async (req, res) => {
    try {
        const { roomNumber, capacity } = req.body;

        const roomExists = await Room.findOne({ roomNumber });

        if (roomExists) {
            return res.status(400).json({ message: 'Room already exists' });
        }

        const room = await Room.create({
            roomNumber,
            capacity
        });

        res.status(201).json({
            message: 'Room created successfully',
            room
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('occupants', 'name email');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign Student to Room (Admin Only)
const assignStudentToRoom = async (req, res) => {
    try {
        const { roomId, studentId } = req.body;
        const room = await assignStudent(roomId, studentId);

        res.json({
            message: 'Student assigned to room successfully',
            room
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// Remove Student from Room (Admin Only)
const removeStudentFromRoom = async (req, res) => {
    try {
        const { roomId, studentId } = req.body;

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.occupants.length === 0) {
            return res.status(400).json({
                message: 'Room is already empty'
            });
        }

        if (!room.occupants.includes(studentId)) {
            return res.status(400).json({
                message: 'Student is not in this room'
            });
        }

        room.occupants = room.occupants.filter(
            (id) => id.toString() !== studentId
        );

        await room.save();

        res.json({
            message: 'Student removed from room successfully',
            room
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Room (Admin Only)
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.occupants.length > 0) {
            return res.status(400).json({ message: 'Remove all students before deleting this room' });
        }

        await room.deleteOne();

        res.json({ message: 'Room deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Room Request (Student)
const createRoomRequest = async (req, res) => {
    try {
        const { roomId, reason = '' } = req.body;

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const existingRoom = await Room.findOne({ occupants: req.user.id });

        if (existingRoom) {
            return res.status(400).json({ message: 'You are already assigned to a room' });
        }

        if (room.occupants.length >= room.capacity) {
            return res.status(400).json({ message: 'Room is full' });
        }

        const existingRequest = await RoomRequest.findOne({
            student: req.user.id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending room request' });
        }

        const roomRequest = await RoomRequest.create({
            student: req.user.id,
            room: roomId,
            reason
        });

        const populatedRequest = await RoomRequest.findById(roomRequest._id)
            .populate('student', 'name email')
            .populate('room', 'roomNumber capacity');

        res.status(201).json({
            message: 'Room request submitted successfully',
            roomRequest: populatedRequest
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get My Room Requests (Student)
const getMyRoomRequests = async (req, res) => {
    try {
        const roomRequests = await RoomRequest.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .populate('room', 'roomNumber capacity')
            .populate('reviewedBy', 'name email');

        res.json(roomRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Room Requests (Admin)
const getAllRoomRequests = async (req, res) => {
    try {
        const roomRequests = await RoomRequest.find()
            .sort({ createdAt: -1 })
            .populate('student', 'name email')
            .populate('room', 'roomNumber capacity occupants')
            .populate('reviewedBy', 'name email');

        res.json(roomRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Review Room Request (Admin)
const reviewRoomRequest = async (req, res) => {
    try {
        const { status, adminNote = '' } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use approved or rejected' });
        }

        const roomRequest = await RoomRequest.findById(req.params.id);

        if (!roomRequest) {
            return res.status(404).json({ message: 'Room request not found' });
        }

        if (roomRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Room request is already reviewed' });
        }

        if (status === 'approved') {
            await assignStudent(roomRequest.room, roomRequest.student);
        }

        roomRequest.status = status;
        roomRequest.adminNote = adminNote;
        roomRequest.reviewedBy = req.user.id;
        roomRequest.reviewedAt = new Date();
        await roomRequest.save();

        const updatedRequest = await RoomRequest.findById(roomRequest._id)
            .populate('student', 'name email')
            .populate('room', 'roomNumber capacity occupants')
            .populate('reviewedBy', 'name email');

        res.json({
            message: `Room request ${status}`,
            roomRequest: updatedRequest
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = {
    createRoom,
    getRooms,
    assignStudentToRoom,
    removeStudentFromRoom,
    deleteRoom,
    createRoomRequest,
    getMyRoomRequests,
    getAllRoomRequests,
    reviewRoomRequest
};
