const Training = require('../models/Training'); // Import the Training model at the top

const dashboardController = {
    showDashboard: async (req, res) => { // Make the function async
        try {
            const { role, id } = req.user;

            if (role === 'training_partner') {
                // Fetch the trainings for the logged-in user
                const trainings = await Training.findByUserId(id);

                // Pass the trainings data to the EJS view
                res.render('pages/tp_dashboard', {
                    pageTitle: 'Partner Dashboard',
                    user: req.user,
                    trainings: trainings // Pass the data here
                });
            } else if (role === 'sdma_admin') {
                const allTrainings = await Training.findAll();

                // Render the new SDMA dashboard view
                res.render('pages/sdma_dashboard', {
                    pageTitle: 'SDMA Dashboard',
                    user: req.user,
                    trainings: allTrainings
                });
            } else if (role === 'ndma_admin') {
                const allTrainings = await Training.findAll();

                // Calculate some simple stats
                const totalTrainings = allTrainings.length;
                const uniquePartners = [...new Set(allTrainings.map(t => t.creator_user_id))].length;

                res.render('pages/ndma_dashboard', {
                    pageTitle: 'National Dashboard',
                    user: req.user,
                    totalTrainings: totalTrainings,
                    uniquePartners: uniquePartners,
                    // We will pass the geojson data for the map separately
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