// const express = require('express');
// const router = express.Router();
// const assessmentController = require('../controllers/assessmentController');
// const { protectRoute } = require('../middleware/authMiddleware');

// // Protect all routes in this file
// router.use(protectRoute);

// // GET /assessments/take/:trainingId
// router.get('/take/:trainingId', assessmentController.showAssessmentPage);

// module.exports = router;


const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment'); // Model import karein

// --- PUBLIC ROUTE: Redirect to Google Form ---
// Example: /assessments/take/Floods -> Redirects to Google Form URL
router.get('/take/:theme', async (req, res) => {
    try {
        const { theme } = req.params;
        
        // Database se link dhundo
        const assessment = await Assessment.findByTheme(theme);

        if (assessment && assessment.google_form_link) {
            // Agar link mil gaya, to Google Form par bhej do
            console.log(`Redirecting to Google Form for theme: ${theme}`);
            return res.redirect(assessment.google_form_link);
        } else {
            return res.status(404).send(`
                <h1>Assessment Not Found</h1>
                <p>No Google Form link has been set for <strong>${theme}</strong> yet.</p>
                <p>Please contact NDMA Admin.</p>
            `);
        }
    } catch (error) {
        console.error('Error redirecting to assessment:', error);
        res.status(500).send('Server Error');
    }
});

// --- Redirect root to dashboard (Safety fallback) ---
router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;