const { google } = require('googleapis');
const path = require('path');

// Load credentials
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../credentials.json'), // Path to your key
    scopes: ['https://www.googleapis.com/auth/forms.responses.readonly', 'https://www.googleapis.com/auth/forms.body.readonly'],
});

const forms = google.forms({ version: 'v1', auth });

const googleFormService = {
    /**
     * Fetch all responses and calculate which questions were answered wrongly most often.
     * @param {string} formId - The Google Form ID (extracted from link).
     */
    async getTopWrongQuestions(formId) {
        try {
            // 1. Fetch Form Metadata (To get Question Text & Correct Answers)
            const formRes = await forms.forms.get({ formId });
            const formInfo = formRes.data;

            // Create a map of QuestionID -> {text, correctOptionId}
            const questionMap = {};
            
            formInfo.items.forEach(item => {
                // Only look at questions with grading (Quizzes)
                if (item.questionItem && item.questionItem.question.grading) {
                    const q = item.questionItem.question;
                    const correctAns = q.grading.correctAnswers.answers[0].value; // Assuming single correct answer for now
                    
                    questionMap[q.questionId] = {
                        text: item.title,
                        correctAnswer: correctAns,
                        wrongCount: 0,
                        totalAttempts: 0
                    };
                }
            });

            // 2. Fetch All Responses (Student Submissions)
            const responseRes = await forms.forms.responses.list({ formId });
            const responses = responseRes.data.responses || [];

            // 3. Analyze Responses
            responses.forEach(response => {
                if (!response.answers) return;

                Object.values(response.answers).forEach(answer => {
                    const qId = answer.questionId;
                    
                    // If we are tracking this question
                    if (questionMap[qId]) {
                        questionMap[qId].totalAttempts++;
                        
                        // Check if answer matches correct answer
                        // Note: Google returns textAnswers or value based on question type. 
                        // For simplicity, we check if the selected option matches the correct one.
                        const userAnswer = answer.textAnswers.answers[0].value;
                        
                        if (userAnswer !== questionMap[qId].correctAnswer) {
                            questionMap[qId].wrongCount++;
                        }
                    }
                });
            });

            // 4. Convert to Array and Sort by Wrong Count
            const analysisResult = Object.values(questionMap)
                .map(q => ({
                    question: q.text,
                    wrongCount: q.wrongCount,
                    totalAttempts: q.totalAttempts,
                    wrongPercentage: q.totalAttempts > 0 ? ((q.wrongCount / q.totalAttempts) * 100).toFixed(1) : 0
                }))
                .sort((a, b) => b.wrongCount - a.wrongCount) // Highest wrong count first
                .slice(0, 5); // Return top 5

            return analysisResult;

        } catch (error) {
            console.error('Error analyzing Google Form data:', error);
            throw new Error('Failed to fetch assessment data from Google.');
        }
    },

    /**
     * Helper to extract Form ID from a standard Google Form URL
     */
    extractFormId(url) {
        // Matches .../d/e/{FORM_ID}/viewform or .../d/{FORM_ID}/edit
        const regex = /\/d\/([a-zA-Z0-9-_]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
};

module.exports = googleFormService;