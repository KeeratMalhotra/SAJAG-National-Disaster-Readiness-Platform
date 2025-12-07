const express = require('express');
const router = express.Router();
const trainingApiController = require('../controllers/trainingApiController');
const { protectRoute } = require('../middleware/authMiddleware');
const multer = require('multer');

// --- CHANGED: Use Memory Storage instead of Disk Storage ---
// This keeps the file in memory (RAM) so we can insert it into the DB
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB to prevent crashing DB
});

router.use(protectRoute);

router.get('/', trainingApiController.getTrainings);
router.post('/', trainingApiController.createTraining);
router.get('/:id/photos', trainingApiController.getPhotosForTraining);

// --- CHANGED: Route for serving the raw image from DB ---
// We need a new route to "view" the image, e.g., <img src="/api/trainings/photos/123">
router.get('/photos/:photoId', trainingApiController.servePhoto);

// Upload route remains similar, but uses the memory uploader
router.post('/:id/photos', upload.single('trainingPhoto'), trainingApiController.uploadPhoto);

router.delete('/:id', trainingApiController.deleteTraining);

module.exports = router;