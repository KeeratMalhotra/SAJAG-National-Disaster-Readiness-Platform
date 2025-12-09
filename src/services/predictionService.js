const pool = require('../config/database');
const riskProfiles = require('../data/risk_profiles.json'); 

const predictionService = {
    
    // 1. Get Average Scores Grouped by Theme (MISSING FUNCTION ADDED HERE)
    async getScoresByTheme(state) {
        try {
            let query = `
                SELECT t.theme, AVG(ps.score) as average_score
                FROM participant_submissions ps
                JOIN trainings t ON ps.training_id = t.id
            `;
            const params = [];

            // If a state is provided (SDMA View), filter by that state
            if (state) {
                query += ` JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1`;
                params.push(state);
            }

            query += ` GROUP BY t.theme ORDER BY average_score DESC`;

            const result = await pool.query(query, params);
            return result.rows;

        } catch (error) {
            console.error("Error in predictionService.getScoresByTheme:", error);
            return [];
        }
    },

    // 2. The Core Algorithm to find Training Gaps
    async calculateGaps(state) {
        try {
            // Get the list of places we want to check (from our JSON file)
            const districtsToCheck = Object.keys(riskProfiles);
            const gaps = [];

            for (const district of districtsToCheck) {
                const profile = riskProfiles[district];
                
                // 1. Check Saturation (How many people trained in this location?)
                let trainingQuery = `
                    SELECT COUNT(*) as count 
                    FROM participant_submissions ps
                    JOIN trainings t ON ps.training_id = t.id
                    WHERE t.location_text ILIKE $1
                `;
                const params = [`%${district}%`];

                if (state) {
                     trainingQuery += ` AND t.creator_user_id IN (SELECT id FROM users WHERE state = $2)`;
                     params.push(state);
                }

                const trainingRes = await pool.query(trainingQuery, params);
                const trainedCount = parseInt(trainingRes.rows[0].count) || 0;

                // 2. Check Recency (When was the last training here?)
                let dateQuery = `
                    SELECT MAX(start_date) as last_date
                    FROM trainings
                    WHERE location_text ILIKE $1
                `;
                // reuse params as index 1 is strictly district string match
                
                const dateRes = await pool.query(dateQuery, [`%${district}%`]);
                const lastDate = dateRes.rows[0].last_date ? new Date(dateRes.rows[0].last_date) : null;

                // --- THE SCORING ALGORITHM ---
                
                // A. Vulnerability (From JSON) - Weight: 40%
                const scoreVulnerability = profile.vulnerability_score || 0.5;

                // B. Saturation (Trained / Population) - Weight: 30%
                // using the population from JSON, or default to 1000
                const targetPopulation = profile.population || 1000;
                const saturationRatio = Math.min(trainedCount / targetPopulation, 1);
                const scoreGap = 1 - saturationRatio; // High gap if low saturation

                // C. Recency (Days since last training) - Weight: 30%
                let scoreRecency = 1; // Default to Bad (1.0) if never trained
                if (lastDate) {
                    const daysAgo = (new Date() - lastDate) / (1000 * 60 * 60 * 24);
                    // If trained > 180 days ago, score increases (worsens)
                    scoreRecency = Math.min(daysAgo / 180, 1); 
                }

                // Final Priority Score (0 to 1)
                const finalScore = (scoreVulnerability * 0.4) + (scoreGap * 0.3) + (scoreRecency * 0.3);

                // Only add to list if it's a significant gap (Score > 0.4)
                if (finalScore > 0.4) {
                    gaps.push({
                        district: district,
                        theme: profile.themes[0] || 'General',
                        priorityScore: finalScore.toFixed(2),
                        trainedCount: trainedCount,
                        reason: `High Risk (${scoreVulnerability}) & Low Saturation (${trainedCount}/${targetPopulation})`
                    });
                }
            }

            // Sort by Priority Descending (Highest priority first)
            return gaps.sort((a, b) => b.priorityScore - a.priorityScore);

        } catch (error) {
            console.error("Error in predictionService.calculateGaps:", error);
            return []; // Return empty array so dashboard doesn't crash
        }
    }
};

module.exports = predictionService;