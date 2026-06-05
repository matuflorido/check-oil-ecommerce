/**
 * Admin Reports Controller (Task 13)
 * Reporting endpoints for sales, products, clients, and stock
 */

import { Op } from 'sequelize';
import { sequelize, Order, OrderItem, Product, Client, StockHistory } from '../../models/index.js';

/**
 * GET /api/admin/reportes/ventas
 * Sales report with date range and statistics
 * Query: { fechaInicio?, fechaFin?, estado? }
 */
export const getReporteVentas = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin, estado } = req.query;

    // Build where clause
    const where = {};

    if (fechaInicio || fechaFin) {
      where.createdAt = {};
      if (fechaInicio) {
        where.createdAt[Op.gte] = new Date(fechaInicio);
      }
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = finDate;
      }
    }

    if (estado) {
      where.estado = estado;
    }

    // Fetch orders
    const orders = await Order.findAll({
      where,
      include: [
        {
          association: 'items',
          attributes: ['cantidad', 'precio_unitario'],
          include: [
            {
              model: Product,
              attributes: ['nombre'],
            },
          ],
        },
        {
          model: Client,
          attributes: ['nombre', 'email'],
        },
      ],
      order: [['fecha_pedido', 'DESC']],
    });

    // Calculate statistics
    const stats = {
      totalPedidos: orders.length,
      totalVentas: orders.reduce((sum, o) => sum + o.total, 0),
      totalSubtotal: orders.reduce((sum, o) => sum + o.subtotal, 0),
      totalDescuentos: orders.reduce((sum, o) => sum + o.descuentos, 0),
      promedioTicket: 0,
      porEstado: {},
    };

    if (orders.length > 0) {
      stats.promedioTicket = stats.totalVentas / orders.length;
    }

    // Count by status
    orders.forEach((o) => {
      stats.porEstado[o.estado] = (stats.porEstado[o.estado] || 0) + 1;
    });

    res.status(200).json({
      data: {
        estadisticas: stats,
        pedidos: orders.map((o) => ({
          id: o.id,
          numero_pedido: o.numero_pedido,
          cliente: o.Client?.nombre,
          subtotal: o.subtotal,
          descuentos: o.descuentos,
          total: o.total,
          estado: o.estado,
          fecha_pedido: o.fecha_pedido,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reportes/productos-populares
 * Top selling products report
 * Query: { limit?, fechaInicio?, fechaFin? }
 */
export const getReporteProductosPopulares = async (req, res, next) => {
  try {
    const { limit = 10, fechaInicio, fechaFin } = req.query;

    // Build order where clause
    const orderWhere = {};
    if (fechaInicio || fechaFin) {
      orderWhere.createdAt = {};
      if (fechaInicio) {
        orderWhere.createdAt[Op.gte] = new Date(fechaInicio);
      }
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23, 59, 59, 999);
        orderWhere.createdAt[Op.lte] = finDate;
      }
    }

    // Get order items with their products
    const items = await OrderItem.findAll({
      where: {},
      include: [
        {
          model: Order,
          where: orderWhere,
          attributes: [],
          required: true,
        },
        {
          model: Product,
          attributes: ['id', 'nombre', 'precio_base'],
          required: true,
        },
      ],
      attributes: ['cantidad', 'precio_unitario'],
      raw: true,
    });

    // Aggregate by product
    const productSales = {};
    items.forEach((item) => {
      const productId = item['Product.id'];
      if (!productSales[productId]) {
        productSales[productId] = {
          id: productId,
          nombre: item['Product.nombre'],
          precio_base: item['Product.precio_base'],
          cantidadVendida: 0,
          ingresoTotal: 0,
        };
      }
      productSales[productId].cantidadVendida += item.cantidad;
      productSales[productId].ingresoTotal += item.cantidad * item.precio_unitario;
    });

    // Sort by sales volume and limit
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, limit);

    res.status(200).json({
      data: topProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reportes/clientes
 * Client report with order history
 * Query: { page?, limit?, ordenarPor? }
 */
export const getReporteClientes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, ordenarPor = 'gastado' } = req.query;
    const offset = (page - 1) * limit;

    // Fetch clients with order counts
    const clients = await Client.findAll({
      attributes: ['id', 'nombre', 'email', 'ciudad', 'provincia'],
      include: [
        {
          association: 'Orders',
          attributes: ['id', 'total', 'estado'],
          required: false,
        },
      ],
    });

    // Calculate stats per client
    const clientStats = clients.map((client) => {
      const orders = client.Orders || [];
      const gastado = orders.reduce((sum, o) => sum + o.total, 0);
      const cantidadOrdenes = orders.length;

      return {
        id: client.id,
        nombre: client.nombre,
        email: client.email,
        ciudad: client.ciudad,
        provincia: client.provincia,
        cantidadOrdenes,
        totalGastado: gastado,
        promedioGasto: cantidadOrdenes > 0 ? gastado / cantidadOrdenes : 0,
      };
    });

    // Sort
    let sorted = clientStats;
    if (ordenarPor === 'gastado') {
      sorted = clientStats.sort((a, b) => b.totalGastado - a.totalGastado);
    } else if (ordenarPor === 'ordenes') {
      sorted = clientStats.sort((a, b) => b.cantidadOrdenes - a.cantidadOrdenes);
    }

    // Paginate
    const paginated = sorted.slice(offset, offset + limit);

    res.status(200).json({
      data: paginated,
      pagination: {
        total: sorted.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(sorted.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reportes/stock-bajo
 * Low stock alert report
 * Query: { umbral?, limit? }
 */
export const getReporteStockBajo = async (req, res, next) => {
  try {
    const { umbral = 10, limit = 50 } = req.query;

    // Get products with low stock
    const products = await Product.findAll({
      where: {
        stock_actual: { [Op.lte]: umbral },
      },
      attributes: ['id', 'nombre', 'sku', 'stock_actual', 'precio_base'],
      order: [['stock_actual', 'ASC']],
      limit,
    });

    res.status(200).json({
      data: {
        umbral: parseInt(umbral),
        cantidadProductos: products.length,
        productos: products,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/reportes/export
 * Export report as CSV
 * Query: { tipo: 'ventas' | 'productos' | 'clientes' | 'stock' }
 */
export const exportarReporte = async (req, res, next) => {
  try {
    const { tipo } = req.query;

    if (!tipo) {
      return res.status(400).json({
        error: 'tipo parameter required: ventas, productos, clientes, or stock',
      });
    }

    let csvContent = '';
    let filename = '';

    switch (tipo) {
      case 'ventas': {
        const orders = await Order.findAll({
          include: [
            {
              model: Client,
              attributes: ['nombre', 'email'],
            },
          ],
        });

        csvContent = 'Numero Pedido,Cliente,Subtotal,Descuentos,Total,Estado,Fecha\n';
        orders.forEach((o) => {
          csvContent += `${o.numero_pedido},"${o.Client?.nombre}",${o.subtotal},${o.descuentos},${o.total},${o.estado},${o.fecha_pedido}\n`;
        });
        filename = 'reporte-ventas.csv';
        break;
      }

      case 'productos': {
        const products = await Product.findAll({
          attributes: ['nombre', 'sku', 'precio_base', 'stock_actual'],
        });

        csvContent = 'Nombre,SKU,Precio Base,Stock Actual\n';
        products.forEach((p) => {
          csvContent += `"${p.nombre}",${p.sku},${p.precio_base},${p.stock_actual}\n`;
        });
        filename = 'reporte-productos.csv';
        break;
      }

      case 'clientes': {
        const clients = await Client.findAll({
          attributes: ['nombre', 'email', 'ciudad', 'provincia'],
        });

        csvContent = 'Nombre,Email,Ciudad,Provincia\n';
        clients.forEach((c) => {
          csvContent += `"${c.nombre}",${c.email},${c.ciudad},${c.provincia}\n`;
        });
        filename = 'reporte-clientes.csv';
        break;
      }

      case 'stock': {
        const products = await Product.findAll({
          attributes: ['nombre', 'sku', 'stock_actual'],
          where: {
            stock_actual: { [Op.lte]: 10 },
          },
        });

        csvContent = 'Nombre,SKU,Stock Actual\n';
        products.forEach((p) => {
          csvContent += `"${p.nombre}",${p.sku},${p.stock_actual}\n`;
        });
        filename = 'reporte-stock-bajo.csv';
        break;
      }

      default:
        return res.status(400).json({
          error: 'Invalid tipo parameter',
        });
    }

    // Send CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
