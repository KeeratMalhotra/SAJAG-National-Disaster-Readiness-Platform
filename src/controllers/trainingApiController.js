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
            const { id } = req.params; // Training ID
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            // INSERT raw buffer (file.buffer) into the BYTEA column
            const query = `
                INSERT INTO training_photos (training_id, image_data, mime_type, image_url)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `;
            
            // We save the original name in 'image_url' just for reference
            await pool.query(query, [id, file.buffer, file.mimetype, file.originalname]);

            res.status(201).json({ message: 'Photo uploaded successfully' });
        } catch (error) {
            console.error('Error uploading photo:', error);
            res.status(500).json({ error: 'Server error uploading photo' });
        }
    },

    // 2. GET PHOTOS LIST (Modified)
    // Returns a list of URLs that point to our new "servePhoto" route
    getPhotosForTraining: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'SELECT id FROM training_photos WHERE training_id = $1',
                [id]
            );

            // Generate URLs that the frontend can put in <img src="...">
            // Example: /api/trainings/photos/uuid-of-photo
            const photos = result.rows.map(row => ({
                id: row.id,
                url: `/api/trainings/photos/${row.id}` 
            }));

            res.json(photos);
        } catch (error) {
            console.error('Error fetching photos:', error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // 3. NEW: SERVE PHOTO (The "Viewer")
    // This looks up the binary data and sends it back as an image
    servePhoto: async (req, res) => {
        try {
            const { photoId } = req.params;
            const result = await pool.query(
                'SELECT image_data, mime_type FROM training_photos WHERE id = $1',
                [photoId]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('Photo not found');
            }

            const photo = result.rows[0];

            // Tell the browser "This is an image"
            res.setHeader('Content-Type', photo.mime_type);
            res.send(photo.image_data); // Send the raw buffer
        } catch (error) {
            console.error('Error serving photo:', error);
            res.status(500).send('Error serving photo');
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