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
    },
    async findByTrainingId(trainingId) {
        const query = 'SELECT * FROM participant_submissions WHERE training_id = $1 ORDER BY submitted_at DESC;';
        try {
            const result = await pool.query(query, [trainingId]);
            return result.rows;
        } catch (error) {
            console.error('Error finding submissions by training id:', error);
            throw error;
        }
    },
    async findByEmail(email) {
        const query = `
            SELECT s.score, s.submitted_at, t.title as training_title
            FROM participant_submissions s
            JOIN trainings t ON s.training_id = t.id
            WHERE s.participant_email = $1
            ORDER BY s.submitted_at DESC;
        `;
        try {
            const result = await pool.query(query, [email]);
            return result.rows;
        } catch (error) {
            console.error('Error finding submissions by email:', error);
            throw error;
        }
    },
     async getAverageScoreByCreator(creatorUserId) {
        const query = `
            SELECT AVG(ps.score) as average_score
            FROM participant_submissions ps
            JOIN trainings t ON ps.training_id = t.id
            WHERE t.creator_user_id = $1;
        `;
        try {
            const result = await pool.query(query, [creatorUserId]);
            return result.rows[0].average_score || 0;
        } catch (error) {
            console.error('Error getting avg score by creator:', error);
            throw error;
        }
    },
    async countByCreator(creatorUserId) {
    const query = 'SELECT COUNT(*) FROM participant_submissions ps JOIN trainings t ON ps.training_id = t.id WHERE t.creator_user_id = $1;';
    try {
        const result = await pool.query(query, [creatorUserId]);
        return parseInt(result.rows[0].count, 10);
    } catch (error) {
        console.error('Error counting submissions by creator:', error);
        throw error;
    }
},
async getParticipantCountByLocation(theme, location) {
    const query = `
        SELECT COUNT(DISTINCT ps.participant_email) as participant_count
        FROM participant_submissions ps
        JOIN trainings t ON ps.training_id = t.id
        WHERE t.theme = $1 AND t.location_text ILIKE $2;
    `;
    try {
        const result = await pool.query(query, [theme, `%${location}%`]);
        return parseInt(result.rows[0].participant_count, 10);
    } catch (error) {
        console.error('Error getting participant count by location:', error);
        throw error;
    }
},
async findFlaggedByState(state) {
    const query = `
        SELECT s.*, t.title as training_title, t.theme as training_theme, u.id as partner_id
        FROM participant_submissions s
        JOIN trainings t ON s.training_id = t.id
        JOIN users u ON t.creator_user_id = u.id
        WHERE u.state = $1 AND s.risk_flag != 'SAFE'
        ORDER BY s.created_at DESC;
    `;
    try {
        const result = await pool.query(query, [state]);
            return result.rows;
        } catch (error) {
            console.error('Error finding flagged submissions:', error);
            throw error;
        }
    },
async getAverageScoreByState(state) {
    const query = `
        SELECT AVG(ps.score) as average_score
        FROM participant_submissions ps
        JOIN trainings t ON ps.training_id = t.id
        JOIN users u ON t.creator_user_id = u.id
        WHERE u.state = $1;
    `;
    try {
        const result = await pool.query(query, [state]);
        return result.rows[0].average_score || 0;
    } catch (error) {
        console.error('Error getting avg score by state:', error);
        throw error;
    }
},
async deleteByTrainingId(trainingId) {
        const query = 'DELETE FROM participant_submissions WHERE training_id = $1;';
        try {
            await pool.query(query, [trainingId]);
        } catch (error) {
            console.error('Error deleting submissions by training id:', error);
            throw error;
        }
    },
};

module.exports = Submission;