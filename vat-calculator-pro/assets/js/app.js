// VAT Calculator Pro - Main Application Logic
// Preserves all working UI and navigation logic from the original monolithic application

/**
 * Navigation and routing system - WORKING LOGIC PRESERVED
 */
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

/**
 * File handling functions - WORKING LOGIC PRESERVED
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateFile(file);
    }
}

function validateFile(file) {
    const statusDiv = document.getElementById('file-status');
    const processBtn = document.getElementById('process-btn');

    // Reset status
    if (statusDiv) {
        statusDiv.className = 'file-status';
        statusDiv.style.display = 'none';
    }

    // Check file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                      'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && 
        !file.name.toLowerCase().endsWith('.xlsx') && 
        !file.name.toLowerCase().endsWith('.xls')) {
        showFileStatus('error', 'Invalid file type. Please upload a .xlsx or .xls file.');
        if (processBtn) processBtn.disabled = true;
        return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        showFileStatus('error', 'File is too large. Maximum size is 50MB.');
        if (processBtn) processBtn.disabled = true;
        return;
    }

    // File is valid
    currentFile = file;
    showFileStatus('success', `File "${file.name}" is ready for processing (${formatFileSize(file.size)})`);
    if (processBtn) processBtn.disabled = false;
}

function showFileStatus(type, message) {
    const statusDiv = document.getElementById('file-status');
    if (statusDiv) {
        statusDiv.className = `file-status ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Drag and drop functionality - WORKING LOGIC PRESERVED
 */
function initializeDragAndDrop() {
    const uploadZone = document.querySelector('.upload-area');
    
    if (uploadZone) {
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.files = files;
                }
                validateFile(file);
            }
        });

        // Click to upload
        uploadZone.addEventListener('click', function() {
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
}

/**
 * Results display functions - WORKING LOGIC PRESERVED
 */
function displayResults(results) {
    // Update summary cards
    const elements = {
        'total-output-vat': results.totalOutputVAT,
        'total-input-vat': results.totalInputVAT,
        'sales-including-vat': results.salesIncludingVAT,
        'sales-excluding-vat': results.salesExcludingVAT,
        'zero-rated-sales': results.zeroRatedSales
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = formatCurrency(value);
        }
    }

    // Update VAT payable/refund
    const vatPayableAmount = document.getElementById('vat-payable-amount');
    const vatPayableLabel = document.getElementById('vat-payable-label');
    
    if (vatPayableAmount && vatPayableLabel) {
        if (results.vatPayable >= 0) {
            vatPayableLabel.textContent = 'VAT Payable';
            vatPayableAmount.textContent = formatCurrency(results.vatPayable);
        } else {
            vatPayableLabel.textContent = 'VAT Refund';
            vatPayableAmount.textContent = formatCurrency(Math.abs(results.vatPayable));
        }
    }

    // Generate breakdown sections
    generateBreakdownSections(results.taxCodeBreakdown);
}

