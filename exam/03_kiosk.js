const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--kiosk',
      '--window-position=0,0',
      '--window-size=1280,800',
      '--no-first-run',
      '--disable-session-crashed-bubble',
    ],
  });
  const context = await browser.newContext({
      viewport: null,
    });

  const page = await context.newPage();

  await page.goto('https://example.com');

  console.log('title:', await page.title());

  await new Promise(resolve => {
    page.once('close', resolve);
  });

  console.log('page closed');

  await browser.close();

  console.log('browser closed');
})();
