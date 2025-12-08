// const PDFDocument = require('pdfkit');
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // --- Import necessary models and services ---
// // (We'll add these as needed, e.g., Training, Submission, predictionService)
// const Training = require('../models/Training');
// const Submission = require('../models/Submission');
// const User = require('../models/User');
// const predictionService = require('../services/predictionService');
// const pool = require('../config/database'); // For direct DB queries if needed

// // --- Initialize Gemini ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

// const reportController = {

//     // --- NDMA Report ---
//     generateNdmaReport: async (req, res) => {
//         try {
//             const lang = req.query.lang || 'en'; // Default language English
//             console.log(`Generating NDMA Report in language: ${lang}`);

//             // --- 1. Fetch Data ---
//             console.log("Fetching NDMA report data...");
//             // Example: Get KPIs (Adapt queries/functions as needed from dashboardController)
//             const totalTrainingsResult = await pool.query('SELECT COUNT(*) FROM trainings');
//             const totalTrainings = parseInt(totalTrainingsResult.rows[0].count);

//             const partnersResult = await pool.query("SELECT COUNT(DISTINCT creator_user_id) FROM trainings");
//             const uniquePartners = parseInt(partnersResult.rows[0].count); // Assuming creator_user_id links to partners

//             const participantsResult = await pool.query('SELECT COUNT(DISTINCT participant_email) FROM participant_submissions');
//             const totalParticipants = parseInt(participantsResult.rows[0].count);

//             const avgScoreResult = await pool.query('SELECT AVG(score) as average_score FROM participant_submissions');
//             const averageScore = parseFloat(avgScoreResult.rows[0].average_score || 0).toFixed(2);

//             const scoresByTheme = await predictionService.getScoresByTheme(); // Use existing service
//             const gaps = await predictionService.calculateGaps();   // Use existing service

//             console.log("Data fetched:", { totalTrainings, uniquePartners, totalParticipants, averageScore, scoresByTheme: scoresByTheme.length, gaps: gaps.length });

//             // --- 2. Generate AI Summary ---
//             console.log("Generating AI Summary...");
//             let summary = "Summary could not be generated."; // Default text
//             try {
//                 const prompt = `Generate a brief executive summary (2-3 sentences) for a national disaster readiness report based on this data. Highlight the overall status and any major concerns. Respond in ${lang === 'hi' ? 'Hindi' : 'English'}. Data: Total Trainings: ${totalTrainings}, Participants Assessed: ${totalParticipants}, Active Partners: ${uniquePartners}, Average Readiness Score: ${averageScore}%, Priority Gaps Identified: ${gaps.length}. Top Gap (if any): ${gaps.length > 0 ? `${gaps[0].theme} in ${gaps[0].district}` : 'None'}.`;

//                 const result = await model.generateContent(prompt);
//                 const response = await result.response;
//                 summary = response.text();
//                 console.log("AI Summary generated successfully.");
//             } catch(aiError) {
//                 console.error("Error generating AI summary:", aiError);
//                 // Keep the default summary text
//             }


//             // --- 3. Create PDF ---
//             console.log("Creating PDF document...");
//             const doc = new PDFDocument({ margin: 50 });

//             // Setup response headers
//             const filename = `NDMA_Readiness_Report_${new Date().toISOString().split('T')[0]}.pdf`;
//             res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//             res.setHeader('Content-type', 'application/pdf');
//             doc.pipe(res);

//             // --- Add Content ---
//             // Header
//             doc.fontSize(18).font('Helvetica-Bold').text('NDMA Disaster Readiness Report', { align: 'center' });
//             doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
//             doc.moveDown(2);

//             // Summary
//             doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
//             doc.fontSize(10).font('Helvetica').text(summary);
//             doc.moveDown();

//             // KPIs
//             doc.fontSize(14).font('Helvetica-Bold').text('Key Performance Indicators');
//             doc.fontSize(10).font('Helvetica').text(`- Total Trainings Conducted: ${totalTrainings}`);
//             doc.fontSize(10).text(`- Total Individuals Assessed: ${totalParticipants}`);
//             doc.fontSize(10).text(`- Active Training Partners: ${uniquePartners}`); // Changed label slightly
//             doc.fontSize(10).text(`- Average Readiness Score: ${averageScore}%`);
//             doc.moveDown();

//             // Scores by Theme (Simple Table)
//             doc.fontSize(14).font('Helvetica-Bold').text('Readiness Score by Theme');
//              // Basic table structure - could be improved with pdfkit-table or manual layout
//             scoresByTheme.forEach(item => {
//                 doc.fontSize(10).font('Helvetica').text(`- ${item.theme}: ${parseFloat(item.average_score).toFixed(2)}%`);
//             });
//             doc.moveDown();


