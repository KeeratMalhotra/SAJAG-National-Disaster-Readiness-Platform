const express = require('express');
const router = express.Router();
const trainingApiController = require('../controllers/trainingApiController');
const { protectRoute } = require('../middleware/authMiddleware');

router.use(protectRoute);

// DELETE /api/trainings/:id
router.delete('/:id', trainingApiController.deleteTraining);

module.exports = router;