const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { checkUser } = require('../middleware/checkUserMiddleware');

// --- DEBUGGING LOGS (Check your terminal for these) ---
console.log('--- DEBUGGING REPORT ROUTE ---');
console.log('checkUser is:', typeof checkUser); // Should say 'function'
console.log('reportController is:', reportController); // Should be an object
console.log('getTrainingAnalysis is:', typeof reportController?.getTrainingAnalysis); // Should say 'function'
console.log('------------------------------');

// If either is 'undefined', the app will crash below.

// The Route for the Report Page
router.get('/analysis/:trainingId', checkUser, reportController.getTrainingAnalysis);

module.exports = router;