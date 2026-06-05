/**
 * Authentication Controller (Task 10)
 * Handles admin login and JWT token generation
 */

import bcrypt from 'bcrypt';
import { AdminUser } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';

/**
 * POST /api/admin/login
 * Admin login endpoint
 * Body: { email, password }
 * Returns: { token, admin: { id, email, rol } }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find admin user by email
    const adminUser = await AdminUser.findOne({
      where: { email },
    });

    if (!adminUser) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!adminUser.activo) {
      return res.status(401).json({
        error: 'User account is inactive',
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Update last_login timestamp
    await adminUser.update({
      last_login: new Date(),
    });

    // Generate JWT token
    const token = generateToken(adminUser);

    // Return token and user info
    res.status(200).json({
      token,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        rol: adminUser.rol,
        permisos: adminUser.permisos,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/verify-token
 * Verify JWT token validity
 * Headers: Authorization: Bearer <token>
 * Returns: { valid: boolean, admin: { id, email, rol } }
 */
export const verifyToken = async (req, res) => {
  try {
    // req.admin is set by auth middleware
    if (!req.admin) {
      return res.status(401).json({
        error: 'Invalid or missing token',
      });
    }

    res.status(200).json({
      valid: true,
      admin: req.admin,
    });
  } catch (error) {
    res.status(401).json({
      error: 'Token verification failed',
    });
  }
};

/**
 * POST /api/admin/logout
 * Logout endpoint (client-side token deletion)
 */
export const logout = (req, res) => {
  res.status(200).json({
    message: 'Logout successful. Please delete the token on client side.',
  });
};
