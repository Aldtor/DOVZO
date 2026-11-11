import { strict as assert } from 'node:assert';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  const base = process.env.AUDIT_URL || 'http://localhost:3000';
  async function open(slug) {
    await page.goto(`${base}/tools/${slug}`);
    // Wait for hydration before sending input to server-rendered controls.
    await page.waitForFunction(() => [...document.querySelectorAll('.tool-workspace input, .tool-workspace textarea')].some(el => Object.keys(el).some(key => key.startsWith('__reactProps'))));
  }
  for (const [slug, name, mimeType] of [['image-compressor','bad.png','image/png'], ['pdf-page-extractor','bad.pdf','application/pdf'], ['zip-extractor','bad.zip','application/zip'], ['audio-trimmer','bad.wav','audio/wav'], ['video-trimmer','bad.webm','video/webm']]) {
    await open(slug);
    await page.locator('input[type=file]').setInputFiles({name, mimeType, buffer: Buffer.from('invalid file contents')});
    await page.locator('.tool-workspace [role=alert]').waitFor();
    console.log('PASS corrupt file rejected:', slug);
  }
  await open('base64-encoder');
  await page.locator('textarea:not([readonly])').fill('copy test');
  await page.getByRole('button', {name:'Copy', exact:true}).click();
  await page.getByRole('button', {name:'Copied', exact:true}).waitFor();
  assert.equal(await page.locator('textarea[readonly]').inputValue(), Buffer.from('copy test').toString('base64'));
  console.log('PASS clipboard');
} finally { await browser.close(); }
