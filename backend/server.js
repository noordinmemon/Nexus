if (!globalThis.crypto) {
    globalThis.crypto = require('node:crypto').webcrypto;
}

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/meetings', require('./routes/meetings'));

app.get('/', (req, res) => {
    res.json({ message: 'Nexus Backend Running' });
});

// Socket.IO — Video Call Signaling
const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push({ socketId: socket.id, userId });

        // Tell others in room that someone joined
        socket.to(roomId).emit('user-joined', socket.id, userId);

        console.log(`User ${userId} joined room ${roomId}`);
    });

    // Handle WebRTC offer
    socket.on('offer', (offer, roomId) => {
        socket.to(roomId).emit('offer', offer, socket.id);
    });

    // Handle WebRTC answer
    socket.on('answer', (answer, socketId) => {
        io.to(socketId).emit('answer', answer);
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (candidate, roomId) => {
        socket.to(roomId).emit('ice-candidate', candidate);
    });

    // Toggle audio/video
    socket.on('toggle-audio', (roomId, enabled) => {
        socket.to(roomId).emit('user-toggle-audio', socket.id, enabled);
    });

    socket.on('toggle-video', (roomId, enabled) => {
        socket.to(roomId).emit('user-toggle-video', socket.id, enabled);
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
        socket.to(roomId).emit('user-left', socket.id);
        socket.leave(roomId);

        if (rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        Object.keys(rooms).forEach(roomId => {
            if (rooms[roomId]) {
                const wasInRoom = rooms[roomId].some(u => u.socketId === socket.id);
                if (wasInRoom) {
                    socket.to(roomId).emit('user-left', socket.id);
                    rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
                }
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});