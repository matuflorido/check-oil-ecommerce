'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Check if columns already exist before adding
    const tableDescription = await queryInterface.describeTable('stock_history');

    if (!tableDescription.cantidad_cambio) {
      await queryInterface.addColumn('stock_history', 'cantidad_cambio', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Signed integer representing change in stock (negative for deductions)',
      });
    }

    if (!tableDescription.stock_anterior) {
      await queryInterface.addColumn('stock_history', 'stock_anterior', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Stock level before this transaction',
      });
    }

    if (!tableDescription.stock_nuevo) {
      await queryInterface.addColumn('stock_history', 'stock_nuevo', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Stock level after this transaction',
      });
    }

    // Remove old cantidad column if it exists (data preservation)
    if (tableDescription.cantidad) {
      // First, migrate data from cantidad to cantidad_cambio if needed
      // (This will be a no-op if cantidad_cambio was just added with defaultValue)
      await queryInterface.removeColumn('stock_history', 'cantidad');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('stock_history');

    if (tableDescription.cantidad_cambio) {
      await queryInterface.removeColumn('stock_history', 'cantidad_cambio');
    }

    if (tableDescription.stock_anterior) {
      await queryInterface.removeColumn('stock_history', 'stock_anterior');
    }

    if (tableDescription.stock_nuevo) {
      await queryInterface.removeColumn('stock_history', 'stock_nuevo');
    }

    // Re-add old cantidad column
    await queryInterface.addColumn('stock_history', 'cantidad', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
