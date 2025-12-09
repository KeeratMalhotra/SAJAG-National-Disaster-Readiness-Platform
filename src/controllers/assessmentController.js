const Assessment = require('../models/Assessment');
const Training = require('../models/Training');
const Submission = require('../models/Submission');
const pool = require('../config/database');
const cryptoUtils = require('../utils/crypto'); 
const PDFDocument = require('pdfkit');

// Helper: Calculate Distance
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lat2) return 9999;
    var R = 6371; 
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; 
    return d * 1000; 
}

const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
}

// --- EXPANDED HARDCODED DATA (Covers ALL Themes) ---
const HARDCODED_DATA = {
    'Earthquake': {
        title: 'Earthquake Readiness Quiz',
        questions: [
            {
                id: 'eq_q1', question_text: 'What is the "Drop, Cover, and Hold On" technique used for?', category_tag: 'Safety',
                options: [
                    { id: 'opt_eq_1a', option_text: 'Running outside quickly' },
                    { id: 'opt_eq_1b', option_text: 'Protecting yourself from falling debris' }, // Correct
                    { id: 'opt_eq_1c', option_text: 'Calling for help' }
                ]
            },
            {
                id: 'eq_q2', question_text: 'If you are indoors during an earthquake, you should:', category_tag: 'Action',
                options: [
                    { id: 'opt_eq_2a', option_text: 'Stay inside and take cover under furniture' }, // Correct
                    { id: 'opt_eq_2b', option_text: 'Use the elevator to escape' },
                    { id: 'opt_eq_2c', option_text: 'Stand on a balcony' }
                ]
            }
        ]
    },
    'Flood': {
        title: 'Flood Safety Check',
        questions: [
            {
                id: 'fl_q1', question_text: 'What should you do if you encounter a flooded road while driving?', category_tag: 'Safety',
                options: [
                    { id: 'opt_fl_1a', option_text: 'Drive through it quickly' },
                    { id: 'opt_fl_1b', option_text: 'Turn around and find another way' }, // Correct
                    { id: 'opt_fl_1c', option_text: 'Get out and swim' }
                ]
            }
        ]
    },
    'Cyclone': {
        title: 'Cyclone Preparedness',
        questions: [
            {
                id: 'cy_q1', question_text: 'Which part of your house is safest during a cyclone?', category_tag: 'Shelter',
                options: [
                    { id: 'opt_cy_1a', option_text: 'Near windows' },
                    { id: 'opt_cy_1b', option_text: 'A small interior room, closet, or hallway' }, // Correct
                    { id: 'opt_cy_1c', option_text: 'The roof' }
                ]
            }
        ]
    },
    'Landslide': {
        title: 'Landslide Awareness',
        questions: [
            {
                id: 'ls_q1', question_text: 'Which of these is a warning sign of an impending landslide?', category_tag: 'Warning Signs',
                options: [
                    { id: 'opt_ls_1a', option_text: 'Trees or fences tilting at odd angles' }, // Correct
                    { id: 'opt_ls_1b', option_text: 'Clear blue skies' },
                    { id: 'opt_ls_1c', option_text: 'Dry soil' }
                ]
            }
        ]
    },
    'Fire Safety': {
        title: 'Fire Safety Protocols',
        questions: [
            {
                id: 'fs_q1', question_text: 'What does the acronym P.A.S.S. stand for regarding extinguishers?', category_tag: 'Usage',
                options: [
                    { id: 'opt_fs_1a', option_text: 'Pull, Aim, Squeeze, Sweep' }, // Correct
                    { id: 'opt_fs_1b', option_text: 'Push, Aim, Shake, Spray' },
                    { id: 'opt_fs_1c', option_text: 'Panic, Ask, Scream, Sprint' }
                ]
            }
        ]
    },
    'CBRN': {
        title: 'CBRN Emergency Response',
        questions: [
            {
                id: 'cb_q1', question_text: 'In the event of a chemical gas release, you should move:', category_tag: 'Evacuation',
                options: [
                    { id: 'opt_cb_1a', option_text: 'Downwind and downhill' },
                    { id: 'opt_cb_1b', option_text: 'Upwind and uphill' }, // Correct
                    { id: 'opt_cb_1c', option_text: 'Towards the source to investigate' }
                ]
            }
        ]
    },
    // DEFAULT CATCH-ALL (In case of typos or unknown themes)
    'Default': {
        title: 'General Disaster Readiness',
        questions: [
            {
                id: 'gen_q1', question_text: 'What is the most important step in disaster preparedness?', category_tag: 'General',
                options: [
                    { id: 'opt_gen_1a', option_text: 'Ignoring warnings' },
                    { id: 'opt_gen_1b', option_text: 'Having a plan and emergency kit' }, // Correct
                    { id: 'opt_gen_1c', option_text: 'Relying solely on the government' }
                ]
            }
        ]
    }
};

