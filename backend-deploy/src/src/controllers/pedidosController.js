import { Op } from 'sequelize';
import {
  sequelize,
  Product,
  Offer,
  Client,
  Order,
  OrderItem,
} from '../models/index.js';
import OfertasService from '../services/OfertasService.js';
import StockService from '../services/StockService.js';
import EmailService from '../services/EmailService.js';
import {
  generateOrderNumber,
  validateOrderInput,
} from '../utils/orderHelpers.js';

/**
 * Create new order
 * POST /api/pedidos
 */
export const createPedido = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, cliente, metodoPago } = req.body;

    // Validate input
    const validation = validateOrderInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation error',
        details: validation.errors,
      });
    }

    // Fetch all products for this order
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
      transaction,
    });

    // Build product lookup
    const productoMap = {};
    productos.forEach((p) => {
      productoMap[p.id] = p;
    });

    // Validate all items exist and calculate totals
    const carritoItems = [];
    let subtotal = 0;

    for (const item of items) {
      const producto = productoMap[item.productId];

      if (!producto) {
        await transaction.rollback();
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
          await transaction.rollback();
          return res.status(400).json({
            error: `Variante ${item.variantId} no encontrada`,
          });
        }

        precioUnitario += parseFloat(variante.precio_ajuste || 0);
        stock = variante.stock_variante;
      }

      // Check stock
      if (stock < item.cantidad) {
        await transaction.rollback();
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

    // Evaluate offers
    const carrito = {
      items: items.map((item) => ({
        ...item,
        categoriaId: productoMap[item.productId].categoria_id,
      })),
      subtotal,
      costoEnvio: 0,
    };

    const ofertasResult = OfertasService.evaluateOffersForCart(carrito, ofertasActivas);
    const descuentos = ofertasResult.totalDescuento;
    const total = subtotal - descuentos; // No shipping cost for now

    // Find or create client
    let clientRecord = await Client.findOne(
      { where: { email: cliente.email } },
      { transaction },
    );

    if (!clientRecord) {
      clientRecord = await Client.create(
        {
          email: cliente.email,
          nombre: cliente.nombre,
          telefono: cliente.telefono || null,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          provincia: cliente.provincia,
        },
        { transaction },
      );
    } else {
      // Update client info if provided
      await clientRecord.update(
        {
          nombre: cliente.nombre,
          telefono: cliente.telefono || clientRecord.telefono,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          provincia: cliente.provincia,
        },
        { transaction },
      );
    }

    // Determine order state based on payment method
    const estadoPedido = metodoPago === 'mercado_pago' ? 'pendiente' : 'pago_confirmado';

    // Create order
    const numeroPedido = generateOrderNumber();
    const order = await Order.create(
      {
        numero_pedido: numeroPedido,
        cliente_id: clientRecord.id,
        estado: estadoPedido,
        subtotal,
        descuentos,
        costo_envio: 0,
        total: Math.max(0, total),
        metodo_pago: metodoPago,
        direccion_envio: {
          nombre: cliente.nombre,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          provincia: cliente.provincia,
          telefono: cliente.telefono,
        },
      },
      { transaction },
    );

    // Create order items
    for (const item of carritoItems) {
      await OrderItem.create(
        {
          pedido_id: order.id,
          producto_id: item.productId,
          variante_id: item.variantId,
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario,
        },
        { transaction },
      );
    }

    // Reserve stock for all items
    try {
      for (const item of items) {
        await StockService.reserveStock(
          item.productId,
          item.variantId || undefined,
          item.cantidad,
        );
      }
    } catch (stockError) {
      await transaction.rollback();
      return res.status(409).json({
        error: `Stock reservation failed: ${stockError.message}`,
      });
    }

    // Commit transaction
    await transaction.commit();

    // Send confirmation email (async, don't wait for it)
    const orderData = {
      numero_pedido: numeroPedido,
      fecha: new Date(),
      subtotal,
      descuentos,
      total: Math.max(0, total),
    };

    EmailService.sendOrderConfirmation(cliente, orderData, carritoItems).catch(
      (emailErr) => {
        // eslint-disable-next-line no-console
        console.error('Failed to send order confirmation email:', emailErr);
      },
    );

    // Build response
    const response = {
      numero_pedido: numeroPedido,
      estado: estadoPedido,
      subtotal,
      descuentos,
      total: Math.max(0, total),
    };

    // If Mercado Pago, would add payment link here
    // For now, just return order confirmation
    if (metodoPago === 'mercado_pago') {
      response.proximoPaso = 'ir_a_mercado_pago';
      response.pagoLink = null; // Would be set by payment service
    } else {
      response.proximoPaso = 'esperando_pago';
      response.instrucciones = 'Su pedido está siendo procesado. Nos contactaremos pronto.';
    }

    res.status(201).json({
      data: response,
    });
  } catch (error) {
    // Ensure transaction is rolled back on any error
    if (!error.message.includes('Validation') && !error.message.includes('Stock')) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        // eslint-disable-next-line no-console
        console.error('Rollback error:', rollbackErr);
      }
    }

    next(error);
  }
};
