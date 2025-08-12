// Enhanced Export Manager with Detailed Reports
class DetailedExportManager {
    constructor() {
        this.currentData = null;
        this.currentTransactions = null;
        this.currentFilename = '';
        this.reportTemplate = null;
        this.initializeExportSystem();
    }

    initializeExportSystem() {
        // Add advanced export buttons to existing toolbar
        this.enhanceExportToolbar();
        
        // Initialize report templates
        this.setupReportTemplates();
        
        // Setup export event listeners
        this.setupExportHandlers();
    }

    // Helper function to apply Short Date formatting to specific date columns
    applyDateFormatting(worksheet, dateColumnIndexes, startRow = 1) {
        if (!worksheet['!ref']) return;
        
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        dateColumnIndexes.forEach(colIndex => {
            const colLetter = XLSX.utils.encode_col(colIndex);
            
            for (let row = startRow; row <= range.e.r; row++) {
                const cellAddress = colLetter + (row + 1);
                if (worksheet[cellAddress]) {
                    // Initialize cell style if it doesn't exist
                    if (!worksheet[cellAddress].s) {
                        worksheet[cellAddress].s = {};
                    }
                    // Apply Short Date format (Excel format code for short date)
                    worksheet[cellAddress].s.numFmt = 'dd/mm/yyyy';
                }
            }
        });
    }

    // Helper function to identify date column indexes by header name
    getDateColumnIndexes(headers, dateColumnNames = ['TxDate', 'Date', 'TransactionDate']) {
        const indexes = [];
        headers.forEach((header, index) => {
            if (dateColumnNames.includes(header)) {
                indexes.push(index);
            }
        });
        return indexes;
    }

