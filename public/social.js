document.addEventListener('DOMContentLoaded', async function() {
    // Store connected users
    let myConnections = [];
    let connectionData = {
        cultural: [],
        professional: [],
        school: [],
        neighbourhood: [],
        backgroundinterest: [],
        aioptimized: []
    };

    async function fetchUserData() {
        try {
            // Use the existing endpoint
            const response = await fetch('/api/save-form-data');
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const userData = await response.json();
            
            if (!userData) {
                throw new Error('No user data available');
            }

            // Get the first user from the JSON for comparison
            const firstUserEmail = Object.keys(userData)[0];
            const firstUser = userData[firstUserEmail];
            
            // Clear existing categories
            Object.keys(connectionData).forEach(key => {
                connectionData[key] = [];
            });
    
            // Process each user and categorize them based on similarities with first user
            Object.entries(userData).forEach(([email, user]) => {
                if (email === firstUserEmail) return; // Skip first user's own profile

                const connection = {
                    name: user.personalInfo.fullName,
                    origin: user.culturalGroup,
                    tags: [
                        ...(user.goals.primary || []).map(goal => goal.charAt(0).toUpperCase() + goal.slice(1)),
                        user.culturalGroup,
                        user.immigrationStatus.split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                    ].filter(Boolean),
                    interests: [
                        ...(user.interests.hobbies || []),
                        ...(user.interests.skills || []),
                        user.courses,
                        user.previousWork
                    ].filter(Boolean),
                    availability: user.needs.timeline,
                    location: `${user.destinationInfo.city}, ${user.destinationInfo.country}`,
                    instagram: user.socialPreferences.connectionMethod,
                    bio: user.personalInfo.bio
                };

                // Cultural match
                if (user.culturalGroup === firstUser.culturalGroup) {
                    connectionData.cultural.push(connection);
                }

                // Professional match (skills or work experience)
                if (
                    user.interests.skills?.some(skill => 
                        firstUser.interests.skills?.includes(skill)) ||
                    user.previousWork === firstUser.previousWork
                ) {
                    connectionData.professional.push(connection);
                }

                // Educational match
                if (
                    user.goals.primary?.some(goal => 
                        firstUser.goals.primary?.includes(goal)) ||
                    user.courses === firstUser.courses
                ) {
                    connectionData.school.push(connection);
                }

                // Location match
                if (user.destinationInfo.city === firstUser.destinationInfo.city) {
                    connectionData.neighbourhood.push(connection);
                }

                // Interest/hobby match
                if (user.interests.hobbies?.some(hobby => 
                    firstUser.interests.hobbies?.includes(hobby))) {
                    connectionData.backgroundinterest.push(connection);
                }

                // Technical/AI match
                if (
                    (user.courses && firstUser.courses && 
                    user.courses.toLowerCase().includes('computer') || 
                    user.courses.toLowerCase().includes('data') ||
                    user.courses === firstUser.courses) ||
                    (user.interests.skills?.includes('technology') && 
                    firstUser.interests.skills?.includes('technology'))
                ) {
                    connectionData.aioptimized.push(connection);
                }
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            connectionData = {};
        }
    }

    // Initialize the data
    await fetchUserData();

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
                        ${connection.tags.filter(Boolean).map(tag => `
                            <span class="connection-tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="connection-details">
                <p class="connection-bio">${connection.bio || 'No bio provided'}</p>
                <div class="connection-interests">
                    <strong>Interests:</strong> ${connection.interests.filter(Boolean).join(', ') || 'None specified'}
                </div>
                <div class="connection-availability">
                    <strong>Timeline:</strong> ${connection.availability || 'Not specified'}
                </div>
                <div class="connection-location">
                    <strong>Location:</strong> ${connection.location || 'Not specified'}
                </div>
            </div>
            <button class="connect-btn">${isConnected ? 'Connected' : 'Connect'}</button>
            <div class="instagram-handle ${isConnected ? 'visible' : ''}">
                <i class="fab fa-instagram"></i> ${connection.instagram || 'No contact method provided'}
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

    function populateConnections(filters = []) {
        const connectionsSection = document.querySelector('.connections-section');
        connectionsSection.innerHTML = '';

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

        const categoriesToShow = filters.length > 0 ? filters : Object.keys(connectionData);

        categoriesToShow.forEach(category => {
            if (connectionData[category] && connectionData[category].length > 0) {
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
    tag.remove();
    
    const communityTag = Array.from(document.querySelectorAll('.community-tag'))
        .find(t => t.textContent === tagText);
    if (communityTag) {
        communityTag.classList.remove('active');
    }
    
    const selectedFilters = Array.from(document.querySelectorAll('.community-tag.active'))
        .map(tag => tag.textContent.toLowerCase().replace(/\s+/g, ''));
    populateConnections(selectedFilters);
}