const Training = require('../models/Training');
const Submission = require('../models/Submission');
const Photo = require('../models/Photo');

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
            if (new Date(trainingData.endDate) < new Date(trainingData.startDate)) {
            return res.status(400).json({ message: 'End date cannot be before the start date.' });
        }
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
    },
    getTrainingsAsGeoJSONByState: async (req, res) => {
    try {
        const adminState = req.user.state; // Get state from the logged-in user
        const geojsonData = await Training.findAllGeoJSONByState(adminState);
        res.status(200).json(geojsonData);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching state GeoJSON data.' });
    }
},
showTrainingDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const training = await Training.findById(id);
            if (!training) {
                return res.status(404).send('Training not found');
            }

            // Fetch all submissions for this training
            const submissions = await Submission.findByTrainingId(id);
             const photos = await Photo.findByTrainingId(id); 

            // Calculate average score for this training
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
                averageScore: averageScore.toFixed(2),
                photos: photos
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    },
    uploadPhoto: async (req, res) => {
        try {
            const { id } = req.params;
            // req.file is created by multer and contains info about the uploaded file
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            }

            const imageUrl = `/uploads/${req.file.filename}`;
            await Photo.create(id, imageUrl);

            // Redirect back to the details page
            res.redirect(`/trainings/${id}`);
        } catch (error) {
            console.error('Error uploading photo:', error);
            res.status(500).send('Server Error');
        }
    }
};

module.exports = trainingController;