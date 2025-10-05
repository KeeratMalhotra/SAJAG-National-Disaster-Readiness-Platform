const fs = require('fs');
const csv = require('csv-parser');
const Training = require('../models/Training');

const importController = {
    importTrainings: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No CSV file was uploaded.' });
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;
        const filePath = req.file.path;

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // We've read the whole file, now process the records
                for (const row of results) {
                    try {
                        // Basic validation
                        if (!row.title || !row.theme || !row.start_date || !row.end_date || !row.location_text) {
                            throw new Error('Missing required fields');
                        }

                        // For simplicity, we'll associate the training with the logged-in admin
                        await Training.create({
                            title: row.title,
                            theme: row.theme,
                            startDate: row.start_date,
                            endDate: row.end_date,
                            location: row.location_text
                        }, req.user.id);

                        successCount++;
                    } catch (error) {
                        console.error('Error processing row:', row, error);
                        errorCount++;
                    }
                }

                // Clean up the uploaded file
                fs.unlinkSync(filePath);

                // Send back the report
                res.status(200).json({
                    message: 'Import process complete.',
                    successCount: successCount,
                    errorCount: errorCount
                });
            });
    }
};

module.exports = importController;