// src/controllers/publicController.js

// Import all necessary models
const Assessment = require('../models/Assessment');
const Training = require('../models/Training');
const User = require('../models/User');
const Submission = require('../models/Submission'); // Assuming this is your participant model
const pool = require('../config/database');

const publicController = {
    
    getHomePage: async (req, res) => {
        try {
            const allTrainings = await Training.findAll();
            const trainingsResult = await pool.query('SELECT COUNT(*) FROM trainings');
            const totalTrainings = parseInt(trainingsResult.rows[0].count);

            const partnersResult = await pool.query("SELECT count(*) from users where role = 'training_partner' and status = 'active'");
            const activePartners = parseInt(partnersResult.rows[0].count);

            const participantsResult = await pool.query('SELECT COUNT(DISTINCT "participant_email") FROM participant_submissions');
            const totalParticipants = parseInt(participantsResult.rows[0].count);
            const publicTrainings = await Training.findUpcomingAndActive();
            const activeTrainings = publicTrainings.filter(t => t.status === 'Active');
            const upcomingTrainings = publicTrainings.filter(t => t.status === 'Upcoming');


            res.render('pages/home', {
                MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                totalTrainings: totalTrainings,
                totalParticipants: totalParticipants,
                activePartners: activePartners,
                activeTrainings: activeTrainings,
                upcomingTrainings: upcomingTrainings
            });
        } catch (error) {
            console.error('Error fetching homepage stats:', error);
            res.status(500).render('pages/home', {
                MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                totalTrainings: 0,
                totalParticipants: 0,
                activePartners: 0,
                activeTrainings: [],
                upcomingTrainings: []
            });
        }
    },

 
    showPublicAssessmentPage: async (req, res) => {
        try {
            const { trainingId } = req.params;
            const training = await Training.findById(trainingId);
            if (!training) {
                return res.status(404).send('Training not found.');
            }

            const assessment = await Assessment.findByThemeWithQuestions(training.theme);
            if (!assessment) {
                return res.status(404).send(`No assessment found for the theme: ${training.theme}`);
            }

            res.render('pages/public_assessment', {
                pageTitle: assessment.title,
                assessment: assessment,
                trainingId: trainingId
            });

        } catch (error) {
            console.error('Error showing public assessment:', error);
            res.status(500).send('Server error');
        }
    },getTickerData: async (req, res) => {
        try {
            const recentTrainings = await Training.findRecentActivity();

            // Format the data into simple strings
            const tickerItems = recentTrainings.map(t => {
                const status = new Date(t.start_date) > new Date() ? 'starting soon' : 'recently completed';
                return `${t.theme} training ${status} in ${t.location_text}`;
            });

            res.status(200).json(tickerItems);
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },
    getPublicGeoJSON: async (req, res) => {
        try {
            const geoJsonData = await Training.findAllGeoJSON();
            console.log('--- publicController.getPublicGeoJSON ---');
        console.log(`Sending ${geoJsonData.features.length} features.`);
         // Log the IDs of the first few features
        console.log('Feature IDs:', geoJsonData.features.slice(0, 10).map(f => f.properties.id));
        console.log('-----------------------------------------');
            res.status(200).json(geoJsonData);
        } catch (error) {
            console.error('Error fetching public GeoJSON:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // You can add other public-facing controller functions here in the future
};

module.exports = publicController;