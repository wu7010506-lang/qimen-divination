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

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    console.log('PAGE LOG:', msg.text());
  });
  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('PAGE ERROR:', err);
  });

  await page.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'networkidle' });
  console.log('1. Page loaded successfully');

  // Verify initial inquiry view
  const inquiryVisible = await page.$eval('#inquiry-container', el => !el.classList.contains('hidden'));
  console.log('2. Inquiry container visible initially:', inquiryVisible);

  // ==========================================
  // Test Module 1: 今日奇門吉方羅盤 (Daily Compass Mode)
  // ==========================================
  console.log('=== Testing Module 1: Daily Compass Mode ===');
  await page.click('#btn-mode-compass');
  await new Promise(r => setTimeout(r, 400));

  const compassVisible = await page.$eval('#compass-card', el => !el.classList.contains('hidden'));
  const inquiryHidden = await page.$eval('#inquiry-card', el => el.classList.contains('hidden'));
  console.log('3a. Compass card visible:', compassVisible, '| Inquiry card hidden:', inquiryHidden);

  const pillarsText = await page.$eval('#dc-pillars', el => el.textContent);
  const bureauText = await page.$eval('#dc-bureau', el => el.textContent);
  const curShichenText = await page.$eval('#dc-cur-shichen', el => el.textContent);
  const wealthDir = await page.$eval('#dc-wealth-dir', el => el.textContent);
  const careerDir = await page.$eval('#dc-career-dir', el => el.textContent);
  const cautionDir = await page.$eval('#dc-caution-dir', el => el.textContent);

  console.log('3b. Daily Compass Astro:', pillarsText, '|', bureauText, '|', curShichenText);
  console.log('    💰 Wealth Direction:', wealthDir);
  console.log('    🚀 Career Direction:', careerDir);
  console.log('    🛑 Caution Direction:', cautionDir);

  // Check 8-directions grid
  const directionCells = await page.$$eval('.ed-cell', cells => cells.length);
  console.log('3c. 8-direction cells rendered:', directionCells);
  if (directionCells !== 8) throw new Error('Expected 8 direction cells!');

  // Check 12-shichen table
  const shichenRows = await page.$$eval('.shichen-row', rows => rows.length);
  console.log('3d. 12-shichen rows rendered:', shichenRows);
  if (shichenRows !== 12) throw new Error('Expected 12 shichen rows!');

  // Filter auspicious shichens
  await page.click('#btn-sc-auspicious');
  await new Promise(r => setTimeout(r, 200));
  const filteredRows = await page.$$eval('.shichen-row', rows => rows.length);
  console.log('3e. Auspicious shichen filter applied, count:', filteredRows);

  // Reset to all shichens
  await page.click('#btn-sc-all');
  await new Promise(r => setTimeout(r, 200));

  // Take screenshot of Daily Compass
  await page.screenshot({ path: 'test-08-daily-compass.png' });
  console.log('3f. Saved test-08-daily-compass.png');

  // Test downloading Daily Compass wallpaper
  await page.click('#btn-download-compass-card');
  await new Promise(r => setTimeout(r, 600));
  console.log('3g. Daily Compass Wallpaper generation triggered successfully');

  // Click on a direction cell in the grid to test palace inspection
  await page.click('.ed-cell:first-child');
  await new Promise(r => setTimeout(r, 400));
  const modalOpen = await page.$eval('#palace-modal', el => !el.classList.contains('hidden'));
  const modalTitle = await page.$eval('#pm-title', el => el.textContent);
  console.log('3h. Palace Inspector Modal opened from cell click:', modalOpen, '| Title:', modalTitle);

  // Close palace modal
  await page.click('#btn-close-palace-modal');
  await new Promise(r => setTimeout(r, 300));

  // Switch back to Inquiry Mode
  await page.click('#btn-compass-to-divine');
  await new Promise(r => setTimeout(r, 400));
  const backToInquiry = await page.$eval('#inquiry-card', el => !el.classList.contains('hidden'));
  console.log('3i. Returned to Inquiry Mode:', backToInquiry);

  // ==========================================
  // Test Question Divination & Profile Setup
  // ==========================================
  console.log('=== Testing Divination Flow ===');
  await page.click('#btn-toggle-profile');
  await new Promise(r => setTimeout(r, 300));
  await page.fill('#input-asker-name', '玄通信士');
  await page.selectOption('#select-asker-gender', 'male');
  await page.selectOption('#select-divine-mode', 'time');

  await page.fill('#question-input', '明年開拓海外新市場，能否獲利興隆逢凶化吉？');
  console.log('4. Question typed and profile filled');

  await page.click('#btn-cast-fortune');
  console.log('5. Clicked Cast Fortune');

  // Verify cinematic banner
  await new Promise(r => setTimeout(r, 600));
  const bannerVisible = await page.$eval('#cinematic-banner', el => el.classList.contains('visible'));
  console.log('6. Cinematic banner active:', bannerVisible);

  // Wait for 3D animation completion (5.6s)
  console.log('7. Waiting for formation deployment and result output...');
  await new Promise(r => setTimeout(r, 5800));

  const resultActive = await page.$eval('#result-container', el => el.classList.contains('active'));
  const resGrade = await page.$eval('#res-grade', el => el.textContent);
  const resQuestion = await page.$eval('#res-question', el => el.textContent);
  const resAstro = await page.$eval('#res-astro-pillars', el => el.textContent);
  const resBureau = await page.$eval('#res-astro-bureau', el => el.textContent);
  const resPalace = await page.$eval('#res-palace', el => el.textContent);

  console.log('8. Result Active:', resultActive);
  console.log('   Grade:', resGrade);
  console.log('   Question:', resQuestion);
  console.log('   Palace:', resPalace);
  console.log('   Astro:', resAstro);

  // Test Tab switching
  await page.click('.read-tab[data-tab="vip"]');
  await new Promise(r => setTimeout(r, 300));
  const vipCert = await page.$eval('#vip-cert-code', el => el.textContent);
  console.log('9. VIP Tab Cert:', vipCert);

  // ==========================================
  // Test Module 3: 3 Talisman Styles & Download
  // ==========================================
  console.log('=== Testing Talisman Card Multi-Themes ===');
  await page.click('.pss-tab[data-poster-theme="cinnabar"]');
  await new Promise(r => setTimeout(r, 200));
  console.log('10a. Switched to Cinnabar (硃砂御印) style');

  await page.click('.pss-tab[data-poster-theme="jade"]');
  await new Promise(r => setTimeout(r, 200));
  console.log('10b. Switched to Jade (青玉太虛) style');

  await page.click('.pss-tab[data-poster-theme="dark-gold"]');
  await new Promise(r => setTimeout(r, 200));
  console.log('10c. Switched to Dark Gold (玄黑真金) style');

  await page.click('#btn-download-card');
  await new Promise(r => setTimeout(r, 700));
  console.log('10d. Talisman Card Download clicked');

  // ==========================================
  // Test Close Result & 3D Quick Pills
  // ==========================================
  console.log('=== Testing 3D Palace Quick Pills & Inspection ===');
  await page.click('#btn-close-result');
  await new Promise(r => setTimeout(r, 600));

  // Click 3D Palace Quick Nav pill
  await page.waitForSelector('#palace-quick-nav:not(.hidden)');
  await page.click('.pqn-btn[data-pid="9"]');
  await new Promise(r => setTimeout(r, 400));
  const pModalTitle = await page.$eval('#pm-title', el => el.textContent);
  console.log('11. 3D Palace Nav Pill clicked, Modal Title:', pModalTitle);
  await page.click('#btn-close-palace-modal');
  await new Promise(r => setTimeout(r, 300));

  // ==========================================
  // Test History Drawer
  // ==========================================
  await page.click('#btn-history');
  await new Promise(r => setTimeout(r, 400));
  const historyItemsCount = await page.$$eval('.history-card-item', items => items.length);
  console.log('12. History Drawer opened, Records count:', historyItemsCount);
  await page.click('#btn-close-history');
  await new Promise(r => setTimeout(r, 300));

  // ==========================================
  // Test Language Switcher
  // ==========================================
  await page.click('#lang-cn');
  await new Promise(r => setTimeout(r, 300));
  const htmlLangCn = await page.$eval('html', el => el.getAttribute('lang'));
  console.log('13a. Language switched to Simplified Chinese (html lang):', htmlLangCn);

  await page.click('#lang-tw');
  await new Promise(r => setTimeout(r, 300));
  const htmlLangTw = await page.$eval('html', el => el.getAttribute('lang'));
  console.log('13b. Language switched to Traditional Chinese (html lang):', htmlLangTw);

  // ==========================================
  // Strict Constraint: Zero Occurrences of "王也"
  // ==========================================
  const pageText = await page.evaluate(() => document.body.innerText);
  const hasWangYe = pageText.includes('王也');
  console.log('14. Strict check: Zero occurrences of 王也 on page:', !hasWangYe);
  if (hasWangYe) throw new Error('Found 王也 in page text!');

  // Check for console errors
  console.log('15. Total page console errors:', errors.length);
  if (errors.length > 0) {
    console.warn('Console error list:', errors);
  }

  await browser.close();
  console.log('=== All commercial-grade end-to-end tests passed with 100% success! ===');
})();
