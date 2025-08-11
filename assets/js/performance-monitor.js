/**
 * Performance Monitoring Dashboard for VAT Calculator Pro
 * Real-time performance metrics and optimization insights
 * Version: 1.0.0
 */

class PerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      enableRealTimeMetrics: config.enableRealTimeMetrics !== false,
      enableDetailedTimings: config.enableDetailedTimings !== false,
      enableMemoryTracking: config.enableMemoryTracking !== false,
      enableNetworkMonitoring: config.enableNetworkMonitoring !== false,
      reportingInterval: config.reportingInterval || 30000, // 30 seconds
      maxMetricsHistory: config.maxMetricsHistory || 100,
      performanceThresholds: {
        lcp: config.performanceThresholds?.lcp || 2500,
        fid: config.performanceThresholds?.fid || 100,
        cls: config.performanceThresholds?.cls || 0.1,
        ...config.performanceThresholds
      },
      ...config
    };

    this.metrics = {
      coreWebVitals: {},
      customMetrics: {},
      resourceTimings: [],
      memoryUsage: [],
      networkRequests: [],
      calculationPerformance: [],
      userInteractions: []
    };

    this.observers = {};
    this.startTime = performance.now();
    this.isVisible = true;
    
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    this.setupCoreWebVitalsTracking();
    this.setupResourceTimingTracking();
    this.setupMemoryTracking();
    this.setupNetworkMonitoring();
    this.setupUserInteractionTracking();
    this.setupVisibilityTracking();
    this.startPeriodicReporting();
    
    console.log('PerformanceMonitor initialized');
  }

  /**
   * Core Web Vitals Tracking
   */
  setupCoreWebVitalsTracking() {
    // Load web-vitals library
    this.loadWebVitalsLibrary().then(() => {
      if (window.webVitals) {
        // Largest Contentful Paint
        window.webVitals.getLCP((metric) => {
          this.recordCoreWebVital('lcp', metric);
        });

        // First Input Delay
        window.webVitals.getFID((metric) => {
          this.recordCoreWebVital('fid', metric);
        });

        // Cumulative Layout Shift
        window.webVitals.getCLS((metric) => {
          this.recordCoreWebVital('cls', metric);
        });

        // First Contentful Paint
        window.webVitals.getFCP((metric) => {
          this.recordCoreWebVital('fcp', metric);
        });

        // Time to First Byte
        window.webVitals.getTTFB((metric) => {
          this.recordCoreWebVital('ttfb', metric);
        });

        // Interaction to Next Paint (INP)
        if (window.webVitals.getINP) {
          window.webVitals.getINP((metric) => {
            this.recordCoreWebVital('inp', metric);
          });
        }
      }
    });
  }

  /**
   * Load web-vitals library
   */
  async loadWebVitalsLibrary() {
    if (window.webVitals) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Record Core Web Vital metric
   */
  recordCoreWebVital(name, metric) {
    this.metrics.coreWebVitals[name] = {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now(),
      isGoodRating: this.isGoodRating(name, metric.value)
    };

    // Report to analytics
    if (window.analyticsManager) {
      window.analyticsManager.trackPerformanceMetric(name, metric.value, metric.rating);
    }

    // Check for performance issues
    this.checkPerformanceThresholds(name, metric.value);
  }

  /**
   * Setup resource timing tracking
   */
  setupResourceTimingTracking() {
    if (!this.config.enableDetailedTimings) return;

    // Monitor new resources
    this.observers.resourceTiming = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.recordResourceTiming(entry);
      });
    });

    this.observers.resourceTiming.observe({ entryTypes: ['resource'] });

    // Monitor navigation timing
    this.observers.navigation = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.recordNavigationTiming(entry);
      });
    });

    this.observers.navigation.observe({ entryTypes: ['navigation'] });
  }

  /**
   * Record resource timing
   */
  recordResourceTiming(entry) {
    const resourceData = {
      name: entry.name,
      type: this.getResourceType(entry),
      duration: entry.duration,
      size: entry.transferSize || 0,
      startTime: entry.startTime,
      loadTime: entry.responseEnd - entry.requestStart,
      cacheHit: entry.transferSize === 0 && entry.decodedBodySize > 0,
      timestamp: Date.now()
    };

    this.metrics.resourceTimings.push(resourceData);
    
    // Keep only recent entries
    if (this.metrics.resourceTimings.length > this.config.maxMetricsHistory) {
      this.metrics.resourceTimings.shift();
    }

    // Alert on slow resources
    if (resourceData.duration > 3000) { // 3 seconds
      this.reportSlowResource(resourceData);
    }
  }

  /**
   * Record navigation timing
   */
  recordNavigationTiming(entry) {
    this.metrics.navigationTiming = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domComplete: entry.domComplete - entry.navigationStart,
      firstByte: entry.responseStart - entry.requestStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      timestamp: Date.now()
    };
  }

  /**
   * Setup memory tracking
   */
  setupMemoryTracking() {
    if (!this.config.enableMemoryTracking || !performance.memory) return;

    setInterval(() => {
      const memoryInfo = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        utilization: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
        timestamp: Date.now()
      };

      this.metrics.memoryUsage.push(memoryInfo);
      
      // Keep only recent entries
      if (this.metrics.memoryUsage.length > this.config.maxMetricsHistory) {
        this.metrics.memoryUsage.shift();
      }

      // Alert on high memory usage
      if (memoryInfo.utilization > 80) {
        this.reportHighMemoryUsage(memoryInfo);
      }
    }, 5000); // Every 5 seconds
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    if (!this.config.enableNetworkMonitoring) return;

    // Monitor effective connection type
    if (navigator.connection) {
      this.recordNetworkInfo();
      
      navigator.connection.addEventListener('change', () => {
        this.recordNetworkInfo();
      });
    }

    // Monitor fetch requests
    this.interceptNetworkRequests();
  }

  /**
   * Record network information
   */
  recordNetworkInfo() {
    if (!navigator.connection) return;

    const networkInfo = {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData,
      timestamp: Date.now()
    };

    this.metrics.networkInfo = networkInfo;
  }

  /**
   * Intercept network requests for monitoring
   */
  interceptNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordNetworkRequest({
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          size: response.headers.get('content-length') || 0,
          success: response.ok,
          timestamp: Date.now()
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordNetworkRequest({
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          size: 0,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
        
        throw error;
      }
    };
  }

  /**
   * Record network request
   */
  recordNetworkRequest(requestData) {
    this.metrics.networkRequests.push(requestData);
    
    // Keep only recent entries
    if (this.metrics.networkRequests.length > this.config.maxMetricsHistory) {
      this.metrics.networkRequests.shift();
    }
  }

  /**
   * Setup user interaction tracking
   */
  setupUserInteractionTracking() {
    // Track user interactions using Performance Observer
    if ('PerformanceObserver' in window) {
      this.observers.userInteraction = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name === 'first-input') {
            this.recordUserInteraction(entry);
          }
        });
      });

      try {
        this.observers.userInteraction.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Fallback for older browsers
      }
    }

    // Track click responsiveness
    document.addEventListener('click', (event) => {
      const startTime = performance.now();
      
      requestAnimationFrame(() => {
        const responseTime = performance.now() - startTime;
        this.recordInteractionTiming('click', responseTime, event.target);
      });
    });
  }

  /**
   * Record user interaction timing
   */
  recordUserInteraction(entry) {
    const interactionData = {
      type: 'first-input',
      delay: entry.processingStart - entry.startTime,
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    };

    this.metrics.userInteractions.push(interactionData);
  }

  /**
   * Record interaction timing
   */
  recordInteractionTiming(type, responseTime, target) {
    const interactionData = {
      type,
      responseTime,
      targetTag: target.tagName,
      targetClass: target.className,
      timestamp: Date.now()
    };

    this.metrics.userInteractions.push(interactionData);
    
    // Keep only recent entries
    if (this.metrics.userInteractions.length > this.config.maxMetricsHistory) {
      this.metrics.userInteractions.shift();
    }
  }

  /**
   * Setup visibility tracking
   */
  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      
      if (this.isVisible) {
        this.recordCustomMetric('page_visibility', 'visible');
      } else {
        this.recordCustomMetric('page_visibility', 'hidden');
      }
    });
  }

  /**
   * VAT Calculator specific performance tracking
   */
  
  // Track file processing performance
  trackFileProcessing(fileSize, processingTime, recordCount) {
    const performanceData = {
      fileSize,
      processingTime,
      recordCount,
      processingRate: recordCount / (processingTime / 1000), // records per second
      memoryUsage: performance.memory?.usedJSHeapSize || 0,
      timestamp: Date.now()
    };

    this.metrics.calculationPerformance.push(performanceData);
    
    // Report to analytics
    if (window.analyticsManager) {
      window.analyticsManager.trackEvent('file_processing_performance', {
        processing_time: processingTime,
        file_size: fileSize,
        record_count: recordCount,
        processing_rate: Math.round(performanceData.processingRate)
      });
    }
  }

  // Track calculation performance
  trackCalculationPerformance(calculationType, executionTime, dataSize) {
    const performanceData = {
      type: calculationType,
      executionTime,
      dataSize,
      efficiency: dataSize / executionTime, // items per millisecond
      timestamp: Date.now()
    };

    this.recordCustomMetric('calculation_performance', performanceData);
  }

  /**
   * Record custom metric
   */
  recordCustomMetric(name, value) {
    if (!this.metrics.customMetrics[name]) {
      this.metrics.customMetrics[name] = [];
    }

    this.metrics.customMetrics[name].push({
      value,
      timestamp: Date.now()
    });

    // Keep only recent entries
    if (this.metrics.customMetrics[name].length > this.config.maxMetricsHistory) {
      this.metrics.customMetrics[name].shift();
    }
  }

  /**
   * Performance analysis methods
   */
  
  isGoodRating(metric, value) {
    const thresholds = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      ttfb: 800
    };

    return value <= (thresholds[metric] || Infinity);
  }

  checkPerformanceThresholds(metric, value) {
    const threshold = this.config.performanceThresholds[metric];
    
    if (threshold && value > threshold) {
      this.reportPerformanceIssue(metric, value, threshold);
    }
  }

  reportPerformanceIssue(metric, value, threshold) {
    const issue = {
      type: 'performance_threshold_exceeded',
      metric,
      value,
      threshold,
      severity: this.calculateSeverity(value, threshold),
      timestamp: Date.now()
    };

    // Report to error tracker
    if (window.errorTracker) {
      window.errorTracker.reportBusinessError(
        'performance_issue',
        `${metric.toUpperCase()} exceeded threshold: ${value}ms > ${threshold}ms`,
        issue
      );
    }
  }

  calculateSeverity(value, threshold) {
    const ratio = value / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  reportSlowResource(resourceData) {
    if (window.errorTracker) {
      window.errorTracker.reportBusinessError(
        'slow_resource',
        `Slow resource load: ${resourceData.name}`,
        resourceData
      );
    }
  }

  reportHighMemoryUsage(memoryInfo) {
    if (window.errorTracker) {
      window.errorTracker.reportBusinessError(
        'high_memory_usage',
        `High memory utilization: ${memoryInfo.utilization.toFixed(1)}%`,
        memoryInfo
      );
    }
  }

  /**
   * Get resource type from timing entry
   */
  getResourceType(entry) {
    if (entry.initiatorType) return entry.initiatorType;
    
    const url = entry.name;
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    
    return 'other';
  }

  /**
   * Periodic reporting
   */
  startPeriodicReporting() {
    setInterval(() => {
      this.generatePerformanceReport();
    }, this.config.reportingInterval);
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      uptime: performance.now() - this.startTime,
      coreWebVitals: this.metrics.coreWebVitals,
      customMetrics: this.summarizeCustomMetrics(),
      resourcePerformance: this.summarizeResourcePerformance(),
      memoryUsage: this.getLatestMemoryUsage(),
      networkPerformance: this.summarizeNetworkPerformance(),
      userExperience: this.analyzeUserExperience()
    };

    // Send to analytics
    if (window.analyticsManager) {
      window.analyticsManager.trackEvent('performance_report', {
        report_type: 'periodic',
        core_web_vitals_score: this.calculateWebVitalsScore(),
        memory_utilization: report.memoryUsage?.utilization || 0,
        avg_resource_load_time: report.resourcePerformance?.averageLoadTime || 0
      });
    }

    return report;
  }

  /**
   * Public API methods
   */
  
  // Get current performance metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Get performance summary
  getPerformanceSummary() {
    return {
      coreWebVitals: this.metrics.coreWebVitals,
      overallScore: this.calculateWebVitalsScore(),
      recommendations: this.generateRecommendations()
    };
  }

  // Calculate overall Web Vitals score
  calculateWebVitalsScore() {
    const vitals = this.metrics.coreWebVitals;
    let score = 0;
    let count = 0;

    ['lcp', 'fid', 'cls'].forEach(metric => {
      if (vitals[metric]) {
        score += vitals[metric].isGoodRating ? 1 : 0;
        count++;
      }
    });

    return count > 0 ? (score / count) * 100 : 0;
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    const vitals = this.metrics.coreWebVitals;

    if (vitals.lcp && !vitals.lcp.isGoodRating) {
      recommendations.push({
        metric: 'LCP',
        issue: 'Largest Contentful Paint is too slow',
        suggestion: 'Optimize images, reduce server response times, and eliminate render-blocking resources'
      });
    }

    if (vitals.fid && !vitals.fid.isGoodRating) {
      recommendations.push({
        metric: 'FID',
        issue: 'First Input Delay is too high',
        suggestion: 'Reduce JavaScript execution time and optimize event handlers'
      });
    }

    if (vitals.cls && !vitals.cls.isGoodRating) {
      recommendations.push({
        metric: 'CLS',
        issue: 'Cumulative Layout Shift is too high',
        suggestion: 'Set explicit dimensions for images and ads, avoid inserting content above existing content'
      });
    }

    return recommendations;
  }

  summarizeCustomMetrics() {
    const summary = {};
    
    Object.keys(this.metrics.customMetrics).forEach(metric => {
      const values = this.metrics.customMetrics[metric];
      summary[metric] = {
        count: values.length,
        latest: values[values.length - 1]?.value,
        average: values.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0) / values.length
      };
    });

    return summary;
  }

  summarizeResourcePerformance() {
    const resources = this.metrics.resourceTimings;
    if (resources.length === 0) return null;

    const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0);
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);

    return {
      totalRequests: resources.length,
      averageLoadTime: totalDuration / resources.length,
      totalSize,
      cacheHitRate: resources.filter(r => r.cacheHit).length / resources.length
    };
  }

  getLatestMemoryUsage() {
    const memory = this.metrics.memoryUsage;
    return memory.length > 0 ? memory[memory.length - 1] : null;
  }

  summarizeNetworkPerformance() {
    const requests = this.metrics.networkRequests;
    if (requests.length === 0) return null;

    const successfulRequests = requests.filter(r => r.success);
    const avgDuration = requests.reduce((sum, r) => sum + r.duration, 0) / requests.length;

    return {
      totalRequests: requests.length,
      successRate: successfulRequests.length / requests.length,
      averageDuration: avgDuration,
      networkInfo: this.metrics.networkInfo
    };
  }

  analyzeUserExperience() {
    const interactions = this.metrics.userInteractions;
    if (interactions.length === 0) return null;

    const responseTimes = interactions
      .filter(i => i.responseTime)
      .map(i => i.responseTime);

    if (responseTimes.length === 0) return null;

    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);

    return {
      totalInteractions: interactions.length,
      averageResponseTime: avgResponseTime,
      maxResponseTime: maxResponseTime,
      responsiveness: avgResponseTime < 100 ? 'excellent' : avgResponseTime < 300 ? 'good' : 'needs_improvement'
    };
  }

  // Clean up observers
  destroy() {
    Object.values(this.observers).forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.performanceMonitor = new PerformanceMonitor();
}
