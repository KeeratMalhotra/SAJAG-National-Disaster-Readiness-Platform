// seed_render.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function restoreDatabase() {
    // 1. Get the connection string from .env
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("Error: DATABASE_URL is missing in your .env file.");
        console.log("   -> Go to Render Dashboard > Database > Copy 'External Connection URL'");
        console.log("   -> Paste it into your .env file as DATABASE_URL='...'");
        process.exit(1);
    }

    // 2. Configure the Client (with SSL for Render)
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Render External connections
    });

    try {
        console.log(' Connecting to Render Database...');
        await client.connect();
        console.log(' Connected!');

        // 3. Read backup2.sql
        const sqlPath = path.join(__dirname, 'backup2.sql');
        console.log(` Reading SQL file: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`File not found: ${sqlPath}`);
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // 4. Execute the SQL
        console.log(' Executing SQL script... (This may take a minute)');
        await client.query(sqlContent);

        console.log(' SUCCESS! Database restored from backup2.sql');

    } catch (error) {
        console.error(' Restore Failed:', error.message);
    } finally {
        await client.end();
    }
}

restoreDatabase();