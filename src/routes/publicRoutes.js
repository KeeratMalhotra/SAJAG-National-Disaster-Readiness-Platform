const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/assessment/take/:trainingId', publicController.showPublicAssessmentPage);
router.get('/', publicController.getHomePage);
router.get('/ticker-data', publicController.getTickerData);
module.exports = router;