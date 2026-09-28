const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1920,
      height: 1080
    }
  });

  await page.goto('https://example.com');

  await page.screenshot({
    path: 'example.png',
    fullPage: true
  });

  console.log(await page.title());

  await browser.close();
})();
