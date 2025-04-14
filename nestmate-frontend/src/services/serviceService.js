import api from './api';

const ENDPOINTS = {
  SERVICES: '/services',
  UPLOAD: '/services/upload',
};

const serviceService = {
  // Fetch all services
  getAllServices: async () => {
    try {
      const response = await api.get(ENDPOINTS.SERVICES);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch services' };
    }
  },

  // Fetch a service by ID
  getServiceById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.SERVICES}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch service' };
    }
  },

  // Create a new service
  createService: async (serviceData) => {
    try {
      const response = await api.post(ENDPOINTS.SERVICES, serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create service' };
    }
  },

  // Update an existing service
  updateService: async (id, serviceData) => {
    try {
      const response = await api.put(`${ENDPOINTS.SERVICES}/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update service' };
    }
  },

  // Delete a service
  deleteService: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.SERVICES}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete service' };
    }
  },

  // Upload photos for a service
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

  // Fetch users who contacted a service
  getContactedUsers: async (serviceId) => {
    try {
      const response = await api.get(`${ENDPOINTS.SERVICES}/${serviceId}/contacted`);
      console.log('Fetched Contacted Users:', response.data); // Debug log retained
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch contacted users' };
    }
  },

  // Confirm a contacted user for a service
  confirmContactedUser: async (serviceId, userId) => {
    try {
      const response = await api.put(`${ENDPOINTS.SERVICES}/${serviceId}/contacted/${userId}/confirm`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to confirm contact' };
    }
  },

  // Remove a contacted user from a service
  removeContactedUser: async (serviceId, userId) => {
    try {
      const response = await api.delete(`${ENDPOINTS.SERVICES}/${serviceId}/contacted/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove contact' };
    }
  },

  // Initiate contact with a service
  contactService: async (serviceId) => {
    try {
      const response = await api.post(`${ENDPOINTS.SERVICES}/${serviceId}/contact`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to initiate contact' };
    }
  },
};

export default serviceService;