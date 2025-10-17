const pool = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
    async create(name, email, password, role, organizationName, state, documentUrl) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const query = `
            INSERT INTO users (name, email, password_hash, role, organization_name, state, document_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, email, role;
        `;
        const values = [name, email, passwordHash, role, organizationName, state, documentUrl];
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1;';
        try {
            const result = await pool.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    },

    async findPendingByState(state) {
    const query = `SELECT id, name, email, organization_name, state, document_url, created_at FROM users WHERE status = 'pending' AND role = 'training_partner' AND state = $1 ORDER BY created_at;`;
    try {
        const result = await pool.query(query, [state]);
        return result.rows;
    } catch (error) {
        console.error('Error finding pending users by state:', error);
        throw error;
    }
},

    async updateStatus(userId, status) {
        const query = `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, status;`;
        try {
            const result = await pool.query(query, [status, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    },
    
    async findActiveByState(state) {
    const query = `SELECT id, name, email, organization_name, state, document_url FROM users WHERE status = 'active' AND role = 'training_partner' AND state = $1 ORDER BY name;`;
    try {
        const result = await pool.query(query, [state]);
        return result.rows;
    } catch (error) {
        console.error('Error finding active users by state:', error);
        throw error;
    }
},

    async findRejectedByState(state) {
    const query = `SELECT id, name, email, organization_name, state, document_url FROM users WHERE status = 'rejected' AND role = 'training_partner' AND state = $1 ORDER BY name;`;
    try {
        const result = await pool.query(query, [state]);
        return result.rows;
    } catch (error) {
        console.error('Error finding rejected users by state:', error);
        throw error;
    }
},

    async findAllPending() {
        const query = `SELECT id, name, email, organization_name, state, document_url, created_at FROM users WHERE status = 'pending' AND role = 'training_partner' ORDER BY created_at;`;
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

   async findAllActive() {
    const query = `SELECT id, name, email, organization_name, state, document_url FROM users WHERE status = 'active' AND role = 'training_partner' ORDER BY name;`;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
},

    async findAllRejected() {
    const query = `SELECT id, name, email, organization_name, state, document_url FROM users WHERE status = 'rejected' AND role = 'training_partner' ORDER BY name;`;
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
},
    
    async findById(id) {
    // We are adding the 'role' column to this SELECT query
    const query = 'SELECT id, name, email, role, organization_name, state, status, document_url FROM users WHERE id = $1;';
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error finding user by id:', error);
        throw error;
    }
},async countActiveByState(state) {
    const query = "SELECT COUNT(*) FROM users WHERE status = 'active' AND state = $1 AND role = 'training_partner';";
    try {
        const result = await pool.query(query, [state]);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        console.error('Error counting active users by state:', error);
        throw error;
    }
}
};

module.exports = User;

