document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const submitBtn = document.querySelector('.submit-btn');
    let selectedFiles = null; // Store selected files here
    let uploadHistory = [];

    // Click on the upload area triggers the hidden file input
    uploadArea.addEventListener('click', () => fileInput.click());

    // Handle drag-over effect
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = '#FFEEEE';
    });

    // Reset background color when drag leaves
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = 'white';
    });

    // Handle file drop
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'white';

        selectedFiles = e.dataTransfer.files;
        if (selectedFiles.length) {
            // Display some feedback about the selected files
            handleFiles(selectedFiles);
        }
    });

    // Handle files selected via file input (clicking)
    fileInput.addEventListener('change', (e) => {
        selectedFiles = e.target.files;
        if (selectedFiles.length) {
            handleFiles(selectedFiles);
        }
    });

    // Handle file upload on submit button click
    submitBtn.addEventListener('click', () => {
        if (selectedFiles && selectedFiles.length) {
            uploadFiles(selectedFiles);  // Call handleFiles only to upload files
        } else {
            alert('No files selected. Please select files before submitting.');
        }
    });

    // Clear all files on clear button click
    document.getElementById('clear-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all uploaded syllabuses?')) {
            fetch('/clear', { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    console.log('All files successfully cleared.');
                    alert('All files cleared successfully!');
                    
                    // Reset front-end state
                    selectedFiles = null; // Reset the selected files
                    uploadHistory = []; // Clear the history
                    updateUploadHistory(); // Update the UI
                    uploadArea.innerHTML = '<p>Drag and drop your PDF files here or click to select files</p>';

                    // **IMPORTANT**: Reset the file input field so new files can be selected
                    fileInput.value = '';  // This will reset the input
                } else {
                    alert('Failed to clear files.');
                }
            })
            .catch(error => {
                console.error('Error while clearing files:', error);
            });
        }
    });

    // Function to update upload history in UI
    function updateUploadHistory() {
        const uploadHistoryList = document.getElementById('upload-history-list');
        const uploadHistorySection = document.getElementById('upload-history');

        // Clear the existing history list
        uploadHistoryList.innerHTML = '';

        // Check if there are any uploaded files
        if (uploadHistory.length > 0) {
            uploadHistory.forEach((fileName, index) => {
                const li = document.createElement('li');
                // Add file name
                li.textContent = fileName;
                // Append the list item to the history list
                uploadHistoryList.appendChild(li);
            });

            uploadHistorySection.style.display = 'block'; // Show section
        } else {
            uploadHistorySection.style.display = 'none'; // Hide section
        }
    }

    // Function to handle displaying file names in the upload area
    function handleFiles(files) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');

        // Update the upload area with the selected file names
        uploadArea.innerHTML = `<p>${fileNames} selected for upload</p>`;

        // Add the uploaded file names to the upload history array
        Array.from(files).forEach(file => {
            uploadHistory.push(file.name);
        });

        // Update the upload history display
        updateUploadHistory();
    }

    // Function to handle file uploading
    async function uploadFiles(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // Optionally, reset the upload area after successful upload
            uploadArea.innerHTML = '<p>Drag and drop your PDF files here or click to select files</p>';
            selectedFiles = null; // Reset selected files
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to upload file.');
        }
    }

    // Dynamic title animation with correct spacing
    const title = document.getElementById('title');
    const text = title.textContent;
    title.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.animationDelay = `${i * 0.05}s`;
        title.appendChild(span);
        if (text[i] === ' ') {
            span.style.width = '0.25em';
            span.style.display = 'inline-block';
        }
    }
});
