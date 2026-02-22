const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Initialize database
require('./config/db');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/forum', require('./routes/forum'));

// Socket.io for real-time messaging
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('user-online', (userId) => {
        connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} is online`);
    });

    socket.on('send-message', (data) => {
        const recipientSocketId = connectedUsers.get(data.recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('new-message', data);
        }
    });

    socket.on('disconnect', () => {
        // Remove user from connected users
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   Community Website Backend Server       ║
║   Running on http://localhost:${PORT}      ║
║   Database: SQLite                        ║
║   WebSocket: Enabled                      ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
