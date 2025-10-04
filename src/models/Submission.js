const pool = require('../config/database');

const Submission = {
    /**
     * Creates a new submission record in the database.
     * @param {object} submissionData - The data for the submission.
     * @returns {object} The newly created submission object.
     */
    async create({ trainingId, participantEmail, assessmentId, score }) {
        const query = `
            INSERT INTO participant_submissions (training_id, participant_email, assessment_id, score)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (training_id, participant_email) DO UPDATE SET
                score = EXCLUDED.score,
                submitted_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        // NOTE: We added ON CONFLICT to allow a user to retake a quiz.

        const values = [trainingId, participantEmail, assessmentId, score];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating submission:', error);
            throw error;
        }
    },
    async getNationalAverageScore() {
        const query = 'SELECT AVG(score) as average_score FROM participant_submissions;';
        try {
            const result = await pool.query(query);
            // Return the average score, or 0 if there are no submissions yet
            return result.rows[0].average_score || 0;
        } catch (error) {
            console.error('Error calculating national average score:', error);
            throw error;
        }
    },
    async findAll() {
    const query = 'SELECT * FROM participant_submissions;';
    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error finding all submissions:', error);
        throw error;
    }
},
 async getAverageScoresByTheme() {
        const query = `
            SELECT t.theme, AVG(ps.score) as average_score
            FROM participant_submissions ps
            JOIN trainings t ON ps.training_id = t.id
            GROUP BY t.theme
            ORDER BY t.theme;
        `;
        try {
            const result = await pool.query(query);
            return result.rows; // Returns an array like [{ theme: 'Flood', average_score: '85.50' }]
        } catch (error) {
            console.error('Error getting average scores by theme:', error);
            throw error;
        }
    }
};

module.exports = Submission;