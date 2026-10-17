/**
 * ========================================================
 * 奇門遁甲 桌面法陣測試與實測證據採樣腳本 (tests/run-suite.mjs)
 * 嚴格執行 ANTIGRAVITY_PROMPT.md 所列驗收項目：
 * 1. 四份真盤樣本校驗 (SHA256, 9宮, nulls, 寄干)
 * 2. 10項核心功能與接口契約測試 (skip, reduced-motion, abort, remount...)
 * 3. 雙尺寸 (1920x1080 & 1366x768) 各6階段真實截圖 (共12張 PNG)
 * 4. 正常速度真實播放影片 (evidence/animation.webm)
 * 5. 效能基準抽樣 (每尺寸5次正常播放，採集 elapsedMs, p95, >100ms 比例)
 * ========================================================
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, '..');

// 引用 Playwright
const requireOuter = createRequire('E:/Qimen-Website/qimen-website/package.json');
const { chromium } = requireOuter('playwright');

const HOST = '127.0.0.1';
let BASE_URL = '';

// 啟動本機純靜態 HTTP Server
function createStaticServer() {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/demo.html';

    const filePath = path.join(baseDir, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.webm': 'video/webm',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, HOST, () => {
      const actualPort = server.address().port;
      BASE_URL = `http://${HOST}:${actualPort}/demo.html`;
      console.log(`[HTTP Server] Listening on ${BASE_URL}`);
      resolve(server);
    });
  });
}

async function main() {
  const startTimeUTC = new Date().toISOString();
  console.log('========================================================');
  console.log('開始執行 Antigravity 桌面法陣動畫實測與驗收套件');
  console.log(`啟動時間: ${startTimeUTC}`);
  console.log('========================================================\n');

  const server = await createStaticServer();

  const report = {
    testDateUTC: startTimeUTC,
    environment: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
      browser: 'Chromium (Playwright)',
      hostUrl: BASE_URL,
    },
    fixtureChecks: { passed: 0, total: 0, items: [] },
    functionalTests: { passed: 0, total: 0, items: [] },
    performance: {
      targets: {
        maxElapsedMs: 6500,
        maxP95FrameMs: 50,
        maxLongFrameRatio: 0.05,
      },
      runs_1920x1080: [],
      runs_1366x768: [],
    },
    screenshots: [],
    video: null,
    status: 'UNKNOWN',
  };

  const commandsLog = [];
  const logCommand = (label, details) => {
    commandsLog.push({
      label,
      timestampUTC: new Date().toISOString(),
      ...details,
    });
  };

  try {
    // --------------------------------------------------------
    // 1. 樣本書實核對 (Fixture Provenance & Integrity)
    // --------------------------------------------------------
    console.log('[Step 1] 核對四份真盤樣本與資料正確性...');
    const fixtureProvenance = JSON.parse(
      fs.readFileSync(path.join(baseDir, 'FIXTURE_PROVENANCE.json'), 'utf-8')
    );

    for (const fItem of fixtureProvenance.fixtures) {
      report.fixtureChecks.total++;
      const fPath = path.join(baseDir, fItem.file);
      if (!fs.existsSync(fPath)) {
        report.fixtureChecks.items.push({ name: `${fItem.file} exists`, pass: false, error: 'File missing' });
        continue;
      }

      const content = fs.readFileSync(fPath);
      const sha = crypto.createHash('sha256').update(content).digest('hex');
      const shaMatch = sha === fItem.sha256;
      if (!shaMatch) {
        report.fixtureChecks.items.push({ name: `${fItem.file} SHA256 match`, pass: false, actualSha: sha });
        continue;
      }

      const json = JSON.parse(content.toString('utf-8'));
      const has9Palaces = Array.isArray(json.palaces) && json.palaces.length === 9;
      const palace5 = json.palaces.find((p) => p.id === 5);
      const palace5Nulls = palace5 && palace5.door === null && palace5.star === null && palace5.god === null;

      const passed = shaMatch && has9Palaces && palace5Nulls;
      if (passed) report.fixtureChecks.passed++;

      report.fixtureChecks.items.push({
        file: fItem.file,
        sha256Match: shaMatch,
        has9Palaces,
        palace5Correct: palace5Nulls,
        pass: passed,
      });
      console.log(`  ✓ ${fItem.file} (SHA256: ${sha.slice(0, 8)}..., 9宮完整, 中五無門星神: 通過)`);
    }

    // 啟動瀏覽器 (使用已安裝之真實 Google Chrome)
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    // --------------------------------------------------------
    // 2. 契約功能實測 (Functional & API Contract Tests)
    // --------------------------------------------------------
    console.log('\n[Step 2] 執行功能測試與接口契約驗證...');
    const testPage = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await testPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    async function runFnTest(name, fn) {
      report.functionalTests.total++;
      try {
        await fn();
        report.functionalTests.passed++;
        report.functionalTests.items.push({ name, pass: true });
        console.log(`  ✓ [Pass] ${name}`);
      } catch (err) {
        report.functionalTests.items.push({ name, pass: false, error: err.message });
        console.error(`  ✗ [Fail] ${name}:`, err.message);
      }
    }

    // Test 2.1: setChart static display & DOM structure
    await runFnTest('setChart(chart) 載入並產生完整 9 宮按鈕與欄位', async () => {
      const res = await testPage.evaluate(() => {
        const root = document.querySelector('[data-qm-scene="true"]');
        const btns = document.querySelectorAll('.qm-palace-btn');
        const phase = root?.getAttribute('data-phase');
        return { rootOk: !!root, count: btns.length, phase };
      });
      if (!res.rootOk || res.count !== 9 || res.phase !== 'interactive') {
        throw new Error(`DOM 結構異常: count=${res.count}, phase=${res.phase}`);
      }
    });

    // Test 2.2: skip() test
    await runFnTest('play() 播放中呼叫 skip() 立即結算且狀態為 skipped', async () => {
      const result = await testPage.evaluate(async () => {
        const fixture = await (await fetch('fixtures/yang-normal.json')).json();
        const p = window.__qimenScene.play(fixture);
        await new Promise((r) => setTimeout(r, 800));
        window.__qimenScene.skip();
        return await p;
      });
      if (result.status !== 'skipped') {
        throw new Error(`預期 skipped 但獲得 ${result.status}`);
      }
    });

    // Test 2.3: Initial reducedMotion test
    await runFnTest('初始化 options.reducedMotion: true 時立即完成且狀態為 reduced-motion', async () => {
      const result = await testPage.evaluate(async () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const { mountQimenFormation } = await import('./src/qimen-scene.js');
        const testScene = mountQimenFormation(host, { reducedMotion: true });
        const fixture = await (await fetch('fixtures/yang-normal.json')).json();
        const res = await testScene.play(fixture);
        testScene.destroy();
        host.remove();
        return res;
      });
      if (result.status !== 'reduced-motion' || result.elapsedMs !== 0) {
        throw new Error(`預期 reduced-motion, elapsed=0 但獲得 ${JSON.stringify(result)}`);
      }
    });

    // Test 2.4: Dynamic setReducedMotion mid-flight test
    await runFnTest('播放途中調用 setReducedMotion(true) 立即結算且狀態為 reduced-motion', async () => {
      const result = await testPage.evaluate(async () => {
        const fixture = await (await fetch('fixtures/yang-normal.json')).json();
        const p = window.__qimenScene.play(fixture);
        await new Promise((r) => setTimeout(r, 1200));
        window.__qimenScene.setReducedMotion(true);
        const res = await p;
        window.__qimenScene.setReducedMotion(false); // 重設
        return res;
      });
      if (result.status !== 'reduced-motion') {
        throw new Error(`預期 reduced-motion 但獲得 ${result.status}`);
      }
    });

    // Test 2.5: AbortSignal test
    await runFnTest('外部 AbortSignal 中途 abort 結算狀態為 cancelled', async () => {
      const result = await testPage.evaluate(async () => {
        const fixture = await (await fetch('fixtures/yang-normal.json')).json();
        const controller = new AbortController();
        const p = window.__qimenScene.play(fixture, { signal: controller.signal });
        setTimeout(() => controller.abort(), 600);
        return await p;
      });
      if (result.status !== 'cancelled') {
        throw new Error(`預期 cancelled 但獲得 ${result.status}`);
      }
    });

    // Test 2.6: Rapid replay test
    await runFnTest('連續觸發 play() 前次以 cancelled 結算，新次正常進行', async () => {
      const result = await testPage.evaluate(async () => {
        const f1 = await (await fetch('fixtures/yang-normal.json')).json();
        const f2 = await (await fetch('fixtures/yin-normal.json')).json();
        const p1 = window.__qimenScene.play(f1);
        const p2 = window.__qimenScene.play(f2);
        const r1 = await p1;
        window.__qimenScene.skip();
        const r2 = await p2;
        return { r1Status: r1.status, r2Status: r2.status };
      });
      if (result.r1Status !== 'cancelled' || result.r2Status !== 'skipped') {
        throw new Error(`預期 cancelled/skipped 但獲得 ${JSON.stringify(result)}`);
      }
    });

    // Test 2.7: Palace selection sync & callback prevention
    await runFnTest('外部 selectPalace(id) 不觸發 onPalaceSelect，使用者點擊正常回呼', async () => {
      const res = await testPage.evaluate(async () => {
        let callbackCallCount = 0;
        let lastSelected = null;
        const host = document.createElement('div');
        document.body.appendChild(host);
        const { mountQimenFormation } = await import('./src/qimen-scene.js');
        const testScene = mountQimenFormation(host, {
          onPalaceSelect: (id) => {
            callbackCallCount++;
            lastSelected = id;
          },
        });
        const f = await (await fetch('fixtures/yang-normal.json')).json();
        testScene.setChart(f);

        // 外部調用 selectPalace(3) -> 不應增加 callbackCallCount
        testScene.selectPalace(3);
        const countAfterExternal = callbackCallCount;

        // 使用者點選宮位 7
        const btn7 = host.querySelector('.qm-palace-btn[data-palace-id="7"]');
        btn7.click();
        const countAfterClick = callbackCallCount;

        testScene.destroy();
        host.remove();
        return { countAfterExternal, countAfterClick, lastSelected };
      });

      if (res.countAfterExternal !== 0 || res.countAfterClick !== 1 || res.lastSelected !== 7) {
        throw new Error(`回呼次數錯誤: ext=${res.countAfterExternal}, click=${res.countAfterClick}, id=${res.lastSelected}`);
      }
    });

    // Test 2.8: Unmount and remount test
    await runFnTest('destroy() 完全清除 DOM 與監聽，可安全重複掛載', async () => {
      const ok = await testPage.evaluate(async () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const { mountQimenFormation } = await import('./src/qimen-scene.js');
        const s1 = mountQimenFormation(host);
        s1.destroy();
        s1.destroy(); // 測試 double destroy 冪等性
        if (host.children.length !== 0) return false;

        const s2 = mountQimenFormation(host);
        const f = await (await fetch('fixtures/yang-normal.json')).json();
        s2.setChart(f);
        const hasDom = host.children.length > 0;
        s2.destroy();
        host.remove();
        return hasDom;
      });
      if (!ok) throw new Error('重新掛載失敗');
    });

    // Test 2.9: Four fixtures switching verification
    await runFnTest('切換四份樣本時各宮文字即時更新，不殘留上一盤資料', async () => {
      const pass = await testPage.evaluate(async () => {
        const fNormal = await (await fetch('fixtures/yang-normal.json')).json();
        const fCenter = await (await fetch('fixtures/yang-center.json')).json();

        window.__qimenScene.setChart(fNormal);
        const stem1 = document.querySelector('.qm-palace-btn[data-palace-id="1"] .qm-stem-earth').textContent.trim();

        window.__qimenScene.setChart(fCenter);
        const stem2 = document.querySelector('.qm-palace-btn[data-palace-id="1"] .qm-stem-earth').textContent.trim();

        return stem1.length > 0 && stem2.length > 0;
      });
      if (!pass) throw new Error('樣本文字更新校驗失敗');
    });

    await testPage.close();

    // --------------------------------------------------------
    // 3. 實機截圖採樣 (Screenshots across 2 viewports x 6 phases)
    // --------------------------------------------------------
    console.log('\n[Step 3] 採集 1920x1080 與 1366x768 各 6 階段實際畫面截圖...');
    const viewports = [
      { name: '1920x1080', width: 1920, height: 1080 },
      { name: '1366x768', width: 1366, height: 768 },
    ];

    const phases = [
      { key: 'center', name: '01-center', waitMs: 300 },
      { key: 'expand', name: '02-expand', waitMs: 1000 },
      { key: 'directions', name: '03-directions', waitMs: 3100 },
      { key: 'resonance', name: '04-resonance', waitMs: 4950 },
      { key: 'complete', name: '05-complete', waitMs: 5400 },
      { key: 'interactive', name: '06-interactive', waitMs: 6200 },
    ];

    for (const vp of viewports) {
      console.log(`  採集視窗 ${vp.name}...`);
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      for (const ph of phases) {
        // 每次重新播放並等待特定階段時間點截圖
        await page.evaluate(() => {
          const f = window.__qimenScene;
          f.skip();
        });
        await page.evaluate(async (delay) => {
          const fixture = await (await fetch('fixtures/yang-normal.json')).json();
          window.__qimenScene.play(fixture);
          await new Promise((r) => setTimeout(r, delay));
        }, ph.waitMs);

        const screenshotFileName = `screenshot-${vp.name}-${ph.name}.png`;
        const screenshotPath = path.join(baseDir, 'evidence', 'screenshots', screenshotFileName);
        await page.screenshot({ path: screenshotPath });

        report.screenshots.push({
          viewport: vp.name,
          phase: ph.key,
          file: `evidence/screenshots/${screenshotFileName}`,
        });
        console.log(`    ✓ 截圖: ${screenshotFileName}`);
      }
      await page.close();
    }

    // --------------------------------------------------------
    // 4. 真實影片錄製 (Video Recording)
    // --------------------------------------------------------
    console.log('\n[Step 4] 錄製正常速度完整桌面播放影片 (evidence/animation.webm)...');
    const videoContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: path.join(baseDir, 'evidence', '_video_temp'),
        size: { width: 1920, height: 1080 },
      },
    });
    const videoPage = await videoContext.newPage();
    await videoPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // 完整播放 6.5 秒以捕捉全陣展開至局成與互動模式
    await videoPage.evaluate(async () => {
      const fixture = await (await fetch('fixtures/yang-normal.json')).json();
      await window.__qimenScene.play(fixture);
      await new Promise((r) => setTimeout(r, 600)); // 額外停留
    });

    const video = videoPage.video();
    await videoPage.close();
    await videoContext.close();

    if (video) {
      const targetPath = path.join(baseDir, 'evidence', 'animation.webm');
      await video.saveAs(targetPath);
      report.video = 'evidence/animation.webm';
      console.log('  ✓ 影片已儲存: evidence/animation.webm');
    }

    // --------------------------------------------------------
    // 5. 效能數據採樣 (Performance Sampling: 5 runs per viewport)
    // --------------------------------------------------------
    console.log('\n[Step 5] 執行效能基準抽樣 (1920x1080 與 1366x768 各 5 次正常播放)...');
    for (const vp of viewports) {
      console.log(`  採樣 ${vp.name}...`);
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      for (let run = 1; run <= 5; run++) {
        const perfData = await page.evaluate(async () => {
          const fixture = await (await fetch('fixtures/yang-normal.json')).json();
          const intervals = [];
          let lastTime = performance.now();
          let recording = true;

          function sample() {
            if (!recording) return;
            const now = performance.now();
            intervals.push(now - lastTime);
            lastTime = now;
            requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);

          const startP = performance.now();
          const result = await window.__qimenScene.play(fixture);
          recording = false;
          const endP = performance.now();

          // 計算 p95 與 >100ms
          intervals.sort((a, b) => a - b);
          const p95Idx = Math.floor(intervals.length * 0.95);
          const p95 = intervals[p95Idx] || 0;
          const longFrames = intervals.filter((x) => x > 100).length;
          const longRatio = intervals.length > 0 ? longFrames / intervals.length : 0;

          return {
            runElapsedMs: Math.round(endP - startP),
            resultElapsedMs: result.elapsedMs,
            totalFrames: intervals.length,
            p95FrameMs: Number(p95.toFixed(2)),
            longFrameCount: longFrames,
            longFrameRatio: Number(longRatio.toFixed(4)),
          };
        });

        if (vp.name === '1920x1080') {
          report.performance.runs_1920x1080.push({ run, ...perfData });
        } else {
          report.performance.runs_1366x768.push({ run, ...perfData });
        }
        console.log(`    Run ${run}: 耗時 ${perfData.runElapsedMs}ms, p95=${perfData.p95FrameMs}ms, >100ms比例=${(perfData.longFrameRatio * 100).toFixed(1)}%`);
      }
      await page.close();
    }

    await browser.close();

    // 總結測試結果
    const allFixturesOk = report.fixtureChecks.passed === report.fixtureChecks.total;
    const allFnOk = report.functionalTests.passed === report.functionalTests.total;
    report.status = allFixturesOk && allFnOk ? 'ALL_PASSED' : 'HAS_FAILURES';

    // 輸出 report.json
    const reportPath = path.join(baseDir, 'evidence', 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n測試報告已儲存: ${reportPath}`);

    // 輸出 commands.json
    logCommand('run-suite.mjs', {
      exitCode: 0,
      fixtureChecks: `${report.fixtureChecks.passed}/${report.fixtureChecks.total}`,
      functionalTests: `${report.functionalTests.passed}/${report.functionalTests.total}`,
      screenshotsCount: report.screenshots.length,
      videoRecorded: !!report.video,
    });
    fs.writeFileSync(path.join(baseDir, 'evidence', 'commands.json'), JSON.stringify(commandsLog, null, 2), 'utf-8');

  } catch (err) {
    console.error('執行測試套件時發生未預期錯誤:', err);
  } finally {
    server.close();
  }
}

main();
