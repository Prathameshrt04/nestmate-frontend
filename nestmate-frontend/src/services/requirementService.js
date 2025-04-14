import api from './api';

const requirementService = {
  getUserRequirements: async () => {
    try {
      const response = await api.get('/requirements');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch requirements' };
    }
  },

  createRequirement: async (requirementData) => {
    try {
      const response = await api.post('/requirements', requirementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create requirement' };
    }
  },

  updateRequirement: async (id, requirementData) => {
    try {
      const response = await api.put(`/requirements/${id}`, requirementData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update requirement' };
    }
  },

  deleteRequirement: async (id) => {
    try {
      const response = await api.delete(`/requirements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete requirement' };
    }
  },
};

export default requirementService;