import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const StockHistory = sequelize.define(
    'StockHistory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      producto_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      variante_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM('compra', 'ajuste_manual', 'devolucion'),
        allowNull: false,
      },
      cantidad_cambio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Signed integer representing change in stock (negative for deductions)',
      },
      stock_anterior: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Stock level before this transaction',
      },
      stock_nuevo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Stock level after this transaction',
      },
      motivo: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      usuario_admin_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      tableName: 'stock_history',
      timestamps: false,
      underscored: true,
    },
  );

  return StockHistory;
};
