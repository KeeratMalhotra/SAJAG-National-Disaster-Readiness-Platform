const express = require('express');
const reportController = require('../controllers/reportController');

// 1. Import 'isAuthenticated' from authMiddleware
const { isAuthenticated } = require('../middleware/authMiddleware');

// 2. Import 'hasRole' directly from roleMiddleware
// Your file exports the function directly, not as an object property.
const hasRole = require('../middleware/roleMiddleware'); 

const router = express.Router();

// NDMA Report Route (Accessible by ndma_admin)
router.get('/ndma',
    isAuthenticated,
    // 3. Call 'hasRole' (which is a function) with the roles array.
    // This returns the actual middleware function that Express needs.
    hasRole(['ndma_admin']), 
    reportController.generateNdmaReport
);

// SDMA Report Route (Accessible by sdma_admin for their state)
router.get('/sdma',
    isAuthenticated,
    // 3. Call 'hasRole' for the sdma_admin
    hasRole(['sdma_admin']), 
    reportController.generateSdmaReport
);

module.exports = router;