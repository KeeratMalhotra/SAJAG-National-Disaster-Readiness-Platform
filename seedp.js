require('dotenv').config();
const { Client } = require('pg');

// --- CUSTOM NAME GENERATOR (If you don't want to install faker) ---
const firstNames = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Anika", "Navya", "Angel", "Myra", "Saira",
    "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha", "Rohit", "Pooja", "Suresh", "Riya"
];
const lastNames = [
    "Kumar", "Singh", "Sharma", "Patel", "Gupta", "Mishra", "Yadav", "Das", "Reddy", "Nair",
    "Kapoor", "Khan", "Joshi", "Mehta", "Malhotra", "Bhatia", "Verma", "Chopra", "Desai", "Rao"
];

function getRandomName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 9999)}@example.com`
    };
}

// --- MAIN SCRIPT ---
async function seedParticipants() {
    // 1. Database Connection
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Render/Cloud DBs
    });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        // 2. Fetch all Trainings
        const trainingsRes = await client.query('SELECT id, title, theme FROM trainings');
        const trainings = trainingsRes.rows;
        console.log(`📋 Found ${trainings.length} trainings.`);

        // 3. Fetch all Assessments (to link by theme)
        const assessmentsRes = await client.query('SELECT id, training_theme FROM assessments');
        const assessments = assessmentsRes.rows;
        
        // Create a lookup map: Theme -> Assessment ID
        const assessmentMap = {};
        assessments.forEach(a => {
            assessmentMap[a.training_theme] = a.id;
        });

        // 4. Generate & Insert Participants
        let totalInserted = 0;

        for (const training of trainings) {
            const assessmentId = assessmentMap[training.theme];

            if (!assessmentId) {
                console.warn(`⚠️ Skipping training "${training.title}" - No assessment found for theme "${training.theme}"`);
                continue;
            }

            // Randomly decide between 20 to 25 participants
            const count = Math.floor(Math.random() * (25 - 20 + 1)) + 20;
            const values = [];

            for (let i = 0; i < count; i++) {
                const person = getRandomName();
                // Generate a realistic score (skewed towards passing > 60)
                const score = Math.floor(Math.random() * 40) + 60; 
                
                // SQL Parameters: (training_id, participant_email, assessment_id, score)
                values.push(`('${training.id}', '${person.email}', '${assessmentId}', ${score})`);
            }

            if (values.length > 0) {
                const insertQuery = `
                    INSERT INTO participant_submissions (training_id, participant_email, assessment_id, score)
                    VALUES ${values.join(', ')}
                    ON CONFLICT (training_id, participant_email) DO NOTHING;
                `;
                
                await client.query(insertQuery);
                totalInserted += values.length;
                console.log(`✅ Added ${values.length} participants to "${training.title}"`);
            }
        }

        console.log(`\n🎉 SUCCESS: Inserted approximately ${totalInserted} participant records.`);

    } catch (error) {
        console.error('❌ Error seeding participants:', error);
    } finally {
        await client.end();
    }
}

seedParticipants();