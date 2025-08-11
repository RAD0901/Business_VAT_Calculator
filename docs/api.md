# API Documentation - VAT Calculator Pro

## Core JavaScript APIs

### VATCalculator Class

The main calculation engine that processes VAT data and generates reports.

#### Constructor
```javascript
const calculator = new VATCalculator();
```

#### Methods

##### `processFile(file, progressCallback)`
Processes an Excel file and extracts VAT data.

**Parameters:**
- `file` (File): Excel file object from file input
- `progressCallback` (Function): Optional callback for progress updates

**Returns:** Promise that resolves to processed data array

**Example:**
```javascript
const calculator = new VATCalculator();
try {
  const data = await calculator.processFile(file, (progress) => {
    console.log(`Processing: ${progress}%`);
  });
  console.log('Data processed:', data);
} catch (error) {
  console.error('Processing failed:', error);
}
```

##### `calculateVAT(data, filename)`
Performs VAT calculations on processed data.

**Parameters:**
- `data` (Array): Array of transaction objects
- `filename` (String): Name of the source file

**Returns:** Object containing calculation results

**Example:**
```javascript
const results = calculator.calculateVAT(data, 'vat-data.xlsx');
console.log('VAT Payable:', results.vatPayable);
console.log('Total Input VAT:', results.totalInputVAT);
console.log('Total Output VAT:', results.totalOutputVAT);
```

**Result Object Structure:**
```javascript
{
  totalInputVAT: Number,      // Total VAT on purchases
  totalOutputVAT: Number,     // Total VAT on sales
  salesExcludingVAT: Number,  // Sales amount excluding VAT
  salesIncludingVAT: Number,  // Sales amount including VAT
  zeroRatedSales: Number,     // Zero-rated sales amount
  vatPayable: Number,         // Final VAT payable/refund
  taxCodeBreakdown: {         // Breakdown by tax code
    '1': {
      description: String,
      rate: Number,
      input: { count, vatAmount, exclAmount, transactions },
      output: { count, vatAmount, exclAmount, transactions }
    },
    '3': { ... },
    '5': { ... }
  }
}
```

##### `validateData(data)`
Validates transaction data for completeness and accuracy.

**Parameters:**
- `data` (Array): Array of transaction objects

**Returns:** Object with validation results

**Example:**
```javascript
const validation = calculator.validateData(data);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### FileProcessor Class

Handles Excel file reading and data extraction.

#### Constructor
```javascript
const processor = new FileProcessor();
```

#### Methods

##### `readExcelFile(file)`
Reads and parses Excel file content.

**Parameters:**
- `file` (File): Excel file object

**Returns:** Promise that resolves to workbook object

##### `extractData(workbook, sheetName)`
Extracts data from specific worksheet.

**Parameters:**
- `workbook` (Object): Parsed Excel workbook
- `sheetName` (String): Name of worksheet (optional, uses first sheet if not specified)

**Returns:** Array of row objects with column headers as keys

### UIManager Class

Manages user interface interactions and display updates.

#### Constructor
```javascript
const ui = new UIManager();
```

#### Methods

##### `showLoading(message)`
Displays loading indicator with optional message.

##### `hideLoading()`
Hides loading indicator.

##### `displayResults(results)`
Shows calculation results in the UI.

##### `showError(message, details)`
Displays error message to user.

##### `updateProgress(percentage)`
Updates progress bar display.

## Data Structures

### Transaction Object
```javascript
{
  TaxCode: String,        // "1", "3", or "5"
  TaxDescription: String, // Description of tax type
  TrCode: String,         // Transaction code (CASH, INV, etc.)
  TaxRate: Number,        // Tax percentage (15, 0)
  TaxAmount: Number,      // VAT amount
  ExclAmount: Number,     // Amount excluding VAT
  InclAmount: Number      // Amount including VAT
}
```

### Calculation Result Object
```javascript
{
  filename: String,           // Source filename
  transactionCount: Number,   // Total transactions processed
  processingTime: Number,     // Time taken in milliseconds
  totalInputVAT: Number,      // Sum of all input VAT
  totalOutputVAT: Number,     // Sum of all output VAT
  vatPayable: Number,         // Output VAT minus Input VAT
  salesExcludingVAT: Number,  // Total sales before VAT
  salesIncludingVAT: Number,  // Total sales after VAT
  zeroRatedSales: Number,     // Zero-rated transactions
  taxCodeBreakdown: Object    // Detailed breakdown by tax code
}
```

## Configuration Constants

### VAT Transaction Codes
```javascript
// Input VAT codes (purchases, expenses)
const VAT_INPUT_CODES = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'];

