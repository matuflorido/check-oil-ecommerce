import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Category = sequelize.define(
    'Category',
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
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'categories',
      timestamps: true,
      underscored: true,
    },
  );

  return Category;
};
