import { Op } from 'sequelize';
import {
  Category,
  Product,
  Offer,
} from '../models/index.js';
import OfertasService from '../services/OfertasService.js';

/**
 * Get paginated list of products with filters
 * GET /api/productos
 */
export const getProductos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoria,
      precioMin,
      precioMax,
      search,
      ordenar = 'nombre',
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = { activo: true };

    if (categoria) {
      where.categoria_id = categoria;
    }

    if (precioMin !== undefined || precioMax !== undefined) {
      where.precio_base = {};
      if (precioMin !== undefined) {
        where.precio_base[Op.gte] = precioMin;
      }
      if (precioMax !== undefined) {
        where.precio_base[Op.lte] = precioMax;
      }
    }

    if (search) {
      where.nombre = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Determine order
    let order = [['nombre', 'ASC']];
    if (ordenar === 'precio') {
      order = [['precio_base', 'ASC']];
    } else if (ordenar === 'nuevo') {
      order = [['createdAt', 'DESC']];
    }

    // Query products
    const { count, rows: productos } = await Product.findAndCountAll({
      where,
      include: [
        {
          association: 'variants',
          attributes: ['id', 'nombre', 'precio_ajuste', 'stock_variante', 'atributos'],
        },
        {
          association: 'category',
          attributes: ['id', 'nombre', 'slug'],
        },
      ],
      limit,
      offset,
      order,
      attributes: ['id', 'nombre', 'precio_base', 'stock_actual', 'imagen_url'],
    });

    // Get active offers for discount calculation
    const ahora = new Date();
    const ofertasActivas = await Offer.findAll({
      where: {
        activa: true,
        fecha_inicio: { [Op.lte]: ahora },
        fecha_fin: { [Op.gte]: ahora },
      },
      raw: true,
    });

    // Calculate applicable offers for display
    const productosConOfertas = productos.map((prod) => {
      const precioBase = parseFloat(prod.precio_base);
      const carrito = {
        items: [{ productId: prod.id, cantidad: 1 }],
        subtotal: precioBase,
      };

      const ofertasResult = OfertasService.evaluateOffersForCart(carrito, ofertasActivas);
      const prodData = prod.toJSON();

      return {
        ...prodData,
        precio_base: precioBase,
        aplicableOfertas: ofertasResult.aplicableOfertas,
        descuentoTotal: ofertasResult.totalDescuento,
        precioFinal: Math.max(0, precioBase - ofertasResult.totalDescuento),
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: {
        productos: productosConOfertas,
        total: count,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product detail with offers
 * GET /api/productos/:id
 */
export const getProductoDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Product.findByPk(id, {
      include: [
        {
          association: 'variants',
          attributes: ['id', 'nombre', 'precio_ajuste', 'stock_variante', 'atributos'],
        },
        {
          association: 'category',
          attributes: ['id', 'nombre', 'slug'],
        },
      ],
    });

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
      });
    }

    if (!producto.activo) {
      return res.status(404).json({
        error: 'Producto no disponible',
      });
    }

    // Get active offers
    const ahora = new Date();
    const ofertasActivas = await Offer.findAll({
      where: {
        activa: true,
        fecha_inicio: { [Op.lte]: ahora },
        fecha_fin: { [Op.gte]: ahora },
      },
      raw: true,
    });

    // Evaluate offers for this product
    const precioBase = parseFloat(producto.precio_base);
    const carrito = {
      items: [{ productId: producto.id, cantidad: 1 }],
      subtotal: precioBase,
    };

    const ofertasResult = OfertasService.evaluateOffersForCart(carrito, ofertasActivas);
    const prodData = producto.toJSON();

    res.status(200).json({
      data: {
        ...prodData,
        precio_base: precioBase,
        aplicableOfertas: ofertasResult.aplicableOfertas,
        descuentoTotal: ofertasResult.totalDescuento,
        precioFinal: Math.max(0, precioBase - ofertasResult.totalDescuento),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get categories hierarchically
 * GET /api/categorias
 */
export const getCategorias = async (req, res, next) => {
  try {
    // Get all active categories
    const categorias = await Category.findAll({
      where: { activa: true },
      attributes: ['id', 'nombre', 'slug', 'descripcion', 'parent_id', 'orden'],
      order: [['orden', 'ASC'], ['nombre', 'ASC']],
    });

    // Build hierarchy: parent categories with subcategories
    const parentCategorias = categorias
      .filter((c) => !c.parent_id)
      .map((cat) => {
        const subcategorias = categorias
          .filter((c) => c.parent_id === cat.id)
          .map((sub) => ({
            id: sub.id,
            nombre: sub.nombre,
            slug: sub.slug,
            descripcion: sub.descripcion,
          }));

        return {
          id: cat.id,
          nombre: cat.nombre,
          slug: cat.slug,
          descripcion: cat.descripcion,
          subcategorias,
        };
      });

    res.status(200).json({
      data: {
        categorias: parentCategorias,
      },
    });
  } catch (error) {
    next(error);
  }
};
