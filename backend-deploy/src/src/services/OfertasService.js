/**
 * OfertasService - Discount Engine for Offers and Promotions
 * Handles evaluation of flexible discount conditions against carts
 */

class OfertasService {
  /**
   * Evaluate all applicable offers for a cart
   * @param {Object} carrito - { items: [{productId, variantId, cantidad, precio}], subtotal }
   * @param {Array} ofertasActivas - Array of Offer records from DB
   * @returns {Object} { aplicableOfertas: [], totalDescuento: 0, detalles: {} }
   */
  evaluateOffersForCart(carrito, ofertasActivas) {
    if (!carrito || !ofertasActivas || ofertasActivas.length === 0) {
      return {
        aplicableOfertas: [],
        totalDescuento: 0,
        detalles: {},
      };
    }

    const ahora = new Date();
    const aplicables = [];

    // Filter and evaluate each offer
    ofertasActivas.forEach((oferta) => {
      // Check if offer is active and within date range
      if (
        !oferta.activa
        || new Date(oferta.fecha_inicio) > ahora
        || new Date(oferta.fecha_fin) < ahora
      ) {
        return;
      }

      // Check if offer applies to items in this cart
      const aplicaA = oferta.aplicable_a || { tipo: 'productos', ids: [] };
      const itemsAplicables = this.filterApplicableItems(carrito.items, aplicaA);

      if (itemsAplicables.length === 0) {
        return;
      }

      // Evaluate conditions for this offer
      const cartToEvaluate = {
        ...carrito,
        items: itemsAplicables,
      };

      const condiciones = Array.isArray(oferta.condiciones)
        ? oferta.condiciones
        : [oferta.condiciones];

      let condicionesMet = true;
      let descuentoTotal = 0;

      // Evaluate all conditions
      for (const condicion of condiciones) {
        if (!this.evaluateCondition(condicion, cartToEvaluate)) {
          condicionesMet = false;
          break;
        }
      }

      if (condicionesMet) {
        // Calculate discount from the last condition (primary discount)
        const lastCondicion = condiciones[condiciones.length - 1];
        descuentoTotal = this.calculateDiscount(lastCondicion, cartToEvaluate);

        aplicables.push({
          ofertaId: oferta.id,
          nombre: oferta.nombre,
          descuento: descuentoTotal,
          condiciones: condiciones.map((c) => this.getConditionDescription(c)),
          aplicaA: aplicaA.tipo,
        });
      }
    });

    // Select best discount (highest amount)
    if (aplicables.length === 0) {
      return {
        aplicableOfertas: [],
        totalDescuento: 0,
        detalles: {},
      };
    }

    const mejorOferta = aplicables.reduce((best, oferta) =>
      oferta.descuento > best.descuento ? oferta : best,
    );

    return {
      aplicableOfertas: aplicables,
      totalDescuento: mejorOferta.descuento,
      detalles: {
        ofertaSeleccionada: mejorOferta.ofertaId,
        nombre: mejorOferta.nombre,
        condiciones: mejorOferta.condiciones,
      },
    };
  }

  /**
   * Evaluate a single condition against cart
   * @param {Object} condition - Condition configuration
   * @param {Object} carrito - Cart object
   * @returns {boolean}
   */
  evaluateCondition(condition, carrito) {
    if (!condition) {
      return false;
    }

    const { tipo } = condition;

    switch (tipo) {
      case 'cantidad_producto': {
        const { producto_id: productId, minimo } = condition;
        const cantidad = carrito.items
          .filter((item) => item.productId === productId)
          .reduce((sum, item) => sum + item.cantidad, 0);
        return cantidad >= minimo;
      }

      case 'monto_carrito': {
        const { minimo } = condition;
        return carrito.subtotal >= minimo;
      }

      case 'cantidad_carrito_items': {
        const { minimo } = condition;
        const totalItems = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
        return totalItems >= minimo;
      }

      case 'AND': {
        const { condiciones } = condition;
        if (!Array.isArray(condiciones)) return false;
        return condiciones.every((cond) => this.evaluateCondition(cond, carrito));
      }

      case 'OR': {
        const { condiciones } = condition;
        if (!Array.isArray(condiciones)) return false;
        return condiciones.some((cond) => this.evaluateCondition(cond, carrito));
      }

      default:
        return false;
    }
  }

  /**
   * Calculate discount amount from a met condition
   * @param {Object} condition - Condition configuration
   * @param {Object} carrito - Cart object
   * @returns {number} Discount amount
   */
  calculateDiscount(condition, carrito) {
    if (!condition || !condition.descuento) {
      return 0;
    }

    const { descuento, aplicar_a: aplicarA } = condition;
    let baseAmount = 0;

    // Determine what to apply discount to
    switch (aplicarA) {
      case 'envio':
        // For shipping discounts, assume a fixed shipping cost (would come from cart)
        baseAmount = carrito.costoEnvio || 0;
        break;
      default:
        baseAmount = carrito.subtotal || 0;
    }

    // Parse discount (percentage or fixed amount)
    if (typeof descuento === 'string' && descuento.endsWith('%')) {
      const percentage = parseFloat(descuento) / 100;
      return baseAmount * percentage;
    }

    // Fixed amount discount
    return parseFloat(descuento) || 0;
  }

  /**
   * Filter cart items to only those applicable to the offer
   * @param {Array} items - Cart items
   * @param {Object} aplicableA - { tipo: 'productos'|'categorias', ids: [] }
   * @returns {Array} Filtered items
   */
  filterApplicableItems(items, aplicableA) {
    if (!aplicableA || !aplicableA.ids || aplicableA.ids.length === 0) {
      return items;
    }

    const { tipo, ids } = aplicableA;

    if (tipo === 'productos') {
      return items.filter((item) => ids.includes(item.productId));
    }

    if (tipo === 'categorias') {
      return items.filter((item) => ids.includes(item.categoriaId));
    }

    return items;
  }

  /**
   * Get human-readable description of a condition
   * @param {Object} condition - Condition configuration
   * @returns {string}
   */
  getConditionDescription(condition) {
    if (!condition) return 'Condición desconocida';

    const { tipo, minimo, descuento } = condition;

    switch (tipo) {
      case 'cantidad_producto':
        return `${minimo}+ unidades del producto`;
      case 'monto_carrito':
        return `Compra mínima de $${minimo}`;
      case 'cantidad_carrito_items':
        return `Mínimo ${minimo} items en carrito`;
      case 'AND':
        return 'Se deben cumplir todas las condiciones';
      case 'OR':
        return 'Se debe cumplir al menos una condición';
      default:
        return `${tipo}: Descuento de ${descuento}`;
    }
  }
}

export default new OfertasService();
