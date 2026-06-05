/**
 * StockService - Inventory Management
 * Handles stock reservation, release, alerts, and manual adjustments
 */

class StockService {
  constructor(models = null) {
    this.models = models;
  }

  /**
   * Set models for database operations (called after models are initialized)
   * @param {Object} models - Sequelize models
   */
  setModels(models) {
    this.models = models;
  }

  /**
   * Reserve stock for a purchase
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @param {number} cantidad - Quantity to reserve
   * @returns {Promise<Object>} { success: true, newStock, alert: boolean }
   * @throws Error if insufficient stock
   */
  async reserveStock(productId, variantId, cantidad) {
    if (!this.models) {
      throw new Error('Models not initialized');
    }

    const { Product, Variant, StockHistory } = this.models;

    // Determine what to update based on variant
    let currentStock = 0;

    if (variantId && Variant) {
      const variant = await Variant.findByPk(variantId);
      if (!variant) {
        throw new Error('Variant not found');
      }
      currentStock = variant.stock_variante || 0;
    } else {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      currentStock = product.stock_actual || 0;
    }

    // Check if sufficient stock
    if (currentStock < cantidad) {
      throw new Error(
        `Insufficient stock. Available: ${currentStock}, Required: ${cantidad}`,
      );
    }

    // Deduct stock
    const newStock = currentStock - cantidad;

    if (variantId && Variant) {
      await Variant.update(
        { stock_variante: newStock },
        { where: { id: variantId } },
      );
    } else {
      await Product.update(
        { stock_actual: newStock },
        { where: { id: productId } },
      );
    }

    // Create stock history entry
    if (StockHistory) {
      await StockHistory.create({
        producto_id: productId,
        variante_id: variantId || null,
        tipo: 'compra',
        cantidad_cambio: -cantidad,
        stock_anterior: currentStock,
        stock_nuevo: newStock,
        motivo: 'Purchase reservation',
        usuario_admin_id: null,
      });
    }

    // Check if stock is below minimum
    const product = await Product.findByPk(productId);
    const stockMinimo = product.stock_minimo || 5;
    const alert = newStock < stockMinimo;

    return {
      success: true,
      newStock,
      alert,
    };
  }

  /**
   * Release stock reservation (e.g., order cancelled)
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @param {number} cantidad - Quantity to release
   * @returns {Promise<number>} New stock amount
   */
  async releaseReservation(productId, variantId, cantidad) {
    if (!this.models) {
      throw new Error('Models not initialized');
    }

    const { Product, Variant, StockHistory } = this.models;

    // Get current stock
    let currentStock = 0;

    if (variantId && Variant) {
      const variant = await Variant.findByPk(variantId);
      if (!variant) {
        throw new Error('Variant not found');
      }
      currentStock = variant.stock_variante || 0;
    } else {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      currentStock = product.stock_actual || 0;
    }

    // Increase stock
    const newStock = currentStock + cantidad;

    if (variantId && Variant) {
      await Variant.update(
        { stock_variante: newStock },
        { where: { id: variantId } },
      );
    } else {
      await Product.update(
        { stock_actual: newStock },
        { where: { id: productId } },
      );
    }

    // Create stock history entry
    if (StockHistory) {
      await StockHistory.create({
        producto_id: productId,
        variante_id: variantId || null,
        tipo: 'devolucion',
        cantidad_cambio: cantidad,
        stock_anterior: currentStock,
        stock_nuevo: newStock,
        motivo: 'Reservation release',
        usuario_admin_id: null,
      });
    }

    return newStock;
  }

  /**
   * Get all products with stock below minimum
   * @returns {Promise<Array>} Array of { productId, nombre, stock_actual, stock_minimo, urgency }
   */
  async getStockAlerts() {
    if (!this.models) {
      throw new Error('Models not initialized');
    }

    const { Product } = this.models;

    const lowStockProducts = await Product.findAll({
      where: {
        activo: true,
      },
      attributes: ['id', 'nombre', 'stock_actual', 'stock_minimo'],
      raw: true,
    });

    return lowStockProducts
      .filter((p) => p.stock_actual < p.stock_minimo)
      .map((p) => {
        // Calculate urgency (0-100, higher = more urgent)
        const urgency = p.stock_actual === 0
          ? 100
          : Math.round(((p.stock_minimo - p.stock_actual) / p.stock_minimo) * 100);

        return {
          productId: p.id,
          nombre: p.nombre,
          stock_actual: p.stock_actual,
          stock_minimo: p.stock_minimo,
          urgency,
        };
      });
  }

  /**
   * Adjust stock manually (admin action)
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @param {number} cantidad - Quantity to adjust (positive or negative)
   * @param {string} motivo - Reason for adjustment
   * @param {string} usuarioAdminId - Admin user ID
   * @returns {Promise<number>} New stock amount
   */
  async adjustStockManually(
    productId,
    variantId,
    cantidad,
    motivo,
    usuarioAdminId,
  ) {
    if (!this.models) {
      throw new Error('Models not initialized');
    }

    const { Product, Variant, StockHistory } = this.models;

    // Get current stock
    let currentStock = 0;

    if (variantId && Variant) {
      const variant = await Variant.findByPk(variantId);
      if (!variant) {
        throw new Error('Variant not found');
      }
      currentStock = variant.stock_variante || 0;
    } else {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      currentStock = product.stock_actual || 0;
    }

    // Calculate new stock
    const newStock = currentStock + cantidad;

    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    // Update stock
    if (variantId && Variant) {
      await Variant.update(
        { stock_variante: newStock },
        { where: { id: variantId } },
      );
    } else {
      await Product.update(
        { stock_actual: newStock },
        { where: { id: productId } },
      );
    }

    // Create stock history entry
    if (StockHistory) {
      await StockHistory.create({
        producto_id: productId,
        variante_id: variantId || null,
        tipo: 'ajuste_manual',
        cantidad_cambio: cantidad,
        stock_anterior: currentStock,
        stock_nuevo: newStock,
        motivo: motivo || 'Manual adjustment',
        usuario_admin_id: usuarioAdminId || null,
      });
    }

    return newStock;
  }
}

export default new StockService();
