import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_BASE_URL || 'https://uniq-backend-ggg1.onrender.com';
const socket = io(socketUrl, {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
