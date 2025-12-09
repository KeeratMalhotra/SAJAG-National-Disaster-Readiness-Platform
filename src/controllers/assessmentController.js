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

            // 1. Get aadharId from request
            const { trainingId, participantName, aadharId, answers, userLat, userLng } = req.body;
            
            // A. FETCH TRUTH
            const training = await Training.findById(trainingId);
            
            // B. FRAUD CHECKS
            let fraudScore = 0;
            let riskFlag = 'SAFE';

            // Check 1: Geo-Fence (Existing Logic)
            const distance = getDistanceFromLatLonInKm(userLat, userLng, training.latitude, training.longitude);
            if (distance > 200) {
                fraudScore += 40; // Reduced slightly to weigh identity fraud higher
                riskFlag = 'LOCATION_MISMATCH';
            }

            // --- CHECK 2: IDENTITY PATTERN ANALYSIS (New) ---
            // Check how many times this Aadhar ID has been used in ANY training
            const historyCheck = await client.query(
                `SELECT COUNT(*) as count FROM participant_submissions WHERE aadhar_id = $1`, 
                [aadharId]
            );
            const participationCount = parseInt(historyCheck.rows[0].count);

            // LOGIC: If a person appears more than 3 times, it's suspicious for a "One-time" training program.
            // This suggests the NGO is recycling people to inflate numbers.
            if (participationCount >= 3) {
                fraudScore += 100; // Immediate Critical Fail
                riskFlag = 'IDENTITY_FRAUD'; // This alerts SDMA immediately on Dashboard
            }
            // ------------------------------------------------

            // C. CALCULATE SCORE
            let correctCount = 0;
            const questionIds = Object.keys(answers);
            
            // Insert Submission (Now including aadhar_id)
            const submissionResult = await client.query(`
                INSERT INTO participant_submissions 
                (training_id, participant_email, aadhar_id, score, gps_lat, gps_lng, fraud_score, risk_flag, device_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id
            `, [trainingId, participantName, aadharId, 0, userLat, userLng, fraudScore, riskFlag, req.ip]);
            
            const submissionId = submissionResult.rows[0].id;

            // D. SAVE ANSWERS (Existing Logic)
            for (const qId of questionIds) {
                const selectedOptionId = answers[qId];
                const optionCheck = await client.query('SELECT is_correct FROM options WHERE id = $1', [selectedOptionId]);
                const isCorrect = optionCheck.rows[0]?.is_correct || false;
                if (isCorrect) correctCount++;

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
                // If ID Fraud, tell them "Audit Pending" instead of Success
                message: riskFlag === 'IDENTITY_FRAUD' ? "Submission Flagged for Audit" : "Success"
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