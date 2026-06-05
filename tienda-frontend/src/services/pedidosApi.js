import api from './api.js';

export const pedidosApi = {
  /**
   * Create a new order
   * POST /api/pedidos
   */
  createPedido: async (orderData) => {
    try {
      const response = await api.post('/pedidos', orderData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get orders by customer email
   * GET /api/pedidos/email/:email
   */
  getPedidosByEmail: async (email) => {
    try {
      const response = await api.get(`/pedidos/email/${email}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default pedidosApi;
