/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */

import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Verify test server is running
    await page.goto('http://localhost:8080', { timeout: 30000 });
    console.log('✅ Test server is responding');
    
    // Pre-warm the application
    await page.waitForLoadState('networkidle');
    console.log('✅ Application pre-warmed');
    
    // Verify critical assets are loading
    const criticalAssets = [
      'http://localhost:8080/assets/css/main.css',
      'http://localhost:8080/assets/js/app.js',
    ];
    
    for (const asset of criticalAssets) {
      const response = await page.goto(asset);
      if (!response.ok()) {
        throw new Error(`Critical asset failed to load: ${asset}`);
      }
    }
    console.log('✅ Critical assets verified');
    
    // Set up test data directory if needed
    console.log('✅ Test environment ready');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
