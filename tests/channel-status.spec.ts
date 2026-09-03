import { test, expect, type Page, type Route } from '@playwright/test';

/**
 * Channel status card tests (feature spec C2 — "Now on your channel")
 *
 * Mocks the Twitch Helix channels endpoint at the route level and pins the
 * spec's state model: loading (skeleton), ready (live data + freshness),
 * stale (last-known data labeled as such), error (plain message + retry),
 * unauthenticated (sign-in prompt, not a red error). The focus/visibility
 * refetch must issue exactly ONE request under the 30s throttle.
 */

/** TwitchChannelResponse fixture — what GET /helix/channels returns. */
const CHANNEL_PAYLOAD = {
  data: [
    {
      broadcaster_id: '987654321',
      broadcaster_login: 'playwrightstreamer',
      broadcaster_name: 'Playwright Streamer',
      broadcaster_language: 'en',
      game_id: '509668',
      game_name: 'Just Chatting',
      title: 'Fresh from the wire',
      delay: 0,
      tags: ['chill', 'variety', 'playwright'],
      content_classification_labels: [],
      is_branded_content: false,
    },
  ],
};

/**
 * Seed a valid Twitch auth token into the IndexedDB auth store — the same
 * harness as tests/manual-category-payload.spec.ts: it replicates the
 * StreamChameleonDB v1 schema the app creates and stores the token record
 * exactly as storeToken writes it, so the dashboard mounts authenticated.
 */
async function seedToken(page: Page): Promise<void> {
  await page.addInitScript(() => {
    return new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('StreamChameleonDB', 1);
      open.onupgradeneeded = () => {
        const db = open.result;
        if (!db.objectStoreNames.contains('profiles')) {
          const profiles = db.createObjectStore('profiles', { keyPath: 'id' });
          profiles.createIndex('name', 'name');
          profiles.createIndex('createdAt', 'createdAt');
          profiles.createIndex('updatedAt', 'updatedAt');
          profiles.createIndex('category', 'category.name');
        }
        if (!db.objectStoreNames.contains('categories')) {
          const categories = db.createObjectStore('categories', { keyPath: 'id' });
          categories.createIndex('name', 'name');
          categories.createIndex('cachedAt', 'cachedAt');
        }
        if (!db.objectStoreNames.contains('auth')) {
          db.createObjectStore('auth', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
      };
      open.onsuccess = () => {
        const db = open.result;
        const now = new Date();
        const token = {
          access_token: 'playwright-test-token',
          token_type: 'bearer',
          expires_in: 3600,
          scope: ['channel:manage:broadcast'],
          obtainedAt: now,
          expiresAt: new Date(now.getTime() + 3_600_000),
          userId: '987654321',
        };
        const tx = db.transaction('auth', 'readwrite');
        tx.objectStore('auth').put({ key: 'token', value: token, updatedAt: now });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error ?? new Error('token seeding failed'));
      };
      open.onerror = () => reject(open.error ?? new Error('db open failed'));
    });
  });
}

/** Mock the helix endpoints the dashboard touches besides /channels. */
async function mockTwitchBasics(page: Page): Promise<void> {
  await page.route('**/api.twitch.tv/helix/users*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '987654321',
            login: 'playwrightstreamer',
            display_name: 'Playwright Streamer',
            type: '',
            broadcaster_type: '',
            description: '',
            profile_image_url: '',
            offline_image_url: '',
            view_count: 0,
            created_at: '2020-01-01T00:00:00Z',
          },
        ],
      }),
    });
  });
  await page.route('**/api.twitch.tv/helix/games*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });
}

/**
 * Track every request the card (or anything else) makes to the channels
 * endpoint and route it through `handler`. The returned getter reads the
 * request count synchronously — the throttle decision itself is synchronous,
 * but a refetch that goes out resolves asynchronously, so pair count
 * assertions on *outgoing* refetches with expect.poll.
 */
function trackChannels(
  page: Page,
  handler: (route: Route) => Promise<void>
): { count: () => number } {
  const state = { count: 0 };
  void page.route('**/api.twitch.tv/helix/channels*', async (route) => {
    state.count++;
    await handler(route);
  });
  return { count: () => state.count };
}

async function fulfillChannels(route: Route): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(CHANNEL_PAYLOAD),
  });
}

