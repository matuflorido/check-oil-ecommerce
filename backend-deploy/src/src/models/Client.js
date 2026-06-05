import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Client = sequelize.define(
    'Client',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      direccion: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      ciudad: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      provincia: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'clients',
      timestamps: true,
      underscored: true,
    },
  );

  return Client;
};
