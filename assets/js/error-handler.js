// Advanced Error Handling System
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.userFeedbackEnabled = true;
        this.initializeGlobalErrorHandling();
    }

    initializeGlobalErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: event.reason.toString(),
                stack: event.reason.stack || null,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });
    }

    // File Upload Error Handling
    validateFileUpload(file) {
        const errors = [];
        const warnings = [];

        // File format validation
        if (!this.isValidExcelFile(file)) {
            errors.push({
                code: 'INVALID_FORMAT',
                message: 'Invalid file format detected.',
                solution: 'Please upload a .xlsx or .xls file.',
                suggestions: [
                    'Convert your file to Excel format using Excel or Google Sheets',
                    'Ensure the file extension is .xlsx or .xls',
                    'Check that the file is not corrupted'
                ]
            });
        }

        // File size validation
        if (file.size > 50 * 1024 * 1024) { // 50MB
            errors.push({
                code: 'FILE_TOO_LARGE',
                message: `File size (${this.formatFileSize(file.size)}) exceeds 50MB limit.`,
                solution: 'Please reduce file size or split into smaller files.',
                suggestions: [
                    'Remove unnecessary columns or rows',
                    'Save as .xlsx instead of .xls (better compression)',
                    'Split data into multiple files by date range',
                    'Remove formatting and use plain data only'
                ]
            });
        }

        // File size warnings
        if (file.size > 10 * 1024 * 1024) { // 10MB
            warnings.push({
                code: 'LARGE_FILE_WARNING',
                message: `Large file detected (${this.formatFileSize(file.size)}).`,
                note: 'Processing may take longer and use more memory.',
                suggestions: [
                    'Consider using Chrome or Firefox for better performance',
                    'Close other browser tabs to free up memory',
                    'Processing will be done in chunks with progress updates'
                ]
            });
        }

        return { errors, warnings };
    }

    // Data Processing Error Handling
    validateExcelData(data, filename) {
        const errors = [];
        const warnings = [];
        const requiredColumns = ['TaxCode', 'TaxDescription', 'TrCode', 'TaxRate', 'TaxAmount', 'ExclAmount', 'InclAmount'];

        // Check if data is empty
        if (!data || data.length === 0) {
            return {
                errors: [{
                    code: 'EMPTY_FILE',
                    message: 'The Excel file appears to be empty.',
                    solution: 'Please provide a sample template to get started.',
                    actions: [
                        {
                            label: 'Download Sample Template',
                            action: () => this.downloadSampleTemplate()
                        },
                        {
                            label: 'View Help Guide',
                            action: () => navigateToPage('help')
                        }
                    ]
                }],
                warnings: []
            };
        }

        // Check required columns
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
            errors.push({
                code: 'MISSING_COLUMNS',
                message: `Missing required columns: ${missingColumns.join(', ')}`,
                solution: 'Please map your columns to the required format.',
                suggestions: [
                    'Check column names match exactly (case-sensitive)',
                    'Ensure first row contains column headers',
                    'Remove any merged cells in the header row'
                ],
                details: {
                    missing: missingColumns,
                    found: Object.keys(firstRow),
                    mapping: this.suggestColumnMapping(Object.keys(firstRow), requiredColumns)
                }
            });
        }

        // Validate data quality
        const validationResults = this.validateDataQuality(data);
        errors.push(...validationResults.errors);
        warnings.push(...validationResults.warnings);

        return { errors, warnings };
    }

    // Data Quality Validation
    validateDataQuality(data) {
        const errors = [];
        const warnings = [];
        const validTaxCodes = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC', 'IS', 'INV', 'RTS'];
        let invalidRows = 0;
        let invalidTaxCodes = new Set();
        let invalidAmounts = new Set();

        data.forEach((row, index) => {
            const rowNumber = index + 2; // Excel row number (accounting for header)
            let rowHasErrors = false;

            // Validate TaxCode
            if (!validTaxCodes.includes(String(row.TaxCode))) {
                invalidTaxCodes.add(row.TaxCode);
                rowHasErrors = true;
            }

            // Validate numeric fields
            const numericFields = ['TaxRate', 'TaxAmount', 'ExclAmount', 'InclAmount'];
            numericFields.forEach(field => {
                if (row[field] && isNaN(Number(row[field]))) {
                    invalidAmounts.add(`${field} in row ${rowNumber}: "${row[field]}"`);
                    rowHasErrors = true;
                }
            });

            if (rowHasErrors) {
                invalidRows++;
            }
        });

        // Generate errors and warnings
        if (invalidTaxCodes.size > 0) {
            errors.push({
                code: 'INVALID_TAX_CODES',
                message: `Invalid tax codes found: ${Array.from(invalidTaxCodes).join(', ')}`,
                solution: 'Please use only valid South African VAT tax codes.',
                details: {
                    validCodes: {
                        input: ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'],
                        output: ['IS', 'INV', 'RTS']
                    },
                    invalidCodes: Array.from(invalidTaxCodes)
                }
            });
        }

        if (invalidAmounts.size > 0) {
            errors.push({
                code: 'INVALID_AMOUNTS',
                message: 'Non-numeric values found in amount fields.',
                solution: 'Please ensure all amount fields contain only numbers.',
                details: {
                    invalidAmounts: Array.from(invalidAmounts).slice(0, 10) // Show first 10
                }
            });
        }

        if (invalidRows > 0) {
            const percentageInvalid = (invalidRows / data.length * 100).toFixed(1);
            if (percentageInvalid > 20) {
                warnings.push({
                    code: 'HIGH_ERROR_RATE',
                    message: `${invalidRows} rows (${percentageInvalid}%) contain errors and will be skipped.`,
                    suggestion: 'Consider reviewing your data for systematic issues.'
                });
            } else {
                warnings.push({
                    code: 'INVALID_ROWS',
                    message: `${invalidRows} rows contain errors and will be skipped during processing.`
                });
            }
        }

        return { errors, warnings };
    }

    // Browser Compatibility Check
    checkBrowserCompatibility() {
        const issues = [];
        const warnings = [];

        // Check for required features
        if (!window.FileReader) {
            issues.push({
                code: 'NO_FILE_READER',
                message: 'Your browser does not support file reading.',
                solution: 'Please upgrade to a modern browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+).'
            });
        }

        if (!window.Worker) {
            warnings.push({
                code: 'NO_WEB_WORKERS',
                message: 'Web Workers not supported. Large files may cause browser to freeze.',
                suggestion: 'Consider upgrading your browser for better performance.'
            });
        }

        // Check localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            warnings.push({
                code: 'NO_LOCAL_STORAGE',
                message: 'Local storage not available. Settings and history will not be saved.',
                suggestion: 'Enable cookies and local storage in your browser settings.'
            });
        }

        return { issues, warnings };
    }

    // Error Display System
    displayError(error, container = null) {
        const errorContainer = container || document.getElementById('error-container') || this.createErrorContainer();
        
        const errorElement = document.createElement('div');
        errorElement.className = `error-message ${error.code ? error.code.toLowerCase() : 'general'}`;
        
        errorElement.innerHTML = `
            <div class="error-header">
                <div class="error-icon">⚠️</div>
                <div class="error-title">${error.message}</div>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            ${error.solution ? `
                <div class="error-solution">
                    <strong>Solution:</strong> ${error.solution}
                </div>
            ` : ''}
            ${error.suggestions ? `
                <div class="error-suggestions">
                    <strong>Suggestions:</strong>
                    <ul>
                        ${error.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${error.actions ? `
                <div class="error-actions">
                    ${error.actions.map(action => `
                        <button class="btn btn-secondary btn-small" onclick="(${action.action.toString()})()">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            ${error.details ? `
                <details class="error-details">
                    <summary>Technical Details</summary>
                    <pre>${JSON.stringify(error.details, null, 2)}</pre>
                </details>
            ` : ''}
        `;

        errorContainer.appendChild(errorElement);
        
        // Auto-remove after 10 seconds for warnings
        if (error.code && error.code.includes('WARNING')) {
            setTimeout(() => {
                if (errorElement.parentElement) {
                    errorElement.remove();
                }
            }, 10000);
        }

        return errorElement;
    }

    // Memory Management
    checkMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            
            if (usagePercent > 80) {
                return {
                    warning: true,
                    message: `High memory usage detected (${usagePercent.toFixed(1)}%)`,
                    suggestion: 'Consider closing other tabs or processing smaller files.'
                };
            }
        }
        return null;
    }

    // Utility Methods
    isValidExcelFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const validExtensions = ['.xlsx', '.xls'];
        
        return validTypes.includes(file.type) || 
               validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    suggestColumnMapping(userColumns, requiredColumns) {
        const mapping = {};
        
        requiredColumns.forEach(required => {
            const match = userColumns.find(col => 
                col.toLowerCase().includes(required.toLowerCase()) ||
                required.toLowerCase().includes(col.toLowerCase())
            );
            if (match) {
                mapping[required] = match;
            }
        });
        
        return mapping;
    }

    createErrorContainer() {
        let container = document.getElementById('error-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'error-container';
            container.className = 'error-container';
            document.body.appendChild(container);
        }
        return container;
    }

    downloadSampleTemplate() {
        // Create sample Excel data
        const sampleData = [
            ['TaxCode', 'TaxDescription', 'TrCode', 'TaxRate', 'TaxAmount', 'ExclAmount', 'InclAmount'],
            ['CASH', 'Cash Sale', 'SINV', 15, 150.00, 1000.00, 1150.00],
            ['JC', 'Journal Credit', 'JNL', 15, 75.00, 500.00, 575.00],
            ['IS', 'Invoice Sale', 'INV', 15, 300.00, 2000.00, 2300.00]
        ];

        // Convert to CSV and download
        const csv = sampleData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vat-calculator-sample-template.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Error Logging
    logError(error) {
        this.errorLog.push(error);
        
        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog.shift();
        }

        // Store in localStorage for debugging
        try {
            localStorage.setItem('vatCalculatorErrors', JSON.stringify(this.errorLog.slice(-10)));
        } catch (e) {
            console.warn('Could not save error log to localStorage');
        }

        // Console log for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('VAT Calculator Error:', error);
        }
    }

    // User Feedback System
    showErrorReportForm(error) {
        const modal = document.createElement('div');
        modal.className = 'error-report-modal';
        modal.innerHTML = `
            <div class="error-report-content">
                <h3>Report an Issue</h3>
                <p>Help us improve by reporting this error:</p>
                <textarea id="error-description" placeholder="Describe what you were trying to do when this error occurred..."></textarea>
                <div class="error-report-actions">
                    <button class="btn btn-primary" onclick="errorHandler.submitErrorReport('${error.code}', this)">Send Report</button>
                    <button class="btn btn-secondary" onclick="this.closest('.error-report-modal').remove()">Cancel</button>
                </div>
                <p class="error-privacy">Your report helps us fix issues. No personal data is shared.</p>
            </div>
        `;
        document.body.appendChild(modal);
    }

    submitErrorReport(errorCode, button) {
        const description = document.getElementById('error-description').value;
        
        // In a real implementation, this would send to an error reporting service
        console.log('Error report submitted:', { errorCode, description });
        
        button.textContent = 'Sent!';
        button.disabled = true;
        
        setTimeout(() => {
            document.querySelector('.error-report-modal').remove();
        }, 2000);
    }
}

// Initialize global error handler
const errorHandler = new ErrorHandler();
