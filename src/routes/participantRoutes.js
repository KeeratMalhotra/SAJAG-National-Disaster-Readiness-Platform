const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// POST /api/participant/request-link
router.post('/request-link', participantController.requestLink);

module.exports = router;