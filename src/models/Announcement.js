const pool = require('../config/database');

const Announcement = {
    async create({ title, content, scope, state, creatorUserId }) {
        const query = `
            INSERT INTO announcements (title, content, scope, state, creator_user_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [title, content, scope, state, creatorUserId];
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating announcement:', error);
            throw error;
        }
    },
    async findForUser({ role, state }) {
        let query;
        const params = [];

        if (role === 'ndma_admin' || role === 'auditor') {
            // NDMA and Auditors see everything
            query = 'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 3;';
        } else {
            // SDMA and Training Partners see national announcements + their own state's announcements
            query = `
                SELECT * FROM announcements 
                WHERE scope = 'national' OR state = $1 
                ORDER BY created_at DESC LIMIT 3;
            `;
            params.push(state);
        }

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error finding announcements for user:', error);
            throw error;
        }
    },async findAllForUser({ role, state }) {
        let query;
        const params = [];

        if (role === 'ndma_admin' || role === 'auditor') {
            query = 'SELECT * FROM announcements ORDER BY created_at DESC;';
        } else {
            query = `
                SELECT * FROM announcements 
                WHERE scope = 'national' OR state = $1 
                ORDER BY created_at DESC;
            `;
            params.push(state);
        }

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error finding all announcements for user:', error);
            throw error;
        }
    }
    
};

module.exports = Announcement;