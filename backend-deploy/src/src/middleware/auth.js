/**
 * Authentication Middleware
 * Verifies JWT tokens for admin endpoints
 */

import { verifyToken } from '../utils/jwt.js';

/**
 * Verify JWT token middleware
 * Requires Authorization header: Bearer <token>
 */
export const authRequired = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    const decoded = verifyToken(token);
    req.admin = decoded;
    next();
  } catch (error) {
    const statusCode = error.message === 'Token expired' ? 401 : 403;
    res.status(statusCode).json({
      error: error.message,
    });
  }
};

/**
 * Verify user has super_admin role
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  if (req.admin.rol !== 'super_admin') {
    return res.status(403).json({
      error: 'Super admin access required',
    });
  }

  next();
};

/**
 * Verify user has admin_productos role or super_admin
 */
export const requireProductAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  if (req.admin.rol !== 'admin_productos' && req.admin.rol !== 'super_admin') {
    return res.status(403).json({
      error: 'Product admin access required',
    });
  }

  next();
};

/**
 * Verify user has admin_ofertas role or super_admin
 */
export const requireOfertasAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  if (req.admin.rol !== 'admin_ofertas' && req.admin.rol !== 'super_admin') {
    return res.status(403).json({
      error: 'Offers admin access required',
    });
  }

  next();
};