//             // Prioritized Gaps (Table) - Requires more complex layout or a table library
//              doc.fontSize(14).font('Helvetica-Bold').text('Prioritized Training Gaps');
//              if (gaps.length > 0) {
//                  // Simple list for now, ideally use pdfkit-table
//                  gaps.slice(0, 5).forEach((gap, index) => { // Show top 5
//                      doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${gap.theme} in ${gap.district} (Priority: ${gap.priorityScore})`);
//                      doc.fontSize(9).font('Helvetica').text(`   Justification: ${gap.reason}`);
//                  });
//              } else {
//                  doc.fontSize(10).font('Helvetica').text('No significant training gaps identified.');
//              }
//             doc.moveDown();


//             // --- Finalize PDF ---
//             doc.end();
//             console.log("PDF generation complete.");

//         } catch (error) {
//             console.error('Error generating NDMA report:', error);
//             res.status(500).send('Error generating report');
//         }
//     },

//     // --- SDMA Report (Placeholder - Add Similar Logic) ---
//     generateSdmaReport: async (req, res) => {
//          try {
//             const lang = req.query.lang || 'en';
//             const userState = req.user.state; // Assuming state is available on user object

//              if (!userState) {
//                  return res.status(400).send('User state not found.');
//              }

//             console.log(`Generating SDMA Report for ${userState} in language: ${lang}`);

//              // --- 1. Fetch Data specific to the state ---
//              console.log(`Fetching SDMA report data for ${userState}...`);
//             // Modify queries from dashboardController/predictionService to filter by state
//             const totalTrainingsResult = await pool.query('SELECT COUNT(*) FROM trainings t JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
//             const totalTrainings = parseInt(totalTrainingsResult.rows[0].count);

//             // Note: uniquePartners might need adjustment depending on how partners are defined state-wise
//             const partnersResult = await pool.query("SELECT COUNT(DISTINCT t.creator_user_id) FROM trainings t JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1", [userState]);
//              const uniquePartners = parseInt(partnersResult.rows[0].count);

//             const participantsResult = await pool.query('SELECT COUNT(DISTINCT ps.participant_email) FROM participant_submissions ps JOIN trainings t ON ps.training_id = t.id JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
//             const totalParticipants = parseInt(participantsResult.rows[0].count);

//             const avgScoreResult = await pool.query('SELECT AVG(ps.score) as average_score FROM participant_submissions ps JOIN trainings t ON ps.training_id = t.id JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
//             const averageScore = parseFloat(avgScoreResult.rows[0].average_score || 0).toFixed(2);

//             const scoresByTheme = await predictionService.getScoresByTheme(userState); // Pass state
//             const gaps = await predictionService.calculateGaps(userState);    // Pass state

//              console.log("Data fetched:", { totalTrainings, uniquePartners, totalParticipants, averageScore, scoresByTheme: scoresByTheme.length, gaps: gaps.length });

//             // --- 2. Generate AI Summary (State Specific) ---
//             console.log("Generating AI Summary...");
//             let summary = "Summary could not be generated.";
//              try {
//                  const prompt = `Generate a brief executive summary (2-3 sentences) for the ${userState} state disaster readiness report based on this data. Highlight the state's overall status and any major concerns. Respond in ${lang === 'hi' ? 'Hindi' : 'English'}. Data: Total Trainings: ${totalTrainings}, Participants Assessed: ${totalParticipants}, Active Partners: ${uniquePartners}, Average Readiness Score: ${averageScore}%, Priority Gaps Identified: ${gaps.length}. Top Gap (if any): ${gaps.length > 0 ? `${gaps[0].theme} in ${gaps[0].district}` : 'None'}.`;
//                  const result = await model.generateContent(prompt);
//                  const response = await result.response;
//                  summary = response.text();
//                  console.log("AI Summary generated successfully.");
//              } catch(aiError) {
//                  console.error("Error generating AI summary:", aiError);
//              }


//             // --- 3. Create PDF (State Specific) ---
//             console.log("Creating PDF document...");
//             const doc = new PDFDocument({ margin: 50 });
//             const filename = `${userState}_SDMA_Readiness_Report_${new Date().toISOString().split('T')[0]}.pdf`;
//             res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//             res.setHeader('Content-type', 'application/pdf');
//             doc.pipe(res);

//             // Header
//             doc.fontSize(18).font('Helvetica-Bold').text(`${userState} SDMA Disaster Readiness Report`, { align: 'center' });
//             doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
//             doc.moveDown(2);

