const pool = require('../config/database');

const Assessment = {
    
    /**
     * Finds an assessment by its theme and retrieves all its questions and options.
     * Used by the "Take Assessment" page to render images and audio.
     * @param {string} theme - The theme of the training (e.g., 'Flood').
     */
    async findByThemeWithQuestions(theme) {
        try {
            // 1. Get Assessment Metadata
            const assessmentQuery = `SELECT * FROM assessments WHERE training_theme = $1`;
            const assessmentRes = await pool.query(assessmentQuery, [theme]);
            
            if (assessmentRes.rows.length === 0) return null;
            
            const assessment = assessmentRes.rows[0];

            // 2. Get Questions (With Audio/Image context)
            const questionsQuery = `
                SELECT id, question_text, image_url, audio_url, category_tag 
                FROM questions 
                WHERE assessment_id = $1 
                ORDER BY question_order ASC
            `;
            const questionsRes = await pool.query(questionsQuery, [assessment.id]);
            
            // 3. Get Options for EACH question (Visual Answers)
            // We use Promise.all to run these queries in parallel for speed
            const questionsWithOptions = await Promise.all(questionsRes.rows.map(async (q) => {
                const optionsQuery = `
                    SELECT id, option_text, image_url 
                    FROM options 
                    WHERE question_id = $1
                `;
                const optionsRes = await pool.query(optionsQuery, [q.id]);
                return { ...q, options: optionsRes.rows };
            }));

            return { ...assessment, questions: questionsWithOptions };

        } catch (error) {
            console.error('Error finding assessment with questions:', error);
            throw error;
        }
    },

    /**
     * Helper to get the correct answers for backend verification.
     * Prevents cheating by NOT sending correct answers to the frontend.
     */
    async getCorrectAnswers(assessmentId) {
        const query = `
            SELECT q.id as question_id, o.id as correct_option_id
            FROM questions q
            JOIN options o ON o.question_id = q.id
            WHERE q.assessment_id = $1 AND o.is_correct = true;
        `;
        try {
            const result = await pool.query(query, [assessmentId]);
            
            // Return a map for easy checking: { "question_id": "correct_option_id" }
            const answerMap = {};
            result.rows.forEach(row => {
                answerMap[row.question_id] = row.correct_option_id;
            });
            return answerMap;

        } catch (error) {
            console.error('Error fetching correct answers:', error);
            throw error;
        }
    }
};

module.exports = Assessment;