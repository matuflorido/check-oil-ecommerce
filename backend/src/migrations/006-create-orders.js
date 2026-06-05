'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Create ENUM types for order statuses and payment methods
    try {
      await queryInterface.sequelize.query(
        "CREATE TYPE enum_orders_estado AS ENUM('pendiente', 'pago_confirmado', 'preparando', 'envio_coordinado', 'entregado', 'cancelado')",
      );
    } catch (err) { /* Type already exists */ }
    try {
      await queryInterface.sequelize.query(
        "CREATE TYPE enum_orders_metodo_pago AS ENUM('mercado_pago', 'transferencia', 'efectivo')",
      );
    } catch (err) { /* Type already exists */ }

    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      numero_pedido: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      cliente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      estado: {
        type: Sequelize.ENUM(
          'pendiente',
          'pago_confirmado',
          'preparando',
          'envio_coordinado',
          'entregado',
          'cancelado',
        ),
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      descuentos: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      costo_envio: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      metodo_pago: {
        type: Sequelize.ENUM('mercado_pago', 'transferencia', 'efectivo'),
        allowNull: false,
      },
      direccion_envio: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      fecha_entrega: {
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

    // Add indexes for common filters
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE enum_orders_estado');
    await queryInterface.sequelize.query('DROP TYPE enum_orders_metodo_pago');
  },
};
