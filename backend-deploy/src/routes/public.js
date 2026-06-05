import express from 'express';
import {
  getProductos,
  getProductoDetail,
  getCategorias,
} from '../controllers/productsController.js';
import {
  getOfertasActivas,
} from '../controllers/ofertasController.js';
import {
  calculateCarrito,
} from '../controllers/carritoController.js';
import {
  createPedido,
} from '../controllers/pedidosController.js';
import {
  validate,
  queryProductosSchema,
  queryOfertasSchema,
  carritoSchema,
  pedidoSchema,
} from '../utils/validators.js';

const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.json({
    message: 'Check-Oil Public API',
    version: '1.0.0',
  });
});

// Products endpoints
router.get(
  '/productos',
  validate(queryProductosSchema, 'query'),
  getProductos,
);
router.get('/productos/:id', getProductoDetail);

// Categories endpoint
router.get('/categorias', getCategorias);

// Offers endpoint
router.get(
  '/ofertas',
  validate(queryOfertasSchema, 'query'),
  getOfertasActivas,
);

// Cart endpoint
router.post(
  '/carrito',
  validate(carritoSchema, 'body'),
  calculateCarrito,
);

// Orders endpoint
router.post(
  '/pedidos',
  validate(pedidoSchema, 'body'),
  createPedido,
);

export default router;
