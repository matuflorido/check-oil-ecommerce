/**
 * Admin Stock Controller (Task 13)
 * Stock management and adjustments
 */

import { Op } from 'sequelize';
import {
  sequelize,
  Product,
  Variant,
  StockHistory,
} from '../../models/index.js';
import StockService from '../../services/StockService.js';

/**
 * GET /api/admin/stock
 * Get stock status for all products/variants
 * Query: { page?, limit?, bajo?, categoria? }
 */
export const getStock = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      bajo,
      categoria,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build product where clause
    const productWhere = {};
    if (categoria) {
      productWhere.categoria_id = categoria;
    }

    // Fetch products with variants
    const { count, rows } = await Product.findAndCountAll({
      where: productWhere,
      include: [
        {
          association: 'variants',
          attributes: ['id', 'nombre', 'stock_variante'],
        },
      ],
      attributes: ['id', 'nombre', 'stock_actual', 'sku'],
      offset,
      limit,
      order: [['nombre', 'ASC']],
    });

    // If bajo flag, filter for low stock
    let filtered = rows;
    if (bajo === 'true') {
      filtered = rows.filter((p) => {
        const stockBajo = p.stock_actual <= 10; // Define low stock threshold
        const variantBajo = p.variants?.some((v) => v.stock_variante <= 10);
        return stockBajo || variantBajo;
      });
    }

    const formattedData = filtered.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      sku: p.sku,
      stock_actual: p.stock_actual,
      stock_bajo: p.stock_actual <= 10,
      variantes: p.variants || [],
    }));

    res.status(200).json({
      data: formattedData,
      pagination: {
        total: bajo === 'true' ? filtered.length : count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((bajo === 'true' ? filtered.length : count) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/stock/:id/ajustar
 * Manually adjust product/variant stock
 * Body: { cantidad: number, razon: string, variante_id?: string }
 */
export const ajustarStock = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cantidad, razon, variante_id } = req.body;

    // Validate input
    if (cantidad === undefined || !razon) {
      return res.status(400).json({
        error: 'cantidad and razon are required',
      });
    }

    if (typeof cantidad !== 'number' || cantidad === 0) {
      return res.status(400).json({
        error: 'cantidad must be a non-zero number',
      });
    }

    // Find product
    const product = await Product.findByPk(id, { transaction });
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Handle variant stock adjustment
    let newStock;
    if (variante_id) {
      const variant = await Variant.findOne({
        where: {
          id: variante_id,
          producto_id: id,
        },
        transaction,
      });

      if (!variant) {
        return res.status(404).json({
          error: 'Variant not found',
        });
      }

      newStock = variant.stock_variante + cantidad;
      if (newStock < 0) {
        return res.status(400).json({
          error: `Cannot adjust stock. New stock would be ${newStock}`,
        });
      }

      await variant.update({ stock_variante: newStock }, { transaction });
    } else {
      // Handle product stock adjustment
      newStock = product.stock_actual + cantidad;
      if (newStock < 0) {
        return res.status(400).json({
          error: `Cannot adjust stock. New stock would be ${newStock}`,
        });
      }

      await product.update({ stock_actual: newStock }, { transaction });
    }

    // Record stock history
    await StockHistory.create(
      {
        producto_id: id,
        variante_id: variante_id || null,
        cantidad_ajustada: cantidad,
        stock_anterior: variante_id
          ? (await Variant.findByPk(variante_id)).stock_variante - cantidad
          : product.stock_actual - cantidad,
        stock_nuevo: newStock,
        razon,
        tipo_movimiento: cantidad > 0 ? 'entrada' : 'salida',
        usuario_admin_id: req.admin?.id || null,
      },
      { transaction },
    );

    await transaction.commit();

    res.status(200).json({
      data: {
        producto_id: id,
        variante_id: variante_id || null,
        cantidad_ajustada: cantidad,
        stock_nuevo: newStock,
        razon,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * GET /api/admin/stock/:id/historial
 * Get stock adjustment history for product/variant
 * Query: { page?, limit?, variante_id? }
 */
export const getHistorialStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, variante_id } = req.query;

    const offset = (page - 1) * limit;

    // Verify product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Build where clause
    const where = { producto_id: id };
    if (variante_id) {
      where.variante_id = variante_id;
    }

    // Fetch history
    const { count, rows } = await StockHistory.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'cantidad_ajustada',
        'stock_anterior',
        'stock_nuevo',
        'razon',
        'tipo_movimiento',
        'createdAt',
      ],
    });

    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
