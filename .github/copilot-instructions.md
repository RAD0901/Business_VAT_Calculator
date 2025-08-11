<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# VAT Calculator Pro - Copilot Instructions

## Project Overview
This is a client-side web application for processing South African VAT data from Excel files. The application generates professional reports for SARS compliance without requiring any server infrastructure.

## Technical Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Libraries**: XLSX.js for Excel processing, jsPDF for PDF generation
- **Architecture**: Single Page Application (SPA) with client-side processing only
- **Deployment**: Static hosting (Netlify recommended)

## Key Business Logic
- **VAT Input Codes**: ['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'] - purchases/expenses
- **VAT Output Codes**: ['IS', 'INV', 'RTS'] - sales/income
- **Tax Codes**: 1 (Standard 15%), 3 (Zero-rated 0%), 5 (Exempt 0%)
- **Core Formula**: VAT Payable = Total Output VAT - Total Input VAT

## Development Guidelines
1. **Client-side Only**: All processing must happen in the browser - no server calls
2. **Professional UI**: Use gradient designs, card-based layouts, modern typography
3. **Error Handling**: Provide clear, user-friendly error messages with resolution guidance
4. **Performance**: Handle 10,000+ transactions in <5 seconds
5. **Mobile-first**: Responsive design for all screen sizes
6. **Security**: Validate all file inputs and sanitize data

## Code Style
- Use modern JavaScript features (ES6+ classes, arrow functions, async/await)
- Follow the existing CSS custom properties (CSS variables) pattern
- Maintain consistent 2-space indentation
- Use semantic HTML structure
- Include comprehensive error handling for all user interactions

## File Processing Requirements
- Support .xlsx and .xls files up to 50MB
- Required columns: TaxCode, TaxDescription, TrCode, TaxRate, TaxAmount, ExclAmount, InclAmount
- Validate data types and provide specific error messages for missing/invalid data
- Process files asynchronously with progress indicators

## UI/UX Patterns
- Use the established design system with primary gradient (#667eea to #764ba2)
- Implement card-based layouts with hover effects
- Show loading states during file processing
- Display results in professional stat cards with currency formatting
- Use the existing UIManager class pattern for consistency

## Current Development Status
- **Chunk 1 (MVP Core)**: ✅ COMPLETED - Single HTML file with full functionality
- **Next Phase**: Multi-page application with enhanced UX features

When suggesting improvements or new features, ensure they align with the professional business application requirements and maintain the client-side-only architecture.
