const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('../config/database');
const User = require('../models/User');

const bulkImportTrainings = async (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file was uploaded.' });
    }

    const filePath = req.file.path;
    const adminUser = req.user;
    const records = [];
    let parsingError = null;
    let rowNumber = 0;

    const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            rowNumber++;
            // --- ROBUST VALIDATION AND SANITIZATION ---

            // 1. Check for required fields
            const requiredFields = ['title', 'theme', 'start_date', 'end_date', 'location_text', 'creator_email'];
            for (const field of requiredFields) {
                if (!row[field]) {
                    parsingError = `Validation Error: Missing required field '${field}' in row ${rowNumber}.`;
                    stream.destroy();
                    return;
                }
            }
            
            // 2. Sanitize and validate email
            row.creator_email = row.creator_email.trim().toLowerCase();

            // 3. Validate date formats (must be YYYY-MM-DD or similar)
            if (isNaN(new Date(row.start_date).getTime()) || isNaN(new Date(row.end_date).getTime())) {
                parsingError = `Validation Error: Invalid date format in row ${rowNumber}. Please use YYYY-MM-DD.`;
                stream.destroy();
                return;
            }

            // 4. Validate numeric fields if they exist
            if (row.latitude && isNaN(parseFloat(row.latitude))) {
                parsingError = `Validation Error: Latitude in row ${rowNumber} is not a valid number.`;
                stream.destroy();
                return;
            }
            if (row.longitude && isNaN(parseFloat(row.longitude))) {
                parsingError = `Validation Error: Longitude in row ${rowNumber} is not a valid number.`;
                stream.destroy();
                return;
            }

            records.push({ ...row, rowNumber });
        })
        .on('end', async () => {
            // If validation failed during streaming, respond and clean up
            if (parsingError) {
                fs.unlinkSync(filePath); // Clean up the uploaded file
                return res.status(400).json({ message: parsingError });
            }

            const client = await pool.connect();
            try {
                // Start a database transaction
                await client.query('BEGIN');

                for (const record of records) {
                    const creator = await User.findByEmail(record.creator_email);

                    // --- Detailed Validation and Security Checks ---
                    if (!creator) {
                        throw new Error(`Row ${record.rowNumber}: Creator with email '${record.creator_email}' not found in the database.`);
                    }
                    if (creator.role !== 'training_partner') {
                        throw new Error(`Row ${record.rowNumber}: User with email '${record.creator_email}' is not registered as a Training Partner.`);
                    }
                    if (creator.status !== 'active') {
                        throw new Error(`Row ${record.rowNumber}: Training Partner account for '${record.creator_email}' is not active.`);
                    }

                    // Security check: SDMA Admins can only import for partners in their state
                    if (adminUser.role === 'sdma_admin' && creator.state !== adminUser.state) {
                        throw new Error(`Row ${record.rowNumber}: As an admin for ${adminUser.state}, you cannot import data for a partner in ${creator.state}.`);
                    }

                    // --- Database Insertion ---
                    const insertQuery = `
                        INSERT INTO trainings (title, theme, start_date, end_date, location_text, latitude, longitude, creator_user_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
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
                }

                // If all insertions are successful, commit the transaction
                await client.query('COMMIT');
                res.status(200).json({ message: `Successfully imported ${records.length} trainings.` });

            } catch (error) {
                // If any error occurs, roll back the entire transaction
                await client.query('ROLLBACK');
                console.error('Bulk import transaction failed:', error);
                // Send a specific, user-friendly error message
                res.status(400).json({ message: error.message || 'An unexpected error occurred during the import process.' });
            } finally {
                // Release the database client and delete the uploaded file
                client.release();
                fs.unlinkSync(filePath);
            }
        })
        .on('error', (error) => {
            // Handle errors during file reading
            fs.unlinkSync(filePath);
            console.error('Error processing CSV:', error);
            res.status(500).json({ message: 'Failed to read or process the provided CSV file.' });
        });
};

module.exports = {
    bulkImportTrainings
};

