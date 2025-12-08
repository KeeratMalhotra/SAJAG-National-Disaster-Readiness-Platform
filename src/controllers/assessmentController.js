// const Assessment = require('../models/Assessment');
// const Training = require('../models/Training');
// const Submission = require('../models/Submission');

// const assessmentController = {
//     // Add this new function
//     showAssessmentPage: async (req, res) => {
//         try {
//             const { trainingId } = req.params;

//             // First, find the training to get its theme
//             // We need to create a findById function in the Training model
//             const training = await Training.findById(trainingId);
//             if (!training) {
//                 return res.status(404).send('Training not found.');
//             }

//             // Now, fetch the assessment using the training's theme
//             const assessment = await Assessment.findByThemeWithQuestions(training.theme);
//             if (!assessment) {
//                 return res.status(404).send(`No assessment found for the theme: ${training.theme}`);
//             }

//             res.render('pages/take_assessment', {
//                 pageTitle: assessment.title,
//                 assessment: assessment,
//                 trainingId: trainingId
//             });

//         } catch (error) {
//             res.status(500).send('Server error');
//         }
//     },
//     getAssessmentByTheme: async (req, res) => {
//         try {
//             const { theme } = req.params; // Get the theme from the URL parameter
//             const assessment = await Assessment.findByThemeWithQuestions(theme);

//             if (!assessment) {
//                 return res.status(404).json({ message: 'Assessment for this theme not found.' });
//             }

//             res.status(200).json(assessment);
//         } catch (error) {
//             res.status(500).json({ message: 'Server error while fetching assessment.' });
//         }
//     },
//     submitAssessment: async (req, res) => {
//         try {
//             const { assessmentId, trainingId, answers, participantEmail } = req.body;
        
//         // Use the email from the form if it exists, otherwise fall back to the logged-in user's email
//         const email = participantEmail || req.user.email;

//             // 1. Get the correct answers from the database
//             const correctAnswers = await Assessment.getCorrectAnswers(assessmentId);
//             const totalQuestions = correctAnswers.length;

//             // 2. Calculate the score
//             let score = 0;
//             const submittedAnswerIds = Object.values(answers);
//             submittedAnswerIds.forEach(answerId => {
//                 if (correctAnswers.includes(answerId)) {
//                     score++;
//                 }
//             });

//             const finalScore = (score / totalQuestions) * 100;

//             // 3. Save the submission
//             await Submission.create({
//             trainingId,
//             participantEmail: email, // Use the flexible email variable
//             assessmentId,
//             score: finalScore.toFixed(2)
//         });

//             res.status(200).json({
//                 message: 'Assessment submitted successfully!',
//                 score: finalScore.toFixed(2),
//                 totalQuestions: totalQuestions,
//                 correctAnswers: score
//             });

//         } catch (error) {
//             res.status(500).json({ message: 'Server error while submitting assessment.' });
//         }
//     }
    
// };

// module.exports = assessmentController;

const Assessment = require('../models/Assessment');
const googleFormService = require('../services/googleFormService');

const assessmentController = {
    // 1. Save Link Function
    saveLink: async (req, res) => {
        try {
            console.log('Save Link Request Recieved:', req.body); // Debug Log
            const { theme, link } = req.body;

            // Basic Validation
            if (!link || !link.includes('forms')) {
                 return res.status(400).json({ success: false, message: 'Invalid Google Form Link' });
            }

            const formId = googleFormService.extractFormId(link);
            const title = `${theme} Safety Assessment`;
            
            await Assessment.upsert(title, theme, link, formId);

            res.status(200).json({ success: true, message: 'Assessment Link saved successfully!' });
        } catch (error) {
            console.error('Error in saveLink:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    // 2. Get Analytics Function
    getAnalytics: async (req, res) => {
        try {
            const { theme } = req.params;
            const assessment = await Assessment.findByTheme(theme);
            
            if (!assessment || !assessment.google_form_id) {
                return res.status(404).json({ success: false, message: 'No assessment link found.' });
            }

            const analytics = await googleFormService.getTopWrongQuestions(assessment.google_form_id);
            res.status(200).json({ success: true, data: analytics });
        } catch (error) {
            console.error('Error in getAnalytics:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch report.' });
        }
    }
};

module.exports = assessmentController;