//             // Summary
//             doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
//             doc.fontSize(10).font('Helvetica').text(summary);
//             doc.moveDown();

//             // KPIs
//             doc.fontSize(14).font('Helvetica-Bold').text('Key Performance Indicators');
//             doc.fontSize(10).font('Helvetica').text(`- Total Trainings Conducted: ${totalTrainings}`);
//             doc.fontSize(10).text(`- Total Individuals Assessed: ${totalParticipants}`);
//             doc.fontSize(10).text(`- Active Training Partners: ${uniquePartners}`);
//             doc.fontSize(10).text(`- Average Readiness Score: ${averageScore}%`);
//             doc.moveDown();

//             // Scores by Theme
//             doc.fontSize(14).font('Helvetica-Bold').text('Readiness Score by Theme');
//             scoresByTheme.forEach(item => {
//                 doc.fontSize(10).font('Helvetica').text(`- ${item.theme}: ${parseFloat(item.average_score).toFixed(2)}%`);
//             });
//             doc.moveDown();

//             // Prioritized Gaps
//             doc.fontSize(14).font('Helvetica-Bold').text('Prioritized Training Gaps');
//             if (gaps.length > 0) {
//                 gaps.slice(0, 5).forEach((gap, index) => {
//                     doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${gap.theme} in ${gap.district} (Priority: ${gap.priorityScore})`);
//                     doc.fontSize(9).font('Helvetica').text(`   Justification: ${gap.reason}`);
//                 });
//             } else {
//                 doc.fontSize(10).font('Helvetica').text('No significant training gaps identified.');
//             }
//             doc.moveDown();

//             // --- Finalize PDF ---
//             doc.end();
//              console.log("PDF generation complete.");

//         } catch (error) {
//             console.error(`Error generating SDMA report for ${req.user?.state}:`, error);
//             res.status(500).send('Error generating report');
//         }
//     },
// };

// module.exports = reportController;







// new without graph
// const PDFDocument = require('pdfkit');
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // --- Import necessary models and services ---
// const Training = require('../models/Training');
// const Submission = require('../models/Submission');
// const User = require('../models/User');
// const predictionService = require('../services/predictionService');
// const pool = require('../config/database');

// // --- Initialize Gemini ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// // --- Helper Functions for PDF Styling ---
// const colors = {
//     primary: '#1a5f7a', // Deep Teal/Blue
//     secondary: '#57c5b6', // Light Teal
//     text: '#333333',
//     lightGray: '#f4f4f4',
//     white: '#ffffff'
// };

// const drawHeader = (doc, title) => {
//     doc.rect(0, 0, 612, 100).fill(colors.primary); // Header background (A4 width is approx 595-612)
//     doc.fontSize(24).fillColor(colors.white).font('Helvetica-Bold').text(title, 50, 40);
//     doc.fontSize(10).fillColor(colors.white).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 75);
//     doc.moveDown(4);
// };

// const drawSectionTitle = (doc, title) => {
//     doc.moveDown(1);
//     const y = doc.y;
//     doc.rect(50, y, 5, 20).fill(colors.secondary); // Accent bar
//     doc.fontSize(16).fillColor(colors.primary).font('Helvetica-Bold').text(title, 65, y + 2);
//     doc.moveDown(1);
// };

// const drawKPIBox = (doc, x, y, label, value) => {
//     doc.rect(x, y, 120, 70).fillAndStroke(colors.lightGray, colors.secondary);
//     doc.fillColor(colors.primary).fontSize(20).font('Helvetica-Bold').text(value, x, y + 20, { width: 120, align: 'center' });
//     doc.fillColor(colors.text).fontSize(9).font('Helvetica').text(label, x, y + 45, { width: 120, align: 'center' });
// };

// const drawTable = (doc, data, headers, startY, colWidths) => {
//     let currentY = startY;
//     const startX = 50;
    
//     // Draw Header
//     doc.rect(startX, currentY, 510, 20).fill(colors.primary);
//     let currentX = startX;
//     headers.forEach((header, i) => {
//         doc.fillColor(colors.white).fontSize(10).font('Helvetica-Bold').text(header, currentX + 5, currentY + 5, { width: colWidths[i], align: 'left' });
//         currentX += colWidths[i];
//     });
//     currentY += 20;

//     // Draw Rows
//     data.forEach((item, index) => {
//         if (currentY > 700) { // Auto page break check
//             doc.addPage();
//             currentY = 50;
//         }
        
//         // Striped rows
//         if (index % 2 === 0) {
//             doc.rect(startX, currentY, 510, 20).fill(colors.lightGray);
//         }

