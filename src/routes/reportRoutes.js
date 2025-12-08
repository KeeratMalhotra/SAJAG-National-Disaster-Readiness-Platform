const express = require('express');
const reportController = require('../controllers/reportController');
const { protectRoute: isAuthenticated } = require('../middleware/authMiddleware');
// --- CORRECT IMPORT ---
// Since roleMiddleware.js exports the function directly,
// we import it directly and assign it to the 'hasRole' variable here.
const { requireRole: hasRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// NDMA Report Route
router.get('/ndma',
    isAuthenticated,
    // Use the imported function correctly by calling it with the roles array.
    // This returns the actual middleware Express needs.
    hasRole(['ndma_admin']), //
    reportController.generateNdmaReport
);

// SDMA Report Route
router.get('/sdma',
    isAuthenticated,
    // Use the imported function correctly by calling it with the roles array.
    hasRole(['sdma_admin']), //
    reportController.generateSdmaReport
);

module.exports = router;