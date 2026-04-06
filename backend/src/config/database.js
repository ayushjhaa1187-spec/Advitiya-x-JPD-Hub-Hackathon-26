/**
 * PostgreSQL Database Configuration
 * 
 * This module configures the PostgreSQL connection pool for persistent data storage.
 * Compatible with:
 * - Neon (Serverless Postgres): https://neon.tech
 * - Supabase (Postgres Backend): https://supabase.com
 * - Standard PostgreSQL instances
 * 
 * Environment Variables Required:
 * - DB_HOST: PostgreSQL host (e.g., your-project.neon.tech)
 * - DB_USER: Database username
 * - DB_PASSWORD: Database password
 * - DB_NAME: Database name
 * - DB_PORT: Database port (default: 5432)
 * 
 * Features:
 * - Connection pooling for optimal performance
 * - Auto-initialization of database tables
 * - Graceful error handling
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Initialize Tables automatically
const initDB = async () => {
  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Hubs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hubs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) DEFAULT 'My Smart Hub',
        description TEXT,
        theme VARCHAR(20) DEFAULT 'dark',
        unique_id VARCHAR(50) UNIQUE
      );
    `);

    // 3. Links Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        hub_id INTEGER REFERENCES hubs(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        priority INTEGER DEFAULT 5,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Rules Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        hub_id INTEGER REFERENCES hubs(id) ON DELETE CASCADE,
        name VARCHAR(100),
        type VARCHAR(50),
        condition VARCHAR(100),
        destination_url TEXT,
        priority INTEGER DEFAULT 5,
        operator VARCHAR(10) DEFAULT 'AND'
      );
    `);

    // 5. Link Clicks (Analytics) Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS link_clicks (
        id SERIAL PRIMARY KEY,
        link_id INTEGER REFERENCES links(id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer TEXT,
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database Tables Initialized");
  } catch (err) {
    console.error("❌ Database Init Error:", err);
  }
};

module.exports = { pool, initDB };
