/**
 * Error Tracking Service for VAT Calculator Pro
 * Comprehensive error monitoring and reporting
 * Version: 1.0.0
 */

class ErrorTrackingService {
  constructor(config = {}) {
    this.config = {
      sentryDsn: config.sentryDsn || null,
      environment: config.environment || 'production',
      release: config.release || '1.0.0',
      enableLogging: config.enableLogging !== false,
      enableLocalStorage: config.enableLocalStorage !== false,
      maxStoredErrors: config.maxStoredErrors || 100,
      enableUserReporting: config.enableUserReporting !== false,
      ...config
    };

    this.errorQueue = [];
    this.initialized = false;
    this.sessionId = this.generateSessionId();
    
    this.init();
  }

  /**
   * Initialize error tracking
   */
  async init() {
    try {
      // Setup global error handlers
      this.setupGlobalErrorHandlers();
      
      // Initialize Sentry if DSN provided
      if (this.config.sentryDsn) {
        await this.initializeSentry();
      }
      
      // Load stored errors
      this.loadStoredErrors();
      
      this.initialized = true;
      
      if (this.config.enableLogging) {
        console.log('ErrorTrackingService initialized');
      }
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        reason: event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      });
    });

    // Network errors
    this.setupNetworkErrorTracking();
  }

  /**
   * Setup network error tracking
   */
  setupNetworkErrorTracking() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.captureError({
            type: 'network_error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
          });
        }
        
        return response;
      } catch (error) {
        this.captureError({
          type: 'network_error',
          message: error.message,
          url: args[0],
          error: error.toString(),
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };
  }

  /**
   * Initialize Sentry error tracking
   */
  async initializeSentry() {
    try {
      // Load Sentry SDK
      const script = document.createElement('script');
      script.src = 'https://browser.sentry-cdn.com/7.85.0/bundle.tracing.min.js';
      script.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Initialize Sentry
      if (window.Sentry) {
        window.Sentry.init({
          dsn: this.config.sentryDsn,
          environment: this.config.environment,
          release: this.config.release,
          
          // Performance monitoring
          tracesSampleRate: this.config.environment === 'production' ? 0.1 : 1.0,
          
          // Privacy settings
          beforeSend: (event) => {
            // Remove sensitive data
            if (event.request?.headers) {
              delete event.request.headers['Authorization'];
              delete event.request.headers['Cookie'];
            }
            
            // Filter out known non-critical errors
            if (this.shouldIgnoreError(event)) {
              return null;
            }
            
            return event;
          },

          // Set user context
          initialScope: {
            tags: {
              component: 'vat-calculator',
              session_id: this.sessionId
            },
            user: {
              id: this.sessionId
            }
          }
        });
      }
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Capture and process errors
   */
  captureError(errorData, context = {}) {
    const enrichedError = {
      ...errorData,
      sessionId: this.sessionId,
      context: {
        ...context,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent.substring(0, 200)
      }
    };

    // Add to queue
    this.errorQueue.push(enrichedError);

    // Send to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorData.message), {
        tags: {
          error_type: errorData.type,
          session_id: this.sessionId
        },
        extra: enrichedError
      });
    }

    // Store locally
    if (this.config.enableLocalStorage) {
      this.storeErrorLocally(enrichedError);
    }

    // Log to console in development
    if (this.config.enableLogging || this.config.environment === 'development') {
      console.error('Error captured:', enrichedError);
    }

    // Send to analytics if available
    if (window.analyticsManager && typeof window.analyticsManager.trackError === 'function') {
      window.analyticsManager.trackError(errorData.type, errorData.message, context);
    }

    // Show user notification for critical errors
    if (this.isCriticalError(errorData)) {
      this.showErrorNotification(errorData);
    }
  }

  /**
   * Store error in local storage
   */
  storeErrorLocally(errorData) {
    try {
      const stored = JSON.parse(localStorage.getItem('vat_errors') || '[]');
      stored.push(errorData);
      
      // Keep only the latest N errors
      if (stored.length > this.config.maxStoredErrors) {
        stored.splice(0, stored.length - this.config.maxStoredErrors);
      }
      
      localStorage.setItem('vat_errors', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store error locally:', error);
    }
  }

  /**
   * Load previously stored errors
   */
  loadStoredErrors() {
    try {
      const stored = JSON.parse(localStorage.getItem('vat_errors') || '[]');
      this.errorQueue = [...this.errorQueue, ...stored];
    } catch (error) {
      console.warn('Failed to load stored errors:', error);
    }
  }

  /**
   * Check if error should be ignored
   */
  shouldIgnoreError(event) {
    const ignoredMessages = [
      'Script error',
      'Non-Error promise rejection captured',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      'The request timed out'
    ];

    const message = event.exception?.values?.[0]?.value || event.message || '';
    
    return ignoredMessages.some(ignored => 
      message.toLowerCase().includes(ignored.toLowerCase())
    );
  }

  /**
   * Check if error is critical
   */
  isCriticalError(errorData) {
    const criticalTypes = [
      'calculation_error',
      'file_processing_error',
      'data_corruption',
      'security_violation'
    ];

    return criticalTypes.includes(errorData.type);
  }

  /**
   * Show user-friendly error notification
   */
  showErrorNotification(errorData) {
    if (!this.config.enableUserReporting) return;

    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-notification-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">
          <h4>Something went wrong</h4>
          <p>We've encountered an issue and our team has been notified. Please try again or contact support if the problem persists.</p>
        </div>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .error-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .error-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      .error-text h4 {
        margin: 0 0 8px 0;
        color: #c53030;
        font-size: 16px;
      }
      .error-text p {
        margin: 0;
        color: #744210;
        font-size: 14px;
        line-height: 1.4;
      }
      .error-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
        flex-shrink: 0;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .error-close:hover {
        color: #666;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'ERR_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Public API Methods
   */

  // Manually capture an error
  reportError(error, context = {}) {
    const errorData = {
      type: 'manual_error',
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    this.captureError(errorData, context);
  }

  // Capture business logic errors
  reportBusinessError(errorType, message, context = {}) {
    const errorData = {
      type: errorType,
      message: message,
      timestamp: new Date().toISOString()
    };

    this.captureError(errorData, context);
  }

  // Get error statistics
  getErrorStats() {
    const errors = this.errorQueue;
    const stats = {
      total: errors.length,
      byType: {},
      recent: errors.filter(e => 
        new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    };

    errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    return stats;
  }

  // Clear stored errors
  clearErrors() {
    this.errorQueue = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('vat_errors');
    }
  }

  // Export errors for debugging
  exportErrors() {
    return {
      sessionId: this.sessionId,
      errors: this.errorQueue,
      config: { ...this.config, sentryDsn: '***' }, // Hide sensitive data
      timestamp: new Date().toISOString()
    };
  }
}

// VAT Calculator specific error types
class VATCalculatorError extends Error {
  constructor(message, type = 'calculation_error', context = {}) {
    super(message);
    this.name = 'VATCalculatorError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorTrackingService, VATCalculatorError };
}

// Auto-initialize if config is available
if (typeof window !== 'undefined') {
  window.VATCalculatorError = VATCalculatorError;
  
  if (window.ERROR_TRACKING_CONFIG) {
    window.errorTracker = new ErrorTrackingService(window.ERROR_TRACKING_CONFIG);
  } else {
    // Initialize with default config
    window.errorTracker = new ErrorTrackingService({
      environment: window.location.hostname === 'localhost' ? 'development' : 'production'
    });
  }
}
