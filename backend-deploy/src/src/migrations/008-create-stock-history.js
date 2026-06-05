'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Create ENUM type for stock movement types
    try {
      await queryInterface.sequelize.query(
        "CREATE TYPE enum_stock_history_tipo AS ENUM('compra', 'ajuste_manual', 'devolucion')",
      );
    } catch (err) { /* Type already exists */ }

    await queryInterface.createTable('stock_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      producto_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      variante_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'variants',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      tipo: {
        type: Sequelize.ENUM('compra', 'ajuste_manual', 'devolucion'),
        allowNull: false,
      },
      cantidad_cambio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Signed integer representing change in stock (negative for deductions)',
      },
      stock_anterior: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Stock level before this transaction',
      },
      stock_nuevo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Stock level after this transaction',
      },
      motivo: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      usuario_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'admin_users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for common queries
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stock_history');
    // Drop ENUM type
    await queryInterface.sequelize.query('DROP TYPE enum_stock_history_tipo');
  },
};
