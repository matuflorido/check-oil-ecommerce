import Joi from 'joi';

/**
 * Joi validation schemas for public API endpoints
 */

// Products list query parameters
export const queryProductosSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  categoria: Joi.string().uuid().optional(),
  precioMin: Joi.number().min(0).optional(),
  precioMax: Joi.number().min(0).optional(),
  search: Joi.string().max(255).optional(),
  ordenar: Joi.string().valid('nombre', 'precio', 'nuevo').default('nombre'),
}).unknown(false);

// Ofertas list query parameters
export const queryOfertasSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
}).unknown(false);

// Cart calculation request body
export const carritoSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        variantId: Joi.string().uuid().optional(),
        cantidad: Joi.number().integer().min(1).required(),
      }).unknown(false),
    )
    .min(1)
    .required(),
}).unknown(false);

// Order creation request body
export const pedidoSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().required(),
        variantId: Joi.string().uuid().optional(),
        cantidad: Joi.number().integer().min(1).required(),
      }).unknown(false),
    )
    .min(1)
    .required(),
  cliente: Joi.object({
    email: Joi.string().email().required(),
    nombre: Joi.string().max(255).required(),
    telefono: Joi.string().max(20).optional(),
    direccion: Joi.string().max(500).required(),
    ciudad: Joi.string().max(255).required(),
    provincia: Joi.string().max(255).required(),
  }).unknown(false).required(),
  metodoPago: Joi.string()
    .valid('mercado_pago', 'transferencia', 'efectivo')
    .required(),
}).unknown(false);

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {string} target - What to validate: 'body', 'query', or 'params'
 * @returns {Function} Express middleware
 */
export const validate = (schema, target = 'body') => (req, res, next) => {
  const source = req[target];
  const { error, value } = schema.validate(source, { stripUnknown: true });

  if (error) {
    res.status(400).json({
      error: 'Validation error',
      details: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
    return;
  }

  // Replace original with validated and cleaned value
  req[target] = value;
  next();
};
