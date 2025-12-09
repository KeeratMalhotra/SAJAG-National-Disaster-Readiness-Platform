const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

// --- NEW SECURE ROUTES ---

// 1. Start Assessment (The Page you land on after scanning QR)
// URL: /assessment/start/:trainingId
router.get('/start/:trainingId', assessmentController.startAssessment);

// 2. Submit Assessment (The invisible handler when you click "Submit")
// URL: /assessment/submit
router.post('/submit', assessmentController.submitAssessment);

module.exports = router;