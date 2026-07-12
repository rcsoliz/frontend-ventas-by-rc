import { chromium } from 'playwright';

const consoleMessages = [];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.toLowerCase().includes('impeccable')) {
      consoleMessages.push(text);
    }
  });

  // Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="username"]', 'vendedor1');
  await page.fill('input[name="password"]', 'Vendedor#2025');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);

  await page.waitForTimeout(1000);

  // Navigate to target screen
  await page.goto('http://localhost:5173/ventas/nueva', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Inject detector script from live-server (port passed via env var)
  const port = process.env.LIVE_SERVER_PORT || '4700';
  const detectorUrl = `http://localhost:${port}/detect.js`;
  console.log('Injecting detector from', detectorUrl);

  try {
    await page.addScriptTag({ url: detectorUrl });
  } catch (err) {
    console.log('addScriptTag failed:', err.message);
  }

  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'check-carrito-detect.local.png', fullPage: true });

  console.log('--- CAPTURED CONSOLE MESSAGES ---');
  for (const m of consoleMessages) {
    console.log(m);
  }
  console.log('--- END ---');
  console.log('Total messages:', consoleMessages.length);

  await browser.close();
})().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
