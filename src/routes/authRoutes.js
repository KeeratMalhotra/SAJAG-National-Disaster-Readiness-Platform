const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');


const docUpload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true); 
        } else {
            cb(new Error('Only PDF documents are allowed!'), false); 
        }
    }
});


router.get('/login', authController.showLoginPage);
router.get('/register', authController.showRegisterPage);
router.get('/logout', authController.logoutUser);


router.post('/register', docUpload.single('registrationDocument'), authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;