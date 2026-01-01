# Playwright Test Suite

Automated end-to-end tests for Scratch My Twitch, covering all features from the EXE-19 manual testing checklist.

## Test Coverage

### Profile Management (`profile-crud.spec.ts`)
- ✅ Create new profiles
- ✅ List existing profiles
- ✅ Edit profiles
- ✅ Delete profiles
- ✅ Profile count display

### Offline Mode (`offline-mode.spec.ts`)
- ✅ IndexedDB storage
- ✅ Profile creation while offline
- ✅ Profile editing while offline
- ✅ Profile listing while offline
- ✅ API unavailability handling
- ✅ Disabled actions when offline

### Dynamic Templating (`dynamic-templating.spec.ts`)
- ✅ `{DAY}` replacement (current day of week)
- ✅ `{YYYY-MM-DD}` replacement (current date)
- ✅ Multiple template variables in one title
- ✅ Invalid template syntax handling
- ✅ Original template display on hover
- ✅ Template processing on edit

### Category Search (`category-search.spec.ts`)
- ✅ Category search input visibility
- ✅ Search functionality
- ✅ Category selection
- ✅ No results handling
- ✅ Offline cached category search
- ✅ Default/popular categories
- ✅ Category validation

### PWA Features (`pwa.spec.ts`)
- ✅ Valid PWA manifest
- ✅ Theme color meta tag
- ✅ Viewport meta tag
- ✅ Apple touch icon
- ✅ iOS splash screens
- ✅ Apple PWA meta tags
- ✅ Favicons
- ✅ Open Graph meta tags
- ✅ Static asset loading
- ✅ Loading screen
- ✅ Mobile responsiveness
- ✅ Tablet responsiveness
- ✅ Touch event handling
- ✅ SEO meta tags
- ⚠️ Service Worker registration (blocked by EXE-24)

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with UI Mode (Recommended for Development)
```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

### Run Specific Test File
```bash
npx playwright test tests/profile-crud.spec.ts
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests on Mobile Viewports
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Test Configuration

Configuration is in `playwright.config.ts`:
- Base URL: http://localhost:5173
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Screenshots: On failure only
- Traces: On first retry
- Reporter: HTML

## Known Issues

### EXE-24: Service Worker Not Registered
The service worker registration tests will fail until this issue is fixed. The PWA functionality (offline mode, install prompts) requires the service worker to be registered in `src/main.tsx`.

### Missing PNG Favicons (EXE-25)
Some browsers may not display favicons correctly until PNG versions are added.

## CI/CD Integration

To run tests in CI:

```bash
npx playwright test --reporter=github
```

Or use the built-in CI configuration in `playwright.config.ts`:
- Retries: 2
- Workers: 1
- Forbid .only: true

## Writing New Tests

1. Create a new `.spec.ts` file in the `tests/` directory
2. Import test utilities: `import { test, expect } from '@playwright/test'`
3. Use `test.describe()` to group related tests
4. Use `test.beforeEach()` for common setup
5. Write assertions with `expect()`

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Debugging Tips

1. Use `--debug` flag to step through tests
2. Use `page.pause()` to pause test execution
3. Use `--headed` to see the browser
4. Use `--ui` for an interactive debugging experience
5. Check `playwright-report/` for detailed failure reports
6. Use `--trace on` to record traces for debugging

## Further Reading

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
- [API Reference](https://playwright.dev/docs/api/class-test)
