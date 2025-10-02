// --- IMPORTS ---
// Load environment variables from .env file
require('dotenv').config(); 

// Import Express framework
const express = require('express');
// Import path module for working with file and directory paths
const path = require('path');

// --- APP INITIALIZATION ---
// Create an instance of the Express application
const app = express();

// --- CONFIGURATION ---
// Set the port number from environment variables, with a fallback to 3000
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
// Serve static files (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());

// Enable the Express app to parse URL-encoded request bodies (form data)
app.use(express.urlencoded({ extended: true }));


// --- VIEW ENGINE SETUP ---
// Set the directory where the template files are located
app.set('views', path.join(__dirname, 'src', 'views'));
// Set EJS as the template engine
app.set('view engine', 'ejs');


// --- ROUTES ---
// A simple test route to make sure everything is working
app.get('/', (req, res) => {
    // This will render the home.ejs file from the 'src/views/pages' directory
    res.render('pages/home', {
        pageTitle: 'Welcome to SAKSHAM'
    });
});


// --- SERVER STARTUP ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});