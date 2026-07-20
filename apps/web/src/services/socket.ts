import { io, Socket } from 'socket.io-client';
import { getItem } from '@/lib/utils';

let socket: Socket | null = null;

/**
 * Initialize socket connection with JWT token
 * @param token JWT access token
 */
export const initSocket = (token: string) => {
  // Disconnect existing socket if any
  if (socket) {
    disconnectSocket();
  }

  const isProduction = import.meta.env.PROD;
  const url = isProduction
    ? import.meta.env.VITE_APP_URL
    : import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

  socket = io(url, {
    auth: {
      token: token
    },
    transports: ['websocket']
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect socket and clean up
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { socket, initSocket, getSocket, disconnectSocket };