'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
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
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      direccion: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      ciudad: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      provincia: {
        type: Sequelize.STRING(255),
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
    await queryInterface.dropTable('clients');
  },
};
