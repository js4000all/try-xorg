const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto('https://example.com');

  console.log('title:', await page.title());

  await new Promise(resolve => {
    page.once('close', resolve);
  });

  console.log('page closed');

  await browser.close();

  console.log('browser closed');
})();
