const Submission = require('../models/Submission');
const Training = require('../models/Training');
const riskProfiles = require('../data/risk_profiles.json');
const pool = require('../config/database');
/**
 * Calculates the Relevance Score for districts to find the Top 30.
 */
const calculateRelevanceScore = (districtData) => {
    // Weights (Total = 1.0)
    const WEIGHTS = {
        TIMING: 0.30,      // 30% - Imminent threat (Seasonality)
        SATURATION: 0.25,  // 25% - Untrained population gap
        IMPACT: 0.20,      // 20% - Severity of disaster
        HISTORY: 0.15,     // 15% - Chronic frequency
        RECENCY: 0.10      // 10% - Time since last training
    };

    // 1. Calculate Saturation Gap (Lower saturation = Higher Need)
    // Formula: 1 - (Trained / Population)
    // Edge case: If population is 0, handle division by zero.
    let saturationRatio = districtData.totalPopulation > 0 
        ? (districtData.trainedCount / districtData.totalPopulation) 
        : 0;
    // We cap ratio at 1 (100%). We want the GAP, so we take (1 - ratio).
    let saturationScore = 1 - Math.min(saturationRatio, 1);

    // 2. Calculate Recency Score (Older training = Higher Need)
    // Let's say if training was > 365 days ago, score is max (1.0).
    const daysSinceLastTraining = (new Date() - new Date(districtData.lastTrainingDate)) / (1000 * 60 * 60 * 24);
    let recencyScore = Math.min(daysSinceLastTraining / 365, 1); 
    // If never trained, recency is max
    if (!districtData.lastTrainingDate) recencyScore = 1;

    // 3. Timing/Seasonality (Probability Score)
    // E.g., If it's July, and Assam has high flood probability.
    let timingScore = districtData.currentMonthProbability || 0; // 0 to 1

    // 4. Historical Frequency (Normalized)
    // Assume maxDisastersInAnyDistrict is a constant calculated beforehand (e.g., 50)
    const MAX_DISASTER_COUNT_REF = 50; 
    let frequencyScore = Math.min(districtData.totalDisastersLast10Years / MAX_DISASTER_COUNT_REF, 1);

    // 5. Disaster Scale (Normalized)
    // Assume maxAffectedRef is e.g., 100,000 people
    const MAX_AFFECTED_REF = 100000;
    let impactScore = Math.min(districtData.avgAffectedPeople / MAX_AFFECTED_REF, 1);

    // --- FINAL CALCULATION ---
    const finalScore = 
        (WEIGHTS.TIMING * timingScore) +
        (WEIGHTS.SATURATION * saturationScore) +
        (WEIGHTS.IMPACT * impactScore) +
        (WEIGHTS.HISTORY * frequencyScore) +
        (WEIGHTS.RECENCY * recencyScore);

    return finalScore;
};

// Main function to get Top 30
const getTopRelevantDistricts = async (allDistricts) => {
    // 1. Calculate score for each district
    const scoredDistricts = allDistricts.map(district => {
        return {
            ...district,
            relevanceScore: calculateRelevanceScore(district)
        };
    });

    // 2. Sort by Score Descending (Highest score first)
    scoredDistricts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 3. Return Top 30
    return scoredDistricts.slice(0, 30);
};

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

