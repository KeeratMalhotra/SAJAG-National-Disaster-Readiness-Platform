// const pool = require('../config/database');
// const riskProfiles = require('../data/risk_profiles.json'); // Ensure this file exists

// const predictionService = {
    
//     // The Core 5-Factor Algorithm
//     async calculateGaps() {
//         try {
//             // 1. Fetch Training Stats per District (Real DB Data)
//             // We group submissions by District (extracted from User/Training location)
//             // Note: Since we don't have a standardized 'district' column in trainings yet, 
//             // we will simulate it by matching string locations or using State.
//             // FOR HACKATHON: We will use the 'risk_profiles.json' keys as our list of districts
//             // and check how many trainings happened there.

//             const districtsToCheck = Object.keys(riskProfiles);
//             const gaps = [];

//             for (const district of districtsToCheck) {
//                 const profile = riskProfiles[district];
                
//                 // A. Check Saturation (How many people trained?)
//                 // We search for trainings where location_text contains the district name
//                 const trainingQuery = `
//                     SELECT COUNT(*) as count 
//                     FROM participant_submissions ps
//                     JOIN trainings t ON ps.training_id = t.id
//                     WHERE t.location_text ILIKE $1
//                 `;
//                 const trainingRes = await pool.query(trainingQuery, [`%${district}%`]);
//                 const trainedCount = parseInt(trainingRes.rows[0].count) || 0;

//                 // B. Check Recency (When was the last one?)
//                 const dateQuery = `
//                     SELECT MAX(start_date) as last_date
//                     FROM trainings
//                     WHERE location_text ILIKE $1
//                 `;
//                 const dateRes = await pool.query(dateQuery, [`%${district}%`]);
//                 const lastDate = dateRes.rows[0].last_date ? new Date(dateRes.rows[0].last_date) : null;

//                 // --- THE ALGORITHM ---
                
//                 // 1. Vulnerability (From JSON) - Weight: 40%
//                 const scoreVulnerability = profile.vulnerability_score || 0.5;

//                 // 2. Saturation (Trained / Population) - Weight: 30%
//                 // Assume target is 1000 people per district for the demo
//                 const targetPopulation = 1000;
//                 const saturationRatio = Math.min(trainedCount / targetPopulation, 1);
//                 const scoreGap = 1 - saturationRatio; // High gap if low saturation

//                 // 3. Recency (Days since last training) - Weight: 30%
//                 let scoreRecency = 1; // Default to Bad (1.0) if never trained
//                 if (lastDate) {
//                     const daysAgo = (new Date() - lastDate) / (1000 * 60 * 60 * 24);
//                     // If trained > 180 days ago, score increases
//                     scoreRecency = Math.min(daysAgo / 180, 1); 
//                 }

//                 // Final Priority Score (0 to 1)
//                 const finalScore = (scoreVulnerability * 0.4) + (scoreGap * 0.3) + (scoreRecency * 0.3);

//                 // Only add to list if it's a gap (Score > 0.4)
//                 if (finalScore > 0.4) {
//                     gaps.push({
//                         district: district,
//                         theme: profile.themes[0] || 'General',
//                         priorityScore: finalScore.toFixed(2),
//                         trainedCount: trainedCount,
//                         reason: `High Risk (${scoreVulnerability}) & Low Saturation (${trainedCount}/${targetPopulation})`
//                     });
//                 }
//             } else {
//                 // Earthquakes/Fires are always a threat
//                 seasonalityScore = 0.5; 
//             }

//             // --- FACTOR B: SATURATION GAP (The "Need" Score) ---
//             // We use logarithmic scaling for population. 
//             // 100 untrained people in a tiny village is as critical as 1000 in a city.
//             const stats = districtStats[districtKey] || { trained: 0, lastDate: null };
//             const coverageRatio = stats.trained / profile.population;
            
