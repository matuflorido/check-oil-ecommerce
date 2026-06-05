import { create } from 'zustand';

export const useUiStore = create((set) => ({
  // State
  toasts: [],
  isCarritoOpen: false,
  isLoading: false,
  errorMessage: null,
  successMessage: null,

  // Toast actions
  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // UI state actions
  toggleCarrito: () => {
    set((state) => ({
      isCarritoOpen: !state.isCarritoOpen,
    }));
  },

  setCarritoOpen: (isOpen) => {
    set({ isCarritoOpen: isOpen });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (errorMessage) => {
    set({ errorMessage });
  },

  setSuccess: (successMessage) => {
    set({ successMessage });
  },

  clearMessages: () => {
    set({ errorMessage: null, successMessage: null });
  },
}));
