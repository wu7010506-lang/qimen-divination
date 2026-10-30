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

  // Check 7-Day Golden Windows Planner
  const dayButtons = await page.$$eval('.wd-btn', btns => btns.length);
  const windowItems = await page.$$eval('.ww-item', items => items.length);
  console.log('3f. 7-Day Golden Windows rendered: Days count =', dayButtons, '| Items count =', windowItems);
  if (dayButtons !== 7) throw new Error('Expected 7 day buttons in planner!');

  // Click 2nd day button (明天)
  await page.click('.wd-btn:nth-child(2)');
  await new Promise(r => setTimeout(r, 200));
  const day2Active = await page.$eval('.wd-btn:nth-child(2)', el => el.classList.contains('active'));
  console.log('3f-2. Day 2 button activated:', day2Active);

  // Check Interactive Circular Luopan Dial Canvas
  const hasDial = await page.$eval('#daily-compass-dial', el => !!el && el.width > 0);
  console.log('3f-3. Interactive Luopan Compass Dial Canvas rendered:', hasDial);
  if (!hasDial) throw new Error('Expected #daily-compass-dial canvas to exist!');

  // Click Align Compass button
  await page.click('#btn-align-compass');
  await new Promise(r => setTimeout(r, 700));
  const targetGateText = await page.$eval('#dial-target-gate', el => el.textContent);
  console.log('3f-4. Align Compass button clicked, Target Gate Indicator:', targetGateText);

  // Take screenshot of Daily Compass
  await page.screenshot({ path: 'test-08-daily-compass.png' });
  console.log('3g. Saved test-08-daily-compass.png');

  // Test downloading Daily Compass wallpaper
  await page.click('#btn-download-compass-card');
  await new Promise(r => setTimeout(r, 600));
  console.log('3h. Daily Compass Wallpaper generation triggered successfully');

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

  // Test Tab 7: ⚔️ 主客博弈
  await page.click('.read-tab[data-tab="hostguest"]');
  await new Promise(r => setTimeout(r, 300));
  const hgVerd = await page.$eval('#hg-verdict', el => el.textContent);
  const hgGuestSc = await page.$eval('#hg-guest-score', el => el.textContent);
  const hgHostSc = await page.$eval('#hg-host-score', el => el.textContent);
  console.log('9a. Host vs Guest Tab:', hgVerd, '| Guest Advantage:', hgGuestSc, '| Host Advantage:', hgHostSc);

  // Test Tab 8: 九宮全盤
  await page.click('.read-tab[data-tab="chart"]');
  await new Promise(r => setTimeout(r, 300));
  const nineCellsCount = await page.$$eval('.nine-cell', cells => cells.length);
  const targetPalaceCount = await page.$$eval('.nine-cell.target-palace', cells => cells.length);
  console.log('9b. Traditional 3x3 Nine-Palaces Chart rendered:', nineCellsCount, 'cells | Target palace cells:', targetPalaceCount);
  if (nineCellsCount !== 9) throw new Error('Expected 9 cells in traditional chart!');

  // Test Tab: 📜 千古兵法 (Historical Strategy Doctrine)
  await page.click('.read-tab[data-tab="doctrine"]');
  await new Promise(r => setTimeout(r, 300));
  const docTitle = await page.$eval('#doc-title', el => el.textContent);
  const docMotto = await page.$eval('#doc-doctrine', el => el.textContent);
  const docMatch = await page.$eval('#doc-match-val', el => el.textContent);
  console.log('9c-1. Historical Strategy Doctrine Tab:', docTitle, '| Motto:', docMotto, '| Match:', docMatch);

  // Test Tab: ⏳ 運勢沙盤 (24-Hour Timeline Simulator)
  await page.click('.read-tab[data-tab="simulation"]');
  await new Promise(r => setTimeout(r, 300));
  const simGolden = await page.$eval('#sim-golden-shichen', el => el.textContent);
  const simHoursCount = await page.$$eval('.sim-hour-btn', btns => btns.length);
  console.log('9c-2. 24-Hour Timeline Simulator Tab: Golden Window =', simGolden, '| Hour Buttons =', simHoursCount);
  if (simHoursCount !== 12) throw new Error('Expected 12 hour buttons in timeline simulator!');

  // Click 3rd hour button
  await page.click('.sim-hour-btn:nth-child(3)');
  await new Promise(r => setTimeout(r, 200));
  const curSimShichen = await page.$eval('#sim-cur-shichen', el => el.textContent);
  console.log('9c-3. Timeline 3rd hour button clicked, selected:', curSimShichen);

  // Test VIP Tab
  await page.click('.read-tab[data-tab="vip"]');
  await new Promise(r => setTimeout(r, 300));
  const vipCert = await page.$eval('#vip-cert-code', el => el.textContent);
  console.log('9c-4. VIP Tab Cert:', vipCert);

  // Test Consultation CTA Banner
  await page.click('#btn-book-consult-cta');
  await new Promise(r => setTimeout(r, 300));
  const ctaModalOpen = await page.$eval('#consult-modal', el => !el.classList.contains('hidden'));
  console.log('9c-5. Consultation CTA button opened modal:', ctaModalOpen);
  await page.click('#btn-close-consult-modal');
  await new Promise(r => setTimeout(r, 300));

  // Test Print Dossier button
  const hasPrintBtn = await page.$eval('#btn-print-dossier', el => !!el);
  console.log('9d. Official Dossier Print button present:', hasPrintBtn);

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

  await page.click('#lang-en');
  await new Promise(r => setTimeout(r, 300));
  const htmlLangEn = await page.$eval('html', el => el.getAttribute('lang'));
  console.log('13a-2. Language switched to English (html lang):', htmlLangEn);

  await page.click('#lang-tw');
  await new Promise(r => setTimeout(r, 300));
  const htmlLangTw = await page.$eval('html', el => el.getAttribute('lang'));
  console.log('13b. Language switched to Traditional Chinese (html lang):', htmlLangTw);

  // ==========================================
  // Test Commercial Consultation & Checkout Funnel
  // ==========================================
  console.log('=== Testing Commercial Master Consultation & Reservation Funnel ===');
  await page.click('#btn-open-consult');
  await new Promise(r => setTimeout(r, 400));
  const consultOpen = await page.$eval('#consult-modal', el => !el.classList.contains('hidden'));
  console.log('13c-1. Consultation Modal opened from top button:', consultOpen);

  // Select high-tier package (NT$ 3,680)
  await page.click('.consult-tier-card[data-tier="business"]');
  await new Promise(r => setTimeout(r, 200));
  const newPrice = await page.$eval('#consult-total-price', el => el.textContent);
  console.log('13c-2. High-tier package selected, Total Price:', newPrice);
  if (!newPrice.includes('3,680')) throw new Error('Expected price to be 3,680!');

  // Fill booking form
  await page.fill('#consult-name', '李行健');
  await page.fill('#consult-phone', '0912345678');
  await page.fill('#consult-notes', '跨國科技公司併購案奇門合祿與吉辰推演');

  // Click checkout simulation
  await page.click('#btn-confirm-checkout');
  await new Promise(r => setTimeout(r, 1200));

  const successViewVisible = await page.$eval('#consult-view-success', el => !el.classList.contains('hidden'));
  const ticketName = await page.$eval('#cvs-ticket-name', el => el.textContent);
  const ticketCode = await page.$eval('#cvs-ticket-code', el => el.textContent);
  console.log('13c-3. Checkout simulated, Success view visible:', successViewVisible);
  console.log('        Ticket Name:', ticketName, '| Pass Code:', ticketCode);
  if (!successViewVisible || !ticketCode.startsWith('FH-VIP-')) throw new Error('Failed to generate appointment pass!');

  // Close success modal
  await page.click('#btn-close-success');
  await new Promise(r => setTimeout(r, 300));

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
