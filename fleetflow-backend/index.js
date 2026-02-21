const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/vehicles', require('./routes/vehicles'));
app.use('/drivers', require('./routes/drivers'));
app.use('/trips', require('./routes/trips'));
app.use('/maintenance', require('./routes/maintenance'));
app.use('/fuel', require('./routes/fuel'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/analytics', require('./routes/analytics'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 FleetFlow API running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready for real-time connections`);
});
