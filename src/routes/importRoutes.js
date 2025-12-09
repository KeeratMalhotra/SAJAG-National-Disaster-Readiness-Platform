const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protectRoute } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const importController = require('../controllers/importController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
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
    '/trainings', 
    protectRoute,
    requireRole(['sdma_admin', 'ndma_admin']),
    upload.single('trainingsCsv'),
    importController.bulkImportTrainings
);

module.exports = router;