//         currentX = startX;
//         doc.fillColor(colors.text).fontSize(10).font('Helvetica');
        
//         // Render each column based on input data array
//         item.forEach((text, i) => {
//              doc.text(text, currentX + 5, currentY + 5, { width: colWidths[i] - 10, align: 'left', lineBreak: false, ellipsis: true });
//              currentX += colWidths[i];
//         });
//         currentY += 20;
//     });
//     return currentY;
// };

// const reportController = {

//     // --- NDMA Report ---
//     generateNdmaReport: async (req, res) => {
//         // Reuse logic with the new styling helpers (Similar structure to SDMA below)
//         // For brevity, I will apply the same transformation logic as SDMA
//         try {
//             const lang = req.query.lang || 'en';
            
//             // 1. Fetch Data
//             const totalTrainingsResult = await pool.query('SELECT COUNT(*) FROM trainings');
//             const totalTrainings = parseInt(totalTrainingsResult.rows[0].count);
//             const partnersResult = await pool.query("SELECT COUNT(DISTINCT creator_user_id) FROM trainings");
//             const uniquePartners = parseInt(partnersResult.rows[0].count);
//             const participantsResult = await pool.query('SELECT COUNT(DISTINCT participant_email) FROM participant_submissions');
//             const totalParticipants = parseInt(participantsResult.rows[0].count);
//             const avgScoreResult = await pool.query('SELECT AVG(score) as average_score FROM participant_submissions');
//             const averageScore = parseFloat(avgScoreResult.rows[0].average_score || 0).toFixed(2);
//             const scoresByTheme = await predictionService.getScoresByTheme();
//             const gaps = await predictionService.calculateGaps();

//             // 2. AI Summary
//             let summary = "Summary could not be generated.";
//             try {
//                 const prompt = `Generate a professional executive summary (3-4 sentences) for a National Disaster Readiness Report. Respond in ${lang === 'hi' ? 'Hindi' : 'English'}. Data: Trainings: ${totalTrainings}, Participants: ${totalParticipants}, Partners: ${uniquePartners}, Avg Score: ${averageScore}%. Gaps: ${gaps.length}.`;
//                 const result = await model.generateContent(prompt);
//                 summary = (await result.response).text();
//             } catch(e) { console.error(e); }

//             // 3. Create PDF
//             const doc = new PDFDocument({ margin: 50, size: 'A4' });
//             res.setHeader('Content-disposition', `attachment; filename="NDMA_Readiness_Report.pdf"`);
//             res.setHeader('Content-type', 'application/pdf');
//             doc.pipe(res);

//             drawHeader(doc, "National Disaster Readiness Report");

//             // Summary
//             drawSectionTitle(doc, 'Executive Summary');
//             doc.rect(50, doc.y, 510, 60).fill(colors.lightGray); // Background box
//             doc.fillColor(colors.text).fontSize(10).font('Helvetica').text(summary, 60, doc.y - 50, { width: 490, align: 'justify' });
//             doc.moveDown(3);

//             // KPIs
//             drawSectionTitle(doc, 'Key Performance Indicators');
//             const kpiY = doc.y;
//             drawKPIBox(doc, 50, kpiY, "Total Trainings", totalTrainings);
//             drawKPIBox(doc, 180, kpiY, "Participants", totalParticipants);
//             drawKPIBox(doc, 310, kpiY, "Active Partners", uniquePartners);
//             drawKPIBox(doc, 440, kpiY, "Avg Readiness", `${averageScore}%`);
//             doc.y = kpiY + 80; // Move cursor past KPIs

//             // Scores by Theme Table
//             doc.moveDown(2);
//             drawSectionTitle(doc, 'Readiness Score by Theme');
//             const themeData = scoresByTheme.map(s => [s.theme, `${parseFloat(s.average_score).toFixed(2)}%`]);
//             drawTable(doc, themeData, ['Theme', 'Average Score'], doc.y, [300, 210]);

//             // Gaps Table
//             doc.moveDown(2);
//             drawSectionTitle(doc, 'Prioritized Training Gaps');
//             if (gaps.length > 0) {
//                 const gapData = gaps.slice(0, 10).map((g, i) => [
//                     (i + 1).toString(), 
//                     g.theme, 
//                     g.district || 'N/A', 
//                     parseFloat(g.priorityScore).toFixed(1)
//                 ]);
//                 drawTable(doc, gapData, ['#', 'Theme', 'District', 'Priority'], doc.y, [30, 200, 150, 130]);
//             } else {
//                 doc.fontSize(10).text("No significant gaps identified.");
//             }

//             doc.end();

