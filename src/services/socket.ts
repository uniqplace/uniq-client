// services/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const socketUrl = import.meta.env.VITE_SOCKET_URL;

export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
      path: import.meta.env.VITE_SOCKET_PATH || '/socket.io',
    });
 // DEBUG: connection and error listeners
    socket.on('connect', () => {
      console.log('[socket] connected', socket?.id);
    });
    socket.on('connect_error', (err) => {
      console.error('[socket] connect_error', err.message, err);
    });
    socket.on('error', (err) => {
      console.error('[socket] error', err);
    });
    socket.on('disconnect', (reason) => {
      console.warn('[socket] disconnect', reason);
    });
    socket.on('reconnect', (attempt) => {
      console.log('[socket] reconnect', attempt);
    });
  }
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { socket?.disconnect(); socket = null; };

export default {
  on: (event: string, callback: (...args: unknown[]) => void) => socket?.on(event, callback),
  off: (event: string, callback?: (...args: unknown[]) => void) => socket?.off(event, callback),
  emit: (event: string, data?: unknown) => socket?.emit(event, data),
  disconnect: disconnectSocket,
};
