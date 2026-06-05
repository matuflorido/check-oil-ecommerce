import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AdminUser = sequelize.define(
    'AdminUser',
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
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM('super_admin', 'admin_productos', 'admin_ofertas', 'viewer'),
        allowNull: false,
      },
      permisos: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'admin_users',
      timestamps: true,
      underscored: true,
    },
  );

  return AdminUser;
};
