const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// POST /api/participant/request-link
router.post('/request-link', participantController.requestLink);
router.post('/get-results', participantController.getResultsByEmail);
module.exports = router;