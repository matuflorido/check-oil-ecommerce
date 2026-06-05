import 'dotenv/config.js'
import { Sequelize } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

const databaseUrl = process.env.DATABASE_URL

async function seedDatabase() {
  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    define: { timestamps: true, underscored: true }
  })

  try {
    await sequelize.authenticate()
    console.log('✓ Database connected\n')

    // Clear existing data (optional - comment out to keep)
    // await sequelize.truncate({ cascade: true })

    const qi = sequelize.queryInterface

    // Create categories
    console.log('→ Creating categories...')
    const aceitesCat = uuidv4()
    const filtrosCat = uuidv4()
    const accesoriosCat = uuidv4()

    await qi.bulkInsert('categories', [
      { id: aceitesCat, nombre: 'Aceites Automotrices', slug: 'aceites-automotrices', descripcion: 'Aceites sintéticos y minerales de calidad', orden: 1, parent_id: null, activa: true, created_at: new Date(), updated_at: new Date() },
      { id: filtrosCat, nombre: 'Filtros', slug: 'filtros', descripcion: 'Filtros de aire y aceite', orden: 2, parent_id: null, activa: true, created_at: new Date(), updated_at: new Date() },
      { id: accesoriosCat, nombre: 'Accesorios', slug: 'accesorios', descripcion: 'Accesorios automotrices varios', orden: 3, parent_id: null, activa: true, created_at: new Date(), updated_at: new Date() }
    ])

    // Create products
    console.log('→ Creating products...')
    const products = [
      { id: uuidv4(), nombre: 'Aceite Sintético 10W40 - 5L', descripcion: 'Aceite sintético premium para motores modernos', categoria_id: aceitesCat, precio_base: 4500, stock_actual: 50, stock_minimo: 10, activo: true },
      { id: uuidv4(), nombre: 'Aceite Mineral 15W40 - 5L', descripcion: 'Aceite mineral para vehículos clásicos', categoria_id: aceitesCat, precio_base: 2800, stock_actual: 35, stock_minimo: 8, activo: true },
      { id: uuidv4(), nombre: 'Aceite Diésel 5W30 - 5L', descripcion: 'Especial para motores diésel', categoria_id: aceitesCat, precio_base: 5200, stock_actual: 40, stock_minimo: 10, activo: true },
      { id: uuidv4(), nombre: 'Filtro de Aire Toyota Hilux', descripcion: 'Filtro de aire original para Toyota Hilux', categoria_id: filtrosCat, precio_base: 1200, stock_actual: 25, stock_minimo: 5, activo: true },
      { id: uuidv4(), nombre: 'Filtro de Aceite Universal', descripcion: 'Filtro de aceite adaptable a varios vehículos', categoria_id: filtrosCat, precio_base: 650, stock_actual: 60, stock_minimo: 15, activo: true },
      { id: uuidv4(), nombre: 'Barra Antivuelco Toyota Hilux', descripcion: 'Barra antivuelco reforzada para Toyota Hilux', categoria_id: accesoriosCat, precio_base: 12000, stock_actual: 8, stock_minimo: 2, activo: true },
      { id: uuidv4(), nombre: 'Alfombrillas de Goma 4 Piezas', descripcion: 'Set de alfombrillas de goma para auto', categoria_id: accesoriosCat, precio_base: 2500, stock_actual: 20, stock_minimo: 5, activo: true },
      { id: uuidv4(), nombre: 'Limpiador de Parabrisas Premium', descripcion: 'Limpiador concentrado para parabrisas', categoria_id: accesoriosCat, precio_base: 800, stock_actual: 100, stock_minimo: 20, activo: true },
      { id: uuidv4(), nombre: 'Aceite ATF Rojo - 1L', descripcion: 'Aceite para transmisión automática', categoria_id: aceitesCat, precio_base: 3500, stock_actual: 30, stock_minimo: 8, activo: true },
      { id: uuidv4(), nombre: 'Protector Adhesivo de Piso', descripcion: 'Protector transparente para pisos de auto', categoria_id: accesoriosCat, precio_base: 1800, stock_actual: 45, stock_minimo: 10, activo: true }
    ]

    await qi.bulkInsert('products', products.map(p => ({ ...p, created_at: new Date(), updated_at: new Date() })))

    // Create offers
    console.log('→ Creating offers...')
    const now = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    await qi.bulkInsert('offers', [
      {
        id: uuidv4(),
        nombre: 'Liquidación de Aceites - Hasta 20% OFF',
        descripcion: 'Descuento especial en todos los aceites automotrices',
        fecha_inicio: now,
        fecha_fin: endDate,
        banner_imagen: null,
        condiciones: JSON.stringify({ tipo: 'cantidad_producto', minimo: 2, descuento: '20%' }),
        aplicable_a: JSON.stringify({ tipo: 'categorias', ids: [aceitesCat] }),
        activa: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        nombre: 'Compra Mayor - Envío Gratis',
        descripcion: 'Envío gratis en compras mayores a $10.000',
        fecha_inicio: now,
        fecha_fin: endDate,
        banner_imagen: null,
        condiciones: JSON.stringify({ tipo: 'monto_carrito', minimo: 10000, descuento: 'envio_gratis' }),
        aplicable_a: JSON.stringify({ tipo: 'todos' }),
        activa: true,
        created_at: now,
        updated_at: now
      }
    ])

    console.log('\n✓ Seed data created successfully!')
    console.log('✓ 3 categories')
    console.log('✓ 10 products')
    console.log('✓ 2 offers')

    await sequelize.close()
  } catch (err) {
    console.error('Seed error:', err.message)
    console.error('Full error:', err)
    process.exit(1)
  }
}

seedDatabase()
