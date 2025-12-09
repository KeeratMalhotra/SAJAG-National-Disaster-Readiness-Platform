const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('../config/database');
const User = require('../models/User');

const bulkImportTrainings = async (req, res) => {
    // 1. Check if file is uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file was uploaded.' });
    }

    const filePath = req.file.path;
    const adminUser = req.user; 
    
    // Arrays to track results
    const successRows = [];
    const errorRows = [];
    let rowNumber = 0;

    // 2. Parse CSV and perform Basic Validation
    const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            rowNumber++;
            
            // UPDATED: Match the input names from the "New Training" form
            // 'creator_email' is still required for mapping the user
            const requiredFields = ['title', 'theme', 'startDate', 'endDate', 'location', 'creator_email'];
            const missing = requiredFields.filter(field => !row[field]);

            if (missing.length > 0) {
                errorRows.push(`Row ${rowNumber}: Missing required fields - ${missing.join(', ')}`);
                return; // Skip this row
            }

            // Basic Date format validation
            if (isNaN(new Date(row.startDate).getTime()) || isNaN(new Date(row.endDate).getTime())) {
                errorRows.push(`Row ${rowNumber}: Invalid Date format.`);
                return; 
            }

            // If basic checks pass, add to processing queue
            successRows.push({ ...row, rowNumber });
        })
        .on('end', async () => {
            const client = await pool.connect();
            let insertedCount = 0;

            try {
                for (const record of successRows) {
                    try {
                        const email = record.creator_email.trim().toLowerCase();
                        
                        // Find the Training Partner
                        const creator = await User.findByEmail(email);

                        // --- DATABASE LEVEL CHECKS ---
                        if (!creator) throw new Error(`Creator email '${email}' not found.`);
                        if (creator.role !== 'training_partner') throw new Error(`User '${email}' is not a Training Partner.`);
                        if (creator.status !== 'active') throw new Error(`Partner account '${email}' is inactive.`);
                        
                        // Security Check
                        if (adminUser.role === 'sdma_admin' && creator.state !== adminUser.state) {
                            throw new Error(`Permission Denied: Cannot import for partner in ${creator.state}.`);
                        }

                        // --- INSERTION (Mapping CSV fields to DB columns) ---
                        const insertQuery = `
                            INSERT INTO trainings (title, theme, start_date, end_date, location_text, latitude, longitude, creator_user_id)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        `;
                        const values = [
                            record.title,
                            record.theme,
                            record.startDate, // Maps to start_date
                            record.endDate,   // Maps to end_date
                            record.location,  // Maps to location_text
                            record.latitude ? parseFloat(record.latitude) : null,
                            record.longitude ? parseFloat(record.longitude) : null,
                            creator.id
                        ];
                        
                        await client.query(insertQuery, values);
                        insertedCount++;

                    } catch (rowError) {
                        errorRows.push(`Row ${record.rowNumber}: ${rowError.message}`);
                    }
                }

                // Send Final Report to Frontend
                res.status(200).json({
                    message: 'Import process completed.',
                    successCount: insertedCount,
                    errorCount: errorRows.length,
                    errors: errorRows 
                });

            } catch (err) {
                console.error('System Error during bulk import:', err);
                res.status(500).json({ message: 'Internal Server Error processing batch.' });
            } finally {
                client.release();
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        })
        .on('error', (err) => {
            console.error('CSV Stream Error:', err);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            res.status(500).json({ message: 'Failed to read or process the CSV file.' });
        });
};

module.exports = {
    bulkImportTrainings
};