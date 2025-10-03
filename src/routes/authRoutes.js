const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Add this new GET route to display the login page
router.get('/login', authController.showLoginPage);

// This route handles the login form submission
router.post('/login', authController.loginUser);

// This route displays the registration page
router.get('/register', authController.showRegisterPage);

// This route handles the registration form submission
router.post('/register', authController.registerUser);

router.get('/logout', authController.logoutUser);

module.exports = router;