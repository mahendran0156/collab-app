import { io } from 'socket.io-client'  // ← explicit import required

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL 
  || 'https://collab-backend-98o3.onrender.com'

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

export default socket
