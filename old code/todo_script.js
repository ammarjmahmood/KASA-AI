// Goal data with improved structure
const goals = [
    {
        id: 1,
        title: "Electrical Engineering at Seneca College",
        type: "professional",
        steps: [
            {
                text: "Complete Online Application",
                link: "https://www.senecacollege.ca/apply",
                completed: false
            },
            {
                text: "Gather Academic References",
                link: "https://www.senecacollege.ca/admissions/references",
                completed: false
            },
            {
                text: "Submit Required Documents",
                link: "https://www.senecacollege.ca/admissions/documents",
                completed: false
            }
        ]
    },
    {
        id: 2,
        title: "Find Housing in Toronto",
        type: "personal",
        steps: [
            {
                text: "Research Neighborhoods",
                link: "https://www.toronto.ca/neighborhoods",
                completed: false
            },
            {
                text: "Calculate Budget & Get Pre-Approved",
                link: "https://www.canada.ca/mortgage-calculator",
                completed: false
            },
            {
                text: "Connect with a Realtor",
                link: "https://www.realtor.ca",
                completed: false
            }
        ]
    },
    {
        id: 3,
        title: "Learn English Language",
        type: "personal",
        steps: [
            {
                text: "Start Duolingo Course",
                link: "https://www.duolingo.com",
                completed: false
            },
            {
                text: "Join Local Language Exchange",
                link: "https://www.meetup.com/language-exchange",
                completed: false
            },
            {
                text: "Practice with Language Partner",
                link: "https://www.tandem.net",
                completed: false
            }
        ]
    }
];

// DOM Elements
const goalList = document.getElementById('goalList');
const goalFilter = document.getElementById('goalFilter');
const specificGoalType = document.getElementById('specificGoalType');
const progressMeters = document.getElementById('progressMeters');
const themeToggle = document.getElementById('themeToggle');

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('kasaGoals', JSON.stringify(goals));
    localStorage.setItem('kasaTheme', document.body.classList.contains('dark-mode'));
}

function loadFromLocalStorage() {
    // Load Goals
    const savedGoals = localStorage.getItem('kasaGoals');
    if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        goals.forEach((goal, index) => {
            if (parsedGoals[index]) {
                goal.steps = parsedGoals[index].steps;
            }
        });
    }

    // Load Theme
    const savedTheme = localStorage.getItem('kasaTheme');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeToggleButton(true);
    }
}

// Initialize specific goal filter with animation
function initializeSpecificGoalFilter() {
    specificGoalType.innerHTML = `
        <option value="" disabled selected>Select Specific Goal</option>
        ${goals.map((goal, index) => `
            <option value="${goal.id}">Goal ${index + 1}: ${goal.title}</option>
        `).join('')}
    `;
    
    specificGoalType.style.display = 'none';
    specificGoalType.style.opacity = '0';
    specificGoalType.style.transform = 'translateY(-10px)';
}

// Filter goals based on selected options
function filterGoals() {
    const filterValue = goalFilter.value;
    const specificType = specificGoalType.value;
    
    // Handle specific goal type selector visibility
    if (filterValue === 'specific') {
        specificGoalType.style.display = 'block';
        setTimeout(() => {
            specificGoalType.style.opacity = '1';
            specificGoalType.style.transform = 'translateY(0)';
        }, 10);
    } else {
        specificGoalType.style.opacity = '0';
        specificGoalType.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            specificGoalType.style.display = 'none';
        }, 300);
    }
    
    // Filter goals
    let filteredGoals = goals;
    if (filterValue === 'specific' && specificType) {
        filteredGoals = goals.filter(goal => goal.id === parseInt(specificType));
    } else if (filterValue !== 'all') {
        filteredGoals = goals.filter(goal => goal.type === filterValue);
    }
    
    // Animate transition
    goalList.style.opacity = '0';
    setTimeout(() => {
        renderGoals(filteredGoals);
        setTimeout(() => {
            goalList.style.opacity = '1';
        }, 100);
    }, 300);
}

