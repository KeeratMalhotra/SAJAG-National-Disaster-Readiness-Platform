const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// GET /participant/lookup - Show the email entry page
router.get('/lookup', (req, res) => {
    res.render('pages/participant_lookup', { pageTitle: 'Find Your Results' });
});

// GET /participant/results - The secure link destination
router.get('/results', participantController.showResultsPage);

module.exports = router;