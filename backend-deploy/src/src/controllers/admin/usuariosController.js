/**
 * Admin Users Controller (Task 14)
 * User management (super_admin only)
 */

import bcrypt from 'bcrypt';
import { AdminUser } from '../../models/index.js';

/**
 * GET /api/admin/usuarios
 * List all admin users (super_admin only)
 * Query: { page?, limit?, rol?, activo? }
 */
export const getUsuarios = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      rol,
      activo,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (rol) {
      where.rol = rol;
    }
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Fetch users
    const { count, rows } = await AdminUser.findAndCountAll({
      where,
      attributes: ['id', 'email', 'rol', 'activo', 'last_login', 'createdAt'],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      data: rows,
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
 * GET /api/admin/usuarios/:id
 * Get single admin user (super_admin only)
 */
export const getUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await AdminUser.findByPk(id, {
      attributes: ['id', 'email', 'rol', 'permisos', 'activo', 'last_login', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/usuarios
 * Create new admin user (super_admin only)
 * Body: { email, password, rol, permisos? }
 */
export const createUsuario = async (req, res, next) => {
  try {
    const { email, password, rol, permisos } = req.body;

    // Validate input
    if (!email || !password || !rol) {
      return res.status(400).json({
        error: 'email, password, and rol are required',
      });
    }

    // Validate role
    const validRoles = ['super_admin', 'admin_productos', 'admin_ofertas', 'viewer'];
    if (!validRoles.includes(rol)) {
      return res.status(400).json({
        error: `rol must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Check if email already exists
    const existingUser = await AdminUser.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await AdminUser.create({
      email,
      password_hash: passwordHash,
      rol,
      permisos: permisos || {},
      activo: true,
    });

    res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        activo: user.activo,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/usuarios/:id
 * Update admin user (super_admin only)
 * Body: { password?, rol?, permisos?, activo? }
 */
export const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, rol, permisos, activo } = req.body;

    const user = await AdminUser.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Validate role if changing
    if (rol) {
      const validRoles = ['super_admin', 'admin_productos', 'admin_ofertas', 'viewer'];
      if (!validRoles.includes(rol)) {
        return res.status(400).json({
          error: `rol must be one of: ${validRoles.join(', ')}`,
        });
      }
    }

    // Update fields
    const updates = {};
    if (password !== undefined) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }
    if (rol !== undefined) updates.rol = rol;
    if (permisos !== undefined) updates.permisos = permisos;
    if (activo !== undefined) updates.activo = activo;

    await user.update(updates);

    res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        activo: user.activo,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/usuarios/:id
 * Delete admin user (super_admin only)
 * Prevents self-deletion
 */
export const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.admin?.id === id) {
      return res.status(400).json({
        error: 'Cannot delete your own user account',
      });
    }

    const user = await AdminUser.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    await user.destroy();

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
