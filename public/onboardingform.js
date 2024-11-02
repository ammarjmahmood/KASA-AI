// onboardingform.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Form script loaded');
    
    const form = document.getElementById('onboardingForm');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const progressBar = document.querySelector('.progress');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    let currentStep = 0;

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        updateProgress();
    }

    function updateProgress() {
        const progress = ((currentStep + 1) / steps.length) * 100;
        progressBar.style.width = progress + '%';
    }

    function validateEmail(email) {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }

    function validateCurrentStep() {
        const currentStepEl = steps[currentStep];
        const requiredFields = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            const value = field.value.trim();
            
            // Remove existing error message if any
            const existingError = field.parentElement.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            if (!value) {
                isValid = false;
                showError(field, 'This field is required');
            } else if (field.type === 'email' && !validateEmail(value)) {
                isValid = false;
                showError(field, 'Please enter a valid email address');
            }

            field.classList.toggle('error', !isValid);
        });

        return isValid;
    }

    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Next button clicked');
            if (validateCurrentStep()) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');

        if (validateCurrentStep()) {
            const formData = new FormData(form);
            const jsonData = {
                userData: {}
            };

            // Convert FormData to structured JSON
            formData.forEach((value, key) => {
                if (key.endsWith('[]')) {
                    const cleanKey = key.slice(0, -2);
                    if (!jsonData.userData[cleanKey]) {
                        jsonData.userData[cleanKey] = [];
                    }
                    jsonData.userData[cleanKey].push(value);
                } else {
                    jsonData.userData[key] = value;
                }
            });

            try {
                const response = await fetch('/api/save-form-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(jsonData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Thank you! Your information has been saved successfully.');
                    form.reset();
                    currentStep = 0;
                    showStep(currentStep);
                    window.location.href = 'index.html';
                } else {
                    throw new Error(result.error || 'Failed to save data');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('There was an error submitting the form. Please try again.');
            }
        }
    });

    // Initialize form
    showStep(currentStep);
});