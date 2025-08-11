# Security Policy

## Supported Versions

We actively support the following versions of VAT Calculator Pro:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Yes             |
| < 1.0   | ❌ No              |

## Security Features

VAT Calculator Pro is designed with security and privacy as core principles:

### Client-Side Processing
- **No Server Communication**: All VAT calculations happen in your browser
- **No Data Upload**: Excel files are processed locally, never sent to external servers
- **Complete Privacy**: Your financial data never leaves your device

### Data Protection
- **Local Processing Only**: Files are processed using JavaScript in your browser
- **No Persistent Storage**: Data is cleared when you close the browser tab
- **No Tracking**: We don't collect or store any user data

### Browser Security
- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **HTTPS Only**: All connections use secure HTTPS encryption
- **No External Dependencies**: Minimal third-party libraries reduce attack surface

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🚨 Critical Security Issues
For critical security vulnerabilities:

1. **DO NOT** create a public GitHub issue
2. **DO NOT** disclose the vulnerability publicly
3. **Email us immediately** at: [security@yourcompany.com] (or create private issue)

### 📧 Security Report Template

Please include the following information:

```
Subject: Security Vulnerability Report - VAT Calculator Pro

1. Vulnerability Type:
   [ ] Cross-Site Scripting (XSS)
   [ ] Content Security Policy Bypass
   [ ] File Processing Vulnerability
   [ ] Data Exposure
   [ ] Other: _______________

2. Affected Components:
   [ ] Excel file processing
   [ ] VAT calculation engine
   [ ] PDF generation
   [ ] User interface
   [ ] Other: _______________

3. Steps to Reproduce:
   [Detailed steps]

4. Impact Assessment:
   [ ] Low - Limited impact
   [ ] Medium - Moderate impact
   [ ] High - Significant impact
   [ ] Critical - Severe impact

5. Proof of Concept:
   [Screenshots, code samples, or demonstration]

6. Suggested Fix:
   [If you have suggestions]

7. Your Contact Information:
   [How we can reach you for follow-up]
```

### 🕐 Response Timeline

We commit to the following response times:

- **Initial Response**: Within 24 hours
- **Assessment**: Within 72 hours
- **Progress Update**: Weekly updates during investigation
- **Resolution**: Based on severity (critical issues prioritized)

### 🏆 Security Researcher Recognition

We appreciate security researchers who help improve our application:

- **Acknowledgment**: Security researchers will be credited (if desired)
- **Hall of Fame**: Maintained in this document for significant contributions
- **Responsible Disclosure**: We support responsible disclosure practices

## Security Best Practices for Users

### Safe Usage Guidelines

1. **Use Official Sources Only**
   - Download from: [https://github.com/RAD0901/Business_VAT_Calculator](https://github.com/RAD0901/Business_VAT_Calculator)
   - Use official deployment: [https://vat-calculator-pro.netlify.app](https://vat-calculator-pro.netlify.app)

2. **Browser Security**
   - Keep your browser updated
   - Use modern browsers (Chrome, Firefox, Safari, Edge)
   - Enable automatic security updates

3. **File Handling**
   - Only upload files you trust
   - Scan files with antivirus if uncertain
   - Remove sensitive data from sample files

4. **Data Privacy**
   - Close browser tab when finished
   - Use private/incognito browsing for sensitive data
   - Clear browser cache if using shared computers

### Red Flags - When NOT to Use

🚫 **Do not use this application if:**
- Website URL looks suspicious or unofficial
- Browser shows security warnings
- You're asked to install additional software
- Site requests unnecessary permissions

## Technical Security Details

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self';
worker-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
```

### Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### File Processing Security
- **File Type Validation**: Only Excel files (.xlsx, .xls) accepted
- **Size Limits**: Files limited to 50MB to prevent memory issues
- **Content Validation**: Excel content is validated before processing
- **Error Handling**: Safe error handling prevents information disclosure

## Known Security Considerations

### Acceptable Risks
1. **Client-Side Processing**: JavaScript code is visible to users (by design)
2. **Browser Compatibility**: Older browsers may have different security models
3. **Local Storage**: Browser local storage used for user preferences only

### Mitigation Strategies
1. **No Sensitive Logic**: No API keys or secrets in client-side code
2. **Progressive Enhancement**: Application works with basic security features
3. **Minimal Data Storage**: Only user preferences stored locally

## Security Audit History

| Date | Auditor | Scope | Findings | Status |
|------|---------|-------|----------|--------|
| TBD  | Internal | Full Application | - | Planned |

## Compliance

### Data Protection
- **GDPR Compliant**: No personal data processing
- **POPIA Compliant**: No personal information collected
- **Client-Side Only**: Eliminates most data protection concerns

### Financial Regulations
- **No Financial Data Storage**: VAT data processed locally only
- **SARS Compliance**: Calculations follow SARS guidelines
- **Audit Trail**: Users maintain their own audit trails

## Security Hall of Fame

We thank the following security researchers for their contributions:

*[No reports yet - be the first!]*

## Contact Information

- **Security Email**: [security contact - update this]
- **General Issues**: [GitHub Issues](https://github.com/RAD0901/Business_VAT_Calculator/issues)
- **Public Repository**: [https://github.com/RAD0901/Business_VAT_Calculator](https://github.com/RAD0901/Business_VAT_Calculator)

---

**Last Updated**: August 11, 2025
**Next Review**: February 11, 2026

*This security policy is regularly reviewed and updated to reflect current best practices and threats.*
