const pool = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
    /**
     * Creates a new user in the database with a hashed password.
     * @param {string} name - The user's full name.
     * @param {string} email - The user's email address.
     * @param {string} password - The user's plain-text password.
     * @param {string} role - The user's role (e.g., 'training_partner').
     * @param {string} organizationName - The name of the user's organization.
     * @returns {object} The newly created user object (without the password hash).
     */
    async create(name, email, password, role, organizationName, state) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // We now include state and status (which defaults to 'pending')
    const query = `
        INSERT INTO users (name, email, password_hash, role, organization_name, state)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, role, organization_name, state, status;
    `;
    const values = [name, email, passwordHash, role, organizationName, state];

        try {
            const result = await pool.query(query, values);
            return result.rows[0]; // Return the newly created user
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    /**
     * Finds a user by their email address.
     * @param {string} email - The email of the user to find.
     * @returns {object|null} The user object if found, otherwise null.
     */
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1;';
        try {
            const result = await pool.query(query, [email]);
            return result.rows[0]; // Returns the user or undefined if not found
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    },
    async findPendingByState(state) {
        const query = `SELECT id, name, email, organization_name, state, created_at FROM users WHERE status = 'pending' AND state = $1 ORDER BY created_at;`;
        try {
            const result = await pool.query(query, [state]);
            return result.rows;
        } catch (error) {
            console.error('Error finding pending users by state:', error);
            throw error;
        }
    },

    // --- AND ADD THIS FUNCTION ---
    async updateStatus(userId, status) {
        const query = `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, status;`;
        try {
            const result = await pool.query(query, [status, userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }
};

module.exports = User;