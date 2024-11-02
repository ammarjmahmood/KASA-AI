// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public', {index: 'onboardingform.html'}));

function createUserIdentifier(name, email) {
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${email.toLowerCase().replace(/[^a-z0-9@.]/g, '_')}`;
}

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
                submissionDate: new Date().toISOString()
            },
            destinationInfo: {
                country: userData.destinationCountry,
                city: userData.destinationCity
            },
            immigrationStatus: userData.immigrationStatus,
            languageInfo: {
                knownLanguages: userData.languages || [],
                destinationLanguage: userData.destinationLanguage
            },
            goals: {
                primary: userData.goals || [],
                specific: userData.specificGoals
            },
            professionalInfo: {
                linkedin: userData.linkedin || '',
                certifications: userData.certifications || [],
                resumeProvided: !!userData.resume
            },
            needs: {
                timeline: userData.timeline,
                assistanceRequired: userData.assistance || []
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});