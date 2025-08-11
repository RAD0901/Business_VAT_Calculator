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
        if (!this.currentData) {
            alert('No calculation data available for export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();

            // SHEET 1: Executive Summary
            const summaryData = [
                ['VAT CALCULATOR PRO - COMPREHENSIVE ANALYSIS'],
                [`Generated: ${new Date().toLocaleString()}`],
                [`Source File: ${this.currentFilename}`],
                [`Total Transactions: ${this.currentTransactions.length.toLocaleString()}`],
                [''],
                ['EXECUTIVE SUMMARY'],
                ['Metric', 'Amount (R)'],
                ['Total Input VAT (Purchases)', this.currentData.totalInputVAT],
                ['Total Output VAT (Sales)', this.currentData.totalOutputVAT],
                ['VAT Payable/Refund', this.currentData.vatPayable],
                ['Sales Excluding VAT', this.currentData.salesExcludingVAT],
                ['Sales Including VAT', this.currentData.salesIncludingVAT],
                ['Zero-Rated Sales', this.currentData.zeroRatedSales],
                [''],
                ['BREAKDOWN BY TAX CODE'],
                ['Tax Code', 'Description', 'Rate %', 'Input Count', 'Input VAT', 'Input Excl', 'Output Count', 'Output VAT', 'Output Excl']
            ];

            // Add tax code breakdown data
            Object.entries(this.currentData.taxCodeBreakdown).forEach(([code, breakdown]) => {
                if (breakdown.input.count > 0 || breakdown.output.count > 0) {
                    summaryData.push([
                        code,
                        breakdown.description,
                        breakdown.rate,
                        breakdown.input.count,
                        breakdown.input.vatAmount,
                        breakdown.input.exclAmount,
                        breakdown.output.count,
                        breakdown.output.vatAmount,
                        breakdown.output.exclAmount
                    ]);
                }
            });

            const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
            // Style the summary sheet
            summaryWS['!cols'] = [
                { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, 
                { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
            ];
            XLSX.utils.book_append_sheet(wb, summaryWS, 'Executive Summary');

            // SHEET 2: Tax Code Details
            const taxCodeData = [['TAX CODE DETAILED BREAKDOWN'], ['']];

            Object.entries(this.currentData.taxCodeBreakdown).forEach(([code, breakdown]) => {
                if (breakdown.input.count > 0 || breakdown.output.count > 0) {
                    taxCodeData.push([`TAX CODE ${code}: ${breakdown.description} (${breakdown.rate}%)`]);
                    taxCodeData.push(['']);

                    if (breakdown.input.count > 0) {
                        taxCodeData.push(['INPUT VAT (Purchases)']);
                        taxCodeData.push(['Transactions', 'VAT Amount', 'Excl Amount']);
                        taxCodeData.push([breakdown.input.count, breakdown.input.vatAmount, breakdown.input.exclAmount]);
                        taxCodeData.push(['']);
                        
                        if (breakdown.input.transactions.length > 0) {
                            taxCodeData.push(['Sample Input Transactions']);
                            taxCodeData.push(['TR Code', 'VAT Amount', 'Excl Amount', 'Description']);
                            breakdown.input.transactions.forEach(tx => {
                                taxCodeData.push([tx.TrCode, tx.TaxAmount, tx.ExclAmount, tx.TaxDescription]);
                            });
                            taxCodeData.push(['']);
                        }
                    }

                    if (breakdown.output.count > 0) {
                        taxCodeData.push(['OUTPUT VAT (Sales)']);
                        taxCodeData.push(['Transactions', 'VAT Amount', 'Excl Amount']);
                        taxCodeData.push([breakdown.output.count, breakdown.output.vatAmount, breakdown.output.exclAmount]);
                        taxCodeData.push(['']);
                        
                        if (breakdown.output.transactions.length > 0) {
                            taxCodeData.push(['Sample Output Transactions']);
                            taxCodeData.push(['TR Code', 'VAT Amount', 'Excl Amount', 'Description']);
                            breakdown.output.transactions.forEach(tx => {
                                taxCodeData.push([tx.TrCode, tx.TaxAmount, tx.ExclAmount, tx.TaxDescription]);
                            });
                            taxCodeData.push(['']);
                        }
                    }
                    taxCodeData.push(['', '', '', '']); // Spacer
                }
            });

            const taxCodeWS = XLSX.utils.aoa_to_sheet(taxCodeData);
            taxCodeWS['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(wb, taxCodeWS, 'Tax Code Details');

            // SHEET 3: Transaction Analysis
            const analysisData = [
                ['TRANSACTION ANALYSIS'],
                [''],
                ['Transaction Code Distribution'],
                ['TR Code', 'Count', 'Total Amount', 'Average Amount', 'Type']
            ];

            const trCodeStats = this.generateTransactionCodeStats();
            Object.entries(trCodeStats).forEach(([code, stats]) => {
                const type = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'].includes(code) ? 'INPUT' : 'OUTPUT';
                analysisData.push([code, stats.count, stats.total, stats.total / stats.count, type]);
            });

            analysisData.push(['']);
            analysisData.push(['VAT Rate Analysis']);
            analysisData.push(['Rate %', 'Transactions', 'Total Amount', 'VAT Amount']);

            const rateAnalysis = this.generateVATRateAnalysis();
            Object.entries(rateAnalysis).forEach(([rate, data]) => {
                analysisData.push([rate, data.transactions, data.amount, data.vat]);
            });

            const analysisWS = XLSX.utils.aoa_to_sheet(analysisData);
            analysisWS['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
            XLSX.utils.book_append_sheet(wb, analysisWS, 'Transaction Analysis');

            // SHEET 4: All Transactions (if data available)
            if (this.currentTransactions && this.currentTransactions.length > 0) {
                const transactionWS = XLSX.utils.json_to_sheet(this.currentTransactions);
                XLSX.utils.book_append_sheet(wb, transactionWS, 'All Transactions');
            }

            // SHEET 5: SARS Compliance Summary
            const complianceData = [
                ['SARS VAT RETURN SUMMARY'],
                [''],
                ['Output VAT (Box 1-9)'],
                ['Description', 'Amount (R)'],
                ['Standard-rated supplies', this.getStandardRatedOutputVAT()],
                ['Zero-rated supplies', this.currentData.zeroRatedSales],
                ['Exempt supplies', this.getExemptOutputVAT()],
                ['Total Output VAT', this.currentData.totalOutputVAT],
                [''],
                ['Input VAT (Box 10-19)'],
                ['Description', 'Amount (R)'],
                ['Standard-rated purchases', this.getStandardRatedInputVAT()],
                ['Capital goods purchases', this.getCapitalGoodsVAT()],
                ['Total Input VAT', this.currentData.totalInputVAT],
                [''],
                ['Net VAT Calculation'],
                ['Total Output VAT', this.currentData.totalOutputVAT],
                ['Less: Total Input VAT', this.currentData.totalInputVAT],
                ['Net VAT Amount', this.currentData.vatPayable]
            ];

            const complianceWS = XLSX.utils.aoa_to_sheet(complianceData);
            complianceWS['!cols'] = [{ wch: 30 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, complianceWS, 'SARS Compliance');

            // Save the comprehensive Excel file
            const filename = `VAT_Comprehensive_Analysis_${this.currentFilename}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showExportSuccess('Comprehensive Excel analysis exported successfully');

        } catch (error) {
            console.error('Comprehensive Excel export error:', error);
            alert('Error generating comprehensive Excel report: ' + error.message);
        }
    }

    // TAX CODE BREAKDOWN EXPORT
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
                    ['VAT Amount', breakdown.input.vatAmount],
                    ['Excluding VAT Amount', breakdown.input.exclAmount],
                    [''],
                    ['OUTPUT VAT (Sales)'],
                    ['Metric', 'Value'],
                    ['Transaction Count', breakdown.output.count],
                    ['VAT Amount', breakdown.output.vatAmount],
                    ['Excluding VAT Amount', breakdown.output.exclAmount],
                    [''],
                    ['SAMPLE TRANSACTIONS']
                ];

                if (breakdown.input.transactions.length > 0) {
                    sheetData.push(['Input Transaction Samples']);
                    sheetData.push(['TR Code', 'VAT Amount', 'Excl Amount', 'Description']);
                    breakdown.input.transactions.forEach(tx => {
                        sheetData.push([tx.TrCode, tx.TaxAmount, tx.ExclAmount, tx.TaxDescription || '']);
                    });
                    sheetData.push(['']);
                }

                if (breakdown.output.transactions.length > 0) {
                    sheetData.push(['Output Transaction Samples']);
                    sheetData.push(['TR Code', 'VAT Amount', 'Excl Amount', 'Description']);
                    breakdown.output.transactions.forEach(tx => {
                        sheetData.push([tx.TrCode, tx.TaxAmount, tx.ExclAmount, tx.TaxDescription || '']);
                    });
                }

                const ws = XLSX.utils.aoa_to_sheet(sheetData);
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

    // FULL TRANSACTION DETAILS EXPORT
    exportTransactionDetails() {
        if (!this.currentTransactions || this.currentTransactions.length === 0) {
            alert('No transaction data available for export');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // Enhanced transaction data with analysis
            const enhancedTransactions = this.currentTransactions.map(tx => ({
                ...tx,
                TransactionType: this.getTransactionType(tx.TrCode),
                VATCategory: this.getVATCategory(tx.TaxCode),
                CalculatedVAT: (tx.ExclAmount * (tx.TaxRate / 100)).toFixed(2),
                VATDifference: (tx.TaxAmount - (tx.ExclAmount * (tx.TaxRate / 100))).toFixed(2)
            }));

            const transactionWS = XLSX.utils.json_to_sheet(enhancedTransactions);
            
            // Set column widths
            transactionWS['!cols'] = [
                { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 10 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
            
            XLSX.utils.book_append_sheet(wb, transactionWS, 'All Transactions');

            const filename = `VAT_Transaction_Details_${this.currentFilename}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showExportSuccess('Transaction details exported successfully');

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