//             // If coverage < 1%, score is 1.0 (Critical). If > 10%, score drops significantly.
//             // This creates a "Diminishing Returns" curve.
//             const saturationScore = Math.max(0, 1 - (coverageRatio * 10)); 

//             // --- FACTOR C: RECENCY DECAY ---
//             // Training knowledge decays over time. 
//             let recencyScore = 1.0;
//             if (stats.lastDate) {
//                 const daysSince = (today - new Date(stats.lastDate)) / (1000 * 60 * 60 * 24);
//                 // If trained within last 6 months, low urgency (0.0). > 2 years = High urgency (1.0).
//                 recencyScore = Math.min(daysSince / 730, 1);
//             }

//             // --- FACTOR D: HISTORICAL SEVERITY (The "Static" Score) ---
//             const severityScore = profile.history_severity_index;

//             // --- THE WINNING FORMULA ---
//             // We weight Seasonality heavily because NDMA funds are time-sensitive.
//             // Formula: (Threat * 0.6) + (Vulnerability * 0.4)
            
//             const threatIndex = (seasonalityScore * 0.6) + (severityScore * 0.4);
//             const vulnerabilityIndex = (saturationScore * 0.7) + (recencyScore * 0.3);
            
//             const finalPriority = (threatIndex * 0.6) + (vulnerabilityIndex * 0.4);

//             priorityList.push({
//                 district: districtKey,
//                 state: profile.state,
//                 hazard: profile.primary_hazard,
//                 scores: {
//                     priority: finalPriority.toFixed(3),
//                     threat: threatIndex.toFixed(2),
//                     vulnerability: vulnerabilityIndex.toFixed(2)
//                 },
//                 stats: {
//                     population: profile.population,
//                     trained: stats.trained,
//                     coverage: (coverageRatio * 100).toFixed(3) + "%"
//                 },
//                 // We generate the "Why" dynamically below
//                 context: this.generateReasoning(districtKey, profile, seasonalityScore, saturationScore)
//             });
//         }

//         // Sort by Priority Descending
//         return priorityList.sort((a, b) => b.scores.priority - a.scores.priority);
//     },

//     // Mock function to simulate DB fetch
//     async getRealTimeStats() {
//         // In real app, run a GROUP BY SQL query here
//         return {
//             "majuli": { trained: 150, lastDate: "2023-01-10" }, // High priority (Season coming, low training)
//             "delhi": { trained: 5000, lastDate: "2024-02-15" },
//             "kutch": { trained: 12000, lastDate: "2023-11-20" }, // Well trained
//             "chamoli": { trained: 20, lastDate: null } // Critical gap
//         };
//     },

//     generateReasoning(district, profile, seasonScore, satScore) {
//         if (seasonScore > 0.7 && satScore > 0.8) return "CRITICAL: Approaching peak disaster season with minimal workforce readiness.";
//         if (satScore > 0.9) return "HIGH GAP: Historically vulnerable area with almost zero community training.";
//         if (seasonScore > 0.9) return "URGENT: Currently in peak disaster window.";
//         return "Maintenance: Update training to refresh community knowledge.";
//     },

//     /**
//      * THE AI JUDGE IMPRESSOR
//      * Call this ONCE per week (cron job), not on every request.
//      * It updates the static 'history_severity_index' in your JSON/DB.
//      */
//     async analyzeTrendsWithAI() {
//         const prompt = `
//             Analyze the disaster trends for the last 5 years for: Chamoli, Rudraprayag, Surat, Kutch, Jagatsinghpur.
//             Focus on: 
//             1. Increased frequency of climate events (e.g., GLOF in Chamoli).
//             2. Urban density changes affecting risk (e.g., Delhi).
            
//             Output a JSON mapping district names to a 'trend_modifier' (float -0.1 to +0.2).
//             Example: If Chamoli risk is rising due to construction, score +0.15.
//         `;
        
//         // ... (Gemini Implementation similar to your code) ...
//         // Use this to nudge the 'history_severity_index' up or down.
//     }
// };

// module.exports = predictionService;