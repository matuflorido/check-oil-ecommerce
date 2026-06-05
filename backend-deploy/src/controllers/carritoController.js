import { Op } from 'sequelize';
import {
  Product,
  Offer,
} from '../models/index.js';
import OfertasService from '../services/OfertasService.js';

/**
 * Calculate cart with discounts
 * POST /api/carrito
 */
export const calculateCarrito = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: 'Items array is required and must not be empty',
      });
    }

    // Fetch all products and variants
    const productIds = [...new Set(items.map((i) => i.productId))];
    const productos = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        activo: true,
      },
      include: [
        {
          association: 'variants',
          attributes: ['id', 'precio_ajuste', 'stock_variante'],
        },
      ],
    });

    // Build product lookup
    const productoMap = {};
    productos.forEach((p) => {
      productoMap[p.id] = p;
    });

    // Validate stock and calculate line items
    const carritoItems = [];
    let subtotal = 0;

    for (const item of items) {
      const producto = productoMap[item.productId];

      if (!producto) {
        return res.status(400).json({
          error: `Producto ${item.productId} no encontrado o no activo`,
        });
      }

      // Get price for this item
      let precioUnitario = parseFloat(producto.precio_base);

      let stock = producto.stock_actual;

      if (item.variantId) {
        const variante = producto.variants.find((v) => v.id === item.variantId);

        if (!variante) {
          return res.status(400).json({
            error: `Variante ${item.variantId} no encontrada para producto ${item.productId}`,
          });
        }

        precioUnitario += parseFloat(variante.precio_ajuste || 0);
        stock = variante.stock_variante;
      }

      // Check stock
      if (stock < item.cantidad) {
        return res.status(409).json({
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${stock}, Solicitado: ${item.cantidad}`,
        });
      }

      const lineSubtotal = precioUnitario * item.cantidad;
      subtotal += lineSubtotal;

      carritoItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal: lineSubtotal,
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

    // Evaluate offers on full cart
    const carrito = {
      items: items.map((item) => ({
        ...item,
        categoriaId: productoMap[item.productId].categoria_id,
      })),
      subtotal,
      costoEnvio: 0,
    };

    const ofertasResult = OfertasService.evaluateOffersForCart(carrito, ofertasActivas);

    const total = subtotal - ofertasResult.totalDescuento; // No shipping cost for now

    res.status(200).json({
      data: {
        items: carritoItems,
        subtotal,
        descuentos: ofertasResult.totalDescuento,
        costoEnvio: 0,
        total: Math.max(0, total),
        aplicableOfertas: ofertasResult.aplicableOfertas,
        detalles: ofertasResult.detalles,
      },
    });
  } catch (error) {
    next(error);
  }
};
