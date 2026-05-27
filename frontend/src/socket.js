// src/socket.js
// Drop this file into your frontend/src/ folder
// Import it wherever you need real-time features

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ;

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],  // websocket first, fallback to polling
  withCredentials: true,                  // required — matches server credentials:true
  autoConnect: false,                     // connect manually on login
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Debug events in development only
if (import.meta.env.DEV) {
  socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('❌ Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));
}

export default socket;
