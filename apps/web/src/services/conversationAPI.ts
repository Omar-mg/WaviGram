import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const conversationAPI = {
  // Get all conversations for the current user
  getConversations: () => api.get('/conversations'),

  // Get a specific conversation by ID
  getConversation: (conversationId: string) =>
    api.get(`/conversations/${conversationId}`),

  // Get messages for a conversation
  getMessages: (conversationId: string, params?: {
    limit?: number;
    offset?: number;
    before?: string; // message ID to get messages before
    after?: string;  // message ID to get messages after
  }) => api.get(`/conversations/${conversationId}/messages`, { params }),

  // Create a new conversation
  createConversation: (data: {
    participantIds: string[];
    name?: string;
    isGroup?: boolean;
  }) => api.post('/conversations', data),

  // Send a message in a conversation
  sendMessage: (conversationId: string, messageData: {
    content: string;
    type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  }) => api.post(`/conversations/${conversationId}/messages`, messageData),

  // Update a message (edit)
  updateMessage: (conversationId: string, messageId: string, messageData: {
    content: string;
  }) => api.patch(`/conversations/${conversationId}/messages/${messageId}`, messageData),

  // Delete a message
  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/conversations/${conversationId}/messages/${messageId}`),

  // React to a message
  reactToMessage: (conversationId: string, messageId: string, reaction: string) =>
    api.post(`/conversations/${conversationId}/messages/${messageId}/reactions`, { reaction }),

  // Remove reaction from a message
  removeReaction: (conversationId: string, messageId: string, reaction: string) =>
    api.delete(`/conversations/${conversationId}/messages/${messageId}/reactions/${reaction}`),

  // Mark messages as read
  markAsRead: (conversationId: string, messageId?: string) =>
    api.post(`/conversations/${conversationId}/read`, { messageId }),

  // Leave a conversation
  leaveConversation: (conversationId: string) =>
    api.delete(`/conversations/${conversationId}`),

  // Pin a conversation
  pinConversation: (conversationId: string) =>
    api.post(`/conversations/${conversationId}/pin`),

  // Unpin a conversation
  unpinConversation: (conversationId: string) =>
    api.delete(`/conversations/${conversationId}/pin`),

  // Archive a conversation
  archiveConversation: (conversationId: string) =>
    api.post(`/conversations/${conversationId}/archive`),

  // Unarchive a conversation
  unarchiveConversation: (conversationId: string) =>
    api.delete(`/conversations/${conversationId}/archive`)
};

export default conversationAPI;