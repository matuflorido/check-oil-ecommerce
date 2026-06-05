/**
 * Order utilities and helpers
 */

/**
 * Generate unique order number
 * Format: CHK-[timestamp]-[random 4 digits]
 * @returns {string} Unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CHK-${timestamp}-${random}`;
};

/**
 * Validate order input
 * @param {Object} input - Order input data
 * @returns {Object} { valid: boolean, errors: [] }
 */
export const validateOrderInput = (input) => {
  const errors = [];

  // Validate items
  if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
    errors.push('Items array is required and must have at least one item');
  }

  input.items?.forEach((item, index) => {
    if (!item.productId) {
      errors.push(`Item ${index}: productId is required`);
    }
    if (!item.cantidad || item.cantidad < 1) {
      errors.push(`Item ${index}: cantidad must be at least 1`);
    }
  });

  // Validate client
  if (!input.cliente) {
    errors.push('Cliente object is required');
  } else {
    if (!input.cliente.email) {
      errors.push('Cliente.email is required');
    } else if (!isValidEmail(input.cliente.email)) {
      errors.push('Cliente.email must be a valid email address');
    }

    if (!input.cliente.nombre) {
      errors.push('Cliente.nombre is required');
    }

    if (!input.cliente.direccion) {
      errors.push('Cliente.direccion is required');
    }

    if (!input.cliente.ciudad) {
      errors.push('Cliente.ciudad is required');
    }

    if (!input.cliente.provincia) {
      errors.push('Cliente.provincia is required');
    }
  }

  // Validate payment method
  const validPaymentMethods = ['mercado_pago', 'transferencia', 'efectivo'];
  if (!input.metodoPago || !validPaymentMethods.includes(input.metodoPago)) {
    errors.push(
      `metodoPago must be one of: ${validPaymentMethods.join(', ')}`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate order totals from cart data
 * @param {Object} cartData - Cart with items, subtotal, descuentos
 * @returns {Object} { subtotal, descuentos, costoEnvio, total }
 */
export const calculateOrderFromCart = (cartData) => {
  const subtotal = parseFloat(cartData.subtotal || 0);
  const descuentos = parseFloat(cartData.descuentos || 0);
  const costoEnvio = parseFloat(cartData.costoEnvio || 0);
  const total = subtotal - descuentos + costoEnvio;

  return {
    subtotal,
    descuentos,
    costoEnvio,
    total: Math.max(0, total),
  };
};

/**
 * Simple email validation
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
