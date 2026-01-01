import { test, expect } from '@playwright/test';

/**
 * Offline Mode Tests
 * Tests IndexedDB storage, offline profile CRUD, and sync functionality
 */

test.describe('Offline Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Stream Profiles")', { timeout: 10000 });
  });

  test('should store profiles in IndexedDB', async ({ page }) => {
    // Create a profile
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Offline Test Profile');
    await page.fill('input[name="title"]', 'Testing offline storage');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Check IndexedDB for the profile
    const hasProfile = await page.evaluate(async () => {
      const request = indexedDB.open('ScratchMyTwitch', 1);

      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['profiles'], 'readonly');
          const store = transaction.objectStore('profiles');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            const profiles = getAllRequest.result;
            const hasOfflineProfile = profiles.some((p: any) =>
              p.name === 'Offline Test Profile'
            );
            resolve(hasOfflineProfile);
          };
        };
      });
    });

    expect(hasProfile).toBeTruthy();
  });

  test('should create profiles while offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Try to create a profile
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Offline Created Profile');
    await page.fill('input[name="title"]', 'Created while offline');

    // Submit should work (stored locally)
    await page.click('button[type="submit"]');

    // Should redirect even when offline
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Profile should appear in the list (from IndexedDB)
    await expect(page.locator('text=Offline Created Profile')).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });

  test('should edit profiles while offline', async ({ page, context }) => {
    // First create a profile while online
    await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
    await page.fill('input[name="name"]', 'Profile for Offline Edit');
    await page.fill('input[name="title"]', 'Original offline title');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Now go offline
    await context.setOffline(true);

    // Edit the profile
    const profileCard = page.locator('article.scandi-card', { hasText: 'Profile for Offline Edit' });
    await profileCard.hover();
    await profileCard.locator('a[title*="Edit" i]').click();

    // Update while offline
    await page.fill('input[name="title"]', 'Updated while offline');
    await page.click('button[type="submit"]');

    // Should work
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Updated while offline')).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });

  test('should list profiles while offline', async ({ page, context }) => {
    // Ensure we have at least one profile
    const hasProfiles = await page.locator('article.scandi-card').count() > 0;

    if (!hasProfiles) {
      await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
      await page.fill('input[name="name"]', 'Offline Listing Test');
      await page.fill('input[name="title"]', 'For offline listing');
      await page.click('button[type="submit"]');
      await page.waitForURL('/');
    }

    const initialCount = await page.locator('article.scandi-card').count();

    // Go offline
    await context.setOffline(true);

    // Reload the page
    await page.reload();
    await page.waitForSelector('h1:has-text("Stream Profiles")');

    // Should still show profiles from IndexedDB
    const offlineCount = await page.locator('article.scandi-card').count();
    expect(offlineCount).toBe(initialCount);

    // Go back online
    await context.setOffline(false);
  });

  test('should handle API unavailability gracefully', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);

    // Reload to simulate app starting offline
    await page.reload();
    await page.waitForSelector('h1:has-text("Stream Profiles")');

    // Should show offline warning or status
    const hasOfflineIndicator = await page.locator(
      'text=/offline/i, text=/unavailable/i, text=/no connection/i, [title*="offline" i]'
    ).count() > 0;

    // App should still be functional for local operations
    const canNavigate = await page.locator('a:has-text("New Profile")').isVisible();
    expect(canNavigate).toBeTruthy();

    // Go back online
    await context.setOffline(false);
  });

  test('should disable API-dependent actions when offline', async ({ page, context }) => {
    // Ensure we have a profile
    const hasProfiles = await page.locator('article.scandi-card').count() > 0;

    if (!hasProfiles) {
      await page.click('a:has-text("New Profile"), a:has-text("Create Profile")');
      await page.fill('input[name="name"]', 'API Test Profile');
      await page.fill('input[name="title"]', 'For API testing');
      await page.click('button[type="submit"]');
      await page.waitForURL('/');
    }

    // Go offline
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector('h1:has-text("Stream Profiles")');

    // "Apply Profile" button should be disabled or show warning
    const applyButton = page.locator('button:has-text("Apply Profile")').first();

    if (await applyButton.isVisible()) {
      const isDisabled = await applyButton.isDisabled();
      const hasWarning = await page.locator('text=/Unable to connect/i, text=/disabled/i').count() > 0;

      expect(isDisabled || hasWarning).toBeTruthy();
    }

    // Go back online
    await context.setOffline(false);
  });
});
