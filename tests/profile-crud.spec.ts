import { test, expect } from '@playwright/test';

/**
 * Profile CRUD Operations Tests
 * Tests profile creation, listing, editing, and deletion
 */

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for app to load
    await page.waitForSelector('h1:has-text("Stream Profiles")', { timeout: 10000 });
  });

  test('should create a new profile', async ({ page }) => {
    // Click "New Profile" button
    await page.click('a:has-text("New Profile")');

    // Wait for create form
    await expect(page).toHaveURL(/\/profile\/new/);

    // Fill in profile details
    await page.fill('input[name="name"]', 'Test Profile');
    await page.fill('textarea[name="description"]', 'A test profile for automated testing');
    await page.fill('input[name="title"]', 'Test Stream - {DAY}');

    // Select a category using the dropdown
    const categoryInput = page.locator('input[placeholder*="Search for a category" i]');
    await categoryInput.fill('Just Chatting');
    await page.waitForTimeout(500); // Wait for search results

    const justChattingOption = page.locator('button[role="option"]:has-text("Just Chatting")').first();
    await justChattingOption.click();

    // Add tags (comma-separated in the tags input)
    await page.fill('input[name="tags"]', 'test, automated');

    // Submit the form
    await page.click('button:has-text("Create Profile")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Profile should appear in the list
    await expect(page.locator('text=Test Profile')).toBeVisible();
  });

  test('should list existing profiles', async ({ page }) => {
    // Check if we have profiles or empty state
    const hasProfiles = await page.locator('article.scandi-card').count() > 0;
    const hasEmptyState = await page.locator('text=No profiles yet').isVisible();

    // Either we should see profiles or the empty state
    expect(hasProfiles || hasEmptyState).toBeTruthy();
  });

  test('should edit an existing profile', async ({ page }) => {
    // First create a profile if none exist
    const profileCards = await page.locator('article.scandi-card').count();

    if (profileCards === 0) {
      // Create a test profile first
      await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
      await page.fill('input[name="name"]', 'Profile to Edit');
      await page.fill('input[name="title"]', 'Original Title');

      // Select a category
      const categoryInput = page.locator('input[placeholder*="Search for a category" i]');
      await categoryInput.fill('Music');
      await page.waitForTimeout(500);
      const musicOption = page.locator('button[role="option"]:has-text("Music")').first();
      await musicOption.click();

      await page.click('button:has-text("Create Profile")');
      await page.waitForURL('/');
    }

    // Hover over profile card to reveal edit button
    const firstProfileCard = page.locator('article.scandi-card').first();
    await firstProfileCard.hover();

    // Click edit button
    await firstProfileCard.locator('a[title*="Edit" i]').click();

    // Wait for edit page
    await expect(page).toHaveURL(/\/profile\/.*\/edit/);

    // Update the title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('Updated Title - {DAY}');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Should redirect back to dashboard
    await expect(page).toHaveURL('/');

    // Updated title should be visible
    await expect(page.locator('text=Updated Title')).toBeVisible();
  });

  test('should delete a profile', async ({ page }) => {
    // First ensure we have a profile to delete
    const profileCards = await page.locator('article.scandi-card').count();

    if (profileCards === 0) {
      // Create a test profile first
      await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
      await page.fill('input[name="name"]', 'Profile to Delete');
      await page.fill('input[name="title"]', 'Will be deleted');

      // Select a category
      const categoryInput = page.locator('input[placeholder*="Search for a category" i]');
      await categoryInput.fill('Art');
      await page.waitForTimeout(500);
      const artOption = page.locator('button[role="option"]:has-text("Art")').first();
      await artOption.click();

      await page.click('button:has-text("Create Profile")');
      await page.waitForURL('/');
    }

    // Count profiles before deletion
    const initialCount = await page.locator('article.scandi-card').count();

    // Hover over profile card to reveal delete button
    const profileToDelete = page.locator('article.scandi-card').first();
    await profileToDelete.hover();

    // Set up dialog handler before clicking delete
    page.on('dialog', dialog => dialog.accept());

    // Click delete button
    await profileToDelete.locator('button[title*="Delete" i]').click();

    // Wait a moment for deletion to complete
    await page.waitForTimeout(1000);

    // Profile count should decrease or show empty state
    const finalCount = await page.locator('article.scandi-card').count();
    const showsEmptyState = await page.locator('text=No profiles yet').isVisible();

    expect(finalCount < initialCount || showsEmptyState).toBeTruthy();
  });

  test('should show profile count', async ({ page }) => {
    // The dashboard should show profile count
    const countText = page.locator('text=/\\d+ profile/i, text=No profiles yet');
    await expect(countText).toBeVisible();
  });
});
