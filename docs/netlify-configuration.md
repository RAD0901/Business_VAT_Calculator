# Enterprise Netlify Configuration Guide
## VAT Calculator Pro - Production Deployment

This document outlines the comprehensive Netlify configuration for VAT Calculator Pro, including enterprise-level security, performance optimization, and monitoring capabilities.

## 📋 Configuration Overview

### Core Configuration Files

1. **`netlify.toml`** - Primary configuration with build settings, redirects, headers, and plugins
2. **`_redirects`** - Advanced routing rules and URL management
3. **`_headers`** - Granular security and performance headers
4. **`netlify/functions/`** - Serverless functions for API endpoints
5. **`netlify/edge-functions/`** - Edge functions for enhanced performance

## 🛡️ Security Configuration

### Content Security Policy (CSP)
Comprehensive CSP implementation protecting against:
- **XSS attacks** - Script injection prevention
- **Clickjacking** - Frame-ancestors protection
- **Mixed content** - HTTPS enforcement
- **Data exfiltration** - Connect-src restrictions

### Security Headers
```
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
```

### Cross-Origin Policies
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

### Permissions Policy
Restricts browser features:
```
camera=(), microphone=(), geolocation=(), gyroscope=(), 
accelerometer=(), magnetometer=(), usb=(), payment=(), 
autoplay=(), fullscreen=(self), picture-in-picture=()
```

## ⚡ Performance Optimization

### Caching Strategy

#### Static Assets (1 year cache)
- CSS files: `max-age=31536000, immutable`
- JavaScript files: `max-age=31536000, immutable`
- Images: `max-age=31536000, immutable`
- Fonts: `max-age=31536000, immutable`

#### Dynamic Content
- HTML files: `max-age=0, must-revalidate`
- API responses: `no-cache, no-store, must-revalidate`

#### Application Files
- Manifest: `max-age=86400`
- Service Worker: `max-age=0, must-revalidate`

### Resource Optimization
- **Preload critical resources** via Link headers
- **DNS prefetch** for external domains
- **Image optimization** with WebP support
- **Font optimization** with proper CORS headers

## 🌐 Routing Configuration

### SPA Routing
```
/upload /upload/ 301
/results /results/ 301
/* /index.html 200  # Catch-all
```

### API Endpoints
```
/api/* /.netlify/functions/:splat 200
/health /.netlify/functions/health 200
```

### Download Management
```
/download/sample /tests/sample-data/basic-vat-sample.csv 200
/download/template /assets/templates/vat-template.xlsx 200
```

### Security Redirects
```
/.env* - 404
/admin/* - 401
/config/* - 404
```

## 🔧 Serverless Functions

### Health Check (`/health`)
**Purpose**: Application monitoring and status reporting
**Features**:
- System health validation
- Performance metrics
- Environment information
- Response time tracking

**Usage**:
```bash
curl https://vat-calculator-pro.netlify.app/health
```

### Contact Form (`/api/contact`)
**Purpose**: Secure contact form processing
**Features**:
- Spam protection (honeypot)
- Email validation
- Rate limiting
- Sanitized logging

### Error Reporting (`/api/error-report`)
**Purpose**: Client-side error collection
**Features**:
- Error sanitization
- Context preservation
- Unique error IDs
- VAT-specific metadata

## 🌍 Edge Functions

### Security Headers (`security-headers.js`)
**Purpose**: Dynamic security header injection
**Features**:
- Context-aware CSP generation
- Bot detection
- Regional optimization
- Performance hints

### Analytics (`analytics.js`)
**Purpose**: Privacy-friendly usage tracking
**Features**:
- Cookie-free analytics
- Anonymous data collection
- Page type classification
- Geographic insights

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Lighthouse CI** - Automated performance auditing
- **Core Web Vitals** tracking
- **Performance budgets** enforcement
- **Real User Monitoring** data

