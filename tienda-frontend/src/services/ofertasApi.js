import api from './api.js';

export const ofertasApi = {
  /**
   * Get currently active offers
   * GET /api/ofertas
   */
  getOfertasActivas: async () => {
    try {
      const response = await api.get('/ofertas');
      return response.data.data.ofertas;
    } catch (error) {
      throw error;
    }
  },
};

export default ofertasApi;
