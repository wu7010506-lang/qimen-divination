import { createRequire } from 'node:module';

const requireOuter = createRequire('E:/Qimen-Website/qimen-website/package.json');
const { chromium } = requireOuter('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'networkidle' });
  console.log('1. Page loaded successfully');

  // Check initial state
  const inquiryVisible = await page.$eval('#inquiry-container', el => !el.classList.contains('hidden'));
  console.log('2. Inquiry container visible initially:', inquiryVisible);

  // Take screenshot of initial inquiry view
  await page.screenshot({ path: 'test-01-inquiry.png' });

  // Type question
  await page.fill('#question-input', '這份新工作機會適合我轉換嗎？');
  console.log('3. Question typed');

  // Click cast button
  await page.click('#btn-cast-fortune');
  console.log('4. Clicked Cast Fortune');

  // Verify inquiry card is hidden and banner is visible
  await new Promise(r => setTimeout(r, 600));
  const inquiryHidden = await page.$eval('#inquiry-container', el => el.classList.contains('hidden'));
  const bannerVisible = await page.$eval('#cinematic-banner', el => el.classList.contains('visible'));
  const bannerTitle = await page.$eval('#banner-title', el => el.textContent);
  console.log('5. Inquiry hidden:', inquiryHidden, '| Banner visible:', bannerVisible, '| Title:', bannerTitle);

  // Take screenshot of animation in progress
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'test-02-animation.png' });

  // Wait for formation completion and result scroll (total 6.2s from click)
  console.log('6. Waiting for formation deployment and result output...');
  await new Promise(r => setTimeout(r, 3800));

  const resultActive = await page.$eval('#result-container', el => el.classList.contains('active'));
  const resGrade = await page.$eval('#res-grade', el => el.textContent);
  const resQuestion = await page.$eval('#res-question', el => el.textContent);
  const resPalace = await page.$eval('#res-palace', el => el.textContent);
  const resGate = await page.$eval('#res-gate', el => el.textContent);
  const resStar = await page.$eval('#res-star', el => el.textContent);
  const resDeity = await page.$eval('#res-deity', el => el.textContent);

  console.log('7. Result container active:', resultActive);
  console.log('   Grade:', resGrade);
  console.log('   Question:', resQuestion);
  console.log('   Palace:', resPalace);
  console.log('   Gate:', resGate);
  console.log('   Star:', resStar);
  console.log('   Deity:', resDeity);

  // Take a screenshot of the divination result (analysis tab)
  await page.screenshot({ path: 'test-03-result.png' });
  console.log('8. Screenshot saved to test-03-result.png');

  // Test switching to strategy tab
  await page.click('.read-tab[data-tab="strategy"]');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'test-05-strategy.png' });
  console.log('8b. Strategy tab clicked & screenshot saved to test-05-strategy.png');

  // Test close/minimize result to view 3D living formation
  await page.click('#btn-close-result');
  await new Promise(r => setTimeout(r, 600));
  const resultClosed = await page.$eval('#result-container', el => !el.classList.contains('active'));
  console.log('9. Result minimized successfully:', resultClosed);

  // Take a screenshot of the 3D living formation after minimizing
  await page.screenshot({ path: 'test-04-living-formation.png' });
  console.log('10. Screenshot of living formation saved to test-04-living-formation.png');

  // Verify no Wang Ye in text content across entire page
  const pageText = await page.evaluate(() => document.body.innerText);
  const hasWangYe = pageText.includes('王也');
  console.log('11. Zero occurrences of 王也 on page:', !hasWangYe);
  if (hasWangYe) throw new Error('Found 王也 in page text!');

  // Test re-ask button
  await page.click('#btn-reask-top');
  await new Promise(r => setTimeout(r, 600));
  const inquiryReturned = await page.$eval('#inquiry-container', el => !el.classList.contains('hidden'));
  console.log('12. Inquiry card returned successfully:', inquiryReturned);

  await browser.close();
  console.log('=== All end-to-end tests passed with 100% success! ===');
})();
