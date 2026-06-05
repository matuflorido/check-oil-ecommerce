import api from './api.js';

export const productosApi = {
  /**
   * Get paginated list of products with filters
   * GET /api/productos
   */
  getProductos: async (params = {}) => {
    try {
      const response = await api.get('/productos', { params });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single product detail with offers
   * GET /api/productos/:id
   */
  getProductoDetail: async (id) => {
    try {
      const response = await api.get(`/productos/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get categories hierarchically
   * GET /api/categorias
   */
  getCategorias: async () => {
    try {
      const response = await api.get('/categorias');
      return response.data.data.categorias;
    } catch (error) {
      throw error;
    }
  },
};

export default productosApi;
