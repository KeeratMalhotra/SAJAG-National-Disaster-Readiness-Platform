const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protectRoute } = require('../middleware/authMiddleware');


router.get('/', protectRoute, dashboardController.showDashboard);

module.exports = router;