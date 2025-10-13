const Training = require('../models/Training'); // Import the Training model at the top
const Submission = require('../models/Submission');
const predictionService = require('../services/predictionService');
const Announcement = require('../models/Announcement');
const User = require('../models/User'); // ADD THIS LINE

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

    res.render('pages/tp_dashboard', {
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
                const stateTrainings = await Training.findAllByState(adminState);

                res.render('pages/sdma_dashboard', {
                    pageTitle: `SDMA Dashboard - ${adminState}`,
                    user: req.user,
                    trainings: stateTrainings,
                    state: adminState,
                    announcements: announcements, // Pass the state name to the view
                    activePage: 'dashboard',
                    unreadCount: unreadCount ,// Add this line
                    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN
                });
            } else if (role === 'ndma_admin'|| role === 'auditor') {
                 const allTrainings = await Training.findAll();
                // --- ADD THESE TWO LINES ---
                const averageScore = await Submission.getNationalAverageScore();
                const trainingGaps = await predictionService.calculateGaps();
                const totalTrainings = allTrainings.length;
                const uniquePartners = [...new Set(allTrainings.map(t => t.creator_user_id))].length;
                const scoresByTheme = await Submission.getAverageScoresByTheme();

                res.render('pages/ndma_dashboard', {
                    pageTitle: 'National Dashboard',
                    user: req.user,
                    totalTrainings: totalTrainings,
                    uniquePartners: uniquePartners,
                    averageScore: parseFloat(averageScore).toFixed(2),
                    gaps: trainingGaps,
                    scoresByTheme: scoresByTheme,
                    announcements: announcements,
                    activePage: 'dashboard',
                    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
                    unreadCount: unreadCount // Add this line
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