import 'dotenv/config.js'
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
})

try {
  await sequelize.authenticate()
  console.log('✓ Connected\n')

  const tables = await sequelize.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
  `)

  console.log('Tables found:')
  tables[0].forEach(t => console.log('  -', t.table_name))

  // Check products table structure
  if (tables[0].some(t => t.table_name === 'products')) {
    console.log('\n✓ Products table structure:')
    const columns = await sequelize.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'products'
    `)
    columns[0].forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`))
  }

  await sequelize.close()
} catch (err) {
  console.error('Error:', err.message)
}