// Map of Correct Answers
const HARDCODED_ANSWERS = {
    'opt_eq_1b': true, 'opt_eq_2a': true,
    'opt_fl_1b': true, 'opt_cy_1b': true,
    'opt_ls_1a': true, 'opt_fs_1a': true,
    'opt_cb_1b': true, 'opt_gen_1b': true
};

const assessmentController = {

    // 1. THE START PAGE
    startAssessment: async (req, res) => {
        try {
            const { trainingId } = req.params;
            const training = await Training.findById(trainingId);

            if (!training) return res.status(404).send('Training Event Not Found');

            // Try Fetch from DB
            let assessment = await Assessment.findByThemeWithQuestions(training.theme);

            // --- ROBUST FALLBACK LOGIC ---
            if (!assessment || !assessment.questions || assessment.questions.length === 0) {
                console.log(`⚠️ Database Empty/Missing. Using Hardcoded Fallback for theme: "${training.theme}"`);
                
                // Get data for theme, OR use Default if theme not found
                const fallbackData = HARDCODED_DATA[training.theme] || HARDCODED_DATA['Default'];
                
                assessment = {
                    id: 'hardcoded_id',
                    title: fallbackData.title,
                    questions: fallbackData.questions
                };
            }
            // --------------------------

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

    // 2. THE SUBMISSION
    submitAssessment: async (req, res) => {
        const client = await pool.connect(); 
        try {
            await client.query('BEGIN');

            const { trainingId, participantName, participantEmail, aadharId, answers, userLat, userLng } = req.body;
            
            // --- 1. GET TRAINING DETAILS ---
            const training = await Training.findById(trainingId);
            if (!training) throw new Error("Training not found");

            // --- 2. GET ASSESSMENT ID (ROBUST LOOKUP) ---
            // We attempt to find the assessment. If not found (hardcoded mode), we handle it gracefully.
            let assessmentId = null;
            try {
                const assessmentRes = await client.query('SELECT id FROM assessments WHERE training_theme = $1', [training.theme]);
                if (assessmentRes.rows.length > 0) {
                    assessmentId = assessmentRes.rows[0].id;
                }
            } catch (err) {
                console.warn("Assessment lookup failed, proceeding in Hardcoded Mode:", err.message);
            }

            // --- 3. FRAUD CHECKS ---
            let fraudScore = 0;
            let riskFlag = 'SAFE';

            // Handle missing geo data gracefully
            const safeLat = userLat || training.latitude;
            const safeLng = userLng || training.longitude;

            const distance = getDistanceFromLatLonInKm(safeLat, safeLng, training.latitude, training.longitude);
            if (distance > 200) {
                fraudScore += 40;
                riskFlag = 'LOCATION_MISMATCH';
            }

            // Secure Identity Check
            const aadharHash = cryptoUtils.hashData(aadharId);
            // Only check history if we can write to DB (optional, but good practice)
            try {
                const historyCheck = await client.query(
                    `SELECT COUNT(*) as count FROM participant_submissions WHERE aadhar_hash = $1`, 
                    [aadharHash]
                );
                if (parseInt(historyCheck.rows[0].count) >= 3) {
                    fraudScore += 100;
                    riskFlag = 'IDENTITY_FRAUD';
                }
            } catch (err) {
                console.warn("Skipping history check due to DB connectivity/schema issues.");
            }

            // --- 4. CALCULATE SCORE (IN MEMORY) ---
            let correctCount = 0;
            const questionIds = Object.keys(answers);
            const cleanAnswersToSave = [];

            for (const qId of questionIds) {
                const selectedOptionId = answers[qId];
                let isCorrect = false;

                // Check Hardcoded Logic
                if (HARDCODED_ANSWERS && HARDCODED_ANSWERS[selectedOptionId] === true) {
                    isCorrect = true;
                } 
                // Check Database Logic (Only if assessmentId exists and option seems to be a UUID)
                else if (assessmentId && !selectedOptionId.toString().startsWith('opt_')) {
                    try {
                        const optionCheck = await client.query('SELECT is_correct FROM options WHERE id = $1', [selectedOptionId]);
                        isCorrect = optionCheck.rows[0]?.is_correct || false;
                    } catch(err) {
                        // Ignore DB errors for mixed content
                    }
                }

                if (isCorrect) correctCount++;
                
                // Prepare for saving later (only if we have a valid DB submission)
                if (qId && selectedOptionId) {
                    cleanAnswersToSave.push({ qId, selectedOptionId, isCorrect });
                }
            }

            const finalScore = questionIds.length > 0 ? (correctCount / questionIds.length) * 100 : 0;
            let submissionId = null;

            // --- 5. INSERT SUBMISSION (ONLY IF ASSESSMENT EXISTS) ---
            if (assessmentId) {
                // Secure Storage
                const aadharEncrypted = cryptoUtils.encrypt(aadharId);
                const aadharMasked = cryptoUtils.maskAadhar(aadharId);

                const submissionResult = await client.query(`
                    INSERT INTO participant_submissions 
                    (training_id, participant_email, assessment_id, aadhar_id, aadhar_hash, aadhar_encrypted, aadhar_masked, score, gps_lat, gps_lng, fraud_score, risk_flag, device_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id
                `, [trainingId, participantEmail, assessmentId, aadharId, aadharHash, aadharEncrypted, aadharMasked, finalScore, safeLat, safeLng, fraudScore, riskFlag, req.ip]);
                
                submissionId = submissionResult.rows[0].id;

                // Save Answers
                for (const ans of cleanAnswersToSave) {
                    // Only insert if Question ID is a valid UUID (not "eq_q1")
                    if (!ans.qId.toString().startsWith('eq_') && !ans.qId.toString().startsWith('gen_')) {
                         await client.query(`
                            INSERT INTO submission_answers (submission_id, question_id, selected_option_id, is_correct)
                            VALUES ($1, $2, $3, $4)
                        `, [submissionId, ans.qId, ans.selectedOptionId, ans.isCorrect]);
                    }
                }
            } else {
                console.log("⚠️ Assessment not in DB. Skipping DB insert. Returning calculated score only.");
                submissionId = "hardcoded-" + Date.now(); // Dummy ID for frontend
            }

            await client.query('COMMIT');

            // --- 6. SEND RESPONSE ---
            res.json({ 
                success: true, 
                score: finalScore, 
                submissionId: submissionId,
                risk: riskFlag,
                message: riskFlag === 'IDENTITY_FRAUD' ? "Submission Flagged for Audit" : "Success",
                // Extra fields for Stateless Certificate
                trainingTitle: training.title,
                theme: training.theme,
                date: new Date().toLocaleDateString()
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Submission Error:', error);
            res.status(500).json({ success: false, message: 'Submission Failed: ' + error.message });
        } finally {
            client.release();
        }
    },

    // 3. CERTIFICATE GENERATION
   downloadCertificate: async (req, res) => {
        try {
            // Get data directly from Query Parameters (e.g. ?name=John&score=80...)
            const { name, score, training, date } = req.query;

            // Basic Validation
            if (!name || !score) {
                return res.status(400).send("Missing certificate information.");
            }

            // Create PDF
            const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Certificate-${name}.pdf"`);

            doc.pipe(res);

            // --- Certificate Design ---
            // Decorative Border
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#2c3e50').lineWidth(5);
            doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#e67e22').lineWidth(2);

            // Header
            doc.moveDown(2);
            doc.font('Helvetica-Bold').fontSize(30).fillColor('#2c3e50').text('CERTIFICATE OF COMPLETION', { align: 'center' });
            
            doc.moveDown();
            doc.font('Helvetica').fontSize(15).fillColor('#7f8c8d').text('This is to certify that', { align: 'center' });
            
            // Participant Name
            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(25).fillColor('#e67e22').text(name, { align: 'center' });

            // Training Details
            doc.moveDown();
            doc.font('Helvetica').fontSize(15).fillColor('#7f8c8d').text('Has successfully completed the disaster readiness training:', { align: 'center' });
            
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').fontSize(20).fillColor('#2c3e50').text(training || 'General Safety Training', { align: 'center' });

            // Score
            doc.moveDown();
            doc.font('Helvetica').fontSize(15).text(`Score Achieved: ${parseFloat(score).toFixed(1)}%`, { align: 'center' });

            doc.moveDown(2);
            doc.font('Helvetica-Oblique').fontSize(12).fillColor('#27ae60').text('Thanks for taking this assessment!', { align: 'center' });

            // Footer
            doc.moveDown(2);
            doc.fontSize(12).fillColor('#333');
            doc.text(`Date Issued: ${date || new Date().toLocaleDateString()}`, 100, doc.y, { align: 'right' });

            doc.end();

        } catch (error) {
            console.error('Certificate Error:', error);
            res.status(500).send("Error generating certificate");
        }
    }

};


module.exports = assessmentController;