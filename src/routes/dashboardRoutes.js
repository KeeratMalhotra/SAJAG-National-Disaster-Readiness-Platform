const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protectRoute } = require('../middleware/authMiddleware');

// Any request to '/' on this router will first go through 'protectRoute'
router.get('/', protectRoute, dashboardController.showDashboard);

module.exports = router;