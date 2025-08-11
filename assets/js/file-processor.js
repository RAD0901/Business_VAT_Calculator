// File Processor - Handles Excel file upload and validation

// File Upload Functions
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
    statusDiv.className = 'file-status';
    statusDiv.style.display = 'none';

    // Check file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                      'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && 
        !file.name.toLowerCase().endsWith('.xlsx') && 
        !file.name.toLowerCase().endsWith('.xls')) {
        showFileStatus('error', 'Invalid file type. Please upload a .xlsx or .xls file.');
        processBtn.disabled = true;
        return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
        showFileStatus('error', 'File is too large. Maximum size is 50MB.');
        processBtn.disabled = true;
        return;
    }

    // File is valid
    currentFile = file;
    showFileStatus('success', `File "${file.name}" is ready for processing (${formatFileSize(file.size)})`);
    processBtn.disabled = false;
}

function showFileStatus(type, message) {
    const statusDiv = document.getElementById('file-status');
    statusDiv.className = `file-status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
}

// Drag and Drop Functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.querySelector('.upload-zone');
    
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
                document.getElementById('file-input').files = files;
                validateFile(file);
            }
        });
    }
});

// File Processing Functions
async function processFile() {
    if (!currentFile) {
        alert('Please select a file first.');
        return;
    }

    // Navigate to processing page
    navigateToPage('processing');

    try {
        // Step 1: Read Excel file
        await updateProgress(1, 'Reading Excel file...');
        const workbook = await readExcelFile(currentFile);

        // Step 2: Validate data
        await updateProgress(2, 'Validating data structure...');
        const data = validateExcelData(workbook);

        // Step 3: Calculate VAT
        await updateProgress(3, 'Calculating VAT totals...');
        const results = calculateVAT(data, currentFile.name);

        // Step 4: Generate report
        await updateProgress(4, 'Generating professional report...');
        processedData = results;
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Final pause for effect

        // Navigate to results
        displayResults(results);
        navigateToPage('results');

    } catch (error) {
        console.error('Processing error:', error);
        alert('Error processing file: ' + error.message);
        navigateToPage('upload');
    }
}

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

        // Convert to proper types
        return {
            TaxCode: String(row.TaxCode),
            TaxDescription: String(row.TaxDescription || ''),
            TrCode: String(row.TrCode || '').toUpperCase(),
            TaxRate: Number(row.TaxRate) || 0,
            TaxAmount: Number(row.TaxAmount) || 0,
            ExclAmount: Number(row.ExclAmount) || 0,
            InclAmount: Number(row.InclAmount) || 0
        };
    }).filter(row => row !== null);

    if (validatedData.length === 0) {
        throw new Error('No valid data rows found in the Excel file.');
    }

    console.log(`Validated ${validatedData.length} rows of data`);
    return validatedData;
}

async function updateProgress(step, message) {
    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = (step / 4) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Update step status
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (i < step) {
            stepElement.className = 'progress-step completed';
        } else if (i === step) {
            stepElement.className = 'progress-step active';
        } else {
            stepElement.className = 'progress-step';
        }
    }

    // Add a small delay to make the progress visible
    await new Promise(resolve => setTimeout(resolve, 800));
}
