const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  await page.goto('https://example.com');

  console.log('title:', await page.title());
  console.log('url:', page.url());

  await browser.close();
})();