//         } catch (error) {
//             console.error('Error:', error);
//             res.status(500).send('Error generating report');
//         }
//     },

//     // --- SDMA Report ---
//     generateSdmaReport: async (req, res) => {
//          try {
//             const lang = req.query.lang || 'en';
//             const userState = req.user.state; 

//              if (!userState) return res.status(400).send('User state not found.');

//             // 1. Fetch Data
//             const totalTrainingsResult = await pool.query('SELECT COUNT(*) FROM trainings t JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
//             const totalTrainings = parseInt(totalTrainingsResult.rows[0].count);
//             const partnersResult = await pool.query("SELECT COUNT(DISTINCT t.creator_user_id) FROM trainings t JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1", [userState]);
//             const uniquePartners = parseInt(partnersResult.rows[0].count);
//             const participantsResult = await pool.query('SELECT COUNT(DISTINCT ps.participant_email) FROM participant_submissions ps JOIN trainings t ON ps.training_id = t.id JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
//             const totalParticipants = parseInt(participantsResult.rows[0].count);
//             const avgScoreResult = await pool.query('SELECT AVG(ps.score) as average_score FROM participant_submissions ps JOIN trainings t ON ps.training_id = t.id JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1', [userState]);
//             const averageScore = parseFloat(avgScoreResult.rows[0].average_score || 0).toFixed(2);
//             const scoresByTheme = await predictionService.getScoresByTheme(userState);
//             const gaps = await predictionService.calculateGaps(userState);

//             // 2. Generate AI Summary
//             let summary = "Summary could not be generated.";
//              try {
//                  const prompt = `Generate a professional executive summary (3-4 sentences) for the ${userState} State Disaster Readiness Report. Respond in ${lang === 'hi' ? 'Hindi' : 'English'}. Data: Trainings: ${totalTrainings}, Participants: ${totalParticipants}, Partners: ${uniquePartners}, Avg Score: ${averageScore}%. Priority Gaps: ${gaps.length}.`;
//                  const result = await model.generateContent(prompt);
//                  summary = (await result.response).text();
//              } catch(aiError) { console.error("AI Error:", aiError); }

//             // 3. Create PDF
//             const doc = new PDFDocument({ margin: 50, size: 'A4' });
//             const filename = `${userState}_SDMA_Readiness_Report.pdf`;
//             res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
//             res.setHeader('Content-type', 'application/pdf');
//             doc.pipe(res);

//             // --- Styled Content ---
//             drawHeader(doc, `${userState} SDMA Readiness Report`);

//             // Summary Section
//             drawSectionTitle(doc, 'Executive Summary');
//             // Draw a light gray box for the summary
//             doc.rect(50, doc.y, 510, 50).fill(colors.lightGray);
//             doc.fillColor(colors.text).fontSize(10).font('Helvetica').text(summary, 60, doc.y - 40, { width: 490, align: 'justify' });
//             doc.moveDown(3);

//             // KPIs Section (Grid Layout)
//             drawSectionTitle(doc, 'Key Performance Indicators');
//             const kpiY = doc.y;
//             drawKPIBox(doc, 50, kpiY, "Total Trainings", totalTrainings);
//             drawKPIBox(doc, 180, kpiY, "Assessed People", totalParticipants);
//             drawKPIBox(doc, 310, kpiY, "Active Partners", uniquePartners);
//             drawKPIBox(doc, 440, kpiY, "Avg Readiness", `${averageScore}%`);
//             doc.y = kpiY + 85; // Move cursor down past boxes

//             // Themes Table
//             drawSectionTitle(doc, 'Readiness Score by Theme');
//             if(scoresByTheme.length > 0) {
//                 const themeData = scoresByTheme.map(item => [
//                     item.theme, 
//                     `${parseFloat(item.average_score).toFixed(2)}%`
//                 ]);
//                 drawTable(doc, themeData, ['Disaster Theme', 'Average Score'], doc.y, [300, 210]);
//             } else {
//                 doc.fontSize(10).text("No data available.");
//             }
            
//             doc.moveDown(2);

//             // Gaps Table
//             drawSectionTitle(doc, 'Prioritized Training Gaps');
//             if (gaps.length > 0) {
//                  const gapData = gaps.slice(0, 10).map((gap, index) => [
//                      (index + 1).toString(),
//                      gap.theme,
//                      gap.district,
//                      parseFloat(gap.priorityScore).toFixed(1)
//                  ]);
//                  drawTable(doc, gapData, ['#', 'Gap Theme', 'District', 'Priority Score'], doc.y, [30, 180, 180, 120]);
                 
