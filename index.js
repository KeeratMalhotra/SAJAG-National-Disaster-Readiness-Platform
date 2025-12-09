// // --- IMPORTS ---
// require('dotenv').config(); 
// const express = require('express');
// const path = require('path');
// const fs = require('fs');
// const pool = require('./src/config/database');
// const cookieParser = require('cookie-parser'); 
// const { checkUser } = require('./src/middleware/checkUserMiddleware'); 
// const i18n = require('i18n');

// // --- APP INITIALIZATION ---
// const app = express();

// // --- I18N CONFIGURATION ---
// i18n.configure({
//     locales: ['en', 'hi','bn','ta'],
//     directory: path.join(__dirname, 'locales'),
//     defaultLocale: 'en',
//     cookie: 'lang', 
//     queryParameter: 'lang', 
//     autoReload: true,
//     syncFiles: true,
//     objectNotation: true
// });

// // --- ENSURE UPLOADS/LOCALES DIRECTORY EXISTS ---
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir);
// }
// // Ensure locales directory exists so i18n doesn't crash
// const localesDir = path.join(__dirname, 'locales');
// if (!fs.existsSync(localesDir)) {
//     fs.mkdirSync(localesDir);
//     console.log(`Created directory: ${localesDir}`);
// }

// // --- CONFIGURATION ---
// const PORT = process.env.PORT || 3000;

// // --- MIDDLEWARE ---
// app.use(express.static(path.join(__dirname, 'src', 'public')));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // --- INITIALIZE I18N ---
// app.use(i18n.init);

// // --- LANGUAGE SWITCHING DEBUGGER ---
// app.use((req, res, next) => {
//     // 1. Check if user is requesting a language switch
//     if (req.query.lang) {
//         console.log(`DEBUG: User requested language switch to: ${req.query.lang}`);
        
//         // Force the cookie
//         res.cookie('lang', req.query.lang, { maxAge: 900000, httpOnly: true });
        
//         // Force the locale for this request
//         req.setLocale(req.query.lang);
//     }

//     // 2. Log what the server thinks the current language is
//     console.log(`DEBUG: Current Locale: ${req.getLocale()} | Query: ${req.query.lang || 'none'} | Cookie: ${req.cookies.lang || 'none'}`);
//     next();
// });

// app.use(checkUser);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- VIEW ENGINE SETUP ---
// app.set('views', path.join(__dirname, 'src', 'views'));
// app.set('view engine', 'ejs');

// // --- ROUTES ---
// const authRoutes = require('./src/routes/authRoutes');
// const dashboardRoutes = require('./src/routes/dashboardRoutes');
// const trainingRoutes = require('./src/routes/trainingRoutes');
// const alertRoutes = require('./src/routes/alertRoutes');
// const assessmentApiRoutes = require('./src/routes/assessmentRoutes'); 
// const assessmentPageRoutes = require('./src/routes/assessmentPageRoutes'); 
// const publicRoutes = require('./src/routes/publicRoutes');
// const predictionRoutes = require('./src/routes/predictionRoutes');
// const adminApiRoutes = require('./src/routes/adminRoutes'); 
// const adminPageRoutes = require('./src/routes/adminPageRoutes'); 
// const announcementPageRoutes = require('./src/routes/announcementPageRoutes');
// const participantApiRoutes = require('./src/routes/participantRoutes'); 
// const participantPageRoutes = require('./src/routes/participantPageRoutes'); 
// const importRoutes = require('./src/routes/importRoutes'); 
// const publicApiRoutes = require('./src/routes/publicRoutes'); 
// const trainingApiRoutes = require('./src/routes/trainingApiRoutes'); 
// const reportRoutes = require('./src/routes/reportRoutes');

