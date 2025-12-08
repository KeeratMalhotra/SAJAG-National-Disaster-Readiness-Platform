const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { protectRoute } = require('../middleware/authMiddleware');
const { checkUser } = require('../middleware/checkUserMiddleware');
const multer = require('multer');
const imageFileFilter = (req, file, cb) => {
    // Check if the file's mimetype starts with 'image/'
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject the file
    }
};
const upload = multer({ dest: 'uploads/', fileFilter: imageFileFilter });

router.use(protectRoute);

router.get('/new', trainingController.showNewTrainingForm);
router.get('/geojson', trainingController.getTrainingsAsGeoJSON);
router.get('/geojson/state', trainingController.getTrainingsAsGeoJSONByState);
router.get('/:id', trainingController.showTrainingDetails);
router.post('/', trainingController.createTraining);    
router.post('/:id/photos', upload.single('trainingPhoto'), trainingController.uploadPhoto);
router.get('/:id/qr', checkUser, trainingController.getTrainingQR);

module.exports = router;