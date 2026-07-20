import axios from 'axios';
import { getItem, setItem, removeItem } from '@/lib/utils';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        removeItem('accessToken');
        removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string
  }) => api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (userId: string, data: Partial<{
    firstName: string;
    lastName: string;
    bio: string;
    avatarUrl: string;
  }>) => api.patch(`/users/${userId}`, data),
};

// Conversation API
export const conversationAPI = {
  getConversations: () => api.get('/conversations'),
  createConversation: (data: {
    participantIds: string[];
    isGroup?: boolean;
    name?: string
  }) => api.post('/conversations', data),
  getConversation: (conversationId: string) => api.get(`/conversations/${conversationId}`),
  leaveConversation: (conversationId: string) => api.delete(`/conversations/${conversationId}`),
};

// Message API
export const messageAPI = {
  getMessages: (conversationId: string, params?: {
    limit?: number;
    offset?: number;
  }) => api.get(`/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId: string, content: string, type?: string) =>
    api.post(`/conversations/${conversationId}/messages`, { content, type }),
  deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),
  editMessage: (messageId: string, content: string) =>
    api.patch(`/messages/${messageId}`, { content }),
};

export default api;