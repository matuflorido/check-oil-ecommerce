import 'dotenv/config.js'
import { Sequelize } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

const databaseUrl = process.env.DATABASE_URL

async function seedDatabase() {
  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false
  })

  try {
    await sequelize.authenticate()
    console.log('✓ Database connected\n')

    // Directly insert using raw SQL (more reliable)
    const aceitesCatId = uuidv4()
    const filtrosCatId = uuidv4()
    const accesoriosCatId = uuidv4()
    const now = new Date()

    // Insert categories
    console.log('→ Creating categories...')
    await sequelize.query(`
      INSERT INTO categories (id, nombre, slug, descripcion, orden, parent_id, activa, created_at, updated_at)
      VALUES
        ('${aceitesCatId}', 'Aceites Automotrices', 'aceites', 'Aceites para vehículos', 1, NULL, true, '${now.toISOString()}', '${now.toISOString()}'),
        ('${filtrosCatId}', 'Filtros', 'filtros', 'Filtros de aire y aceite', 2, NULL, true, '${now.toISOString()}', '${now.toISOString()}'),
        ('${accesoriosCatId}', 'Accesorios', 'accesorios', 'Accesorios automotrices', 3, NULL, true, '${now.toISOString()}', '${now.toISOString()}')
    `)

    // Insert products
    console.log('→ Creating products...')
    const products = [
      ['Aceite Sintético 10W40 - 5L', 'Premium para motores modernos', aceitesCatId, 4500, 50],
      ['Aceite Mineral 15W40 - 5L', 'Para vehículos clásicos', aceitesCatId, 2800, 35],
      ['Aceite Diésel 5W30 - 5L', 'Especial para motores diésel', aceitesCatId, 5200, 40],
      ['Filtro de Aire Toyota Hilux', 'Original para Toyota Hilux', filtrosCatId, 1200, 25],
      ['Filtro de Aceite Universal', 'Adaptable a varios vehículos', filtrosCatId, 650, 60],
      ['Barra Antivuelco Toyota Hilux', 'Reforzada para Toyota Hilux', accesoriosCatId, 12000, 8],
      ['Alfombrillas de Goma 4 Piezas', 'Set completo para auto', accesoriosCatId, 2500, 20],
      ['Limpiador de Parabrisas Premium', 'Concentrado profesional', accesoriosCatId, 800, 100],
      ['Aceite ATF Rojo - 1L', 'Para transmisión automática', aceitesCatId, 3500, 30],
      ['Protector Adhesivo de Piso', 'Protector transparente', accesoriosCatId, 1800, 45]
    ]

    for (const [nombre, desc, catId, precio, stock] of products) {
      const prodId = uuidv4()
      await sequelize.query(`
        INSERT INTO products (id, nombre, descripcion, categoria_id, precio_base, stock_actual, stock_minimo, activo, created_at, updated_at)
        VALUES ('${prodId}', '${nombre}', '${desc}', '${catId}', ${precio}, ${stock}, 5, true, '${now.toISOString()}', '${now.toISOString()}')
      `)
    }

    // Insert offers
    console.log('→ Creating offers...')
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    await sequelize.query(`
      INSERT INTO offers (id, nombre, descripcion, fecha_inicio, fecha_fin, condiciones, aplicable_a, activa, created_at, updated_at)
      VALUES
        ('${uuidv4()}', 'Liquidación Aceites', 'Descuento en aceites', '${now.toISOString()}', '${endDate.toISOString()}',
         '{"tipo":"cantidad_producto","minimo":2,"descuento":"20%"}', '{"tipo":"categorias"}', true, '${now.toISOString()}', '${now.toISOString()}'),
        ('${uuidv4()}', 'Envío Gratis', 'Envío gratis en compras mayores', '${now.toISOString()}', '${endDate.toISOString()}',
         '{"tipo":"monto_carrito","minimo":10000}', '{"tipo":"todos"}', true, '${now.toISOString()}', '${now.toISOString()}')
    `)

    console.log('\n✓ Seed data created successfully!')
    console.log('✓ 3 categories')
    console.log('✓ 10 products')
    console.log('✓ 2 offers')

    await sequelize.close()
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seedDatabase()
