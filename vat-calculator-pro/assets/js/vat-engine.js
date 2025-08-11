// VAT Calculator Pro - Core Calculation Engine
// Preserves all working calculation logic from the original monolithic application

// South African VAT Configuration
const TAX_CODES = {
    '1': { description: 'Standard Rate VAT (15%)', rate: 15 },
    '3': { description: 'Zero Rated VAT (0%)', rate: 0 },
    '5': { description: 'Exempt VAT (0%)', rate: 0 }
};

const VAT_INPUT_CODES = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'];
const VAT_OUTPUT_CODES = ['IS', 'INV', 'RTS'];

// Global variables
let currentFile = null;
let processedData = null;

/**
 * Core VAT calculation function - WORKING LOGIC PRESERVED
 * @param {Array} data - Validated Excel data
 * @returns {Object} - VAT calculation results
 */
function calculateVAT(data) {
    const results = {
        totalInputVAT: 0,
        totalOutputVAT: 0,
        salesExcludingVAT: 0,
        salesIncludingVAT: 0,
        zeroRatedSales: 0,
        taxCodeBreakdown: {}
    };

    // Initialize tax code breakdowns
    for (const [code, info] of Object.entries(TAX_CODES)) {
        results.taxCodeBreakdown[code] = {
            description: info.description,
            rate: info.rate,
            input: {
                count: 0,
                vatAmount: 0,
                exclAmount: 0,
                transactions: []
            },
            output: {
                count: 0,
                vatAmount: 0,
                exclAmount: 0,
                transactions: []
            }
        };
    }

    // Process each transaction
    data.forEach(row => {
        const taxCode = row.TaxCode;
        const trCode = row.TrCode;
        const taxAmount = row.TaxAmount;
        const exclAmount = row.ExclAmount;

        // Determine if this is INPUT or OUTPUT
        const isInput = VAT_INPUT_CODES.includes(trCode);
        const isOutput = VAT_OUTPUT_CODES.includes(trCode);

        if (!isInput && !isOutput) {
            console.warn(`Unknown TrCode: ${trCode}, skipping transaction`);
            return;
        }

        // Add to appropriate category
        const category = isInput ? 'input' : 'output';
        const breakdown = results.taxCodeBreakdown[taxCode][category];

        breakdown.count++;
        breakdown.vatAmount += taxAmount;
        breakdown.exclAmount += exclAmount;

        // Store all transactions for detailed reporting
        breakdown.transactions.push({
            TrCode: trCode,
            TaxAmount: taxAmount,
            ExclAmount: exclAmount,
            InclAmount: row.InclAmount,
            TaxDescription: row.TaxDescription,
            TxDate: row.TxDate,
            Reference: row.Reference
        });

        // Add to totals
        if (isInput) {
            results.totalInputVAT += taxAmount;
        } else {
            results.totalOutputVAT += taxAmount;
            results.salesExcludingVAT += exclAmount;
            
            // Zero-rated sales (Tax Code 3)
            if (taxCode === '3') {
                results.zeroRatedSales += exclAmount;
            }
        }
    });

    // Calculate final values
    results.salesIncludingVAT = results.salesExcludingVAT + results.totalOutputVAT;
    results.vatPayable = results.totalOutputVAT - results.totalInputVAT;

    console.log('VAT Calculation Results:', results);
    return results;
}

/**
 * Validates Excel data structure - WORKING LOGIC PRESERVED
 * @param {Object} workbook - XLSX workbook object
 * @returns {Array} - Validated transaction data
 */
