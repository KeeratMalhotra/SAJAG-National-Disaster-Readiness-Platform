const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/assessment/take/:trainingId', publicController.showPublicAssessmentPage);
router.get('/', publicController.getHomePage);
module.exports = router;