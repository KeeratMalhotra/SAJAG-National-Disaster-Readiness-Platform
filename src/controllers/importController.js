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
    const adminUser = req.user; // Retrieved from protectRoute middleware
    
    // Arrays to track results
    const successRows = [];
    const errorRows = [];
    let rowNumber = 0;

    // 2. Parse CSV and perform Basic Validation
    const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            rowNumber++;
            
            // Check for required fields
            const requiredFields = ['title', 'theme', 'start_date', 'end_date', 'location_text', 'creator_email'];
            const missing = requiredFields.filter(field => !row[field]);

            if (missing.length > 0) {
                errorRows.push(`Row ${rowNumber}: Missing required fields - ${missing.join(', ')}`);
                return; // Skip this row
            }

            // Basic Date format validation
            if (isNaN(new Date(row.start_date).getTime()) || isNaN(new Date(row.end_date).getTime())) {
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
                // We do NOT start a transaction for the whole batch (No 'BEGIN').
                // We want valid rows to be saved even if others fail.

                for (const record of successRows) {
                    try {
                        const email = record.creator_email.trim().toLowerCase();
                        
                        // Find the Training Partner
                        const creator = await User.findByEmail(email);

                        // --- DATABASE LEVEL CHECKS ---
                        if (!creator) {
                            throw new Error(`Creator email '${email}' not found.`);
                        }
                        if (creator.role !== 'training_partner') {
                            throw new Error(`User '${email}' is not a Training Partner.`);
                        }
                        if (creator.status !== 'active') {
                            throw new Error(`Partner account '${email}' is inactive.`);
                        }
                        
                        // Security Check: SDMA Admin can only import for their state's partners
                        if (adminUser.role === 'sdma_admin' && creator.state !== adminUser.state) {
                            throw new Error(`Permission Denied: Cannot import for partner in ${creator.state}.`);
                        }

                        // --- INSERTION ---
                        const insertQuery = `
                            INSERT INTO trainings (title, theme, start_date, end_date, location_text, latitude, longitude, creator_user_id)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        `;
                        const values = [
                            record.title,
                            record.theme,
                            record.start_date,
                            record.end_date,
                            record.location_text,
                            record.latitude ? parseFloat(record.latitude) : null,
                            record.longitude ? parseFloat(record.longitude) : null,
                            creator.id
                        ];
                        
                        await client.query(insertQuery, values);
                        insertedCount++;

                    } catch (rowError) {
                        // Catch individual row errors (e.g., User not found, DB constraint)
                        // Add specific error message to our list
                        errorRows.push(`Row ${record.rowNumber}: ${rowError.message}`);
                    }
                }

                // Send Final Report to Frontend
                res.status(200).json({
                    message: 'Import process completed.',
                    successCount: insertedCount,
                    errorCount: errorRows.length,
                    errors: errorRows // List of specific errors for the user to see
                });

            } catch (err) {
                console.error('System Error during bulk import:', err);
                res.status(500).json({ message: 'Internal Server Error processing batch.' });
            } finally {
                client.release();
                // Cleanup: Delete the uploaded CSV file
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
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