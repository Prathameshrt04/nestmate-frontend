import api from './api';

const ratingService = {
  getRatings: async (type, targetId) => {
    try {
      const response = await api.get(`/ratings/${type}/${targetId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch ratings' };
    }
  },

  createRating: async (ratingData) => {
    try {
      const response = await api.post('/ratings', ratingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create rating' };
    }
  },

  updateRating: async (id, ratingData) => {
    try {
      const response = await api.put(`/ratings/${id}`, ratingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update rating' };
    }
  },

  deleteRating: async (id) => {
    try {
      const response = await api.delete(`/ratings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete rating' };
    }
  },
};

export default ratingService;