const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const checkUserMiddleware = require('../middleware/checkUserMiddleware');

// Extract the function specifically (Safe Destructuring)
const checkUser = checkUserMiddleware.checkUser;

console.log('--- DEBUGGING REPORT ROUTES ---');
console.log('1. CheckUser Function Type:', typeof checkUser);
console.log('2. ReportController Object:', typeof reportController);
console.log('3. getTrainingAnalysis Function Type:', typeof reportController?.getTrainingAnalysis);

// --- SAFETY CHECK ---
if (typeof checkUser !== 'function') {
    console.error("❌ CRITICAL ERROR: 'checkUser' is missing. Check src/middleware/checkUserMiddleware.js");
} else if (typeof reportController.getTrainingAnalysis !== 'function') {
    console.error("❌ CRITICAL ERROR: 'getTrainingAnalysis' is missing. Check src/controllers/reportController.js");
} else {
    // Only define the route if everything exists
    console.log("✅ All checks passed. Initializing Report Routes.");
    router.get('/analysis/:trainingId', checkUser, reportController.getTrainingAnalysis);
}

console.log('-------------------------------');

module.exports = router;