    // Helper function to apply number formatting to monetary columns
    applyNumberFormatting(worksheet, numberColumnIndexes, startRow = 1) {
        if (!worksheet['!ref']) return;
        
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        numberColumnIndexes.forEach(colIndex => {
            const colLetter = XLSX.utils.encode_col(colIndex);
            
            for (let row = startRow; row <= range.e.r; row++) {
                const cellAddress = colLetter + (row + 1);
                if (worksheet[cellAddress]) {
                    // Ensure the cell value is numeric
                    const cellValue = worksheet[cellAddress].v;
                    if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                        // Convert to number if it's not already
                        const numValue = typeof cellValue === 'number' ? cellValue : parseFloat(String(cellValue));
                        if (!isNaN(numValue)) {
                            worksheet[cellAddress].v = numValue;
                            worksheet[cellAddress].t = 'n'; // Set type to number
                            
                            // Apply number formatting
                            if (!worksheet[cellAddress].s) {
                                worksheet[cellAddress].s = {};
                            }
                            // Apply consistent number format with 2 decimal places
                            worksheet[cellAddress].s.numFmt = '#,##0.00';
                        }
                    }
                }
            }
        });
    }

    // Enhanced helper function with better debugging and number validation
    applyArrayWorksheetFormatting(worksheet, monetaryColumnIndexes = [], dateColumnIndexes = [], startRow = 0) {
        if (!worksheet['!ref']) return;
        
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        console.log(`Applying formatting to columns: ${monetaryColumnIndexes.join(', ')}, rows: ${startRow} to ${range.e.r}`);
        
        // Apply number formatting to monetary columns - scan ALL rows
        monetaryColumnIndexes.forEach(colIndex => {
            const colLetter = XLSX.utils.encode_col(colIndex);
            console.log(`Processing column ${colLetter} (index ${colIndex})`);
            
            for (let row = Math.max(startRow, 0); row <= range.e.r; row++) {
                const cellAddress = colLetter + (row + 1);
                if (worksheet[cellAddress]) {
                    const cellValue = worksheet[cellAddress].v;
                    console.log(`Cell ${cellAddress}: original value = ${cellValue} (type: ${typeof cellValue})`);
                    
                    if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                        // More robust number conversion
                        let numValue;
                        if (typeof cellValue === 'number') {
                            numValue = cellValue;
                        } else {
                            // Try to convert string to number
                            const cleanValue = String(cellValue).replace(/[^\d.-]/g, ''); // Remove non-numeric chars except decimal and minus
                            numValue = parseFloat(cleanValue);
                        }
                        
                        if (!isNaN(numValue) && isFinite(numValue)) {
                            // Force the cell to be a number type in Excel
                            worksheet[cellAddress].v = numValue;
                            worksheet[cellAddress].t = 'n'; // Explicitly set as number type
                            
                            // Ensure styles object exists
                            if (!worksheet[cellAddress].s) {
                                worksheet[cellAddress].s = {};
                            }
                            
                            // Apply number format with thousands separator and 2 decimal places
                            worksheet[cellAddress].s.numFmt = '#,##0.00';
                            
                            console.log(`Cell ${cellAddress}: converted to number = ${numValue}, type = n`);
                        } else {
                            console.log(`Cell ${cellAddress}: failed to convert to number (${cellValue} -> ${numValue})`);
                        }
                    }
                }
            }
        });
        
        // Apply date formatting to date columns
        dateColumnIndexes.forEach(colIndex => {
            const colLetter = XLSX.utils.encode_col(colIndex);
            
            for (let row = Math.max(startRow, 0); row <= range.e.r; row++) {
                const cellAddress = colLetter + (row + 1);
                if (worksheet[cellAddress] && worksheet[cellAddress].v instanceof Date) {
                    if (!worksheet[cellAddress].s) {
                        worksheet[cellAddress].s = {};
                    }
                    worksheet[cellAddress].s.numFmt = 'dd/mm/yyyy';
                }
            }
        });
    }

    // Direct cell modification approach - bypasses SheetJS formatting issues
    forceNumberCells(worksheet) {
        if (!worksheet['!ref']) return;
        
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        console.log('=== FORCING NUMBER CELLS ===');
        
        // Rebuild worksheet with proper number cells
        const newCells = {};
        
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellAddr];
                
                if (cell && cell.v !== undefined) {
                    // Create new cell object
                    const newCell = { v: cell.v };
                    
                    // Check if it's a number
                    if (typeof cell.v === 'number' && !isNaN(cell.v)) {
                        // Force number properties
                        newCell.t = 'n';
                        newCell.w = cell.v.toFixed(2); // Display value
                        
                        console.log(`Forced number cell ${cellAddr}: ${cell.v}`);
                    } else {
                        // Keep as string
                        newCell.t = 's';
                        newCell.w = String(cell.v);
                    }
                    
                    newCells[cellAddr] = newCell;
                }
            }
        }
        
        // Replace all cells
        Object.keys(worksheet).forEach(key => {
            if (key.match(/^[A-Z]+[0-9]+$/)) {
                delete worksheet[key];
            }
        });
        
        Object.assign(worksheet, newCells);
        
        console.log('Cell reconstruction complete');
    }

    // CRITICAL: Robust number formatting for Excel that actually works
    formatNumberForExcel(value) {
        // Handle null, undefined, empty string
        if (value === null || value === undefined || value === '') {
            return 0.00;
        }
        
        let numValue;
        
        // If it's already a number
        if (typeof value === 'number') {
            numValue = value;
        } 
        // If it's a string, clean it
        else if (typeof value === 'string') {
            // Remove any non-numeric characters except decimal point and minus sign
            const cleaned = value.replace(/[^\d.-]/g, '');
            numValue = parseFloat(cleaned);
        } 
        // Handle other types
        else {
            numValue = parseFloat(String(value));
        }
        
        // Validate the result
        if (isNaN(numValue) || !isFinite(numValue)) {
            console.warn('formatNumberForExcel: Invalid value detected:', value, '- returning 0');
            return 0.00;
        }
        
        // Round to exactly 2 decimal places
        const rounded = Math.round(numValue * 100) / 100;
        
        console.log(`formatNumberForExcel: "${value}" (${typeof value}) → ${rounded} (number)`);
        return rounded;
    }

    // Robust number conversion that works with aggregated data
    ensureExcelNumber(value) {
        // Handle various input types from calculated data
        let numValue = value;
        
        if (typeof value === 'string') {
            // Remove any formatting characters and convert
            numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
        } else if (typeof value === 'number') {
            numValue = value;
        }
        
        // Ensure it's a valid number
        if (isNaN(numValue) || !isFinite(numValue)) {
            console.warn('Invalid number detected:', value, '- returning 0');
            return 0.00;
        }
        
        // Round to exactly 2 decimal places to avoid floating point issues
        const rounded = Math.round(numValue * 100) / 100;
        
        console.log(`ensureExcelNumber: "${value}" (${typeof value}) → ${rounded} (number)`);
        return rounded;
    }
    
    // Auto-detect columns containing monetary amounts
    detectAmountColumns(worksheet, range) {
        const amountColumns = [];
        
        // Check header row for amount-related keywords
        for (let col = range.s.c; col <= range.e.c; col++) {
            const headerCell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
            if (headerCell && headerCell.v) {
                const header = headerCell.v.toString().toLowerCase();
                if (header.includes('amount') || header.includes('vat') || header.includes('total') || 
                    header.includes('excl') || header.includes('incl') || header.includes('(r)')) {
                    amountColumns.push(col);
                }
            }
        }
        
        return amountColumns;
    }

    // Ultra-simple direct Excel number formatting function
    applyDirectNumberFormatting(worksheet, column, startRow, endRow) {
        console.log(`=== FORMATTING DEBUG: Column ${column}, rows ${startRow}-${endRow} ===`);
        
        if (!worksheet['!ref']) {
            console.log('ERROR: No worksheet range found');
            return;
        }
        
        for (let row = startRow; row <= endRow; row++) {
            const cellRef = column + row;
            console.log(`Checking cell ${cellRef}...`);
            
            if (worksheet[cellRef]) {
                const originalValue = worksheet[cellRef].v;
                console.log(`Cell ${cellRef} original value: ${originalValue} (type: ${typeof originalValue})`);
                
                if (originalValue !== undefined && originalValue !== null && originalValue !== '') {
                    // Convert to number
                    let numValue = originalValue;
                    if (typeof originalValue !== 'number') {
                        numValue = parseFloat(originalValue);
                    }
                    
                    if (!isNaN(numValue) && isFinite(numValue)) {
                        // Set the cell properties for Excel number formatting
                        worksheet[cellRef].v = numValue;
                        worksheet[cellRef].t = 'n'; // Number type
                        
                        // Set number format using the 'z' property
                        worksheet[cellRef].z = '#,##0.00';
                        
                        console.log(`SUCCESS: Cell ${cellRef} formatted as number: ${numValue}`);
                    } else {
                        console.log(`FAILED: Could not convert ${originalValue} to number`);
                    }
                } else {
                    console.log(`SKIP: Cell ${cellRef} is empty or undefined`);
                }
            } else {
                console.log(`SKIP: Cell ${cellRef} does not exist`);
            }
        }
        console.log(`=== END FORMATTING DEBUG ===`);
    }

    // Helper function to ensure a value is a proper number for Excel
    ensureNumber(value) {
        if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
            return parseFloat(value.toFixed(2)); // Ensure 2 decimal places
        }
        
        if (typeof value === 'string') {
            const cleaned = value.replace(/[^\d.-]/g, ''); // Remove non-numeric characters
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed) && isFinite(parsed)) {
                return parseFloat(parsed.toFixed(2));
            }
        }
        
        return 0.00; // Default to 0 if conversion fails
    }

    // Old helper functions removed - using comprehensive applyArrayWorksheetFormatting instead

    enhanceExportToolbar() {
        const existingToolbar = document.querySelector('.export-toolbar');
        if (existingToolbar) {
            // Add detailed export section
            const detailedExportSection = document.createElement('div');
            detailedExportSection.className = 'detailed-export-section';
            detailedExportSection.innerHTML = `
                <div class="export-section-title">📊 Detailed Reports</div>
                <div class="detailed-export-buttons">
                    <button class="btn btn-export detailed-pdf" onclick="detailedExportManager.exportDetailedPDF()" title="Detailed PDF Report with Complete Analysis">
                        📄 Detailed PDF Report
                    </button>
                    <button class="btn btn-export comprehensive-excel" onclick="detailedExportManager.exportComprehensiveExcel()" title="Complete Excel Analysis with All Data">
                        📊 Complete Excel Analysis
                    </button>
                    <button class="btn btn-export tax-breakdown" onclick="detailedExportManager.exportTaxCodeBreakdown()" title="Tax Code Breakdown Report">
                        🔍 Tax Code Analysis
                    </button>
                    <button class="btn btn-export transaction-details" onclick="detailedExportManager.exportTransactionDetails()" title="Full Transaction Details">
                        📋 Transaction Details
                    </button>
                </div>
                <div class="export-options">
                    <label class="export-option">
                        <input type="checkbox" id="include-samples" checked>
                        Include sample transactions
                    </label>
                    <label class="export-option">
                        <input type="checkbox" id="include-charts" checked>
                        Include visual charts
                    </label>
                    <label class="export-option">
                        <input type="checkbox" id="include-analysis" checked>
                        Include detailed analysis
                    </label>
                </div>
            `;
            
            existingToolbar.appendChild(detailedExportSection);
        }
    }

    setData(data) {
        this.currentData = data;
        this.currentTransactions = data.transactions || [];
        this.currentFilename = data.filename || 'VAT_Analysis';
        console.log('Detailed Export Manager: Data set successfully');
    }

    // COMPREHENSIVE PDF EXPORT WITH FULL DETAILS
    async exportDetailedPDF() {
        if (!this.currentData) {
            alert('No calculation data available for export');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            let yPos = 20;
            const pageHeight = 280;
            const leftMargin = 20;
            const rightMargin = 190;
            
            // Enhanced styling
            pdf.setFont('helvetica');
            
            // HEADER SECTION
            pdf.setFontSize(22);
            pdf.setTextColor(70, 130, 180);
            pdf.text('VAT CALCULATOR PRO', leftMargin, yPos);
            
            pdf.setFontSize(18);
            pdf.setTextColor(0, 0, 0);
            yPos += 10;
            pdf.text('Comprehensive VAT Analysis Report', leftMargin, yPos);
            
            // Report metadata
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            yPos += 8;
            pdf.text(`Generated: ${new Date().toLocaleString()}`, leftMargin, yPos);
            yPos += 5;
            pdf.text(`Source File: ${this.currentFilename}`, leftMargin, yPos);
            yPos += 5;
            pdf.text(`Total Transactions: ${this.currentTransactions.length.toLocaleString()}`, leftMargin, yPos);
            
            // Separator line
            yPos += 10;
            pdf.setLineWidth(0.5);
            pdf.line(leftMargin, yPos, rightMargin, yPos);
            yPos += 15;

            // EXECUTIVE SUMMARY SECTION
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.text('📋 EXECUTIVE SUMMARY', leftMargin, yPos);
            yPos += 10;
            
            // Summary box
            pdf.setDrawColor(70, 130, 180);
            pdf.setLineWidth(0.3);
            pdf.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 35);
            
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            yPos += 5;
            pdf.text(`Total Input VAT (Purchases):`, leftMargin + 5, yPos);
            pdf.text(`R ${this.formatCurrency(this.currentData.totalInputVAT)}`, 120, yPos);
            
            yPos += 7;
            pdf.text(`Total Output VAT (Sales):`, leftMargin + 5, yPos);
            pdf.text(`R ${this.formatCurrency(this.currentData.totalOutputVAT)}`, 120, yPos);
            
            yPos += 7;
            pdf.setFont('helvetica', 'bold');
            const vatPayableLabel = this.currentData.vatPayable >= 0 ? 'VAT Payable:' : 'VAT Refund:';
            pdf.text(vatPayableLabel, leftMargin + 5, yPos);
            pdf.text(`R ${this.formatCurrency(Math.abs(this.currentData.vatPayable))}`, 120, yPos);
            
            yPos += 7;
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Sales Excluding VAT:`, leftMargin + 5, yPos);
            pdf.text(`R ${this.formatCurrency(this.currentData.salesExcludingVAT)}`, 120, yPos);
            
            yPos += 15;

            // TAX CODE BREAKDOWN SECTIONS
            for (const [taxCode, breakdown] of Object.entries(this.currentData.taxCodeBreakdown)) {
                // Skip empty tax codes
                if (breakdown.input.count === 0 && breakdown.output.count === 0) {
                    continue;
                }

                // Check if we need a new page
                if (yPos > pageHeight - 60) {
                    pdf.addPage();
                    yPos = 20;
                }

                // Tax Code Header
                pdf.setFontSize(14);
                pdf.setTextColor(106, 90, 205);
                pdf.text(`Tax Code ${taxCode}: ${breakdown.description} (${breakdown.rate}%)`, leftMargin, yPos);
                yPos += 10;

                // Input VAT Section
                if (breakdown.input.count > 0) {
                    pdf.setFontSize(12);
                    pdf.setTextColor(220, 20, 60);
                    pdf.text('📥 INPUT VAT (Purchases)', leftMargin + 5, yPos);
                    yPos += 8;
                    
                    pdf.setFontSize(10);
                    pdf.setTextColor(0, 0, 0);
                    pdf.text(`Transactions: ${breakdown.input.count.toLocaleString()}`, leftMargin + 10, yPos);
                    pdf.text(`VAT Amount: R ${this.formatCurrency(breakdown.input.vatAmount)}`, 100, yPos);
                    yPos += 5;
                    pdf.text(`Excl Amount: R ${this.formatCurrency(breakdown.input.exclAmount)}`, leftMargin + 10, yPos);
                    yPos += 8;

                    // Sample input transactions
                    if (breakdown.input.transactions.length > 0 && document.getElementById('include-samples')?.checked !== false) {
                        pdf.setFontSize(9);
                        pdf.setTextColor(100, 100, 100);
                        pdf.text('Sample Input Transactions:', leftMargin + 10, yPos);
                        yPos += 5;

                        breakdown.input.transactions.slice(0, 5).forEach((transaction, index) => {
                            const sampleText = `${transaction.TrCode}: R ${this.formatNumber(transaction.ExclAmount)} (VAT: R ${this.formatNumber(transaction.TaxAmount)})`;
                            pdf.text(`• ${sampleText}`, leftMargin + 15, yPos);
                            yPos += 4;
                        });
                        yPos += 3;
                    }
                }

                // Output VAT Section
                if (breakdown.output.count > 0) {
                    pdf.setFontSize(12);
                    pdf.setTextColor(30, 144, 255);
                    pdf.text('📤 OUTPUT VAT (Sales)', leftMargin + 5, yPos);
                    yPos += 8;
                    
                    pdf.setFontSize(10);
                    pdf.setTextColor(0, 0, 0);
                    pdf.text(`Transactions: ${breakdown.output.count.toLocaleString()}`, leftMargin + 10, yPos);
                    pdf.text(`VAT Amount: R ${this.formatCurrency(breakdown.output.vatAmount)}`, 100, yPos);
                    yPos += 5;
                    pdf.text(`Excl Amount: R ${this.formatCurrency(breakdown.output.exclAmount)}`, leftMargin + 10, yPos);
                    yPos += 8;

                    // Sample output transactions
                    if (breakdown.output.transactions.length > 0 && document.getElementById('include-samples')?.checked !== false) {
                        pdf.setFontSize(9);
                        pdf.setTextColor(100, 100, 100);
                        pdf.text('Sample Output Transactions:', leftMargin + 10, yPos);
                        yPos += 5;

                        breakdown.output.transactions.slice(0, 5).forEach((transaction, index) => {
                            const sampleText = `${transaction.TrCode}: R ${this.formatNumber(transaction.ExclAmount)} (VAT: R ${this.formatNumber(transaction.TaxAmount)})`;
                            pdf.text(`• ${sampleText}`, leftMargin + 15, yPos);
                            yPos += 4;
                        });
                        yPos += 3;
                    }
                }

                // Separator
                yPos += 5;
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.2);
                pdf.line(leftMargin, yPos, rightMargin, yPos);
                yPos += 10;
            }

            // DETAILED ANALYSIS SECTION (if enabled)
            if (document.getElementById('include-analysis')?.checked !== false) {
                if (yPos > pageHeight - 40) {
                    pdf.addPage();
                    yPos = 20;
                }

                pdf.setFontSize(16);
                pdf.setTextColor(0, 0, 0);
                pdf.text('🔍 DETAILED ANALYSIS', leftMargin, yPos);
                yPos += 15;

                // Transaction Code Analysis
                const trCodeStats = this.generateTransactionCodeStats();
                pdf.setFontSize(12);
                pdf.text('Transaction Code Distribution:', leftMargin, yPos);
                yPos += 8;

                pdf.setFontSize(10);
                Object.entries(trCodeStats).forEach(([code, stats]) => {
                    pdf.text(`${code}: ${stats.count} transactions (R ${this.formatCurrency(stats.total)})`, leftMargin + 5, yPos);
                    yPos += 5;
                });

                yPos += 10;

                // VAT Rate Analysis
                pdf.setFontSize(12);
                pdf.text('VAT Rate Breakdown:', leftMargin, yPos);
                yPos += 8;

                const rateAnalysis = this.generateVATRateAnalysis();
                pdf.setFontSize(10);
                Object.entries(rateAnalysis).forEach(([rate, data]) => {
                    pdf.text(`${rate}% Rate: ${data.transactions} transactions (Total: R ${this.formatCurrency(data.amount)})`, leftMargin + 5, yPos);
                    yPos += 5;
                });
            }

            // Footer with page numbers
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Page ${i} of ${pageCount}`, rightMargin - 30, 290);
                pdf.text('Generated by VAT Calculator Pro', leftMargin, 290);
            }

            // Save the PDF
            const filename = `VAT_Detailed_Report_${this.currentFilename}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
            this.showExportSuccess('Detailed PDF report exported successfully');

        } catch (error) {
            console.error('Detailed PDF export error:', error);
            alert('Error generating detailed PDF report: ' + error.message);
        }
    }

    // COMPREHENSIVE EXCEL EXPORT WITH MULTIPLE SHEETS
    exportComprehensiveExcel() {
        console.log('=== CRITICAL DEBUGGING FOR EXCEL FORMATTING ISSUE ===');
        console.log('Source data inspection:');
        console.log('totalInputVAT:', this.currentData?.totalInputVAT, 'Type:', typeof this.currentData?.totalInputVAT);
        console.log('totalOutputVAT:', this.currentData?.totalOutputVAT, 'Type:', typeof this.currentData?.totalOutputVAT);
        console.log('vatPayable:', this.currentData?.vatPayable, 'Type:', typeof this.currentData?.vatPayable);
        
        // Test parseFloat conversion
        if (this.currentData) {
            console.log('parseFloat(totalInputVAT):', parseFloat(this.currentData.totalInputVAT));
            console.log('parseFloat(totalOutputVAT):', parseFloat(this.currentData.totalOutputVAT));
            console.log('parseFloat(vatPayable):', parseFloat(this.currentData.vatPayable));
        }
        console.log('==========================================');
        
        if (!this.currentData) {
            alert('No calculation data available for export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // MAXIMUM Excel compatibility settings
            wb.Props = {
                Title: "VAT Calculator Pro - Comprehensive Analysis",
                Subject: "VAT Analysis Report",
                Author: "VAT Calculator Pro",
                CreatedDate: new Date()
            };
            
            // Force Excel to recognize number formatting
            wb.Workbook = {
                Views: [{ RTL: false }],
                WBProps: { 
                    date1904: false,
                    defaultThemeVersion: 124226,
                    filterPrivacy: 1 
                }
            };
            
            // Add number formats to workbook
            wb.SSF = {
                0x4: '#,##0.00'  // Force number format registration
            };
            
            console.log('=== WORKBOOK SETUP DEBUG ===');
            console.log('Maximum Excel compatibility enabled with forced number format support');

            // SHEET 1: Executive Summary with robust number conversion
            const summaryData = [
                ['VAT CALCULATOR PRO - COMPREHENSIVE ANALYSIS'],
                [`Generated: ${new Date().toLocaleString()}`],
                [`Source File: ${this.currentFilename}`],
                [`Total Transactions: ${this.currentTransactions.length.toLocaleString()}`],
                [''],
                ['EXECUTIVE SUMMARY'],
                ['Metric', 'Amount (R)'],
                ['Total Input VAT (Purchases)', this.formatNumberForExcel(this.currentData.totalInputVAT)],
                ['Total Output VAT (Sales)', this.formatNumberForExcel(this.currentData.totalOutputVAT)],
                ['VAT Payable/Refund', this.formatNumberForExcel(this.currentData.vatPayable)],
                ['Sales Excluding VAT', this.formatNumberForExcel(this.currentData.salesExcludingVAT)],
                ['Sales Including VAT', this.formatNumberForExcel(this.currentData.salesIncludingVAT)],
                ['Zero-Rated Sales', this.formatNumberForExcel(this.currentData.zeroRatedSales)],
                [''],
                ['BREAKDOWN BY TAX CODE'],
                ['Tax Code', 'Description', 'Rate %', 'Input Count', 'Input VAT', 'Input Excl', 'Output Count', 'Output VAT', 'Output Excl']
            ];

            console.log('=== EXECUTIVE SUMMARY ROBUST NUMBER DEBUG ===');
            console.log('Sample processed values:');
            console.log('totalInputVAT original:', this.currentData.totalInputVAT, typeof this.currentData.totalInputVAT);
            console.log('totalInputVAT processed:', summaryData[7][1], typeof summaryData[7][1]);
            console.log('totalOutputVAT original:', this.currentData.totalOutputVAT, typeof this.currentData.totalOutputVAT);
            console.log('totalOutputVAT processed:', summaryData[8][1], typeof summaryData[8][1]);

            // Add tax code breakdown data with robust number conversion
            Object.entries(this.currentData.taxCodeBreakdown).forEach(([code, breakdown]) => {
                if (breakdown.input.count > 0 || breakdown.output.count > 0) {
                    summaryData.push([
                        code,
                        breakdown.description,
                        breakdown.rate,
                        breakdown.input.count,
                        this.formatNumberForExcel(breakdown.input.vatAmount),
                        this.formatNumberForExcel(breakdown.input.exclAmount),
                        breakdown.output.count,
                        this.formatNumberForExcel(breakdown.output.vatAmount),
                        this.formatNumberForExcel(breakdown.output.exclAmount)
                    ]);
                }
            });

            const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
            
            console.log('=== EXECUTIVE SUMMARY SIMPLIFIED APPROACH ===');
            console.log('Using parseFloat() directly like Tax Code Details');
            
            // Style the summary sheet
            summaryWS['!cols'] = [
                { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, 
                { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
            ];
            XLSX.utils.book_append_sheet(wb, summaryWS, 'Executive Summary');

            // SHEET 2: Tax Code Details with formatted monetary values
            const taxCodeData = [['TAX CODE DETAILED BREAKDOWN'], ['']];

            Object.entries(this.currentData.taxCodeBreakdown).forEach(([code, breakdown]) => {
                if (breakdown.input.count > 0 || breakdown.output.count > 0) {
                    taxCodeData.push([`TAX CODE ${code}: ${breakdown.description} (${breakdown.rate}%)`]);
                    taxCodeData.push(['']);

                    if (breakdown.input.count > 0) {
                        taxCodeData.push(['INPUT VAT (Purchases)']);
                        taxCodeData.push(['Transactions', 'VAT Amount', 'Excl Amount']);
                        taxCodeData.push([breakdown.input.count, parseFloat(breakdown.input.vatAmount), parseFloat(breakdown.input.exclAmount)]);
                        taxCodeData.push(['']);
                        
                        if (breakdown.input.transactions.length > 0) {
                            taxCodeData.push(['Sample Input Transactions']);
                            taxCodeData.push(['TR Code', 'TxDate', 'VAT Amount', 'Excl Amount', 'Description']);
                            breakdown.input.transactions.forEach(tx => {
                                // Use TxDate directly since it's now properly processed at source
                                const txDate = tx.TxDate instanceof Date ? tx.TxDate : '';
                                taxCodeData.push([tx.TrCode, txDate, parseFloat(tx.TaxAmount), parseFloat(tx.ExclAmount), tx.TaxDescription]);
                            });
                            taxCodeData.push(['']);
                        }
                    }

                    if (breakdown.output.count > 0) {
                        taxCodeData.push(['OUTPUT VAT (Sales)']);
                        taxCodeData.push(['Transactions', 'VAT Amount', 'Excl Amount']);
                        taxCodeData.push([breakdown.output.count, parseFloat(breakdown.output.vatAmount), parseFloat(breakdown.output.exclAmount)]);
                        taxCodeData.push(['']);
                        
                        if (breakdown.output.transactions.length > 0) {
                            taxCodeData.push(['Sample Output Transactions']);
                            taxCodeData.push(['TR Code', 'TxDate', 'VAT Amount', 'Excl Amount', 'Description']);
                            breakdown.output.transactions.forEach(tx => {
                                // Use TxDate directly since it's now properly processed at source
                                const txDate = tx.TxDate instanceof Date ? tx.TxDate : '';
                                taxCodeData.push([tx.TrCode, txDate, parseFloat(tx.TaxAmount), parseFloat(tx.ExclAmount), tx.TaxDescription]);
                            });
                            taxCodeData.push(['']);
                        }
                    }
                    taxCodeData.push(['', '', '', '']); // Spacer
                }
            });

            const taxCodeWS = XLSX.utils.aoa_to_sheet(taxCodeData);
            
            console.log('=== TAX CODE DETAILS FORMULA APPROACH ===');
            console.log('Tax Code Details uses parseFloat - keeping as is');
            
            taxCodeWS['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(wb, taxCodeWS, 'Tax Code Details');

            // SHEET 3: Transaction Analysis with formatted monetary values
            const analysisData = [
                ['TRANSACTION ANALYSIS'],
                [''],
                ['Transaction Code Distribution'],
                ['TR Code', 'Count', 'Total Amount', 'Average Amount', 'Type']
            ];

            const trCodeStats = this.generateTransactionCodeStats();
            Object.entries(trCodeStats).forEach(([code, stats]) => {
                const type = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'].includes(code) ? 'INPUT' : 'OUTPUT';
                analysisData.push([code, stats.count, parseFloat(stats.total), parseFloat(stats.total / stats.count), type]);
            });

            analysisData.push(['']);
            analysisData.push(['VAT Rate Analysis']);
            analysisData.push(['Rate %', 'Transactions', 'Total Amount', 'VAT Amount']);

            const rateAnalysis = this.generateVATRateAnalysis();
            Object.entries(rateAnalysis).forEach(([rate, data]) => {
                analysisData.push([rate, data.transactions, parseFloat(data.amount), parseFloat(data.vat)]);
            });

            const analysisWS = XLSX.utils.aoa_to_sheet(analysisData);
            
            console.log('=== TRANSACTION ANALYSIS SIMPLIFIED APPROACH ===');
            console.log('Using parseFloat() directly like Tax Code Details');
            
            analysisWS['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
            XLSX.utils.book_append_sheet(wb, analysisWS, 'Transaction Analysis');

            // SHEET 4: All Transactions - Raw imported data without any processing
            if (this.currentData && this.currentData.transactions) {
                console.log('=== ALL TRANSACTIONS - USING RAW IMPORTED DATA ===');
                console.log('Raw transaction count:', this.currentData.transactions.length);
                
                // Use the original imported data exactly as it was imported
                const transactionWS = XLSX.utils.json_to_sheet(this.currentData.transactions);
                
                // Apply minimal formatting - only for display, not data manipulation
                this.applyAccountingFormat(transactionWS);
                
                XLSX.utils.book_append_sheet(wb, transactionWS, 'All Transactions');
                console.log('=== ALL TRANSACTIONS - RAW DATA EXPORTED ===');
            }

            // SHEET 5: SARS Compliance Summary with robust number conversion
            const complianceData = [
                ['SARS VAT RETURN SUMMARY'],
                [''],
                ['Output VAT (Box 1-9)'],
                ['Description', 'Amount (R)'],
                ['Standard-rated supplies', this.formatNumberForExcel(this.getStandardRatedOutputVAT())],
                ['Zero-rated supplies', this.formatNumberForExcel(this.currentData.zeroRatedSales)],
                ['Exempt supplies', this.formatNumberForExcel(this.getExemptOutputVAT())],
                ['Total Output VAT', this.formatNumberForExcel(this.currentData.totalOutputVAT)],
                [''],
                ['Input VAT (Box 10-19)'],
                ['Description', 'Amount (R)'],
                ['Standard-rated purchases', parseFloat(this.getStandardRatedInputVAT())],
                ['Capital goods purchases', parseFloat(this.getCapitalGoodsVAT())],
                ['Total Input VAT', parseFloat(this.currentData.totalInputVAT)],
                [''],
                ['Net VAT Calculation'],
                ['Total Output VAT', parseFloat(this.currentData.totalOutputVAT)],
                ['Less: Total Input VAT', parseFloat(this.currentData.totalInputVAT)],
                ['Net VAT Amount', this.ensureExcelNumber(this.currentData.vatPayable)]
            ];

            console.log('=== SARS COMPLIANCE ROBUST NUMBER DEBUG ===');
            console.log('Sample processed values:');
            console.log('Row 4 (Standard-rated supplies):', complianceData[4][1], typeof complianceData[4][1]);
            console.log('Row 7 (Total Output VAT):', complianceData[7][1], typeof complianceData[7][1]);

            const complianceWS = XLSX.utils.aoa_to_sheet(complianceData);
            
            console.log('=== SARS COMPLIANCE SIMPLIFIED APPROACH ===');
            console.log('Using parseFloat() directly like Tax Code Details');
            
            complianceWS['!cols'] = [{ wch: 30 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, complianceWS, 'SARS Compliance');

            // Save the comprehensive Excel file with proper formatting options
            const filename = `VAT_Comprehensive_Analysis_${this.currentFilename}_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            // ULTIMATE write options for maximum Excel compatibility
            const writeOptions = {
                bookType: 'xlsx',
                type: 'buffer',
                cellStyles: true,   // Enable cell styling
                cellNF: true,       // Enable number formatting  
                cellDates: true,    // Enable date formatting
                compression: true,
                Props: true,        // Include document properties
                bookSST: false,     // Disable shared string table for better compatibility
                bookVBA: false      // Disable VBA for cleaner output
            };
            
            console.log('=== ULTIMATE WRITE OPTIONS ===');
            console.log('Maximum Excel compatibility write options enabled');
            
            XLSX.writeFile(wb, filename, writeOptions);
            
            this.showExportSuccess('Comprehensive Excel analysis exported successfully');

        } catch (error) {
            console.error('Comprehensive Excel export error:', error);
            alert('Error generating comprehensive Excel report: ' + error.message);
        }
    }

    // TAX CODE BREAKDOWN EXPORT with formatted monetary values
    exportTaxCodeBreakdown() {
        if (!this.currentData) {
            alert('No calculation data available for export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            Object.entries(this.currentData.taxCodeBreakdown).forEach(([taxCode, breakdown]) => {
                if (breakdown.input.count === 0 && breakdown.output.count === 0) return;

                const sheetData = [
                    [`TAX CODE ${taxCode}: ${breakdown.description}`],
                    [`Rate: ${breakdown.rate}%`],
                    [''],
                    ['INPUT VAT (Purchases)'],
                    ['Metric', 'Value'],
                    ['Transaction Count', breakdown.input.count],
                    ['VAT Amount', parseFloat(breakdown.input.vatAmount)],
                    ['Excluding VAT Amount', parseFloat(breakdown.input.exclAmount)],
                    [''],
                    ['OUTPUT VAT (Sales)'],
                    ['Metric', 'Value'],
                    ['Transaction Count', breakdown.output.count],
                    ['VAT Amount', parseFloat(breakdown.output.vatAmount)],
                    ['Excluding VAT Amount', parseFloat(breakdown.output.exclAmount)],
                    [''],
                    ['SAMPLE TRANSACTIONS']
                ];

                if (breakdown.input.transactions.length > 0) {
                    sheetData.push(['Input Transaction Samples']);
                    sheetData.push(['TR Code', 'TxDate', 'VAT Amount', 'Excl Amount', 'Description']);
                    breakdown.input.transactions.forEach(tx => {
                        // Better date parsing for Excel compatibility
                        let dateForExcel = '';
                        if (tx.TxDate && tx.TxDate !== null && tx.TxDate !== '') {
                            // Try different date parsing approaches
                            let parsedDate = null;
                            
                            // If it's already a Date object, use it
                            if (tx.TxDate instanceof Date) {
                                parsedDate = tx.TxDate;
                            } else {
                                // Try parsing as string - handle various formats
                                const dateStr = String(tx.TxDate).trim();
                                
                                // Try direct parsing first
                                parsedDate = new Date(dateStr);
                                
                                // If that fails, try common CSV date formats
                                if (isNaN(parsedDate.getTime())) {
                                    // Try DD/MM/YYYY format (common in SA)
                                    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                                    if (ddmmyyyy) {
                                        parsedDate = new Date(ddmmyyyy[3], ddmmyyyy[2] - 1, ddmmyyyy[1]);
                                    }
                                    
                                    // Try YYYY/MM/DD format
                                    const yyyymmdd = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
                                    if (yyyymmdd) {
                                        parsedDate = new Date(yyyymmdd[1], yyyymmdd[2] - 1, yyyymmdd[3]);
                                    }
                                    
                                    // Try MM/DD/YYYY format
                                    const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                                    if (mmddyyyy) {
                                        parsedDate = new Date(mmddyyyy[3], mmddyyyy[1] - 1, mmddyyyy[2]);
                                    }
                                }
                            }
                            
                            // Use parsed date if valid, otherwise keep empty
                            if (parsedDate && !isNaN(parsedDate.getTime())) {
                                dateForExcel = parsedDate;
                            }
                        }
                        sheetData.push([tx.TrCode, dateForExcel, parseFloat(tx.TaxAmount), parseFloat(tx.ExclAmount), tx.TaxDescription || '']);
                    });
                    sheetData.push(['']);
                }

                if (breakdown.output.transactions.length > 0) {
                    sheetData.push(['Output Transaction Samples']);
                    sheetData.push(['TR Code', 'TxDate', 'VAT Amount', 'Excl Amount', 'Description']);
                    breakdown.output.transactions.forEach(tx => {
                        // Better date parsing for Excel compatibility
                        let dateForExcel = '';
                        if (tx.TxDate && tx.TxDate !== null && tx.TxDate !== '') {
                            // Try different date parsing approaches
                            let parsedDate = null;
                            
                            // If it's already a Date object, use it
                            if (tx.TxDate instanceof Date) {
                                parsedDate = tx.TxDate;
                            } else {
                                // Try parsing as string - handle various formats
                                const dateStr = String(tx.TxDate).trim();
                                
                                // Try direct parsing first
                                parsedDate = new Date(dateStr);
                                
                                // If that fails, try common CSV date formats
                                if (isNaN(parsedDate.getTime())) {
                                    // Try DD/MM/YYYY format (common in SA)
                                    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                                    if (ddmmyyyy) {
                                        parsedDate = new Date(ddmmyyyy[3], ddmmyyyy[2] - 1, ddmmyyyy[1]);
                                    }
                                    
                                    // Try YYYY/MM/DD format
                                    const yyyymmdd = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
                                    if (yyyymmdd) {
                                        parsedDate = new Date(yyyymmdd[1], yyyymmdd[2] - 1, yyyymmdd[3]);
                                    }
                                    
                                    // Try MM/DD/YYYY format
                                    const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                                    if (mmddyyyy) {
                                        parsedDate = new Date(mmddyyyy[3], mmddyyyy[1] - 1, mmddyyyy[2]);
                                    }
                                }
                            }
                            
                            // Use parsed date if valid, otherwise keep empty
                            if (parsedDate && !isNaN(parsedDate.getTime())) {
                                dateForExcel = parsedDate;
                            }
                        }
                        sheetData.push([tx.TrCode, dateForExcel, parseFloat(tx.TaxAmount), parseFloat(tx.ExclAmount), tx.TaxDescription || '']);
                    });
                }

                const ws = XLSX.utils.aoa_to_sheet(sheetData);
                
                console.log(`=== TAX CODE ${taxCode} SIMPLIFIED APPROACH ===`);
                console.log('Using parseFloat() directly like Tax Code Details');
                
                ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
                XLSX.utils.book_append_sheet(wb, ws, `Tax Code ${taxCode}`);
            });

            const filename = `VAT_Tax_Code_Breakdown_${this.currentFilename}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showExportSuccess('Tax code breakdown exported successfully');

        } catch (error) {
            console.error('Tax code breakdown export error:', error);
            alert('Error generating tax code breakdown: ' + error.message);
        }
    }

    // FULL TRANSACTION DETAILS EXPORT with raw imported data
    exportTransactionDetails() {
        if (!this.currentData || !this.currentData.transactions || this.currentData.transactions.length === 0) {
            alert('No transaction data available for export. Please process a VAT calculation first.');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            console.log('=== TRANSACTION DETAILS - USING RAW IMPORTED DATA ===');
            console.log('Raw transaction count:', this.currentData.transactions.length);
            
            // Use the original imported data exactly as it was imported
            const transactionWS = XLSX.utils.json_to_sheet(this.currentData.transactions);
            
            // Apply minimal formatting - only for display, not data manipulation
            this.applyAccountingFormat(transactionWS);
            
            // Set column widths
            transactionWS['!cols'] = [
                { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 10 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
            
            XLSX.utils.book_append_sheet(wb, transactionWS, 'All Transactions');

            const filename = `VAT_Transaction_Details_${this.currentFilename}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showExportSuccess('Transaction details exported successfully with raw imported data');
            console.log('=== TRANSACTION DETAILS - RAW DATA EXPORTED ===');

        } catch (error) {
            console.error('Transaction details export error:', error);
            alert('Error generating transaction details: ' + error.message);
        }
    }

    // HELPER METHODS FOR ANALYSIS
    generateTransactionCodeStats() {
        const stats = {};
        
        this.currentTransactions.forEach(tx => {
            if (!stats[tx.TrCode]) {
                stats[tx.TrCode] = { count: 0, total: 0 };
            }
            stats[tx.TrCode].count++;
            stats[tx.TrCode].total += tx.ExclAmount;
        });
        
        return stats;
    }

    generateVATRateAnalysis() {
        const analysis = {};
        
        this.currentTransactions.forEach(tx => {
            const rate = tx.TaxRate;
            if (!analysis[rate]) {
                analysis[rate] = { transactions: 0, amount: 0, vat: 0 };
            }
            analysis[rate].transactions++;
            analysis[rate].amount += tx.ExclAmount;
            analysis[rate].vat += tx.TaxAmount;
        });
        
        return analysis;
    }

    getTransactionType(trCode) {
        return ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'].includes(trCode) ? 'INPUT' : 'OUTPUT';
    }

    getVATCategory(taxCode) {
        switch (taxCode) {
            case '1': return 'Standard Rate (15%)';
            case '3': return 'Zero Rate (0%)';
            case '5': return 'Exempt (0%)';
            default: return 'Unknown';
        }
    }

    getStandardRatedOutputVAT() {
        return this.currentData.taxCodeBreakdown['1']?.output?.vatAmount || 0;
    }

    getStandardRatedInputVAT() {
        return this.currentData.taxCodeBreakdown['1']?.input?.vatAmount || 0;
    }

    getExemptOutputVAT() {
        return this.currentData.taxCodeBreakdown['5']?.output?.vatAmount || 0;
    }

    getCapitalGoodsVAT() {
        // This would need to be determined from transaction descriptions or additional data
        return 0; // Placeholder
    }

    // UTILITY METHODS
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-ZA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    showExportSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'export-success-notification';
        notification.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <div class="success-message">${message}</div>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    setupExportHandlers() {
        // Additional setup for export functionality
        console.log('Detailed Export Manager: Export handlers initialized');
    }

    setupReportTemplates() {
        // Initialize report templates for consistent formatting
        this.reportTemplate = {
            colors: {
                primary: '#667eea',
                secondary: '#764ba2',
                input: '#dc3545',
                output: '#007bff',
                success: '#28a745'
            },
            fonts: {
                title: 18,
                heading: 14,
                subheading: 12,
                body: 10,
                small: 9
            }
        };
    }
}

// Initialize the detailed export manager
const detailedExportManager = new DetailedExportManager();

// Integrate with existing export manager if available
if (typeof exportManager !== 'undefined') {
    const originalSetData = exportManager.setData;
    exportManager.setData = function(data) {
        originalSetData.call(this, data);
        detailedExportManager.setData(data);
    };
} else {
    console.log('Detailed Export Manager: Standalone initialization');
}
