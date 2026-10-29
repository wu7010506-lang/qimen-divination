/**
 * ========================================================
 * 奇門遁甲 · 風後奇門占卜堂
 * 商業級核心應用控制器 (app.js)
 * 流程：齋主祈願 -> 踏定中宮起局 -> 3D神域天象展開 -> 五維全息解盤 -> 靈符金卡導出
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('qimen-canvas');
  const renderer = new QimenRenderer(canvas);
  const divination = window.divinationEngine;

  // DOM 核心元素
  const inquiryContainer = document.getElementById('inquiry-container');
  const questionInput = document.getElementById('question-input');
  const categoryTabs = document.querySelectorAll('.cat-tab');
  const quickTags = document.querySelectorAll('.quick-tag');
  const btnCastFortune = document.getElementById('btn-cast-fortune');

  // 齋主祈願設定元素
  const btnToggleProfile = document.getElementById('btn-toggle-profile');
  const profileBox = document.getElementById('profile-box');
  const profileArrow = document.getElementById('profile-arrow');
  const inputAskerName = document.getElementById('input-asker-name');
  const selectAskerGender = document.getElementById('select-asker-gender');
  const selectDivineMode = document.getElementById('select-divine-mode');

  // 電影級橫幅
  const cinematicBanner = document.getElementById('cinematic-banner');
  const bannerTitle = document.getElementById('banner-title');
  const bannerSub = document.getElementById('banner-sub');

  // 解盤卷軸元素
  const resultContainer = document.getElementById('result-container');
  const btnCloseResult = document.getElementById('btn-close-result');
  const btnReAsk = document.getElementById('btn-re-ask');
  const btnCopyResult = document.getElementById('btn-copy-result');
  const btnDownloadCard = document.getElementById('btn-download-card');

  // 頂部導航按鈕
  const btnReaskTop = document.getElementById('btn-reask-top');
  const btnToggleResultTop = document.getElementById('btn-toggle-result-top');
  const btnAmbient = document.getElementById('btn-ambient');
  const ambientIcon = document.getElementById('ambient-icon');
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  const btnHistory = document.getElementById('btn-history');

  // 命譜抽屜元素
  const historyOverlay = document.getElementById('history-overlay');
  const btnCloseHistory = document.getElementById('btn-close-history');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  const toast = document.getElementById('toast');

  let currentCategory = 'career';
  let currentReading = null;
  let isCasting = false;

  // 提示彈出函式
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // 1. 齋主祈願折疊切換
  if (btnToggleProfile && profileBox) {
    btnToggleProfile.addEventListener('click', () => {
      const isHidden = profileBox.classList.contains('hidden');
      profileBox.classList.toggle('hidden', !isHidden);
      if (profileArrow) {
        profileArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  // 2. 分類標籤點擊切換
  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-cat') || 'career';
    });
  });

  // 3. 快捷常見問題標籤點擊填入
  quickTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const q = tag.getAttribute('data-q');
      if (q && questionInput) {
        questionInput.value = q;
        questionInput.focus();
      }
    });
  });

  // 4. 鍵盤事件：按下 Enter 觸發起局 (Shift+Enter 換行)
  if (questionInput) {
    questionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        triggerDivination();
      }
    });
    setTimeout(() => questionInput.focus(), 300);
  }

  // 5. 起局問卜核心觸發
  function triggerDivination() {
    if (isCasting) return;
    const question = questionInput.value.trim() || '心念所向 · 當前局勢探尋';
    isCasting = true;

    // 播放起局重擊音效
    if (window.soundEngine) {
      window.soundEngine.playStomp();
      window.soundEngine.playDiskSpin();
    }

    // 獲取齋主自訂參數
    const userProfile = {
      name: inputAskerName ? inputAskerName.value.trim() : '',
      gender: selectAskerGender ? selectAskerGender.value : 'male',
      mode: selectDivineMode ? selectDivineMode.value : 'time'
    };

    // 淡出輸入卡片，展現全幅 3D 奇門神域
    inquiryContainer.classList.add('hidden');
    cinematicBanner.classList.add('visible');
    bannerTitle.textContent = `【踏定中宮 · 步罡起局】`;
    bannerSub.textContent = `求問：${question}`;

    // 進行專業奇門遁甲演局計算
    const reading = divination.castBureau(question, currentCategory, userProfile);
    currentReading = reading;

    // 啟動 3D 電影級起局動畫流程 (0~5.6s)
    renderer.startDivinationCasting(reading, {
      onPhase: (phase, text) => {
        if (phase === 'stomp') {
          bannerTitle.textContent = `【踏定中宮 · 步罡起局】`;
          bannerSub.textContent = `求問：${question}`;
        } else if (phase === 'expand') {
          bannerTitle.textContent = `【向外展環 · 渾天立體】`;
          bannerSub.textContent = `二十四山風水盤 · 九字真言符籙 · 後天八卦爻象`;
        } else if (phase === 'directions') {
          bannerTitle.textContent = `【八方啟動 · 沖天靈光】`;
          bannerSub.textContent = `人盤八門 · 天盤九星 · 神盤八神 · 星宿天索立柱`;
        } else if (phase === 'resonance') {
          bannerTitle.textContent = `【全盤共鳴 · 鎖定落宮】`;
          bannerSub.textContent = `感應落宮：${reading.palace.name} · ${reading.formation.name}顯格`;
          if (window.soundEngine) window.soundEngine.playPalaceLock();
        } else if (phase === 'complete') {
          bannerTitle.textContent = `【局成 · ${reading.outcome.verdict}】`;
          bannerSub.textContent = `${reading.astro.bureauName} · ${reading.palace.name} · ${reading.gate.name}`;
        }
      },
      onComplete: () => {
        isCasting = false;
        cinematicBanner.classList.remove('visible');

        // 渲染並展現解盤卷軸卡片
        displayReadingResult(reading);
        resultContainer.classList.add('active');

        if (btnReaskTop) btnReaskTop.classList.remove('hidden');
        if (btnToggleResultTop) btnToggleResultTop.classList.remove('hidden');

        if (window.soundEngine) {
          window.soundEngine.playRingExpand(6);
        }
      }
    });
  }

  if (btnCastFortune) {
    btnCastFortune.addEventListener('click', triggerDivination);
  }

  // 6. 渲染解盤結果至卷軸
  function displayReadingResult(reading) {
    // 天文曆法四柱標籤
    const elAstroPillars = document.getElementById('res-astro-pillars');
    if (elAstroPillars) elAstroPillars.textContent = `歲次${reading.astro.yearPillar} ${reading.astro.monthPillar} ${reading.astro.dayPillar} ${reading.astro.hourPillar}`;

    const elAstroBureau = document.getElementById('res-astro-bureau');
    if (elAstroBureau) elAstroBureau.textContent = reading.astro.bureauName;

    const elAstroVoid = document.getElementById('res-astro-void');
    if (elAstroVoid) elAstroVoid.textContent = `旬空：${reading.astro.voidPalaces} · 馬星：${reading.astro.horseStar}`;

    // 齋主抬頭
    const elAskerLine = document.getElementById('res-asker-line');
    if (elAskerLine) elAskerLine.textContent = `齋主【${reading.askerTitle}】 · 敬稟四盤`;

    // 吉凶定語與籤詩
    const resGrade = document.getElementById('res-grade');
    resGrade.textContent = reading.outcome.verdict;
    resGrade.style.borderColor = reading.outcome.color;
    resGrade.style.color = reading.outcome.color;

    document.getElementById('res-question').textContent = `求問之事：${reading.question}`;
    document.getElementById('res-poem').textContent = reading.poem;

    // 特殊格局橫幅
    const elFormName = document.getElementById('res-form-name');
    const elFormDesc = document.getElementById('res-form-desc');
    if (elFormName) elFormName.textContent = `【${reading.formation.name}】`;
    if (elFormDesc) elFormDesc.textContent = `${reading.formation.desc}`;

    // 四盤落宮概要
    document.getElementById('res-palace').textContent = `${reading.palace.name} (${reading.palace.direction})`;
    document.getElementById('res-palace-elem').textContent = `五行：${reading.palace.element} · ${reading.palace.nature}`;

    document.getElementById('res-gate').textContent = `${reading.gate.name} (${reading.gate.type})`;
    document.getElementById('res-gate-desc').textContent = reading.gate.desc;

    document.getElementById('res-star').textContent = `${reading.star.name} (${reading.star.type})`;
    document.getElementById('res-star-desc').textContent = reading.star.desc;

    document.getElementById('res-deity').textContent = `${reading.deity.name} (${reading.deity.type})`;
    document.getElementById('res-deity-desc').textContent = reading.deity.desc;

    // 1. 四盤天機
    document.getElementById('res-tian').textContent = reading.analysis.tian;
    document.getElementById('res-di').textContent = reading.analysis.di;
    document.getElementById('res-ren').textContent = reading.analysis.ren;
    document.getElementById('res-shen').textContent = reading.analysis.shen;

    // 2. 盲點癥結
    const elBlindRoot = document.getElementById('blind-root');
    const elBlindCounter = document.getElementById('blind-counter');
    const elBlindAwake = document.getElementById('blind-awakening');
    if (elBlindRoot) elBlindRoot.textContent = reading.blindspot.root;
    if (elBlindCounter) elBlindCounter.textContent = reading.blindspot.counterparty;
    if (elBlindAwake) elBlindAwake.textContent = reading.blindspot.awakening;

    // 3. 時序應期
    const elTimingDesc = document.getElementById('timing-desc');
    const elTimingNear = document.getElementById('timing-near');
    const elTimingMid = document.getElementById('timing-mid');
    const elTimingHours = document.getElementById('timing-hours');
    if (elTimingDesc) elTimingDesc.textContent = reading.timing.yingQiDesc;
    if (elTimingNear) elTimingNear.textContent = reading.timing.near;
    if (elTimingMid) elTimingMid.textContent = reading.timing.mid;
    if (elTimingHours) elTimingHours.textContent = reading.timing.hours;

    // 4. 破局之策
    document.getElementById('strat-dir').textContent = reading.strategy.direction;
    const elStratColor = document.getElementById('strat-color');
    const elStratItem = document.getElementById('strat-item');
    const elStratNum = document.getElementById('strat-num');
    if (elStratColor) elStratColor.textContent = reading.strategy.color;
    if (elStratItem) elStratItem.textContent = reading.strategy.item;
    if (elStratNum) elStratNum.textContent = reading.strategy.luckyNumber;

    document.getElementById('strat-mind').textContent = reading.strategy.mindset;

    const elStratUpper = document.getElementById('strat-upper');
    const elStratMiddle = document.getElementById('strat-middle');
    const elStratLower = document.getElementById('strat-lower');
    if (elStratUpper) elStratUpper.textContent = reading.strategy.tactics.upper;
    if (elStratMiddle) elStratMiddle.textContent = reading.strategy.tactics.middle;
    if (elStratLower) elStratLower.textContent = reading.strategy.tactics.lower;

    // 5. 易象神數
    const elHexName = document.getElementById('hex-name');
    const elHexKw = document.getElementById('hex-kw');
    const elHexDesc = document.getElementById('hex-desc');
    const elQuote = document.getElementById('res-quote');
    if (elHexName) elHexName.textContent = reading.hexagram.name;
    if (elHexKw) elHexKw.textContent = reading.hexagram.keywords;
    if (elHexDesc) elHexDesc.textContent = reading.hexagram.desc;
    if (elQuote) elQuote.textContent = reading.quote;

    // 6. VIP 尊享深度錦囊
    const vip = reading.vipPackage;
    if (vip) {
      const setBar = (id, scoreId, score) => {
        const bar = document.getElementById(id);
        const sc = document.getElementById(scoreId);
        if (bar) bar.style.width = `${score}%`;
        if (sc) sc.textContent = `${score}分`;
      };
      setBar('bar-tian', 'score-tian', vip.radar.tian);
      setBar('bar-di', 'score-di', vip.radar.di);
      setBar('bar-ren', 'score-ren', vip.radar.ren);
      setBar('bar-shen', 'score-shen', vip.radar.shen);
      setBar('bar-timing', 'score-timing', vip.radar.timing);

      const elAxiom = document.getElementById('vip-axiom');
      if (elAxiom) elAxiom.textContent = vip.masterAxiom;

      const elTaboos = document.getElementById('vip-taboos');
      if (elTaboos) {
        elTaboos.innerHTML = '';
        vip.taboos.forEach(t => {
          const li = document.createElement('li');
          li.textContent = t;
          elTaboos.appendChild(li);
        });
      }

      const elCert = document.getElementById('vip-cert-code');
      if (elCert) elCert.textContent = vip.certificateCode;
    }

    // 預設切換至第一分頁
    switchResultTab('analysis');
  }

  // 解盤分頁切換
  const readTabs = document.querySelectorAll('.read-tab');
  readTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      switchResultTab(target);
    });
  });

  function switchResultTab(tabName) {
    readTabs.forEach((t) => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.tab-content').forEach((c) => {
      c.classList.toggle('active', c.id === `tab-${tabName}`);
    });
  }

  // 7. 暫時收起解盤卡片，觀賞或互動 3D 常態活局
  if (btnCloseResult) {
    btnCloseResult.addEventListener('click', () => {
      resultContainer.classList.remove('active');
      showToast('✨ 卷軸已暫時收起，可隨意以滑鼠 3D 旋轉/縮放觀看神域活局');
    });
  }

  // 點擊頂部「查看解盤」重新展開
  if (btnToggleResultTop) {
    btnToggleResultTop.addEventListener('click', () => {
      if (currentReading) {
        resultContainer.classList.add('active');
      }
    });
  }

  // 8. 重新起局問卜 (再問一局)
  function handleReAsk() {
    resultContainer.classList.remove('active');
    cinematicBanner.classList.remove('visible');
    if (btnReaskTop) btnReaskTop.classList.add('hidden');
    if (btnToggleResultTop) btnToggleResultTop.classList.add('hidden');

    renderer.resetFormation();
    inquiryContainer.classList.remove('hidden');
    questionInput.value = '';
    setTimeout(() => questionInput.focus(), 400);
  }

  if (btnReAsk) btnReAsk.addEventListener('click', handleReAsk);
  if (btnReaskTop) btnReaskTop.addEventListener('click', handleReAsk);

  // 9. 複製占卜全策密函
  if (btnCopyResult) {
    btnCopyResult.addEventListener('click', () => {
      if (!currentReading) return;
      const r = currentReading;
      const summary = `【奇門遁甲 · 風後神域全息占卜密函】\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `齋主：${r.askerTitle}\n` +
        `求問事項：${r.question}\n` +
        `天干四柱：${r.astro.pillars}（${r.astro.bureauName}）\n` +
        `占卜定語：${r.outcome.verdict}\n` +
        `顯化吉格：【${r.formation.name}】（${r.formation.desc}）\n` +
        `四盤格局：${r.palace.name}（${r.palace.direction}）· 人盤【${r.gate.name}】· 天盤【${r.star.name}】· 神盤【${r.deity.name}】\n` +
        `籤詩靈韻：${r.poem}\n` +
        `易經互應：【${r.hexagram.name}】（${r.hexagram.keywords}）\n` +
        `時序應期：${r.timing.yingQiDesc}\n` +
        `貴人方位：${r.strategy.direction}\n` +
        `開運色調：${r.strategy.color} · 隨身物象：${r.strategy.item}\n` +
        `破局心法：${r.strategy.mindset}\n` +
        `大師金口：${r.vipPackage.masterAxiom}\n` +
        `防偽編號：${r.vipPackage.certificateCode}\n` +
        `占卜時間：${r.time}\n` +
        `━━━━━━━━━━━━━━━━━━━━`;

      navigator.clipboard.writeText(summary).then(() => {
        showToast('✨ 占卜全策密函已成功複製至剪貼簿！');
      }).catch(() => {
        showToast('複製失敗，請手動選取文字');
      });
    });
  }

  // 10. 生成並下載 1080x1920 高清黑金結緣海報 (Poster Canvas)
  if (btnDownloadCard) {
    btnDownloadCard.addEventListener('click', () => {
      if (!currentReading) return;
      generateTalismanPoster(currentReading);
    });
  }

  function generateTalismanPoster(reading) {
    showToast('⏳ 正在以道門神數描繪 1080x1920 高清靈符金卡...');
    const posterCanvas = document.getElementById('poster-canvas');
    if (!posterCanvas) return;
    const ctx = posterCanvas.getContext('2d');
    const W = 1080;
    const H = 1920;

    // 1. 底色：玄黑水墨與暗金放射漸層
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 900);
    bgGrad.addColorStop(0, '#1c1f2e');
    bgGrad.addColorStop(0.6, '#0f121d');
    bgGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. 邊框裝飾：雙層奢華金線與祥雲角飾
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    ctx.strokeStyle = 'rgba(245, 197, 66, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    // 四角金剛結符號
    const drawCorner = (x, y) => {
      ctx.save();
      ctx.strokeStyle = '#f5c542';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(50, 50);
    drawCorner(W - 50, 50);
    drawCorner(50, H - 50);
    drawCorner(W - 50, H - 50);

    // 3. 頂部符頭與道教印記
    ctx.fillStyle = '#f5c542';
    ctx.font = 'bold 38px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 敕令 · 奇門遁甲風後神域 ⚡', W / 2, 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px "Noto Serif TC", serif';
    ctx.fillText(`天地人神四盤全息符卷 · ${reading.astro.bureauName}`, W / 2, 175);

    // 4. 朱砂紅印「風後奇門」
    ctx.save();
    ctx.fillStyle = 'rgba(197, 48, 48, 0.85)';
    ctx.fillRect(W - 170, 90, 80, 80);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.strokeRect(W - 170, 90, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Ma Shan Zheng", serif';
    ctx.fillText('風後', W - 130, 125);
    ctx.fillText('奇門', W - 130, 155);
    ctx.restore();

    // 5. 齋主與求問之事卡片
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(90, 220, W - 180, 160);
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.25)';
    ctx.strokeRect(90, 220, W - 180, 160);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Serif TC", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`齋主：${reading.askerTitle}`, 120, 270);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '28px "Noto Serif TC", serif';
    ctx.fillText(`求問：${reading.question}`, 120, 320);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Noto Serif TC", serif';
    ctx.fillText(`天干四柱：${reading.astro.pillars} (旬空：${reading.astro.voidPalaces})`, 120, 355);

    // 6. 格局定語大徽章
    ctx.textAlign = 'center';
    ctx.fillStyle = reading.outcome.color;
    ctx.font = 'bold 64px "Ma Shan Zheng", serif';
    ctx.fillText(`【 ${reading.outcome.verdict} 】`, W / 2, 460);

    // 特殊大格
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px "Ma Shan Zheng", serif';
    ctx.fillText(`顯化吉格：${reading.formation.name} · ${reading.formation.tags.join(' ')}`, W / 2, 520);

    // 7. 籤詩書法金字
    ctx.fillStyle = '#fef08a';
    ctx.font = 'italic 34px "Ma Shan Zheng", serif';
    ctx.fillText(`「 ${reading.poem} 」`, W / 2, 580);

    // 8. 四盤九宮矩陣展示
    const boxW = 210;
    const boxH = 140;
    const startX = (W - (boxW * 4 + 30 * 3)) / 2;
    const cards = [
      { label: '地盤 · 落宮', main: reading.palace.name, sub: `五行屬${reading.palace.element} · ${reading.palace.direction}` },
      { label: '人盤 · 八門', main: reading.gate.name, sub: reading.gate.type },
      { label: '天盤 · 九星', main: reading.star.name, sub: reading.star.type },
      { label: '神盤 · 八神', main: reading.deity.name, sub: reading.deity.type }
    ];

    cards.forEach((c, idx) => {
      const cx = startX + idx * (boxW + 30);
      const cy = 630;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(cx, cy, boxW, boxH);
      ctx.strokeStyle = 'rgba(245, 197, 66, 0.3)';
      ctx.strokeRect(cx, cy, boxW, boxH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px "Noto Serif TC", serif';
      ctx.fillText(c.label, cx + boxW / 2, cy + 38);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Noto Serif TC", serif';
      ctx.fillText(c.main, cx + boxW / 2, cy + 85);

      ctx.fillStyle = '#f5c542';
      ctx.font = '20px "Noto Serif TC", serif';
      ctx.fillText(c.sub, cx + boxW / 2, cy + 120);
    });

    // 9. 核心解盤條目卡
    const drawSection = (y, title, content, color = '#e2e8f0') => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(90, y, W - 180, 110);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(90, y, W - 180, 110);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#f5c542';
      ctx.font = 'bold 24px "Noto Serif TC", serif';
      ctx.fillText(title, 120, y + 36);

      ctx.fillStyle = color;
      ctx.font = '22px "Noto Serif TC", serif';
      ctx.fillText(content, 120, y + 80);
    };

    drawSection(810, '⏳ 時序應期預測', reading.timing.yingQiDesc.slice(0, 42) + '...');
    drawSection(940, '🧭 貴人方位與求事方向', reading.strategy.direction);
    drawSection(1070, '🔮 五行開運化解方案', `幸運色彩：${reading.strategy.color} ｜ 隨身物象：${reading.strategy.item}`);
    drawSection(1200, '☯️ 易經互應之卦', `【${reading.hexagram.name}】${reading.hexagram.keywords} · ${reading.hexagram.desc.slice(0, 36)}...`);
    drawSection(1330, '⚡ 大師金口直斷', reading.vipPackage.masterAxiom.slice(0, 42) + '...');

    // 10. 底部修心箴言
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'italic 26px "Ma Shan Zheng", serif';
    ctx.fillText(`${reading.quote}`, W / 2, 1500);

    // 11. 底部防偽金印與證書資訊
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.3)';
    ctx.beginPath();
    ctx.moveTo(90, 1560);
    ctx.lineTo(W - 90, 1560);
    ctx.stroke();

    // 繪製太極圖案於底部中心
    ctx.save();
    ctx.translate(W / 2, 1680);
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();
    // 陰陽太極魚
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(0, 0, 50, -Math.PI / 2, Math.PI / 2, false);
    ctx.arc(0, 25, 25, Math.PI / 2, -Math.PI / 2, true);
    ctx.arc(0, -25, 25, Math.PI / 2, -Math.PI / 2, false);
    ctx.fill();
    ctx.fillStyle = '#0f121d';
    ctx.beginPath();
    ctx.arc(0, -25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(0, 25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Noto Serif TC", serif';
    ctx.fillText(`結緣序號：${reading.vipPackage.certificateCode}`, W / 2, 1780);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px "Noto Serif TC", serif';
    ctx.fillText(`起局時間：${reading.time} · 奇門遁甲 3D 智慧演盤系統`, W / 2, 1820);

    // 導出下載
    setTimeout(() => {
      try {
        const dataUrl = posterCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `奇門靈符金卡_${reading.askerTitle}_${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('🎉 高清命盤靈符金卡已下載至您的相簿！');
      } catch (e) {
        console.error(e);
        showToast('下載失敗，可長按保存圖片');
      }
    }, 400);
  }

  // 11. 命譜歷史抽屜 (Fate Drawer) 邏輯
  function renderHistoryDrawer() {
    if (!historyList) return;
    const list = divination.getHistory();
    historyList.innerHTML = '';

    if (list.length === 0) {
      historyList.innerHTML = '<div class="no-history">尚無過往問卜命譜紀錄</div>';
      return;
    }

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-card-item';
      card.innerHTML = `
        <div class="hci-header">
          <span class="hci-time">${item.time}</span>
          <span class="hci-badge" style="color:${item.outcome.color};">${item.outcome.verdict}</span>
        </div>
        <div class="hci-question">${item.question}</div>
        <div class="hci-meta">${item.astro.bureauName} · ${item.palace.name} · 人盤【${item.gate.name}】</div>
      `;
      card.addEventListener('click', () => {
        currentReading = item;
        displayReadingResult(item);
        resultContainer.classList.add('active');
        if (historyOverlay) historyOverlay.classList.add('hidden');
        if (btnReaskTop) btnReaskTop.classList.remove('hidden');
        if (btnToggleResultTop) btnToggleResultTop.classList.remove('hidden');
        showToast(`已載入命譜：${item.question.slice(0, 12)}...`);
      });
      historyList.appendChild(card);
    });
  }

  if (btnHistory) {
    btnHistory.addEventListener('click', () => {
      renderHistoryDrawer();
      if (historyOverlay) historyOverlay.classList.remove('hidden');
    });
  }

  if (btnCloseHistory && historyOverlay) {
    btnCloseHistory.addEventListener('click', () => {
      historyOverlay.classList.add('hidden');
    });
    historyOverlay.addEventListener('click', (e) => {
      if (e.target === historyOverlay) {
        historyOverlay.classList.add('hidden');
      }
    });
  }

  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('確定要清空所有過往問卜命譜紀錄嗎？此操作不可逆。')) {
        divination.clearHistory();
        renderHistoryDrawer();
        showToast('已清空所有問卜命譜');
      }
    });
  }

  // 12. 道門靈氛梵音切換
  if (btnAmbient) {
    btnAmbient.addEventListener('click', () => {
      if (!window.soundEngine) return;
      const enabled = window.soundEngine.toggleAmbient();
      if (ambientIcon) {
        ambientIcon.textContent = enabled ? '🎵' : '🔇';
      }
      showToast(enabled ? '🎵 道門清心靈氛梵音已開啟' : '🔇 靈氛梵音已靜音');
    });
  }

  // 13. 道術音效開關切換
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      if (!window.soundEngine) return;
      const enabled = window.soundEngine.toggleSound();
      if (soundIcon) {
        soundIcon.textContent = enabled ? '🔊' : '🔇';
      }
      showToast(enabled ? '🔊 道術音效已開啟' : '🔇 道術音效已靜音');
    });
  }
});
