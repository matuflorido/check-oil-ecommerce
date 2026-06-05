import 'dotenv/config.js'
import { Sequelize } from 'sequelize'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL not set')
  process.exit(1)
}

async function runMigrations() {
  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    define: { timestamps: true, underscored: true }
  })

  try {
    await sequelize.authenticate()
    console.log('✓ Database connected')

    // Run migrations
    const migrationsDir = path.join(__dirname, 'src/migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js')).sort()

    console.log(`\nFound ${files.length} migration files\n`)

    for (const file of files) {
      const filePath = path.join(migrationsDir, file)
      console.log(`→ Running ${file}...`)

      try {
        const mod = await import(`file://${filePath}`)
        const migration = mod.default
        await migration.up(sequelize.queryInterface, sequelize.Sequelize)
        console.log(`✓ ${file} completed\n`)
      } catch (err) {
        console.error(`✗ ${file} failed:`, err.message)
        process.exit(1)
      }
    }

    console.log('✓ All migrations completed!')
    await sequelize.close()
  } catch (err) {
    console.error('Migration error:', err.message)
    process.exit(1)
  }
}

runMigrations()
