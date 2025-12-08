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
const assessmentController = require('../controllers/assessmentController');
const { protectRoute } = require('../middleware/authMiddleware'); 

// --- DEBUGGING LOGS (Ye hume batayenge ki kya missing hai) ---
console.log('--- DEBUG START ---');
console.log('1. protectRoute type:', typeof protectRoute); 
console.log('2. assessmentController type:', typeof assessmentController);
if (assessmentController) {
    console.log('3. assessmentController.saveLink type:', typeof assessmentController.saveLink);
    console.log('4. assessmentController.getAnalytics type:', typeof assessmentController.getAnalytics);
}
console.log('--- DEBUG END ---');
// -------------------------------------------------------------

// Agar upar wale logs mein koi 'undefined' aaya, toh server yahan crash karega
router.post('/save-link', protectRoute, assessmentController.saveLink);
router.get('/analytics/:theme', protectRoute, assessmentController.getAnalytics);

module.exports = router;