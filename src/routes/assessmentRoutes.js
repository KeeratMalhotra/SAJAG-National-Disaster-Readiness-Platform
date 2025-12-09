const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

router.get('/start/:trainingId', assessmentController.startAssessment);


router.post('/submit', assessmentController.submitAssessment);

module.exports = router;