const Submission = require('../models/Submission');
const Training = require('../models/Training');
const riskProfiles = require('../data/risk_profiles.json');
const pool = require('../config/database');

const predictionService = {
    async getScoresByTheme(state = null) {
        try {
            let query = `
                SELECT 
                    t.theme, 
                    AVG(ps.score) as average_score
                FROM 
                    participant_submissions ps
                JOIN 
                    trainings t ON ps.training_id = t.id
            `;
            
            const params = [];
            
            if (state) {
                // Join with users table to filter by state
                query += `
                    JOIN 
                        users u ON t.creator_user_id = u.id
                    WHERE 
                        u.state = $1
                `;
                params.push(state);
            }
            
            query += `
                GROUP BY 
                    t.theme
                ORDER BY 
                    average_score DESC
            `;

            const { rows } = await pool.query(query, params);
            return rows;
        } catch (error) {
            console.error('Error getting scores by theme:', error);
            return [];
        }
    },
    async calculateGaps() {
        const gaps = [];
        const today = new Date();

        // Loop through each district in our NEW risk profile
        for (const district in riskProfiles) {
            const profile = riskProfiles[district];
            
            // For each theme (e.g., "Flood") in that district's profile
            for (const theme of profile.themes) {
                
                // --- 1. GET DYNAMIC DATA ---
                // Get the total number of unique people trained for this theme/location
                const participantCount = await Submission.getParticipantCountByLocation(theme, district);
                
                // Get the last time a training was held here
                const mostRecentDate = await Training.findMostRecentTrainingDate(theme, district);

                // --- 2. CALCULATE HEURISTICS ---
                
                // Saturation: (Trained / Population). Capped at 1 (100%)
                const saturation = Math.min(participantCount / profile.population, 1);
                
                // Recency: How long ago was the last training?
                let daysSinceLastTraining = 365 * 3; // Default to a high number (3 years) if no training
                if (mostRecentDate) {
                    const diffTime = Math.abs(today - new Date(mostRecentDate));
                    daysSinceLastTraining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
                
                // Recency Factor: A score from 0 to 3. 
                // A training today (0 days) gives a 0 factor. A training >3 years ago (1095 days) gives a max factor of 3.
                const recencyFactor = Math.min(daysSinceLastTraining / 365, 3).toFixed(2);


                // --- 3. CALCULATE FINAL PRIORITY SCORE ---
                // Priority = Vulnerability * (1 - Saturation) * Recency
                // (1 - Saturation) = "Untrained Ratio".
                const vulnerability = profile.vulnerability_score;
                const untrainedRatio = (1 - saturation);
                
                // We use (1 + recencyFactor) so a recent training (factor 0) still counts (x1)
                // and an old training (factor 3) is weighted heavily (x4)
                const priorityScore = vulnerability * untrainedRatio * (1 + parseFloat(recencyFactor));

                // --- 4. ADD TO LIST ---
                if (priorityScore > 0.1) { // Only show meaningful gaps
                    gaps.push({
                        district: district,
                        theme: theme,
                        priorityScore: priorityScore.toFixed(3),
                        reason: `Saturation: ${(saturation * 100).toFixed(1)}% (${participantCount} / ${profile.population}). Last training: ${daysSinceLastTraining} days ago.`
                    });
                }
            }
        }
        
        // Sort by the highest priority score first
        return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
    }
};

module.exports = predictionService;