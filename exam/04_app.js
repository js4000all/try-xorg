const { chromium } = require('playwright');

(async () => {
  const context = await chromium.launchPersistentContext('/tmp/signage-profile', {
    headless: false,
    viewport: null,
    args: [
      '--app=https://example.com',
      '--window-position=0,0',
      '--window-size=1280,800',
      '--no-first-run',
    ],
  });

  const pages = context.pages();
  const page = pages[0];

  console.log('title:', await page.title());

  await new Promise(resolve => {
    page.once('close', resolve);
  });

  console.log('page closed');

  await context.close();
})();
