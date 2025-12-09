// src/controllers/chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Key .env file se lenge
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configure karein
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are 'Sajag Sahayak', an AI assistant for the SAJAG National Disaster Readiness Platform. 
    Your strict role is to answer questions ONLY related to:
    1. Natural and man-made disasters (Floods, Earthquakes, Cyclones, Fire, Tsunami, Landslides, etc.).
    2. Disaster preparedness, safety drills, emergency kits, and first aid.
    3. Emergency contacts, government guidelines (NDMA), and evacuation procedures.
    
    CRITICAL RULE: If a user asks about ANYTHING else (like movies, coding, jokes, politics, general chat, homework, recipes), you MUST refuse politely. 
    Say: "Namaste! I am Sajag Sahayak, designed only to assist with disaster preparedness and safety related queries. Please ask me about safety guidelines or disaster management."
    
    Keep your answers concise, helpful, and life-saving. Use bullet points where possible for readability.`
});

exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Chat session start karein
        const chat = model.startChat({
            history: [],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        res.json({ reply: response });

    } catch (error) {
        console.error("AI Chat Error:", error);
        
        // Agar API Key missing ya galat hai to error handle karein
        if (error.message.includes('API key')) {
            return res.status(500).json({ error: "Server Error: API Key configuration missing." });
        }
        
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
};