//                  doc.moveDown(1);
//                  doc.fontSize(8).fillColor('#777777').text("* Priority Score is calculated based on historical disaster frequency vs. training coverage.", {align: 'center'});
//             } else {
//                 doc.fontSize(10).fillColor(colors.text).text('No significant training gaps identified at this time.');
//             }

//             // Footer (Simple Page Number)
//             const range = doc.bufferedPageRange();
//             for (let i = range.start; i < range.start + range.count; i++) {
//                 doc.switchToPage(i);
//                 doc.fontSize(8).fillColor('#aaaaaa').text(
//                     `Page ${i + 1} of ${range.count}`, 
//                     50, 
//                     doc.page.height - 50, 
//                     { align: 'center', width: 500 }
//                 );
//             }

//             doc.end();

//         } catch (error) {
//             console.error(`Error generating SDMA report:`, error);
//             res.status(500).send('Error generating report');
//         }
//     },
// };

// module.exports = reportController;






// new with graph
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Import necessary models and services ---
const predictionService = require('../services/predictionService');
const pool = require('../config/database');

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- GOVERNMENT THEME CONSTANTS ---
const theme = {
    primary: '#002147',       // Official Navy Blue (Headers/Text)
    accent: '#FF9933',        // Saffron (Highlights)
    secondary: '#444444',     // Dark Gray (Subtext)
    lightBg: '#F3F4F6',       // Light Gray (Backgrounds)
    success: '#138D75',       // Teal Green
    warning: '#F39C12',       // Orange
    danger: '#C0392B',        // Red
    white: '#FFFFFF',
    gridLine: '#E5E7EB'
};

// --- DRAWING HELPERS ---

const drawHeader = (doc, title, subtitle) => {
    // 1. Header Background
    doc.rect(0, 0, 595.28, 100).fill(theme.primary); // A4 Width
    
    // 2. Title & Subtitle
    doc.fillColor(theme.white).fontSize(24).font('Helvetica-Bold').text(title, 50, 35);
    doc.fillColor('#E5E7EB').fontSize(10).font('Helvetica').text(subtitle.toUpperCase(), 50, 65, { characterSpacing: 1 });
    doc.text(`GENERATED: ${new Date().toLocaleDateString()}`, 50, 80);

    // 3. Saffron Bottom Border
    doc.rect(0, 95, 595.28, 5).fill(theme.accent);
    
    doc.y = 120; // Reset Y below header
};

const drawSectionHeader = (doc, title) => {
    const y = doc.y;
    doc.rect(50, y, 4, 18).fill(theme.accent); // Left accent mark
    doc.fillColor(theme.primary).fontSize(14).font('Helvetica-Bold').text(title.toUpperCase(), 60, y + 2);
    doc.y += 25; // Move down fixed amount
};

// --- KPI STRIP (Fixed Height: 70px) ---
const drawKPIStrip = (doc, metrics) => {
    const startY = doc.y;
    const boxWidth = 500 / metrics.length;
    const boxHeight = 60;

    // Background
    doc.rect(50, startY, 500, boxHeight).fill(theme.lightBg);
    doc.rect(50, startY, 500, boxHeight).strokeColor(theme.gridLine).stroke();

    metrics.forEach((metric, index) => {
        const x = 50 + (index * boxWidth);
        
        // Vertical Divider
        if (index < metrics.length - 1) {
            doc.moveTo(x + boxWidth, startY + 10)
               .lineTo(x + boxWidth, startY + boxHeight - 10)
               .strokeColor('#D1D5DB').lineWidth(1).stroke();
        }

        // Value
        doc.fillColor(theme.primary).fontSize(16).font('Helvetica-Bold')
           .text(metric.value, x, startY + 15, { width: boxWidth, align: 'center' });
        
        // Label
        doc.fillColor(theme.secondary).fontSize(8).font('Helvetica')
           .text(metric.label, x, startY + 38, { width: boxWidth, align: 'center' });
    });

    doc.y = startY + boxHeight + 20; // Gap after strip
};

