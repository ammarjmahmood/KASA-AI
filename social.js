document.addEventListener('DOMContentLoaded', function() {
    // Store connected users
    let myConnections = [];

    // Sample connection data organized by categories
    const connectionData = {
        cultural: [
            {
                name: 'Maria Rodriguez',
                origin: 'Mexico',
                tags: ['Culture', 'Food Enthusiast'],
                interests: ['Traditional Cooking', 'Language Exchange'],
                availability: 'Weekends',
                location: 'Downtown',
                instagram: '@maria_cooks_mx',
                bio: 'Teaching Mexican cooking while learning local cuisine!'
            },
            {
                name: 'Yuki Tanaka',
                origin: 'Japan',
                tags: ['Culture', 'Arts'],
                interests: ['Tea Ceremony', 'Local Art Scene'],
                availability: 'Evening',
                location: 'East Side',
                instagram: '@yuki.creates',
                bio: 'Artist bridging Japanese and local art styles'
            },
            {
                name: 'Ahmed Hassan',
                origin: 'Egypt',
                tags: ['Culture', 'Music'],
                interests: ['Middle Eastern Music', 'Local Festivals'],
                availability: 'Weekends',
                location: 'West End',
                instagram: '@ahmed_beats',
                bio: 'Musicians looking to blend cultural sounds'
            }
        ],
        professional: [
            {
                name: 'Dr. Priya Patel',
                origin: 'India',
                tags: ['Work', 'Healthcare'],
                interests: ['Medical Network', 'Professional Development'],
                availability: 'Evenings',
                location: 'Medical District',
                instagram: '@dr.priya_health',
                bio: 'Doctor helping medical professionals navigate local healthcare'
            },
            {
                name: 'Chen Wei',
                origin: 'China',
                tags: ['Work', 'Tech'],
                interests: ['Software Development', 'Tech Meetups'],
                availability: 'Flexible',
                location: 'Tech Hub',
                instagram: '@chen_codes',
                bio: 'Software engineer organizing tech immigrant meetups'
            }
        ],
        school: [
            {
                name: 'Sofia Kowalska',
                origin: 'Poland',
                tags: ['School', 'Education'],
                interests: ['Language Learning', 'Study Groups'],
                availability: 'Afternoons',
                location: 'University Area',
                instagram: '@sofia_learns',
                bio: 'Graduate student organizing study groups'
            },
            {
                name: 'Abdul Rahman',
                origin: 'Pakistan',
                tags: ['School', 'STEM'],
                interests: ['Engineering', 'Academic Research'],
                availability: 'Weekdays',
                location: 'Campus',
                instagram: '@abdul_engineers',
                bio: 'Engineering student looking for project collaborators'
            }
        ],
        neighbourhood: [
            {
                name: 'Fatima Al-Said',
                origin: 'Lebanon',
                tags: ['Neighbourhood', 'Community'],
                interests: ['Local Events', 'Family Activities'],
                availability: 'Weekends',
                location: 'Riverside',
                instagram: '@fatima_community',
                bio: 'Organizing family-friendly community events'
            },
            {
                name: 'Luis Morales',
                origin: 'Colombia',
                tags: ['Neighbourhood', 'Sports'],
                interests: ['Soccer', 'Community Sports'],
                availability: 'Evenings',
                location: 'South Side',
                instagram: '@luis_plays',
                bio: 'Creating neighborhood sports leagues'
            }
        ],
        backgroundinterest: [
            {
                name: 'Nina Ivanova',
                origin: 'Russia',
                tags: ['Background Interest', 'Fitness'],
                interests: ['Yoga', 'Outdoor Activities'],
                availability: 'Mornings',
                location: 'North End',
                instagram: '@nina_moves',
                bio: 'Yoga instructor creating inclusive fitness groups'
            },
            {
                name: 'Jamal Wilson',
                origin: 'Nigeria',
                tags: ['Background Interest', 'Business'],
                interests: ['Entrepreneurship', 'Networking'],
                availability: 'Flexible',
                location: 'Business District',
                instagram: '@jamal_startups',
                bio: 'Connecting immigrant entrepreneurs'
            }
        ],
        aioptimized: [
            {
                name: 'Sarah Kim',
                origin: 'South Korea',
                tags: ['AI Optimized', 'Tech', 'Culture'],
                interests: ['AI/ML', 'Cultural Exchange'],
                availability: 'Flexible',
                location: 'Innovation District',
                instagram: '@sarah_ai',
                bio: 'AI researcher building cultural bridges'
            },
            {
                name: 'Carlos Mendoza',
                origin: 'Brazil',
                tags: ['AI Optimized', 'Business', 'Sports'],
                interests: ['Digital Marketing', 'Soccer'],
                availability: 'Evenings',
                location: 'Central District',
                instagram: '@carlos_digital',
                bio: 'Digital marketer and soccer enthusiast'
            }
        ]
    };

    // Toggle between All and Community views
    const viewButtons = document.querySelectorAll('.view-toggle button');
    const communityFilters = document.getElementById('communityFilters');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            communityFilters.style.display = 
                button.textContent === 'Community' ? 'block' : 'none';
            
            if (button.textContent === 'Community') {
                const selectedFilters = Array.from(document.querySelectorAll('.community-tag.active'))
                    .map(tag => tag.textContent.toLowerCase().replace(/\s+/g, ''));
                populateConnections(selectedFilters);
            } else {
                populateConnections();
            }
        });
    });

    // Handle community tags selection
    const communityTags = document.querySelectorAll('.community-tag');
    const selectedTagsContainer = document.querySelector('.selected-tags');

    communityTags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            if (tag.classList.contains('active')) {
                addSelectedTag(tag.textContent);
            } else {
                removeSelectedTag(tag.textContent);
            }
            const selectedFilters = Array.from(document.querySelectorAll('.community-tag.active'))
                .map(tag => tag.textContent.toLowerCase().replace(/\s+/g, ''));
            populateConnections(selectedFilters);
        });
    });

    function addSelectedTag(tagText) {
        const existingTag = Array.from(selectedTagsContainer.children)
            .find(tag => tag.textContent.trim().slice(0, -1) === tagText);
        
        if (!existingTag) {
            const tagElement = document.createElement('div');
            tagElement.className = 'selected-tag';
            tagElement.innerHTML = `
                ${tagText}
                <button onclick="removeTag(this)">×</button>
            `;
            selectedTagsContainer.appendChild(tagElement);
        }
    }

    function removeSelectedTag(tagText) {
        const existingTag = Array.from(selectedTagsContainer.children)
            .find(tag => tag.textContent.trim().slice(0, -1) === tagText);
        if (existingTag) {
            existingTag.remove();
        }
    }

    // Function to create a more detailed connection card
    function createDetailedConnectionCard(connection, isConnected = false) {
        const card = document.createElement('div');
        card.className = 'connection-card';
        card.innerHTML = `
            <div class="connection-header">
                <img src="https://americancarportsinc.com/wp-content/uploads/2020/06/face-placeholder.gif" 
                     alt="${connection.name}" 
                     class="profile-pic">
                <div class="connection-info">
                    <div class="connection-name">${connection.name}</div>
                    <div class="connection-origin">${connection.origin}</div>
                    <div class="connection-tags">
                        ${connection.tags.map(tag => `
                            <span class="connection-tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="connection-details">
                <p class="connection-bio">${connection.bio}</p>
                <div class="connection-interests">
                    <strong>Interests:</strong> ${connection.interests.join(', ')}
                </div>
                <div class="connection-availability">
                    <strong>Available:</strong> ${connection.availability}
                </div>
                <div class="connection-location">
                    <strong>Location:</strong> ${connection.location}
                </div>
            </div>
            <button class="connect-btn">${isConnected ? 'Connected' : 'Connect'}</button>
            <div class="instagram-handle ${isConnected ? 'visible' : ''}">
                <i class="fab fa-instagram"></i> ${connection.instagram}
            </div>
        `;

        const connectBtn = card.querySelector('.connect-btn');
        const instagramHandle = card.querySelector('.instagram-handle');
        const detailsSection = card.querySelector('.connection-details');

        if (isConnected) {
            connectBtn.style.backgroundColor = '#319795';
        }

        connectBtn.addEventListener('click', () => {
            instagramHandle.classList.toggle('visible');
            const isNowConnected = connectBtn.textContent === 'Connect';
            connectBtn.textContent = isNowConnected ? 'Connected' : 'Connect';
            
            if (isNowConnected) {
                connectBtn.style.backgroundColor = '#319795';
                if (!myConnections.find(conn => conn.instagram === connection.instagram)) {
                    myConnections.push(connection);
                    updateMyConnectionsSection();
                }
            } else {
                connectBtn.style.backgroundColor = '#2B6CB0';
                myConnections = myConnections.filter(conn => conn.instagram !== connection.instagram);
                updateMyConnectionsSection();
            }
            
            // Refresh connections display
            const activeView = document.querySelector('.view-toggle button.active').textContent;
            if (activeView === 'Community') {
                const selectedFilters = Array.from(document.querySelectorAll('.community-tag.active'))
                    .map(tag => tag.textContent.toLowerCase().replace(/\s+/g, ''));
                populateConnections(selectedFilters);
            } else {
                populateConnections();
            }
        });

        card.addEventListener('mouseenter', () => {
            detailsSection.style.maxHeight = detailsSection.scrollHeight + 'px';
        });

        card.addEventListener('mouseleave', () => {
            detailsSection.style.maxHeight = '0';
        });

        return card;
    }

    // Function to update My Connections section
    function updateMyConnectionsSection() {
        const connectionsSection = document.querySelector('.connections-section');
        const existingMyConnections = document.querySelector('.my-connections');
        
        if (myConnections.length > 0) {
            if (!existingMyConnections) {
                const myConnectionsDiv = document.createElement('div');
                myConnectionsDiv.className = 'connection-group my-connections';
                myConnectionsDiv.innerHTML = `
                    <h3 class="connection-group-title">My Connections</h3>
                    <div class="connections-grid"></div>
                `;
                connectionsSection.insertBefore(myConnectionsDiv, connectionsSection.firstChild);
            }
            
            const grid = document.querySelector('.my-connections .connections-grid');
            grid.innerHTML = '';
            myConnections.forEach(connection => {
                grid.appendChild(createDetailedConnectionCard(connection, true));
            });
        } else if (existingMyConnections) {
            existingMyConnections.remove();
        }
    }

    // Function to populate connections based on selected filters
    function populateConnections(filters = []) {
        const connectionsSection = document.querySelector('.connections-section');
        connectionsSection.innerHTML = '';

        // Always show My Connections section if there are connections
        if (myConnections.length > 0) {
            const myConnectionsDiv = document.createElement('div');
            myConnectionsDiv.className = 'connection-group my-connections';
            myConnectionsDiv.innerHTML = `
                <h3 class="connection-group-title">My Connections</h3>
                <div class="connections-grid"></div>
            `;
            connectionsSection.appendChild(myConnectionsDiv);
            const myGrid = myConnectionsDiv.querySelector('.connections-grid');
            myConnections.forEach(connection => {
                myGrid.appendChild(createDetailedConnectionCard(connection, true));
            });
        }

        // Handle filters
        const categoriesToShow = filters.length > 0 ? filters : Object.keys(connectionData);

        categoriesToShow.forEach(category => {
            if (connectionData[category]) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'connection-group';
                groupDiv.innerHTML = `
                    <h3 class="connection-group-title">${category.charAt(0).toUpperCase() + category.slice(1)} Connections</h3>
                    <div class="connections-grid"></div>
                `;

                const grid = groupDiv.querySelector('.connections-grid');
                connectionData[category].forEach(connection => {
                    if (!myConnections.find(conn => conn.instagram === connection.instagram)) {
                        grid.appendChild(createDetailedConnectionCard(connection));
                    }
                });

                if (grid.children.length > 0) {
                    connectionsSection.appendChild(groupDiv);
                }
            }
        });
    }

    // Initial population of connections
    populateConnections();
});

// Global function to remove tags
function removeTag(button) {
    const tag = button.parentElement;
    const tagText = tag.textContent.trim().slice(0, -1);
    
    // Remove from selected tags
    tag.remove();
    
    // Deactivate the corresponding community tag
    const communityTag = Array.from(document.querySelectorAll('.community-tag'))
        .find(t => t.textContent === tagText);
    if (communityTag) {
        communityTag.classList.remove('active');
    }
    
    // Update connections based on remaining filters
    const selectedFilters = Array.from(document.querySelectorAll('.community-tag.active'))
        .map(tag => tag.textContent.toLowerCase().replace(/\s+/g, ''));
    populateConnections(selectedFilters);
}