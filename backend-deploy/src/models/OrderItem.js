import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      pedido_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      producto_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      variante_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'order_items',
      timestamps: true,
      underscored: true,
    },
  );

  return OrderItem;
};
