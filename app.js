/**
 * ========================================================
 * 奇門遁甲 · 風後奇門占卜堂
 * 核心應用控制器 (app.js)
 * 流程：輸入問題 -> 踏定中宮起局動畫 -> 局成輸出解盤結果
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

  const cinematicBanner = document.getElementById('cinematic-banner');
  const bannerTitle = document.getElementById('banner-title');
  const bannerSub = document.getElementById('banner-sub');

  const resultContainer = document.getElementById('result-container');
  const btnCloseResult = document.getElementById('btn-close-result');
  const btnReAsk = document.getElementById('btn-re-ask');
  const btnCopyResult = document.getElementById('btn-copy-result');

  const btnReaskTop = document.getElementById('btn-reask-top');
  const btnToggleResultTop = document.getElementById('btn-toggle-result-top');
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  const toast = document.getElementById('toast');

  let currentCategory = 'career';
  let currentReading = null;
  let isCasting = false;

  // 提示彈出函式
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // 1. 分類標籤點擊切換
  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-cat') || 'career';
    });
  });

  // 2. 快捷常見問題標籤點擊填入
  quickTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const q = tag.getAttribute('data-q');
      if (q && questionInput) {
        questionInput.value = q;
        questionInput.focus();
      }
    });
  });

  // 3. 鍵盤事件：按下 Enter 觸發起局 (Shift+Enter 換行)
  if (questionInput) {
    questionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        triggerDivination();
      }
    });
    // 聚焦輸入框
    setTimeout(() => questionInput.focus(), 300);
  }

  // 4. 起局問卜核心觸發
  function triggerDivination() {
    if (isCasting) return;
    const question = questionInput.value.trim() || '心念所向 · 當前局勢探尋';
    isCasting = true;

    // 播放起局音效
    if (window.soundEngine) {
      window.soundEngine.playStomp();
      window.soundEngine.playDiskSpin();
    }

    // 淡出輸入卡片，展現全幅 3D 奇門神域
    inquiryContainer.classList.add('hidden');
    cinematicBanner.classList.add('visible');
    bannerTitle.textContent = `【踏定中宮 · 步罡起局】`;
    bannerSub.textContent = `求問：${question}`;

    // 進行奇門遁甲演局計算
    const reading = divination.castBureau(question, currentCategory);
    currentReading = reading;

    // 啟動 3D 電影級起局動畫流程 (0~5.6s)
    renderer.startDivinationCasting(reading, {
      onPhase: (phase, text) => {
        if (phase === 'stomp') {
          bannerTitle.textContent = `【踏定中宮 · 步罡起局】`;
          bannerSub.textContent = `求問：${question}`;
        } else if (phase === 'expand') {
          bannerTitle.textContent = `【向外展環 · 渾天立體】`;
          bannerSub.textContent = `二十四山羅盤 · 九字真言符籙環 · 後天八卦爻象`;
        } else if (phase === 'directions') {
          bannerTitle.textContent = `【八方啟動 · 沖天靈光】`;
          bannerSub.textContent = `人盤八門 · 天盤九星 · 神盤八神 · 星索天柱立柱`;
        } else if (phase === 'resonance') {
          bannerTitle.textContent = `【全盤共鳴 · 鎖定落宮】`;
          bannerSub.textContent = `感應落宮：${reading.palace.name} · 四象星宿共振`;
        } else if (phase === 'complete') {
          bannerTitle.textContent = `【局成 · ${reading.outcome.verdict}】`;
          bannerSub.textContent = `${reading.palace.name} · ${reading.gate.name} · ${reading.star.name} · ${reading.deity.name}`;
        }
      },
      onComplete: () => {
        isCasting = false;
        // 隱藏電影橫幅
        cinematicBanner.classList.remove('visible');

        // 渲染並展現解盤卷軸卡片
        displayReadingResult(reading);
        resultContainer.classList.add('active');

        // 顯示頂部快捷操作按鈕
        if (btnReaskTop) btnReaskTop.classList.remove('hidden');
        if (btnToggleResultTop) btnToggleResultTop.classList.remove('hidden');

        // 播發局成琴音
        if (window.soundEngine) {
          window.soundEngine.playRingExpand(6);
        }
      }
    });
  }

  if (btnCastFortune) {
    btnCastFortune.addEventListener('click', triggerDivination);
  }

  // 5. 渲染解盤結果至卷軸
  function displayReadingResult(reading) {
    const resGrade = document.getElementById('res-grade');
    resGrade.textContent = reading.outcome.verdict;
    resGrade.style.borderColor = reading.outcome.color;
    resGrade.style.color = reading.outcome.color;

    document.getElementById('res-question').textContent = `求問之事：${reading.question}`;
    document.getElementById('res-poem').textContent = reading.poem;

    // 四盤落宮概要
    document.getElementById('res-palace').textContent = `${reading.palace.name} (${reading.palace.direction})`;
    document.getElementById('res-palace-elem').textContent = `五行：${reading.palace.element}`;

    document.getElementById('res-gate').textContent = `${reading.gate.name} (${reading.gate.type})`;
    document.getElementById('res-gate-desc').textContent = reading.gate.desc;

    document.getElementById('res-star').textContent = `${reading.star.name} (${reading.star.type})`;
    document.getElementById('res-star-desc').textContent = reading.star.desc;

    document.getElementById('res-deity').textContent = `${reading.deity.name} (${reading.deity.type})`;
    document.getElementById('res-deity-desc').textContent = reading.deity.desc;

    // 四盤深度分析
    document.getElementById('res-tian').textContent = reading.analysis.tian;
    document.getElementById('res-di').textContent = reading.analysis.di;
    document.getElementById('res-ren').textContent = reading.analysis.ren;
    document.getElementById('res-shen').textContent = reading.analysis.shen;

    // 破局之策
    document.getElementById('strat-dir').textContent = reading.strategy.direction;
    document.getElementById('strat-act').textContent = reading.strategy.action;
    document.getElementById('strat-mind').textContent = reading.strategy.mindset;

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

  // 6. 暫時收起解盤卡片，觀賞或互動 3D 常態活局
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

  // 7. 重新起局問卜 (再問一局)
  function handleReAsk() {
    resultContainer.classList.remove('active');
    cinematicBanner.classList.remove('visible');
    if (btnReaskTop) btnReaskTop.classList.add('hidden');
    if (btnToggleResultTop) btnToggleResultTop.classList.add('hidden');

    // 重置 3D 法陣回到中心待命
    renderer.resetFormation();

    // 重新展開輸入卡片
    inquiryContainer.classList.remove('hidden');
    questionInput.value = '';
    setTimeout(() => questionInput.focus(), 400);
  }

  if (btnReAsk) {
    btnReAsk.addEventListener('click', handleReAsk);
  }
  if (btnReaskTop) {
    btnReaskTop.addEventListener('click', handleReAsk);
  }

  // 8. 複製占卜摘要
  if (btnCopyResult) {
    btnCopyResult.addEventListener('click', () => {
      if (!currentReading) return;
      const r = currentReading;
      const summary = `【奇門遁甲 · 風後奇門占卜】\n` +
        `求問事項：${r.question}\n` +
        `占卜定語：${r.outcome.verdict}\n` +
        `籤詩：${r.poem}\n` +
        `四盤格局：${r.palace.name}（${r.palace.direction}）· 人盤【${r.gate.name}】· 天盤【${r.star.name}】· 神盤【${r.deity.name}】\n` +
        `破局方針：${r.strategy.action}（心法：${r.strategy.mindset}）\n` +
        `占卜時間：${r.time}`;

      navigator.clipboard.writeText(summary).then(() => {
        showToast('✨ 占卜結緣摘要已成功複製至剪貼簿！');
      }).catch(() => {
        showToast('複製失敗，請手動選取文字');
      });
    });
  }

  // 9. 音效開關切換
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