test.describe('Channel status card (C2)', () => {
  test('mount fetch renders ready data with freshness and does not poll', async ({ page }) => {
    await seedToken(page);
    await mockTwitchBasics(page);
    const channels = trackChannels(page, async (route) => fulfillChannels(route));
    await page.clock.install();
    await page.goto('/');

    const card = page.getByTestId('channel-status-card');
    await expect(card).toHaveAttribute('data-phase', 'ready');
    await expect(card).toContainText('Fresh from the wire');
    await expect(card).toContainText('Just Chatting');
    await expect(card).toContainText('Tags: 3');
    await expect(card).toContainText(/Updated \d{2}:\d{2}/);

    // No background polling: one request at mount, none afterwards.
    await page.waitForTimeout(1000);
    expect(channels.count()).toBe(1);
  });

  test('shows the loading skeleton while the first fetch is in flight', async ({ page }) => {
    await seedToken(page);
    await mockTwitchBasics(page);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await trackChannels(page, async (route) => {
      await gate;
      await fulfillChannels(route);
    });
    await page.clock.install();
    await page.goto('/');

    const card = page.getByTestId('channel-status-card');
    await expect(card).toHaveAttribute('data-phase', 'loading');
    await expect(card).not.toContainText('Fresh from the wire'); // skeleton, no numbers

    release();
    await expect(card).toHaveAttribute('data-phase', 'ready');
    await expect(card).toContainText('Fresh from the wire');
  });

  test('a failed refresh with cached data shows last-known data labeled stale', async ({ page }) => {
    await seedToken(page);
    await mockTwitchBasics(page);
    let failChannels = false;
    const channels = trackChannels(page, async (route) => {
      if (failChannels) {
        await route.abort('failed');
        return;
      }
      await fulfillChannels(route);
    });
    await page.clock.install();
    await page.goto('/');

    const card = page.getByTestId('channel-status-card');
    await expect(card).toHaveAttribute('data-phase', 'ready');

    // The dashboard is looked at again after the throttle window; the
    // refetch fails (offline), so the card degrades to last-known truth.
    failChannels = true;
    await page.clock.fastForward(31_000);
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect(card).toHaveAttribute('data-phase', 'stale');
    await expect(card).toContainText('stale · showing last known');
    await expect(card).toContainText('Fresh from the wire');
    await expect(card).toContainText('Just Chatting');
    await expect.poll(() => channels.count()).toBe(2);
  });

  test('a failed first fetch shows a plain error and a working retry', async ({ page }) => {
    await seedToken(page);
    await mockTwitchBasics(page);
    let failChannels = true;
    const channels = trackChannels(page, async (route) => {
      if (failChannels) {
        await route.abort('failed');
        return;
      }
      await fulfillChannels(route);
    });
    await page.clock.install();
    await page.goto('/');

    const card = page.getByTestId('channel-status-card');
    await expect(card).toHaveAttribute('data-phase', 'error');

    // Manual retry bypasses the throttle and recovers to ready.
    failChannels = false;
    await card.getByRole('button', { name: 'Retry' }).click();
    await expect(card).toHaveAttribute('data-phase', 'ready');
    await expect(card).toContainText('Fresh from the wire');
    await expect.poll(() => channels.count()).toBe(2);
  });

  test('unauthenticated shows a sign-in prompt, not a red error', async ({ page }) => {
    // No token seeded: getCurrentChannelInfo short-circuits with AUTH_REQUIRED.
    await mockTwitchBasics(page);
    await page.goto('/');

    const card = page.getByTestId('channel-status-card');
    await expect(card).toHaveAttribute('data-phase', 'unauthenticated');
    const signIn = card.getByRole('link', { name: 'Sign in with Twitch' });
    await expect(signIn).toHaveAttribute('href', '/auth');
  });

  test('visibilitychange refetch issues exactly one request under throttle', async ({ page }) => {
    await seedToken(page);
    await mockTwitchBasics(page);
    const channels = trackChannels(page, async (route) => fulfillChannels(route));
    await page.clock.install();
    await page.goto('/');

    const card = page.getByTestId('channel-status-card');
    await expect(card).toHaveAttribute('data-phase', 'ready');
    expect(channels.count()).toBe(1);

    // Within the 30s window, focus and visibilitychange refetches are swallowed.
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(500);
    expect(channels.count()).toBe(1);

    // After the window elapses, the next look at the dashboard refreshes — once.
    await page.clock.fastForward(31_000);
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect.poll(() => channels.count()).toBe(2);
    await page.waitForTimeout(500);
    expect(channels.count()).toBe(2);
  });
});
