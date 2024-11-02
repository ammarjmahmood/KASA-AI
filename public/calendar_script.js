let currentDate = new Date();
let currentView = 'day';
let events = []; // This will store the parsed events from the ICS file

const dayView = document.getElementById('dayView');
const weekView = document.getElementById('weekView');
const prevDate = document.getElementById('prevDate');
const nextDate = document.getElementById('nextDate');
const currentDateElem = document.getElementById('currentDate');
const calendarTitle = document.getElementById('calendarTitle');
const calendarBody = document.getElementById('calendarBody');

function parseICSDate(icsDate) {
    const year = parseInt(icsDate.substr(0, 4));
    const month = parseInt(icsDate.substr(4, 2)) - 1; // Month is 0-indexed in JavaScript
    const day = parseInt(icsDate.substr(6, 2));
    const hour = parseInt(icsDate.substr(9, 2));
    const minute = parseInt(icsDate.substr(11, 2));
    return new Date(year, month, day, hour, minute);
}

function parseICS(icsData) {
    const lines = icsData.split('\n');
    let currentEvent = null;
    const parsedEvents = [];

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent) {
                parsedEvents.push(currentEvent);
                currentEvent = null;
            }
        } else if (currentEvent) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':'); // Rejoin in case there are colons in the value
            if (key === 'SUMMARY') {
                currentEvent.summary = value;
            } else if (key.startsWith('DTSTART')) {
                currentEvent.start = parseICSDate(value);
            } else if (key.startsWith('DTEND')) {
                currentEvent.end = parseICSDate(value);
            } else if (key === 'LOCATION') {
                currentEvent.location = value;
            } else if (key === 'RRULE') {
                currentEvent.rrule = parseRRule(value);
            }
        }
    }

    return parsedEvents;
}

function parseRRule(rruleString) {
    const parts = rruleString.split(';');
    const rrule = {};
    parts.forEach(part => {
        const [key, value] = part.split('=');
        rrule[key] = value;
    });
    return rrule;
}

function fetchICSFile() {
    return fetch('coursesCalendar.ics')
        .then(response => response.text())
        .then(icsData => {
            events = parseICS(icsData);
            updateCalendar();
        })
        .catch(error => {
            console.error('Error fetching ICS file:', error);
            alert('Failed to load calendar data. Please try again later.');
        });
}

function isMobileDevice() {
    return window.innerWidth <= 768; // Adjust this value as needed
}

function setViewBasedOnScreenSize() {
    if (isMobileDevice()) {
        currentView = 'day';
        dayView.classList.add('active');
        weekView.classList.remove('active');
    }
}

function updateCalendar() {
    setViewBasedOnScreenSize();
    
    currentDateElem.textContent = currentDate.toDateString();
    calendarTitle.textContent = currentView === 'day' ? currentDate.toDateString() : `Week of ${currentDate.toDateString()}`;
    
    let calendarContent = '<div class="time-column">';
    for (let i = 0; i < 24; i++) {
        calendarContent += `<div class="time-slot">${i.toString().padStart(2, '0')}:00</div>`;
    }
    calendarContent += '</div>';

    const daysToShow = currentView === 'day' ? 1 : 7;
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - (currentView === 'day' ? 0 : currentDate.getDay()));

    for (let i = 0; i < daysToShow; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        calendarContent += `
            <div class="day-column">
                <div class="day-header">${day.toDateString()}</div>
                <div class="event-container" data-date="${day.toISOString().split('T')[0]}">
                    <!-- Events will be dynamically added here -->
                </div>
            </div>
        `;
    }

    calendarBody.innerHTML = calendarContent;

    addEventsToCalendar();
}

function addEventsToCalendar() {
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    if (currentView === 'week') {
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        endDate.setDate(startDate.getDate() + 6);
    }

    events.forEach(event => {
        const occurrences = getEventOccurrences(event, startDate, endDate);
        occurrences.forEach(occurrence => {
            addEventToDay(occurrence);
        });
    });
}

function getEventOccurrences(event, startDate, endDate) {
    const occurrences = [];
    let currentDate = new Date(event.start);

    while (currentDate <= endDate) {
        if (currentDate >= startDate && currentDate <= endDate) {
            const eventStart = new Date(currentDate);
            const eventEnd = new Date(eventStart.getTime() + (event.end - event.start));
            
            occurrences.push({
                summary: event.summary,
                location: event.location,
                start: eventStart,
                end: eventEnd
            });
        }

        if (event.rrule && event.rrule.FREQ === 'WEEKLY') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            break; // Non-recurring event
        }

        if (event.rrule && event.rrule.UNTIL) {
            const untilDate = parseICSDate(event.rrule.UNTIL);
            if (currentDate > untilDate) break;
        }
    }

    return occurrences;
}

function addEventToDay(event) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const eventDate = eventStart.toISOString().split('T')[0];
    const eventContainer = document.querySelector(`.event-container[data-date="${eventDate}"]`);
    
    if (eventContainer) {
        const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
        let durationMinutes = (eventEnd - eventStart) / (1000 * 60);

        // Handle events that go past midnight
        if (durationMinutes > 1440) {
            durationMinutes = 1440 - startMinutes; // Clip to end of day
        }

        const eventElement = document.createElement('div');
        eventElement.className = 'event';
        eventElement.style.top = `${startMinutes}px`;
        eventElement.style.height = `${durationMinutes}px`;
        
        // Truncate event summary for better mobile display
        const truncatedSummary = event.summary.length > 15 ? event.summary.substring(0, 15) + '...' : event.summary;
        eventElement.innerHTML = `<strong>${truncatedSummary}</strong><br>${event.location}`;
        eventElement.title = `${event.summary}\n${event.location}`; // Full details on hover
        
        eventContainer.appendChild(eventElement);

        // If event goes past midnight, add to next day
        if (eventEnd.getDate() !== eventStart.getDate()) {
            const nextDayDate = new Date(eventStart);
            nextDayDate.setDate(nextDayDate.getDate() + 1);
            const nextDayEventStart = new Date(nextDayDate.setHours(0, 0, 0, 0));
            const nextDayEvent = {
                ...event,
                start: nextDayEventStart,
                end: eventEnd
            };
            addEventToDay(nextDayEvent);
        }
    }
}

dayView.addEventListener('click', () => {
    currentView = 'day';
    dayView.classList.add('active');
    weekView.classList.remove('active');
    updateCalendar();
});

weekView.addEventListener('click', () => {
    if (!isMobileDevice()) {
        currentView = 'week';
        weekView.classList.add('active');
        dayView.classList.remove('active');
        updateCalendar();
    }
});

prevDate.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - (currentView === 'day' ? 1 : 7));
    updateCalendar();
});

nextDate.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + (currentView === 'day' ? 1 : 7));
    updateCalendar();
});

window.addEventListener('resize', setViewBasedOnScreenSize);

fetchICSFile();