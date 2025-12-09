const pool = require('../config/database');
const riskProfiles = require('../data/risk_profiles.json'); 

const predictionService = {
    
    async getScoresByTheme(state) {
        try {
            let query = `
                SELECT t.theme, AVG(ps.score) as average_score
                FROM participant_submissions ps
                JOIN trainings t ON ps.training_id = t.id
            `;
            const params = [];

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

    async calculateGaps(state) {
        try {
            const districtsToCheck = Object.keys(riskProfiles);
            const gaps = [];

            for (const district of districtsToCheck) {
                const profile = riskProfiles[district];
                
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

                let dateQuery = `
                    SELECT MAX(start_date) as last_date
                    FROM trainings
                    WHERE location_text ILIKE $1
                `;
                
                const dateRes = await pool.query(dateQuery, [`%${district}%`]);
                const lastDate = dateRes.rows[0].last_date ? new Date(dateRes.rows[0].last_date) : null;

                
                const scoreVulnerability = profile.vulnerability_score || 0.5;

                const targetPopulation = profile.population || 1000;
                const saturationRatio = Math.min(trainedCount / targetPopulation, 1);
                const scoreGap = 1 - saturationRatio; 

                let scoreRecency = 1; 
                if (lastDate) {
                    const daysAgo = (new Date() - lastDate) / (1000 * 60 * 60 * 24);
                    scoreRecency = Math.min(daysAgo / 180, 1); 
                }

                const finalScore = (scoreVulnerability * 0.4) + (scoreGap * 0.3) + (scoreRecency * 0.3);

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

            return gaps.sort((a, b) => b.priorityScore - a.priorityScore);

        } catch (error) {
            console.error("Error in predictionService.calculateGaps:", error);
            return []; 
        }
    }
};

module.exports = predictionService;