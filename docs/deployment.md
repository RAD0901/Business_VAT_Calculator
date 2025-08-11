# Automated Deployment Workflow - VAT Calculator Pro

## Overview

This document covers the comprehensive CI/CD pipeline implemented for the VAT Calculator Pro application, providing automated quality assurance, testing, security scanning, performance monitoring, and deployment to multiple environments.

## Architecture

### Deployment Pipeline
```
Code Push → Quality Checks → Security Scan → Testing → Build → Deploy → Monitor
     ↓           ↓              ↓           ↓        ↓       ↓        ↓
   GitHub    ESLint/Prettier   CodeQL    Playwright  Optimize Netlify  Lighthouse
   Actions   Stylelint/HTML    Trivy     Visual/A11y  Bundle   Env     Performance
             Validation        Scanner   Performance  Minify   Deploy   Monitor
```

### Environment Strategy
- **Production**: `main` branch → Production environment
- **Staging**: `develop` branch → Staging environment  
- **Preview**: Pull requests → Preview deployments
- **Local**: Development environment with hot reload

## GitHub Actions Workflow

### Automated Pipeline Jobs

#### 1. Quality Check Job
**Triggers**: Every push and pull request
```yaml
- ESLint (JavaScript/TypeScript linting)
- Stylelint (CSS linting) 
- HTML validation
- Prettier formatting check
- Package vulnerability audit
```

#### 2. Security Scanning Job
**Triggers**: Push to main/develop, scheduled weekly
```yaml
- CodeQL analysis (SAST)
- Trivy container/filesystem scanning
- Dependency vulnerability assessment
- License compliance check
- Secret detection
```

#### 3. Automated Testing Job
**Triggers**: After quality checks pass
```yaml
- Functional testing (Playwright)
- Cross-browser testing (Chrome/Firefox/Safari)
- Visual regression testing
- Accessibility testing (WCAG compliance)
- Mobile responsiveness testing
```

#### 4. Performance Testing Job
**Triggers**: After tests pass
```yaml
- Lighthouse CI audit
- Core Web Vitals monitoring
- Bundle size analysis
- Load time optimization
- Performance budgets enforcement
```

#### 5. Build & Optimization Job
**Triggers**: After performance tests pass
```yaml
- Asset minification (CSS/JS)
- Image optimization
- Sitemap generation
- Analytics configuration
- Bundle analysis and tree shaking
```

#### 6. Deploy Job
**Triggers**: After build completes successfully
```yaml
- Environment-specific deployment
- Health check validation
- Smoke testing post-deployment
- Cache invalidation
- Deployment notifications
```

#### 7. Notification Job
**Triggers**: Always (success/failure)
```yaml
- Slack notifications (optional)
- Email notifications
- GitHub status updates
- Team communication
- Deployment summaries
```

#### 8. Rollback Job
**Triggers**: On deployment failure or manual trigger
```yaml
- Automatic rollback to last known good version
- Health check validation
- Incident reporting
- Team notifications
- Post-rollback verification
```

## Setup Instructions

### 1. Repository Configuration

#### Required Secrets
Configure these in GitHub Repository Settings > Secrets and Variables > Actions:

```bash
# Netlify Deployment
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_SITE_ID=your_production_site_id
NETLIFY_STAGING_SITE_ID=your_staging_site_id

# Notifications (Optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url
NOTIFICATION_EMAIL=team@yourcompany.com

# Security Scanning (Optional)
SONAR_TOKEN=your_sonarcloud_token
```

#### Environment Variables
Configure in GitHub Repository Settings > Secrets and Variables > Actions > Variables:

```bash
# Application Configuration
ANALYTICS_ID=your_google_analytics_id
CONTACT_EMAIL=support@yourcompany.com
ERROR_REPORTING=true

# Performance Budgets
LIGHTHOUSE_PERFORMANCE_THRESHOLD=90
LIGHTHOUSE_ACCESSIBILITY_THRESHOLD=95
LIGHTHOUSE_BEST_PRACTICES_THRESHOLD=90
LIGHTHOUSE_SEO_THRESHOLD=90
```

