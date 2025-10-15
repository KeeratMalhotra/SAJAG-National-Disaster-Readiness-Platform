const pool = require('../config/database');

const Training = {
    /**
     * Creates a new training program in the database.
     * @param {object} trainingData - The data for the new training.
     * @param {string} userId - The ID of the user creating the training.
     * @returns {object} The newly created training object.
     */
    async create(trainingData, userId) {
    // Destructure the new fields from the trainingData
    const { title, theme, startDate, endDate, location, latitude, longitude } = trainingData;

    const query = `
        INSERT INTO trainings (title, theme, start_date, end_date, location_text, latitude, longitude, creator_user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    // Add the new values to the array
    const values = [title, theme, startDate, endDate, location, latitude || null, longitude || null, userId];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating training:', error);
        throw error;
    }
},
    
    /**
     * Finds all trainings created by a specific user.
     * @param {string} userId - The ID of the user.
     * @returns {Array} A list of the user's training programs.
     */
    async findByUserId(userId) {
        const query = 'SELECT * FROM trainings WHERE creator_user_id = $1 ORDER BY start_date DESC;';
        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error finding trainings by user id:', error);
            throw error;
        }
    },
    /**
     * Finds all trainings from all users.
     * @returns {Array} A list of all training programs.
     */
    async findAll() {
        // This query joins the trainings and users tables to get the organization name
        const query = `
            SELECT t.*, u.organization_name 
            FROM trainings t
            JOIN users u ON t.creator_user_id = u.id
            ORDER BY t.start_date DESC;
        `;
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error finding all trainings:', error);
            throw error;
        }
    },
   async findById(id) {
    // This query now also selects the user's name and organization name
    const query = `
        SELECT 
            t.*, 
            u.state as creator_state,
            u.name as creator_name,
            u.organization_name
        FROM trainings t
        JOIN users u ON t.creator_user_id = u.id
        WHERE t.id = $1;
    `;
    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error finding training by id:', error);
        throw error;
    }
},

// ADD THIS NEW deleteById function
async deleteById(id) {
    const query = 'DELETE FROM trainings WHERE id = $1;';
    try {
        await pool.query(query, [id]);
        return { success: true };
    } catch (error) {
        console.error('Error deleting training:', error);
        throw error;
    }
},
    async findAllGeoJSON() {
    // We now select start_date and end_date
    const query = `
        SELECT id, title, theme, location_text, longitude, latitude, start_date, end_date
        FROM trainings
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    `;
    try {
        const result = await pool.query(query);
        const today = new Date();

        const features = result.rows.map(row => {
            const startDate = new Date(row.start_date);
            const endDate = new Date(row.end_date);
            let status = 'Upcoming';
            if (today >= startDate && today <= endDate) {
                status = 'Ongoing';
            } else if (today > endDate) {
                status = 'Completed';
            }

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [row.longitude, row.latitude]
                },
                properties: {
                    id: row.id,
                    title: row.title,
                    theme: row.theme,
                    status: status // Add the status here
                }
            };
        });
        return { type: 'FeatureCollection', features: features };
    } catch (error) {
        console.error('Error fetching GeoJSON trainings:', error);
        throw error;
    }
},
    async findAllByState(state) {
        const query = `
            SELECT t.*, u.organization_name 
            FROM trainings t
            JOIN users u ON t.creator_user_id = u.id
            WHERE u.state = $1
            ORDER BY t.start_date DESC;
        `;
        try {
            const result = await pool.query(query, [state]);
            return result.rows;
        } catch (error) {
            console.error('Error finding all trainings by state:', error);
            throw error;
        }
    },async findAllGeoJSONByState(state) {
    // Also select start_date and end_date here
    const query = `
        SELECT t.id, t.title, t.theme, t.location_text, t.longitude, t.latitude, t.start_date, t.end_date
        FROM trainings t
        JOIN users u ON t.creator_user_id = u.id
        WHERE u.state = $1 AND t.latitude IS NOT NULL AND t.longitude IS NOT NULL;
    `;
    try {
        const result = await pool.query(query, [state]);
        const today = new Date();

        const features = result.rows.map(row => {
             const startDate = new Date(row.start_date);
            const endDate = new Date(row.end_date);
            let status = 'Upcoming';
            if (today >= startDate && today <= endDate) {
                status = 'Ongoing';
            } else if (today > endDate) {
                status = 'Completed';
            }

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [row.longitude, row.latitude]
                },
                properties: {
                    id: row.id,
                    title: row.title,
                    theme: row.theme,
                    status: status // And add the status here
                }
            };
        });
        return { type: 'FeatureCollection', features: features };
    } catch (error) {
        console.error('Error fetching GeoJSON by state:', error);
        throw error;
    }
},async findRecentActivity(limit = 5) {
    // Fetches the 5 most recently created trainings
    const query = `
        SELECT title, theme, location_text, start_date 
        FROM trainings 
        ORDER BY created_at DESC 
        LIMIT $1;
    `;
    try {
        const result = await pool.query(query, [limit]);
        return result.rows;
    } catch (error) {
        console.error('Error finding recent activity:', error);
        throw error;
    }}

    
};

module.exports = Training;