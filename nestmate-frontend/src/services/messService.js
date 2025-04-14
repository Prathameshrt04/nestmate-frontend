import api from './api';

const ENDPOINTS = {
  MESSES: '/messes',
  UPLOAD: '/messes/upload',
};

const messService = {
  // Fetch all messes
  getAllMesses: async () => {
    try {
      const response = await api.get(ENDPOINTS.MESSES);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch messes' };
    }
  },

  // Fetch a mess by ID
  getMessById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.MESSES}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch mess' };
    }
  },

  // Create a new mess
  createMess: async (messData) => {
    try {
      const response = await api.post(ENDPOINTS.MESSES, messData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create mess' };
    }
  },

  // Update an existing mess
  updateMess: async (id, messData) => {
    try {
      const response = await api.put(`${ENDPOINTS.MESSES}/${id}`, messData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update mess' };
    }
  },

  // Delete a mess
  deleteMess: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.MESSES}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete mess' };
    }
  },

  // Upload photos for a mess
  uploadPhotos: async (formData) => {
    try {
      const response = await api.post(ENDPOINTS.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Expecting backend to return { imageFilenames: ["filename1.jpg", ...] }
      const filenames = response.data.imageFilenames || [];
      return { imageUrls: filenames }; // Return filenames only
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload photos' };
    }
  },

  // Fetch users who contacted a mess
  getContactedUsers: async (messId) => {
    try {
      const response = await api.get(`${ENDPOINTS.MESSES}/${messId}/contacted`);
      console.log('Fetched Contacted Users:', response.data); // Debug log retained
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch contacted users' };
    }
  },

  // Confirm a contacted user for a mess
  confirmContactedUser: async (messId, userId) => {
    try {
      const response = await api.put(`${ENDPOINTS.MESSES}/${messId}/contacted/${userId}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm contact' };
    }
  },

  // Remove a contacted user from a mess
  removeContactedUser: async (messId, userId) => {
    try {
      const response = await api.delete(`${ENDPOINTS.MESSES}/${messId}/contacted/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove contact' };
    }
  },

  // Initiate contact with a mess
  contactMess: async (messId) => {
    try {
      const response = await api.post(`${ENDPOINTS.MESSES}/${messId}/contact`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to initiate contact' };
    }
  },
};

export default messService;