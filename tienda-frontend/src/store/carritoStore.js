import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      subtotal: 0,
      descuentos: 0,
      total: 0,
      aplicableOfertas: [],
      costoEnvio: 0,

      // Actions
      addItem: (productId, cantidad = 1, variantId = null, nombre = '', precioUnitario = 0) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === productId && item.variantId === variantId
          );

          let newItems;
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.productId === productId && item.variantId === variantId
                ? { ...item, cantidad: item.cantidad + cantidad }
                : item
            );
          } else {
            newItems = [...state.items, { productId, variantId, cantidad, nombre, precioUnitario }];
          }

          return { items: newItems };
        });
      },

      removeItem: (productId, variantId = null) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId = null, cantidad) => {
        set((state) => {
          if (cantidad <= 0) {
            return {
              items: state.items.filter(
                (item) => !(item.productId === productId && item.variantId === variantId)
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId && item.variantId === variantId
                ? { ...item, cantidad }
                : item
            ),
          };
        });
      },

      setCartTotals: (subtotal, descuentos, total, aplicableOfertas = []) => {
        set({ subtotal, descuentos, total, aplicableOfertas });
      },

      clearCart: () => {
        set({ items: [], subtotal: 0, descuentos: 0, total: 0, aplicableOfertas: [] });
      },

      hydrate: (state) => {
        set(state);
      },
    }),
    {
      name: 'carrito-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
