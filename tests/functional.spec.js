import { test, expect } from '@playwright/test';

test.describe('VAT Calculator Pro - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/VAT Calculator Pro/);
    await expect(page.locator('h1')).toContainText('Transform Excel VAT into Professional Reports');
  });

  test('should navigate to upload page', async ({ page }) => {
    await page.click('text=Start Calculating');
    await expect(page.locator('#upload-page')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Upload Your Excel File');
  });

  test('should show demo page', async ({ page }) => {
    await page.click('text=See Demo');
    await expect(page.locator('#demo-page')).toBeVisible();
    await expect(page.locator('h2')).toContainText('See VAT Calculator Pro in Action');
  });

  test('should validate file upload functionality', async ({ page }) => {
    // Navigate to upload page
    await page.click('text=Start Calculating');
    
    // Check if file input is present
    const fileInput = page.locator('#file-input');
    await expect(fileInput).toBeVisible();
    
    // Check upload area
    const uploadArea = page.locator('.upload-area');
    await expect(uploadArea).toBeVisible();
    await expect(uploadArea).toContainText('Drop your Excel file here');
  });

  test('should handle file validation errors', async ({ page }) => {
    await page.click('text=Start Calculating');
    
    // Try to upload invalid file type
    const fileInput = page.locator('#file-input');
    
    // Simulate file upload with invalid type
    await page.evaluate(() => {
      const input = document.querySelector('#file-input');
      const file = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should process sample VAT data', async ({ page }) => {
    await page.click('text=See Demo');
    await page.click('text=Load Sample Data');
    
    // Wait for processing
    await page.waitForSelector('.results-summary', { timeout: 10000 });
    
    // Check if results are displayed
    await expect(page.locator('.results-summary')).toBeVisible();
    await expect(page.locator('.vat-payable')).toBeVisible();
    await expect(page.locator('.total-input-vat')).toBeVisible();
    await expect(page.locator('.total-output-vat')).toBeVisible();
  });

  test('should generate PDF export', async ({ page }) => {
    await page.click('text=See Demo');
    await page.click('text=Load Sample Data');
    
    // Wait for results
    await page.waitForSelector('.results-summary', { timeout: 10000 });
    
    // Try to generate PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export PDF');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/VAT_Report.*\.pdf/);
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check main navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check navigation links
    const navLinks = page.locator('.nav-link');
    await expect(navLinks).toHaveCount(7); // Including analytics link
    
    // Check if links are keyboard accessible
    await navLinks.first().focus();
    await expect(navLinks.first()).toBeFocused();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Check if mobile menu toggle is visible
    const mobileToggle = page.locator('.mobile-menu-toggle');
    await expect(mobileToggle).toBeVisible();
    
    // Check if main content adapts
    const heroSection = page.locator('.hero');
    await expect(heroSection).toBeVisible();
  });

  test('should load analytics dashboard', async ({ page }) => {
    await page.click('text=📊 Analytics');
    
    // Should open in new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('text=📊 Analytics')
    ]);
    
    await newPage.waitForLoadState();
    await expect(newPage).toHaveTitle(/Analytics/);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test error handling by triggering an error
    await page.evaluate(() => {
      window.dispatchEvent(new ErrorEvent('error', {
        message: 'Test error',
        filename: 'test.js',
        lineno: 1,
        colno: 1
      }));
    });
    
    // Should not break the application
    await expect(page.locator('body')).toBeVisible();
  });

  test('should track user interactions', async ({ page }) => {
    // Check if analytics is initialized
    const analyticsLoaded = await page.evaluate(() => {
      return typeof window.analyticsManager !== 'undefined';
    });
    
    expect(analyticsLoaded).toBe(true);
    
    // Trigger trackable event
    await page.click('text=Start Calculating');
    
    // Verify event was tracked (in development mode)
    const eventTracked = await page.evaluate(() => {
      return window.analyticsManager?.sessionData?.eventsTracked > 0;
    });
    
    expect(eventTracked).toBe(true);
  });
});
