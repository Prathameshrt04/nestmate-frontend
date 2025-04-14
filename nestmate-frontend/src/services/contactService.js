import api from './api';

const contactService = {
  getUserContacts: async () => {
    try {
      const response = await api.get('/contacts');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch contacts' };
    }
  },

  createContact: async (contactData) => {
    try {
      const response = await api.post('/contacts', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create contact' };
    }
  },

  updateContact: async (id, contactData) => {
    try {
      const response = await api.put(`/contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update contact' };
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete contact' };
    }
  },
};

export default contactService;