const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const { protectRoute } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const multer = require('multer');

// Configure multer for CSV files only
const csvUpload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'), false);
        }
    }
});

router.use(protectRoute);
router.use(requireRole(['sdma_admin', 'ndma_admin']));

// POST /api/import/trainings
router.post('/trainings', csvUpload.single('trainingsCsv'), importController.importTrainings);

module.exports = router;