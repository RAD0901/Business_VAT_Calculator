// Application initialization and navigation
let currentFile = null;
let processedData = null;

// VAT Business Logic Constants
const VAT_INPUT_CODES = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'];
const VAT_OUTPUT_CODES = ['IS', 'INV', 'RTS'];
const TAX_CODES = {
    'CASH': { description: 'Cash Sale', type: 'input' },
    'JC': { description: 'Journal Credit', type: 'input' },
    'JNL': { description: 'Journal Entry', type: 'input' },
    'SINV': { description: 'Supplier Invoice', type: 'input' },
    'JD': { description: 'Journal Debit', type: 'input' },
    'RC': { description: 'Receipt', type: 'input' },
    'IS': { description: 'Invoice Sale', type: 'output' },
    'INV': { description: 'Invoice', type: 'output' },
    'RTS': { description: 'Returns', type: 'output' }
};

// Page loading function
async function loadPage(pageId) {
    try {
        const response = await fetch(`${pageId}/index.html`);
        if (!response.ok) {
            throw new Error(`Failed to load page: ${pageId}`);
        }
        const html = await response.text();
        
        // Extract body content from the loaded HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const pageContent = doc.querySelector('.page');
        
        if (pageContent) {
            document.getElementById('main-content').innerHTML = pageContent.outerHTML;
        } else {
            document.getElementById('main-content').innerHTML = doc.body.innerHTML;
        }
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('main-content').innerHTML = `
            <div class="page error-page">
                <div class="container">
                    <h1>Page Not Found</h1>
                    <p>Sorry, the page "${pageId}" could not be loaded.</p>
                    <button onclick="navigateToPage('upload')" class="btn-primary">Go to Upload</button>
                </div>
            </div>
        `;
    }
}

// Navigation function
async function navigateToPage(pageId) {
    // Update navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    // Update URL hash
    window.location.hash = pageId;

    // Load page content
    await loadPage(pageId);

    // Page-specific initialization
    if (pageId === 'settings') {
        loadSettings();
    } else if (pageId === 'history') {
        loadCalculationHistory();
    } else if (pageId === 'results' && processedData) {
        displayResults(processedData);
    }
}

// Hash change handler
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        navigateToPage(hash);
    }
});

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('mobile-open');
}

// Initialize application
function initializeApp() {
    // Set default page
    const hash = window.location.hash.slice(1);
    const initialPage = hash || 'upload';
    navigateToPage(initialPage);

    // Load settings
    loadSettings();
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
    alert('An unexpected error occurred. Please refresh the page and try again.');
});

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-ZA') + ' ' + date.toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Handle drag and drop events globally
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.files = files;
            validateFile(file);
        }
    }
}