### 2. Branch Protection Rules

Configure in GitHub Repository Settings > Branches:

```yaml
Branch Protection for 'main':
  - Require pull request reviews before merging
  - Require status checks to pass before merging
    - quality-check
    - security-scan  
    - automated-testing
    - performance-testing
  - Require branches to be up to date before merging
  - Require linear history
  - Restrict pushes that create files larger than 100MB
```

### 3. Local Development Setup

#### Prerequisites
```bash
# Required tools
node --version  # v18.0.0+
npm --version   # v8.0.0+
git --version   # v2.30.0+

# Optional tools
netlify --version  # Latest CLI
lighthouse --version  # Latest CLI
```

#### Installation
```bash
# Clone repository
git clone https://github.com/your-org/vat-calculator-pro.git
cd vat-calculator-pro

# Install dependencies
npm install

# Install development tools
npm run setup:dev

# Verify installation
npm run test:ci
npm run lint:all
```

#### Development Commands
```bash
# Start development server
npm run dev

# Run full test suite
npm run test

# Run quality checks
npm run lint:all
npm run format:check

# Run performance audit
npm run lighthouse:dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment Environments

### Production Environment
- **URL**: `https://vat-calculator-pro.netlify.app`
- **Branch**: `main`
- **Triggers**: Direct push to main, manual deployment
- **Quality Gates**: All checks must pass
- **Monitoring**: Full monitoring and alerting enabled
- **SLA**: 99.9% uptime

### Staging Environment  
- **URL**: `https://staging--vat-calculator-pro.netlify.app`
- **Branch**: `develop`
- **Triggers**: Push to develop branch
- **Quality Gates**: All checks must pass
- **Purpose**: Pre-production testing and validation
- **Data**: Production-like test data

### Preview Environment
- **URL**: `https://deploy-preview-{PR-NUMBER}--vat-calculator-pro.netlify.app`
- **Branch**: Any pull request
- **Triggers**: Pull request creation/update
- **Quality Gates**: Basic checks required
- **Purpose**: Feature review and testing
- **Cleanup**: Auto-deleted when PR is closed

## Quality Assurance Pipeline

### Code Quality Standards

#### JavaScript/TypeScript
```javascript
// ESLint configuration in .eslintrc.json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### CSS Standards
```css
/* Stylelint configuration in .stylelintrc.json */
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "indentation": 2,
    "string-quotes": "single",
    "color-hex-case": "lower",
    "color-hex-length": "short"
  }
}
```

#### HTML Validation
```json
// HTML validation in .html-validate.json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "require-sri": "error",
    "no-trailing-whitespace": "error",
    "attribute-boolean-style": "error"
  }
}
```

### Testing Strategy

#### Functional Testing
```javascript
// Playwright test example
test('VAT calculation accuracy', async ({ page }) => {
  await page.goto('/');
  await page.fill('#amount', '100');
  await page.selectOption('#vatRate', '20');
  await page.click('#calculate');
  
  const result = await page.textContent('#result');
  expect(result).toContain('120.00');
});
```

#### Visual Regression Testing
```javascript
// Visual comparison testing
test('Homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

#### Accessibility Testing
```javascript
// WCAG compliance testing
test('Accessibility standards', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
    
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

#### Performance Testing
```javascript
// Core Web Vitals monitoring
test('Performance metrics', async ({ page }) => {
  await page.goto('/');
  
  const metrics = await page.evaluate(() => {
    return {
      fcp: performance.getEntriesByType('paint')[0]?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
      cls: performance.getEntriesByType('layout-shift')
        .reduce((sum, entry) => sum + entry.value, 0)
    };
  });
  
  expect(metrics.fcp).toBeLessThan(1800); // First Contentful Paint < 1.8s
  expect(metrics.lcp).toBeLessThan(2500); // Largest Contentful Paint < 2.5s
  expect(metrics.cls).toBeLessThan(0.1);  // Cumulative Layout Shift < 0.1
});
```

## Security Implementation

### Security Scanning
- **SAST**: CodeQL for static analysis
- **Dependency Scanning**: npm audit and Trivy
- **Container Scanning**: Trivy filesystem scan
- **Secret Detection**: GitHub secret scanning
- **License Compliance**: License compatibility check

### Security Headers
```toml
# netlify.toml security configuration
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = '''
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      connect-src 'self' https://api.netlify.com;
    '''
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### Vulnerability Management
```bash
# Automated vulnerability scanning
npm audit --audit-level=moderate
trivy fs --exit-code 1 --severity HIGH,CRITICAL .

# Dependency updates
dependabot.yml configuration for automated dependency updates
```

## Performance Monitoring

### Lighthouse CI Configuration
```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:8080"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Performance Budgets
```json
// Performance thresholds
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {"metric": "first-contentful-paint", "budget": 1800},
        {"metric": "largest-contentful-paint", "budget": 2500},
        {"metric": "cumulative-layout-shift", "budget": 0.1}
      ],
      "resourceSizes": [
        {"resourceType": "script", "budget": 150},
        {"resourceType": "stylesheet", "budget": 50},
        {"resourceType": "image", "budget": 300},
        {"resourceType": "total", "budget": 500}
      ]
    }
  ]
}
```

### Real User Monitoring
```javascript
// Performance tracking in analytics-manager.js
class PerformanceMonitor {
  trackCoreWebVitals() {
    // Track FCP, LCP, FID, CLS
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.sendMetric(entry.name, entry.value);
      });
    }).observe({entryTypes: ['paint', 'largest-contentful-paint', 'first-input']});
  }
}
```

## Build Optimization

### Asset Optimization
```javascript
// Build optimization pipeline
const optimization = {
  css: {
    minification: true,
    purgeUnused: true,
    inlining: 'critical'
  },
  javascript: {
    minification: true,
    treeShaking: true,
    codeSplitting: true
  },
  images: {
    compression: true,
    webpGeneration: true,
    lazyLoading: true
  }
};
```

### Bundle Analysis
```bash
# Bundle size monitoring
npm run build:analyze

