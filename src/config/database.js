// Import the Pool class from the 'pg' module
const { Pool } = require('pg');

// Create a new Pool instance for managing connections to the database
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// A simple function to test the database connection
const testConnection = async () => {
    try {
        await pool.query('SELECT NOW()'); // Simple query to check connection
        console.log('🐘 Database connected successfully!');
    } catch (error) {
        console.error('❌ Error connecting to the database:', error);
    }
};

// Test the connection when the module is loaded
testConnection();

// Export the pool so it can be used by other parts of our application
module.exports = pool;