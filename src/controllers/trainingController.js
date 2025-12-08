const Training = require('../models/Training');
const Submission = require('../models/Submission');
const Photo = require('../models/Photo');

const trainingController = {
    showNewTrainingForm: (req, res) => {
        res.render('pages/new_training', {
            pageTitle: 'Create New Training'
        });
    },

    // --- THIS IS THE NEW, ROBUST createTraining FUNCTION ---
    createTraining: async (req, res) => {
        try {
            // 1. Explicitly pull every field from the request body
            const { title, theme, startDate, endDate, location, latitude, longitude } = req.body;
            const userId = req.user.id;

            // 2. Perform validation
            if (new Date(endDate) < new Date(startDate)) {
                return res.status(400).json({ message: 'End date cannot be before the start date.' });
            }

            // 3. Construct the perfect data object to send to the model
            const trainingData = {
                title,
                theme,
                startDate,
                endDate,
                location,
                latitude,
                longitude
            };

            // 4. Call the create function
            const newTraining = await Training.create(trainingData, userId);

            res.status(201).json({ 
                message: 'Training created successfully!', 
                training: newTraining 
            });

        } catch (error) {
            console.error('Error creating training:', error);
            res.status(500).json({ message: 'Server error while creating training.' });
        }
    },

    showTrainingDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const training = await Training.findById(id);
            if (!training) {
                return res.status(404).send('Training not found');
            }

            const submissions = await Submission.findByTrainingId(id);
            const photos = await Photo.findByTrainingId(id); 

            let averageScore = 0;
            if (submissions.length > 0) {
                const totalScore = submissions.reduce((sum, sub) => sum + parseFloat(sub.score), 0);
                averageScore = totalScore / submissions.length;
            }

            res.render('pages/training_details', {
                pageTitle: training.title,
                user: req.user,
                training: training,
                submissions: submissions,
                averageScore: parseFloat(averageScore) || 0, // Ensure it's a number
                photos: photos
            });
        } catch (error) {
            console.error('Error in showTrainingDetails:', error);
            res.status(500).send('Server Error');
        }
    },
    
    uploadPhoto: async (req, res) => {
        try {
            const { id } = req.params;
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            }
            const imageUrl = `/uploads/${req.file.filename}`;
            await Photo.create(id, imageUrl);
            res.redirect(`/trainings/${id}`);
        } catch (error) {
            console.error('Error uploading photo:', error);
            res.status(500).send('Server Error');
        }
    },

    getTrainingsAsGeoJSON: async (req, res) => {
        try {
            const geojsonData = await Training.findAllGeoJSON();
            console.log('--- trainingController.getTrainingsAsGeoJSON ---');
        console.log(`Sending ${geojsonData.features.length} features.`);
        // Log the IDs of the first few features to check for duplicates
        console.log('Feature IDs:', geojsonData.features.slice(0, 10).map(f => f.properties.id)); 
        console.log('--------------------------------------------');
            res.status(200).json(geojsonData);
        } catch (error) {
            res.status(500).json({ message: 'Server error while fetching GeoJSON data.' });
        }
    },

    getTrainingsAsGeoJSONByState: async (req, res) => {
        try {
            const adminState = req.user.state;
            const geojsonData = await Training.findAllGeoJSONByState(adminState);
            console.log('--- trainingController.getTrainingsAsGeoJSONByState ---');
        console.log(`State: ${adminState}, Sending ${geojsonData.features.length} features.`);
        // Log the IDs of the first few features
        console.log('Feature IDs:', geojsonData.features.slice(0, 10).map(f => f.properties.id));
        console.log('----------------------------------------------------');
            res.status(200).json(geojsonData);
        } catch (error) {
            res.status(500).json({ message: 'Server error while fetching state GeoJSON data.' });
        }
    }
};

module.exports = trainingController;
