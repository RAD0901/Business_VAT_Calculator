// UI Components - Settings, history, and utility UI functions

// Settings Management
let appSettings = {
    companyName: 'My Company',
    logoUrl: '',
    defaultPdfTitle: 'VAT Calculator Report',
    vatRate: 15,
    theme: 'light',
    exportFormat: 'pdf',
    autoSave: true,
    showTutorial: true
};

function loadSettings() {
    const saved = localStorage.getItem('vatCalculatorSettings');
    if (saved) {
        appSettings = { ...appSettings, ...JSON.parse(saved) };
    }
    populateSettingsForm();
}

function saveSettings() {
    localStorage.setItem('vatCalculatorSettings', JSON.stringify(appSettings));
    showSettingsMessage('Settings saved successfully!', 'success');
}

function populateSettingsForm() {
    // Company settings
    setValueById('company-name', appSettings.companyName);
    setValueById('logo-url', appSettings.logoUrl);
    setValueById('pdf-title', appSettings.defaultPdfTitle);
    setValueById('vat-rate', appSettings.vatRate);

    // Appearance settings
    setValueById('theme', appSettings.theme);
    setCheckedById('show-tutorial', appSettings.showTutorial);

    // Export settings
    setValueById('export-format', appSettings.exportFormat);
    setCheckedById('auto-save', appSettings.autoSave);

    // Update logo preview
    updateLogoPreview();
}

function updateSettings() {
    // Company settings
    appSettings.companyName = getValueById('company-name') || 'My Company';
    appSettings.logoUrl = getValueById('logo-url');
    appSettings.defaultPdfTitle = getValueById('pdf-title') || 'VAT Calculator Report';
    appSettings.vatRate = parseFloat(getValueById('vat-rate')) || 15;

    // Appearance settings
    appSettings.theme = getValueById('theme');
    appSettings.showTutorial = getCheckedById('show-tutorial');

    // Export settings
    appSettings.exportFormat = getValueById('export-format');
    appSettings.autoSave = getCheckedById('auto-save');

    saveSettings();
    updateLogoPreview();
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
        appSettings = {
            companyName: 'My Company',
            logoUrl: '',
            defaultPdfTitle: 'VAT Calculator Report',
            vatRate: 15,
            theme: 'light',
            exportFormat: 'pdf',
            autoSave: true,
            showTutorial: true
        };
        saveSettings();
        populateSettingsForm();
        showSettingsMessage('Settings reset to defaults!', 'success');
    }
}

function updateLogoPreview() {
    const preview = document.getElementById('logo-preview');
    if (preview && appSettings.logoUrl) {
        preview.innerHTML = `<img src="${appSettings.logoUrl}" alt="Company Logo" style="max-width: 100%; max-height: 60px;">`;
    } else if (preview) {
        preview.innerHTML = '<div class="no-logo">No logo uploaded</div>';
    }
}

