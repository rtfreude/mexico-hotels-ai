import { chromium } from 'playwright';

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 20000 });

  // Nav links with data-sanity-source
  const nav = await page.$$eval('nav a', els => els.map(e => ({ text: e.innerText.trim(), source: e.getAttribute('data-sanity-source') })).filter(Boolean));

    // Hero title and paragraph: find the h1 inside the hero section
    const hero = await page.$eval('section.relative', sec => {
      const h1 = sec.querySelector('h1');
      const p = sec.querySelector('p');
      return { title: h1 ? h1.innerText.trim() : null, titleSource: h1 ? h1.getAttribute('data-sanity-source') : null, body: p ? p.innerText.trim() : null, bodySource: p ? p.getAttribute('data-sanity-source') : null };
    }).catch(async () => {
      // fallback
      const h1 = await page.$eval('h1', el => el.innerText.trim()).catch(() => null);
      const p = await page.$eval('p', el => el.innerText.trim()).catch(() => null);
      const titleSource = await page.$eval('h1', el => el.getAttribute('data-sanity-source')).catch(() => null);
      const bodySource = await page.$eval('p', el => el.getAttribute('data-sanity-source')).catch(() => null);
      return { title: h1, titleSource, body: p, bodySource };
    });

    // Destinations heading and paragraph — find the first h2 after the hero
  const h2s = await page.$$eval('h2', els => els.map(e => ({ text: e.innerText.trim(), source: e.getAttribute('data-sanity-source') })).filter(Boolean));
  const destinationsHeading = h2s.length ? h2s[0] : null;

    // Footer (outer text)
  const footer = await page.$eval('footer', el => ({ text: el.innerText.trim(), source: el.querySelector('[data-sanity-source]') ? el.querySelector('[data-sanity-source]').getAttribute('data-sanity-source') : null })).catch(() => null);

  console.log(JSON.stringify({ nav, hero, destinationsHeading, footer }, null, 2));

    await browser.close();
  } catch (e) {
    console.error('error', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
