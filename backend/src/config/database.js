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
        priority INTEGER DEFAULT 5,
        operator VARCHAR(10) DEFAULT 'AND'
      );
    `);

    console.log("✅ Database Tables Initialized");
  } catch (err) {
    console.error("❌ Database Init Error:", err);
  }
};

module.exports = { pool, initDB };
