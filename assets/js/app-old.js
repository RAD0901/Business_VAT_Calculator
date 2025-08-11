// VAT Calculator Pro - Main Application
console.log('VAT Calculator Pro - Script loading started');

// Global Variables
let currentFile = null;
let processedData = null;
let settingsManager, exportManager, historyManager;

// VAT Business Logic Constants
const VAT_INPUT_CODES = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'];
const VAT_OUTPUT_CODES = ['IS', 'INV', 'RTS'];
const TAX_CODES = {
    '1': { description: 'Standard Rate (15%)', rate: 15 },
    '3': { description: 'Zero Rate (0%)', rate: 0 },
    '5': { description: 'Exempt (0%)', rate: 0 }
};

// Add error handling for debugging
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    console.error('Error message:', e.message);
    console.error('File:', e.filename);
    console.error('Line:', e.lineno);
});

// Navigation Functions
function navigateToPage(pageName) {
    // Add loading state
    document.body.classList.add('loading');
    
    setTimeout(() => {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Update URL hash
            window.location.hash = `/${pageName}`;
            
            // Update active nav link
            const navLink = document.querySelector(`[data-page="${pageName}"]`);
            if (navLink) {
                navLink.classList.add('active');
            }

            // Scroll to top
            window.scrollTo(0, 0);
        }

        // Remove loading state
        document.body.classList.remove('loading');
        
        // Close mobile menu if open
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.classList.remove('show');
        }
    }, 150);
}

// Handle browser back/forward navigation
window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    if (hash === '#/upload') {
        navigateToPage('upload');
    } else if (hash === '#/processing') {
        navigateToPage('processing');
    } else if (hash === '#/results') {
        navigateToPage('results');
    } else if (hash === '#/demo') {
        navigateToPage('demo');
    } else if (hash === '#/help') {
        navigateToPage('help');
    } else if (hash === '#/about') {
        navigateToPage('about');
    } else if (hash === '#/settings') {
        navigateToPage('settings');
    } else if (hash === '#/history') {
        navigateToPage('history');
    } else {
        navigateToPage('landing');
    }
});

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('show');
}

// Download sample template function
function downloadSampleTemplate() {
    // Create sample data
    const sampleData = [
        {
            TaxCode: 1,
            TaxDescription: "Standard Rate (Excluding Capital Goods)",
            TrCode: "INV",
            TaxRate: 15,
            TaxAmount: 150.00,
            ExclAmount: 1000.00,
            InclAmount: 1150.00
        },
        {
            TaxCode: 1,
            TaxDescription: "Standard Rate (Excluding Capital Goods)",
            TrCode: "CASH",
            TaxRate: 15,
            TaxAmount: 75.00,
            ExclAmount: 500.00,
            InclAmount: 575.00
        },
        {
            TaxCode: 3,
            TaxDescription: "Zero Rate",
            TrCode: "IS",
            TaxRate: 0,
            TaxAmount: 0.00,
            ExclAmount: 2000.00,
            InclAmount: 2000.00
        }
    ];

    // Convert to worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VAT Data");

    // Download file
    XLSX.writeFile(wb, "VAT_Calculator_Sample_Template.xlsx");
}

// Utility Functions
function formatCurrency(amount) {
    return 'R ' + Number(amount).toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// XLSX Library Loader
async function loadXLSXLibrary() {
    return new Promise((resolve, reject) => {
        if (typeof XLSX !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Support form functionality
document.addEventListener('DOMContentLoaded', function() {
    const supportForm = document.querySelector('.support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('support-name').value;
            const email = document.getElementById('support-email').value;
            const message = document.getElementById('support-message').value;
            
            // Simulate form submission
            alert(`Thank you ${name}! Your message has been received. We'll respond to ${email} within 24 hours.`);
            
            // Reset form
            supportForm.reset();
        });
    }
});

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing VAT Calculator Pro');
    
    // Load external libraries
    try {
        await loadXLSXLibrary();
        console.log('XLSX library loaded successfully');
    } catch (error) {
        console.warn('Failed to load external libraries:', error);
    }

    // Initialize managers
    setTimeout(() => {
        settingsManager = new SettingsManager();
        exportManager = new ExportManager();
        historyManager = new HistoryManager();
        console.log('Managers initialized successfully');
    }, 500);

    // Handle initial page load
    const hash = window.location.hash;
    console.log('Current hash:', hash);
    
    if (hash === '#/upload') {
        navigateToPage('upload');
    } else if (hash === '#/processing') {
        navigateToPage('processing');
    } else if (hash === '#/results') {
        navigateToPage('results');
    } else if (hash === '#/demo') {
        navigateToPage('demo');
    } else if (hash === '#/help') {
        navigateToPage('help');
    } else if (hash === '#/about') {
        navigateToPage('about');
    } else if (hash === '#/settings') {
        navigateToPage('settings');
    } else if (hash === '#/history') {
        navigateToPage('history');
    } else {
        navigateToPage('landing');
    }

    // Store navigation preference
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('vatCalculatorVisited', 'true');
    }

    console.log('VAT Calculator Pro initialized - Enhanced Multi-Page Version');
});
