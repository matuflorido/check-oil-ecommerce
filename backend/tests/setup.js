/**
 * Jest setup file for all tests
 * Loads environment variables before any tests run
 */

import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// For integration tests that require database, they should either:
// 1. Use a test database instance (docker, local postgres)
// 2. Mock Sequelize models
// 3. Use SQLite for in-memory testing
//
// This setup prepares the environment. Individual test suites handle DB setup.
