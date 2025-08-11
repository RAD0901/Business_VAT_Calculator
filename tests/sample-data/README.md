# Test Data for VAT Calculator Pro

## Sample Excel Files

This directory contains sample Excel files for testing different scenarios:

### 1. `basic-vat-sample.csv`
- Small dataset with basic transactions
- Contains all three tax codes (1, 3, 5)
- Mix of input and output transactions
- 50 transactions total

### 2. `large-dataset-sample.csv`
- Large dataset for performance testing
- 5000+ transactions
- All transaction types represented
- Stress test for calculation engine

### 3. `edge-cases-sample.csv`
- Edge cases and unusual scenarios
- Zero amounts, negative amounts
- Missing data scenarios
- Error condition testing

### 4. `tax-code-specific-samples/`
- Separate files for each tax code
- `tax-code-1-sample.csv` - Standard rate transactions
- `tax-code-3-sample.csv` - Zero-rated transactions
- `tax-code-5-sample.csv` - Exempt transactions

## Expected Results

### Basic Sample Expected Results
```json
{
  "totalInputVAT": 12450.75,
  "totalOutputVAT": 48723.50,
  "vatPayable": 36272.75,
  "salesExcludingVAT": 324823.33,
  "salesIncludingVAT": 373546.83,
  "zeroRatedSales": 45000.00,
  "transactionCount": 50
}
```

### Large Dataset Expected Results
```json
{
  "totalInputVAT": 250571.49,
  "totalOutputVAT": 1384201.12,
  "vatPayable": 1133629.63,
  "salesExcludingVAT": 9228007.47,
  "salesIncludingVAT": 10612208.59,
  "zeroRatedSales": 924753.96,
  "transactionCount": 3723
}
```

## File Format Requirements

All test files must contain these columns:
- TaxCode (1, 3, or 5)
- TaxDescription
- TrCode (CASH, INV, IS, etc.)
- TaxRate (15 for code 1, 0 for codes 3 & 5)
- TaxAmount (VAT amount)
- ExclAmount (Amount excluding VAT)
- InclAmount (Amount including VAT)

## Usage in Tests

```javascript
// Load test data
const testData = await loadTestFile('basic-vat-sample.csv');

// Run calculation
const calculator = new VATCalculator();
const results = calculator.calculateVAT(testData, 'test-file');

// Verify results
assertVATCalculation(results, expectedBasicResults);
```

## Creating New Test Data

When creating new test data files:

1. Use realistic South African VAT scenarios
2. Include variety of transaction codes
3. Ensure mathematical accuracy
4. Document expected results
5. Test edge cases appropriately

## File Conversion

To convert Excel files to CSV for version control:
```bash
# Use xlsx2csv or similar tool
xlsx2csv input.xlsx output.csv
```

## Validation Rules

Test data must pass these validation rules:
- All required columns present
- Valid tax codes (1, 3, 5)
- Valid transaction codes (from approved list)
- Mathematical consistency (TaxAmount = ExclAmount × TaxRate / 100)
- Positive amounts (except for credit notes)