function generateBreakdownSections(taxCodeBreakdown) {
    const container = document.getElementById('breakdown-sections');
    if (!container) return;

    container.innerHTML = '';

    for (const [taxCode, breakdown] of Object.entries(taxCodeBreakdown)) {
        // Skip if no transactions for this tax code
        if (breakdown.input.count === 0 && breakdown.output.count === 0) {
            continue;
        }

        const section = document.createElement('div');
        section.className = 'card breakdown-section';

        section.innerHTML = `
            <div class="breakdown-header">
                <h3>Tax Code ${taxCode}: ${breakdown.description} (${breakdown.rate}%)</h3>
            </div>
            <div class="breakdown-content">
                <div class="input-output-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div class="input-section">
                        <div class="section-title" style="font-weight: 600; color: #dc2626; margin-bottom: 1rem;">
                            📥 INPUT VAT (Purchases)
                        </div>
                        <div class="stat-grid">
                            <div class="stat-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span class="stat-label">Transactions</span>
                                <span class="stat-value">${breakdown.input.count.toLocaleString()}</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span class="stat-label">VAT Amount</span>
                                <span class="stat-value">${formatCurrency(breakdown.input.vatAmount)}</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span class="stat-label">Excl Amount</span>
                                <span class="stat-value">${formatCurrency(breakdown.input.exclAmount)}</span>
                            </div>
                        </div>
                        ${generateSampleTransactions(breakdown.input.transactions, 'Input')}
                    </div>
                    <div class="output-section">
                        <div class="section-title" style="font-weight: 600; color: #2563eb; margin-bottom: 1rem;">
                            📤 OUTPUT VAT (Sales)
                        </div>
                        <div class="stat-grid">
                            <div class="stat-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span class="stat-label">Transactions</span>
                                <span class="stat-value">${breakdown.output.count.toLocaleString()}</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span class="stat-label">VAT Amount</span>
                                <span class="stat-value">${formatCurrency(breakdown.output.vatAmount)}</span>
                            </div>
                            <div class="stat-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span class="stat-label">Excl Amount</span>
                                <span class="stat-value">${formatCurrency(breakdown.output.exclAmount)}</span>
                            </div>
                        </div>
                        ${generateSampleTransactions(breakdown.output.transactions, 'Output')}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(section);
    }
}

function generateSampleTransactions(transactions, type) {
    if (transactions.length === 0) {
        return '<div class="sample-transactions"><p>No transactions</p></div>';
    }

    // Show first 5 transactions as sample
    const sampleTransactions = transactions.slice(0, 5);
    const tableRows = sampleTransactions.map(tx => `
        <tr>
            <td>${tx.TrCode}</td>
            <td>${formatCurrency(tx.ExclAmount)}</td>
            <td>${formatCurrency(tx.TaxAmount)}</td>
        </tr>
    `).join('');

    return `
        <div class="sample-transactions" style="margin-top: 1rem;">
            <h4>Sample ${type} Transactions</h4>
            <table class="breakdown-table" style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                <thead>
                    <tr>
                        <th style="padding: 0.5rem; background: #f8f9fa; border-bottom: 1px solid #e2e8f0;">Code</th>
                        <th style="padding: 0.5rem; background: #f8f9fa; border-bottom: 1px solid #e2e8f0;">Excl Amount</th>
                        <th style="padding: 0.5rem; background: #f8f9fa; border-bottom: 1px solid #e2e8f0;">VAT Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            ${transactions.length > 5 ? `<p style="margin-top: 0.5rem; color: #718096; font-size: 0.9rem;">... and ${transactions.length - 5} more transactions</p>` : ''}
        </div>
    `;
}

/**
 * Main processing workflow - WORKING LOGIC PRESERVED
 */
async function handleProcessFile() {
    if (!currentFile) {
        alert('Please select a file first.');
        return;
    }

    // Navigate to processing page
    navigateToPage('processing');

    try {
        const results = await processFile();
        
        // Display results and navigate to results page
        displayResults(results);
        navigateToPage('results');

    } catch (error) {
        console.error('Processing error:', error);
        alert('Error processing file: ' + error.message);
        navigateToPage('upload');
    }
}

/**
 * Export functions - Basic implementations
 */
function exportToPDF() {
    if (!processedData) {
        alert('No data to export. Please process a file first.');
        return;
    }
    
    // Basic PDF export - can be enhanced with jsPDF
    window.print();
}

function exportToExcel() {
    if (!processedData) {
        alert('No data to export. Please process a file first.');
        return;
    }

    // Basic Excel export using XLSX library with properly formatted monetary values
    const ws = XLSX.utils.json_to_sheet([{
        'Total Input VAT': parseFloat(processedData.totalInputVAT).toFixed(2),
        'Total Output VAT': parseFloat(processedData.totalOutputVAT).toFixed(2),
        'VAT Payable': parseFloat(processedData.vatPayable).toFixed(2),
        'Sales Excluding VAT': parseFloat(processedData.salesExcludingVAT).toFixed(2),
        'Sales Including VAT': parseFloat(processedData.salesIncludingVAT).toFixed(2),
        'Zero Rated Sales': parseFloat(processedData.zeroRatedSales).toFixed(2)
    }]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VAT Summary');
    XLSX.writeFile(wb, 'vat-calculation-summary.xlsx');
}

/**
 * Mobile menu toggle
 */
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('VAT Calculator Pro - Initializing Application');
    
    // Load external libraries
    try {
        await loadXLSXLibrary();
        console.log('XLSX library loaded successfully');
    } catch (error) {
        console.warn('Failed to load XLSX library:', error);
    }

    // Initialize drag and drop
    initializeDragAndDrop();

    // Set up event listeners
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
        processBtn.addEventListener('click', handleProcessFile);
    }

    // Set up navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Handle initial page load based on URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#/')) {
        const page = hash.substring(2);
        navigateToPage(page);
    } else {
        navigateToPage('home');
    }

    // Handle browser back/forward
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
            const page = hash.substring(2);
            navigateToPage(page);
        }
    });

    console.log('Application initialized successfully');
});
