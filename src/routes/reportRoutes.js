const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const checkUserMiddleware = require('../middleware/checkUserMiddleware');

// Extract the function specifically
const checkUser = checkUserMiddleware.checkUser;

// Routes
router.get('/analysis/:trainingId', checkUser, reportController.getTrainingAnalysis);
router.get('/ndma', checkUser, reportController.generateNdmaReport);
router.get('/sdma', checkUser, reportController.generateSdmaReport);

module.exports = router;