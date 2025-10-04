const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protectRoute } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protectRoute);

router.get('/theme/:theme', assessmentController.getAssessmentByTheme);
router.post('/submit', assessmentController.submitAssessment);

module.exports = router;