// Output VAT codes (sales, income)
const VAT_OUTPUT_CODES = ['IS', 'INV', 'RTS'];
```

### Tax Code Definitions
```javascript
const TAX_CODES = {
  '1': {
    description: 'Standard Rate (Excluding Capital Goods)',
    rate: 15
  },
  '3': {
    description: 'Zero Rate',
    rate: 0
  },
  '5': {
    description: 'Exempt',
    rate: 0
  }
};
```

### Required Excel Columns
```javascript
const REQUIRED_COLUMNS = [
  'TaxCode',
  'TaxDescription', 
  'TrCode',
  'TaxRate',
  'TaxAmount',
  'ExclAmount',
  'InclAmount'
];
```

## Event System

### Custom Events

#### `vat:calculation:started`
Fired when VAT calculation begins.
```javascript
document.addEventListener('vat:calculation:started', (event) => {
  console.log('Calculation started:', event.detail);
});
```

#### `vat:calculation:completed`
Fired when VAT calculation completes.
```javascript
document.addEventListener('vat:calculation:completed', (event) => {
  console.log('Results:', event.detail.results);
});
```

#### `vat:file:uploaded`
Fired when file is successfully uploaded.
```javascript
document.addEventListener('vat:file:uploaded', (event) => {
  console.log('File uploaded:', event.detail.filename);
});
```

#### `vat:error:occurred`
Fired when an error occurs.
```javascript
document.addEventListener('vat:error:occurred', (event) => {
  console.error('Error:', event.detail.message);
});
```

## Utility Functions

### Currency Formatting
```javascript
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(amount);
}
```

### Date Formatting
```javascript
function formatDate(date) {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
```

### File Size Formatting
```javascript
function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
```

## Error Handling

### Error Types
```javascript
class VATCalculationError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'VATCalculationError';
    this.code = code;
    this.details = details;
  }
}

class FileProcessingError extends Error {
  constructor(message, filename, details) {
    super(message);
    this.name = 'FileProcessingError';
    this.filename = filename;
    this.details = details;
  }
}
```

### Error Codes
```javascript
const ERROR_CODES = {
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  MISSING_REQUIRED_COLUMNS: 'MISSING_REQUIRED_COLUMNS',
  INVALID_TAX_CODE: 'INVALID_TAX_CODE',
  INVALID_TRANSACTION_CODE: 'INVALID_TRANSACTION_CODE',
  CALCULATION_FAILED: 'CALCULATION_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_BROWSER: 'UNSUPPORTED_BROWSER'
};
```

## Integration Examples

### Basic Usage
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const calculator = new VATCalculator();
  const fileInput = document.getElementById('file-input');
  
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Process file
      const data = await calculator.processFile(file);
      
      // Calculate VAT
      const results = calculator.calculateVAT(data, file.name);
      
      // Display results
      displayResults(results);
      
    } catch (error) {
      console.error('Processing failed:', error);
      showError(error.message);
    }
  });
});
```

### Advanced Usage with Progress
```javascript
async function processVATFile(file) {
  const calculator = new VATCalculator();
  const ui = new UIManager();
  
  try {
    ui.showLoading('Processing file...');
    
    // Process with progress tracking
    const data = await calculator.processFile(file, (progress) => {
      ui.updateProgress(progress);
    });
    
    ui.showLoading('Calculating VAT...');
    
    // Validate data
    const validation = calculator.validateData(data);
    if (!validation.isValid) {
      throw new VATCalculationError(
        'Data validation failed',
        'VALIDATION_FAILED',
        validation.errors
      );
    }
    
    // Calculate results
    const results = calculator.calculateVAT(data, file.name);
    
    // Update UI
    ui.hideLoading();
    ui.displayResults(results);
    
    // Fire completion event
    document.dispatchEvent(new CustomEvent('vat:calculation:completed', {
      detail: { results, filename: file.name }
    }));
    
  } catch (error) {
    ui.hideLoading();
    ui.showError(error.message, error.details);
    
    // Fire error event
    document.dispatchEvent(new CustomEvent('vat:error:occurred', {
      detail: { error: error.message, code: error.code }
    }));
  }
}
```

## Testing API

### Unit Test Helpers
```javascript
// Mock data generators
function generateMockTransaction(overrides = {}) {
  return {
    TaxCode: '1',
    TaxDescription: 'Standard Rate',
    TrCode: 'CASH',
    TaxRate: 15,
    TaxAmount: 150,
    ExclAmount: 1000,
    InclAmount: 1150,
    ...overrides
  };
}

function generateMockDataset(count = 100) {
  return Array.from({ length: count }, () => generateMockTransaction());
}

// Test assertions
function assertVATCalculation(results, expected) {
  assert.equal(results.totalInputVAT, expected.totalInputVAT);
  assert.equal(results.totalOutputVAT, expected.totalOutputVAT);
  assert.equal(results.vatPayable, expected.vatPayable);
}
```

This API documentation provides comprehensive guidance for developers working with the VAT Calculator Pro codebase, enabling easy integration and extension of the application's functionality.
