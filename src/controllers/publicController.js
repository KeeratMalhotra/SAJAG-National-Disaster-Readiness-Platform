// // src/controllers/publicController.js

// // Import all necessary models
// const Assessment = require('../models/Assessment');
// const Training = require('../models/Training');
// const User = require('../models/User');
// const Submission = require('../models/Submission'); // Assuming this is your participant model
// const pool = require('../config/database');

// const publicController = {
//     /**
//      * Renders the public-facing homepage with live statistics.
//      */
//     getHomePage: async (req, res) => {
//         try {
//             // --- FIXED QUERIES START HERE ---
//             const allTrainings = await Training.findAll();
//             // 1. Get total trainings count using SQL
//             const trainingsResult = await pool.query('SELECT COUNT(*) FROM trainings');
//             const totalTrainings = parseInt(trainingsResult.rows[0].count);

//             // 2. Get active partners count using SQL
//             const partnersResult = await pool.query("SELECT count(*) from users where role = 'training_partner' and status = 'active'");
//             const activePartners = parseInt(partnersResult.rows[0].count);

//             // 3. Get unique participants count using SQL
//             // Make sure the table and column names ('submissions', '"participantEmail"') are correct for your database
//             const participantsResult = await pool.query('SELECT COUNT(DISTINCT "participant_email") FROM participant_submissions');
//             const totalParticipants = parseInt(participantsResult.rows[0].count);

//             // --- FIXED QUERIES END HERE ---

//             // Render the home page and pass the stats to the EJS template
//             res.render('pages/home', {
//                 MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
//                 totalTrainings: totalTrainings,
//                 totalParticipants: totalParticipants,
//                 activePartners: activePartners,
//             });
//         } catch (error) {
//             console.error('Error fetching homepage stats:', error);
//             // If the database query fails, render the page with 0s to prevent crashing.
//             res.status(500).render('pages/home', {
//                 MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
//                 totalTrainings: 0,
//                 totalParticipants: 0,
//                 activePartners: 0,
//             });
//         }
//     },

//     /**
//      * Renders the assessment page for a specific training.
//      * (Your existing function)
//      */
//     showPublicAssessmentPage: async (req, res) => {
//         try {
//             const { trainingId } = req.params;
//             const training = await Training.findById(trainingId);
//             if (!training) {
//                 return res.status(404).send('Training not found.');
//             }

//             const assessment = await Assessment.findByThemeWithQuestions(training.theme);
//             if (!assessment) {
//                 return res.status(404).send(`No assessment found for the theme: ${training.theme}`);
//             }

//             res.render('pages/public_assessment', {
//                 pageTitle: assessment.title,
//                 assessment: assessment,
//                 trainingId: trainingId
//             });

//         } catch (error) {
//             console.error('Error showing public assessment:', error);
//             res.status(500).send('Server error');
//         }
//     },getTickerData: async (req, res) => {
//         try {
//             const recentTrainings = await Training.findRecentActivity();

//             // Format the data into simple strings
//             const tickerItems = recentTrainings.map(t => {
//                 const status = new Date(t.start_date) > new Date() ? 'starting soon' : 'recently completed';
//                 return `${t.theme} training ${status} in ${t.location_text}`;
//             });

//             res.status(200).json(tickerItems);
//         } catch (error) {
//             res.status(500).json({ message: 'Server error.' });
//         }
//     },
//     getPublicGeoJSON: async (req, res) => {
//         try {
//             const geoJsonData = await Training.findAllGeoJSON();
//             console.log('--- publicController.getPublicGeoJSON ---');
//         console.log(`Sending ${geoJsonData.features.length} features.`);
//          // Log the IDs of the first few features
//         console.log('Feature IDs:', geoJsonData.features.slice(0, 10).map(f => f.properties.id));
//         console.log('-----------------------------------------');
//             res.status(200).json(geoJsonData);
//         } catch (error) {
//             console.error('Error fetching public GeoJSON:', error);
//             res.status(500).json({ message: 'Server error' });
//         }
//     }
//     // You can add other public-facing controller functions here in the future
// };

// module.exports = publicController;

const Training = require('../models/Training');
const Assessment = require('../models/Assessment');

const publicController = {

    // --- Public Map Page ---
    getPublicMap: async (req, res) => {
        try {
            res.render('pages/public_map', { pageTitle: 'Live Disaster Training Map' });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },

    // --- Public Assessment Page (Fix: Redirect to Google Form) ---
    showPublicAssessmentPage: async (req, res) => {
        try {
            const { token } = req.params;

            // 1. Token se Training dhoondo
            // (Note: Agar aapke Training model mein 'findByToken' nahi hai, to hum findOne use karenge)
            // Assuming your schema has a 'link_token' or similar column. 
            // Agar ye fail ho, to mujhe Training model dikhana padega.
            const query = 'SELECT * FROM trainings WHERE link_token = $1';
            // Temporary fix assuming direct DB access or model method exists. 
            // Better: Use existing Model method if available.
            // Let's assume standard find logic:
            
            // AGAR AAPKE CODE MEIN 'findByToken' NAHI HAI, TOH YE GENERIC LOGIC HAI:
            const training = await Training.findByToken ? await Training.findByToken(token) : null;

            if (!training) {
                // Fallback attempt: Agar findByToken nahi mila, shayad logic alag ho.
                // Filhal ke liye hum 404 return karte hain agar token galat hai.
                return res.status(404).render('pages/404', { message: 'Training not found or Link Expired' });
            }

            // 2. Training mil gayi, ab uski Theme (e.g., Floods) se Assessment Link dhoondo
            const theme = training.training_theme || training.theme;
            const assessment = await Assessment.findByTheme(theme);

            // 3. Google Form par Redirect karo
            if (assessment && assessment.google_form_link) {
                return res.redirect(assessment.google_form_link);
            } else {
                return res.status(404).send(`
                    <div style="text-align:center; padding:50px; font-family:sans-serif;">
                        <h1>Assessment Not Linked</h1>
                        <p>No Google Form has been setup for the theme: <strong>${theme}</strong></p>
                        <p>Please ask the NDMA Admin to link a form.</p>
                    </div>
                `);
            }

        } catch (error) {
            console.error('Error in showPublicAssessmentPage:', error);
            res.status(500).send('Server Error');
        }
    }
};

module.exports = publicController;