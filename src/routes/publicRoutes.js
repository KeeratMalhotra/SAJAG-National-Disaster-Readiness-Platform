const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/assessment/take/:trainingId', publicController.showPublicAssessmentPage);

module.exports = router;