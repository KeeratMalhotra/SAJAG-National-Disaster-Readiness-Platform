const Submission = require('../models/Submission');
const jwt = require('jsonwebtoken');

const participantController = {
    requestLink: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required.' });
            }

            // Check if any submissions exist for this email
            const submissions = await Submission.findByEmail(email);
            if (submissions.length === 0) {
                // We send a generic message for security - don't reveal if an email is in the system
                return res.status(200).json({ message: 'If a record exists for this email, an access link will be generated.' });
            }

            // Create a short-lived token (e.g., 15 minutes)
            const payload = { email: email };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

            // **SIMULATED EMAIL:** For the hackathon, we log the link to the console
            const loginLink = `http://localhost:3000/participant/results?token=${token}`;
            console.log('--- PARTICIPANT LOGIN LINK (SIMULATED EMAIL) ---');
            console.log(loginLink);
            console.log('---------------------------------------------');

            res.status(200).json({ message: 'If a record exists for this email, an access link will be generated.' });

        } catch (error) {
            console.error('Error requesting participant link:', error);
            res.status(500).json({ message: 'Server error.' });
        }
    },
    showResultsPage: async (req, res) => {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).send('Access token is missing.');
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { email } = decoded;

            // Fetch all submissions for that email
            const submissions = await Submission.findByEmail(email);

            res.render('pages/participant_results', {
                pageTitle: 'My Assessment Results',
                email: email,
                submissions: submissions
            });

        } catch (error) {
            // This will catch expired or invalid tokens
            console.error('Error verifying participant token:', error);
            return res.status(401).send('Invalid or expired access link. Please request a new one.');
        }
    }
    
};

module.exports = participantController;