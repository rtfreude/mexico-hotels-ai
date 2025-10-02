import { chromium } from 'playwright';

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    const footer = await page.$eval('footer', el => el.outerHTML).catch(() => null);
    console.log(JSON.stringify({ footer }, null, 2));
    await browser.close();
  } catch (e) {
    console.error('error', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
