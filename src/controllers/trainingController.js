const Training = require('../models/Training');

const trainingController = {
    showNewTrainingForm: (req, res) => {
        res.render('pages/new_training', {
            pageTitle: 'Create New Training'
        });
    },

    // Add this new function to handle the form submission
    createTraining: async (req, res) => {
        try {
            const trainingData = req.body;
            const userId = req.user.id; // We get this from our 'protectRoute' middleware

            const newTraining = await Training.create(trainingData, userId);

            // For now, we'll send a JSON response. Later we can redirect.
            res.status(201).json({ 
                message: 'Training created successfully!', 
                training: newTraining 
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error while creating training.' });
        }
    },
    getTrainingsAsGeoJSON: async (req, res) => {
        try {
            const geojsonData = await Training.findAllGeoJSON();
            res.status(200).json(geojsonData);
        } catch (error) {
            res.status(500).json({ message: 'Server error while fetching GeoJSON data.' });
        }
    }
};

module.exports = trainingController;