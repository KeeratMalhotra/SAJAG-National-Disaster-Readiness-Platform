const pool = require('../config/database');

const Photo = {
    async create(trainingId, imageUrl) {
        const query = `INSERT INTO training_photos (training_id, image_url) VALUES ($1, $2) RETURNING *;`;
        try {
            const result = await pool.query(query, [trainingId, imageUrl]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },
    async findByTrainingId(trainingId) {
        const query = 'SELECT * FROM training_photos WHERE training_id = $1 ORDER BY uploaded_at;';
        try {
            const result = await pool.query(query, [trainingId]);
            return result.rows;
        } catch (error) {
            console.error('Error finding photos by training id:', error);
            throw error;
        }
    },
    async deleteByTrainingId(trainingId) {
        const query = 'DELETE FROM training_photos WHERE training_id = $1;';
        try {
            await pool.query(query, [trainingId]);
        } catch (error) {
            console.error('Error deleting photos by training id:', error);
            throw error;
        }
    }
};

module.exports = Photo;