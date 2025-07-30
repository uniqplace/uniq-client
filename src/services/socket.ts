import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const socketUrl = import.meta.env.VITE_SOCKET_URL;

export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
      path: import.meta.env.VITE_SOCKET_PATH || '/socket.io'
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// For backward compatibility
const defaultSocket = {
  on: (event: string, callback: any) => {
    if (socket) {
      socket.on(event, callback);
    }
  },
  off: (event: string, callback?: any) => {
    if (socket) {
      socket.off(event, callback);
    }
  },
  emit: (event: string, data?: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  },
  disconnect: () => {
    disconnectSocket();
  }
};

export default defaultSocket;
