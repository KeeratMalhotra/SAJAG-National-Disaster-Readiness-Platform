// const express = require('express');
// const router = express.Router();
// const assessmentController = require('../controllers/assessmentController');
// const { protectRoute } = require('../middleware/authMiddleware');

// // Protect all routes in this file
// router.use(protectRoute);

// router.get('/theme/:theme', assessmentController.getAssessmentByTheme);
// router.post('/submit', assessmentController.submitAssessment);

// module.exports = router;

const express = require('express');
const router = express.Router();

// Imports
const assessmentController = require('../controllers/assessmentController');
const { protectRoute } = require('../middleware/authMiddleware'); 

// --- CRITICAL DEBUGGING CHECK ---
if (!assessmentController.saveLink) {
    console.error(" FATAL ERROR: assessmentController.saveLink is UNDEFINED. Check src/controllers/assessmentController.js");
}
if (!assessmentController.getAnalytics) {
    console.error(" FATAL ERROR: assessmentController.getAnalytics is UNDEFINED.");
}
if (!protectRoute) {
    console.error(" FATAL ERROR: protectRoute is UNDEFINED. Check src/middleware/authMiddleware.js");
}
// --------------------------------

// Routes define karne se pehle ensure karein ki functions exist karte hain
router.post('/save-link', protectRoute, assessmentController.saveLink);
router.get('/analytics/:theme', protectRoute, assessmentController.getAnalytics);

module.exports = router;