// Usage: npm i -D playwright @axe-core/playwright && npx playwright install chromium
//        node checks/a11y.mjs [url-or-file]   (default: reference/index.html)
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const target = process.argv[2] ?? pathToFileURL(path.resolve('reference/index.html')).href;
const url = /^https?:|^file:/.test(target) ? target : pathToFileURL(path.resolve(target)).href;
const browser = await chromium.launch(); let failures = 0;
for (const theme of ['light', 'dark', 'high-contrast']) for (const [w, h] of [[1280, 900], [320, 700]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })).newPage();
  await page.goto(url); await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']).analyze();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const bad = violations.length + (w === 320 && overflow > 0 ? 1 : 0); failures += bad;
  console.log(`${bad ? 'FAIL' : 'PASS'} ${theme} @${w}px`, violations.map(v => `\n  ${v.id}: ${v.help} (${v.nodes.length})`).join(''), w === 320 && overflow > 0 ? `\n  horizontal overflow ${overflow}px` : '');
}
await browser.close(); process.exit(failures ? 1 : 0);
