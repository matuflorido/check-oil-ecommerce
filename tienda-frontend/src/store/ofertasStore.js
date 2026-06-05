import { create } from 'zustand';

export const useOfertasStore = create((set, get) => ({
  // State
  ofertas: [],
  loading: false,
  error: null,

  // Actions
  setOfertas: (ofertas) => {
    set({ ofertas, error: null });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  filterActiveOfertas: () => {
    const state = get();
    if (!state) return [];
    return state.ofertas.filter((oferta) => {
      const now = new Date();
      const start = new Date(oferta.fecha_inicio);
      const end = new Date(oferta.fecha_fin);
      return now >= start && now <= end;
    });
  },

  clearOfertas: () => {
    set({ ofertas: [], error: null });
  },
}));
