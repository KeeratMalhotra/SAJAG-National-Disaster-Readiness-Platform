
const { Pool } = require('pg');

const poolConfig = {
    host: process.env.DB_HOST,      
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

const pool = new Pool(poolConfig);


const testConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log(' Database connected successfully!');
    } catch (error) {
        console.error(' Error connecting to the database:', error.message);
    }
};

testConnection();

module.exports = pool;