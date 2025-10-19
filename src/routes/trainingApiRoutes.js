const express = require('express');
const router = express.Router();
const trainingApiController = require('../controllers/trainingApiController');
const { protectRoute } = require('../middleware/authMiddleware');
const multer = require('multer');

// --- This multer setup was missing from your new file ---
// --- It is required for photo uploads ---
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject the file
    }
};
const upload = multer({ dest: 'uploads/', fileFilter: imageFileFilter });
// --- End of multer setup ---


router.use(protectRoute);

// --- These routes were missing from your new file ---
router.get('/', trainingApiController.getTrainings);
router.post('/', trainingApiController.createTraining);
router.get('/:id/photos', trainingApiController.getPhotosForTraining);
router.post('/:id/photos', upload.single('trainingPhoto'), trainingApiController.uploadPhoto);

// --- This is the delete route you correctly added ---
router.delete('/:id', trainingApiController.deleteTraining);

module.exports = router;