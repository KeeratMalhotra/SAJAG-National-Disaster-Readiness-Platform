const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { protectRoute } = require('../middleware/authMiddleware');

router.use(protectRoute);

// GET /trainings/new - Display the form
router.get('/new', trainingController.showNewTrainingForm);

// Add this new POST route to handle the form data
// POST /trainings
router.post('/', trainingController.createTraining);
router.get('/geojson', trainingController.getTrainingsAsGeoJSON);
router.get('/geojson/state', trainingController.getTrainingsAsGeoJSONByState);

    
module.exports = router;