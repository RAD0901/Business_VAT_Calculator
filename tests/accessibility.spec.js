import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('VAT Calculator Pro - Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
  });

  test('homepage accessibility check', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('upload page accessibility check', async ({ page }) => {
    await page.click('text=Start Calculating');
    await page.waitForSelector('#upload-page', { state: 'visible' });
    
    await checkA11y(page, '#upload-page', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('demo page accessibility check', async ({ page }) => {
    await page.click('text=See Demo');
    await page.waitForSelector('#demo-page', { state: 'visible' });
    
    await checkA11y(page, '#demo-page', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('results page accessibility check', async ({ page }) => {
    await page.click('text=See Demo');
    await page.click('text=Load Sample Data');
    await page.waitForSelector('.results-summary', { state: 'visible', timeout: 10000 });
    
    await checkA11y(page, '.results-container', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('keyboard navigation test', async ({ page }) => {
    // Test tab navigation through interactive elements
    const interactiveElements = [
      '.nav-link',
      '.btn-primary',
      '.btn-secondary',
      '#file-input',
    ];

    for (const selector of interactiveElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        if (await element.isVisible()) {
          await element.focus();
          await expect(element).toBeFocused();
        }
      }
    }
  });

  test('screen reader compatibility test', async ({ page }) => {
    // Check for proper ARIA labels and roles
    const ariaElements = await page.locator('[aria-label], [aria-labelledby], [role]').all();
    
    for (const element of ariaElements) {
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const role = await element.getAttribute('role');
      
      // Ensure ARIA attributes are meaningful
      if (ariaLabel) {
        expect(ariaLabel.trim()).not.toBe('');
      }
      
      if (role) {
        expect(role.trim()).not.toBe('');
      }
    }
  });

  test('color contrast check', async ({ page }) => {
    // Check color contrast with axe-core
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true },
      },
      detailedReport: true,
    });
  });

  test('focus indicators test', async ({ page }) => {
    // Check that focus indicators are visible
    const focusableElements = page.locator('button, a, input, [tabindex="0"]');
    const count = await focusableElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) { // Test first 10 elements
      const element = focusableElements.nth(i);
      
      if (await element.isVisible()) {
        await element.focus();
        
        // Check if element has focus styles
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el, ':focus');
          return {
            outline: computed.outline,
            outlineWidth: computed.outlineWidth,
            boxShadow: computed.boxShadow,
          };
        });
        
        // Should have some form of focus indicator
        const hasFocusIndicator = 
          styles.outline !== 'none' || 
          styles.outlineWidth !== '0px' || 
          styles.boxShadow !== 'none';
        
        expect(hasFocusIndicator).toBe(true);
      }
    }
  });

  test('form accessibility test', async ({ page }) => {
    await page.click('text=Start Calculating');
    
    // Check form labels and inputs
    const fileInput = page.locator('#file-input');
    const label = page.locator('label[for="file-input"]');
    
    await expect(label).toBeVisible();
    await expect(fileInput).toHaveAttribute('aria-describedby');
  });

  test('error message accessibility test', async ({ page }) => {
    await page.click('text=Start Calculating');
    
    // Trigger error
    await page.evaluate(() => {
      const input = document.querySelector('#file-input');
      const file = new File(['invalid'], 'test.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await page.waitForSelector('.error-message', { state: 'visible' });
    
    // Check if error is accessible
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toHaveAttribute('role', 'alert');
    await expect(errorMessage).toBeVisible();
  });

  test('heading structure test', async ({ page }) => {
    // Check proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.substring(1));
      
      // Heading levels should not skip more than one level
      if (previousLevel > 0) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
      
      previousLevel = currentLevel;
    }
  });

  test('alternative text for images test', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');
      
      // Images should have alt text, aria-label, or be decorative
      const hasAccessibleText = alt !== null || ariaLabel !== null || role === 'presentation';
      expect(hasAccessibleText).toBe(true);
    }
  });
});
