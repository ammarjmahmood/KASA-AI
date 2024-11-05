document.addEventListener('DOMContentLoaded', function() {
    // Existing suggestion card functionality
    const suggestionButtons = document.querySelectorAll('.show-suggestion');
    
    suggestionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const response = this.nextElementSibling;
            response.classList.toggle('active');
            
            this.textContent = response.classList.contains('active') 
                ? 'Hide Details' 
                : button.textContent.includes('Application') 
                    ? 'Show Application Requirements'
                    : button.textContent.includes('Housing')
                        ? 'Show Housing Tips'
                        : 'Show Language Tips';
        });
    });

    // Voice animation
    function animateVoiceBars() {
        const bars = document.querySelectorAll('.voice-bar');
        bars.forEach(bar => {
            bar.style.height = Math.random() * 40 + 10 + 'px';
        });
    }
    setInterval(animateVoiceBars, 100);

    // Chat functionality
    const chatInput = document.querySelector('input[type="text"]');
    const sendButton = document.querySelector('button');
    const responseContainer = document.getElementById('ai-response');

    if (sendButton && chatInput && responseContainer) {
        sendButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const message = chatInput.value.trim();
            if (!message) return;

            // Show loading state
            responseContainer.innerHTML = '<p>Thinking...</p>';
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }

                // NEW FORMATTING CODE GOES HERE
                if (data.response) {
                    const formattedResponse = data.response
                        .split('. ')
                        .map(sentence => sentence.trim())
                        .filter(sentence => sentence.length > 0)
                        .join('.\n\n');

                    responseContainer.innerHTML = `
                        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p class="text-gray-800" style="white-space: pre-line; line-height: 1.6;">
                                ${formattedResponse}
                            </p>
                        </div>
                    `;
                }

                // Clear input
                chatInput.value = '';

            } catch (error) {
                console.error('Error:', error);
                responseContainer.innerHTML = `
                    <div class="mt-4 p-4 bg-red-50 rounded-lg">
                        <p class="text-red-600">Sorry, there was an error processing your request. Please try again.</p>
                    </div>
                `;
            }
        });

        // Allow sending message with Enter key
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        });
    }
});