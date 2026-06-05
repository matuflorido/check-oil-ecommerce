import api from './api.js';

export const carroApi = {
  /**
   * Calculate cart totals with discounts
   * POST /api/carrito
   */
  calculateCarrito: async (items) => {
    try {
      const response = await api.post('/carrito', { items });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default carroApi;
