const pool = require('../config/database');
const riskProfiles = require('../data/risk_profiles.json'); // Ensure this file exists

const predictionService = {
    
    // The Core 5-Factor Algorithm
    async calculateGaps() {
        try {
            // 1. Fetch Training Stats per District (Real DB Data)
            // We group submissions by District (extracted from User/Training location)
            // Note: Since we don't have a standardized 'district' column in trainings yet, 
            // we will simulate it by matching string locations or using State.
            // FOR HACKATHON: We will use the 'risk_profiles.json' keys as our list of districts
            // and check how many trainings happened there.

            const districtsToCheck = Object.keys(riskProfiles);
            const gaps = [];

            for (const district of districtsToCheck) {
                const profile = riskProfiles[district];
                
                // A. Check Saturation (How many people trained?)
                // We search for trainings where location_text contains the district name
                const trainingQuery = `
                    SELECT COUNT(*) as count 
                    FROM participant_submissions ps
                    JOIN trainings t ON ps.training_id = t.id
                    WHERE t.location_text ILIKE $1
                `;
                const trainingRes = await pool.query(trainingQuery, [`%${district}%`]);
                const trainedCount = parseInt(trainingRes.rows[0].count) || 0;

                // B. Check Recency (When was the last one?)
                const dateQuery = `
                    SELECT MAX(start_date) as last_date
                    FROM trainings
                    WHERE location_text ILIKE $1
                `;
                const dateRes = await pool.query(dateQuery, [`%${district}%`]);
                const lastDate = dateRes.rows[0].last_date ? new Date(dateRes.rows[0].last_date) : null;

                // --- THE ALGORITHM ---
                
                // 1. Vulnerability (From JSON) - Weight: 40%
                const scoreVulnerability = profile.vulnerability_score || 0.5;

                // 2. Saturation (Trained / Population) - Weight: 30%
                // Assume target is 1000 people per district for the demo
                const targetPopulation = 1000;
                const saturationRatio = Math.min(trainedCount / targetPopulation, 1);
                const scoreGap = 1 - saturationRatio; // High gap if low saturation

                // 3. Recency (Days since last training) - Weight: 30%
                let scoreRecency = 1; // Default to Bad (1.0) if never trained
                if (lastDate) {
                    const daysAgo = (new Date() - lastDate) / (1000 * 60 * 60 * 24);
                    // If trained > 180 days ago, score increases
                    scoreRecency = Math.min(daysAgo / 180, 1); 
                }

                // Final Priority Score (0 to 1)
                const finalScore = (scoreVulnerability * 0.4) + (scoreGap * 0.3) + (scoreRecency * 0.3);

                // Only add to list if it's a gap (Score > 0.4)
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

            // Sort by Urgency (Highest Score First)
            return gaps.sort((a, b) => b.priorityScore - a.priorityScore);

        } catch (error) {
            console.error('Gap Calculation Error:', error);
            return []; // Return empty on error to prevent crash
        }
    }
};

module.exports = predictionService;