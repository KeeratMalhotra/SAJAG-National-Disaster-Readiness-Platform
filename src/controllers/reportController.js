const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Import necessary models and services ---
// (We'll add these as needed, e.g., Training, Submission, predictionService)
const Training = require('../models/Training');
const Submission = require('../models/Submission');
const User = require('../models/User');
const predictionService = require('../services/predictionService');
const pool = require('../config/database'); // For direct DB queries if needed

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

const reportController = {

    // --- NDMA Report ---
    generateNdmaReport: async (req, res) => {
        try {
            const lang = req.query.lang || 'en'; // Default language English
            console.log(`Generating NDMA Report in language: ${lang}`);

            // --- 1. Fetch Data ---
            console.log("Fetching NDMA report data...");
            // Example: Get KPIs (Adapt queries/functions as needed from dashboardController)
            const totalTrainingsResult = await pool.query('SELECT COUNT(*) FROM trainings');
            const totalTrainings = parseInt(totalTrainingsResult.rows[0].count);

            const partnersResult = await pool.query("SELECT COUNT(DISTINCT creator_user_id) FROM trainings");
            const uniquePartners = parseInt(partnersResult.rows[0].count); // Assuming creator_user_id links to partners

            const participantsResult = await pool.query('SELECT COUNT(DISTINCT participant_email) FROM participant_submissions');
            const totalParticipants = parseInt(participantsResult.rows[0].count);

            const avgScoreResult = await pool.query('SELECT AVG(score) as average_score FROM participant_submissions');
            const averageScore = parseFloat(avgScoreResult.rows[0].average_score || 0).toFixed(2);

            const scoresByTheme = await predictionService.getScoresByTheme(); // Use existing service
            const gaps = await predictionService.calculateGaps();   // Use existing service

            console.log("Data fetched:", { totalTrainings, uniquePartners, totalParticipants, averageScore, scoresByTheme: scoresByTheme.length, gaps: gaps.length });

            // --- 2. Generate AI Summary ---
            console.log("Generating AI Summary...");
            let summary = "Summary could not be generated."; // Default text
            try {
                const prompt = `Generate a brief executive summary (2-3 sentences) for a national disaster readiness report based on this data. Highlight the overall status and any major concerns. Respond in ${lang === 'hi' ? 'Hindi' : 'English'}. Data: Total Trainings: ${totalTrainings}, Participants Assessed: ${totalParticipants}, Active Partners: ${uniquePartners}, Average Readiness Score: ${averageScore}%, Priority Gaps Identified: ${gaps.length}. Top Gap (if any): ${gaps.length > 0 ? `${gaps[0].theme} in ${gaps[0].district}` : 'None'}.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                summary = response.text();
                console.log("AI Summary generated successfully.");
            } catch(aiError) {
                console.error("Error generating AI summary:", aiError);
                // Keep the default summary text
            }


            // --- 3. Create PDF ---
            console.log("Creating PDF document...");
            const doc = new PDFDocument({ margin: 50 });

            // Setup response headers
            const filename = `NDMA_Readiness_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-type', 'application/pdf');
            doc.pipe(res);

            // --- Add Content ---
            // Header
            doc.fontSize(18).font('Helvetica-Bold').text('NDMA Disaster Readiness Report', { align: 'center' });
            doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
            doc.moveDown(2);

            // Summary
            doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
            doc.fontSize(10).font('Helvetica').text(summary);
            doc.moveDown();

            // KPIs
            doc.fontSize(14).font('Helvetica-Bold').text('Key Performance Indicators');
            doc.fontSize(10).font('Helvetica').text(`- Total Trainings Conducted: ${totalTrainings}`);
            doc.fontSize(10).text(`- Total Individuals Assessed: ${totalParticipants}`);
            doc.fontSize(10).text(`- Active Training Partners: ${uniquePartners}`); // Changed label slightly
            doc.fontSize(10).text(`- Average Readiness Score: ${averageScore}%`);
            doc.moveDown();

            // Scores by Theme (Simple Table)
            doc.fontSize(14).font('Helvetica-Bold').text('Readiness Score by Theme');
             // Basic table structure - could be improved with pdfkit-table or manual layout
            scoresByTheme.forEach(item => {
                doc.fontSize(10).font('Helvetica').text(`- ${item.theme}: ${parseFloat(item.average_score).toFixed(2)}%`);
            });
            doc.moveDown();


            // Prioritized Gaps (Table) - Requires more complex layout or a table library
             doc.fontSize(14).font('Helvetica-Bold').text('Prioritized Training Gaps');
             if (gaps.length > 0) {
                 // Simple list for now, ideally use pdfkit-table
                 gaps.slice(0, 5).forEach((gap, index) => { // Show top 5
                     doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${gap.theme} in ${gap.district} (Priority: ${gap.priorityScore})`);
                     doc.fontSize(9).font('Helvetica').text(`   Justification: ${gap.reason}`);
                 });
             } else {
                 doc.fontSize(10).font('Helvetica').text('No significant training gaps identified.');
             }
            doc.moveDown();


            // --- Finalize PDF ---
            doc.end();
            console.log("PDF generation complete.");

        } catch (error) {
            console.error('Error generating NDMA report:', error);
            res.status(500).send('Error generating report');
        }
    },

    // --- SDMA Report (Placeholder - Add Similar Logic) ---
    generateSdmaReport: async (req, res) => {
         try {
            const lang = req.query.lang || 'en';
            const userState = req.user.state; // Assuming state is available on user object

             if (!userState) {
                 return res.status(400).send('User state not found.');
             }

            console.log(`Generating SDMA Report for ${userState} in language: ${lang}`);

             // --- 1. Fetch Data specific to the state ---
             console.log(`Fetching SDMA report data for ${userState}...`);
            // Modify queries from dashboardController/predictionService to filter by state
            const totalTrainingsResult = await pool.query('SELECT COUNT(*) FROM trainings t JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
            const totalTrainings = parseInt(totalTrainingsResult.rows[0].count);

            // Note: uniquePartners might need adjustment depending on how partners are defined state-wise
            const partnersResult = await pool.query("SELECT COUNT(DISTINCT t.creator_user_id) FROM trainings t JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1", [userState]);
             const uniquePartners = parseInt(partnersResult.rows[0].count);

            const participantsResult = await pool.query('SELECT COUNT(DISTINCT ps.participant_email) FROM participant_submissions ps JOIN trainings t ON ps.training_id = t.id JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
            const totalParticipants = parseInt(participantsResult.rows[0].count);

            const avgScoreResult = await pool.query('SELECT AVG(ps.score) as average_score FROM participant_submissions ps JOIN trainings t ON ps.training_id = t.id JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
            const averageScore = parseFloat(avgScoreResult.rows[0].average_score || 0).toFixed(2);

            const scoresByTheme = await predictionService.getScoresByTheme(userState); // Pass state
            const gaps = await predictionService.calculateGaps(userState);    // Pass state

             console.log("Data fetched:", { totalTrainings, uniquePartners, totalParticipants, averageScore, scoresByTheme: scoresByTheme.length, gaps: gaps.length });

            // --- 2. Generate AI Summary (State Specific) ---
            console.log("Generating AI Summary...");
            let summary = "Summary could not be generated.";
             try {
                 const prompt = `Generate a brief executive summary (2-3 sentences) for the ${userState} state disaster readiness report based on this data. Highlight the state's overall status and any major concerns. Respond in ${lang === 'hi' ? 'Hindi' : 'English'}. Data: Total Trainings: ${totalTrainings}, Participants Assessed: ${totalParticipants}, Active Partners: ${uniquePartners}, Average Readiness Score: ${averageScore}%, Priority Gaps Identified: ${gaps.length}. Top Gap (if any): ${gaps.length > 0 ? `${gaps[0].theme} in ${gaps[0].district}` : 'None'}.`;
                 const result = await model.generateContent(prompt);
                 const response = await result.response;
                 summary = response.text();
                 console.log("AI Summary generated successfully.");
             } catch(aiError) {
                 console.error("Error generating AI summary:", aiError);
             }


            // --- 3. Create PDF (State Specific) ---
            console.log("Creating PDF document...");
            const doc = new PDFDocument({ margin: 50 });
            const filename = `${userState}_SDMA_Readiness_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-type', 'application/pdf');
            doc.pipe(res);

            // Header
            doc.fontSize(18).font('Helvetica-Bold').text(`${userState} SDMA Disaster Readiness Report`, { align: 'center' });
            doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
            doc.moveDown(2);

            // Summary
            doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
            doc.fontSize(10).font('Helvetica').text(summary);
            doc.moveDown();

            // KPIs
            doc.fontSize(14).font('Helvetica-Bold').text('Key Performance Indicators');
            doc.fontSize(10).font('Helvetica').text(`- Total Trainings Conducted: ${totalTrainings}`);
            doc.fontSize(10).text(`- Total Individuals Assessed: ${totalParticipants}`);
            doc.fontSize(10).text(`- Active Training Partners: ${uniquePartners}`);
            doc.fontSize(10).text(`- Average Readiness Score: ${averageScore}%`);
            doc.moveDown();

            // Scores by Theme
            doc.fontSize(14).font('Helvetica-Bold').text('Readiness Score by Theme');
            scoresByTheme.forEach(item => {
                doc.fontSize(10).font('Helvetica').text(`- ${item.theme}: ${parseFloat(item.average_score).toFixed(2)}%`);
            });
            doc.moveDown();

            // Prioritized Gaps
            doc.fontSize(14).font('Helvetica-Bold').text('Prioritized Training Gaps');
            if (gaps.length > 0) {
                gaps.slice(0, 5).forEach((gap, index) => {
                    doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${gap.theme} in ${gap.district} (Priority: ${gap.priorityScore})`);
                    doc.fontSize(9).font('Helvetica').text(`   Justification: ${gap.reason}`);
                });
            } else {
                doc.fontSize(10).font('Helvetica').text('No significant training gaps identified.');
            }
            doc.moveDown();

            // --- Finalize PDF ---
            doc.end();
             console.log("PDF generation complete.");

        } catch (error) {
            console.error(`Error generating SDMA report for ${req.user?.state}:`, error);
            res.status(500).send('Error generating report');
        }
    },
};

module.exports = reportController;