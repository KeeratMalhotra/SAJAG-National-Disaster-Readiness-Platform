const Training = require('../models/Training'); // Import the Training model at the top
const Submission = require('../models/Submission');
const predictionService = require('../services/predictionService');
const Announcement = require('../models/Announcement');
const User = require('../models/User'); // ADD THIS LINE
const pool = require('../config/database');

const dashboardController = {
    showDashboard: async (req, res) => { // Make the function async
        
        try {
            const { role, id , state} = req.user;
           const [announcements, unreadCount] = await Promise.all([
            Announcement.findForUser({ role, state }),
            Announcement.getUnreadCountForUser(req.user)
        ]);
            

            if (role === 'training_partner') {
    const [
        fullUser, 
        trainings, 
        averageScore, 
        totalAssessed
    ] = await Promise.all([
        User.findById(id), // Fetch the full user profile
        Training.findByUserId(id),
        Submission.getAverageScoreByCreator(id),
        Submission.countByCreator(id)
        
    ]);

    res.render('pages/tp_Dashboard', {
        pageTitle: 'Partner Dashboard',
        user: req.user,
        trainings: trainings,
         user: fullUser,
        announcements: announcements,
        averageScore: parseFloat(averageScore).toFixed(2),
        totalTrainings: trainings.length,
        totalAssessed: totalAssessed,
        unreadCount: unreadCount // Add this line
    });
} else if (role === 'sdma_admin') {
    if (!state) {
        return res.status(403).send('Access denied: SDMA Admin account is not associated with a state.');
    }
    const adminState = req.user.state;
    const [
        stateTrainings,
        activePartnersInState,
        readinessScoreInState,
        flaggedSubmissions
    ] = await Promise.all([
        Training.findAllByState(adminState),
        User.countActiveByState(adminState),
        Submission.getAverageScoreByState(adminState),
        Submission.findFlaggedByState(adminState)
    ]);

    res.render('pages/sdma_dashboard', {
        pageTitle: `SDMA Dashboard - ${adminState}`,
        user: req.user,
        trainings: stateTrainings,
        state: adminState,
        announcements: announcements, // Pass the state name to the view
        activePage: 'dashboard',
        unreadCount: unreadCount, // Add this line
        MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
        activePartners: activePartnersInState,
        readinessScore: parseFloat(readinessScoreInState).toFixed(2),
        flaggedSubmissions: flaggedSubmissions
    });
} else if (role === 'ndma_admin'|| role === 'auditor') {
                
    // Use Promise.all for efficient data fetching
    const [
        allTrainings,
        averageScore,
        trainingGaps,
        scoresByTheme,
        allActivePartners,
        participantsResult 
    ] = await Promise.all([
        Training.findAll(),
        Submission.getNationalAverageScore(),
        predictionService.calculateGaps(),
        Submission.getAverageScoresByTheme(),
        User.findAllActive() ,
        pool.query('SELECT COUNT(DISTINCT "participant_email") FROM participant_submissions')
    ]);
    console.log('--- Gaps Data for NDMA Dashboard ---', trainingGaps);

    const totalTrainings = allTrainings.length;
    const activePartnersCount = allActivePartners.length;
    const totalParticipants = parseInt(participantsResult.rows[0].count);
    res.render('pages/ndma_dashboard', {
        pageTitle: 'National Dashboard',
        user: req.user,
        totalTrainings: totalTrainings,
        totalParticipants: totalParticipants,
        uniquePartners: activePartnersCount, 
        
        averageScore: parseFloat(averageScore).toFixed(2),
        gaps: trainingGaps,
        
        scoresByTheme: scoresByTheme,
        announcements: announcements,
        activePage: 'dashboard',
        MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
        unreadCount: unreadCount
    });
    
} else {
                res.send('Welcome to your dashboard!');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            res.status(500).send('Error loading dashboard');
        }
    }
};

module.exports = dashboardController;