function showSettingsMessage(message, type) {
    const messageDiv = document.getElementById('settings-message');
    if (messageDiv) {
        messageDiv.className = `settings-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// History Management
function loadCalculationHistory() {
    const history = JSON.parse(localStorage.getItem('vatCalculatorHistory') || '[]');
    displayHistory(history);
    return history;
}

function saveToHistory(results) {
    if (!appSettings.autoSave) return;

    const history = JSON.parse(localStorage.getItem('vatCalculatorHistory') || '[]');
    
    const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        filename: results.filename,
        totalRecords: results.totalRecords,
        inputTotal: results.totals.input.total,
        outputTotal: results.totals.output.total,
        netVatAmount: results.totals.netVatAmount
    };

    history.unshift(historyEntry);
    
    // Keep only the last 50 entries
    if (history.length > 50) {
        history.splice(50);
    }

    localStorage.setItem('vatCalculatorHistory', JSON.stringify(history));
}

function displayHistory(history) {
    const container = document.getElementById('history-container');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `
            <div class="no-history">
                <p>No calculation history found.</p>
                <p>Calculations will appear here once you process Excel files.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.map(entry => `
        <div class="history-item">
            <div class="history-header">
                <h3>${entry.filename}</h3>
                <span class="history-date">${formatDateTime(entry.timestamp)}</span>
            </div>
            <div class="history-details">
                <div class="history-stat">
                    <span class="label">Records:</span>
                    <span class="value">${entry.totalRecords.toLocaleString()}</span>
                </div>
                <div class="history-stat">
                    <span class="label">Input VAT:</span>
                    <span class="value">R ${entry.inputTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="history-stat">
                    <span class="label">Output VAT:</span>
                    <span class="value">R ${entry.outputTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="history-stat net-amount">
                    <span class="label">Net VAT:</span>
                    <span class="value">R ${entry.netVatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
            <div class="history-actions">
                <button onclick="deleteHistoryEntry(${entry.id})" class="btn-secondary">Delete</button>
            </div>
        </div>
    `).join('');
}

function deleteHistoryEntry(id) {
    if (confirm('Are you sure you want to delete this history entry?')) {
        const history = JSON.parse(localStorage.getItem('vatCalculatorHistory') || '[]');
        const filtered = history.filter(entry => entry.id !== id);
        localStorage.setItem('vatCalculatorHistory', JSON.stringify(filtered));
        loadCalculationHistory();
    }
}

function clearAllHistory() {
    if (confirm('Are you sure you want to clear all calculation history? This action cannot be undone.')) {
        localStorage.removeItem('vatCalculatorHistory');
        loadCalculationHistory();
    }
}

function exportHistory() {
    const history = JSON.parse(localStorage.getItem('vatCalculatorHistory') || '[]');
    
    if (history.length === 0) {
        alert('No history to export.');
        return;
    }

    const csvContent = [
        'Date,Filename,Records,Input VAT,Output VAT,Net VAT',
        ...history.map(entry => 
            `"${formatDateTime(entry.timestamp)}","${entry.filename}",${entry.totalRecords},${entry.inputTotal},${entry.outputTotal},${entry.netVatAmount}`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vat-calculator-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Utility functions for settings
function setValueById(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function getValueById(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function setCheckedById(id, checked) {
    const element = document.getElementById(id);
    if (element) element.checked = checked;
}

function getCheckedById(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

// Tutorial functions
function showTutorial() {
    // Simple tutorial implementation
    alert('VAT Calculator Tutorial:\n\n1. Upload your Excel file with VAT data\n2. Ensure columns include: TaxCode, TaxDescription, TrCode, TaxRate, TaxAmount, ExclAmount, InclAmount\n3. Click Process to calculate VAT totals\n4. Export results as PDF, Excel, or print\n5. View calculation history in the History section');
}

// Demo data function
function loadDemoData() {
    if (confirm('This will load demo data for testing. Continue?')) {
        // Create a simple demo Excel structure
        const demoData = [
            {
                TaxCode: 'CASH',
                TaxDescription: 'Cash Sale',
                TrCode: 'SINV',
                TaxRate: 15,
                TaxAmount: 150.00,
                ExclAmount: 1000.00,
                InclAmount: 1150.00
            },
            {
                TaxCode: 'JC',
                TaxDescription: 'Journal Credit',
                TrCode: 'JNL',
                TaxRate: 15,
                TaxAmount: 75.00,
                ExclAmount: 500.00,
                InclAmount: 575.00
            },
            {
                TaxCode: 'IS',
                TaxDescription: 'Invoice Sale',
                TrCode: 'INV',
                TaxRate: 15,
                TaxAmount: 300.00,
                ExclAmount: 2000.00,
                InclAmount: 2300.00
            }
        ];

        // Process demo data
        const results = calculateVAT(demoData, 'Demo Data');
        processedData = results;
        displayResults(results);
        navigateToPage('results');
    }
}
