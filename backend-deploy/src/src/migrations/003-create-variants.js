'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('variants', {
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      precio_ajuste: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      stock_variante: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      atributos: {
        type: Sequelize.JSONB,
        defaultValue: {},
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('variants');
  },
};
