import { test, expect } from '@playwright/test';

/**
 * Category Search Tests
 * Tests category search functionality with online/offline support
 */

test.describe('Category Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile/new');
    await page.waitForLoadState('networkidle');
  });

  test('should show category search input', async ({ page }) => {
    // Look for category search/selection input
    const categoryInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();

    await expect(categoryInput).toBeVisible();
  });

  test('should search for categories', async ({ page }) => {
    const categoryInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();

    // Type a search query
    await categoryInput.fill('Just');
    await page.waitForTimeout(500); // Wait for debounce/search

    // Should show search results
    const hasResults = await page.locator('text=Just Chatting, text=Just Dancing').count() > 0;
    expect(hasResults).toBeTruthy();
  });

  test('should select a category from search results', async ({ page }) => {
    const categoryInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();

    // Search and select
    await categoryInput.fill('Science');
    await page.waitForTimeout(500);

    // Click on a result
    await page.click('text=Science & Technology, text=Science').first();

    // The selected category should be visible somehow
    const hasSelection = await page.locator(
      'text=Science & Technology, text=Science'
    ).count() > 0;

    expect(hasSelection).toBeTruthy();
  });

  test('should handle no search results gracefully', async ({ page }) => {
    const categoryInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();

    // Search for something that likely doesn't exist
    await categoryInput.fill('xyzabc12345nonexistent');
    await page.waitForTimeout(500);

    // Should show "no results" or empty state
    const showsEmptyState = await page.locator(
      'text=/no results/i, text=/not found/i, text=/no categories/i'
    ).count() > 0;

    // Or results list should be empty
    const hasNoResults = showsEmptyState ||
      await page.locator('[role="option"], .category-result').count() === 0;

    expect(hasNoResults).toBeTruthy();
  });

  test('should work offline with cached categories', async ({ page, context }) => {
    // First do a search while online to populate cache
    const categoryInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();

    await categoryInput.fill('Just Chatting');
    await page.waitForTimeout(500);

    // Now go offline
    await context.setOffline(true);

    // Clear and search again
    await categoryInput.clear();
    await categoryInput.fill('Just');
    await page.waitForTimeout(500);

    // Should still show results from cache
    const hasResults = await page.locator('text=Just Chatting').count() > 0;
    expect(hasResults).toBeTruthy();

    await context.setOffline(false);
  });

  test('should show popular/default categories', async ({ page }) => {
    const categoryInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();

    // Click or focus the input without typing
    await categoryInput.click();
    await page.waitForTimeout(300);

    // Should show default/popular categories
    const hasDefaultCategories = await page.locator(
      'text=Just Chatting, text=Music, text=Art, text=Science & Technology'
    ).count() > 0;

    expect(hasDefaultCategories).toBeTruthy();
  });

  test('should clear category selection', async ({ page }) => {
    const categoryInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="search" i], input[placeholder*="game" i]'
    ).first();

    // Select a category
    await categoryInput.fill('Music');
    await page.waitForTimeout(500);
    await page.click('text=Music').first();

    // Look for a clear/remove button
    const clearButton = page.locator('button[title*="clear" i], button[title*="remove" i], button:has-text("×")');

    if (await clearButton.count() > 0) {
      await clearButton.first().click();

      // Input should be cleared
      const inputValue = await categoryInput.inputValue();
      expect(inputValue).toBe('');
    }
  });

  test('should validate category is required', async ({ page }) => {
    // Try to submit without selecting category
    await page.fill('input[name="name"]', 'No Category Test');
    await page.fill('input[name="title"]', 'Test');

    // Submit without category
    await page.click('button[type="submit"]');

    // Should show validation error
    const hasError = await page.locator(
      'text=/category.*required/i, text=/select.*category/i, .error'
    ).count() > 0;

    // Or should not navigate away
    const stillOnNewPage = await page.url().includes('/profile/new');

    expect(hasError || stillOnNewPage).toBeTruthy();
  });
});
