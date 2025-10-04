// --- IMPORTS ---
require('dotenv').config(); 
const express = require('express');
const path = require('path');
const pool = require('./src/config/database');
const cookieParser = require('cookie-parser'); 


// --- APP INITIALIZATION ---
const app = express();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
// Serve static files (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());

// Enable the Express app to parse URL-encoded request bodies (form data)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// --- VIEW ENGINE SETUP ---
// Set the directory where the template files are located
app.set('views', path.join(__dirname, 'src', 'views'));
// Set EJS as the template engine
app.set('view engine', 'ejs');



// --- ROUTES ---
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const trainingRoutes = require('./src/routes/trainingRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const assessmentApiRoutes = require('./src/routes/assessmentRoutes'); // Renamed for clarity
const assessmentPageRoutes = require('./src/routes/assessmentPageRoutes'); // The new page router

app.use('/api/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/trainings', trainingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/assessments', assessmentApiRoutes); // API routes are at /api/assessments
app.use('/assessments', assessmentPageRoutes); // Page routes are at /assessments

app.get('/public-map', (req, res) => {
    res.render('pages/public_map');
});


// A simple test route to make sure everything is working
app.get('/', (req, res) => {
    // This will render the home.ejs file from the 'src/views/pages' directory
    res.render('pages/home', {
        pageTitle: 'Welcome to SAJAG'
    });
});


// --- SERVER STARTUP ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});