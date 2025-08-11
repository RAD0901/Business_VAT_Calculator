# Contributing to VAT Calculator Pro

Thank you for your interest in contributing to VAT Calculator Pro! This document provides guidelines and information about contributing to this project.

## 🎯 Project Goals

VAT Calculator Pro aims to:
- Simplify VAT calculations for South African businesses
- Provide accurate, SARS-compliant VAT processing
- Maintain client-side processing for data privacy
- Deliver professional, modern reports

## 🛠️ Development Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code recommended)
- Basic understanding of HTML, CSS, JavaScript
- Knowledge of South African VAT regulations (helpful)

### Local Development
```bash
# Clone the repository
git clone https://github.com/RAD0901/Business_VAT_Calculator.git
cd Business_VAT_Calculator

# Start local server
python -m http.server 8000
# or
npx serve .

# Open in browser
http://localhost:8000
```

## 🏗️ Project Structure

### Core Files (DO NOT MODIFY without review)
- `assets/js/vat-engine.js` - VAT calculation logic
- `assets/js/file-processor.js` - Excel file processing
- Tax code definitions and transaction mappings

### Safe to Modify
- UI components and styling
- Help documentation
- User interface improvements
- New features (with approval)

### File Organization
```
├── assets/
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript modules
│   └── images/       # Static assets
├── docs/             # Documentation
├── tests/            # Test files and sample data
└── *.html           # Page templates
```

## 🧪 Testing Requirements

### Before Submitting Changes
1. **Test with Sample Data**
   ```bash
   # Use provided test files
   tests/sample-data/basic-vat-sample.csv
   tests/sample-data/large-dataset-sample.csv
   ```

2. **Verify VAT Calculations**
   - Input VAT totals are correct
   - Output VAT totals are correct
   - VAT payable calculation is accurate
   - Tax code breakdowns match expectations

3. **Browser Testing**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)
   - Mobile browsers

4. **Mobile Responsiveness**
   - Test on actual mobile devices
   - Verify touch interactions work
   - Check file upload on mobile
   - Ensure tables are scrollable

### Test Scenarios
```javascript
// Example test case
const testData = [
  {
    TaxCode: '1',
    TrCode: 'CASH',
    TaxRate: 15,
    TaxAmount: 150,
    ExclAmount: 1000,
    InclAmount: 1150
  }
];

const results = calculateVAT(testData);
assert(results.totalInputVAT === 150);
```

## 📝 Coding Standards

### JavaScript
```javascript
// Use ES6+ features
const calculateVAT = (data) => {
  // Implementation
};

// Comment complex logic
function processTransaction(transaction) {
  // Determine if this is INPUT or OUTPUT
  const isInput = VAT_INPUT_CODES.includes(transaction.TrCode);
  // ... rest of logic
}

// Use meaningful variable names
const totalInputVAT = inputTransactions.reduce((sum, t) => sum + t.TaxAmount, 0);
```

### CSS
```css
/* Use CSS custom properties */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}

/* Mobile-first responsive design */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### HTML
```html
<!-- Semantic HTML structure -->
<main class="main-content">
  <section class="vat-calculator">
    <h2>Upload VAT File</h2>
    <!-- content -->
  </section>
</main>

<!-- Accessibility attributes -->
<button aria-label="Upload Excel file">
  Choose File
</button>
```

## 🚫 What NOT to Change

### Protected Logic
- VAT calculation formulas
- Tax code definitions (1, 3, 5)
- Transaction code mappings
- Excel column requirements
- Currency formatting for ZAR

### Core Constants
```javascript
// DO NOT MODIFY these without approval
const VAT_INPUT_CODES = ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'];
const VAT_OUTPUT_CODES = ['IS', 'INV', 'RTS'];
const TAX_CODES = {
  '1': { description: 'Standard Rate', rate: 15 },
  '3': { description: 'Zero Rate', rate: 0 },
  '5': { description: 'Exempt', rate: 0 }
};
```

## ✅ Types of Contributions Welcome

### 🎨 UI/UX Improvements
- Better visual design
- Improved user flows
- Enhanced mobile experience
- Accessibility improvements

### 📚 Documentation
- Code comments
- User guides
- API documentation
- Deployment instructions

### 🐛 Bug Fixes
- Calculation errors
- UI bugs
- Mobile issues
- Browser compatibility

### ⚡ Performance Optimizations
- Faster file processing
- Improved memory usage
- Better caching strategies
- Loading optimizations

### 🌟 New Features
- Export formats (Excel, CSV)
- Advanced reporting
- Data visualization
- User preferences

## 📋 Pull Request Process

### 1. Create Issue First
- Describe the problem or feature
- Get feedback from maintainers
- Discuss implementation approach

### 2. Fork and Branch
```bash
git checkout -b feature/descriptive-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes
- Follow coding standards
- Test thoroughly
- Update documentation
- Preserve existing functionality

### 4. Commit Messages
```bash
# Good commit messages
git commit -m "feat: add PDF export functionality"
git commit -m "fix: correct VAT calculation for zero-rated items"
git commit -m "docs: update API documentation"

# Use conventional commits format
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
```

### 5. Submit Pull Request
- Use the PR template
- Include screenshots for UI changes
- Reference related issues
- Describe testing performed

## 🔍 Code Review Criteria

### Technical Requirements
- [ ] Code follows project standards
- [ ] No breaking changes to VAT logic
- [ ] Browser compatibility maintained
- [ ] Mobile responsiveness verified
- [ ] Performance impact assessed

### VAT Calculation Accuracy
- [ ] Mathematical accuracy verified
- [ ] Test cases pass
- [ ] Edge cases handled
- [ ] SARS compliance maintained

### User Experience
- [ ] Intuitive user interface
- [ ] Clear error messages
- [ ] Helpful guidance provided
- [ ] Accessibility considerations

## 🚨 Security Considerations

### Client-Side Processing
- All data processing happens in browser
- No data sent to external servers
- Local storage used appropriately
- File validation implemented

### Input Validation
```javascript
// Validate file types
const allowedTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

// Sanitize data inputs
function sanitizeAmount(value) {
  return parseFloat(value) || 0;
}
```

## 📞 Getting Help

### Questions
- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Code Comments**: Inline documentation for complex logic

### Resources
- [South African VAT Guide](https://www.sars.gov.za/tax-types/vat/)
- [Excel File Format Documentation](https://docs.microsoft.com/en-us/office/open-xml/working-with-sheets)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎉 Recognition

Contributors will be:
- Listed in project acknowledgments
- Credited in release notes
- Invited to maintainer discussions (for significant contributions)

## 📄 Legal

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for helping make VAT Calculator Pro better for South African businesses! 🇿🇦**
