// src/config/database.js
const { Pool } = require('pg');

// Use the standard DATABASE_URL if available, otherwise individual variables
const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString 
    ? { 
        connectionString,
        // SSL configuration removed
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        // SSL configuration removed
      };

const pool = new Pool(poolConfig);

// Test the connection
const testConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('🐘 Database connected successfully!');
    } catch (error) {
        console.error('❌ Error connecting to the database:', error.message);
    }
};

testConnection();

module.exports = pool;