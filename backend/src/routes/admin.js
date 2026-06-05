/**
 * Admin Routes
 * All endpoints require JWT authentication
 */

import express from 'express';
import { authRequired, requireSuperAdmin, requireProductAdmin, requireOfertasAdmin } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as productsController from '../controllers/admin/productsController.js';
import * as ofertasController from '../controllers/admin/ofertasController.js';
import * as stockController from '../controllers/admin/stockController.js';
import * as reportesController from '../controllers/admin/reportesController.js';
import * as usuariosController from '../controllers/admin/usuariosController.js';
import * as pedidosController from '../controllers/admin/pedidosController.js';

const router = express.Router();

/**
 * Authentication routes (no auth required)
 */
router.post('/login', authController.login);
router.get('/verify-token', authRequired, authController.verifyToken);
router.post('/logout', authRequired, authController.logout);

/**
 * Product management routes (admin_productos or super_admin)
 */
router.get('/productos', authRequired, requireProductAdmin, productsController.getProductos);
router.get('/productos/:id', authRequired, requireProductAdmin, productsController.getProducto);
router.post('/productos', authRequired, requireProductAdmin, productsController.createProducto);
router.put('/productos/:id', authRequired, requireProductAdmin, productsController.updateProducto);
router.delete('/productos/:id', authRequired, requireProductAdmin, productsController.deleteProducto);
router.post('/productos/:id/upload-image', authRequired, requireProductAdmin, productsController.uploadProductImage);

// Variant routes
router.post('/productos/:id/variantes', authRequired, requireProductAdmin, productsController.createVariante);
router.put('/productos/:id/variantes/:variantId', authRequired, requireProductAdmin, productsController.updateVariante);
router.delete('/productos/:id/variantes/:variantId', authRequired, requireProductAdmin, productsController.deleteVariante);

/**
 * Offers management routes (admin_ofertas or super_admin)
 */
router.get('/ofertas', authRequired, requireOfertasAdmin, ofertasController.getOfertas);
router.get('/ofertas/:id', authRequired, requireOfertasAdmin, ofertasController.getOferta);
router.post('/ofertas', authRequired, requireOfertasAdmin, ofertasController.createOferta);
router.put('/ofertas/:id', authRequired, requireOfertasAdmin, ofertasController.updateOferta);
router.delete('/ofertas/:id', authRequired, requireOfertasAdmin, ofertasController.deleteOferta);
router.patch('/ofertas/:id/toggle', authRequired, requireOfertasAdmin, ofertasController.toggleOferta);

/**
 * Stock management routes (admin_productos or super_admin)
 */
router.get('/stock', authRequired, requireProductAdmin, stockController.getStock);
router.post('/stock/:id/ajustar', authRequired, requireProductAdmin, stockController.ajustarStock);
router.get('/stock/:id/historial', authRequired, requireProductAdmin, stockController.getHistorialStock);

/**
 * Reports routes (all authenticated users)
 */
router.get('/reportes/ventas', authRequired, reportesController.getReporteVentas);
router.get('/reportes/productos-populares', authRequired, reportesController.getReporteProductosPopulares);
router.get('/reportes/clientes', authRequired, reportesController.getReporteClientes);
router.get('/reportes/stock-bajo', authRequired, reportesController.getReporteStockBajo);
router.get('/reportes/export', authRequired, reportesController.exportarReporte);

/**
 * User management routes (super_admin only)
 */
router.get('/usuarios', authRequired, requireSuperAdmin, usuariosController.getUsuarios);
router.get('/usuarios/:id', authRequired, requireSuperAdmin, usuariosController.getUsuario);
router.post('/usuarios', authRequired, requireSuperAdmin, usuariosController.createUsuario);
router.put('/usuarios/:id', authRequired, requireSuperAdmin, usuariosController.updateUsuario);
router.delete('/usuarios/:id', authRequired, requireSuperAdmin, usuariosController.deleteUsuario);

/**
 * Order management routes (all authenticated users)
 */
router.get('/pedidos', authRequired, pedidosController.getPedidos);
router.get('/pedidos/:id', authRequired, pedidosController.getPedido);
router.patch('/pedidos/:id/estado', authRequired, pedidosController.actualizarEstadoPedido);
router.post('/pedidos/:id/coordinar-envio', authRequired, pedidosController.coordinarEnvio);

/**
 * Health check
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Check-Oil Admin API',
    version: '1.0.0',
  });
});

export default router;
