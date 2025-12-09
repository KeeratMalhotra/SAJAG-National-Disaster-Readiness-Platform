const Training = require('../models/Training');
const Submission = require('../models/Submission');
const Photo = require('../models/Photo');
const QRCode = require('qrcode');
const pool = require('../config/database'); // Added this because your new functions use raw SQL

const trainingController = {

    // --- 1. VIEW: CREATE TRAINING FORM ---
    showNewTrainingForm: (req, res) => {
        res.render('pages/new_training', {
            pageTitle: 'Create New Training'
        });
    },

    // --- 2. API: GET ALL TRAININGS (Fixed Missing Function) ---
    getTrainings: async (req, res) => {
        try {
            const trainings = await Training.findAll();
            res.status(200).json(trainings);
        } catch (error) {
            console.error('Error fetching all trainings:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // --- 3. QR GENERATOR (FIXED FOR MOBILE SCANNING) ---
    getTrainingQR: async (req, res) => {
        try {
            const { id } = req.params;
            const training = await Training.findById(id);

            if (!training) return res.status(404).send('Training not found');

            
            const myIpAddress = '192.168.1.5'; 
            const port = process.env.PORT || 3000;
            
            // We construct the URL using the IP so the phone can reach the laptop
            const assessmentUrl = `http://${myIpAddress}:${port}/assessment/start/${id}`;
           

            // Generate QR Data URL
            const qrCodeImage = await QRCode.toDataURL(assessmentUrl);

            res.render('pages/show_qr', {
                pageTitle: 'Session QR Code',
                qrCodeImage,
                training,
                assessmentUrl 
            });

        } catch (error) {
            console.error('QR Gen Error:', error);
            res.status(500).send('Could not generate QR');
        }
    },

    // --- 4. API: CREATE TRAINING ---
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
            console.error('Error creating training:', error);
            res.status(500).json({ message: 'Server error while creating training.' });
        }
    },

    // --- 5. VIEW: SHOW DETAILS ---
    showTrainingDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const training = await Training.findById(id);
            if (!training) return res.status(404).send('Training not found');

            const submissions = await Submission.findByTrainingId(id);
            
            // Calculate Average Score
            let averageScore = 0;
            if (submissions.length > 0) {
                const totalScore = submissions.reduce((sum, sub) => sum + parseFloat(sub.score), 0);
                averageScore = totalScore / submissions.length;
            }

           
            const photos = []; 

            res.render('pages/training_details', {
                pageTitle: training.title,
                user: req.user,
                training: training,
                submissions: submissions,
                averageScore: parseFloat(averageScore) || 0,
                photos: photos
            });
        } catch (error) {
            console.error('Error in showTrainingDetails:', error);
            res.status(500).send('Server Error');
        }
    },

    // --- 6. PHOTO: UPLOAD (Direct SQL) ---
    uploadPhoto: async (req, res) => {
        try {
            const { id } = req.params; 
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No image file provided' });
            }

            const query = `
                INSERT INTO training_photos (training_id, image_data, mime_type, image_url)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `;
            
            // Using pool here required the import at the top
            await pool.query(query, [id, file.buffer, file.mimetype, file.originalname]);

            res.status(201).json({ message: 'Photo uploaded successfully' });
        } catch (error) {
            console.error('Error uploading photo:', error);
            res.status(500).json({ error: 'Server error uploading photo' });
        }
    },

    // --- 7. PHOTO: GET LIST (Modified to return URLs) ---
    getPhotosForTraining: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'SELECT id FROM training_photos WHERE training_id = $1',
                [id]
            );

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

    // --- 8. PHOTO: SERVE IMAGE (Viewer) ---
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
            res.setHeader('Content-Type', photo.mime_type);
            res.send(photo.image_data);
        } catch (error) {
            console.error('Error serving photo:', error);
            res.status(500).send('Error serving photo');
        }
    },

    // --- 9. API: DELETE TRAINING ---
    deleteTraining: async (req, res) => {
        const { id } = req.params;

        try {
            const training = await Training.findById(id);
            if (!training) {
                return res.status(404).json({ message: 'Training not found.' });
            }

            const user = req.user;
            if (user.role !== 'ndma_admin' && user.role !== 'sdma_admin' && training.creator_user_id !== user.id) {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this training.' });
            }

            // Ensure these methods exist in your models!
            // If they don't, you'll need to add them to Submission.js and Photo.js
            if (Submission.deleteByTrainingId) await Submission.deleteByTrainingId(id);
            if (Photo.deleteByTrainingId) await Photo.deleteByTrainingId(id);
            
            await Training.deleteById(id);

            res.status(200).json({ message: 'Training deleted successfully.' });

        } catch (error) {
            console.error('Error deleting training:', error);
            res.status(500).json({ message: 'Server error while deleting training.' });
        }
    },

    // --- 10. MAPS: GEOJSON HELPERS ---
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
            const adminState = req.user.state;
            const geojsonData = await Training.findAllGeoJSONByState(adminState);
            res.status(200).json(geojsonData);
        } catch (error) {
            res.status(500).json({ message: 'Server error while fetching state GeoJSON data.' });
        }
    }
};

module.exports = trainingController;