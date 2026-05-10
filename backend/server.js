const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// ── Allowed origins ──────────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] }
});

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── Catch-all 404 ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Socket.IO ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join-project',  (projectId) => socket.join(projectId));
  socket.on('project-update',(data) => socket.to(data.projectId).emit('project-updated', data));
  socket.on('send-message',  (data) => io.to(data.room).emit('receive-message', data));
  socket.on('disconnect',    () => console.log('Socket disconnected:', socket.id));
});

// ── MongoDB Connection ────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
const PORT      = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error('\n❌  MONGO_URI is not set in your .env file!');
  console.error('    Create backend/.env and add:');
  console.error('    MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/collabdb\n');
  process.exit(1);
}

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,  // 10 s timeout
  socketTimeoutMS: 45000,
  family: 4                         // Force IPv4 (fixes many Atlas issues on Windows)
};

function connectWithRetry(retries = 5, delay = 3000) {
  console.log(`\n🔄  Connecting to MongoDB... (attempt ${6 - retries}/5)`);

  mongoose.connect(MONGO_URI, mongoOptions)
    .then(() => {
      console.log('✅  MongoDB connected successfully');
      server.listen(PORT, () => {
        console.log(`🚀  Server running at http://localhost:${PORT}`);
        console.log(`📡  Socket.IO ready`);
        console.log(`❤️   Health: http://localhost:${PORT}/health\n`);
      });
    })
    .catch((err) => {
      console.error(`\n❌  MongoDB connection failed: ${err.message}`);

      // Helpful hints based on error type
      if (err.message.includes('ECONNREFUSED')) {
        console.error('   → Local MongoDB is not running. Start it with: mongod');
        console.error('   → Or switch to MongoDB Atlas (see .env.example)\n');
      } else if (err.message.includes('Authentication failed') || err.message.includes('bad auth')) {
        console.error('   → Wrong username or password in MONGO_URI');
        console.error('   → Check your Atlas credentials in .env\n');
      } else if (err.message.includes('ETIMEOUT') || err.message.includes('timed out')) {
        console.error('   → Network timeout – check your internet connection');
        console.error('   → Make sure your IP is whitelisted in Atlas → Network Access\n');
      } else if (err.message.includes('whitelist') || err.message.includes('IP')) {
        console.error('   → Your IP is not whitelisted in MongoDB Atlas');
        console.error('   → Go to Atlas → Security → Network Access → Add 0.0.0.0/0\n');
      }

      if (retries > 0) {
        console.log(`   Retrying in ${delay / 1000}s... (${retries} attempts left)\n`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      } else {
        console.error('❌  All retries exhausted. Please fix the connection and restart.\n');
        process.exit(1);
      }
    });
}

// Handle disconnection after initial connect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected – attempting reconnect...');
  setTimeout(() => connectWithRetry(3, 5000), 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});

connectWithRetry();

module.exports = { app, io };
