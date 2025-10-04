const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { protectRoute } = require('../middleware/authMiddleware');

router.use(protectRoute);

// GET /api/predictions/gaps
router.get('/gaps', predictionController.getGaps);

module.exports = router;