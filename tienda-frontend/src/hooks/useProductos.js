import { useState, useCallback, useEffect } from 'react';
import { useFetch } from './useFetch.js';
import { productosApi } from '../services/productosApi.js';

export const useProductos = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    categoria: null,
    precioMin: null,
    precioMax: null,
    search: null,
    ordenar: 'nombre',
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const result = await productosApi.getProductos(filters);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
      categoria: null,
      precioMin: null,
      precioMax: null,
      search: null,
      ordenar: 'nombre',
    });
  }, []);

  return {
    productos: data?.productos || [],
    total: data?.total || 0,
    page: filters.page,
    limit: filters.limit,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    filters,
    setFilter,
    setPage,
    resetFilters,
    fetchProductos,
  };
};

export default useProductos;
