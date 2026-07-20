// Initialize auth state from localStorage on app load
export const initializeAuth = async () => {
  const accessToken = getItem('accessToken');
  if (!accessToken) return;

  try {
    const { user } = await api.get('/api/auth/me');
    useAuthStore.getState().updateUser(user);
    useAuthStore.getState().setState({ isAuthenticated: true });

    // Initialize socket connection
    initSocket(accessToken);
  } catch (error) {
    // Token invalid or expired, clear it
    removeItem('accessToken');
    removeItem('refreshToken');
    useAuthStore.getState().setState({
      user: null,
      isAuthenticated: false
    });
  }
};