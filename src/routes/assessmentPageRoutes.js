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
const Assessment = require('../models/Assessment'); 


router.get('/take/:theme', async (req, res) => {
    try {
        const { theme } = req.params;
        
        const assessment = await Assessment.findByTheme(theme);

        if (assessment && assessment.google_form_link) {
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

router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;