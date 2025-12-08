const pool = require('../config/database');
const Training = require('../models/Training');

const reportController = {
    
    // The "Lackness Report" Engine
    getTrainingAnalysis: async (req, res) => {
        try {
            const { trainingId } = req.params;
            const training = await Training.findById(trainingId);

            if (!training) return res.status(404).send("Training not found");

            // 1. Fetch Topic-Wise Performance
            // This SQL groups wrong answers by the 'category_tag' we added to the Questions table
            const analysisQuery = `
                SELECT 
                    q.category_tag,
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN sa.is_correct = false THEN 1 ELSE 0 END) as wrong_count
                FROM submission_answers sa
                JOIN participant_submissions ps ON sa.submission_id = ps.id
                JOIN questions q ON sa.question_id = q.id
                WHERE ps.training_id = $1
                GROUP BY q.category_tag
            `;

            const { rows } = await pool.query(analysisQuery, [trainingId]);

            // 2. Process Data for the Chart
            // We calculate a "Failure Rate" for each topic
            const labels = [];
            const failureRates = [];
            const colors = [];

            rows.forEach(row => {
                // Prevent division by zero
                const total = parseInt(row.total_attempts);
                const wrong = parseInt(row.wrong_count);
                const failRate = total > 0 ? ((wrong / total) * 100).toFixed(1) : 0;
                
                labels.push(row.category_tag || 'General');
                failureRates.push(failRate);
                
                // Color Code: Red if > 40% fail, Green if < 20% fail
                if (failRate > 40) colors.push('#dc3545'); // Red (Danger)
                else if (failRate > 20) colors.push('#ffc107'); // Yellow (Warning)
                else colors.push('#198754'); // Green (Good)
            });

            // 3. Generate "Actionable Insights" (The Text Advice)
            const insights = rows
                .filter(row => (parseInt(row.wrong_count) / parseInt(row.total_attempts)) > 0.4) // Filter bad topics (>40% fail)
                .map(row => `<strong>CRITICAL GAP:</strong> Participants struggled with <strong>${row.category_tag}</strong>. Please conduct a follow-up session on this topic.`);

            if (insights.length === 0 && rows.length > 0) {
                insights.push("<strong>EXCELLENT:</strong> Proficiency is high across all topics. No immediate follow-up needed.");
            } else if (rows.length === 0) {
                insights.push("No detailed answer data available yet.");
            }

            // 4. Render the Report Page
            res.render('pages/training_report', {
                pageTitle: 'Impact Analysis Report',
                training,
                chartData: { labels, failureRates, colors },
                insights
            });

        } catch (error) {
            console.error("Report Error:", error);
            res.status(500).send("Analysis Failed");
        }
    }
};

module.exports = reportController;