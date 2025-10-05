const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');

// Configure multer for PDF uploads ONLY
const docUpload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only PDF documents are allowed!'), false); // Reject all other file types
        }
    }
});

// Page Routes
router.get('/login', authController.showLoginPage);
router.get('/register', authController.showRegisterPage);
router.get('/logout', authController.logoutUser);

// API Routes
// Apply the upload middleware to the register route
router.post('/register', docUpload.single('registrationDocument'), authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;