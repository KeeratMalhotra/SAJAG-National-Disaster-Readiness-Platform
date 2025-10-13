// src/controllers/publicController.js

// Import all necessary models
const Assessment = require('../models/Assessment');
const Training = require('../models/Training');
const User = require('../models/User');
const Submission = require('../models/Submission'); // Assuming this is your participant model
const pool = require('../config/database');

const publicController = {
    /**
     * Renders the public-facing homepage with live statistics.
     */
    getHomePage: async (req, res) => {
        try {
            // --- FIXED QUERIES START HERE ---

            // 1. Get total trainings count using SQL
            const trainingsResult = await pool.query('SELECT COUNT(*) FROM trainings');
            const totalTrainings = parseInt(trainingsResult.rows[0].count);

            // 2. Get active partners count using SQL
            const partnersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'training_partner' AND status = 'active'");
            const activePartners = parseInt(partnersResult.rows[0].count);

            // 3. Get unique participants count using SQL
            // Make sure the table and column names ('submissions', '"participantEmail"') are correct for your database
            const participantsResult = await pool.query('SELECT COUNT(DISTINCT "participant_email") FROM participant_submissions');
            const totalParticipants = parseInt(participantsResult.rows[0].count);

            // --- FIXED QUERIES END HERE ---

            // Render the home page and pass the stats to the EJS template
            res.render('pages/home', {
                MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                totalTrainings: totalTrainings,
                totalParticipants: totalParticipants,
                activePartners: activePartners,
            });
        } catch (error) {
            console.error('Error fetching homepage stats:', error);
            // If the database query fails, render the page with 0s to prevent crashing.
            res.status(500).render('pages/home', {
                MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                totalTrainings: 0,
                totalParticipants: 0,
                activePartners: 0,
            });
        }
    },

    /**
     * Renders the assessment page for a specific training.
     * (Your existing function)
     */
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
    }
    // You can add other public-facing controller functions here in the future
};

module.exports = publicController;