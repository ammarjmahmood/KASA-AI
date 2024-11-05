// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const axios = require('axios');
require('dotenv').config();

app.use(express.json());
app.use(express.static('public', {index: 'onboardingform.html'}));

function createUserIdentifier(name, email) {
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${email.toLowerCase().replace(/[^a-z0-9@.]/g, '_')}`;
}

// Load the first user's data from form_responses.json
async function loadFirstUserData() {
    try {
        const filePath = path.join(__dirname, 'data', 'form_responses.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const allResponses = JSON.parse(fileContent);
        const firstUser = Object.values(allResponses)[0]; // Get the first user
        return firstUser;
    } catch (error) {
        console.error('Error loading user data:', error);
        throw new Error('Could not load user data');
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const userData = await loadFirstUserData();

        // Prepare more focused context for ChatGPT
        const chatMessage = `User Context:
        - Name: ${userData.personalInfo.fullName}
        - Immigration Status: ${userData.immigrationStatus}
        - Location: ${userData.destinationInfo.city}, ${userData.destinationInfo.country}
        - Goals: ${userData.goals.specific}
        - Background: ${userData.personalInfo.bio}
        - Interests: ${userData.hobbies}
        - Skills: ${userData.professionalInfo.skills.join(', ')}
        - Languages: ${userData.languageInfo.knownLanguages.join(', ')}
        - Timeline: ${userData.needs.timeline}
        - Assistance Needed: ${userData.needs.assistanceRequired}
        
        Please provide a brief, practical response (3-4 sentences maximum) to their question while considering this context: ${userMessage}`;
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: "You are a concise AI assistant. If the users main language is not english respond in that language or in their language and then below english.Provide brief, practical advice focusing only on the most important points. Avoid using any special formatting or symbols. Keep responses to 10 clear sentences maximum, but still be detailed. You can already read all the content in the json file provided."
                },
                { role: "user", content: chatMessage }
            ],
            temperature: 0.7,
            max_tokens: 500  // Reduced for shorter responses
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`
            }
        });

        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to communicate with the ChatGPT API',
            details: error.message
        });
    }
});

app.post('/api/save-form-data', async (req, res) => {
    try {
        const { userData } = req.body;
        
        if (!userData.fullName || !userData.email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and email are required' 
            });
        }

        const filePath = path.join(__dirname, 'data', 'form_responses.json');
        
        // Create data directory if it doesn't exist
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        
        // Read existing data or create new object
        let allResponses = {};
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            allResponses = JSON.parse(fileContent);
        } catch (error) {
            console.log('Creating new responses file');
        }

        // Create unique identifier
        const userIdentifier = createUserIdentifier(userData.fullName, userData.email);

        // Structure the data
        allResponses[userIdentifier] = {
            personalInfo: {
                fullName: userData.fullName,
                email: userData.email,
                submissionDate: new Date().toISOString(),
                bio: userData.bio || '',  // New field for user bio
            },
            destinationInfo: {
                country: userData.destinationCountry,
                city: userData.destinationCity
            },
            hobbies: userData.hobbies || '',
            interests: {  // New structured interests section
                hobbies: userData.hobbies ? userData.hobbies.split(',').map(h => h.trim()) : [],
                skills: userData.skills || [],  // New field for skills/expertise
            },
            culturalGroup: userData.culturalGroup || '',
            courses: userData.courses || '',
            previousWork: userData.previousWork || '',
            immigrationReason: userData.immigrationReason || '',
            immigrationStatus: userData.immigrationStatus,
            connections: userData.connections || '',
            languageInfo: {
                knownLanguages: userData.languages || [],
                destinationLanguage: userData.destinationLanguage
            },
            goals: {
                type: userData.goals || [],
                specific: userData.specificGoals
            },
            professionalInfo: {
                linkedin: userData.linkedin || '',
                certifications: userData.certifications || [],
                resumeProvided: !!userData.resume,
                skills: userData.skills || [] // Professional skills from checkbox group
            },
            needs: {
                timeline: userData.timeline,
                assistanceRequired: userData.assistance || []
            },
            socialPreferences: {  // New section for social connectivity
                connectionMethod: userData.connectionMethod || '',
                contactPreference: userData.contactPreference || 'any',
            }
        };      
        
        // Write to file    
        await fs.writeFile(
            filePath, 
            JSON.stringify(allResponses, null, 2)
        );

        res.json({ 
            success: true, 
            message: 'Data saved successfully'
        });

    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save data' 
        });
    }
});

app.get('/api/save-form-data', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'form_responses.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const userData = JSON.parse(fileContent);
        res.json(userData);
    } catch (error) {
        console.error('Error reading user data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve user data' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});