# Critical path optimization
npm run optimize:critical

# Asset compression
npm run compress:assets
```

## Rollback Procedures

### Automatic Rollback
The workflow includes automatic rollback on deployment failure:

```yaml
# Automatic rollback triggers
- Deployment health check failure
- Critical error rate spike
- Performance degradation > 20%
- Security vulnerability detection
```

### Manual Rollback
```bash
# Via GitHub Actions
# Navigate to Actions > Deploy > Re-run specific successful deployment

# Via Netlify CLI
netlify sites:list
netlify api sites/{site-id}/deploys
netlify api sites/{site-id}/deploys/{deploy-id}/restore

# Via Netlify Dashboard
# Site overview > Deploys > Select previous deploy > Publish deploy
```

### Rollback Validation
```bash
# Post-rollback checks
1. Health check endpoints respond correctly
2. Core functionality testing passes
3. Performance metrics within acceptable range
4. No security vulnerabilities detected
5. User experience validation
```

## Disaster Recovery

### Backup Strategy
- **Code Repository**: Git repository with full history
- **Deployment History**: Netlify maintains deploy history
- **Configuration Backup**: Environment variables and settings documented
- **Data Backup**: Static assets backed up to CDN

### Recovery Procedures
```bash
# Complete site recovery
1. Fork/clone repository to new location
2. Set up new Netlify site with same configuration
3. Update DNS records if necessary
4. Deploy from backup repository
5. Validate full functionality
```

### Business Continuity
- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 15 minutes
- **Failover Strategy**: Multi-region CDN with automatic failover
- **Communication Plan**: Automated status page updates

## Monitoring and Alerting

### Health Checks
```javascript
// Automated health monitoring
const healthChecks = {
  endpoints: [
    '/health',
    '/api/status',
    '/assets/js/app.js',
    '/assets/css/main.css'
  ],
  frequency: '5 minutes',
  timeout: '10 seconds',
  retries: 3
};
```

### Performance Monitoring
```bash
# Continuous monitoring
- Lighthouse CI: Performance, Accessibility, SEO, Best Practices
- Real User Monitoring: Core Web Vitals, User Experience
- Uptime Monitoring: 99.9% SLA with 5-minute checks
- Error Tracking: JavaScript errors, Network failures
```

### Alerting Rules
```yaml
# Alert conditions
Performance Degradation:
  - Core Web Vitals below threshold
  - Page load time > 3 seconds
  - Error rate > 1%

