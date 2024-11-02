const express = require('express');
const fs = require('fs');
const ical = require('ical');
const path = require('path');
const app = express();

// Serve static files (like index.html) from the current directory
app.use(express.static(__dirname));

// Route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'calendar.html'));
});

// Helper function to parse time in 24-hour format
function parseTime(eventTime) {
    let hours = eventTime.getHours().toString().padStart(2, '0');
    let minutes = eventTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Helper function to calculate free times from events
function calculateFreeTimes(events) {
    const dayStart = 0; // 00:00
    const dayEnd = 1440; // 24:00
    const freeTimes = {};

    // Initialize each day of the week with full availability (00:00 to 23:59)
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
        freeTimes[day] = [{ start: dayStart, end: dayEnd }];
    });

    // Loop over each event and subtract the event time from the free time slots
    events.forEach(event => {
        const day = event.start.toLocaleDateString('en-US', { weekday: 'long' });
        const eventStart = event.start.getHours() * 60 + event.start.getMinutes();
        const eventEnd = event.end.getHours() * 60 + event.end.getMinutes();

        const dayFreeTimes = freeTimes[day] || [];
        let updatedFreeTimes = [];

        dayFreeTimes.forEach(slot => {
            if (eventStart >= slot.end || eventEnd <= slot.start) {
                // No overlap, keep this slot
                updatedFreeTimes.push(slot);
            } else {
                // Split the slot if there's an overlap
                if (eventStart > slot.start) {
                    updatedFreeTimes.push({ start: slot.start, end: eventStart });
                }
                if (eventEnd < slot.end) {
                    updatedFreeTimes.push({ start: eventEnd, end: slot.end });
                }
            }
        });

        freeTimes[day] = updatedFreeTimes;
    });

    return freeTimes;
}

// Function to format free times for JSON export
function formatFreeTimesForExport(freeTimes) {
    const formattedFreeTimes = {};
    for (const day in freeTimes) {
        formattedFreeTimes[day] = freeTimes[day].map(slot => ({
            start: `${Math.floor(slot.start / 60).toString().padStart(2, '0')}:${(slot.start % 60).toString().padStart(2, '0')}`,
            end: `${Math.floor(slot.end / 60).toString().padStart(2, '0')}:${(slot.end % 60).toString().padStart(2, '0')}`
        }));
    }
    return formattedFreeTimes;
}

// Parse ICS file, calculate free times, and export to JSON
function parseICSAndExportFreeTimes() {
    const icsFilePath = './coursesCalendar.ics';
    const icsFileContent = fs.readFileSync(icsFilePath, 'utf-8');
    const events = ical.parseICS(icsFileContent);
    const parsedEvents = [];

    // Parse events from the ICS file
    for (const key in events) {
        const event = events[key];
        if (event.type === 'VEVENT') {
            parsedEvents.push({
                start: new Date(event.start),
                end: new Date(event.end),
                summary: event.summary,
                location: event.location,
            });
        }
    }

    // Calculate free times
    const freeTimes = calculateFreeTimes(parsedEvents);
    
    // Format free times for export
    const formattedFreeTimes = formatFreeTimesForExport(freeTimes);

    // Export free times to JSON file
    const jsonFilePath = './free_times.json';
    fs.writeFileSync(jsonFilePath, JSON.stringify(formattedFreeTimes, null, 2));
    console.log(`Free times exported to ${jsonFilePath}`);

    // Print free times in terminal
    console.log('Free times for each day:');
    for (const day in formattedFreeTimes) {
        console.log(`${day}:`);
        formattedFreeTimes[day].forEach(slot => {
            console.log(`  Free from ${slot.start} to ${slot.end}`);
        });
    }
}

// Parse ICS and export free times when the server starts
parseICSAndExportFreeTimes();

// Route to serve events as JSON
app.get('/getEvents', (req, res) => {
    const icsFilePath = './coursesCalendar.ics';
    const icsFileContent = fs.readFileSync(icsFilePath, 'utf-8');
    const events = ical.parseICS(icsFileContent);
    const parsedEvents = [];

    for (const key in events) {
        const event = events[key];
        if (event.type === 'VEVENT') {
            parsedEvents.push({
                start: new Date(event.start),
                end: new Date(event.end),
                summary: event.summary,
                location: event.location,
            });
        }
    }

    res.json(parsedEvents);  // Return parsed events as JSON
});