function validateExcelData(workbook) {
    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        throw new Error('No worksheets found in the Excel file.');
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
        throw new Error('The Excel file appears to be empty.');
    }

    // Check required columns
    const requiredColumns = ['TaxCode', 'TaxDescription', 'TrCode', 'TaxRate', 'TaxAmount', 'ExclAmount', 'InclAmount'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate data types and values
    const validatedData = data.map((row, index) => {
        const rowNum = index + 2; // Excel row number (accounting for header)

        // Validate TaxCode
        if (!TAX_CODES[String(row.TaxCode)]) {
            console.warn(`Row ${rowNum}: Invalid TaxCode "${row.TaxCode}", skipping`);
            return null;
        }

        // Validate numeric fields
        const numericFields = ['TaxRate', 'TaxAmount', 'ExclAmount', 'InclAmount'];
        for (const field of numericFields) {
            if (isNaN(Number(row[field]))) {
                console.warn(`Row ${rowNum}: Invalid ${field} "${row[field]}", skipping`);
                return null;
            }
        }

        // Convert to proper types and preserve additional columns
        const processedRow = {
            TaxCode: String(row.TaxCode),
            TaxDescription: String(row.TaxDescription || ''),
            TrCode: String(row.TrCode || '').toUpperCase(),
            TaxRate: Number(row.TaxRate) || 0,
            TaxAmount: Number(row.TaxAmount) || 0,
            ExclAmount: Number(row.ExclAmount) || 0,
            InclAmount: Number(row.InclAmount) || 0,
            
            // Preserve additional columns for export
            TxDate: row.TxDate || row.txDate || row.TransactionDate || row.Date || '',
            Reference: row.Reference || row.reference || row.Ref || row.RefNo || '',
            TmDescription: row.TmDescription || row.tmDescription || row.Description || '',
            TaxType: row.TaxType || row.taxType || '',
            Reference2: row.Reference2 || row.reference2 || '',
            Order_No: row.Order_No || row.OrderNo || row.order_no || '',
            cAuditNumber: row.cAuditNumber || row.AuditNumber || row.auditNumber || '',
            DTStamp: row.DTStamp || row.dtStamp || row.DateStamp || row.Timestamp || ''
        };

        return processedRow;
    }).filter(row => row !== null);

    if (validatedData.length === 0) {
        throw new Error('No valid data rows found in the Excel file.');
    }

    console.log(`Validated ${validatedData.length} rows of data`);
    return validatedData;
}

/**
 * Reads Excel file using XLSX library - WORKING LOGIC PRESERVED
 * @param {File} file - File object from file input
 * @returns {Promise<Object>} - XLSX workbook object
 */
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                resolve(workbook);
            } catch (error) {
                reject(new Error('Failed to read Excel file. Please ensure it\'s a valid Excel file.'));
            }
        };
        reader.onerror = function() {
            reject(new Error('Failed to read file.'));
        };
        reader.readAsBinaryString(file);
    });
}

/**
 * Updates processing progress - WORKING LOGIC PRESERVED
 * @param {number} step - Current step (1-4)
 * @param {string} message - Progress message
 * @returns {Promise<void>}
 */
async function updateProgress(step, message) {
    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = (step / 4) * 100;
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }

    // Update step status
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (stepElement) {
            if (i < step) {
                stepElement.className = 'progress-step completed';
            } else if (i === step) {
                stepElement.className = 'progress-step active';
            } else {
                stepElement.className = 'progress-step';
            }
        }
    }

    // Add a small delay to make the progress visible
    await new Promise(resolve => setTimeout(resolve, 800));
}

/**
 * Main file processing function - WORKING LOGIC PRESERVED
 * @returns {Promise<void>}
 */
async function processFile() {
    if (!currentFile) {
        alert('Please select a file first.');
        return;
    }

    try {
        // Step 1: Read Excel file
        await updateProgress(1, 'Reading Excel file...');
        const workbook = await readExcelFile(currentFile);

        // Step 2: Validate data
        await updateProgress(2, 'Validating data structure...');
        const data = validateExcelData(workbook);

        // Step 3: Calculate VAT
        await updateProgress(3, 'Calculating VAT totals...');
        const results = calculateVAT(data);

        // Step 4: Generate report
        await updateProgress(4, 'Generating professional report...');
        processedData = results;
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Final pause for effect

        // Store for managers if they exist
        if (typeof enhancedCalculateVAT === 'function') {
            enhancedCalculateVAT(data, currentFile.name);
        }

        return results;

    } catch (error) {
        console.error('Processing error:', error);
        throw error;
    }
}

/**
 * Formats currency values for display - WORKING LOGIC PRESERVED
 * @param {number} amount - Currency amount
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    return 'R ' + Number(amount).toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Loads XLSX library if not already loaded
 * @returns {Promise<void>}
 */
async function loadXLSXLibrary() {
    if (typeof XLSX !== 'undefined') {
        return; // Already loaded
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateVAT,
        validateExcelData,
        readExcelFile,
        processFile,
        formatCurrency,
        TAX_CODES,
        VAT_INPUT_CODES,
        VAT_OUTPUT_CODES
    };
}
