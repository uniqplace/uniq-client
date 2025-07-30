import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL;
const socket = io(socketUrl, {
  withCredentials: true,
  transports: ['websocket'],
  path: import.meta.env.VITE_SOCKET_PATH || '/api/socket.io'
});

export default socket;
