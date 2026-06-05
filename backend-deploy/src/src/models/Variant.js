import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Variant = sequelize.define(
    'Variant',
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
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      precio_ajuste: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      stock_variante: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      atributos: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: true,
      },
    },
    {
      tableName: 'variants',
      timestamps: true,
      underscored: true,
    },
  );

  return Variant;
};
