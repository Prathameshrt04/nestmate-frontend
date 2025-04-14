import api from './api';

// Centralized endpoint constants
const ENDPOINTS = {
  FLATS: '/flats',
  UPLOAD: '/flats/upload',
  USER_FLATS: '/flats/user',
};

const flatService = {
  // Fetch all flats with optional query params
  getAllFlats: async (query = {}) => {
    try {
      const response = await api.get(ENDPOINTS.FLATS, { params: query });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flats' };
    }
  },

  // Fetch a flat by ID
  getFlatById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.FLATS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch flat' };
    }
  },

  // Create a new flat
  createFlat: async (flatData) => {
    try {
      const response = await api.post(ENDPOINTS.FLATS, flatData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create flat' };
    }
  },

  // Update an existing flat
  updateFlat: async (id, flatData) => {
    try {
      const response = await api.put(`${ENDPOINTS.FLATS}/${id}`, flatData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update flat' };
    }
  },

  // Delete a flat
  deleteFlat: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.FLATS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete flat' };
    }
  },

  // Upload photos for a flat
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

  // Fetch flats owned by the current user
  getUserFlats: async () => {
    try {
      const response = await api.get(ENDPOINTS.USER_FLATS);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user flats' };
    }
  },

  // Fetch users who contacted a flat
  getContactedUsers: async (flatId) => {
    try {
      const response = await api.get(`${ENDPOINTS.FLATS}/${flatId}/contacted`);
      console.log('Fetched Contacted Users:', response.data); // Debug log retained
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch contacted users' };
    }
  },

  // Confirm a contacted user for a flat
  confirmContactedUser: async (flatId, userId) => {
    try {
      const response = await api.post(`${ENDPOINTS.FLATS}/${flatId}/contacted/${userId}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm contact' };
    }
  },

  // Remove a contacted user from a flat
  removeContactedUser: async (flatId, userId) => {
    try {
      const response = await api.delete(`${ENDPOINTS.FLATS}/${flatId}/contacted/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove contact' };
    }
  },

  // Fetch nearby listings for a flat
  getNearbyListings: async (flatId) => {
    try {
      const response = await api.get(`${ENDPOINTS.FLATS}/${flatId}/nearby`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch nearby listings' };
    }
  },
};

export default flatService;