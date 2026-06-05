'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fecha_fin: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      banner_imagen: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      condiciones: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      aplicable_a: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { tipo: 'productos', ids: [] },
      },
      activa: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('offers');
  },
};
