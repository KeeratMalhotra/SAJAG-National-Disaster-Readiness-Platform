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
    },

    async findAllForUser({ role, state }) {
    let query;
    const params = [];

    // This is the base query that now joins the tables
    const baseQuery = `
        SELECT a.*, u.organization_name
        FROM announcements a
        JOIN users u ON a.creator_user_id = u.id
    `;

    if (role === 'ndma_admin' || role === 'auditor') {
        // NDMA/Auditors see everything
        query = `${baseQuery} ORDER BY a.created_at DESC;`;
    } else {
        // Other users see national + their state announcements
        query = `${baseQuery} WHERE a.scope = 'national' OR a.state = $1 ORDER BY a.created_at DESC;`;
        params.push(state);
    }

    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error){
        console.error('Error finding all announcements for user:', error);
        throw error;
    }
},
async findById(id) {
        const query = 'SELECT * FROM announcements WHERE id = $1;';
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding announcement by id:', error);
            throw error;
        }
    },

    async deleteById(id) {
        const query = 'DELETE FROM announcements WHERE id = $1;';
        try {
            await pool.query(query, [id]);
            return { success: true };
        } catch (error) {
            console.error('Error deleting announcement:', error);
            throw error;
        }
    },
    async getUnreadCountForUser({ id, role, state }) {
    let relevantAnnouncementsQuery;
    const params = [id]; // User ID is always the first parameter

    if (role === 'ndma_admin' || role === 'auditor') {
        relevantAnnouncementsQuery = `SELECT id FROM announcements`;
    } else {
        relevantAnnouncementsQuery = `SELECT id FROM announcements WHERE scope = 'national' OR state = $2`;
        params.push(state);
    }

    const query = `
        SELECT COUNT(*) FROM (${relevantAnnouncementsQuery}) AS relevant
        WHERE relevant.id NOT IN (
            SELECT announcement_id FROM user_announcement_views WHERE user_id = $1
        );
    `;

    try {
        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        console.error('Error getting unread announcement count:', error);
        throw error;
    }
},

async markAllAsReadForUser(userId, announcementIds) {
    if (announcementIds.length === 0) return;

    const values = [];
    let valueStrings = [];
    let paramCount = 1;

    announcementIds.forEach(announcementId => {
        valueStrings.push(`($1, $${paramCount + 1})`);
        values.push(announcementId);
        paramCount++;
    });

    // Use ON CONFLICT DO NOTHING to prevent errors if a user re-views the page
    const query = `
        INSERT INTO user_announcement_views (user_id, announcement_id)
        VALUES ${valueStrings.join(', ')}
        ON CONFLICT (user_id, announcement_id) DO NOTHING;
    `;

    try {
        await pool.query(query, [userId, ...values]);
    } catch (error) {
        console.error('Error marking announcements as read:', error);
        throw error;
    }
}
    
};

module.exports = Announcement;