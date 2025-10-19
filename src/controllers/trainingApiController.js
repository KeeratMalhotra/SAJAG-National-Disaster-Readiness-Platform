const Training = require('../models/Training');
const Photo = require('../models/Photo');
const Submission = require('../models/Submission'); // <-- ADDED for deleting

const trainingController = {
    
    // --- THIS IS THE MISSING FUNCTION THAT CAUSED THE CRASH ---
    getTrainings: async (req, res) => {
        try {
            // Fetches all trainings. This is needed by your API.
            const trainings = await Training.findAll(); 
            res.status(200).json(trainings);
        } catch (error) {
            console.error('Error fetching all trainings:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    // --- END OF MISSING FUNCTION ---


    createTraining: async (req, res) => {
        try {
            const { title, theme, startDate, endDate, location, latitude, longitude } = req.body;
            const userId = req.user.id;

            if (new Date(endDate) < new Date(startDate)) {
                return res.status(400).json({ message: 'End date cannot be before the start date.' });
            }

            const trainingData = { title, theme, startDate, endDate, location, latitude, longitude };
            const newTraining = await Training.create(trainingData, userId);

            res.status(201).json({ 
                message: 'Training created successfully!', 
                training: newTraining 
            });

        } catch (error) {
            console.error('Error in createTraining (API):', error);
            res.status(500).json({ message: 'Server error while creating training.' });
        }
    },

    getPhotosForTraining: async (req, res) => {
        try {
            const { id } = req.params;
            const photos = await Photo.findByTrainingId(id);
            res.status(200).json(photos);
        } catch (error) {
            console.error('Error getting photos:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    uploadPhoto: async (req, res) => {
        try {
            const { id } = req.params;
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded.' });
            }
            
            const imageUrl = `/uploads/${req.file.filename}`;
            const newPhoto = await Photo.create(id, imageUrl);
            
            res.status(201).json({ 
                message: 'Photo uploaded successfully!', 
                photo: newPhoto 
            });
        } catch (error) {
            console.error('Error uploading photo (API):', error);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // --- THIS IS THE DELETE FUNCTION YOU NEEDED ---
    deleteTraining: async (req, res) => {
        const { id } = req.params;

        try {
            // 1. Check for the training and user permissions
            const training = await Training.findById(id);
            if (!training) {
                return res.status(404).json({ message: 'Training not found.' });
            }

            const user = req.user;
            // Check if user is an admin OR the original creator
            if (user.role !== 'ndma_admin' && user.role !== 'sdma_admin' && training.creator_user_id !== user.id) {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this training.' });
            }

            // 2. Delete dependencies FIRST
            await Submission.deleteByTrainingId(id);
            await Photo.deleteByTrainingId(id);
            
            // 3. Now, safely delete the training
            await Training.deleteById(id);

            res.status(200).json({ message: 'Training and all associated data deleted successfully.' });

        } catch (error) {
            console.error('Error deleting training:', error);
            res.status(500).json({ message: 'Server error while deleting training.' });
        }
    }
    // --- END OF DELETE FUNCTION ---
};

module.exports = trainingController;