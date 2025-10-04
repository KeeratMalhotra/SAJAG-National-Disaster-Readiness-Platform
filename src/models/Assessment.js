const pool = require('../config/database');

const Assessment = {
    /**
     * Finds an assessment by its theme and retrieves all its questions and options.
     * @param {string} theme - The theme of the training (e.g., 'Flood').
     * @returns {object|null} The complete assessment object, or null if not found.
     */
    async findByThemeWithQuestions(theme) {
        // This query fetches the assessment, its questions, and their options all at once.
        // It uses JSON aggregation to structure the data nicely.
        const query = `
            SELECT 
                a.id, 
                a.title,
                a.training_theme,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', q.id,
                            'question_text', q.question_text,
                            'options', (
                                SELECT json_agg(
                                    json_build_object('id', o.id, 'option_text', o.option_text)
                                )
                                FROM options o WHERE o.question_id = q.id
                            )
                        ) ORDER BY q.question_order
                    ) FILTER (WHERE q.id IS NOT NULL), '[]'
                ) as questions
            FROM assessments a
            LEFT JOIN questions q ON q.assessment_id = a.id
            WHERE a.training_theme = $1
            GROUP BY a.id;
        `;

        try {
            const result = await pool.query(query, [theme]);
            return result.rows[0]; // Returns the full quiz object or undefined
        } catch (error) {
            console.error('Error finding assessment by theme:', error);
            throw error;
        }
    },
    async getCorrectAnswers(assessmentId) {
        const query = `
            SELECT o.id FROM options o
            JOIN questions q ON o.question_id = q.id
            WHERE q.assessment_id = $1 AND o.is_correct = true;
        `;
        try {
            const result = await pool.query(query, [assessmentId]);
            // Return a simple array of the correct option IDs
            return result.rows.map(row => row.id);
        } catch (error) {
            console.error('Error fetching correct answers:', error);
            throw error;
        }
    }
};

module.exports = Assessment;