// app.use('/reports', reportRoutes); 
// app.use('/api/trainings', trainingApiRoutes); 
// app.use('/api/public', publicApiRoutes);
// app.use('/api/import', importRoutes);
// app.use('/participant', participantPageRoutes);
// app.use('/api/participant', participantApiRoutes);
// app.use('/announcements', announcementPageRoutes);
// app.use('/public', publicRoutes); 
// app.use('/api/auth', authRoutes);
// app.use('/dashboard', dashboardRoutes);
// app.use('/trainings', trainingRoutes);
// app.use('/api/alerts', alertRoutes);
// app.use('/api/assessments', assessmentApiRoutes); 
// app.use('/assessments', assessmentPageRoutes);
// app.use('/api/predictions', predictionRoutes);
// app.use('/api/admin', adminApiRoutes); 
// app.use('/admin', adminPageRoutes); 
// app.use('/', publicRoutes);

// app.get('/public-map', (req, res) => {
//     res.render('pages/public_map');
// });

// app.get('/learn', (req, res) => {
//     res.render('pages/learn', { pageTitle: 'Learn & Prepare' , activePage: 'learn'});
// });
// app.get('/learn-public', (req, res) => {
//     res.render('pages/learn-public', { pageTitle: 'Learn & Prepare' , activePage: 'learn'});
// });

// // --- SERVER STARTUP ---
// app.listen(PORT, () => {
//     console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });



require('dotenv').config(); 
const express = require('express');
const path = require('path');
const fs = require('fs');
// const pool = require('./src/config/database'); // DB connection if needed directly
const cookieParser = require('cookie-parser'); 
const { checkUser } = require('./src/middleware/checkUserMiddleware'); 
const i18n = require('i18n');


const app = express();


i18n.configure({
    locales: ['en', 'hi','bn','ta'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    cookie: 'lang', 
    queryParameter: 'lang', 
    autoReload: true,
    syncFiles: true,
    objectNotation: true
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
const localesDir = path.join(__dirname, 'locales');
if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir);
    console.log(`Created directory: ${localesDir}`);
}

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(i18n.init);

app.use((req, res, next) => {
    if (req.query.lang) {
        console.log(`DEBUG: User requested language switch to: ${req.query.lang}`);
        res.cookie('lang', req.query.lang, { maxAge: 900000, httpOnly: true });
        req.setLocale(req.query.lang);
    }
    console.log(`DEBUG: Current Locale: ${req.getLocale()} | Query: ${req.query.lang || 'none'} | Cookie: ${req.cookies.lang || 'none'}`);
    next();
});

app.use(checkUser);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

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
const importRoutes = require('./src/routes/importRoutes'); 
const publicApiRoutes = require('./src/routes/publicRoutes'); 
const trainingApiRoutes = require('./src/routes/trainingApiRoutes'); 
const reportRoutes = require('./src/routes/reportRoutes');

// --- NEW: CHATBOT CONTROLLER IMPORT ---
const chatController = require('./src/controllers/chatController');

// --- ROUTE USE ---
app.use('/reports', reportRoutes); 
app.use('/api/trainings', trainingApiRoutes); 
app.use('/api/public', publicApiRoutes);
app.use('/api/import', importRoutes);
app.use('/participant', participantPageRoutes);
app.use('/api/participant', participantApiRoutes);
app.use('/announcements', announcementPageRoutes);
app.use('/public', publicRoutes); 
app.use('/api/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/trainings', trainingRoutes);
app.use('/api/alerts', alertRoutes);

// --- NEW: CHATBOT ROUTE ---
app.post('/api/chat-public', chatController.handleChat);

// --- UPDATED ROUTE FOR ASSESSMENT ---
app.use('/assessment', assessmentApiRoutes); 

app.use('/assessments', assessmentPageRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminApiRoutes); 
app.use('/admin', adminPageRoutes); 
app.use('/', publicRoutes);

app.get('/public-map', (req, res) => {
    res.render('pages/public_map');
});

app.get('/learn', (req, res) => {
    res.render('pages/learn', { pageTitle: 'Learn & Prepare' , activePage: 'learn'});
});
app.get('/learn-public', (req, res) => {
    res.render('pages/learn-public', { pageTitle: 'Learn & Prepare' , activePage: 'learn'});
});

app.listen(PORT, () => {
    console.log(` Server is running on http://localhost:${PORT}`);
});