import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      numero_pedido: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      cliente_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM(
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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      descuentos: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      costo_envio: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      metodo_pago: {
        type: DataTypes.ENUM('mercado_pago', 'transferencia', 'efectivo'),
        allowNull: false,
      },
      direccion_envio: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      fecha_entrega: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_pago: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      referencia_pago: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fecha_pedido: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'orders',
      timestamps: true,
      underscored: true,
    },
  );

  return Order;
};
