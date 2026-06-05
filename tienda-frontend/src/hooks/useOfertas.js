import { useEffect } from 'react';
import { useFetch } from './useFetch.js';
import { ofertasApi } from '../services/ofertasApi.js';
import { useOfertasStore } from '../store/ofertasStore.js';

export const useOfertas = () => {
  const { data: ofertas, loading, error, execute } = useFetch(
    () => ofertasApi.getOfertasActivas(),
    true,
    []
  );

  const storeOfertas = useOfertasStore((state) => state.setOfertas);

  useEffect(() => {
    if (ofertas && Array.isArray(ofertas)) {
      storeOfertas(ofertas);
    }
  }, [ofertas, storeOfertas]);

  const refetch = async () => {
    return execute();
  };

  return {
    ofertas: ofertas || [],
    loading,
    error,
    refetch,
  };
};

export default useOfertas;
