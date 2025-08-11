import { test, expect } from '@playwright/test';

test.describe('VAT Calculator Pro - Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cache and start fresh
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'load' });
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const metrics = {};
            
            for (const entry of entries) {
              if (entry.entryType === 'largest-contentful-paint') {
                metrics.lcp = entry.startTime;
              }
              if (entry.entryType === 'first-input') {
                metrics.fid = entry.processingStart - entry.startTime;
              }
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                metrics.cls = (metrics.cls || 0) + entry.value;
              }
            }
            
            resolve(metrics);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
          
          // Fallback timeout
          setTimeout(() => resolve({}), 5000);
        } else {
          resolve({});
        }
      });
    });
    
    // LCP should be under 2.5 seconds
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
    
    // FID should be under 100ms
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100);
    }
    
    // CLS should be under 0.1
    if (metrics.cls) {
      expect(metrics.cls).toBeLessThan(0.1);
    }
  });

  test('file processing performance', async ({ page }) => {
    await page.click('text=See Demo');
    
    const startTime = Date.now();
    await page.click('text=Load Sample Data');
    
    // Wait for processing to complete
    await page.waitForSelector('.results-summary', { state: 'visible', timeout: 10000 });
    
    const processingTime = Date.now() - startTime;
    
    // Demo data should process within 5 seconds
    expect(processingTime).toBeLessThan(5000);
  });

  test('memory usage performance', async ({ page }) => {
    // Measure initial memory
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null;
    });
    
    if (initialMemory) {
      // Perform memory-intensive operations
      await page.click('text=See Demo');
      await page.click('text=Load Sample Data');
      await page.waitForSelector('.results-summary', { state: 'visible' });
      
      // Generate PDF to stress test
      await page.click('text=Export PDF');
      await page.waitForTimeout(2000);
      
      // Measure memory after operations
      const finalMemory = await page.evaluate(() => {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      });
      
      // Memory growth should be reasonable (less than 50MB)
      const memoryGrowth = finalMemory.used - initialMemory.used;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB
      
      // Should not exceed 80% of heap limit
      const memoryUsagePercentage = (finalMemory.used / finalMemory.limit) * 100;
      expect(memoryUsagePercentage).toBeLessThan(80);
    }
  });

  test('network requests performance', async ({ page }) => {
    const requests = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        startTime: Date.now()
      });
    });
    
    const responses = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        endTime: Date.now()
      });
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Check request performance
    const staticAssets = responses.filter(r => 
      r.url.includes('.css') || 
      r.url.includes('.js') || 
      r.url.includes('.png') || 
      r.url.includes('.jpg')
    );
    
    // All static assets should load successfully
    for (const asset of staticAssets) {
      expect(asset.status).toBe(200);
    }
    
    // Total number of requests should be reasonable
    expect(requests.length).toBeLessThan(20);
  });

  test('bundle size performance', async ({ page }) => {
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.map(resource => ({
        name: resource.name,
        size: resource.transferSize || 0,
        type: resource.initiatorType
      }));
    });
    
    // Check JavaScript bundle sizes
    const jsResources = resourceSizes.filter(r => r.name.includes('.js'));
    const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    
    // Total JS should be under 500KB
    expect(totalJSSize).toBeLessThan(500 * 1024);
    
    // Check CSS bundle sizes
    const cssResources = resourceSizes.filter(r => r.name.includes('.css'));
    const totalCSSSize = cssResources.reduce((sum, r) => sum + r.size, 0);
    
    // Total CSS should be under 100KB
    expect(totalCSSSize).toBeLessThan(100 * 1024);
  });

  test('large file processing performance', async ({ page }) => {
    // Simulate large file processing
    await page.click('text=Start Calculating');
    
    // Create a simulated large dataset
    const largeDataProcessingTime = await page.evaluate(async () => {
      const startTime = performance.now();
      
      // Simulate processing 10,000 transactions
      const transactions = [];
      for (let i = 0; i < 10000; i++) {
        transactions.push({
          TaxCode: i % 2 === 0 ? 1 : 3,
          TaxRate: i % 2 === 0 ? 15 : 0,
          TaxAmount: Math.random() * 1000,
          ExclAmount: Math.random() * 5000,
          InclAmount: Math.random() * 6000,
          TrCode: i % 3 === 0 ? 'IS' : (i % 3 === 1 ? 'CASH' : 'INV')
        });
      }
      
      // Simulate VAT calculation
      let totalInputVAT = 0;
      let totalOutputVAT = 0;
      
      for (const transaction of transactions) {
        if (['CASH', 'JC', 'JNL', 'SINV', 'JD', 'RC'].includes(transaction.TrCode)) {
          totalInputVAT += transaction.TaxAmount;
        } else if (['IS', 'INV', 'RTS'].includes(transaction.TrCode)) {
          totalOutputVAT += transaction.TaxAmount;
        }
      }
      
      const endTime = performance.now();
      return endTime - startTime;
    });
    
    // Large dataset processing should complete within 5 seconds
    expect(largeDataProcessingTime).toBeLessThan(5000);
  });

  test('UI responsiveness during processing', async ({ page }) => {
    await page.click('text=See Demo');
    
    // Start processing
    await page.click('text=Load Sample Data');
    
    // Check if UI remains responsive during processing
    const startTime = Date.now();
    
    // Try to interact with UI elements during processing
    const navLink = page.locator('.nav-link').first();
    await navLink.hover();
    
    const hoverTime = Date.now() - startTime;
    
    // Hover interaction should be responsive (under 100ms)
    expect(hoverTime).toBeLessThan(100);
    
    // Wait for processing to complete
    await page.waitForSelector('.results-summary', { state: 'visible' });
  });

  test('scroll performance', async ({ page }) => {
    // Measure scroll performance on pages with lots of content
    await page.click('text=See Demo');
    await page.click('text=Load Sample Data');
    await page.waitForSelector('.results-summary', { state: 'visible' });
    
    const scrollPerformance = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        const measureFrames = () => {
          frameCount++;
          if (frameCount < 60) { // Measure for 60 frames
            requestAnimationFrame(measureFrames);
          } else {
            const endTime = performance.now();
            const avgFrameTime = (endTime - startTime) / frameCount;
            resolve(avgFrameTime);
          }
        };
        
        // Start scrolling
        window.scrollTo(0, 1000);
        requestAnimationFrame(measureFrames);
      });
    });
    
    // Average frame time should be under 16.67ms for 60fps
    expect(scrollPerformance).toBeLessThan(16.67);
  });
});
