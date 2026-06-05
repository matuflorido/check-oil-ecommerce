/**
 * Admin Products Controller (Task 11)
 * CRUD operations for products with image handling
 */

import { Op } from 'sequelize';
import {
  sequelize,
  Product,
  Variant,
  Category,
} from '../../models/index.js';
import CloudinaryService from '../../services/CloudinaryService.js';

/**
 * GET /api/admin/productos
 * List all products with filters
 * Query: { page?, limit?, categoria?, search?, estado? }
 */
export const getProductos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoria,
      search,
      estado,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (categoria) {
      where.categoria_id = categoria;
    }
    if (estado !== undefined) {
      where.activo = estado === 'activo';
    }
    if (search) {
      where.nombre = { [Op.iLike]: `%${search}%` };
    }

    // Fetch products
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          association: 'category',
          attributes: ['id', 'nombre'],
        },
        {
          association: 'variants',
          attributes: ['id', 'nombre', 'stock_variante', 'precio_ajuste'],
        },
      ],
      offset,
      limit,
      order: [['nombre', 'ASC']],
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
 * GET /api/admin/productos/:id
 * Get single product with variants
 */
export const getProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          association: 'category',
          attributes: ['id', 'nombre'],
        },
        {
          association: 'variants',
          attributes: ['id', 'nombre', 'stock_variante', 'precio_ajuste'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    res.status(200).json({
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/productos
 * Create new product
 * Body: { nombre, descripcion, categoria_id, precio_base, sku, imagen_url?, stock_actual? }
 */
export const createProducto = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      nombre,
      descripcion,
      categoria_id,
      precio_base,
      sku,
      imagen_url,
      stock_actual,
    } = req.body;

    // Validate required fields
    if (!nombre || !categoria_id || precio_base === undefined || !sku) {
      return res.status(400).json({
        error: 'nombre, categoria_id, precio_base, and sku are required',
      });
    }

    // Verify category exists
    const category = await Category.findByPk(categoria_id, { transaction });
    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
      });
    }

    // Create product
    const product = await Product.create(
      {
        nombre,
        descripcion,
        categoria_id,
        precio_base: parseFloat(precio_base),
        sku,
        imagen_url: imagen_url || null,
        stock_actual: parseInt(stock_actual) || 0,
        activo: true,
      },
      { transaction },
    );

    await transaction.commit();

    res.status(201).json({
      data: product,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * PUT /api/admin/productos/:id
 * Update product
 */
export const updateProducto = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria_id,
      precio_base,
      sku,
      imagen_url,
      stock_actual,
      activo,
    } = req.body;

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // If changing category, verify it exists
    if (categoria_id && categoria_id !== product.categoria_id) {
      const category = await Category.findByPk(categoria_id, { transaction });
      if (!category) {
        return res.status(404).json({
          error: 'Category not found',
        });
      }
    }

    // Update product
    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (categoria_id !== undefined) updates.categoria_id = categoria_id;
    if (precio_base !== undefined) updates.precio_base = parseFloat(precio_base);
    if (sku !== undefined) updates.sku = sku;
    if (imagen_url !== undefined) updates.imagen_url = imagen_url;
    if (stock_actual !== undefined) updates.stock_actual = parseInt(stock_actual);
    if (activo !== undefined) updates.activo = activo;

    await product.update(updates, { transaction });
    await transaction.commit();

    res.status(200).json({
      data: product,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * DELETE /api/admin/productos/:id
 * Soft delete product (mark as inactive)
 */
export const deleteProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Soft delete
    await product.update({ activo: false });

    res.status(200).json({
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/productos/:id/upload-image
 * Upload product image via Cloudinary
 * Body: FormData with 'image' file
 */
export const uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
      });
    }

    // Delete old image if exists
    if (product.imagen_cloudinary_id) {
      await CloudinaryService.deleteImage(product.imagen_cloudinary_id);
    }

    // Upload new image
    const uploadResult = await CloudinaryService.uploadBase64(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: `check-oil/productos/${id}`,
        publicId: `producto-${id}`,
        width: 800,
        height: 800,
        quality: 85,
      },
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        error: uploadResult.error,
      });
    }

    // Update product with image URL and cloudinary ID
    await product.update({
      imagen_url: uploadResult.url,
      imagen_cloudinary_id: uploadResult.publicId,
    });

    res.status(200).json({
      data: {
        imagen_url: uploadResult.url,
        imagen_cloudinary_id: uploadResult.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/productos/:id/variantes
 * Create product variant
 */
export const createVariante = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, precio_ajuste, stock_variante } = req.body;

    // Verify product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Create variant
    const variant = await Variant.create({
      producto_id: id,
      nombre,
      precio_ajuste: parseFloat(precio_ajuste) || 0,
      stock_variante: parseInt(stock_variante) || 0,
    });

    res.status(201).json({
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/productos/:id/variantes/:variantId
 * Update product variant
 */
export const updateVariante = async (req, res, next) => {
  try {
    const { id, variantId } = req.params;
    const { nombre, precio_ajuste, stock_variante } = req.body;

    // Verify product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Find variant
    const variant = await Variant.findOne({
      where: {
        id: variantId,
        producto_id: id,
      },
    });

    if (!variant) {
      return res.status(404).json({
        error: 'Variant not found',
      });
    }

    // Update variant
    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (precio_ajuste !== undefined) updates.precio_ajuste = parseFloat(precio_ajuste);
    if (stock_variante !== undefined) updates.stock_variante = parseInt(stock_variante);

    await variant.update(updates);

    res.status(200).json({
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/productos/:id/variantes/:variantId
 * Delete product variant
 */
export const deleteVariante = async (req, res, next) => {
  try {
    const { id, variantId } = req.params;

    // Verify product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
      });
    }

    // Find and delete variant
    const variant = await Variant.findOne({
      where: {
        id: variantId,
        producto_id: id,
      },
    });

    if (!variant) {
      return res.status(404).json({
        error: 'Variant not found',
      });
    }

    await variant.destroy();

    res.status(200).json({
      message: 'Variant deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
