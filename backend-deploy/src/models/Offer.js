import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Offer = sequelize.define(
    'Offer',
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
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      banner_imagen: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      condiciones: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      aplicable_a: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: { tipo: 'productos', ids: [] },
      },
      activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'offers',
      timestamps: true,
      underscored: true,
    },
  );

  return Offer;
};
