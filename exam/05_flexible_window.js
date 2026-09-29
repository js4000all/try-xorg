const { chromium } = require('playwright');
const { execFileSync } = require('child_process');

function getActiveScreenSize() {
  const output = execFileSync('xrandr', ['--current'], {
    encoding: 'utf8',
  });

  const match = output.match(
    /^(\S+) connected(?: primary)? (\d+)x(\d+)\+\d+\+\d+/m
  );

  if (!match) {
    throw new Error('Active display not found');
  }

  return {
    output: match[1],
    width: Number(match[2]),
    height: Number(match[3]),
  };
}

(async () => {
  const screen = getActiveScreenSize();

  console.log(
    `display: ${screen.output} ${screen.width}x${screen.height}`
  );

  const context = await chromium.launchPersistentContext(
    '/tmp/signage-profile',
    {
      headless: false,
      viewport: null,
      args: [
        '--app=https://example.com',
        '--window-position=0,0',
        `--window-size=${screen.width},${screen.height}`,
        '--no-first-run',
      ],
    }
  );

  const pages = context.pages();
  const page = pages[0];

  console.log('title:', await page.title());

  await new Promise(resolve => {
    page.once('close', resolve);
  });

  console.log('page closed');

  await context.close();
})();
