/**
 * EventSphere Management System — Backend Server
 * ================================================
 * Tech stack: Node.js · Express · MongoDB (Mongoose) · Socket.IO · JWT
 *
 * Updated: added reviews, notifications routes + push helper
 */

const express  = require('express');
const http     = require('http');
const socketIo = require('socket.io');
const cors     = require('cors');
const dotenv   = require('dotenv');

const connectDB    = require('./config/db');
const authRoutes   = require('./routes/auth');
const adminRoutes  = require('./routes/admin');
const exhibitorRoutes = require('./routes/exhibitor');
const attendeeRoutes  = require('./routes/attendee');
const { expoRouter, messageRouter } = require('./routes/expo');
const { reviewRouter, notifRouter } = require('./routes/notifications');   // 🆕

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => { req.io = io; next(); });

/* ─── Routes ─── */
app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/exhibitor',     exhibitorRoutes);
app.use('/api/attendee',      attendeeRoutes);
app.use('/api/expo',          expoRouter);
app.use('/api/messages',      messageRouter);
app.use('/api/reviews',       reviewRouter);      // 🆕
app.use('/api/notifications', notifRouter);       // 🆕

app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', message: '🚀 EventSphere API running', timestamp: new Date() })
);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, _req, res, _next) =>
  res.status(500).json({ success: false, message: err.message })
);

/* ─── Socket.IO Events ─── */
io.on('connection', (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);
  socket.on('join-expo',  (id) => socket.join(`expo-${id}`));
  socket.on('join-user',  (id) => socket.join(`user-${id}`));
  socket.on('leave-expo', (id) => socket.leave(`expo-${id}`));
  socket.on('disconnect', ()  => console.log(`🔌 Disconnected: ${socket.id}`));
});

/* 🆕 Helper function to create and send real‑time notifications */
const pushNotification = async (userId, type, message, link = '') => {
  try {
    const Notification = require('./models/Notification');
    const notif = await Notification.create({ user: userId, type, message, link });
    io.to(`user-${userId}`).emit('notification', notif);
  } catch (err) {
    // Silently fail – notification is non‑critical
  }
};
global.pushNotification = pushNotification;   // accessible in any controller

/* ─── Start Server ─── */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`\n✅  EventSphere server → http://localhost:${PORT}\n`)
);

module.exports = { io };