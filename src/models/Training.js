const pool = require('../config/database');

const Training = {
    /**
     * Creates a new training program in the database.
     * @param {object} trainingData - The data for the new training.
     * @param {string} userId - The ID of the user creating the training.
     * @returns {object} The newly created training object.
     */
    async create(trainingData, userId) {
        const { title, theme, startDate, endDate, location } = trainingData;
        
        const query = `
            INSERT INTO trainings (title, theme, start_date, end_date, location_text, creator_user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        
        const values = [title, theme, startDate, endDate, location, userId];

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
    async findAllGeoJSON() {
        // This query fetches trainings that have valid coordinates
        const query = `
            SELECT id, title, theme, location_text, longitude, latitude
            FROM trainings
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
        `;
        try {
            const result = await pool.query(query);
            
            // Format the database rows into a GeoJSON FeatureCollection
            const features = result.rows.map(row => {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [row.longitude, row.latitude] // GeoJSON is [longitude, latitude]
                    },
                    properties: {
                        id: row.id,
                        title: row.title,
                        theme: row.theme,
                        location: row.location_text
                    }
                };
            });

            return {
                type: 'FeatureCollection',
                features: features
            };

        } catch (error) {
            console.error('Error fetching GeoJSON trainings:', error);
            throw error;
        }
    }

    
};

module.exports = Training;