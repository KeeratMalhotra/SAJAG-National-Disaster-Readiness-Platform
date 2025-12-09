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