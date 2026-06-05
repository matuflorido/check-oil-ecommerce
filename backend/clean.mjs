import 'dotenv/config.js'
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
})

try {
  await sequelize.query(`DROP TABLE IF EXISTS products, orders, order_items, clients, admin_users, variants, stock_history, offers, categories, sequelize_meta CASCADE`)
  console.log('✓ Tables dropped')
  await sequelize.close()
} catch (err) {
  console.error('Error:', err.message)
}
