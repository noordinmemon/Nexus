if (!globalThis.crypto) {
    globalThis.crypto = require('node:crypto').webcrypto;
}

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

// Initialize configuration
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Global Middleware Array Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Native Mongo Sanitizer Middleware (Replaces express-mongo-sanitize)
const sanitizeData = (obj) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            if (key.startsWith('$')) { // Target operators like $gt, $gte, etc.
                delete obj[key];
            } else if (obj[key] instanceof Object) {
                sanitizeData(obj[key]); // Recursively sanitize nested objects
            }
        }
    }
    return obj;
};

const customMongoSanitize = (req, res, next) => {
    if (req.body) sanitizeData(req.body);
    if (req.params) sanitizeData(req.params);
    // Safely check query property to prevent getter errors
    const hasQueryDescriptor = Object.getOwnPropertyDescriptor(req, 'query');
    if (req.query && (!hasQueryDescriptor || hasQueryDescriptor.writable || hasQueryDescriptor.set)) {
        sanitizeData(req.query);
    }
    next();
};

// Security Rate Limiting 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes 
    max: 100,
    message: { message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many login attempts, please try again later' }
});

// Apply Custom Sanitizer and Rate Limiters explicitly to API routes
app.use('/api', customMongoSanitize);
app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/transactions', require('./routes/transactions'));

app.get('/', (req, res) => {
    res.json({ message: 'Nexus Backend Running' });
});

// Socket.IO Setup with explicit routing targets
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        rooms[roomId].push({ socketId: socket.id, userId });
        socket.to(roomId).emit('user-joined', { socketId: socket.id, userId });
    });

    socket.on('offer', (payload) => {
        io.to(payload.targetSocketId).emit('offer', {
            offer: payload.offer,
            senderSocketId: socket.id
        });
    });

    socket.on('answer', (payload) => {
        io.to(payload.targetSocketId).emit('answer', {
            answer: payload.answer,
            senderSocketId: socket.id
        });
    });

    socket.on('ice-candidate', (payload) => {
        io.to(payload.targetSocketId).emit('ice-candidate', {
            candidate: payload.candidate,
            senderSocketId: socket.id
        });
    });

    socket.on('toggle-audio', (roomId, enabled) => {
        socket.to(roomId).emit('user-toggle-audio', socket.id, enabled);
    });

    socket.on('toggle-video', (roomId, enabled) => {
        socket.to(roomId).emit('user-toggle-video', socket.id, enabled);
    });

    socket.on('leave-room', (roomId) => {
        handleDisconnectCleanup(socket, roomId);
    });

    socket.on('disconnect', () => {
        Object.keys(rooms).forEach(roomId => {
            handleDisconnectCleanup(socket, roomId);
        });
        console.log('User disconnected:', socket.id);
    });
});

function handleDisconnectCleanup(socket, roomId) {
    if (rooms[roomId]) {
        const wasInRoom = rooms[roomId].some(u => u.socketId === socket.id);
        if (wasInRoom) {
            socket.to(roomId).emit('user-left', socket.id);
            rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);

            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            }
        }
        socket.leave(roomId);
    }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
