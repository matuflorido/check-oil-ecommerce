import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      categoria_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subcategoria_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      precio_base: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      imagen_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      stock_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'products',
      timestamps: true,
      underscored: true,
    },
  );

  return Product;
};
