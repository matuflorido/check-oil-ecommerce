/**
 * Admin Ofertas Controller (Task 12)
 * CRUD operations for promotional offers
 */

import { Op } from 'sequelize';
import { sequelize, Offer, Product, Category } from '../../models/index.js';

/**
 * GET /api/admin/ofertas
 * List all offers with filters
 * Query: { page?, limit?, estado?, search? }
 */
export const getOfertas = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      estado,
      search,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (estado !== undefined) {
      where.activa = estado === 'activa';
    }
    if (search) {
      where.nombre = { [Op.iLike]: `%${search}%` };
    }

    // Fetch offers
    const { count, rows } = await Offer.findAndCountAll({
      where,
      offset,
      limit,
      order: [['fecha_inicio', 'DESC']],
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

/**
 * GET /api/admin/ofertas/:id
 * Get single offer
 */
export const getOferta = async (req, res, next) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findByPk(id);

    if (!offer) {
      return res.status(404).json({
        error: 'Offer not found',
      });
    }

    res.status(200).json({
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate offer conditions
 * @param {Object} condiciones - Offer conditions
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validateCondiciones = (condiciones) => {
  const errors = [];

  if (!condiciones) {
    return { valid: false, errors: ['condiciones is required'] };
  }

  const { tipo, valor, aplicarA } = condiciones;

  if (!tipo || !['porcentaje', 'monto_fijo', 'compre_x_pague_y'].includes(tipo)) {
    errors.push('tipo must be porcentaje, monto_fijo, or compre_x_pague_y');
  }

  if (tipo !== 'compre_x_pague_y') {
    if (valor === undefined || valor <= 0) {
      errors.push('valor must be positive number');
    }
    if (tipo === 'porcentaje' && valor > 100) {
      errors.push('porcentaje cannot exceed 100');
    }
  }

  if (!aplicarA || !['carrito_completo', 'categoria', 'producto'].includes(aplicarA)) {
    errors.push('aplicarA must be carrito_completo, categoria, or producto');
  }

  if (aplicarA !== 'carrito_completo') {
    if (!condiciones.id_categoria && !condiciones.id_producto) {
      errors.push(`id_categoria or id_producto required for aplicarA=${aplicarA}`);
    }
  }

  // Validate compre_x_pague_y specific fields
  if (tipo === 'compre_x_pague_y') {
    if (!condiciones.cantidad_compre || condiciones.cantidad_compre <= 0) {
      errors.push('cantidad_compre must be positive for compre_x_pague_y');
    }
    if (!condiciones.cantidad_pague || condiciones.cantidad_pague <= 0) {
      errors.push('cantidad_pague must be positive for compre_x_pague_y');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * POST /api/admin/ofertas
 * Create new offer
 * Body: { nombre, descripcion, condiciones, fecha_inicio, fecha_fin, prioridad? }
 */
export const createOferta = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      nombre,
      descripcion,
      condiciones,
      fecha_inicio,
      fecha_fin,
      prioridad,
    } = req.body;

    // Validate required fields
    if (!nombre || !condiciones || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'nombre, condiciones, fecha_inicio, and fecha_fin are required',
      });
    }

    // Validate date range
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (inicio >= fin) {
      return res.status(400).json({
        error: 'fecha_fin must be after fecha_inicio',
      });
    }

    // Validate conditions
    const condicionValidation = validateCondiciones(condiciones);
    if (!condicionValidation.valid) {
      return res.status(400).json({
        error: 'Invalid condiciones',
        details: condicionValidation.errors,
      });
    }

    // Verify referenced entities exist
    if (condiciones.id_categoria) {
      const category = await Category.findByPk(condiciones.id_categoria, { transaction });
      if (!category) {
        return res.status(404).json({
          error: 'Category not found',
        });
      }
    }

    if (condiciones.id_producto) {
      const product = await Product.findByPk(condiciones.id_producto, { transaction });
      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
        });
      }
    }

    // Create offer
    const offer = await Offer.create(
      {
        nombre,
        descripcion,
        condiciones,
        fecha_inicio: inicio,
        fecha_fin: fin,
        prioridad: prioridad || 1,
        activa: true,
      },
      { transaction },
    );

    await transaction.commit();

    res.status(201).json({
      data: offer,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * PUT /api/admin/ofertas/:id
 * Update offer
 */
export const updateOferta = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      condiciones,
      fecha_inicio,
      fecha_fin,
      prioridad,
      activa,
    } = req.body;

    const offer = await Offer.findByPk(id, { transaction });

    if (!offer) {
      return res.status(404).json({
        error: 'Offer not found',
      });
    }

    // Validate date range if changing
    if (fecha_inicio || fecha_fin) {
      const inicio = new Date(fecha_inicio || offer.fecha_inicio);
      const fin = new Date(fecha_fin || offer.fecha_fin);

      if (inicio >= fin) {
        return res.status(400).json({
          error: 'fecha_fin must be after fecha_inicio',
        });
      }
    }

    // Validate conditions if changing
    if (condiciones) {
      const condicionValidation = validateCondiciones(condiciones);
      if (!condicionValidation.valid) {
        return res.status(400).json({
          error: 'Invalid condiciones',
          details: condicionValidation.errors,
        });
      }

      // Verify referenced entities
      if (condiciones.id_categoria) {
        const category = await Category.findByPk(condiciones.id_categoria, {
          transaction,
        });
        if (!category) {
          return res.status(404).json({
            error: 'Category not found',
          });
        }
      }

      if (condiciones.id_producto) {
        const product = await Product.findByPk(condiciones.id_producto, {
          transaction,
        });
        if (!product) {
          return res.status(404).json({
            error: 'Product not found',
          });
        }
      }
    }

    // Update offer
    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (condiciones !== undefined) updates.condiciones = condiciones;
    if (fecha_inicio !== undefined) updates.fecha_inicio = new Date(fecha_inicio);
    if (fecha_fin !== undefined) updates.fecha_fin = new Date(fecha_fin);
    if (prioridad !== undefined) updates.prioridad = prioridad;
    if (activa !== undefined) updates.activa = activa;

    await offer.update(updates, { transaction });
    await transaction.commit();

    res.status(200).json({
      data: offer,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * DELETE /api/admin/ofertas/:id
 * Delete offer
 */
export const deleteOferta = async (req, res, next) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findByPk(id);

    if (!offer) {
      return res.status(404).json({
        error: 'Offer not found',
      });
    }

    await offer.destroy();

    res.status(200).json({
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/ofertas/:id/toggle
 * Activate/deactivate offer
 */
export const toggleOferta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activa } = req.body;

    if (typeof activa !== 'boolean') {
      return res.status(400).json({
        error: 'activa must be boolean',
      });
    }

    const offer = await Offer.findByPk(id);

    if (!offer) {
      return res.status(404).json({
        error: 'Offer not found',
      });
    }

    await offer.update({ activa });

    res.status(200).json({
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};
