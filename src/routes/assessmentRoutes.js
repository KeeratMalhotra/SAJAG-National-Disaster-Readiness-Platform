const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

router.get('/start/:trainingId', assessmentController.startAssessment);
router.post('/submit', assessmentController.submitAssessment);

// CHANGED: Removed "/:submissionId" to allow query parameters like /certificate?name=...
router.get('/certificate', assessmentController.downloadCertificate);

module.exports = router;