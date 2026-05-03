const User = require('../models/User');

// Get Student Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Student Profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();
            const safeUser = await User.findById(updatedUser._id).select('-password');

            res.json({
                message: 'Profile updated',
                user: safeUser
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get All Students (Admin Only)
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Student (Admin Only)
const deleteStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.deleteOne();

        res.json({ message: 'Student removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getProfile,
    updateProfile,
    getAllStudents,
    deleteStudent
};
