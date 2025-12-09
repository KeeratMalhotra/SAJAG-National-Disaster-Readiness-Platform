const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');


router.get('/', alertsController.getLiveAlerts);

module.exports = router;