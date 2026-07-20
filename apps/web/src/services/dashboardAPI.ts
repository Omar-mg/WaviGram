import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const dashboardAPI = {
  // Get dashboard statistics and activity
  getStats: () => api.get('/dashboard/stats'),
};

export default dashboardAPI;