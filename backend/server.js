import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ── ALLOWED ORIGINS ───────────────────────────────────────────────────────────
// Add your Render frontend URL to FRONTEND_URL env var in Render dashboard
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,                    // e.g. https://collab-frontend.onrender.com
  process.env.FRONTEND_URL_2,                  // optional second origin
  'https://collab-backend-chdh.onrender.com',
].filter(Boolean);

// ── HTTPS REDIRECT (Render handles TLS, but this ensures no HTTP leaks) ───────
app.use((req, res, next) => {
  if (
    req.headers['x-forwarded-proto'] &&
    req.headers['x-forwarded-proto'] !== 'https' &&
    process.env.NODE_ENV === 'production'
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// ── CORS (Express) ────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    console.warn(`⚠️  CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight for all routes
app.options('*', cors());

// ── BODY PARSER ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── HEALTH CHECK (Render pings this to check if service is alive) ─────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'COLLAB Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: dbStatus[dbState] || 'unknown',
    uptime: process.uptime(),
  });
});

// ── API ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ── 404 HANDLER ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  if (err.message?.startsWith('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── SOCKET.IO (must share same CORS config as Express) ───────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  // Required for Render: allow upgrades through reverse proxy
  allowEIO3: true,
});

// ── SOCKET EVENTS ─────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join a project room for real-time updates
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`   ↳ ${socket.id} joined project room: ${projectId}`);
  });

  // Leave a project room
  socket.on('leave-project', (projectId) => {
    socket.leave(projectId);
  });

  // Broadcast project updates to everyone in room EXCEPT sender
  socket.on('project-update', (data) => {
    socket.to(data.projectId).emit('project-updated', data);
  });

  // Send message to a chat room (broadcast to ALL including sender)
  socket.on('send-message', (data) => {
    io.to(data.room).emit('receive-message', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.room).emit('user-typing', {
      userId: data.userId,
      username: data.username,
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.room).emit('user-stopped-typing', { userId: data.userId });
  });

  socket.on('disconnect', (reason) => {
    console.log(`❌ Socket disconnected: ${socket.id} (${reason})`);
  });
});

// Export io so routes can use it for real-time pushes
export { io };

// ── MONGODB CONNECTION ────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error('\n❌  MONGO_URI is not set in your environment!');
  console.error('    Go to Render Dashboard → your backend service → Environment');
  console.error('    Add: MONGO_URI = mongodb+srv://<user>:<pass>@cluster.mongodb.net/collabdb\n');
  process.exit(1);
}

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,   // 10s timeout for cold starts
  socketTimeoutMS: 45000,
  maxPoolSize: 10,                   // limit connections for free tier
  minPoolSize: 1,
  retryWrites: true,
  retryReads: true,
};

mongoose
  .connect(MONGO_URI, mongoOptions)
  .then(() => {
    console.log('✅  MongoDB Atlas connected');
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀  COLLAB backend running on port ${PORT}`);
      console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`    Allowed CORS: ${ALLOWED_ORIGINS.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  httpServer.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
