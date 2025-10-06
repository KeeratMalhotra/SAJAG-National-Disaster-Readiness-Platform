// --- IMPORTS ---
require('dotenv').config(); 
const express = require('express');
const path = require('path');
const pool = require('./src/config/database');
const cookieParser = require('cookie-parser'); 
const { checkUser } = require('./src/middleware/checkUserMiddleware'); 

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
app.use(checkUser);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const assessmentApiRoutes = require('./src/routes/assessmentRoutes'); 
const assessmentPageRoutes = require('./src/routes/assessmentPageRoutes'); 
const publicRoutes = require('./src/routes/publicRoutes');
const predictionRoutes = require('./src/routes/predictionRoutes');
const adminApiRoutes = require('./src/routes/adminRoutes'); 
const adminPageRoutes = require('./src/routes/adminPageRoutes'); 
const announcementPageRoutes = require('./src/routes/announcementPageRoutes');
const participantApiRoutes = require('./src/routes/participantRoutes'); 
const participantPageRoutes = require('./src/routes/participantPageRoutes'); 
const importRoutes = require('./src/routes/importRoutes'); // Add this


app.use('/api/import', importRoutes);
app.use('/participant', participantPageRoutes);
app.use('/api/participant', participantApiRoutes);
app.use('/announcements', announcementPageRoutes);
app.use('/public', publicRoutes); 
app.use('/api/auth', authRoutes);

app.use('/dashboard', dashboardRoutes);
app.use('/trainings', trainingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/assessments', assessmentApiRoutes); 
app.use('/assessments', assessmentPageRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminApiRoutes); 
app.use('/admin', adminPageRoutes); 
app.get('/public-map', (req, res) => {
    res.render('pages/public_map');
});


// A simple test route to make sure everything is working
app.get('/', (req, res) => {
    res.render('pages/home', {
        pageTitle: 'Welcome to SAJAG'
    });
});
app.get('/learn', (req, res) => {
    res.render('pages/learn', { pageTitle: 'Learn & Prepare' });
});
// --- SERVER STARTUP ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});