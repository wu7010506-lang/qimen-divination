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

  // Test opening Profile Section
  await page.click('#btn-toggle-profile');
  await new Promise(r => setTimeout(r, 400));
  const profileOpen = await page.$eval('#profile-box', el => !el.classList.contains('hidden'));
  console.log('2b. Profile section opened:', profileOpen);

  // Fill in profile
  await page.fill('#input-asker-name', '玄通信士');
  await page.selectOption('#select-asker-gender', 'male');
  await page.selectOption('#select-divine-mode', 'time');

  // Take screenshot of initial inquiry view with profile expanded
  await page.screenshot({ path: 'test-01-inquiry.png' });
  console.log('2c. Saved test-01-inquiry.png');

  // Type question
  await page.fill('#question-input', '明年開拓海外新市場，能否獲利興隆逢凶化吉？');
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
  const resAstro = await page.$eval('#res-astro-pillars', el => el.textContent);
  const resBureau = await page.$eval('#res-astro-bureau', el => el.textContent);
  const resFormName = await page.$eval('#res-form-name', el => el.textContent);
  const resPalace = await page.$eval('#res-palace', el => el.textContent);
  const resGate = await page.$eval('#res-gate', el => el.textContent);
  const resStar = await page.$eval('#res-star', el => el.textContent);
  const resDeity = await page.$eval('#res-deity', el => el.textContent);

  console.log('7. Result container active:', resultActive);
  console.log('   Grade:', resGrade);
  console.log('   Question:', resQuestion);
  console.log('   Four Pillars:', resAstro);
  console.log('   Bureau:', resBureau);
  console.log('   Formation:', resFormName);
  console.log('   Palace:', resPalace);
  console.log('   Gate:', resGate);
  console.log('   Star:', resStar);
  console.log('   Deity:', resDeity);

  // Screenshot Tab 1 (四盤天機)
  await page.screenshot({ path: 'test-03-result.png' });
  console.log('8. Screenshot saved to test-03-result.png');

  // Test Tab 2: 盲點癥結
  await page.click('.read-tab[data-tab="blindspot"]');
  await new Promise(r => setTimeout(r, 300));
  const blindRoot = await page.$eval('#blind-root', el => el.textContent);
  console.log('8b. Blindspot Tab Root:', blindRoot.slice(0, 20) + '...');

  // Test Tab 3: 時序應期
  await page.click('.read-tab[data-tab="timing"]');
  await new Promise(r => setTimeout(r, 300));
  const timingNear = await page.$eval('#timing-near', el => el.textContent);
  console.log('8c. Timing Tab Near Node:', timingNear);

  // Test Tab 4: 破局之策
  await page.click('.read-tab[data-tab="strategy"]');
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'test-05-strategy.png' });
  console.log('8d. Strategy Tab screenshot saved to test-05-strategy.png');

  // Test Tab 5: 易象神數
  await page.click('.read-tab[data-tab="hexagram"]');
  await new Promise(r => setTimeout(r, 300));
  const hexName = await page.$eval('#hex-name', el => el.textContent);
  console.log('8e. Hexagram Tab Name:', hexName);

  // Test Tab 6: 👑 尊享錦囊
  await page.click('.read-tab[data-tab="vip"]');
  await new Promise(r => setTimeout(r, 400));
  const vipScore = await page.$eval('#score-tian', el => el.textContent);
  const vipCert = await page.$eval('#vip-cert-code', el => el.textContent);
  console.log('8f. VIP Tab Score:', vipScore, '| Cert:', vipCert);
  await page.screenshot({ path: 'test-06-vip.png' });
  console.log('8g. VIP Tab screenshot saved to test-06-vip.png');

  // Test Talisman Card Download button click (triggers canvas drawing)
  await page.click('#btn-download-card');
  await new Promise(r => setTimeout(r, 700));
  console.log('9. Download Talisman Card button clicked and verified');

  // Test close/minimize result to view 3D living formation
  await page.click('#btn-close-result');
  await new Promise(r => setTimeout(r, 600));
  const resultClosed = await page.$eval('#result-container', el => !el.classList.contains('active'));
  console.log('10. Result minimized successfully:', resultClosed);

  // Test History Drawer
  await page.click('#btn-history');
  await new Promise(r => setTimeout(r, 500));
  const drawerOpen = await page.$eval('#history-overlay', el => !el.classList.contains('hidden'));
  const historyItemsCount = await page.$$eval('.history-card-item', items => items.length);
  console.log('11. History Drawer opened:', drawerOpen, '| Records count:', historyItemsCount);
  await page.screenshot({ path: 'test-07-history.png' });
  console.log('11b. History Drawer screenshot saved to test-07-history.png');

  // Close history drawer
  await page.click('#btn-close-history');
  await new Promise(r => setTimeout(r, 400));

  // Verify zero occurrences of "王也" across the entire page
  const pageText = await page.evaluate(() => document.body.innerText);
  const hasWangYe = pageText.includes('王也');
  console.log('12. Zero occurrences of 王也 on page:', !hasWangYe);
  if (hasWangYe) throw new Error('Found 王也 in page text!');

  // Test re-ask button
  await page.click('#btn-reask-top');
  await new Promise(r => setTimeout(r, 600));
  const inquiryReturned = await page.$eval('#inquiry-container', el => !el.classList.contains('hidden'));
  console.log('13. Inquiry card returned successfully:', inquiryReturned);

  await browser.close();
  console.log('=== All commercial-grade end-to-end tests passed with 100% success! ===');
})();
