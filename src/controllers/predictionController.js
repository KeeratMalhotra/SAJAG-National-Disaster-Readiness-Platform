const predictionService = require('../services/predictionService');

const predictionController = {
    getGaps: async (req, res) => {
        try {
            const gaps = await predictionService.calculateGaps();
            res.status(200).json(gaps);
        } catch (error) {
            res.status(500).json({ message: 'Error calculating training gaps.' });
        }
    }
};
module.exports = predictionController;