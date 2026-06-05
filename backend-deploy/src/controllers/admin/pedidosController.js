/**
 * Admin Pedidos Controller (Task 15)
 * Order management and status updates
 */

import { Op } from 'sequelize';
import { Order, Client, OrderItem, Product } from '../../models/index.js';
import EmailService from '../../services/EmailService.js';

/**
 * GET /api/admin/pedidos
 * List orders with filters
 * Query: { page?, limit?, estado?, fechaInicio?, fechaFin?, search? }
 */
export const getPedidos = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      estado,
      fechaInicio,
      fechaFin,
      search,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (estado) {
      where.estado = estado;
    }

    if (fechaInicio || fechaFin) {
      where.fecha_pedido = {};
      if (fechaInicio) {
        where.fecha_pedido[Op.gte] = new Date(fechaInicio);
      }
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23, 59, 59, 999);
        where.fecha_pedido[Op.lte] = finDate;
      }
    }

    // Build client where clause for search
    const clientWhere = {};
    if (search) {
      clientWhere[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Fetch orders
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          where: search ? clientWhere : {},
          attributes: ['id', 'nombre', 'email', 'ciudad'],
          required: search ? true : false,
        },
        {
          association: 'items',
          attributes: ['cantidad', 'precio_unitario'],
        },
      ],
      offset,
      limit,
      order: [['fecha_pedido', 'DESC']],
    });

    const formattedData = rows.map((o) => ({
      id: o.id,
      numero_pedido: o.numero_pedido,
      cliente_nombre: o.Client?.nombre,
      cliente_email: o.Client?.email,
      estado: o.estado,
      subtotal: o.subtotal,
      descuentos: o.descuentos,
      total: o.total,
      fecha_pedido: o.fecha_pedido,
      metodo_pago: o.metodo_pago,
      cantidad_items: o.items?.length || 0,
    }));

    res.status(200).json({
      data: formattedData,
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
 * GET /api/admin/pedidos/:id
 * Get order detail
 */
export const getPedido = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Client,
          attributes: ['id', 'nombre', 'email', 'telefono', 'ciudad', 'provincia'],
        },
        {
          association: 'items',
          attributes: ['id', 'cantidad', 'precio_unitario'],
          include: [
            {
              model: Product,
              attributes: ['id', 'nombre', 'sku'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    res.status(200).json({
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/pedidos/:id/estado
 * Update order status
 * Body: { estado: string, notas?: string }
 */
export const actualizarEstadoPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    // Validate estado
    const validEstados = [
      'pendiente',
      'pago_confirmado',
      'preparando',
      'envio_coordinado',
      'entregado',
      'cancelado',
    ];

    if (!estado || !validEstados.includes(estado)) {
      return res.status(400).json({
        error: `estado must be one of: ${validEstados.join(', ')}`,
      });
    }

    // Find order
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Client,
          attributes: ['nombre', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // Update order
    const estadoAnterior = order.estado;
    await order.update({
      estado,
      notas: notas || order.notas,
    });

    // Send status update email
    const cliente = order.Client;
    const orderData = {
      numero_pedido: order.numero_pedido,
      fecha: order.fecha_pedido,
    };

    EmailService.sendStatusUpdate(cliente, orderData, estado).catch((emailErr) => {
      console.error('Failed to send status update email:', emailErr);
    });

    res.status(200).json({
      data: {
        id: order.id,
        numero_pedido: order.numero_pedido,
        estado_anterior: estadoAnterior,
        estado_nuevo: estado,
        notas: order.notas,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/pedidos/:id/coordinar-envio
 * Send shipping coordination email
 * Body: { instrucciones?: string }
 */
export const coordinarEnvio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { instrucciones } = req.body;

    // Find order
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Client,
          attributes: ['nombre', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // Send coordination email
    const cliente = order.Client;
    const defaultInstrucciones = instrucciones || 'Por favor coordina tu horario de entrega contándonos disponibilidad.';

    EmailService.sendCoordinateShipping(cliente, order, defaultInstrucciones).catch(
      (emailErr) => {
        console.error('Failed to send shipping coordination email:', emailErr);
      },
    );

    // Update order status if not already in envio_coordinado
    if (order.estado !== 'envio_coordinado') {
      await order.update({ estado: 'envio_coordinado' });
    }

    res.status(200).json({
      data: {
        numero_pedido: order.numero_pedido,
        message: 'Shipping coordination email sent',
        instrucciones: defaultInstrucciones,
      },
    });
  } catch (error) {
    next(error);
  }
};
