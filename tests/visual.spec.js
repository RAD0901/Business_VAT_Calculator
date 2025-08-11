import { test, expect } from '@playwright/test';

test.describe('VAT Calculator Pro - Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test('homepage visual regression', async ({ page }) => {
    // Wait for all content to load
    await page.waitForSelector('.hero', { state: 'visible' });
    await page.waitForTimeout(1000); // Additional wait for stability
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('upload page visual regression', async ({ page }) => {
    await page.click('text=Start Calculating');
    await page.waitForSelector('.upload-area', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('upload-page-desktop.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('demo page visual regression', async ({ page }) => {
    await page.click('text=See Demo');
    await page.waitForSelector('#demo-page', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('demo-page-desktop.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('results page visual regression', async ({ page }) => {
    await page.click('text=See Demo');
    await page.click('text=Load Sample Data');
    await page.waitForSelector('.results-summary', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for all results to render
    
    await expect(page).toHaveScreenshot('results-page-desktop.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('mobile homepage visual regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForSelector('.hero', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('mobile navigation visual regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.click('.mobile-menu-toggle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('mobile-navigation.png', {
      threshold: 0.2,
    });
  });

  test('error state visual regression', async ({ page }) => {
    await page.click('text=Start Calculating');
    
    // Trigger error state
    await page.evaluate(() => {
      const input = document.querySelector('#file-input');
      const file = new File(['invalid'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await page.waitForSelector('.error-message', { state: 'visible' });
    await page.waitForTimeout(500);
    
    await expect(page.locator('.upload-container')).toHaveScreenshot('error-state.png', {
      threshold: 0.2,
    });
  });

  test('loading state visual regression', async ({ page }) => {
    await page.click('text=See Demo');
    
    // Trigger loading state and capture it quickly
    await page.evaluate(() => {
      const ui = window.uiManager;
      if (ui) {
        ui.showProcessingState();
      }
    });
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('.demo-container')).toHaveScreenshot('loading-state.png', {
      threshold: 0.2,
    });
  });

  test('dark mode visual regression', async ({ page }) => {
    // If dark mode is available, test it
    const darkModeToggle = page.locator('[data-theme-toggle]');
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        threshold: 0.2,
      });
    }
  });

  test('form validation visual regression', async ({ page }) => {
    await page.click('text=Start Calculating');
    
    // Try to submit without file
    await page.click('text=Process File');
    await page.waitForSelector('.validation-error', { state: 'visible' });
    await page.waitForTimeout(500);
    
    await expect(page.locator('.upload-container')).toHaveScreenshot('validation-error.png', {
      threshold: 0.2,
    });
  });
});
