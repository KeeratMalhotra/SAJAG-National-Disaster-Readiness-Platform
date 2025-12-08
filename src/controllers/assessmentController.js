const Assessment = require('../models/Assessment');
const Training = require('../models/Training');
const Submission = require('../models/Submission');
const pool = require('../config/database'); // We need direct DB access for the transaction

// Helper: Calculate Distance
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lat2) return 9999; // If GPS missing, assume far away
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // Return meters
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}

const assessmentController = {

    // 1. THE START PAGE (Secure Entry)
    // This replaces the Google Form link. It checks if the training is valid.
    startAssessment: async (req, res) => {
        try {
            const { trainingId } = req.params;
            const training = await Training.findById(trainingId);

            if (!training) return res.status(404).send('Training Event Not Found');

            // SECURITY: Time Lock
            const now = new Date();
            const endBuffer = new Date(new Date(training.end_date).getTime() + 2 * 60 * 60 * 1000); // +2 Hours
            
            if (now < new Date(training.start_date)) {
                return res.render('pages/error', { message: 'This training has not started yet.' });
            }
            if (now > endBuffer) {
                return res.render('pages/error', { message: 'This training event has ended. Submissions are closed.' });
            }

            // Fetch generic assessment based on Theme (e.g., "Flood")
            // You need to implement 'findByTheme' in Assessment model to get Questions + Options + Images
            const assessment = await Assessment.findByThemeWithQuestions(training.theme);

            res.render('pages/take_assessment', {
                training,
                assessment,
                pageTitle: `${training.theme} Assessment`
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('System Error');
        }
    },

    // 2. THE SUBMISSION (The Trust Shield)
    submitAssessment: async (req, res) => {
        const client = await pool.connect(); // Start Transaction
        try {
            await client.query('BEGIN');

            const { trainingId, participantName, answers, userLat, userLng } = req.body;
            // answers is object: { "question_id_1": "option_id_A", ... }

            // A. FETCH TRUTH
            const training = await Training.findById(trainingId);
            
            // B. FRAUD CHECKS
            let fraudScore = 0;
            let riskFlag = 'SAFE';

            // Check 1: Geo-Fence
            const distance = getDistanceFromLatLonInKm(userLat, userLng, training.latitude, training.longitude);
            if (distance > 200) {
                fraudScore += 50;
                riskFlag = 'LOCATION_MISMATCH';
            }

            // Check 2: Speed (Time since page load? - Advanced, skipping for now)

            // C. CALCULATE SCORE & DETAIL
            let correctCount = 0;
            const questionIds = Object.keys(answers);
            
            // Insert the Main Submission
            const submissionResult = await client.query(`
                INSERT INTO participant_submissions 
                (training_id, participant_email, score, gps_lat, gps_lng, fraud_score, risk_flag, device_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [trainingId, participantName, 0, userLat, userLng, fraudScore, riskFlag, req.ip]);
            
            const submissionId = submissionResult.rows[0].id;

            // D. SAVE DETAILS (For "Lackness Report")
            for (const qId of questionIds) {
                const selectedOptionId = answers[qId];
                
                // Verify correctness (This logic assumes you have a way to check. 
                // For efficiency, we usually cache correct answers or fetch them.)
                const optionCheck = await client.query('SELECT is_correct FROM options WHERE id = $1', [selectedOptionId]);
                const isCorrect = optionCheck.rows[0]?.is_correct || false;

                if (isCorrect) correctCount++;

                // Save the detailed answer
                await client.query(`
                    INSERT INTO submission_answers (submission_id, question_id, selected_option_id, is_correct)
                    VALUES ($1, $2, $3, $4)
                `, [submissionId, qId, selectedOptionId, isCorrect]);
            }

            // E. UPDATE FINAL SCORE
            const finalScore = (correctCount / questionIds.length) * 100;
            await client.query('UPDATE participant_submissions SET score = $1 WHERE id = $2', [finalScore, submissionId]);

            await client.query('COMMIT');

            res.json({ 
                success: true, 
                score: finalScore, 
                risk: riskFlag,
                message: fraudScore > 50 ? "Submitted with Warnings" : "Success"
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Submission Error:', error);
            res.status(500).json({ success: false, message: 'Submission Failed' });
        } finally {
            client.release();
        }
    }
};

module.exports = assessmentController;