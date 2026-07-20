import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const userAPI = {
  // Get current user profile
  getMe: () => api.get('/users/me'),

  // Get user by ID
  getUserById: (userId: string) => api.get(`/users/${userId}`),

  // Update user profile
  updateUser: (userData: Partial<{
    firstName: string;
    lastName: string;
    bio: string;
    avatarUrl: string;
    website: string;
    location: string;
    coverUrl: string;
  }>) => api.patch('/users/me', userData),

  // Search users
  searchUsers: (query: string) => api.get('/users/search', {
    params: { q: query }
  }),

  // Get followers/following (for social features)
  getFollowers: (userId: string) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId: string) => api.get(`/users/${userId}/following`),
  followUser: (userId: string) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId: string) => api.delete(`/users/${userId}/follow`),

  // Get friends
  getFriends: () => api.get('/users/friends'),
  addFriend: (userId: string) => api.post(`/users/${userId}/friend`),
  removeFriend: (userId: string) => api.delete(`/users/${userId}/friend`)
};

export default userAPI;