import api from './api';

const ENDPOINTS = {
  PRODUCTS: '/products',
};

const productService = {
  // Fetch all products
  getAllProducts: async () => {
    try {
      const response = await api.get(ENDPOINTS.PRODUCTS);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch products' };
    }
  },

  // Fetch a product by ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.PRODUCTS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch product' };
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await api.post(ENDPOINTS.PRODUCTS, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create product' };
    }
  },

  // Update an existing product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`${ENDPOINTS.PRODUCTS}/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update product' };
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.PRODUCTS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete product' };
    }
  },
};

export default productService;