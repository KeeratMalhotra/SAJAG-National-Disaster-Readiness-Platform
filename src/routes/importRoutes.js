const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protectRoute } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const importController = require('../controllers/importController');

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporarily store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'), false);
        }
    }
});

router.post(
    '/trainings', // Corrected route
    protectRoute,
    requireRole(['sdma_admin', 'ndma_admin']),
    upload.single('trainingsCsv'),
    importController.bulkImportTrainings
);

// for email

// ... (Existing Training Import Route - UNCHANGED)
router.post(
    '/trainings',
    protectRoute,
    requireRole(['sdma_admin', 'ndma_admin']),
    upload.single('trainingsCsv'),
    importController.bulkImportTrainings
);

// --- NEW ROUTE: NGO Invitation Import (For NDMA Admin Only) ---
router.post(
    '/ngo-invitations', // Naya API Endpoint: /api/import/ngo-invitations
    protectRoute,
    requireRole(['ndma_admin']), // Access sirf NDMA Admin ko
    upload.single('ngoCsv'), // Frontend form mein is input ka naam 'ngoCsv' hona chahiye
    importController.bulkInviteNGOs // Naya controller function
);

module.exports = router;