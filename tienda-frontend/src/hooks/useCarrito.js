import { useCarritoStore } from '../store/carritoStore.js';
import { carroApi } from '../services/carroApi.js';

export const useCarrito = () => {
  const {
    items,
    subtotal,
    descuentos,
    total,
    aplicableOfertas,
    addItem,
    removeItem,
    updateQuantity,
    setCartTotals,
    clearCart,
  } = useCarritoStore();

  const addToCart = async (product, cantidad = 1, variantId = null) => {
    try {
      addItem(
        product.id,
        cantidad,
        variantId,
        product.nombre,
        variantId
          ? product.precio_base + (product.variants?.find((v) => v.id === variantId)?.precio_ajuste || 0)
          : product.precio_base
      );

      // Recalculate cart with new item
      await calculateCart();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const calculateCart = async () => {
    try {
      if (items.length === 0) {
        setCartTotals(0, 0, 0, []);
        return;
      }

      const response = await carroApi.calculateCarrito(items);
      setCartTotals(
        response.subtotal,
        response.descuentos,
        response.total,
        response.aplicableOfertas || []
      );
    } catch (error) {
      console.error('Error calculating cart:', error);
      throw error;
    }
  };

  return {
    items,
    subtotal,
    descuentos,
    total,
    aplicableOfertas,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    calculateCart,
    itemCount: items.length,
  };
};

export default useCarrito;
