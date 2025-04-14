import { useAuth } from './authContext';

// Utility functions integrated with Auth Context
const authUtils = {
  getUser: () => {
    const { user } = useAuth();
    return user;
  },

  isAuthenticated: () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
  },

  logout: () => {
    const { logout } = useAuth();
    logout();
  },

  // Legacy function for non-context usage (optional)
  getUserFromToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.id };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};

export default authUtils;