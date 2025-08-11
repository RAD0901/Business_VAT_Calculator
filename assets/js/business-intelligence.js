/**
 * Business Intelligence Dashboard for VAT Calculator Pro
 * Advanced analytics and insights for VAT calculations
 * Version: 1.0.0
 */

class BusinessIntelligenceDashboard {
  constructor(config = {}) {
    this.config = {
      enableRealTimeUpdates: config.enableRealTimeUpdates !== false,
      enableDataExport: config.enableDataExport !== false,
      enableComparisons: config.enableComparisons !== false,
      retentionPeriod: config.retentionPeriod || 365, // days
      enablePrivacyMode: config.enablePrivacyMode !== false,
      currency: config.currency || 'ZAR',
      ...config
    };

    this.dataStore = {
      calculations: [],
      sessions: [],
      trends: {},
      benchmarks: {},
      insights: []
    };

    this.initialized = false;
    this.dashboardContainer = null;
    
    this.init();
  }

  /**
   * Initialize the BI dashboard
   */
  init() {
    this.loadHistoricalData();
    this.setupEventListeners();
    this.initialized = true;
    
    console.log('BusinessIntelligenceDashboard initialized');
  }

  /**
   * Load historical data from storage
   */
  loadHistoricalData() {
    try {
      const stored = localStorage.getItem('vat_bi_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.dataStore = { ...this.dataStore, ...data };
        this.cleanOldData();
      }
    } catch (error) {
      console.warn('Failed to load historical BI data:', error);
    }
  }