// --- SIDE-BY-SIDE CHARTS ---
const drawDashboardCharts = (doc, score, themeData) => {
    const startY = doc.y;
    const leftCenter = 130; // Center of left column
    
    // --- 1. LEFT: DONUT CHART ---
    const radius = 40;
    const donutY = startY + 50;
    
    // Ring
    doc.lineWidth(8).strokeColor(theme.gridLine).circle(leftCenter, donutY, radius).stroke();
    
    // Arc
    if (score > 0) {
        const startAngle = -Math.PI / 2;
        const angle = (Math.PI * 2 * (score / 100));
        const color = score >= 75 ? theme.success : (score >= 50 ? theme.warning : theme.danger);
        
        doc.lineWidth(8).strokeColor(color)
           .path(`M ${leftCenter + radius * Math.cos(startAngle)} ${donutY + radius * Math.sin(startAngle)} A ${radius} ${radius} 0 ${score > 50 ? 1 : 0} 1 ${leftCenter + radius * Math.cos(startAngle + angle)} ${donutY + radius * Math.sin(startAngle + angle)}`)
           .stroke();
    }
    
    // Text inside Donut
    doc.fillColor(theme.primary).fontSize(14).font('Helvetica-Bold').text(`${Math.round(score)}%`, leftCenter - 30, donutY - 6, { width: 60, align: 'center' });
    doc.fillColor(theme.secondary).fontSize(7).font('Helvetica').text("AVG SCORE", leftCenter - 30, donutY + 10, { width: 60, align: 'center' });


    // --- 2. RIGHT: BAR CHART ---
    const chartX = 250;
    const chartWidth = 300;
    const rowHeight = 25;
    
    doc.fillColor(theme.secondary).fontSize(9).font('Helvetica-Bold').text("THEME PERFORMANCE", chartX, startY);
    
    let currentY = startY + 20;

    if (themeData.length === 0) {
         doc.fontSize(9).font('Helvetica').text("No theme data available.", chartX, currentY);
    } else {
        themeData.slice(0, 5).forEach(item => { // Limit to top 5 to fit layout
            const val = parseFloat(item.value);
            const barMax = 180;
            const barW = (val / 100) * barMax;
            const color = val >= 75 ? theme.success : (val >= 50 ? theme.warning : theme.danger);
            
            // Label
            doc.fillColor(theme.primary).fontSize(8).font('Helvetica').text(item.label, chartX, currentY + 2, { width: 90, ellipsis: true });
            
            // Bar Background
            doc.rect(chartX + 90, currentY, barMax, 10).fill(theme.gridLine);
            // Bar Value
            doc.rect(chartX + 90, currentY, barW, 10).fill(color);
            // Text Value
            doc.fillColor(theme.secondary).text(`${val.toFixed(1)}%`, chartX + 90 + barMax + 5, currentY);
            
            currentY += rowHeight;
        });
    }

    // Return the lowest Y point to continue content
    doc.y = Math.max(donutY + 60, currentY + 20);
};

// --- TABLE RENDERER ---
const drawTable = (doc, headers, rows, colWidths) => {
    const startX = 50;
    let currentY = doc.y;

    // Header
    doc.rect(startX, currentY, 500, 20).fill(theme.primary);
    let currentX = startX;
    headers.forEach((h, i) => {
        doc.fillColor(theme.white).fontSize(8).font('Helvetica-Bold').text(h, currentX + 5, currentY + 6, { width: colWidths[i] });
        currentX += colWidths[i];
    });
    currentY += 20;

    // Rows
    rows.forEach((row, idx) => {
        // Page Break Check
        if (currentY > 750) { 
            doc.addPage(); 
            currentY = 50;
            // Redraw header on new page
            doc.rect(startX, currentY, 500, 20).fill(theme.primary);
            let cx = startX;
            headers.forEach((h, i) => {
                doc.fillColor(theme.white).fontSize(8).font('Helvetica-Bold').text(h, cx + 5, currentY + 6, { width: colWidths[i] });
                cx += colWidths[i];
            });
            currentY += 20;
        }

        // Zebra Striping
        if (idx % 2 === 0) doc.rect(startX, currentY, 500, 20).fill(theme.lightBg);
        doc.rect(startX, currentY, 500, 20).strokeColor(theme.gridLine).stroke();

        currentX = startX;
        doc.fillColor(theme.primary).fontSize(8).font('Helvetica');
        
        row.forEach((cell, i) => {
            doc.text(cell, currentX + 5, currentY + 6, { width: colWidths[i] - 5, ellipsis: true });
            currentX += colWidths[i];
        });
        currentY += 20;
    });
    
    doc.y = currentY + 20;
};

