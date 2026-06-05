#!/usr/bin/env node
require('dotenv').config();

const path = require('path');
const { Sequelize } = require('sequelize');
const fs = require('fs').promises;
const vm = require('vm');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigrations() {
  try {
    console.log('[Sequelize Migration Runner]');
    console.log('');

    const sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    });

    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Create migrations table if it doesn't exist
    const result = await sequelize.query(
      `SELECT EXISTS(
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'sequelize_meta'
      );`,
    );

    if (!result[0][0].exists) {
      await sequelize.query(`
        CREATE TABLE sequelize_meta (
          name varchar(255) PRIMARY KEY,
          sequelize_version varchar(255)
        );
      `);
      console.log('✓ Created sequelize_meta table');
    }

    // Get executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM sequelize_meta ORDER BY name;',
    );
    const executed = new Set(executedMigrations.map((m) => m.name));

    // Read migration files
    const migrationsDir = path.join(__dirname, 'src/migrations');
    const files = (await fs.readdir(migrationsDir))
      .filter((f) => f.endsWith('.js'))
      .sort();

    console.log(`Found ${files.length} migration files`);
    console.log('');

    let migrationsRun = 0;

    for (const file of files) {
      if (executed.has(file)) {
        console.log(`⊘ ${file} (already executed)`);
        continue;
      }

      try {
        // Read migration file
        const filePath = path.join(migrationsDir, file);
        const content = await fs.readFile(filePath, 'utf8');

        // Execute migration
        console.log(`→ Running ${file}...`);

        // Create a module object to hold exports
        const moduleExports = {};
        const scriptContext = {
          module: { exports: moduleExports },
          console,
          require: require,
        };

        // Execute the migration file
        const script = new vm.Script(content);
        script.runInThisContext(scriptContext);

        const migration = scriptContext.module.exports;

        // Create QueryInterface wrapper
        const queryInterface = sequelize.getQueryInterface();

        // Run the up migration
        await migration.up(queryInterface, sequelize.constructor);

        // Record execution
        await sequelize.query(
          `INSERT INTO sequelize_meta (name, sequelize_version) VALUES (:name, :version)`,
          {
            replacements: { name: file, version: require('sequelize/package.json').version },
            type: sequelize.QueryTypes.INSERT,
          },
        );

        console.log(`✓ ${file}`);
        migrationsRun++;
      } catch (error) {
        console.error(`✗ ${file}: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
      }
    }

    console.log('');
    if (migrationsRun === 0) {
      console.log('⊘ No new migrations to run');
    } else {
      console.log(`✓ ${migrationsRun} migration(s) executed successfully`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigrations();
