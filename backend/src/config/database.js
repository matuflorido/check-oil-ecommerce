import { Sequelize } from 'sequelize';
import env from './environment.js';

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Test database connection
async function authenticateDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    // Don't exit - allow app to start even if DB is unavailable for dev
  }
}

authenticateDatabase();

export default sequelize;
