const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

// This route does not need to be protected, as it's for a public map
// GET /api/alerts
router.get('/', alertsController.getLiveAlerts);

module.exports = router;