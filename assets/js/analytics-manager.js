// Analytics & Monitoring System
class AnalyticsManager {
    constructor() {
        this.config = {
            production: {
                gaId: 'G-XXXXXXXXXX', // Replace with actual GA4 ID
                enableAnalytics: true,
                enableErrorTracking: true
            },
            development: {
                gaId: null,
                enableAnalytics: false,
                enableErrorTracking: true
            }
        };
        
        this.isProduction = !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);
        this.currentConfig = this.isProduction ? this.config.production : this.config.development;
        
        this.eventQueue = [];
        this.sessionData = this.initializeSession();
        
        this.initializeAnalytics();
    }

    // Initialize Analytics
    initializeAnalytics() {
        if (this.currentConfig.enableAnalytics && this.currentConfig.gaId) {
            this.loadGoogleAnalytics();
        }

        // Initialize custom event tracking
        this.initializeEventTracking();
        
        // Initialize performance monitoring
        this.initializePerformanceTracking();
        
        // Initialize error tracking
        if (this.currentConfig.enableErrorTracking) {
            this.initializeErrorTracking();
        }

        // Start session tracking
        this.trackSession();
    }

    // Google Analytics 4 Integration
    loadGoogleAnalytics() {
        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.currentConfig.gaId}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.currentConfig.gaId, {
            page_title: 'VAT Calculator Pro',
            page_location: window.location.href,
            custom_map: {
                custom_parameter_1: 'file_processing_time',
                custom_parameter_2: 'calculation_accuracy'
            }
        });

        // Store gtag globally
        window.gtag = gtag;
        this.gtag = gtag;
    }

    // Custom Event Tracking
    initializeEventTracking() {
        // Track page views
        this.trackPageView(window.location.pathname);

        // Track user interactions
        this.setupInteractionTracking();
        
        // Track business metrics
        this.setupBusinessMetrics();
    }

    // Track Page Views
    trackPageView(page, title = null) {
        const event = {
            event_name: 'page_view',
            page_location: window.location.href,
            page_path: page,
            page_title: title || document.title,
            timestamp: new Date().toISOString()
        };

        this.trackEvent(event);

        // Update session data
        this.sessionData.pages_visited.push({
            page,
            timestamp: new Date().toISOString(),
            time_on_page: 0
        });
    }

    // Track Custom Events
    trackEvent(eventData) {
        // Add session context
        const enrichedEvent = {
            ...eventData,
            session_id: this.sessionData.session_id,
            user_id: this.sessionData.user_id,
            timestamp: eventData.timestamp || new Date().toISOString(),
            user_agent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        // Queue event
        this.eventQueue.push(enrichedEvent);

        // Send to Google Analytics if available
        if (this.gtag && this.currentConfig.enableAnalytics) {
            this.gtag('event', eventData.event_name, {
                event_category: eventData.category || 'User Interaction',
                event_label: eventData.label || '',
                value: eventData.value || 0,
                custom_parameter_1: eventData.file_processing_time || null,
                custom_parameter_2: eventData.calculation_accuracy || null
            });
        }

        // Store locally for analysis
        this.storeEventLocally(enrichedEvent);

        // Debug log in development
        if (!this.isProduction) {
            console.log('Analytics Event:', enrichedEvent);
        }
    }

    // File Processing Analytics
    trackFileProcessing(eventType, data = {}) {
        const events = {
            file_upload_start: {
                event_name: 'file_upload_start',
                category: 'File Processing',
                label: data.filename || 'unknown',
                file_size: data.file_size || 0,
                file_type: data.file_type || 'unknown'
            },
            file_upload_success: {
                event_name: 'file_upload_success',
                category: 'File Processing',
                label: data.filename || 'unknown',
                processing_time: data.processing_time || 0,
                record_count: data.record_count || 0,
                file_size: data.file_size || 0
            },
            file_upload_error: {
                event_name: 'file_upload_error',
                category: 'File Processing',
                label: data.error_type || 'unknown_error',
                error_message: data.error_message || '',
                file_size: data.file_size || 0,
                file_type: data.file_type || 'unknown'
            },
            calculation_complete: {
                event_name: 'calculation_complete',
                category: 'VAT Processing',
                label: 'vat_calculation',
                processing_time: data.processing_time || 0,
                record_count: data.record_count || 0,
                input_vat: data.input_vat || 0,
                output_vat: data.output_vat || 0,
                net_vat: data.net_vat || 0
            }
        };

        if (events[eventType]) {
            this.trackEvent(events[eventType]);
        }
    }

    // Export Analytics
    trackExport(format, success = true, data = {}) {
        this.trackEvent({
            event_name: success ? 'export_success' : 'export_error',
            category: 'Export',
            label: format,
            export_format: format,
            success: success,
            record_count: data.record_count || 0,
            file_size: data.file_size || 0,
            processing_time: data.processing_time || 0
        });
    }

    // Feature Usage Analytics
    trackFeatureUsage(feature, action, value = null) {
        this.trackEvent({
            event_name: 'feature_usage',
            category: 'Feature Usage',
            label: `${feature}_${action}`,
            feature: feature,
            action: action,
            value: value
        });
    }

    // User Journey Tracking
    trackUserJourney(step, data = {}) {
        const journeyEvent = {
            event_name: 'user_journey',
            category: 'User Journey',
            label: step,
            journey_step: step,
            step_index: this.sessionData.journey_steps.length + 1,
            time_from_start: Date.now() - this.sessionData.session_start,
            ...data
        };

        this.sessionData.journey_steps.push({
            step,
            timestamp: new Date().toISOString(),
            data
        });

        this.trackEvent(journeyEvent);
    }

    // Error Analytics
    trackError(error, context = {}) {
        this.trackEvent({
            event_name: 'error_occurred',
            category: 'Errors',
            label: error.type || 'unknown_error',
            error_type: error.type || 'unknown',
            error_message: error.message || '',
            error_code: error.code || '',
            context: JSON.stringify(context),
            stack_trace: error.stack || '',
            page: window.location.pathname
        });
    }

    // Business Metrics
    setupBusinessMetrics() {
        // Track file processing success rates
        this.businessMetrics = {
            files_processed: 0,
            files_failed: 0,
            total_records_processed: 0,
            average_processing_time: 0,
            export_counts: {
                pdf: 0,
                excel: 0,
                email: 0,
                print: 0
            },
            popular_features: {},
            error_patterns: {}
        };
    }

    updateBusinessMetrics(metric, value, increment = false) {
        if (increment) {
            this.businessMetrics[metric] = (this.businessMetrics[metric] || 0) + value;
        } else {
            this.businessMetrics[metric] = value;
        }

        // Store updated metrics
        this.storeMetricsLocally();
    }

    // Performance Tracking
    initializePerformanceTracking() {
        // Track Core Web Vitals
        if ('PerformanceObserver' in window) {
            this.trackWebVitals();
        }

        // Track custom performance metrics
        this.trackCustomPerformance();
    }

    trackWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            const lcp = lastEntry.renderTime || lastEntry.loadTime;
            
            this.trackEvent({
                event_name: 'web_vital_lcp',
                category: 'Performance',
                label: 'largest_contentful_paint',
                value: Math.round(lcp)
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            const fid = firstInput.processingStart - firstInput.startTime;
            
            this.trackEvent({
                event_name: 'web_vital_fid',
                category: 'Performance',
                label: 'first_input_delay',
                value: Math.round(fid)
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            
            this.trackEvent({
                event_name: 'web_vital_cls',
                category: 'Performance',
                label: 'cumulative_layout_shift',
                value: Math.round(clsValue * 1000) / 1000
            });
        }).observe({ entryTypes: ['layout-shift'] });
    }

    trackCustomPerformance() {
        // Track file processing performance
        window.addEventListener('file-processing-start', (event) => {
            this.processingStartTime = performance.now();
        });

        window.addEventListener('file-processing-complete', (event) => {
            const processingTime = performance.now() - this.processingStartTime;
            
            this.trackEvent({
                event_name: 'processing_performance',
                category: 'Performance',
                label: 'file_processing_time',
                value: Math.round(processingTime),
                record_count: event.detail?.recordCount || 0,
                file_size: event.detail?.fileSize || 0
            });
        });
    }

    // Session Management
    initializeSession() {
        let sessionId = localStorage.getItem('vat_calculator_session_id');
        let userId = localStorage.getItem('vat_calculator_user_id');

        // Generate new IDs if not exists
        if (!sessionId) {
            sessionId = this.generateSessionId();
            localStorage.setItem('vat_calculator_session_id', sessionId);
        }

        if (!userId) {
            userId = this.generateUserId();
            localStorage.setItem('vat_calculator_user_id', userId);
        }

        return {
            session_id: sessionId,
            user_id: userId,
            session_start: Date.now(),
            pages_visited: [],
            journey_steps: [],
            events_count: 0,
            returning_user: localStorage.getItem('vat_calculator_returning_user') === 'true'
        };
    }

    trackSession() {
        // Mark as returning user
        if (!this.sessionData.returning_user) {
            localStorage.setItem('vat_calculator_returning_user', 'true');
        }

        // Track session start
        this.trackEvent({
            event_name: 'session_start',
            category: 'Session',
            label: this.sessionData.returning_user ? 'returning_user' : 'new_user',
            is_returning_user: this.sessionData.returning_user
        });

        // Track session duration periodically
        setInterval(() => {
            const duration = Date.now() - this.sessionData.session_start;
            this.trackEvent({
                event_name: 'session_duration',
                category: 'Session',
                label: 'periodic_update',
                value: Math.round(duration / 1000) // in seconds
            });
        }, 300000); // Every 5 minutes

        // Track session end on page unload
        window.addEventListener('beforeunload', () => {
            const duration = Date.now() - this.sessionData.session_start;
            this.trackEvent({
                event_name: 'session_end',
                category: 'Session',
                label: 'page_unload',
                session_duration: Math.round(duration / 1000),
                pages_visited: this.sessionData.pages_visited.length,
                events_triggered: this.sessionData.events_count
            });
        });
    }

    // Interaction Tracking
    setupInteractionTracking() {
        // Track clicks on important elements
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            // Track button clicks
            if (target.matches('button') || target.closest('button')) {
                const button = target.closest('button') || target;
                this.trackEvent({
                    event_name: 'button_click',
                    category: 'Interaction',
                    label: button.textContent.trim() || button.id || 'unknown_button',
                    button_type: button.className || 'unknown'
                });
            }

            // Track navigation clicks
            if (target.matches('a[onclick*="navigateToPage"]') || target.closest('a[onclick*="navigateToPage"]')) {
                const link = target.closest('a') || target;
                const page = link.getAttribute('data-page') || 'unknown';
                this.trackEvent({
                    event_name: 'navigation_click',
                    category: 'Navigation',
                    label: page,
                    from_page: window.location.hash.slice(1) || 'home'
                });
            }

            // Track export clicks
            if (target.matches('.export-btn') || target.closest('.export-btn')) {
                const exportBtn = target.closest('.export-btn') || target;
                const exportType = exportBtn.textContent.toLowerCase().includes('pdf') ? 'pdf' :
                                 exportBtn.textContent.toLowerCase().includes('excel') ? 'excel' :
                                 exportBtn.textContent.toLowerCase().includes('email') ? 'email' :
                                 exportBtn.textContent.toLowerCase().includes('print') ? 'print' : 'unknown';
                
                this.trackEvent({
                    event_name: 'export_attempt',
                    category: 'Export',
                    label: exportType,
                    export_type: exportType
                });
            }
        });

        // Track form interactions
        document.addEventListener('change', (event) => {
            const target = event.target;
            
            if (target.type === 'file') {
                this.trackEvent({
                    event_name: 'file_selected',
                    category: 'File Upload',
                    label: 'file_input_change',
                    file_count: target.files.length
                });
            }
        });
    }

    // Local Storage
    storeEventLocally(event) {
        const events = JSON.parse(localStorage.getItem('vat_calculator_analytics') || '[]');
        events.push(event);
        
        // Keep only last 1000 events
        if (events.length > 1000) {
            events.splice(0, events.length - 1000);
        }
        
        localStorage.setItem('vat_calculator_analytics', JSON.stringify(events));
    }

    storeMetricsLocally() {
        localStorage.setItem('vat_calculator_metrics', JSON.stringify(this.businessMetrics));
    }

    // Error Tracking
    initializeErrorTracking() {
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'Unhandled Promise Rejection',
                message: event.reason.toString(),
                stack: event.reason.stack || null
            });
        });
    }

    // Utility Methods
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Analytics Dashboard Data
    getAnalyticsDashboard() {
        const events = JSON.parse(localStorage.getItem('vat_calculator_analytics') || '[]');
        const metrics = JSON.parse(localStorage.getItem('vat_calculator_metrics') || '{}');
        
        return {
            session: this.sessionData,
            recent_events: events.slice(-50),
            business_metrics: metrics,
            performance_summary: this.getPerformanceSummary()
        };
    }

    getPerformanceSummary() {
        return {
            session_duration: Date.now() - this.sessionData.session_start,
            pages_visited: this.sessionData.pages_visited.length,
            events_tracked: this.eventQueue.length,
            memory_usage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    // Export Analytics Data
    exportAnalyticsData() {
        const data = this.getAnalyticsDashboard();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vat-calculator-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize analytics manager
const analyticsManager = new AnalyticsManager();
