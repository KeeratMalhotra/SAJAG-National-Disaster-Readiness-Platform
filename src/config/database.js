// src/config/database.js
const { Pool } = require('pg');

// Use the standard DATABASE_URL from Render
// If not available, fallback to individual variables (for local dev)
const connectionString = process.env.DATABASE_URL;

// SSL is usually required for Cloud DBs (Render/Supabase)
const useSSL = process.env.DB_SSL === 'true';

const poolConfig = connectionString 
    ? { 
        connectionString, 
        ssl: useSSL ? { rejectUnauthorized: false } : false 
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: useSSL ? { rejectUnauthorized: false } : false
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