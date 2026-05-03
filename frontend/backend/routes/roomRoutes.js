const express = require('express');
const router = express.Router();

const {
    createRoom,
    getRooms,
    assignStudentToRoom,
    removeStudentFromRoom,
    deleteRoom,
    createRoomRequest,
    getMyRoomRequests,
    getAllRoomRequests,
    reviewRoomRequest
} = require('../controllers/roomController');

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/requests', protect, authorizeRoles('student'), createRoomRequest);
router.get('/requests/my', protect, authorizeRoles('student'), getMyRoomRequests);
router.get('/requests', protect, authorizeRoles('admin'), getAllRoomRequests);
router.put('/requests/:id', protect, authorizeRoles('admin'), reviewRoomRequest);

router.post('/', protect, authorizeRoles('admin'), createRoom);
router.get('/', protect, getRooms);
router.post('/assign', protect, authorizeRoles('admin'), assignStudentToRoom);
router.post('/remove', protect, authorizeRoles('admin'), removeStudentFromRoom);
router.delete('/:id', protect, authorizeRoles('admin'), deleteRoom);

module.exports = router;
