import { test, expect } from '@playwright/test';

/**
 * Dynamic Title Templating Tests
 * Tests {DAY} and {YYYY-MM-DD} template variable replacement
 */

test.describe('Dynamic Title Templating', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Stream Profiles")', { timeout: 10000 });
  });

  test('should replace {DAY} with current day of week', async ({ page }) => {
    // Get current day
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Create profile with {DAY} template
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Day Template Test');
    await page.fill('input[name="title"]', 'Streaming on {DAY}');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Check that the profile card shows the processed title
    const profileCard = page.locator('article.scandi-card', { hasText: 'Day Template Test' });
    await expect(profileCard.locator(`text=Streaming on ${currentDay}`)).toBeVisible();
  });

  test('should replace {YYYY-MM-DD} with current date', async ({ page }) => {
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // Create profile with {YYYY-MM-DD} template
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Date Template Test');
    await page.fill('input[name="title"]', 'Stream {YYYY-MM-DD}');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Check that the profile card shows the processed title
    const profileCard = page.locator('article.scandi-card', { hasText: 'Date Template Test' });
    await expect(profileCard.locator(`text=Stream ${currentDate}`)).toBeVisible();
  });

  test('should handle multiple template variables in one title', async ({ page }) => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const currentDate = new Date().toISOString().split('T')[0];

    // Create profile with both templates
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Multiple Templates Test');
    await page.fill('input[name="title"]', '{DAY} Stream - {YYYY-MM-DD}');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Check that both are replaced
    const profileCard = page.locator('article.scandi-card', { hasText: 'Multiple Templates Test' });
    await expect(profileCard.locator(`text=${currentDay} Stream - ${currentDate}`)).toBeVisible();
  });

  test('should not replace invalid template syntax', async ({ page }) => {
    // Create profile with invalid template
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Invalid Template Test');
    await page.fill('input[name="title"]', 'Stream {INVALID} {day}');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Invalid templates should remain unchanged
    const profileCard = page.locator('article.scandi-card', { hasText: 'Invalid Template Test' });
    await expect(profileCard.locator('text=Stream {INVALID} {day}')).toBeVisible();
  });

  test('should show original template on hover/tooltip', async ({ page }) => {
    // Create profile with template
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Tooltip Test');
    await page.fill('input[name="title"]', 'Daily {DAY} Stream');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Check if title element has a tooltip showing original template
    const profileCard = page.locator('article.scandi-card', { hasText: 'Tooltip Test' });
    const titleElement = profileCard.locator('[title*="Daily {DAY} Stream"]');

    // The title attribute should contain the original template
    const hasTooltip = await titleElement.count() > 0;
    expect(hasTooltip).toBeTruthy();
  });

  test('should process templates when profile is edited', async ({ page }) => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Create profile without template
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Edit Template Test');
    await page.fill('input[name="title"]', 'Regular Title');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Edit to add template
    const profileCard = page.locator('article.scandi-card', { hasText: 'Edit Template Test' });
    await profileCard.hover();
    await profileCard.locator('a[title*="Edit" i]').click();

    await page.fill('input[name="title"]', '{DAY} Updated Title');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Should show processed template
    await expect(page.locator(`text=${currentDay} Updated Title`)).toBeVisible();
  });
});