Security Issues:
  - Vulnerability detected in dependencies
  - CSP violations increasing
  - Unusual traffic patterns

Availability Issues:
  - Site downtime > 1 minute
  - Health check failures
  - CDN issues
```

## Team Workflows

### Development Process
```bash
# Feature development workflow
1. Create feature branch from develop
2. Implement feature with tests
3. Run local quality checks
4. Push to trigger CI pipeline
5. Create pull request to develop
6. Code review and approval
7. Merge to develop (triggers staging deployment)
8. Test in staging environment
9. Create pull request to main
10. Deploy to production
```

### Release Management
```bash
# Release process
1. Create release branch from develop
2. Update version numbers and changelog
3. Run full test suite
4. Deploy to staging for final validation
5. Merge to main (triggers production deployment)
6. Tag release with semantic version
7. Update documentation
8. Communicate release to stakeholders
```

### Hotfix Process
```bash
# Emergency fixes
1. Create hotfix branch from main
2. Implement minimal fix with tests
3. Run expedited CI pipeline
4. Deploy to staging for validation
5. Merge to main and develop
6. Monitor production deployment
7. Document incident and resolution
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Debug build issues
1. Check build logs in GitHub Actions
2. Verify dependencies in package.json
3. Test build locally: npm run build
4. Check for syntax errors: npm run lint:all
5. Validate configuration files
```

#### Test Failures
```bash
# Debug test issues
1. Run tests locally: npm run test
2. Check test reports in GitHub Actions
3. Review failing test screenshots
4. Validate test data and fixtures
5. Check for browser compatibility issues
```

#### Deployment Failures
```bash
# Debug deployment issues
1. Check Netlify build logs
2. Verify environment variables
3. Test deploy locally: netlify deploy
4. Check _redirects and netlify.toml syntax
5. Validate DNS configuration
```

#### Performance Issues
```bash
# Debug performance problems
1. Run Lighthouse audit locally
2. Check Core Web Vitals in production
3. Analyze bundle size: npm run build:analyze
4. Review network requests in DevTools
5. Check CDN cache configuration
```

### Debug Commands
```bash
# Local debugging
npm run dev:debug          # Development server with debugging
npm run test:debug          # Test runner with debugging
npm run build:debug         # Build with verbose output
npm run lint:debug          # Linting with detailed output

# Production debugging
netlify dev                 # Local Netlify environment
netlify build               # Local build simulation
netlify deploy --alias=test # Test deployment
lighthouse https://your-site.com --view  # Performance audit
```

## Best Practices

### Code Quality
- Write comprehensive tests for all features
- Maintain minimum 80% code coverage
- Follow consistent coding standards
- Use semantic commit messages
- Keep dependencies up to date

### Security
- Regularly update dependencies
- Follow security headers best practices
- Implement proper input validation
- Use HTTPS everywhere
- Monitor for security vulnerabilities

### Performance
- Optimize images and assets
- Implement lazy loading
- Use efficient caching strategies
- Monitor Core Web Vitals
- Set performance budgets

### Deployment
- Use feature flags for gradual rollouts
- Implement proper error handling
- Monitor deployment health
- Have rollback procedures ready
- Document all configuration changes

## Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify Documentation](https://docs.netlify.com)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

### Tools
- [GitHub Actions Workflow Debugger](https://github.com/nektos/act)
- [Netlify CLI](https://cli.netlify.com)
- [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse)
- [Playwright Inspector](https://playwright.dev/docs/inspector)

### Monitoring
- [Netlify Analytics](https://docs.netlify.com/monitor-sites/analytics/)
- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [WebPageTest](https://www.webpagetest.org)
- [GTmetrix](https://gtmetrix.com)

---

This comprehensive deployment workflow ensures high-quality, secure, and performant releases of the VAT Calculator Pro application through automated CI/CD practices.
