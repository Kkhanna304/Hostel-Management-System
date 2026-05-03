require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
// Test route
app.get('/', (req, res) => {
    res.send('🚀 Hostel Management Backend Running');
});
app.use('/api/complaints', complaintRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