// --- MAIN CONTROLLER ---
const reportController = {

    generateNdmaReport: async (req, res) => {
        reportController.generateGenericReport(req, res, 'NDMA');
    },

    generateSdmaReport: async (req, res) => {
        reportController.generateGenericReport(req, res, 'SDMA');
    },

    // Unified Logic
    generateGenericReport: async (req, res, type) => {
        try {
            const isState = type === 'SDMA';
            const userState = req.user?.state;
            
            if (isState && !userState) return res.status(400).send('State not found');

            // 1. DATA FETCHING
            const filter = isState ? 'JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1' : '';
            const subFilter = isState ? 'JOIN trainings t ON ps.training_id = t.id JOIN users u ON t.creator_user_id = u.id WHERE u.state = $1' : '';
            const params = isState ? [userState] : [];

            // Queries
            const qTrainings = `SELECT COUNT(*) FROM trainings t ${filter}`;
            const qPartners = isState 
                ? `SELECT COUNT(DISTINCT t.creator_user_id) FROM trainings t ${filter}`
                : `SELECT COUNT(DISTINCT creator_user_id) FROM trainings t`;
            const qParticipants = `SELECT COUNT(DISTINCT ps.participant_email) FROM participant_submissions ps ${subFilter}`;
            const qScore = `SELECT AVG(ps.score) as average_score FROM participant_submissions ps ${subFilter}`;

            const [resT, resP, resPart, resS] = await Promise.all([
                pool.query(qTrainings, params),
                pool.query(qPartners, params),
                pool.query(qParticipants, params),
                pool.query(qScore, params)
            ]);

            const stats = {
                trainings: parseInt(resT.rows[0].count),
                partners: parseInt(resP.rows[0].count),
                participants: parseInt(resPart.rows[0].count),
                score: parseFloat(resS.rows[0].average_score || 0).toFixed(1)
            };

            const scoresByTheme = isState 
                ? await predictionService.getScoresByTheme(userState) 
                : await predictionService.getScoresByTheme();
            
            const gaps = isState 
                ? await predictionService.calculateGaps(userState) 
                : await predictionService.calculateGaps();

            // 2. AI OVERVIEW (Modified)
            let summary = "AI Overview unavailable.";
            try {
                const prompt = `Write a strictly formal executive summary (max 35 words) for the ${isState ? userState : 'National'} Disaster Readiness Report. Stats: ${stats.trainings} trainings, ${stats.score}% avg score.`;
                const result = await model.generateContent(prompt);
                summary = (await result.response).text().replace(/\n/g, " ");
            } catch(e) { console.error("AI Error:", e); }

            // 3. PDF GENERATION
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            const title = isState ? `${userState.toUpperCase()} READINESS REPORT` : 'NATIONAL READINESS REPORT';
            
            res.setHeader('Content-disposition', `attachment; filename="${title.replace(/ /g, '_')}.pdf"`);
            res.setHeader('Content-type', 'application/pdf');
            doc.pipe(res);

            // -- RENDER PAGE --
            drawHeader(doc, title, "OFFICIAL DISASTER MANAGEMENT REPORT");

            // Section: AI Overview (Renamed)
            drawSectionHeader(doc, "AI Overview");
            doc.rect(50, doc.y, 500, 40).fill(theme.lightBg); 
            doc.rect(50, doc.y, 3, 40).fill(theme.primary);  
            doc.fillColor(theme.primary).fontSize(9).font('Helvetica').text(summary, 60, doc.y + 10, { width: 480, align: 'justify' });
            doc.y += 20;

            // Section: Key Metrics
            drawSectionHeader(doc, "Key Metrics");
            drawKPIStrip(doc, [
                { label: "TRAININGS", value: stats.trainings },
                { label: "PARTICIPANTS", value: stats.participants },
                { label: "PARTNERS", value: stats.partners },
                { label: "SCORE", value: `${stats.score}%` }
            ]);

            // Section: Performance
            drawSectionHeader(doc, "Performance Analysis");
            const chartData = scoresByTheme.map(s => ({ label: s.theme, value: s.average_score }));
            drawDashboardCharts(doc, stats.score, chartData);

            // Section: Priority Areas (Updated with Justification)
            drawSectionHeader(doc, "Priority Attention Areas");
            if (gaps.length > 0) {
                // Including the reason for prioritization
                const rows = gaps.slice(0, 10).map((g, i) => [
                    (i + 1).toString(),
                    g.theme,
                    g.district || 'All Districts',
                    parseFloat(g.priorityScore).toFixed(1),
                    g.reason || 'N/A' // Added Justification
                ]);
                // Adjusted widths: #, Theme, District, Score, Justification
                drawTable(doc, ['#', 'THEME', 'DISTRICT', 'SCORE', 'JUSTIFICATION'], rows, [25, 75, 80, 40, 280]);
            } else {
                doc.fontSize(10).text("No critical gaps identified at this time.");
            }

            // Footer
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#9CA3AF').text(`Page ${i + 1} of ${range.count} | SAJAG Platform`, 50, 800, { align: 'center', width: 500 });
            }

            doc.end();

        } catch (error) {
            console.error('Report Gen Error:', error);
            res.status(500).send('Internal Server Error generating report');
        }
    }
};

module.exports = reportController;