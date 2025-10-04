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
    }
};

module.exports = Submission;