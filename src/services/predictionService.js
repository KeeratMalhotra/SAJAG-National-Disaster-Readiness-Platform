const Training = require('../models/Training');
const Submission = require('../models/Submission');
const riskProfiles = require('../data/risk_profiles.json');

const predictionService = {
    async calculateGaps() {
        const allTrainings = await Training.findAll();
        const allSubmissions = await Submission.findAll();
        const gaps = [];

        // Loop through each disaster theme in our risk profile
        for (const theme in riskProfiles) {
            const highRiskDistricts = riskProfiles[theme];

            // For each high-risk district, check its preparedness
            highRiskDistricts.forEach(district => {
                // Find trainings that happened in this district for this theme
                const relevantTrainings = allTrainings.filter(t => 
                    t.theme === theme && t.location_text.includes(district)
                );

                const trainingCount = relevantTrainings.length;

                // A simple threshold: flag if fewer than 2 trainings
                if (trainingCount < 2) {
                    gaps.push({
                        district: district,
                        theme: theme,
                        reason: `Low training count (${trainingCount})`,
                        priority: 'High'
                    });
                }
            });
        }
        return gaps;
    }
};

module.exports = predictionService;