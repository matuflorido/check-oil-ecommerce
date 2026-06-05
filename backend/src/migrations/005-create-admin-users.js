'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Create ENUM type for roles first (if not exists)
    try {
      await queryInterface.sequelize.query(
        "CREATE TYPE enum_admin_users_rol AS ENUM('super_admin', 'admin_productos', 'admin_ofertas', 'viewer')",
      );
    } catch (err) {
      // Type already exists, ignore
    }

    await queryInterface.createTable('admin_users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rol: {
        type: Sequelize.ENUM('super_admin', 'admin_productos', 'admin_ofertas', 'viewer'),
        allowNull: false,
      },
      permisos: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add index for email lookups
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admin_users');
    // Drop ENUM type
    await queryInterface.sequelize.query('DROP TYPE enum_admin_users_rol');
  },
};
