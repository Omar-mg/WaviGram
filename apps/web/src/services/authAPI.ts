import api from '@/services/api';
import { RegisterPayload, User } from '@/store/auth';

export const authAPI = {
  // Register a new user
  register: async (payload: RegisterPayload): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
    const response = await api.post('/api/auth/register', payload);
    return response.data;
  },

  // Login user
  login: async (email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout user
  logout: async () => {
    await api.post('/api/auth/logout');
  },

  // Get current user
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Update user profile
  updateUser: async (userData: Partial<User>): Promise<{ user: User }> => {
    const response = await api.patch('/api/auth/me', userData);
    return response.data;
  }
};

export default authAPI;