  /**
   * Clean data older than retention period
   */
  cleanOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);
    const cutoffTime = cutoffDate.getTime();

    this.dataStore.calculations = this.dataStore.calculations.filter(
      calc => calc.timestamp > cutoffTime
    );

    this.dataStore.sessions = this.dataStore.sessions.filter(
      session => session.timestamp > cutoffTime
    );
  }

  /**
   * Setup event listeners for data collection
   */
  setupEventListeners() {
    // Listen for calculation events
    document.addEventListener('vatCalculationComplete', (event) => {
      this.recordCalculation(event.detail);
    });

    // Listen for session events
    document.addEventListener('vatSessionStart', (event) => {
      this.recordSessionStart(event.detail);
    });

    document.addEventListener('vatSessionEnd', (event) => {
      this.recordSessionEnd(event.detail);
    });

    // Listen for export events
    document.addEventListener('vatExportComplete', (event) => {
      this.recordExport(event.detail);
    });
  }

  /**
   * Record VAT calculation for analysis
   */
  recordCalculation(calculationData) {
    const record = {
      id: this.generateId(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      
      // Financial data
      vatPayable: calculationData.vatPayable || 0,
      totalInputVAT: calculationData.totalInputVAT || 0,
      totalOutputVAT: calculationData.totalOutputVAT || 0,
      netAmount: calculationData.netAmount || 0,
      
      // Transaction data
      transactionCount: calculationData.transactionCount || 0,
      taxCodes: calculationData.taxCodes || [],
      
      // Performance data
      processingTime: calculationData.processingTime || 0,
      fileSize: calculationData.fileSize || 0,
      
      // Context data
      sessionId: calculationData.sessionId,
      userAgent: navigator.userAgent.substring(0, 100),
      
      // Privacy-safe categorizations
      vatRange: this.categorizeVATAmount(calculationData.vatPayable || 0),
      businessSize: this.estimateBusinessSize(calculationData.transactionCount || 0),
      complexity: this.assessComplexity(calculationData)
    };

    this.dataStore.calculations.push(record);
    this.updateTrends();
    this.generateInsights();
    this.saveData();
    
    // Update dashboard if visible
    if (this.dashboardContainer) {
      this.updateDashboard();
    }
  }

  /**
   * Record session data
   */
  recordSessionStart(sessionData) {
    const session = {
      id: sessionData.sessionId,
      startTime: Date.now(),
      date: new Date().toISOString().split('T')[0],
      userAgent: navigator.userAgent.substring(0, 100),
      referrer: document.referrer,
      calculations: 0,
      exports: 0
    };

    this.dataStore.sessions.push(session);
  }

  recordSessionEnd(sessionData) {
    const session = this.dataStore.sessions.find(s => s.id === sessionData.sessionId);
    if (session) {
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      session.calculations = sessionData.calculations || 0;
      session.exports = sessionData.exports || 0;
    }
  }

  /**
   * Record export activity
   */
  recordExport(exportData) {
    const session = this.dataStore.sessions.find(s => s.id === exportData.sessionId);
    if (session) {
      session.exports = (session.exports || 0) + 1;
    }
  }

  /**
   * Update trend data
   */
  updateTrends() {
    const calculations = this.dataStore.calculations;
    if (calculations.length === 0) return;

    // Daily trends
    this.dataStore.trends.daily = this.calculateDailyTrends(calculations);
    
    // Weekly trends
    this.dataStore.trends.weekly = this.calculateWeeklyTrends(calculations);
    
    // Monthly trends
    this.dataStore.trends.monthly = this.calculateMonthlyTrends(calculations);
    
    // VAT trends
    this.dataStore.trends.vatTrends = this.calculateVATTrends(calculations);
    
    // Performance trends
    this.dataStore.trends.performance = this.calculatePerformanceTrends(calculations);
  }

  /**
   * Calculate daily trends
   */
  calculateDailyTrends(calculations) {
    const dailyData = {};
    
    calculations.forEach(calc => {
      const date = calc.date;
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          count: 0,
          totalVAT: 0,
          avgProcessingTime: 0,
          totalTransactions: 0
        };
      }
      
      dailyData[date].count++;
      dailyData[date].totalVAT += calc.vatPayable;
      dailyData[date].avgProcessingTime += calc.processingTime;
      dailyData[date].totalTransactions += calc.transactionCount;
    });

    // Calculate averages
    Object.values(dailyData).forEach(day => {
      day.avgVAT = day.totalVAT / day.count;
      day.avgProcessingTime = day.avgProcessingTime / day.count;
      day.avgTransactionsPerCalc = day.totalTransactions / day.count;
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate weekly trends
   */
  calculateWeeklyTrends(calculations) {
    const weeklyData = {};
    
    calculations.forEach(calc => {
      const date = new Date(calc.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          count: 0,
          totalVAT: 0,
          uniqueSessions: new Set(),
          businessTypes: new Set()
        };
      }
      
      weeklyData[weekKey].count++;
      weeklyData[weekKey].totalVAT += calc.vatPayable;
      weeklyData[weekKey].uniqueSessions.add(calc.sessionId);
      weeklyData[weekKey].businessTypes.add(calc.businessSize);
    });

    // Convert sets to counts
    Object.values(weeklyData).forEach(week => {
      week.uniqueSessions = week.uniqueSessions.size;
      week.businessTypes = week.businessTypes.size;
      week.avgVAT = week.totalVAT / week.count;
    });

    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * Calculate monthly trends
   */
  calculateMonthlyTrends(calculations) {
    const monthlyData = {};
    
    calculations.forEach(calc => {
      const date = new Date(calc.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          count: 0,
          totalVAT: 0,
          totalInputVAT: 0,
          totalOutputVAT: 0,
          uniqueUsers: new Set(),
          vatRanges: {}
        };
      }
      
      const month = monthlyData[monthKey];
      month.count++;
      month.totalVAT += calc.vatPayable;
      month.totalInputVAT += calc.totalInputVAT;
      month.totalOutputVAT += calc.totalOutputVAT;
      month.uniqueUsers.add(calc.sessionId);
      
      // Count VAT ranges
      if (!month.vatRanges[calc.vatRange]) {
        month.vatRanges[calc.vatRange] = 0;
      }
      month.vatRanges[calc.vatRange]++;
    });

    // Calculate averages and convert sets
    Object.values(monthlyData).forEach(month => {
      month.uniqueUsers = month.uniqueUsers.size;
      month.avgVAT = month.totalVAT / month.count;
      month.avgInputVAT = month.totalInputVAT / month.count;
      month.avgOutputVAT = month.totalOutputVAT / month.count;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate VAT-specific trends
   */
  calculateVATTrends(calculations) {
    const trends = {
      vatDistribution: {},
      inputVsOutput: [],
      taxCodeUsage: {},
      compliancePatterns: {}
    };

    calculations.forEach(calc => {
      // VAT amount distribution
      if (!trends.vatDistribution[calc.vatRange]) {
        trends.vatDistribution[calc.vatRange] = 0;
      }
      trends.vatDistribution[calc.vatRange]++;

      // Input vs Output VAT
      trends.inputVsOutput.push({
        date: calc.date,
        inputVAT: calc.totalInputVAT,
        outputVAT: calc.totalOutputVAT,
        netVAT: calc.vatPayable
      });

      // Tax code usage
      calc.taxCodes.forEach(code => {
        if (!trends.taxCodeUsage[code]) {
          trends.taxCodeUsage[code] = 0;
        }
        trends.taxCodeUsage[code]++;
      });
    });

    return trends;
  }

  /**
   * Calculate performance trends
   */
  calculatePerformanceTrends(calculations) {
    const trends = {
      processingTimes: [],
      fileSizeImpact: [],
      efficiencyMetrics: []
    };

    calculations.forEach(calc => {
      trends.processingTimes.push({
        date: calc.date,
        time: calc.processingTime,
        transactionCount: calc.transactionCount,
        fileSize: calc.fileSize
      });

      trends.fileSizeImpact.push({
        fileSize: calc.fileSize,
        processingTime: calc.processingTime,
        efficiency: calc.transactionCount / calc.processingTime
      });
    });

    return trends;
  }

  /**
   * Generate business insights
   */
  generateInsights() {
    const insights = [];
    const calculations = this.dataStore.calculations;
    
    if (calculations.length < 5) {
      insights.push({
        type: 'info',
        title: 'Getting Started',
        message: 'Continue using the VAT calculator to unlock detailed insights and trends.',
        priority: 'low'
      });
      this.dataStore.insights = insights;
      return;
    }

    // Trend analysis
    const trendInsight = this.analyzeTrends();
    if (trendInsight) insights.push(trendInsight);

    // Performance insights
    const performanceInsight = this.analyzePerformance();
    if (performanceInsight) insights.push(performanceInsight);

    // Usage pattern insights
    const usageInsight = this.analyzeUsagePatterns();
    if (usageInsight) insights.push(usageInsight);

    // VAT pattern insights
    const vatInsight = this.analyzeVATPatterns();
    if (vatInsight) insights.push(vatInsight);

    this.dataStore.insights = insights;
  }

  /**
   * Analyze trends for insights
   */
  analyzeTrends() {
    const recent = this.dataStore.calculations.slice(-10);
    const previous = this.dataStore.calculations.slice(-20, -10);
    
    if (recent.length < 5 || previous.length < 5) return null;

    const recentAvgVAT = recent.reduce((sum, calc) => sum + calc.vatPayable, 0) / recent.length;
    const previousAvgVAT = previous.reduce((sum, calc) => sum + calc.vatPayable, 0) / previous.length;
    
    const change = ((recentAvgVAT - previousAvgVAT) / previousAvgVAT) * 100;
    
    if (Math.abs(change) > 20) {
      return {
        type: change > 0 ? 'warning' : 'success',
        title: 'VAT Trend Alert',
        message: `Your average VAT payable has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% recently.`,
        priority: 'medium',
        data: { change, recentAvgVAT, previousAvgVAT }
      };
    }
    
    return null;
  }

  /**
   * Analyze performance for insights
   */
  analyzePerformance() {
    const calculations = this.dataStore.calculations;
    const avgProcessingTime = calculations.reduce((sum, calc) => sum + calc.processingTime, 0) / calculations.length;
    
    if (avgProcessingTime > 5000) { // 5 seconds
      return {
        type: 'warning',
        title: 'Performance Notice',
        message: `Your calculations are taking an average of ${(avgProcessingTime / 1000).toFixed(1)} seconds. Consider using smaller files for faster processing.`,
        priority: 'low',
        data: { avgProcessingTime }
      };
    }
    
    return null;
  }

  /**
   * Analyze usage patterns
   */
  analyzeUsagePatterns() {
    const sessions = this.dataStore.sessions.filter(s => s.endTime);
    if (sessions.length < 3) return null;
    
    const avgSessionDuration = sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length;
    const avgCalculationsPerSession = sessions.reduce((sum, session) => sum + session.calculations, 0) / sessions.length;
    
    if (avgCalculationsPerSession > 3) {
      return {
        type: 'success',
        title: 'Power User Detected',
        message: `You're averaging ${avgCalculationsPerSession.toFixed(1)} calculations per session. Consider bookmarking for quick access!`,
        priority: 'low',
        data: { avgSessionDuration, avgCalculationsPerSession }
      };
    }
    
    return null;
  }

  /**
   * Analyze VAT patterns
   */
  analyzeVATPatterns() {
    const calculations = this.dataStore.calculations;
    const netPositive = calculations.filter(calc => calc.vatPayable > 0).length;
    const netNegative = calculations.filter(calc => calc.vatPayable < 0).length;
    
    if (netNegative > netPositive && calculations.length > 5) {
      return {
        type: 'info',
        title: 'VAT Refund Pattern',
        message: `You frequently have VAT refunds. This suggests higher input VAT than output VAT - common for businesses with significant purchases.`,
        priority: 'medium',
        data: { netPositive, netNegative }
      };
    }
    
    return null;
  }

  /**
   * Create and display dashboard
   */
  createDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Dashboard container not found:', containerId);
      return;
    }

    this.dashboardContainer = container;
    this.renderDashboard();
  }

  /**
   * Render the complete dashboard
   */
  renderDashboard() {
    if (!this.dashboardContainer) return;

    const dashboardHTML = `
      <div class="bi-dashboard">
        <div class="dashboard-header">
          <h2>VAT Business Intelligence Dashboard</h2>
          <div class="dashboard-controls">
            <button onclick="window.biDashboard.exportData()" class="btn-export">Export Data</button>
            <button onclick="window.biDashboard.generateReport()" class="btn-report">Generate Report</button>
          </div>
        </div>
        
        <div class="dashboard-grid">
          ${this.renderKPICards()}
          ${this.renderInsightsPanel()}
          ${this.renderTrendsChart()}
          ${this.renderVATBreakdown()}
          ${this.renderPerformanceMetrics()}
          ${this.renderUsageStats()}
        </div>
      </div>
    `;

    this.dashboardContainer.innerHTML = dashboardHTML;
    this.attachDashboardStyles();
    this.initializeCharts();
  }

  /**
   * Render KPI cards
   */
  renderKPICards() {
    const calculations = this.dataStore.calculations;
    if (calculations.length === 0) {
      return '<div class="kpi-section"><p>No data available yet.</p></div>';
    }

    const totalCalculations = calculations.length;
    const totalVAT = calculations.reduce((sum, calc) => sum + calc.vatPayable, 0);
    const avgVAT = totalVAT / totalCalculations;
    const thisMonth = this.getThisMonthData();

    return `
      <div class="kpi-section">
        <div class="kpi-card">
          <h3>Total Calculations</h3>
          <div class="kpi-value">${totalCalculations.toLocaleString()}</div>
          <div class="kpi-change">+${thisMonth.calculations} this month</div>
        </div>
        
        <div class="kpi-card">
          <h3>Average VAT Payable</h3>
          <div class="kpi-value">${this.formatCurrency(avgVAT)}</div>
          <div class="kpi-change">${this.formatCurrency(thisMonth.avgVAT)} this month</div>
        </div>
        
        <div class="kpi-card">
          <h3>Total VAT Processed</h3>
          <div class="kpi-value">${this.formatCurrency(totalVAT)}</div>
          <div class="kpi-change">${this.formatCurrency(thisMonth.totalVAT)} this month</div>
        </div>
        
        <div class="kpi-card">
          <h3>Processing Efficiency</h3>
          <div class="kpi-value">${this.calculateEfficiency().toFixed(1)}%</div>
          <div class="kpi-change">Performance score</div>
        </div>
      </div>
    `;
  }

  /**
   * Render insights panel
   */
  renderInsightsPanel() {
    const insights = this.dataStore.insights;
    
    if (insights.length === 0) {
      return `
        <div class="insights-panel">
          <h3>Business Insights</h3>
          <p>No insights available yet. Continue using the calculator to see personalized recommendations.</p>
        </div>
      `;
    }

    const insightsHTML = insights.map(insight => `
      <div class="insight-item ${insight.type}">
        <div class="insight-header">
          <span class="insight-icon">${this.getInsightIcon(insight.type)}</span>
          <h4>${insight.title}</h4>
        </div>
        <p>${insight.message}</p>
      </div>
    `).join('');

    return `
      <div class="insights-panel">
        <h3>Business Insights</h3>
        <div class="insights-list">
          ${insightsHTML}
        </div>
      </div>
    `;
  }

  /**
   * Render trends chart placeholder
   */
  renderTrendsChart() {
    return `
      <div class="trends-chart">
        <h3>VAT Trends</h3>
        <div id="vatTrendsChart" class="chart-container">
          ${this.renderSimpleChart()}
        </div>
      </div>
    `;
  }

  /**
   * Render simple chart (since we're not using external chart libraries)
   */
  renderSimpleChart() {
    const daily = this.dataStore.trends.daily || [];
    if (daily.length === 0) return '<p>No trend data available.</p>';

    const maxVAT = Math.max(...daily.map(d => d.avgVAT));
    const minVAT = Math.min(...daily.map(d => d.avgVAT));
    const range = maxVAT - minVAT;

    const chartHTML = daily.slice(-30).map((day, index) => {
      const height = range > 0 ? ((day.avgVAT - minVAT) / range) * 100 : 50;
      return `
        <div class="chart-bar" style="height: ${height}%" title="${day.date}: ${this.formatCurrency(day.avgVAT)}">
          <span class="bar-label">${day.date.split('-')[2]}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="simple-chart">
        <div class="chart-bars">${chartHTML}</div>
        <div class="chart-legend">
          <span>Daily Average VAT (Last 30 days)</span>
        </div>
      </div>
    `;
  }

  /**
   * Render VAT breakdown
   */
  renderVATBreakdown() {
    const vatTrends = this.dataStore.trends.vatTrends || {};
    const distribution = vatTrends.vatDistribution || {};

    const distributionHTML = Object.entries(distribution).map(([range, count]) => `
      <div class="breakdown-item">
        <span class="range-label">${range}</span>
        <div class="range-bar">
          <div class="range-fill" style="width: ${(count / Math.max(...Object.values(distribution))) * 100}%"></div>
        </div>
        <span class="range-count">${count}</span>
      </div>
    `).join('');

    return `
      <div class="vat-breakdown">
        <h3>VAT Amount Distribution</h3>
        <div class="breakdown-list">
          ${distributionHTML || '<p>No distribution data available.</p>'}
        </div>
      </div>
    `;
  }

  /**
   * Render performance metrics
   */
  renderPerformanceMetrics() {
    const calculations = this.dataStore.calculations;
    if (calculations.length === 0) {
      return '<div class="performance-metrics"><h3>Performance Metrics</h3><p>No data available.</p></div>';
    }

    const avgProcessingTime = calculations.reduce((sum, calc) => sum + calc.processingTime, 0) / calculations.length;
    const fastestCalculation = Math.min(...calculations.map(calc => calc.processingTime));
    const slowestCalculation = Math.max(...calculations.map(calc => calc.processingTime));

    return `
      <div class="performance-metrics">
        <h3>Performance Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-label">Average Processing Time</span>
            <span class="metric-value">${(avgProcessingTime / 1000).toFixed(2)}s</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Fastest Calculation</span>
            <span class="metric-value">${(fastestCalculation / 1000).toFixed(2)}s</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Slowest Calculation</span>
            <span class="metric-value">${(slowestCalculation / 1000).toFixed(2)}s</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render usage statistics
   */
  renderUsageStats() {
    const sessions = this.dataStore.sessions;
    const totalSessions = sessions.length;
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / (sessions.filter(s => s.duration).length || 1);

    return `
      <div class="usage-stats">
        <h3>Usage Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Sessions</span>
            <span class="stat-value">${totalSessions}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Session Duration</span>
            <span class="stat-value">${(avgSessionDuration / 1000 / 60).toFixed(1)}m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Calculations per Session</span>
            <span class="stat-value">${(this.dataStore.calculations.length / (totalSessions || 1)).toFixed(1)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach dashboard styles
   */
  attachDashboardStyles() {
    if (document.getElementById('bi-dashboard-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'bi-dashboard-styles';
    styles.textContent = `
      .bi-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background: #f8fafc;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .dashboard-header h2 {
        margin: 0;
        color: #2d3748;
        font-size: 1.8rem;
      }

      .dashboard-controls {
        display: flex;
        gap: 10px;
      }

      .btn-export, .btn-report {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .btn-export {
        background: #667eea;
        color: white;
      }

      .btn-report {
        background: #764ba2;
        color: white;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .kpi-section {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }

      .kpi-card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
      }

      .kpi-card h3 {
        margin: 0 0 10px 0;
        color: #4a5568;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .kpi-value {
        font-size: 2rem;
        font-weight: bold;
        color: #2d3748;
        margin: 10px 0;
      }

      .kpi-change {
        color: #667eea;
        font-size: 0.9rem;
      }

      .insights-panel, .trends-chart, .vat-breakdown, 
      .performance-metrics, .usage-stats {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .insights-panel h3, .trends-chart h3, .vat-breakdown h3,
      .performance-metrics h3, .usage-stats h3 {
        margin: 0 0 20px 0;
        color: #2d3748;
      }

      .insight-item {
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid;
      }

      .insight-item.success {
        background: #f0fff4;
        border-color: #38a169;
      }

      .insight-item.warning {
        background: #fffaf0;
        border-color: #ed8936;
      }

      .insight-item.info {
        background: #ebf8ff;
        border-color: #4299e1;
      }

      .insight-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }

      .insight-header h4 {
        margin: 0;
        color: #2d3748;
      }

      .simple-chart {
        height: 200px;
      }

      .chart-bars {
        display: flex;
        align-items: end;
        height: 180px;
        gap: 2px;
        padding: 0 10px;
      }

      .chart-bar {
        flex: 1;
        background: linear-gradient(to top, #667eea, #764ba2);
        border-radius: 2px 2px 0 0;
        position: relative;
        min-height: 10px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .chart-bar:hover {
        opacity: 1;
      }

      .breakdown-item, .metric-item, .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #e2e8f0;
      }

      .range-bar {
        flex: 1;
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        margin: 0 15px;
        overflow: hidden;
      }

      .range-fill {
        height: 100%;
        background: linear-gradient(to right, #667eea, #764ba2);
        transition: width 0.3s ease;
      }

      .metrics-grid, .stats-grid {
        display: grid;
        gap: 10px;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          gap: 15px;
        }

        .dashboard-grid {
          grid-template-columns: 1fr;
        }

        .kpi-section {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Helper methods
   */

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  categorizeVATAmount(amount) {
    if (amount < 1000) return 'Small (< R1K)';
    if (amount < 10000) return 'Medium (R1K-R10K)';
    if (amount < 100000) return 'Large (R10K-R100K)';
    return 'Very Large (> R100K)';
  }

  estimateBusinessSize(transactionCount) {
    if (transactionCount < 50) return 'Small';
    if (transactionCount < 500) return 'Medium';
    if (transactionCount < 2000) return 'Large';
    return 'Enterprise';
  }

  assessComplexity(calculationData) {
    const factors = [
      calculationData.taxCodes?.length > 3,
      calculationData.transactionCount > 1000,
      calculationData.fileSize > 1000000
    ].filter(Boolean).length;

    if (factors >= 2) return 'High';
    if (factors === 1) return 'Medium';
    return 'Low';
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getThisMonthData() {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthData = this.dataStore.calculations.filter(calc => calc.date.startsWith(thisMonth));
    
    return {
      calculations: monthData.length,
      totalVAT: monthData.reduce((sum, calc) => sum + calc.vatPayable, 0),
      avgVAT: monthData.length > 0 ? monthData.reduce((sum, calc) => sum + calc.vatPayable, 0) / monthData.length : 0
    };
  }

  calculateEfficiency() {
    const calculations = this.dataStore.calculations;
    if (calculations.length === 0) return 100;

    const avgTime = calculations.reduce((sum, calc) => sum + calc.processingTime, 0) / calculations.length;
    const avgTransactions = calculations.reduce((sum, calc) => sum + calc.transactionCount, 0) / calculations.length;
    
    // Efficiency based on processing speed (higher transactions per second = better)
    const transactionsPerSecond = avgTransactions / (avgTime / 1000);
    return Math.min(100, transactionsPerSecond * 10); // Scale to 0-100
  }

  getInsightIcon(type) {
    const icons = {
      success: '✅',
      warning: '⚠️',
      info: 'ℹ️',
      error: '❌'
    };
    return icons[type] || 'ℹ️';
  }

  saveData() {
    try {
      localStorage.setItem('vat_bi_data', JSON.stringify(this.dataStore));
    } catch (error) {
      console.warn('Failed to save BI data:', error);
    }
  }

  initializeCharts() {
    // Placeholder for chart initialization
    // In a real implementation, you might initialize Chart.js or D3.js here
  }

  updateDashboard() {
    if (this.dashboardContainer) {
      this.renderDashboard();
    }
  }

  /**
   * Export functionality
   */
  exportData() {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCalculations: this.dataStore.calculations.length,
        totalSessions: this.dataStore.sessions.length,
        dateRange: {
          start: this.dataStore.calculations[0]?.date || null,
          end: this.dataStore.calculations[this.dataStore.calculations.length - 1]?.date || null
        }
      },
      calculations: this.dataStore.calculations,
      trends: this.dataStore.trends,
      insights: this.dataStore.insights
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vat-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateReport() {
    // This would generate a comprehensive PDF report
    // For now, we'll create a simple HTML report
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(this.generateHTMLReport());
    reportWindow.document.close();
  }

  generateHTMLReport() {
    const summary = this.getAnalyticsSummary();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VAT Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .section { margin: 30px 0; }
          .kpi { display: inline-block; margin: 10px 20px; text-align: center; }
          .kpi-value { font-size: 2em; color: #667eea; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VAT Calculator Analytics Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Key Performance Indicators</h2>
          <div class="kpi">
            <div class="kpi-value">${summary.totalCalculations}</div>
            <div>Total Calculations</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${this.formatCurrency(summary.totalVAT)}</div>
            <div>Total VAT Processed</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${this.formatCurrency(summary.avgVAT)}</div>
            <div>Average VAT</div>
          </div>
        </div>
        
        <div class="section">
          <h2>Business Insights</h2>
          ${this.dataStore.insights.map(insight => `
            <div style="margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 5px;">
              <strong>${insight.title}</strong><br>
              ${insight.message}
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  }

  getAnalyticsSummary() {
    const calculations = this.dataStore.calculations;
    
    return {
      totalCalculations: calculations.length,
      totalVAT: calculations.reduce((sum, calc) => sum + calc.vatPayable, 0),
      avgVAT: calculations.length > 0 ? calculations.reduce((sum, calc) => sum + calc.vatPayable, 0) / calculations.length : 0,
      totalSessions: this.dataStore.sessions.length
    };
  }

  /**
   * Public API
   */
  getDashboardData() {
    return { ...this.dataStore };
  }

  clearAllData() {
    this.dataStore = {
      calculations: [],
      sessions: [],
      trends: {},
      benchmarks: {},
      insights: []
    };
    localStorage.removeItem('vat_bi_data');
    this.updateDashboard();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BusinessIntelligenceDashboard;
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.biDashboard = new BusinessIntelligenceDashboard();
}
