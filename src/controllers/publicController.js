const Assessment = require('../models/Assessment');
const Training = require('../models/Training');

const publicController = {
    showPublicAssessmentPage: async (req, res) => {
        try {
            const { trainingId } = req.params;
            const training = await Training.findById(trainingId);
            if (!training) {
                return res.status(404).send('Training not found.');
            }

            const assessment = await Assessment.findByThemeWithQuestions(training.theme);
            if (!assessment) {
                return res.status(404).send(`No assessment found for the theme: ${training.theme}`);
            }

            res.render('pages/public_assessment', {
                pageTitle: assessment.title,
                assessment: assessment,
                trainingId: trainingId
            });

        } catch (error) {
            console.error('Error showing public assessment:', error);
            res.status(500).send('Server error');
        }
    }
};

module.exports = publicController;