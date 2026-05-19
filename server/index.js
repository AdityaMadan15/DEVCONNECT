import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import projectRoutes from './routes/project.routes.js';
import userRoutes from './routes/user.routes.js';
import requestRoutes from './routes/request.routes.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import Message from './models/Message.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Socket.IO auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  if (!process.env.JWT_SECRET) {
    return next(new Error('Authentication error: JWT_SECRET not configured'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} (user: ${socket.user?.id})`);

  socket.on('join-room', (projectId) => {
    socket.join(projectId);
    console.log(`Socket ${socket.id} joined room: ${projectId}`);
  });

  socket.on('send-message', async ({ projectId, text, file }) => {
    try {
      if (!projectId) return;
      if (!text?.trim() && !file) return; // must have text or file

      const message = await Message.create({
        projectId,
        sender: socket.user.id,
        text: text?.trim() || '',
        file: file || undefined,
      });

      const populated = await message.populate('sender', 'name email avatar');
      io.to(projectId).emit('new-message', populated);
    } catch (err) {
      console.error('Socket send-message error:', err);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  socket.on('delete-message', async ({ messageId, type, projectId }) => {
    try {
      if (!messageId || !type || !projectId) return;

      const message = await Message.findById(messageId);
      if (!message) return;

      if (type === 'everyone') {
        // Only sender can delete for everyone
        if (message.sender.toString() !== socket.user.id) {
          socket.emit('message-error', { error: 'Not authorized to delete for everyone' });
          return;
        }
        message.deletedForEveryone = true;
        message.text = '';
        message.file = undefined;
      } else if (type === 'me') {
        // Add user to deletedFor array
        if (!message.deletedFor.includes(socket.user.id)) {
          message.deletedFor.push(socket.user.id);
        }
      }

      await message.save();
      const populated = await message.populate('sender', 'name email avatar');
      io.to(projectId).emit('message-updated', populated);
    } catch (err) {
      console.error('Socket delete-message error:', err);
      socket.emit('message-error', { error: 'Failed to delete message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (only /api/ prefixed — no duplicates)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal Server Error',
  });
});

// Serve frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
