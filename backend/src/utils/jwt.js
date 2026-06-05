/**
 * JWT Token Management
 * Handles token generation and verification for admin authentication
 */

import jwt from 'jsonwebtoken';
import env from '../config/environment.js';

/**
 * Generate JWT token for admin user
 * @param {Object} adminUser - { id, email, rol }
 * @returns {string} JWT token
 */
export const generateToken = (adminUser) => {
  const payload = {
    id: adminUser.id,
    email: adminUser.email,
    rol: adminUser.rol,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'check-oil-admin',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'check-oil-admin',
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
