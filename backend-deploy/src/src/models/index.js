import sequelize from '../config/database.js';
import CategoryModel from './Category.js';
import ProductModel from './Product.js';
import VariantModel from './Variant.js';
import ClientModel from './Client.js';
import AdminUserModel from './AdminUser.js';
import OrderModel from './Order.js';
import OrderItemModel from './OrderItem.js';
import StockHistoryModel from './StockHistory.js';
import OfferModel from './Offer.js';
import StockService from '../services/StockService.js';

// Initialize models
const Category = CategoryModel(sequelize);
const Product = ProductModel(sequelize);
const Variant = VariantModel(sequelize);
const Client = ClientModel(sequelize);
const AdminUser = AdminUserModel(sequelize);
const Order = OrderModel(sequelize);
const OrderItem = OrderItemModel(sequelize);
const StockHistory = StockHistoryModel(sequelize);
const Offer = OfferModel(sequelize);

// Initialize StockService with models
StockService.setModels({
  Product,
  Variant,
  StockHistory,
});

// Define associations

// Category associations
Category.hasMany(Product, {
  as: 'products',
  foreignKey: 'categoria_id',
  onDelete: 'RESTRICT',
});
Category.hasMany(Category, {
  as: 'subcategories',
  foreignKey: 'parent_id',
  onDelete: 'SET NULL',
});
Category.belongsTo(Category, {
  as: 'parent',
  foreignKey: 'parent_id',
});

// Product associations
Product.belongsTo(Category, {
  as: 'category',
  foreignKey: 'categoria_id',
});
Product.hasMany(Variant, {
  as: 'variants',
  foreignKey: 'producto_id',
  onDelete: 'CASCADE',
});
Product.hasMany(OrderItem, {
  foreignKey: 'producto_id',
});
Product.hasMany(StockHistory, {
  foreignKey: 'producto_id',
});

// Variant associations
Variant.belongsTo(Product, {
  as: 'product',
  foreignKey: 'producto_id',
});
Variant.hasMany(OrderItem, {
  foreignKey: 'variante_id',
});
Variant.hasMany(StockHistory, {
  foreignKey: 'variante_id',
});

// Client associations
Client.hasMany(Order, {
  foreignKey: 'cliente_id',
});

// Order associations
Order.belongsTo(Client, {
  foreignKey: 'cliente_id',
});
Order.hasMany(OrderItem, {
  as: 'items',
  foreignKey: 'pedido_id',
  onDelete: 'CASCADE',
});

// OrderItem associations
OrderItem.belongsTo(Order, {
  foreignKey: 'pedido_id',
});
OrderItem.belongsTo(Product, {
  foreignKey: 'producto_id',
});
OrderItem.belongsTo(Variant, {
  foreignKey: 'variante_id',
});

// AdminUser associations
AdminUser.hasMany(StockHistory, {
  foreignKey: 'usuario_admin_id',
});

// StockHistory associations
StockHistory.belongsTo(Product, {
  foreignKey: 'producto_id',
});
StockHistory.belongsTo(Variant, {
  foreignKey: 'variante_id',
});
StockHistory.belongsTo(AdminUser, {
  foreignKey: 'usuario_admin_id',
});

export {
  sequelize,
  Category,
  Product,
  Variant,
  Client,
  AdminUser,
  Order,
  OrderItem,
  StockHistory,
  Offer,
};