### Error Tracking
- Client-side error collection
- Server function monitoring
- Unique error reference IDs
- Context preservation

### Usage Analytics
- Privacy-friendly tracking
- Geographic distribution
- Feature usage patterns
- Performance metrics

## 🚀 Deployment Process

### Automatic Deployment
1. **Git Push** → Triggers Netlify build
2. **Build Process** → Static site validation
3. **Deploy Preview** → Branch deployments
4. **Production Deploy** → Main branch only

### Environment Variables
Configure in Netlify dashboard:
```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SITE_URL=https://vat-calculator-pro.netlify.app
CONTACT_EMAIL=support@vatcalculator.com
ENVIRONMENT=production
DEBUG_MODE=false
```

### Branch Deployments
- **`main`** → Production deployment
- **Feature branches** → Preview deployments
- **`staging`** → Staging environment

## 🛠️ Build Configuration

### Build Settings
```toml
[build]
  publish = "."
  command = "echo 'VAT Calculator Pro - Static site deployment'"

[build.environment]
  NODE_VERSION = "18"
```

### Processing Options
```toml
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = false
  minify = true

[build.processing.js]
  bundle = false
  minify = true

[build.processing.images]
  compress = true
```

## 🔌 Plugin Configuration

### Sitemap Generation
```toml
[[plugins]]
  package = "@netlify/plugin-sitemap"
```

### Lighthouse CI
```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
  
  [plugins.inputs]
    performance_budget = {
      "first-contentful-paint" = "2s",
      "largest-contentful-paint" = "2.5s",
      "cumulative-layout-shift" = 0.1,
      "total-blocking-time" = "300ms"
    }
```

### Image Optimization
```toml
[[plugins]]
  package = "netlify-plugin-image-optim"
```

## 🔍 Testing & Validation

### Pre-Deployment Checks
1. **Lighthouse audits** (Performance > 90)
2. **Security header validation**
3. **CSP policy testing**
4. **Mobile responsiveness**
5. **Cross-browser compatibility**

### Monitoring Endpoints
- **Health**: `/health`
- **Performance**: `/performance`
- **Analytics**: `/analytics`

## 🚨 Security Considerations

### Data Protection
- **Client-side processing only** - No server-side data storage
- **No cookies** - Privacy-friendly tracking
- **HTTPS enforcement** - All traffic encrypted
- **Input validation** - All user inputs sanitized

### Attack Prevention
- **XSS protection** - Comprehensive CSP
- **Clickjacking prevention** - Frame-options headers
- **CSRF protection** - SameSite policies
- **DDoS mitigation** - Netlify edge protection

### Compliance
- **GDPR compliant** - No personal data collection
- **POPIA compliant** - South African privacy law
- **SARS compliant** - VAT calculation accuracy

## 📈 Performance Targets

### Core Web Vitals
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Application Performance
- **File processing**: 10,000+ transactions in < 5s
- **Report generation**: < 2s
- **Mobile responsiveness**: All screen sizes
- **Browser support**: Modern browsers (95%+ coverage)

## 🔧 Troubleshooting

### Common Issues

**Build Failures**
1. Check environment variables
2. Validate file paths
3. Review plugin configuration

**Performance Issues**
1. Check Lighthouse reports
2. Review caching headers
3. Validate resource loading

**Security Warnings**
1. Validate CSP policies
2. Check security headers
3. Review HTTPS configuration

### Debug Commands
```bash
# Test locally
npx serve .

# Check security headers
curl -I https://vat-calculator-pro.netlify.app

# Validate CSP
npx csp-evaluator --url https://vat-calculator-pro.netlify.app
```

## 📞 Support Resources

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Security Headers**: [securityheaders.com](https://securityheaders.com)
- **Performance Testing**: [web.dev/measure](https://web.dev/measure)
- **CSP Validator**: [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com)

---

**This configuration provides enterprise-level deployment capabilities while maintaining the client-side nature of VAT Calculator Pro.**
