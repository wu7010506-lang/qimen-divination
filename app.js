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

  // 模式切換與今日吉方羅盤元素
  const btnModeDivine = document.getElementById('btn-mode-divine');
  const btnModeCompass = document.getElementById('btn-mode-compass');
  const cardInquiry = document.getElementById('inquiry-card');
  const cardCompass = document.getElementById('compass-card');
  const btnCompassToDivine = document.getElementById('btn-compass-to-divine');
  const btnDownloadCompassCard = document.getElementById('btn-download-compass-card');
  const dcEightGrid = document.getElementById('dc-eight-grid');
  const dcShichenList = document.getElementById('dc-shichen-list');
  const btnScAll = document.getElementById('btn-sc-all');
  const btnScAuspicious = document.getElementById('btn-sc-auspicious');

  // 3D 九宮探查元素
  const palaceQuickNav = document.getElementById('palace-quick-nav');
  const pqnPills = document.querySelectorAll('.pqn-btn');
  const palaceModal = document.getElementById('palace-modal');
  const btnClosePalaceModal = document.getElementById('btn-close-palace-modal');
  const btnFocusPalaceCamera = document.getElementById('btn-focus-palace-camera');
  let selectedPalaceId = 1;

  // 靈符海報主題切換與複製圖片元素
  const posterStyleTabs = document.querySelectorAll('.pss-tab');
  const btnCopyCardImg = document.getElementById('btn-copy-card-img');
  let currentPosterTheme = 'dark-gold';

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
  let cachedDailyCompass = null;

  // 提示彈出函式
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // 0. 模式切換器 (立心問事 VS 今日吉方羅盤)
  function switchMode(mode) {
    if (mode === 'divine') {
      if (btnModeDivine) btnModeDivine.classList.add('active');
      if (btnModeCompass) btnModeCompass.classList.remove('active');
      if (cardInquiry) cardInquiry.classList.remove('hidden');
      if (cardCompass) cardCompass.classList.add('hidden');
      if (palaceQuickNav) palaceQuickNav.classList.add('hidden');
      if (questionInput) setTimeout(() => questionInput.focus(), 300);
    } else {
      if (btnModeCompass) btnModeCompass.classList.add('active');
      if (btnModeDivine) btnModeDivine.classList.remove('active');
      if (cardCompass) cardCompass.classList.remove('hidden');
      if (cardInquiry) cardInquiry.classList.add('hidden');
      renderDailyCompass();
      if (palaceQuickNav) palaceQuickNav.classList.remove('hidden');
    }
  }

  if (btnModeDivine) btnModeDivine.addEventListener('click', () => switchMode('divine'));
  if (btnModeCompass) btnModeCompass.addEventListener('click', () => switchMode('compass'));
  if (btnCompassToDivine) btnCompassToDivine.addEventListener('click', () => switchMode('divine'));

  // 今日奇門出行吉方羅盤渲染
  function renderDailyCompass() {
    const data = divination.calculateDailyCompass(new Date());
    cachedDailyCompass = data;

    // 天文曆法
    const elPillars = document.getElementById('dc-pillars');
    if (elPillars) elPillars.textContent = `歲次${data.astro.yearPillar} ${data.astro.monthPillar} ${data.astro.dayPillar}`;
    const elBureau = document.getElementById('dc-bureau');
    if (elBureau) elBureau.textContent = `${data.astro.bureauName} · 旬空：${data.astro.voidPalaces}`;
    const elCurSc = document.getElementById('dc-cur-shichen');
    if (elCurSc && data.currentShichen) {
      elCurSc.textContent = `【此刻：${data.currentShichen.name.split(' ')[0]} · ${data.currentShichen.verdict.split(' · ')[0]}】`;
    }

    // 三大焦點吉凶方
    if (data.bestWealth) {
      const elWDir = document.getElementById('dc-wealth-dir');
      const elWRat = document.getElementById('dc-wealth-rating');
      const elWTag = document.getElementById('dc-wealth-tag');
      const elWAdv = document.getElementById('dc-wealth-advice');
      if (elWDir) elWDir.textContent = `${data.bestWealth.direction} · ${data.bestWealth.palace.name}`;
      if (elWRat) elWRat.textContent = data.bestWealth.rating;
      if (elWTag) elWTag.textContent = data.bestWealth.tag;
      if (elWAdv) elWAdv.textContent = data.bestWealth.advice;
    }
    if (data.bestCareer) {
      const elCDir = document.getElementById('dc-career-dir');
      const elCRat = document.getElementById('dc-career-rating');
      const elCTag = document.getElementById('dc-career-tag');
      const elCAdv = document.getElementById('dc-career-advice');
      if (elCDir) elCDir.textContent = `${data.bestCareer.direction} · ${data.bestCareer.palace.name}`;
      if (elCRat) elCRat.textContent = data.bestCareer.rating;
      if (elCTag) elCTag.textContent = data.bestCareer.tag;
      if (elCAdv) elCAdv.textContent = data.bestCareer.advice;
    }
    if (data.cautionDir) {
      const elXDir = document.getElementById('dc-caution-dir');
      const elXRat = document.getElementById('dc-caution-rating');
      const elXTag = document.getElementById('dc-caution-tag');
      const elXAdv = document.getElementById('dc-caution-advice');
      if (elXDir) elXDir.textContent = `${data.cautionDir.direction} · ${data.cautionDir.palace.name}`;
      if (elXRat) elXRat.textContent = data.cautionDir.rating;
      if (elXTag) elXTag.textContent = data.cautionDir.tag;
      if (elXAdv) elXAdv.textContent = data.cautionDir.advice;
    }

    // 八方格子
    if (dcEightGrid) {
      dcEightGrid.innerHTML = '';
      data.directions.forEach(d => {
        const cell = document.createElement('div');
        cell.className = 'ed-cell';
        cell.innerHTML = `
          <div class="ed-dir">${d.direction} · ${d.palace.name.slice(0, 2)}</div>
          <div class="ed-gate" style="color: ${d.color};">${d.gate.name} [${d.rating}]</div>
          <div class="ed-tag">${d.tag}</div>
        `;
        cell.addEventListener('click', () => {
          document.querySelectorAll('.ed-cell').forEach(c => c.classList.remove('selected'));
          cell.classList.add('selected');
          renderer.focusPalace(d.palace.id);
          openPalaceModal(d.palace.id);
        });
        dcEightGrid.appendChild(cell);
      });
    }

    // 十二時辰輪動
    renderShichenList('all');

    // 未來七日重大專案開運吉辰曆
    renderWeeklyGoldenWindows('career');

    // 繪製與更新奇門天盤實景羅盤
    drawLuopanDial(data);
  }

  function renderWeeklyGoldenWindows(category = 'career') {
    const daysNav = document.getElementById('weekly-days-nav');
    const windowCard = document.getElementById('weekly-window-card');
    if (!daysNav || !windowCard) return;

    const weeklyData = divination.calculateWeeklyGoldenWindows(category, new Date());
    daysNav.innerHTML = '';

    const renderDayWindows = (day) => {
      windowCard.innerHTML = `
        <div class="ww-header">
          <span>${day.dateStr} · 歲次${day.fourPillars}（${day.bureauName}）</span>
          <span>開拓吉方：${day.bestDirection}</span>
        </div>
      `;
      day.topWindows.forEach(w => {
        const item = document.createElement('div');
        item.className = 'ww-item';
        item.innerHTML = `
          <div class="ww-shichen">⏰ ${w.shichen}</div>
          <div class="ww-palace">${w.palace}</div>
          <div class="ww-action">${w.action}</div>
        `;
        windowCard.appendChild(item);
      });
    };

    weeklyData.forEach((day, idx) => {
      const btn = document.createElement('button');
      btn.className = `wd-btn ${idx === 0 ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="wd-date">${idx === 0 ? '今天' : idx === 1 ? '明天' : idx === 2 ? '後天' : `+${idx}天`}</span>
        <span class="wd-sub">${day.dateStr.split(' ')[0]}</span>
      `;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wd-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDayWindows(day);
      });
      daysNav.appendChild(btn);
    });

    renderDayWindows(weeklyData[0]);
  }

  function renderShichenList(filterMode) {
    if (!cachedDailyCompass || !dcShichenList) return;
    const { shichenList, currentShichenIdx } = cachedDailyCompass;
    dcShichenList.innerHTML = '';

    shichenList.forEach((sc, idx) => {
      const isCur = idx === currentShichenIdx;
      const isAuspicious = sc.verdict.includes('吉');
      if (filterMode === 'auspicious' && !isAuspicious) return;

      const row = document.createElement('div');
      row.className = `shichen-row ${isCur ? 'active-now' : ''}`;
      row.innerHTML = `
        <div class="sc-col-name">
          <span>${sc.name}</span>
          ${isCur ? '<span class="sc-now-badge">此刻吉凶</span>' : ''}
        </div>
        <div class="sc-col-verdict" style="color: ${isAuspicious ? '#4ade80' : '#fb923c'};">${sc.verdict}</div>
        <div class="sc-col-yi">宜：${sc.yi}</div>
        <div class="sc-col-ji">忌：${sc.ji}</div>
      `;
      dcShichenList.appendChild(row);
    });
  }

  if (btnScAll) {
    btnScAll.addEventListener('click', () => {
      if (btnScAll) btnScAll.classList.add('active');
      if (btnScAuspicious) btnScAuspicious.classList.remove('active');
      renderShichenList('all');
    });
  }
  if (btnScAuspicious) {
    btnScAuspicious.addEventListener('click', () => {
      if (btnScAuspicious) btnScAuspicious.classList.add('active');
      if (btnScAll) btnScAll.classList.remove('active');
      renderShichenList('auspicious');
    });
  }

  // ========================================================
  // 奇門天盤實景羅盤 (Interactive Circular Luopan Dial)
  // ========================================================
  let dialAngle = 0;
  let isDraggingDial = false;
  let dragStartMouseAngle = 0;
  let dragStartDialAngle = 0;

  function drawLuopanDial(data, angle = dialAngle) {
    const canvas = document.getElementById('daily-compass-dial');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 1. 羅盤基盤 (深銅木質同心底盤)
    const bgGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, r);
    bgGrad.addColorStop(0, '#1c1917');
    bgGrad.addColorStop(0.7, '#141210');
    bgGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 外環金邊
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245, 197, 66, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
    ctx.arc(0, 0, r - 32, 0, Math.PI * 2);
    ctx.arc(0, 0, r - 64, 0, Math.PI * 2);
    ctx.arc(0, 0, r - 96, 0, Math.PI * 2);
    ctx.stroke();

    // 2. 最外圈：二十四山與 360 度刻度
    const mountains24 = [
      '子', '癸', '丑', '艮', '寅', '甲', '卯', '乙',
      '辰', '巽', '巳', '丙', '午', '丁', '未', '坤',
      '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'
    ];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 24; i++) {
      const a = (i * 15) * Math.PI / 180 - Math.PI / 2;
      ctx.save();
      ctx.rotate(a);
      ctx.strokeStyle = i % 2 === 0 ? '#f5c542' : 'rgba(245, 197, 66, 0.4)';
      ctx.lineWidth = i % 6 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, -(r - 6));
      ctx.lineTo(0, -(r - 14));
      ctx.stroke();

      ctx.fillStyle = (mountains24[i] === '子' || mountains24[i] === '午' || mountains24[i] === '卯' || mountains24[i] === '酉') ? '#fbbf24' : '#cbd5e1';
      ctx.font = '9px "Noto Serif TC", serif';
      ctx.fillText(mountains24[i], 0, -(r - 20));
      ctx.restore();
    }

    // 3. 中圈：八卦與方位
    const baguaNames = ['坎一北', '艮八東北', '震三東', '巽四東南', '離九南', '坤二西南', '兌七西', '乾六西北'];
    const baguaSymbols = ['☵', '☶', '☳', '☴', '☲', '☷', '☱', '☰'];

    for (let i = 0; i < 8; i++) {
      const a = (i * 45) * Math.PI / 180 - Math.PI / 2;
      ctx.save();
      ctx.rotate(a);

      ctx.fillStyle = '#f5c542';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(baguaSymbols[i], 0, -(r - 46));

      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(baguaNames[i].slice(0, 2), 0, -(r - 56));
      ctx.restore();
    }

    // 4. 內圈：今日八門落宮分布
    if (data && data.directions) {
      data.directions.forEach((d, idx) => {
        const a = (idx * 45) * Math.PI / 180 - Math.PI / 2;
        ctx.save();
        ctx.rotate(a);

        ctx.fillStyle = d.color || '#4ade80';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(d.gate.name, 0, -(r - 78));

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '8px sans-serif';
        ctx.fillText(d.rating, 0, -(r - 88));
        ctx.restore();
      });
    }

    ctx.restore(); // 恢復未旋轉狀態

    // 5. 天池磁針 (固定在上方指向正北與生門)
    const poolR = r - 100;
    const poolGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, poolR);
    poolGrad.addColorStop(0, '#2d1b08');
    poolGrad.addColorStop(0.8, '#17120a');
    poolGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = poolGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, poolR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 十字紅線 (天池紅線校正準繩)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - poolR + 4);
    ctx.lineTo(cx, cy + poolR - 4);
    ctx.moveTo(cx - poolR + 4, cy);
    ctx.lineTo(cx + poolR - 4, cy);
    ctx.stroke();

    // 磁針指針：紅頭指生門吉方 / 北方
    ctx.save();
    ctx.translate(cx, cy);

    let targetGateAngle = -Math.PI / 2;
    if (data && data.bestWealth) {
      const pId = data.bestWealth.palace.id;
      const pIdx = [1, 8, 3, 4, 9, 2, 7, 6].indexOf(pId);
      if (pIdx !== -1) {
        targetGateAngle = (pIdx * 45) * Math.PI / 180 - Math.PI / 2 + angle;
      }
    }
    ctx.rotate(targetGateAngle);

    // 北極紅色箭頭
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -poolR + 8);
    ctx.lineTo(6, -6);
    ctx.lineTo(0, -2);
    ctx.lineTo(-6, -6);
    ctx.closePath();
    ctx.fill();

    // 南極白金箭頭
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0, poolR - 8);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 2);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();

    // 中軸天池太極紐
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 更新底部指示文本
    const elTargetGate = document.getElementById('dial-target-gate');
    const elTargetDir = document.getElementById('dial-target-dir');
    if (elTargetGate && data && data.bestWealth) {
      elTargetGate.textContent = `${data.bestWealth.gate.name} · ${data.bestWealth.rating}`;
    }
    if (elTargetDir && data && data.bestWealth) {
      const deg = Math.round(((-angle * 180 / Math.PI) % 360 + 360) % 360);
      elTargetDir.textContent = `${data.bestWealth.direction} (${deg}°)`;
    }
  }

  function setupLuopanEvents() {
    const canvas = document.getElementById('daily-compass-dial');
    if (!canvas) return;

    const getAngleFromEvent = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return Math.atan2(clientY - cy, clientX - cx);
    };

    const onStart = (e) => {
      isDraggingDial = true;
      dragStartMouseAngle = getAngleFromEvent(e);
      dragStartDialAngle = dialAngle;
    };

    const onMove = (e) => {
      if (!isDraggingDial) return;
      const currentMouseAngle = getAngleFromEvent(e);
      dialAngle = dragStartDialAngle + (currentMouseAngle - dragStartMouseAngle);
      drawLuopanDial(cachedDailyCompass, dialAngle);
    };

    const onEnd = () => {
      isDraggingDial = false;
    };

    canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    // 轉向生門按鈕
    const btnAlign = document.getElementById('btn-align-compass');
    if (btnAlign) {
      btnAlign.addEventListener('click', () => {
        if (!cachedDailyCompass || !cachedDailyCompass.bestWealth) return;
        const pId = cachedDailyCompass.bestWealth.palace.id;
        const pIdx = [1, 8, 3, 4, 9, 2, 7, 6].indexOf(pId);
        if (pIdx === -1) return;

        const targetAngle = -(pIdx * 45 * Math.PI / 180);
        let startA = dialAngle;
        let startT = performance.now();
        const duration = 650;

        const animate = (now) => {
          const progress = Math.min(1, (now - startT) / duration);
          const ease = 1 - Math.pow(1 - progress, 3);
          dialAngle = startA + (targetAngle - startA) * ease;
          drawLuopanDial(cachedDailyCompass, dialAngle);
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            showToast('已將今日正財生門吉方轉向正前方！');
            if (window.soundEngine) window.soundEngine.playSingingBowl();
          }
        };
        requestAnimationFrame(animate);
      });
    }
  }

  // 3D 九宮探查懸浮卡邏輯
  function openPalaceModal(palaceId) {
    selectedPalaceId = palaceId;
    const info = divination.getPalaceDetails(palaceId);
    if (!info) return;

    const elTitle = document.getElementById('pm-title');
    const elElem = document.getElementById('pm-element');
    const elTrigram = document.getElementById('pm-trigram');
    const elMeaning = document.getElementById('pm-meaning');
    const elGate = document.getElementById('pm-gate');
    const elStar = document.getElementById('pm-star');
    const elDeity = document.getElementById('pm-deity');

    if (elTitle) elTitle.textContent = `${info.palace.name} · ${info.palace.direction}`;
    if (elElem) elElem.textContent = `五行屬${info.palace.element} · ${info.palace.nature}`;
    if (elTrigram) elTrigram.textContent = `${info.detail.trigramName}`;
    if (elMeaning) elMeaning.textContent = info.detail.meaning;

    if (currentReading && currentReading.palace.id === palaceId) {
      if (elGate) elGate.textContent = `${currentReading.gate.name} (${currentReading.gate.type})`;
      if (elStar) elStar.textContent = `${currentReading.star.name} (${currentReading.star.type})`;
      if (elDeity) elDeity.textContent = `${currentReading.deity.name} (${currentReading.deity.type})`;
    } else {
      if (elGate) elGate.textContent = '八門生生不息 · 當局隨心顯化';
      if (elStar) elStar.textContent = '天罡星宿巡天 · 靈光充盈';
      if (elDeity) elDeity.textContent = '神明默佑護持 · 祥光護身';
    }

    if (palaceModal) palaceModal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playPalaceLock();
  }

  // 綁定 3D 畫布上的點擊回呼
  renderer.onPalaceClick = (palaceId) => {
    openPalaceModal(palaceId);
  };

  // 綁定底部九宮快速導航藥丸按鈕
  pqnPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const pid = parseInt(pill.getAttribute('data-pid'), 10);
      pqnPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderer.focusPalace(pid);
      openPalaceModal(pid);
    });
  });

  if (btnClosePalaceModal && palaceModal) {
    btnClosePalaceModal.addEventListener('click', () => {
      palaceModal.classList.add('hidden');
    });
    palaceModal.addEventListener('click', (e) => {
      if (e.target === palaceModal) palaceModal.classList.add('hidden');
    });
  }

  if (btnFocusPalaceCamera) {
    btnFocusPalaceCamera.addEventListener('click', () => {
      renderer.focusPalace(selectedPalaceId);
      if (palaceModal) palaceModal.classList.add('hidden');
      showToast('視角已對焦該宮位天柱！');
    });
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

    // 7. 主客博弈之道
    if (reading.hostGuest) {
      const hg = reading.hostGuest;
      const elHgHour = document.getElementById('hg-hour-type');
      const elHgVerd = document.getElementById('hg-verdict');
      const elHgSumm = document.getElementById('hg-summary');
      const elHgGuestSc = document.getElementById('hg-guest-score');
      const elHgHostSc = document.getElementById('hg-host-score');
      const elHgMeter = document.getElementById('hg-meter-fill');
      const elHgRel = document.getElementById('hg-relation');
      const elHgGAdv = document.getElementById('hg-guest-advice');
      const elHgHAdv = document.getElementById('hg-host-advice');
      const elHgGimmick = document.getElementById('hg-gimmick');

      if (elHgHour) elHgHour.textContent = hg.hourType;
      if (elHgVerd) elHgVerd.textContent = hg.verdict;
      if (elHgSumm) elHgSumm.textContent = hg.tacticSummary;
      if (elHgGuestSc) elHgGuestSc.textContent = `${hg.guestScore}%`;
      if (elHgHostSc) elHgHostSc.textContent = `${hg.hostScore}%`;
      if (elHgMeter) elHgMeter.style.width = `${hg.guestScore}%`;
      if (elHgRel) elHgRel.textContent = hg.relation;
      if (elHgGAdv) elHgGAdv.textContent = hg.guestAdvice;
      if (elHgHAdv) elHgHAdv.textContent = hg.hostAdvice;
      if (elHgGimmick) elHgGimmick.textContent = hg.negotiationGimmick;
    }

    // 8. 奇門九宮全盤排盤
    if (reading.ninePalacesChart) {
      renderNinePalacesChart(reading.ninePalacesChart);
    }

    // 9. 千古名戰奇門兵法對照
    if (reading.historicalDoctrine) {
      const doc = reading.historicalDoctrine;
      const elEra = document.getElementById('doc-era');
      const elTitle = document.getElementById('doc-title');
      const elMatchVal = document.getElementById('doc-match-val');
      const elMatchFill = document.getElementById('doc-match-fill');
      const elDoctrine = document.getElementById('doc-doctrine');
      const elHistory = document.getElementById('doc-history');
      const elBusiness = document.getElementById('doc-business');
      const elCaution = document.getElementById('doc-caution');
      const elQuote = document.getElementById('doc-quote');

      if (elEra) elEra.textContent = `${doc.era} · ${doc.commander}`;
      if (elTitle) elTitle.textContent = doc.name;
      if (elMatchVal) elMatchVal.textContent = `${doc.matchScore}%`;
      if (elMatchFill) elMatchFill.style.width = `${doc.matchScore}%`;
      if (elDoctrine) elDoctrine.textContent = doc.coreDoctrine;
      if (elHistory) elHistory.textContent = doc.historicalContext;
      if (elBusiness) elBusiness.textContent = doc.businessApplication;
      if (elCaution) elCaution.textContent = doc.tacticalCaution;
      if (elQuote) elQuote.textContent = doc.quote;
    }

    // 10. 運勢演化沙盤
    if (reading.timelineSimulation) {
      renderTimelineSimulation(reading.timelineSimulation);
    }

    // 預設切換至第一分頁
    switchResultTab('analysis');
  }

  // 渲染九宮全景排盤
  function renderNinePalacesChart(chartData) {
    const grid = document.getElementById('nine-chart-grid');
    if (!grid) return;
    grid.innerHTML = '';

    chartData.forEach(cell => {
      const div = document.createElement('div');
      div.className = `nine-cell ${cell.isCenter ? 'center-cell' : ''} ${cell.isTarget ? 'target-palace' : ''}`;

      let badges = '';
      if (cell.isTarget) badges += '<span class="nc-target-badge">當前落宮</span>';
      if (cell.isVoid) badges += '<span class="nc-void-badge">⭕空</span>';
      if (cell.isHorse) badges += '<span class="nc-horse-badge">馬</span>';

      div.innerHTML = `
        <div class="nc-header">
          <span>${cell.dir} · ${cell.name.slice(0, 2)} ${cell.trigram}</span>
          <div class="nc-tag-box">${badges}</div>
        </div>
        <div class="nc-stems">
          <span class="nc-tian-gan" title="天盤干">${cell.tianGan}</span>
          <span class="nc-di-gan" title="地盤干">${cell.diGan}</span>
        </div>
        <div class="nc-gate ${cell.isPo ? 'po-gate' : ''}" style="color:${cell.gate.type === '大吉' || cell.gate.type === '吉' ? '#4ade80' : cell.gate.type === '凶' ? '#f87171' : '#facc15'}">
          ${cell.gate.name}
        </div>
        <div class="nc-star-deity">
          ${cell.star.name} · ${cell.deity.name}
        </div>
      `;

      div.addEventListener('click', () => {
        if (!cell.isCenter) {
          renderer.focusPalace(cell.id);
          openPalaceModal(cell.id);
        }
      });

      grid.appendChild(div);
    });
  }

  // 渲染運勢演化沙盤 (24小時流時盤推演模擬器)
  function renderTimelineSimulation(simData) {
    const track = document.getElementById('sim-hours-track');
    const elGoldenShichen = document.getElementById('sim-golden-shichen');
    const elGoldenDesc = document.getElementById('sim-golden-desc');

    if (elGoldenShichen && simData.goldenWindow) {
      elGoldenShichen.textContent = `${simData.goldenWindow.shichen} (${simData.goldenWindow.range})`;
    }
    if (elGoldenDesc && simData.goldenWindow) {
      elGoldenDesc.textContent = `${simData.goldenWindow.gateName}入${simData.goldenWindow.palaceName} · ${simData.goldenWindow.action}`;
    }

    if (!track) return;
    track.innerHTML = '';

    const updateDetailCard = (item) => {
      const elCurLevel = document.getElementById('sim-cur-level');
      const elCurShichen = document.getElementById('sim-cur-shichen');
      const elCurScore = document.getElementById('sim-cur-score');
      const elCurPalace = document.getElementById('sim-cur-palace');
      const elCurGate = document.getElementById('sim-cur-gate');
      const elCurAction = document.getElementById('sim-cur-action');

      if (elCurLevel) {
        elCurLevel.textContent = item.level;
        elCurLevel.style.color = item.level === '大吉' || item.level === '吉' ? '#4ade80' : item.level === '謹慎' ? '#f87171' : '#facc15';
      }
      if (elCurShichen) elCurShichen.textContent = `${item.shichen} (${item.range})`;
      if (elCurScore) elCurScore.textContent = `氣場評分：${item.score}分`;
      if (elCurPalace) elCurPalace.textContent = `${item.palaceName} (${item.palaceDir})`;
      if (elCurGate) elCurGate.textContent = `${item.gateName} (${item.gateType})`;
      if (elCurAction) elCurAction.textContent = item.action;
    };

    simData.timeline.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = `sim-hour-btn ${idx === 0 ? 'active' : ''} ${item.isGolden ? 'golden' : ''}`;
      btn.innerHTML = `
        <span style="font-weight:700;">${item.shichen}</span>
        <span style="font-size:0.68rem; color:${item.level === '大吉' || item.level === '吉' ? '#4ade80' : item.level === '謹慎' ? '#f87171' : '#facc15'};">${item.gateName}</span>
      `;
      btn.addEventListener('click', () => {
        track.querySelectorAll('.sim-hour-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateDetailCard(item);
        if (window.soundEngine) window.soundEngine.playMuYu();
      });
      track.appendChild(btn);
    });

    if (simData.timeline.length > 0) {
      updateDetailCard(simData.timeline[0]);
    }
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
      if (palaceQuickNav) palaceQuickNav.classList.remove('hidden');
      showToast('卷軸已暫時收起，可隨意以滑鼠 3D 旋轉/縮放觀看神域活局');
    });
  }

  // 點擊頂部「查看解盤」重新展開
  if (btnToggleResultTop) {
    btnToggleResultTop.addEventListener('click', () => {
      if (currentReading) {
        resultContainer.classList.add('active');
        if (palaceQuickNav) palaceQuickNav.classList.add('hidden');
      }
    });
  }

  // 8. 重新起局問卜 (再問一局)
  function handleReAsk() {
    resultContainer.classList.remove('active');
    cinematicBanner.classList.remove('visible');
    if (palaceQuickNav) palaceQuickNav.classList.add('hidden');
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
        showToast('占卜全策密函已成功複製至剪貼簿！');
      }).catch(() => {
        showToast('複製失敗，請手動選取文字');
      });
    });
  }

  // 靈符海報相貌風格切換監聽
  posterStyleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      posterStyleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPosterTheme = tab.getAttribute('data-poster-theme') || 'dark-gold';
      showToast(`已切換靈符風格：${tab.textContent}`);
    });
  });

  // 10. 生成並下載 1080x1920 高清靈符海報 (支援三種宮廷神符法相)
  if (btnDownloadCard) {
    btnDownloadCard.addEventListener('click', () => {
      if (!currentReading) return;
      generateTalismanPoster(currentReading, currentPosterTheme, true);
    });
  }

  // 列印/匯出官方風後神域專案密卷 (A4 PDF)
  const btnPrintDossier = document.getElementById('btn-print-dossier');
  if (btnPrintDossier) {
    btnPrintDossier.addEventListener('click', () => {
      if (!currentReading) return;
      showToast('正在為您調用系統列印，可選擇「另存為 PDF」...');
      setTimeout(() => window.print(), 300);
    });
  }

  // 複製靈符圖片到剪貼簿
  if (btnCopyCardImg) {
    btnCopyCardImg.addEventListener('click', () => {
      if (!currentReading) return;
      showToast('正在為您封裝靈符金卡至剪貼簿...');
      const posterCanvas = document.getElementById('poster-canvas');
      if (!posterCanvas) return;
      generateTalismanPoster(currentReading, currentPosterTheme, false);

      setTimeout(() => {
        posterCanvas.toBlob(async (blob) => {
          if (!blob) {
            showToast('生成失敗，請使用「下載金卡」');
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            showToast('靈符金卡圖像已成功複製到剪貼簿！可直接貼上分享');
          } catch (err) {
            console.warn(err);
            showToast('剪貼簿圖像許可受限，已自動為您保存圖片');
            document.getElementById('btn-download-card').click();
          }
        }, 'image/png');
      }, 350);
    });
  }

  function generateTalismanPoster(reading, theme = 'dark-gold', triggerDownload = true) {
    showToast('正在以道門神數描繪 1080x1920 高清靈符金卡...');
    const posterCanvas = document.getElementById('poster-canvas');
    if (!posterCanvas) return;
    const ctx = posterCanvas.getContext('2d');
    const W = 1080;
    const H = 1920;

    // 配色方案：玄黑真金 (dark-gold) / 硃砂御印 (cinnabar) / 青玉太虛 (jade)
    let primaryColor = '#f5c542';
    let secondaryColor = '#ffd700';
    let accentColor = '#fef08a';
    let gradCenter = '#1c1f2e';
    let gradMid = '#0f121d';
    let gradEdge = '#05070c';
    let titleHead = '敕令 · 奇門遁甲風後神域 ';
    let sealText1 = '風後';
    let sealText2 = '奇門';
    let sealBg = 'rgba(197, 48, 48, 0.85)';
    let sealBorder = '#fca5a5';

    if (theme === 'cinnabar') {
      primaryColor = '#fef08a';
      secondaryColor = '#fde047';
      accentColor = '#fffbeb';
      gradCenter = '#651111';
      gradMid = '#3e0707';
      gradEdge = '#1f0303';
      titleHead = '敕令 · 硃砂御印風後神域 ';
      sealText1 = '天官';
      sealText2 = '賜福';
      sealBg = 'rgba(234, 179, 8, 0.9)';
      sealBorder = '#fef08a';
    } else if (theme === 'jade') {
      primaryColor = '#5eead4';
      secondaryColor = '#a7f3d0';
      accentColor = '#ccfbf1';
      gradCenter = '#093637';
      gradMid = '#041f22';
      gradEdge = '#020e11';
      titleHead = '敕令 · 青玉太虛風後神域 ';
      sealText1 = '太虛';
      sealText2 = '護持';
      sealBg = 'rgba(13, 148, 136, 0.9)';
      sealBorder = '#5eead4';
    }

    // 1. 底色放射漸層
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 900);
    bgGrad.addColorStop(0, gradCenter);
    bgGrad.addColorStop(0.6, gradMid);
    bgGrad.addColorStop(1, gradEdge);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. 邊框裝飾：雙層奢華金線與祥雲角飾
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    ctx.strokeStyle = primaryColor + '66';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    // 四角金剛結符號
    const drawCorner = (x, y) => {
      ctx.save();
      ctx.strokeStyle = primaryColor;
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
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 38px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(titleHead, W / 2, 130);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "Noto Serif TC", serif';
    ctx.fillText(`天地人神四盤全息符卷 · ${reading.astro.bureauName}`, W / 2, 175);

    // 4. 道印方印
    ctx.save();
    ctx.fillStyle = sealBg;
    ctx.fillRect(W - 170, 90, 80, 80);
    ctx.strokeStyle = sealBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(W - 170, 90, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Ma Shan Zheng", serif';
    ctx.fillText(sealText1, W - 130, 125);
    ctx.fillText(sealText2, W - 130, 155);
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

    // 5-2. 硃砂御印法章 (Authentic Cinnabar Seal Stamp)
    ctx.save();
    ctx.translate(W - 170, 310);
    ctx.rotate(0.04);
    ctx.fillStyle = sealBg;
    ctx.strokeStyle = sealBorder;
    ctx.lineWidth = 4;
    ctx.fillRect(-55, -55, 110, 110);
    ctx.strokeRect(-55, -55, 110, 110);

    ctx.fillStyle = sealBorder;
    ctx.font = 'bold 34px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sealText1.slice(0, 1), 26, -22);
    ctx.fillText(sealText1.slice(1, 2), 26, 26);
    ctx.fillText(sealText2.slice(0, 1), -26, -22);
    ctx.fillText(sealText2.slice(1, 2), -26, 26);
    ctx.restore();

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

    drawSection(810, '時序應期預測', reading.timing.yingQiDesc.slice(0, 42) + '...');
    drawSection(940, '貴人方位與求事方向', reading.strategy.direction);
    drawSection(1070, '五行開運化解方案', `幸運色彩：${reading.strategy.color} ｜ 隨身物象：${reading.strategy.item}`);
    drawSection(1200, '☯易經互應之卦', `【${reading.hexagram.name}】${reading.hexagram.keywords} · ${reading.hexagram.desc.slice(0, 36)}...`);
    drawSection(1330, '大師金口直斷', reading.vipPackage.masterAxiom.slice(0, 42) + '...');

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

    // 13. 底部中心太極圖
    ctx.save();
    ctx.translate(W / 2, 1690);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, 48, -Math.PI / 2, Math.PI / 2, false);
    ctx.arc(0, 24, 24, Math.PI / 2, -Math.PI / 2, true);
    ctx.arc(0, -24, 24, Math.PI / 2, -Math.PI / 2, false);
    ctx.fill();

    ctx.fillStyle = gradMid;
    ctx.beginPath();
    ctx.arc(0, -24, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, 24, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Noto Serif TC", serif';
    ctx.fillText(`結緣序號：${reading.vipPackage.certificateCode}`, W / 2, 1785);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px "Noto Serif TC", serif';
    ctx.fillText(`起局時間：${reading.time} · 奇門遁甲 3D 智慧演盤系統`, W / 2, 1825);

    // 導出下載 (若 triggerDownload 為 true)
    if (triggerDownload) {
      setTimeout(() => {
        try {
          const dataUrl = posterCanvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `奇門靈符金卡_${reading.askerTitle}_${Date.now()}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('高清命盤靈符金卡已下載至您的相簿！');
        } catch (e) {
          console.error(e);
          showToast('下載失敗，可長按保存圖片');
        }
      }, 400);
    }
  }

  // 下載今日奇門出行羅盤壁紙 (1080x1920)
  if (btnDownloadCompassCard) {
    btnDownloadCompassCard.addEventListener('click', () => {
      const data = cachedDailyCompass || divination.calculateDailyCompass(new Date());
      generateDailyCompassPoster(data);
    });
  }

  function generateDailyCompassPoster(data) {
    showToast('正在為您繪製 1080x1920 今日奇門出行羅盤壁紙...');
    const posterCanvas = document.getElementById('poster-canvas');
    if (!posterCanvas) return;
    const ctx = posterCanvas.getContext('2d');
    const W = 1080;
    const H = 1920;

    // 1. 底色
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 950);
    bgGrad.addColorStop(0, '#1a1f33');
    bgGrad.addColorStop(0.6, '#0d111d');
    bgGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. 邊框
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    ctx.strokeStyle = 'rgba(245, 197, 66, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    // 3. 抬頭
    ctx.fillStyle = '#f5c542';
    ctx.font = 'bold 42px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('奇門遁甲 · 今日歲次吉方羅盤 ', W / 2, 140);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "Noto Serif TC", serif';
    ctx.fillText(`歲次${data.astro.yearPillar} ${data.astro.monthPillar} ${data.astro.dayPillar} · ${data.astro.bureauName}`, W / 2, 190);

    // 4. 朱砂印「吉方羅盤」
    ctx.save();
    ctx.fillStyle = 'rgba(197, 48, 48, 0.85)';
    ctx.fillRect(W - 170, 90, 80, 80);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.strokeRect(W - 170, 90, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Ma Shan Zheng", serif';
    ctx.fillText('吉方', W - 130, 125);
    ctx.fillText('羅盤', W - 130, 155);
    ctx.restore();

    // 5. 三大核心方位展示
    const heroCards = [
      { title: '正財生機方 (生門)', dir: `${data.bestWealth.direction} · ${data.bestWealth.palace.name}`, advice: data.bestWealth.advice, color: '#4ade80' },
      { title: '事業貴人方 (開門)', dir: `${data.bestCareer.direction} · ${data.bestCareer.palace.name}`, advice: data.bestCareer.advice, color: '#60a5fa' },
      { title: '煞氣避忌方 (死門)', dir: `${data.cautionDir.direction} · ${data.cautionDir.palace.name}`, advice: data.cautionDir.advice, color: '#f87171' }
    ];

    heroCards.forEach((c, idx) => {
      const yPos = 250 + idx * 170;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(90, yPos, W - 180, 145);
      ctx.strokeStyle = c.color + '77';
      ctx.strokeRect(90, yPos, W - 180, 145);

      ctx.fillStyle = c.color;
      ctx.font = 'bold 28px "Noto Serif TC", serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.title, 130, yPos + 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Ma Shan Zheng", serif';
      ctx.fillText(c.dir, 130, yPos + 92);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px "Noto Serif TC", serif';
      ctx.fillText(c.advice, 130, yPos + 128);
    });

    // 6. 八方全息矩陣 (4x2 格)
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('☯ 八方落宮人盤神星全圖', W / 2, 800);

    const cellW = 205;
    const cellH = 150;
    const gridStartX = (W - (cellW * 4 + 20 * 3)) / 2;

    data.directions.forEach((d, idx) => {
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      const cx = gridStartX + col * (cellW + 20);
      const cy = 840 + row * (cellH + 20);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(cx, cy, cellW, cellH);
      ctx.strokeStyle = d.color + '55';
      ctx.strokeRect(cx, cy, cellW, cellH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px "Noto Serif TC", serif';
      ctx.fillText(`${d.direction} · ${d.palace.name.slice(0, 2)}`, cx + cellW / 2, cy + 34);

      ctx.fillStyle = d.color;
      ctx.font = 'bold 28px "Ma Shan Zheng", serif';
      ctx.fillText(`${d.gate.name} [${d.rating}]`, cx + cellW / 2, cy + 78);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '17px "Noto Serif TC", serif';
      ctx.fillText(`${d.star.name} · ${d.deity.name}`, cx + cellW / 2, cy + 114);

      ctx.fillStyle = '#64748b';
      ctx.font = '15px "Noto Serif TC", serif';
      ctx.fillText(d.tag.slice(0, 8), cx + cellW / 2, cy + 138);
    });

    // 7. 今日十二時辰行止清單
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Noto Serif TC", serif';
    ctx.fillText('⏰ 今日十二時辰輪動行止指南', W / 2, 1220);

    const scW = 420;
    const scH = 65;
    const scStartX1 = 90;
    const scStartX2 = W - 90 - scW;

    data.shichenList.forEach((sc, idx) => {
      const col = idx < 6 ? 0 : 1;
      const subIdx = idx % 6;
      const x = col === 0 ? scStartX1 : scStartX2;
      const y = 1260 + subIdx * (scH + 10);

      ctx.fillStyle = idx === data.currentShichenIdx ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(x, y, scW, scH);
      ctx.strokeStyle = idx === data.currentShichenIdx ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)';
      ctx.strokeRect(x, y, scW, scH);

      ctx.fillStyle = idx === data.currentShichenIdx ? '#fde047' : '#ffffff';
      ctx.font = 'bold 19px "Noto Serif TC", serif';
      ctx.textAlign = 'left';
      ctx.fillText(sc.name, x + 16, y + 26);

      ctx.fillStyle = sc.verdict.includes('吉') ? '#4ade80' : '#fb923c';
      ctx.font = 'bold 18px "Noto Serif TC", serif';
      ctx.fillText(sc.verdict, x + 16, y + 52);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '17px "Noto Serif TC", serif';
      ctx.textAlign = 'right';
      ctx.fillText(`宜：${sc.yi.slice(0, 8)}`, x + scW - 16, y + 38);
    });

    // 8. 底部太極印記
    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Noto Serif TC", serif';
    ctx.fillText('急急如律令 · 出行吉祥 · 百事亨通', W / 2, 1790);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px "Noto Serif TC", serif';
    ctx.fillText(`生於斯日：${new Date().toLocaleDateString('zh-TW')} · 奇門遁甲 3D 智慧演盤`, W / 2, 1830);

    setTimeout(() => {
      try {
        const dataUrl = posterCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `奇門吉方羅盤壁紙_${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('今日奇門吉方羅盤壁紙已下載至您的相簿！');
      } catch (e) {
        console.error(e);
        showToast('下載失敗，可長按保存圖片');
      }
    }, 400);
  }

  // 11. 語系切換 (繁體 / 簡體)
  const langTw = document.getElementById('lang-tw');
  const langCn = document.getElementById('lang-cn');
  if (langTw && langCn) {
    langTw.addEventListener('click', () => {
      langTw.classList.add('active');
      langCn.classList.remove('active');
      document.documentElement.lang = 'zh-TW';
      showToast('語言已切換為：正體中文');
    });
    langCn.addEventListener('click', () => {
      langCn.classList.add('active');
      langTw.classList.remove('active');
      document.documentElement.lang = 'zh-CN';
      showToast('语言已切换为：简体中文');
    });
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
        ambientIcon.textContent = '♪';
      }
      showToast(enabled ? '靈氛已開啟' : '靈氛已關閉');
    });
  }

  // 13. 道術音效開關切換
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      if (!window.soundEngine) return;
      const enabled = window.soundEngine.toggleSound();
      if (soundIcon) {
        soundIcon.textContent = enabled ? '聲' : '靜';
      }
      showToast(enabled ? '音效已開啟' : '音效已關閉');
    });
  }

  // ========================================================
  // 商業付費預約閉環 (Commercial Consultation Controller)
  // ========================================================
  function setupConsultModal() {
    const consultModal = document.getElementById('consult-modal');
    const btnOpenConsult = document.getElementById('btn-open-consult');
    const btnBookCta = document.getElementById('btn-book-consult-cta');
    const btnCloseConsult = document.getElementById('btn-close-consult-modal');
    const tierCards = document.querySelectorAll('.consult-tier-card');
    const payItems = document.querySelectorAll('.pay-method-item');
    const elTotalPrice = document.getElementById('consult-total-price');
    const btnCheckout = document.getElementById('btn-confirm-checkout');
    const viewForm = document.getElementById('consult-view-form');
    const viewSuccess = document.getElementById('consult-view-success');
    const btnCloseSuccess = document.getElementById('btn-close-success');
    const btnCalendarAdd = document.getElementById('btn-calendar-add');

    let selectedTier = 'annual';
    let selectedPrice = 3680;
    let selectedTierName = '全年流年大運詳批';

    const openModal = () => {
      if (viewForm) viewForm.classList.remove('hidden');
      if (viewSuccess) viewSuccess.classList.add('hidden');
      if (consultModal) consultModal.classList.remove('hidden');
      if (window.soundEngine) window.soundEngine.playWindChime();
    };

    if (btnOpenConsult) btnOpenConsult.addEventListener('click', openModal);
    if (btnBookCta) btnBookCta.addEventListener('click', openModal);

    if (btnCloseConsult && consultModal) {
      btnCloseConsult.addEventListener('click', () => {
        consultModal.classList.add('hidden');
      });
      consultModal.addEventListener('click', (e) => {
        if (e.target === consultModal) {
          consultModal.classList.add('hidden');
        }
      });
    }

    tierCards.forEach(card => {
      card.addEventListener('click', () => {
        tierCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedTier = card.getAttribute('data-tier');
        selectedPrice = parseInt(card.getAttribute('data-price'), 10) || 3680;
        const nameEl = card.querySelector('.ctc-name');
        selectedTierName = nameEl ? nameEl.textContent : '深度推演';
        if (elTotalPrice) elTotalPrice.textContent = `NT$ ${selectedPrice.toLocaleString()}`;
        if (window.soundEngine) window.soundEngine.playMuYu();
      });
    });

    payItems.forEach(item => {
      item.addEventListener('click', () => {
        payItems.forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        const radio = item.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => {
        const inputName = document.getElementById('consult-name');
        const nameVal = inputName && inputName.value.trim() ? inputName.value.trim() : '信士';
        const selectTime = document.getElementById('consult-time');
        const timeVal = selectTime ? selectTime.options[selectTime.selectedIndex].text : '明日下午 14:30 - 16:00';

        btnCheckout.disabled = true;
        btnCheckout.innerHTML = '<span>玄門真印加密通訊中...</span>';

        setTimeout(() => {
          btnCheckout.disabled = false;
          btnCheckout.innerHTML = '<span>安全支付並確認鎖定時段</span>';

          if (viewForm) viewForm.classList.add('hidden');
          if (viewSuccess) viewSuccess.classList.remove('hidden');

          const elTName = document.getElementById('cvs-ticket-name');
          const elTTier = document.getElementById('cvs-ticket-tier');
          const elTTime = document.getElementById('cvs-ticket-time');
          const elTCode = document.getElementById('cvs-ticket-code');

          if (elTName) elTName.textContent = `${nameVal} 信士`;
          if (elTTier) elTTier.textContent = selectedTierName;
          if (elTTime) elTTime.textContent = timeVal;
          if (elTCode) elTCode.textContent = `FH-VIP-${Date.now().toString(36).toUpperCase()}`;

          if (window.soundEngine) {
            window.soundEngine.playSingingBowl();
          }
          showToast('已成功預約易學名師專屬詳解席位！');
        }, 800);
      });
    }

    if (btnCalendarAdd) {
      btnCalendarAdd.addEventListener('click', () => {
        const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
          encodeURIComponent('【風後奇門】易學名師一對一推演研討會') +
          '&details=' + encodeURIComponent('尊享預約方案：' + selectedTierName + '。\n請提前五分鐘進入專屬線上會議室，靜心待發。') +
          '&location=' + encodeURIComponent('風後神域線上研討室');
        window.open(url, '_blank');
        showToast('已開啟 Google 日曆預約視窗');
      });
    }

    if (btnCloseSuccess && consultModal) {
      btnCloseSuccess.addEventListener('click', () => {
        consultModal.classList.add('hidden');
      });
    }
  }

  // 14. 初始化奇門實景羅盤互動與事件
  setupLuopanEvents();

  // 15. 初始化商業付費預約閉環 Modal
  setupConsultModal();

  // 16. Service Worker 註冊 (離線秒開與 PWA 支援)
  if ('serviceWorker' in navigator && (window.location.protocol.startsWith('http') || window.location.protocol.startsWith('https'))) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('風後奇門 Service Worker registered successfully:', reg.scope);
    }).catch(err => {
      console.warn('Service Worker registration skipped/failed:', err);
    });
  }
});