// Render goals to the page
function renderGoals(goalsToRender) {
    goalList.innerHTML = '';
    
    goalsToRender.forEach((goal, index) => {
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.style.opacity = '0';
        goalCard.style.transform = 'translateY(20px)';
        
        const goalContent = `
            <h2 class="goal-title">
                <i class="fas ${goal.type === 'personal' ? 'fa-house-user' : 'fa-briefcase'}"></i>
                Goal ${index + 1}: ${goal.title}
            </h2>
            <div class="step-list">
                ${goal.steps.map((step, stepIndex) => `
                    <div class="step-item ${step.completed ? 'completed' : ''}" 
                         style="opacity: 0; transform: translateX(-20px);">
                        <input 
                            type="checkbox" 
                            class="step-checkbox" 
                            ${step.completed ? 'checked' : ''}
                            onchange="toggleStep(${goal.id}, ${stepIndex})"
                        >
                        <span class="step-text">${step.text}</span>
                        <a href="${step.link}" target="_blank" class="step-link">
                            Resources
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
        
        goalCard.innerHTML = goalContent;
        goalList.appendChild(goalCard);
        
        // Animate goal card entrance
        setTimeout(() => {
            goalCard.style.transition = 'all 0.5s ease';
            goalCard.style.opacity = '1';
            goalCard.style.transform = 'translateY(0)';
            
            // Animate step items
            const stepItems = goalCard.querySelectorAll('.step-item');
            stepItems.forEach((item, i) => {
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, i * 100);
            });
        }, index * 100);
    });
    
    updateProgressMeters();
}

// Toggle step completion
function toggleStep(goalId, stepIndex) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        goal.steps[stepIndex].completed = !goal.steps[stepIndex].completed;
        
        // Animate the checkbox and step item
        const stepItem = document.querySelector(`[data-goal-id="${goalId}"] .step-item:nth-child(${stepIndex + 1})`);
        if (stepItem) {
            stepItem.classList.toggle('completed');
            stepItem.style.transition = 'all 0.3s ease';
            stepItem.style.transform = 'scale(1.02)';
            setTimeout(() => {
                stepItem.style.transform = 'scale(1)';
            }, 200);
        }
        
        updateProgressMeters();
        saveToLocalStorage();
    }
}

// Update progress meters
function updateProgressMeters() {
    progressMeters.innerHTML = '';
    
    goals.forEach((goal, index) => {
        const completedSteps = goal.steps.filter(step => step.completed).length;
        const progress = (completedSteps / goal.steps.length) * 100;
        
        const meterHtml = `
            <div class="progress-meter">
                <span class="meter-label">
                    <span>
                        <i class="fas ${goal.type === 'personal' ? 'fa-house-user' : 'fa-briefcase'}"></i>
                        Goal ${index + 1}
                    </span>
                    <span>${progress.toFixed(0)}%</span>
                </span>
                <div class="meter-container">
                    <div class="meter-fill" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        progressMeters.insertAdjacentHTML('beforeend', meterHtml);
        
        // Animate the progress bar
        setTimeout(() => {
            const meterFill = progressMeters.lastElementChild.querySelector('.meter-fill');
            meterFill.style.transition = 'width 0.5s ease-out';
            meterFill.style.width = `${progress}%`;
        }, 100);
    });
}

// Update theme toggle button
function updateThemeToggleButton(isDark) {
    const icon = themeToggle.querySelector('i');
    if (isDark) {
        icon.className = 'fas fa-sun';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

// Theme toggle handler
themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    updateThemeToggleButton(isDark);
    saveToLocalStorage();
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const focusedElement = document.activeElement;
        if (focusedElement) {
            focusedElement.blur();
        }
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeSpecificGoalFilter();
    renderGoals(goals);
    
    // Add event listeners
    goalFilter.addEventListener('change', filterGoals);
    specificGoalType.addEventListener('change', filterGoals);
    
    // Check for saved theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && !localStorage.getItem('kasaTheme')) {
        document.body.classList.add('dark-mode');
        updateThemeToggleButton(true);
    }
});

// Handle print events
window.addEventListener('beforeprint', () => {
    document.body.classList.remove('dark-mode');
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        loadFromLocalStorage();
        renderGoals(goals);
    }
});