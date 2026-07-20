import { io, Socket } from 'socket.io-client';
import { getItem } from '@/lib/utils';

let socket: Socket | null = null;

/**
 * Initialize the Socket.IO connection for conversation features
 * @param token - JWT token for authentication
 * @returns Socket instance
 */
export const initConversationSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:5000', {
    auth: {
      token: token
    }
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getConversationSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectConversationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a conversation room
 * @param conversationId - ID of the conversation to join
 */
export const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('join_conversation', conversationId);
  }
};

/**
 * Leave a conversation room
 * @param conversationId - ID of the conversation to leave
 */
export const leaveConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('leave_conversation', conversationId);
  }
};

/**
 * Send a message via socket
 * @param data - Message data (conversationId, content, content,
 type
) => {
  if (socket) {
    socket.emit('message:send', data);
  }
};

/**
 * Emit typing start event
 * @param conversationId - ID of the conversation
 */
export const typingStart = (conversationId: string) => {
  if (socket) {
    socket.emit('typing_start', { conversationId });
  }
};

/**
 * Emit typing stop event
 * @param conversationId - ID of the conversation
 */
export const typingStop = (conversationId: string) => {
  if (socket) {
    socket.emit('typing_stop', { conversationId });
  }
};

/**
 * Subscribe to receive messages
 * @param callback - Function to call when a message is received
 * @returns Unsubscribe function
 */
export const onMessageReceived = (callback: (message: any) => void) => {
  if (!socket) return () => {};

  const handler = (message: any) => {
    callback(message);
  };

  socket.on('message:receive', handler);

  return () => {
    if (socket) {
      socket.off('message:receive', handler);
    }
  };
};

/**
 * Subscribe to typing indicators
 * @param callback - Function to call when typing status changes
 * @returns Unsubscribe function
 */
export const onTyping = (callback: (data: { userId: number; conversationId: string; isTyping: boolean }) => void) => {
  if (!socket) return () => {};

  const startHandler = (data: { userId: number; conversationId: string }) => {
    callback({ ...data, isTyping: true });
  };

  const stopHandler = (data: { userId: number; conversationId: string }) => {
    callback({ ...data, isTyping: false });
  };

  socket.on('typing_start', startHandler);
  socket.on('typing_stop', stopHandler);

  return () => {
    if (socket) {
      socket.off('typing_start', startHandler);
      socket.off('typing_stop', stopHandler);
    }
  };
};