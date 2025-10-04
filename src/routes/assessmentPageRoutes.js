const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protectRoute } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protectRoute);

// GET /assessments/take/:trainingId
router.get('/take/:trainingId', assessmentController.showAssessmentPage);

module.exports = router;