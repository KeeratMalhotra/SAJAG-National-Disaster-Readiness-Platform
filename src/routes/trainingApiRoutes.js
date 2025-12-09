const express = require('express');
const router = express.Router();
const trainingApiController = require('../controllers/trainingApiController');
const { protectRoute } = require('../middleware/authMiddleware');
const multer = require('multer');


const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } 
});

router.use(protectRoute);

router.get('/', trainingApiController.getTrainings);
router.post('/', trainingApiController.createTraining);
router.get('/:id/photos', trainingApiController.getPhotosForTraining);


router.get('/photos/:photoId', trainingApiController.servePhoto);


router.post('/:id/photos', upload.single('trainingPhoto'), trainingApiController.uploadPhoto);

router.delete('/:id', trainingApiController.deleteTraining);

module.exports = router;