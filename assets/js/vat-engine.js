// VAT Engine - Core calculation logic

// Enhanced calculateVAT function to integrate with export and history
function calculateVAT(data, filename) {
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

        // Store sample transactions (limit to 5 per category)
        if (breakdown.transactions.length < 5) {
            breakdown.transactions.push({
                TrCode: trCode,
                TaxAmount: taxAmount,
                ExclAmount: exclAmount,
                TaxDescription: row.TaxDescription
            });
        }

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

    // Integrate with export and history managers
    if (exportManager && historyManager) {
        // Set export data
        exportManager.setData({
            ...results,
            filename: filename,
            transactions: data
        });

        // Add to history
        historyManager.addCalculation({
            ...results,
            filename: filename,
            transactionCount: data.length
        });
    }

    console.log('VAT Calculation Results:', results);
    return results;
}

// Results Display Functions
function displayResults(results) {
    // Update summary cards
    document.getElementById('total-output-vat').textContent = formatCurrency(results.totalOutputVAT);
    document.getElementById('total-input-vat').textContent = formatCurrency(results.totalInputVAT);
    document.getElementById('sales-including-vat').textContent = formatCurrency(results.salesIncludingVAT);
    document.getElementById('sales-excluding-vat').textContent = formatCurrency(results.salesExcludingVAT);
    document.getElementById('zero-rated-sales').textContent = formatCurrency(results.zeroRatedSales);

    // Update VAT payable/refund
    const vatPayableAmount = document.getElementById('vat-payable-amount');
    const vatPayableLabel = document.getElementById('vat-payable-label');
    
    if (results.vatPayable >= 0) {
        vatPayableLabel.textContent = 'VAT Payable';
        vatPayableAmount.textContent = formatCurrency(results.vatPayable);
    } else {
        vatPayableLabel.textContent = 'VAT Refund';
        vatPayableAmount.textContent = formatCurrency(Math.abs(results.vatPayable));
    }

    // Generate breakdown sections
    generateBreakdownSections(results.taxCodeBreakdown);
}

function generateBreakdownSections(taxCodeBreakdown) {
    const container = document.getElementById('breakdown-sections');
    container.innerHTML = '';

    for (const [taxCode, breakdown] of Object.entries(taxCodeBreakdown)) {
        // Skip if no transactions for this tax code
        if (breakdown.input.count === 0 && breakdown.output.count === 0) {
            continue;
        }

        const section = document.createElement('div');
        section.className = 'breakdown-section';

        section.innerHTML = `
            <div class="breakdown-header">
                <h3>Tax Code ${taxCode}: ${breakdown.description} (${breakdown.rate}%)</h3>
            </div>
            <div class="breakdown-content">
                <div class="input-output-grid">
                    <div class="input-section">
                        <div class="section-title">
                            📥 INPUT VAT (Purchases)
                        </div>
                        <div class="stat-grid">
                            <div class="stat-row">
                                <span class="stat-label">Transactions</span>
                                <span class="stat-value">${breakdown.input.count.toLocaleString()}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">VAT Amount</span>
                                <span class="stat-value">${formatCurrency(breakdown.input.vatAmount)}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Excl Amount</span>
                                <span class="stat-value">${formatCurrency(breakdown.input.exclAmount)}</span>
                            </div>
                        </div>
                        ${generateSampleTransactions(breakdown.input.transactions, 'Input')}
                    </div>
                    <div class="output-section">
                        <div class="section-title">
                            📤 OUTPUT VAT (Sales)
                        </div>
                        <div class="stat-grid">
                            <div class="stat-row">
                                <span class="stat-label">Transactions</span>
                                <span class="stat-value">${breakdown.output.count.toLocaleString()}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">VAT Amount</span>
                                <span class="stat-value">${formatCurrency(breakdown.output.vatAmount)}</span>
                            </div>
                            <div class="stat-row">
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

    const tableRows = transactions.map(tx => `
        <tr>
            <td>${tx.TrCode}</td>
            <td>${formatCurrency(tx.ExclAmount)}</td>
            <td>${formatCurrency(tx.TaxAmount)}</td>
        </tr>
    `).join('');

    return `
        <div class="sample-transactions">
            <h4>Sample ${type} Transactions</h4>
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Excl Amount</th>
                        <th>VAT Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}
