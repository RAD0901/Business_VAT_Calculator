#!/usr/bin/env node

/**
 * Generate analytics configuration for deployment
 */

const fs = require('fs');
const path = require('path');

function generateAnalyticsConfig() {
  console.log('📊 Generating analytics configuration...');
  
  const environment = process.env.NODE_ENV || 'production';
  const isProduction = environment === 'production';
  
  const config = {
    environment,
    googleAnalytics: {
      enabled: isProduction,
      trackingId: process.env.GA_TRACKING_ID || 'G-XXXXXXXXXX',
      anonymizeIp: true,
      respectDnt: true,
      cookieExpires: 63072000, // 2 years
      sampleRate: isProduction ? 100 : 10
    },
    errorTracking: {
      enabled: true,
      sentryDsn: process.env.SENTRY_DSN || null,
      environment,
      sampleRate: isProduction ? 0.1 : 1.0,
      beforeSend: true // Filter sensitive data
    },
    performanceMonitoring: {
      enabled: true,
      sampleRate: isProduction ? 0.1 : 1.0,
      trackWebVitals: true,
      trackUserTiming: true,
      trackNetworkRequests: false // Privacy consideration
    },
    businessIntelligence: {
      enabled: true,
      dataRetentionDays: 365,
      enableLocalStorage: true,
      enableUserConsent: true,
      privacyMode: true
    },
    features: {
      heatmaps: false, // Disabled for privacy
      sessionRecording: false, // Disabled for privacy
      userFeedback: true,
      performanceAlerts: isProduction,
      realTimeAnalytics: true
    },
    privacy: {
      respectDnt: true,
      anonymizeData: true,
      enableUserConsent: true,
      cookiePolicy: 'essential-only',
      dataMinimization: true
    }
  };
  
  // Write config file
  const configPath = path.join(process.cwd(), 'analytics-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  
  console.log(`✅ Analytics config generated: ${configPath}`);
  
  // Generate analytics manifest
  generateAnalyticsManifest(config);
}

function generateAnalyticsManifest(config) {
  console.log('📋 Generating analytics manifest...');
  
  const manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    environment: config.environment,
    components: [
      {
        name: 'Google Analytics 4',
        enabled: config.googleAnalytics.enabled,
        purpose: 'Web analytics and user behavior tracking',
        dataTypes: ['pageviews', 'events', 'sessions'],
        retention: '26 months',
        privacyCompliant: true
      },
      {
        name: 'Error Tracking',
        enabled: config.errorTracking.enabled,
        purpose: 'Application error monitoring and debugging',
        dataTypes: ['errors', 'performance', 'stack_traces'],
        retention: '90 days',
        privacyCompliant: true
      },
      {
        name: 'Performance Monitoring',
        enabled: config.performanceMonitoring.enabled,
        purpose: 'Core Web Vitals and performance optimization',
        dataTypes: ['performance_metrics', 'timing_data'],
        retention: '30 days',
        privacyCompliant: true
      },
      {
        name: 'Business Intelligence',
        enabled: config.businessIntelligence.enabled,
        purpose: 'Business metrics and feature usage analytics',
        dataTypes: ['feature_usage', 'conversion_events', 'business_metrics'],
        retention: '365 days',
        privacyCompliant: true
      }
    ],
    privacyMeasures: [
      'IP address anonymization',
      'Do Not Track respect',
      'User consent management',
      'Data minimization',
      'Local processing where possible',
      'No cross-site tracking',
      'Essential cookies only'
    ],
    complianceStandards: [
      'GDPR (General Data Protection Regulation)',
      'POPIA (Protection of Personal Information Act)',
      'CCPA (California Consumer Privacy Act)',
      'ePrivacy Directive'
    ]
  };
  
  const manifestPath = path.join(process.cwd(), 'analytics-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  
  console.log(`✅ Analytics manifest generated: ${manifestPath}`);
}

function updateHtmlWithAnalytics() {
  console.log('🔄 Updating HTML with analytics configuration...');
  
  const indexPath = path.join(process.cwd(), 'index.html');
  
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Replace placeholders
    const environment = process.env.NODE_ENV || 'production';
    const gaTrackingId = process.env.GA_TRACKING_ID || 'G-XXXXXXXXXX';
    
    html = html.replace(/GA_TRACKING_ID_PLACEHOLDER/g, gaTrackingId);
    html = html.replace(/ENVIRONMENT_PLACEHOLDER/g, environment);
    html = html.replace(/BUILD_TIMESTAMP_PLACEHOLDER/g, new Date().toISOString());
    
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✅ HTML updated with analytics configuration');
  }
}

if (require.main === module) {
  try {
    generateAnalyticsConfig();
    updateHtmlWithAnalytics();
    console.log('🎉 Analytics configuration generated successfully!');
  } catch (error) {
    console.error('❌ Error generating analytics configuration:', error);
    process.exit(1);
  }
}

module.exports = { generateAnalyticsConfig, generateAnalyticsManifest, updateHtmlWithAnalytics };
