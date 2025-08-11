/**
 * Analytics Manager for VAT Calculator Pro - Enterprise Edition
 * Comprehensive tracking for user behavior, performance, and business metrics
 * Version: 2.0.0
 */

class AnalyticsManager {
  constructor(config = {}) {
    this.config = {
      gaId: config.gaId || 'G-XXXXXXXXXX', // Replace with actual GA4 ID
      debug: config.debug || false,
      privacyMode: config.privacyMode || true,
      enableUserConsent: config.enableUserConsent || true,
      environment: config.environment || (this.isLocalhost() ? 'development' : 'production'),
      ...config
    };
    
    this.initialized = false;
    this.userConsent = false;
    this.sessionData = this.initializeSession();
    this.performanceMetrics = {};
    this.eventQueue = [];
    
    this.init();
  }

  /**
   * Check if running on localhost
   */
  isLocalhost() {
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);
  }

  /**
   * Initialize analytics tracking
   */
  async init() {
    try {
      // Check for user consent first
      if (this.config.enableUserConsent) {
        await this.checkUserConsent();
      } else {
        this.userConsent = true;
      }

      if (this.userConsent) {
        await this.loadGoogleAnalytics();
        this.setupEventListeners();
        this.trackPageView();
        this.initializePerformanceTracking();
        this.initializeErrorTracking();
        this.processEventQueue();
        this.initialized = true;
        
        if (this.config.debug) {
          console.log('AnalyticsManager initialized - Enterprise Edition');
        }
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      this.trackError('analytics_init_failed', error.message);
    }
  }

  /**
   * Initialize session data
   */
  initializeSession() {
    const sessionId = this.generateSessionId();
    const sessionStart = Date.now();
    
    return {
      sessionId,
      sessionStart,
      pagesViewed: 0,
      eventsTracked: 0,
      lastActivity: sessionStart,
      userAgent: navigator.userAgent.substring(0, 200),
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'VAT_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Load Google Analytics 4
   */
  async loadGoogleAnalytics() {
    if (this.config.environment === 'development' && !this.config.debug) {
      return; // Skip GA in development unless debug mode
    }

    return new Promise((resolve) => {
      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gaId}`;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', this.config.gaId, {
          // Privacy settings
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          
          // Enhanced measurement
          enhanced_measurement: {
            scrolls: true,
            outbound_clicks: true,
            site_search: false,
            video_engagement: false,
            file_downloads: true,
            page_changes: true
          },

          // Debug mode
          debug_mode: this.config.debug
        });

        resolve();
      };

      script.onerror = () => {
        console.warn('Failed to load Google Analytics');
        resolve();
      };
    });
  }

  /**
   * Check and manage user consent
   */
  async checkUserConsent() {
    const consent = localStorage.getItem('vat_analytics_consent');
    
    if (consent === null) {
      this.showConsentBanner();
    } else {
      this.userConsent = consent === 'true';
    }
  }

  /**
   * Show privacy-compliant consent banner
   */
  showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'analytics-consent-banner';
    banner.innerHTML = `
      <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #2d3748; color: white; padding: 1rem; z-index: 1000; border-top: 3px solid #667eea;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="flex: 1; min-width: 300px;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">Privacy & Analytics</h3>
            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
              We use privacy-friendly analytics to improve our VAT calculator. 
              No personal data is collected, and all processing happens locally on your device.
              <a href="/privacy" style="color: #667eea; text-decoration: underline;">Learn more</a>
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button id="consent-decline" style="padding: 0.5rem 1rem; background: transparent; border: 1px solid #718096; color: white; border-radius: 4px; cursor: pointer;">
              Decline
            </button>
            <button id="consent-accept" style="padding: 0.5rem 1rem; background: #667eea; border: none; color: white; border-radius: 4px; cursor: pointer;">
              Accept Analytics
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Handle consent actions
    document.getElementById('consent-accept').onclick = () => {
      this.setUserConsent(true);
      document.body.removeChild(banner);
    };
    
    document.getElementById('consent-decline').onclick = () => {
      this.setUserConsent(false);
      document.body.removeChild(banner);
    };
  }

  /**
   * Set user consent preference
   */
  setUserConsent(consent) {
    this.userConsent = consent;
    localStorage.setItem('vat_analytics_consent', consent.toString());
    
    if (consent && !this.initialized) {
      this.init();
    }
  }

  /**
   * Setup event listeners for automatic tracking
   */
  setupEventListeners() {
    // File upload tracking
    document.addEventListener('change', (e) => {
      if (e.target.type === 'file' && e.target.files.length > 0) {
        const file = e.target.files[0];
        this.trackFileUpload(file.size, file.type, file.name);
      }
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.id) {
        this.trackFormSubmission(form.id, form.action);
      }
    });

    // Button clicks
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button && button.textContent) {
        this.trackButtonClick(button.textContent.trim(), button.className);
      }
    });

    // Page unload (for session duration)
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  /**
   * Track page views with enhanced data
   */
  trackPageView(page = null, referrer = null) {
    if (!this.userConsent || !window.gtag) return;

    this.sessionData.pagesViewed++;
    this.sessionData.lastActivity = Date.now();

    const pageData = {
      page_title: document.title,
      page_location: page || window.location.href,
      page_referrer: referrer || document.referrer,
      session_id: this.sessionData.sessionId,
      page_number: this.sessionData.pagesViewed
    };

    gtag('config', this.config.gaId, {
      page_title: pageData.page_title,
      page_location: pageData.page_location
    });

    // Track as custom event with additional data
    this.trackEvent('page_view', {
      page_path: new URL(pageData.page_location).pathname,
      page_title: pageData.page_title,
      referrer_domain: pageData.page_referrer ? new URL(pageData.page_referrer).hostname : 'direct',
      session_id: pageData.session_id
    });
  }

  /**
   * Core VAT Calculator Events
   */

  // Track file upload attempts
  trackFileUpload(fileSize, fileType, fileName) {
    if (!this.userConsent) return;

    const eventData = {
      file_size: fileSize,
      file_size_category: this.categorizeFileSize(fileSize),
      file_type: fileType,
      file_extension: fileName.split('.').pop()?.toLowerCase() || 'unknown',
      session_id: this.sessionData.sessionId
    };

    this.trackEvent('file_upload', eventData);
    
    // Store for later correlation
    this.sessionData.lastUpload = {
      timestamp: Date.now(),
      ...eventData
    };
  }

  // Track VAT calculation completion
  trackCalculation(results, processingTime) {
    if (!this.userConsent) return;

    const eventData = {
      // Performance metrics
      processing_time: processingTime,
      processing_time_range: this.categorizeProcessingTime(processingTime),
      
      // Business metrics
      vat_payable: results.vatPayable || 0,
      vat_amount_range: this.categorizeVATAmount(results.vatPayable || 0),
      total_input_vat: results.totalInputVAT || 0,
      total_output_vat: results.totalOutputVAT || 0,
      
      // Transaction data
      transaction_count: results.transactionCount || 0,
      tax_codes_used: this.extractTaxCodes(results.taxCodeBreakdown),
      
      // Session context
      session_id: this.sessionData.sessionId,
      file_size_category: this.sessionData.lastUpload?.file_size_category || 'unknown'
    };

    this.trackEvent('vat_calculation_complete', eventData);
    
    // Track as conversion
    this.trackConversion('vat_calculation', results.vatPayable || 0);
  }

  // Track export downloads
  trackExport(format, vatAmount, exportType = 'standard') {
    if (!this.userConsent) return;

    const eventData = {
      export_format: format.toLowerCase(),
      export_type: exportType,
      vat_amount: vatAmount || 0,
      vat_amount_range: this.categorizeVATAmount(vatAmount || 0),
      session_id: this.sessionData.sessionId,
      timestamp: new Date().toISOString()
    };

    this.trackEvent('export_download', eventData);
    
    // Track as conversion
    this.trackConversion('export_download', 1);
  }

  // Track errors with context
  trackError(errorType, errorMessage, context = {}) {
    if (!this.userConsent) return;

    const eventData = {
      error_type: errorType,
      error_message: errorMessage.substring(0, 150), // Truncate for privacy
      error_context: JSON.stringify(context).substring(0, 500),
      
      // Session context
      session_id: this.sessionData.sessionId,
      page_path: window.location.pathname,
      user_agent: navigator.userAgent.substring(0, 200),
      
      // File context if available
      file_size_category: this.sessionData.lastUpload?.file_size_category || 'none',
      
      // Timestamp
      error_timestamp: new Date().toISOString()
    };

    this.trackEvent('error_occurred', eventData);
  }

  /**
   * Performance Tracking
   */
  initializePerformanceTracking() {
    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track custom performance metrics
    this.trackCustomPerformanceMetrics();
  }

  trackCoreWebVitals() {
    // Load web-vitals library dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    script.onload = () => {
      if (window.webVitals) {
        // Largest Contentful Paint
        window.webVitals.getLCP((metric) => {
          this.trackPerformanceMetric('LCP', metric.value, metric.rating);
        });

        // First Input Delay
        window.webVitals.getFID((metric) => {
          this.trackPerformanceMetric('FID', metric.value, metric.rating);
        });

        // Cumulative Layout Shift
        window.webVitals.getCLS((metric) => {
          this.trackPerformanceMetric('CLS', metric.value, metric.rating);
        });

        // First Contentful Paint
        window.webVitals.getFCP((metric) => {
          this.trackPerformanceMetric('FCP', metric.value, metric.rating);
        });

        // Time to First Byte
        window.webVitals.getTTFB((metric) => {
          this.trackPerformanceMetric('TTFB', metric.value, metric.rating);
        });
      }
    };
    document.head.appendChild(script);
  }

  trackCustomPerformanceMetrics() {
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackPerformanceMetric('page_load_time', loadTime, this.categorizeLoadTime(loadTime));
    });

    // DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const domTime = performance.now();
        this.trackPerformanceMetric('dom_content_loaded', domTime, this.categorizeLoadTime(domTime));
      });
    }
  }

  trackPerformanceMetric(name, value, rating) {
    if (!this.userConsent) return;

    this.performanceMetrics[name] = { value, rating, timestamp: Date.now() };

    this.trackEvent('performance_metric', {
      metric_name: name,
      metric_value: Math.round(value),
      metric_rating: rating,
      page_path: window.location.pathname,
      session_id: this.sessionData.sessionId
    });
  }

  /**
   * Error Tracking
   */
  initializeErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('unhandled_promise_rejection', event.reason?.message || 'Unknown promise rejection', {
        reason: event.reason
      });
    });
  }

  /**
   * Conversion and Goal Tracking
   */
  trackConversion(conversionType, value = 1) {
    if (!this.userConsent || !window.gtag) return;

    gtag('event', 'conversion', {
      'send_to': this.config.gaId,
      'value': value,
      'currency': 'ZAR',
      'event_category': 'vat_calculator',
      'event_label': conversionType
    });
  }

  /**
   * Helper Methods
   */
  
  trackEvent(eventName, parameters = {}) {
    if (!this.userConsent) {
      // Queue events if consent not given yet
      this.eventQueue.push({ eventName, parameters, timestamp: Date.now() });
      return;
    }

    if (!window.gtag) {
      // Queue events if GA not loaded yet
      this.eventQueue.push({ eventName, parameters, timestamp: Date.now() });
      return;
    }

    this.sessionData.eventsTracked++;
    this.sessionData.lastActivity = Date.now();

    gtag('event', eventName, {
      ...parameters,
      'event_category': 'vat_calculator',
      'send_to': this.config.gaId
    });

    if (this.config.debug) {
      console.log('Analytics Event:', eventName, parameters);
    }
  }

  processEventQueue() {
    if (this.eventQueue.length > 0) {
      this.eventQueue.forEach(({ eventName, parameters }) => {
        this.trackEvent(eventName, parameters);
      });
      this.eventQueue = [];
    }
  }

  trackButtonClick(buttonText, buttonClass) {
    this.trackEvent('button_click', {
      button_text: buttonText.substring(0, 50),
      button_class: buttonClass.substring(0, 100),
      page_path: window.location.pathname,
      session_id: this.sessionData.sessionId
    });
  }

  trackFormSubmission(formId, formAction) {
    this.trackEvent('form_submit', {
      form_id: formId,
      form_action: formAction || 'unknown',
      page_path: window.location.pathname,
      session_id: this.sessionData.sessionId
    });
  }

  trackSessionEnd() {
    if (this.sessionData.sessionStart) {
      const sessionDuration = Date.now() - this.sessionData.sessionStart;
      this.trackEvent('session_end', {
        session_duration: Math.round(sessionDuration / 1000), // in seconds
        pages_viewed: this.sessionData.pagesViewed,
        events_tracked: this.sessionData.eventsTracked,
        session_id: this.sessionData.sessionId
      });
    }
  }

  /**
   * Categorization Methods
   */
  
  categorizeFileSize(bytes) {
    if (bytes < 100000) return 'small'; // < 100KB
    if (bytes < 1000000) return 'medium'; // < 1MB
    if (bytes < 10000000) return 'large'; // < 10MB
    return 'very_large';
  }

  categorizeProcessingTime(ms) {
    if (ms < 1000) return 'very_fast';
    if (ms < 5000) return 'fast';
    if (ms < 15000) return 'moderate';
    if (ms < 30000) return 'slow';
    return 'very_slow';
  }

  categorizeVATAmount(amount) {
    if (amount < 1000) return 'small';
    if (amount < 10000) return 'medium';
    if (amount < 100000) return 'large';
    if (amount < 1000000) return 'very_large';
    return 'enterprise';
  }

  categorizeLoadTime(ms) {
    if (ms < 1000) return 'excellent';
    if (ms < 2500) return 'good';
    if (ms < 4000) return 'needs_improvement';
    return 'poor';
  }

  extractTaxCodes(taxCodeBreakdown) {
    if (!taxCodeBreakdown) return 'unknown';
    return Object.keys(taxCodeBreakdown).join(',');
  }

  /**
   * Public API
   */
  
  // Enable/disable tracking
  setTrackingEnabled(enabled) {
    this.userConsent = enabled;
    localStorage.setItem('vat_analytics_consent', enabled.toString());
  }

  // Get tracking status
  isTrackingEnabled() {
    return this.userConsent;
  }

  // Manual page tracking
  trackPage(page) {
    this.trackPageView(page);
  }

  // Manual event tracking
  track(event, data) {
    this.trackEvent(event, data);
  }

  // Get session data
  getSessionData() {
    return { ...this.sessionData };
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsManager;
}

// Auto-initialize if config is available
if (typeof window !== 'undefined' && window.VAT_ANALYTICS_CONFIG) {
  window.analyticsManager = new AnalyticsManager(window.VAT_ANALYTICS_CONFIG);
}
