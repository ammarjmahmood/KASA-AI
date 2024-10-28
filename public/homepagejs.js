// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const submitBtn = document.querySelector('.submit-btn');
    const uploadHistorySection = document.getElementById('upload-history');
    const uploadHistoryList = document.getElementById('upload-history-list');
    const clearBtn = document.getElementById('clear-btn');
    let selectedFiles = null;
    let uploadHistory = [];

    // Initialize Components
    initializeTitleAnimation();
    initializeFileUpload();
    initializeHistoryManagement();
    initializeButtonHandlers();

    // Title Animation
    function initializeTitleAnimation() {
        const title = document.getElementById('title');
        const text = title.textContent;
        title.innerHTML = '';
        
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.animationDelay = `${index * 0.05}s`;
            title.appendChild(span);
            if (char === ' ') {
                span.style.width = '0.25em';
                span.style.display = 'inline-block';
            }
        });
    }

    // File Upload Initialization
    function initializeFileUpload() {
        // Click handler
        uploadArea.addEventListener('click', () => fileInput.click());

        // Prevent default behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Drag enter/over effect
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-active');
            });
        });

        // Drag leave/drop effect
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-active');
            });
        });

        // File handlers
        uploadArea.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }

    // File Drop Handler
    function handleDrop(e) {
        const dt = e.dataTransfer;
        selectedFiles = dt.files;
        handleFiles(selectedFiles);
    }

    // File Selection Handler
    function handleFileSelect(e) {
        selectedFiles = e.target.files;
        handleFiles(selectedFiles);
    }

    // File Processing
    function handleFiles(files) {
        // Show loading state
        uploadArea.classList.add('loading');

        // Validate files
        const validFiles = Array.from(files).filter(file => {
            const validTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (!validTypes.includes(file.type)) {
                showNotification(`${file.name} is not a supported file type`, 'error');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showNotification(`${file.name} is too large (max 10MB)`, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            uploadArea.classList.remove('loading');
            resetUploadArea();
            return;
        }

        // Update UI with valid files
        const fileNames = validFiles.map(file => file.name).join(', ');
        uploadArea.innerHTML = `
            <svg class="upload-icon success" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <p>${validFiles.length} file(s) selected:</p>
            <p class="file-names">${fileNames}</p>
        `;

        // Add to upload history
        validFiles.forEach(file => {
            uploadHistory.push({
                name: file.name,
                date: new Date().toLocaleString(),
                status: 'pending'
            });
        });

        updateUploadHistory();
        uploadArea.classList.remove('loading');
    }

    // History Management
    function initializeHistoryManagement() {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all uploaded documents?')) {
                clearHistory();
            }
        });
    }

    function clearHistory() {
        clearBtn.classList.add('loading');
        
        fetch('/clear', { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    uploadHistory = [];
                    updateUploadHistory();
                    showNotification('All documents cleared successfully', 'success');
                    resetUploadArea();
                } else {
                    throw new Error('Failed to clear documents');
                }
            })
            .catch(error => {
                showNotification('Failed to clear documents. Please try again.', 'error');
                console.error('Clear error:', error);
            })
            .finally(() => {
                clearBtn.classList.remove('loading');
            });
    }

    function updateUploadHistory() {
        if (uploadHistory.length === 0) {
            uploadHistorySection.style.display = 'none';
            return;
        }

        uploadHistorySection.style.display = 'block';
        uploadHistoryList.innerHTML = '';

        uploadHistory.forEach((file, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <svg class="icon ${file.status}" viewBox="0 0 24 24">
                    <path d="M12 2L2 12h4v9h12v-9h4L12 2z"/>
                </svg>
                <span class="file-name">${file.name}</span>
                <span class="file-date">${file.date}</span>
                <button class="remove-file" data-index="${index}">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            `;

            // Add remove file handler
            li.querySelector('.remove-file').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFile(index);
            });

            uploadHistoryList.appendChild(li);
        });
    }

    function removeFile(index) {
        uploadHistory.splice(index, 1);
        updateUploadHistory();
        showNotification('File removed', 'success');
    }

    function resetUploadArea() {
        fileInput.value = '';
        uploadArea.innerHTML = `
            <svg class="upload-icon" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Drag and drop files here, or click to select files</p>
        `;
    }

    // Button Handlers
    function initializeButtonHandlers() {
        submitBtn.addEventListener('click', async () => {
            if (!selectedFiles || selectedFiles.length === 0) {
                showNotification('Please select files before submitting', 'error');
                return;
            }

            submitBtn.classList.add('loading');

            try {
                await uploadFiles(selectedFiles);
                showNotification('Files uploaded successfully', 'success');
                
                // Update status in history
                uploadHistory = uploadHistory.map(file => ({
                    ...file,
                    status: 'success'
                }));
                updateUploadHistory();
                
                // Reset form
                resetUploadArea();
                selectedFiles = null;
            } catch (error) {
                showNotification('Failed to upload files. Please try again.', 'error');
                console.error('Upload error:', error);
            } finally {
                submitBtn.classList.remove('loading');
            }
        });
    }

    // File Upload Function
    async function uploadFiles(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        return response.json();
    }

    // Notification System
    function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24">
                ${type === 'success' 
                    ? '<path d="M20 6L9 17l-5-5"/>' 
                    : type === 'error' 
                        ? '<path d="M18 6L6 18M6 6l12 12"/>' 
                        : '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'}
            </svg>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});