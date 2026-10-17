/**
 * ========================================================
 * 奇門遁甲 桌面法陣呈現模組 (src/qimen-scene.js)
 * 符合 scene-contract.ts 與 chart-types.ts 規範
 * 無外部依賴 ES Module，黑金 3D 透視法陣視覺（一人之下風後奇門風格）
 * 升級亮點：
 * 1. 極致空間感：多層階梯浮空高度 (y = 0 ~ -120)、地面投影陰影、星索立柱、
 *    動態運鏡 (踏定近景俯衝 -> 展環遠景拉升 -> 八方軌道微搖 -> 局成鎖定)
 * 2. 實時視差互動：支援滑鼠游標 3D 空間視差微傾、滑鼠按住軌道旋轉、滾輪縮放、點選 3D 落宮
 * 3. 真盤動態差異：每次起動畫隨盤面資料 (陽遁順轉/陰遁逆轉、局數動量、時柱天干)
 *    產生獨特旋轉速度與軌跡；四盤於「局成」精準鎖入該盤真實八門、九星、八神、奇儀！
 * 4. 零遮蔽架構：動畫期間全屏呈現，底部電影橫幅，互動期側欄並列且支援一鍵收合
 * ========================================================
 */

export const SECTOR_ORDER = [9, 2, 7, 6, 1, 8, 3, 4];
// On-screen angles: 0 right, 90 down, -90 up. South up, east left.
export const SECTOR_ANGLES = [-90, -45, 0, 45, 90, 135, 180, 225];
export const TIMELINE = {
  durationMs: 6000,
  expandMs: 600,
  directionsMs: 1400,
  directionIntervalMs: 420,
  resonanceMs: 4800,
  completeMs: 5100,
  departureMs: 5800,
};

// 九宮標準格位排布 (南上北下，東左西右)
// [4 巽 (東南), 9 離 (正南), 2 坤 (西南)]
// [3 震 (正東), 5 中 (中央), 7 兌 (正西)]
// [8 艮 (東北), 1 坎 (正北), 6 乾 (西北)]
const GRID_PALACE_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

// 八卦 Unicode 符號對照
const BAGUA_SYMBOLS = {
  1: '☵', // 坎
  2: '☷', // 坤
  3: '☳', // 震
  4: '☴', // 巽
  5: '☯', // 中
  6: '☰', // 乾
  7: '☱', // 兌
  8: '☶', // 艮
  9: '☲', // 離
};

// 洛書九數 (洛書九宮數環)
const LUOSHU_NUMS = ['九', '二', '七', '六', '一', '八', '三', '四'];

// 後天八卦方位核心資料 (離南、坤西南、兌西、乾西北、坎北、艮東北、震東、巽東南)
const BAGUA_DATA = [
  { id: 9, name: '離', symbol: '☲', lines: [1, 0, 1], angle: -Math.PI / 2, elem: '火', color: '#f87171' },
  { id: 2, name: '坤', symbol: '☷', lines: [0, 0, 0], angle: -Math.PI / 4, elem: '土', color: '#fbbf24' },
  { id: 7, name: '兌', symbol: '☱', lines: [0, 1, 1], angle: 0, elem: '金', color: '#f3e8ff' },
  { id: 6, name: '乾', symbol: '☰', lines: [1, 1, 1], angle: Math.PI / 4, elem: '金', color: '#e2e8f0' },
  { id: 1, name: '坎', symbol: '☵', lines: [0, 1, 0], angle: Math.PI / 2, elem: '水', color: '#38bdf8' },
  { id: 8, name: '艮', symbol: '☶', lines: [1, 0, 0], angle: (Math.PI * 3) / 4, elem: '土', color: '#fbbf24' },
  { id: 3, name: '震', symbol: '☳', lines: [0, 0, 1], angle: Math.PI, elem: '木', color: '#4ade80' },
  { id: 4, name: '巽', symbol: '☴', lines: [1, 1, 0], angle: (-Math.PI * 3) / 4, elem: '木', color: '#2dd4bf' },
];

// 八門五行色彩
const GATE_COLORS = {
  休門: '#38bdf8',
  生門: '#4ade80',
  傷門: '#f43f5e',
  杜門: '#a78bfa',
  景門: '#fb923c',
  死門: '#ef4444',
  驚門: '#e879f9',
  開門: '#facc15',
};

// 二十八宿 (外周天)
const STARS_28 = [
  '角', '亢', '氐', '房', '心', '尾', '箕', // 東方青龍
  '斗', '牛', '女', '虛', '危', '室', '壁', // 北方玄武
  '奎', '婁', '胃', '昴', '畢', '觜', '參', // 西方白虎
  '井', '鬼', '柳', '星', '張', '翼', '軫',  // 南方朱雀
];

// 風水羅盤正針二十四山 (24 Mountains Feng Shui Compass)
const MOUNTAINS_24 = [
  { name: '子', color: '#38bdf8' }, { name: '癸', color: '#38bdf8' },
  { name: '丑', color: '#fbbf24' }, { name: '艮', color: '#fbbf24' }, { name: '寅', color: '#fbbf24' },
  { name: '甲', color: '#4ade80' }, { name: '卯', color: '#4ade80' }, { name: '乙', color: '#4ade80' },
  { name: '辰', color: '#2dd4bf' }, { name: '巽', color: '#2dd4bf' }, { name: '巳', color: '#2dd4bf' },
  { name: '丙', color: '#f87171' }, { name: '午', color: '#f87171' }, { name: '丁', color: '#f87171' },
  { name: '未', color: '#eab308' }, { name: '坤', color: '#eab308' }, { name: '申', color: '#eab308' },
  { name: '庚', color: '#f3e8ff' }, { name: '酉', color: '#f3e8ff' }, { name: '辛', color: '#f3e8ff' },
  { name: '戌', color: '#e2e8f0' }, { name: '乾', color: '#e2e8f0' }, { name: '亥', color: '#e2e8f0' },
  { name: '壬', color: '#38bdf8' },
];

// 道家九字真言符籙 (Nine Words Talismanic Mantra)
const NINE_MANTRAS = [
  { char: '臨', color: '#fde047' },
  { char: '兵', color: '#facc15' },
  { char: '鬥', color: '#fbbf24' },
  { char: '者', color: '#38bdf8' },
  { char: '皆', color: '#2dd4bf' },
  { char: '陣', color: '#4ade80' },
  { char: '列', color: '#a78bfa' },
  { char: '前', color: '#f87171' },
  { char: '行', color: '#ffd700' },
];

// 二十八宿四象天圖
const QUADRANTS_28 = [
  { beast: '東方青龍', color: '#2dd4bf', stars: ['角', '亢', '氐', '房', '心', '尾', '箕'] },
  { beast: '北方玄武', color: '#60a5fa', stars: ['斗', '牛', '女', '虛', '危', '室', '壁'] },
  { beast: '西方白虎', color: '#f1f5f9', stars: ['奎', '婁', '胃', '昴', '畢', '觜', '參'] },
  { beast: '南方朱雀', color: '#f87171', stars: ['井', '鬼', '柳', '星', '張', '翼', '軫'] },
];

// 階段中文說明
const PHASE_LABELS = {
  idle: '待命',
  center: '中心凝聚',
  expand: '向外展環',
  directions: '八方啟動',
  resonance: '全陣共鳴',
  complete: '局成',
  interactive: '互動作盤',
};

/**
 * 掛載奇門法陣模組
 * @param {HTMLElement} host - 掛載宿主元素
 * @param {Object} [options] - 配置參數
 * @returns {Object} Scene 控制實例
 */
export function mountQimenFormation(host, options = {}) {
  if (!host || !(host instanceof HTMLElement)) {
    throw new TypeError('mountQimenFormation: host must be a valid HTMLElement');
  }

  // 內部狀態
  let currentChart = null;
  let currentPhase = 'idle';
  let selectedPalaceId = 5; // 預設聚焦中宮
  let isDestroyed = false;
  let userReducedMotion = Boolean(options.reducedMotion);
  let isSidePanelCollapsed = false;

  // 動畫計時與播放狀態
  let isPlaying = false;
  let startTime = 0;
  let animationElapsedMs = 0;
  let rafId = null;
  let activePlayReject = null;
  let activePlayResolve = null;
  let activeAbortCleanup = null;

  // 3D 透視相機參數 (具備俯仰、航向、視角距離、震動衝擊與滑鼠空間視差)
  const camera = {
    pitch: (55 * Math.PI) / 180,
    basePitch: (55 * Math.PI) / 180,
    targetPitch: (55 * Math.PI) / 180,
    yaw: 0,
    baseYaw: 0,
    targetYaw: 0,
    distance: 710,
    baseDistance: 710,
    targetDistance: 710,
    fov: 630,
    offsetY: 12,
    shakeX: 0,
    shakeY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  };

  // 3D 裝飾光柱、衝擊波與微粒陣列
  let lightPillars = [];
  let shockwaves = [];
  let ambientParticles = [];
  let burstParticles = [];

  // 初始化 60 顆常駐 3D 飄升靈氣微粒 (分佈於空間真實立體高度 y = 0 ~ -300)
  for (let i = 0; i < 60; i++) {
    ambientParticles.push({
      x: (Math.random() - 0.5) * 620,
      y: -(Math.random() * 280),
      z: (Math.random() - 0.5) * 620,
      vy: -(0.5 + Math.random() * 1.5),
      size: 1.2 + Math.random() * 2.2,
      alpha: 0.25 + Math.random() * 0.65,
      color: Math.random() > 0.35 ? '#f5c542' : '#38bdf8',
    });
  }

  // 初始化 32 顆五行生剋地脈流光微粒
  const leylineParticles = [];
  for (let i = 0; i < 32; i++) {
    leylineParticles.push({
      t: Math.random(),
      speed: 0.0008 + Math.random() * 0.0012,
      size: 2.0 + Math.random() * 2.0,
      color: ['#38bdf8', '#4ade80', '#f87171', '#fbbf24', '#f3e8ff'][i % 5],
    });
  }

  // 檢測 OS 減少動態偏好
  const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function isReducedMotionActive() {
    return userReducedMotion || (mediaQuery ? mediaQuery.matches : false);
  }

  // 建立 DOM 結構
  const rootEl = document.createElement('div');
  rootEl.className = 'qm-scene';
  rootEl.setAttribute('data-qm-scene', 'true');
  rootEl.setAttribute('data-chart-id', '');
  rootEl.setAttribute('data-phase', 'idle');
  rootEl.setAttribute('data-reduced-motion', isReducedMotionActive() ? 'true' : 'false');

  // 3D 透視畫布
  const canvasEl = document.createElement('canvas');
  canvasEl.className = 'qm-canvas';
  rootEl.appendChild(canvasEl);

  // 白熱爆震閃光覆蓋層
  const flashOverlayEl = document.createElement('div');
  flashOverlayEl.className = 'qm-flash-overlay';
  rootEl.appendChild(flashOverlayEl);

  // 頂部資訊欄 (Facts Top Bar)
  const topBarEl = document.createElement('div');
  topBarEl.className = 'qm-top-bar';
  rootEl.appendChild(topBarEl);

  // 主版面 (Main Layout)
  const mainLayoutEl = document.createElement('div');
  mainLayoutEl.className = 'qm-main-layout';
  rootEl.appendChild(mainLayoutEl);

  // 左側/中央舞台：純粹呈現 3D 法陣，絕無任何遮擋
  const stageEl = document.createElement('div');
  stageEl.className = 'qm-formation-stage';
  mainLayoutEl.appendChild(stageEl);

  // 底部電影級字幕橫幅 (位於底部，完全不遮擋中宮與內外盤環)
  const bannerEl = document.createElement('div');
  bannerEl.className = 'qm-cinematic-banner';
  bannerEl.setAttribute('aria-hidden', 'true');
  bannerEl.innerHTML = `
    <span class="qm-banner-emblem">☯</span>
    <span class="qm-banner-title">踏定中宮</span>
    <span class="qm-banner-sep">·</span>
    <span class="qm-banner-sub">陰陽初定 · 萬象化生</span>
  `;
  stageEl.appendChild(bannerEl);

  // 右側側邊欄：九宮格與詳情卡 (動畫中隱藏，互動時滑入，支援收合)
  const sidePanelEl = document.createElement('aside');
  sidePanelEl.className = 'qm-side-panel';
  mainLayoutEl.appendChild(sidePanelEl);

  // 側邊欄頂部控制列 (含收合按鈕)
  const panelHeaderEl = document.createElement('div');
  panelHeaderEl.className = 'qm-panel-header';
  panelHeaderEl.innerHTML = `
    <div class="qm-panel-title">
      <span class="qm-panel-emblem">◫</span>
      <span>九宮遁甲盤面</span>
    </div>
  `;
  const togglePanelBtn = document.createElement('button');
  togglePanelBtn.type = 'button';
  togglePanelBtn.className = 'qm-panel-toggle-btn';
  togglePanelBtn.setAttribute('aria-label', '收合或展開九宮面板');
  togglePanelBtn.title = '收合/展開九宮面板';
  togglePanelBtn.innerHTML = `<span>◫</span> <span>收合面板</span>`;
  togglePanelBtn.addEventListener('click', () => {
    isSidePanelCollapsed = !isSidePanelCollapsed;
    sidePanelEl.classList.toggle('collapsed', isSidePanelCollapsed);
    expandTriggerBtn.classList.toggle('visible', isSidePanelCollapsed);
    togglePanelBtn.querySelector('span:last-child').textContent = isSidePanelCollapsed ? '展開' : '收合面板';
  });
  panelHeaderEl.appendChild(togglePanelBtn);
  sidePanelEl.appendChild(panelHeaderEl);

  // 獨立懸浮展開按鈕 (當面板收合時顯示於右邊緣)
  const expandTriggerBtn = document.createElement('button');
  expandTriggerBtn.type = 'button';
  expandTriggerBtn.className = 'qm-expand-trigger-btn';
  expandTriggerBtn.setAttribute('aria-label', '展開九宮盤面');
  expandTriggerBtn.title = '展開九宮盤面';
  expandTriggerBtn.innerHTML = `<span>◫</span><span>展開九宮盤</span>`;
  expandTriggerBtn.addEventListener('click', () => {
    isSidePanelCollapsed = false;
    sidePanelEl.classList.remove('collapsed');
    expandTriggerBtn.classList.remove('visible');
    togglePanelBtn.querySelector('span:last-child').textContent = '收合面板';
  });
  rootEl.appendChild(expandTriggerBtn);

  // 九宮盤容器
  const boardEl = document.createElement('div');
  boardEl.className = 'qm-board-container';
  boardEl.setAttribute('role', 'region');
  boardEl.setAttribute('aria-label', '奇門遁甲九宮盤');
  sidePanelEl.appendChild(boardEl);

  // 宮位詳情卡
  const detailCardEl = document.createElement('div');
  detailCardEl.className = 'qm-detail-card';
  detailCardEl.setAttribute('aria-live', 'polite');
  sidePanelEl.appendChild(detailCardEl);

  host.appendChild(rootEl);

  // Canvas 2D 繪圖上下文與尺寸自適應
  const ctx = canvasEl.getContext('2d');
  let width = 0;
  let height = 0;

  function resizeCanvas() {
    if (isDestroyed) return;
    const rect = rootEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });
  resizeObserver.observe(rootEl);
  resizeCanvas();

  // 3D 空間透視投影核心算法：(x, y, z) -> (sx, sy, scale, depth)
  // 納入完整 Y 軸航向角 (yaw) 與 X 軸俯仰角 (pitch)，呈現真實立體視差
  function project3D(x, y, z) {
    // 1. Yaw 圍繞 Y 軸旋轉
    const cosY = Math.cos(camera.yaw);
    const sinY = Math.sin(camera.yaw);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // 2. Pitch 圍繞 X 軸俯仰
    const cosP = Math.cos(camera.pitch);
    const sinP = Math.sin(camera.pitch);
    const y2 = y * cosP - z1 * sinP;
    const z2 = y * sinP + z1 * cosP;

    // 3. 透視收縮
    const depth = camera.distance + z2;
    if (depth <= 10) return null;

    const scale = camera.fov / depth;

    // 4. 計算法陣中心 X 座標與震動衝擊位移
    const isSidePanelVisible = (currentPhase === 'complete' || currentPhase === 'interactive') && !isPlaying && !isSidePanelCollapsed;
    const sidePanelWidth = isSidePanelVisible && sidePanelEl ? sidePanelEl.offsetWidth : 0;
    const cx = isSidePanelVisible && sidePanelWidth > 0 ? (width - sidePanelWidth) / 2 : width / 2;
    const cy = height / 2 + camera.offsetY;

    const sx = cx + x1 * scale + camera.shakeX;
    const sy = cy + y2 * scale + camera.shakeY;

    return { sx, sy, scale, depth };
  }

  // 滑鼠 3D 視差與自由軌道旋轉互動
  let isMouseInStage = false;
  stageEl.addEventListener('mouseenter', () => {
    isMouseInStage = true;
  });
  stageEl.addEventListener('mouseleave', () => {
    isMouseInStage = false;
    if (!camera.isDragging && !isPlaying) {
      camera.targetYaw = camera.baseYaw;
      camera.targetPitch = camera.basePitch;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isDestroyed || isReducedMotionActive()) return;

    if (camera.isDragging) {
      const dx = e.clientX - camera.lastMouseX;
      const dy = e.clientY - camera.lastMouseY;
      camera.lastMouseX = e.clientX;
      camera.lastMouseY = e.clientY;
      camera.targetYaw += dx * 0.005;
      camera.targetPitch = Math.max(0.35, Math.min(Math.PI / 2 - 0.08, camera.targetPitch - dy * 0.004));
      return;
    }

    if (isMouseInStage && !isPlaying) {
      const rect = rootEl.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / width - 0.5;
      const normY = (e.clientY - rect.top) / height - 0.5;
      camera.targetYaw = camera.baseYaw + normX * 0.26;
      camera.targetPitch = camera.basePitch + normY * 0.18;
    }
  });

  stageEl.addEventListener('mousedown', (e) => {
    if (isReducedMotionActive() || e.button !== 0) return;
    camera.isDragging = true;
    camera.lastMouseX = e.clientX;
    camera.lastMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    camera.isDragging = false;
  });

  // 雙擊重設 3D 視角
  stageEl.addEventListener('dblclick', () => {
    camera.targetYaw = camera.baseYaw;
    camera.targetPitch = camera.basePitch;
    camera.targetDistance = camera.baseDistance;
  });

  // 滾輪縮放視角距離 (480 ~ 980)
  stageEl.addEventListener('wheel', (e) => {
    if (isReducedMotionActive()) return;
    e.preventDefault();
    camera.targetDistance = Math.max(480, Math.min(980, camera.targetDistance + e.deltaY * 0.5));
  }, { passive: false });

  // 點選 3D 地面落宮 (支援點擊畫布直接選宮)
  stageEl.addEventListener('click', (e) => {
    if (isPlaying || camera.isDragging || !currentChart) return;
    const rect = rootEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // 檢驗九宮中哪個落宮投影與滑鼠最近 (36px 範圍)
    let bestPalace = null;
    let minDist = 40;

    GRID_PALACE_ORDER.forEach((palaceId) => {
      const idx = SECTOR_ORDER.indexOf(palaceId);
      let px = 0;
      let pz = 0;
      if (idx !== -1) {
        const rad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
        const radius = 240;
        px = Math.cos(rad) * radius;
        pz = Math.sin(rad) * radius;
      }
      const pt = project3D(px, 0, pz);
      if (pt) {
        const dist = Math.hypot(mx - pt.sx, my - pt.sy);
        if (dist < minDist) {
          minDist = dist;
          bestPalace = palaceId;
        }
      }
    });

    if (bestPalace !== null) {
      handleUserPalaceSelect(bestPalace);
    }
  });

  // 更新底部動態橫幅
  function updateBanner(title, sub) {
    if (!bannerEl) return;
    const titleEl = bannerEl.querySelector('.qm-banner-title');
    const subEl = bannerEl.querySelector('.qm-banner-sub');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = sub;
    bannerEl.classList.add('visible');
  }

  function hideBanner() {
    if (bannerEl) bannerEl.classList.remove('visible');
  }

  // 監聽 OS 偏好變更
  function handleMediaChange() {
    rootEl.setAttribute('data-reduced-motion', isReducedMotionActive() ? 'true' : 'false');
    if (isReducedMotionActive()) {
      if (isPlaying) {
        concludeAnimation('reduced-motion');
      }
      stopIdleLoop();
      drawCanvas(TIMELINE.durationMs);
    } else {
      if (!isPlaying && currentPhase === 'interactive') {
        startIdleLoop();
      }
    }
  }
  if (mediaQuery) {
    mediaQuery.addEventListener('change', handleMediaChange);
  }

  // 頁籤可見性變更 (Reconcile hidden background time)
  function handleVisibilityChange() {
    if (document.hidden) {
      stopIdleLoop();
    } else {
      if (!isPlaying && currentPhase === 'interactive' && !isReducedMotionActive()) {
        startIdleLoop();
      }
    }

    if (!isPlaying) return;
    if (!document.hidden) {
      const now = performance.now();
      animationElapsedMs = now - startTime;
      if (animationElapsedMs >= TIMELINE.durationMs) {
        concludeAnimation('completed');
      }
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 設置當前階段並回呼
  function setPhase(phase) {
    if (currentPhase === phase) return;
    currentPhase = phase;
    rootEl.setAttribute('data-phase', phase);

    // 更新頂部階段提示標籤
    const phaseIndicator = topBarEl.querySelector('.qm-phase-indicator');
    if (phaseIndicator) {
      phaseIndicator.setAttribute('data-phase', phase);
      phaseIndicator.textContent = PHASE_LABELS[phase] || phase;
    }

    if (typeof options.onPhaseChange === 'function') {
      try {
        options.onPhaseChange(phase);
      } catch (err) {
        console.error('onPhaseChange callback error:', err);
      }
    }
  }

  // 渲染頂部資訊欄
  function renderTopBar() {
    topBarEl.innerHTML = '';
    const facts = currentChart?.facts;

    const group = document.createElement('div');
    group.className = 'qm-facts-group';

    const titleBadge = document.createElement('div');
    titleBadge.className = 'qm-title-badge';
    titleBadge.innerHTML = `<span class="qm-emblem">☯</span><span>奇門遁甲</span>`;
    group.appendChild(titleBadge);

    if (facts) {
      const dunText = facts.dun === 'yang' ? `陽遁 ${facts.ju} 局` : `陰遁 ${facts.ju} 局`;
      const termText = `${facts.solarTerm || '—'} · ${facts.yuan || '—'}`;
      const pillars = facts.pillars
        ? `${facts.pillars.year} ${facts.pillars.month} ${facts.pillars.day} ${facts.pillars.hour}`
        : '—';
      const dutyStar = facts.duty?.star || '—';
      const dutyDoor = facts.duty?.door || '—';

      group.innerHTML += `
        <div class="qm-fact-pill"><span class="qm-fact-label">局象</span><span class="qm-fact-val">${dunText}</span></div>
        <div class="qm-fact-pill"><span class="qm-fact-label">節氣</span><span class="qm-fact-val">${termText}</span></div>
        <div class="qm-fact-pill"><span class="qm-fact-label">四柱</span><span class="qm-fact-val">${pillars}</span></div>
        <div class="qm-fact-pill"><span class="qm-fact-label">值符 / 值使</span><span class="qm-fact-val">${dutyStar} / ${dutyDoor}</span></div>
      `;
    }

    topBarEl.appendChild(group);

    // 控制項 (略過按鈕與階段指示)
    const ctrlGroup = document.createElement('div');
    ctrlGroup.className = 'qm-controls-group';

    const phaseInd = document.createElement('span');
    phaseInd.className = 'qm-phase-indicator';
    phaseInd.setAttribute('data-phase', currentPhase);
    phaseInd.textContent = PHASE_LABELS[currentPhase] || currentPhase;
    ctrlGroup.appendChild(phaseInd);

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'qm-skip-btn';
    skipBtn.setAttribute('data-qm-skip', 'true');
    skipBtn.setAttribute('aria-label', '略過法陣動畫');
    skipBtn.innerHTML = `<span>略過</span><span style="font-size:0.7em;opacity:0.8;">[Esc]</span>`;
    skipBtn.addEventListener('click', () => {
      skip();
    });
    ctrlGroup.appendChild(skipBtn);

    topBarEl.appendChild(ctrlGroup);
  }

  // 渲染九宮格按鈕
  function renderBoard() {
    boardEl.innerHTML = '';
    if (!currentChart || !Array.isArray(currentChart.palaces)) return;

    GRID_PALACE_ORDER.forEach((palaceId) => {
      const p = currentChart.palaces.find((item) => item.id === palaceId);
      if (!p) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qm-palace-btn';
      btn.setAttribute('data-palace-id', String(palaceId));
      btn.setAttribute('aria-pressed', palaceId === selectedPalaceId ? 'true' : 'false');
      btn.setAttribute('aria-label', `${p.name}宮 ${p.direction} 五行${p.element}`);

      const symbol = BAGUA_SYMBOLS[palaceId] || '';
      const heavenStem = p.heaven ? p.heaven : (palaceId === 5 ? '—' : '未配置');
      const earthStem = p.earth || '—';
      const doorName = p.door ? p.door : (palaceId === 5 ? '—' : '未配置');
      const starName = p.star ? p.star : (palaceId === 5 ? '—' : '未配置');
      const godName = p.god ? p.god : (palaceId === 5 ? '—' : '未配置');

      let hostedHtml = '';
      if (Array.isArray(p.hostedEarth) && p.hostedEarth.length > 0) {
        hostedHtml += `<span class="qm-hosted-stem" title="地盤寄干">+${p.hostedEarth.join('')}</span>`;
      }
      if (Array.isArray(p.hostedHeaven) && p.hostedHeaven.length > 0) {
        hostedHtml += `<span class="qm-hosted-stem" title="天盤寄干">*${p.hostedHeaven.join('')}</span>`;
      }

      btn.innerHTML = `
        <div class="qm-palace-header">
          <span class="qm-palace-name">${symbol} ${p.name}宮</span>
          <span class="qm-palace-dir">${p.direction}</span>
        </div>
        <div class="qm-palace-body">
          <div class="qm-row-god-star">
            <span class="qm-item-god">${godName}</span>
            <span class="qm-item-star">${starName}</span>
          </div>
          <div class="qm-row-door">
            <span class="qm-item-door">${doorName}</span>
            <span class="qm-item-elem">${p.element}</span>
          </div>
          <div class="qm-row-stems">
            <span class="qm-stem-heaven">${heavenStem}</span>
            <span class="qm-stem-earth">${earthStem}${hostedHtml}</span>
          </div>
        </div>
      `;

      btn.addEventListener('click', () => {
        handleUserPalaceSelect(palaceId);
      });

      boardEl.appendChild(btn);
    });
  }

  // 渲染右側選中宮位詳情
  function renderDetailCard() {
    detailCardEl.innerHTML = '';
    if (!currentChart || !Array.isArray(currentChart.palaces)) return;

    const p = currentChart.palaces.find((item) => item.id === selectedPalaceId);
    if (!p) {
      detailCardEl.innerHTML = '<div style="color:#64748b;">請選擇宮位</div>';
      return;
    }

    const symbol = BAGUA_SYMBOLS[p.id] || '';
    const heavenStem = p.heaven ?? (p.id === 5 ? '—' : '未配置');
    const earthStem = p.earth ?? '—';
    const doorName = p.door ?? (p.id === 5 ? '—' : '未配置');
    const starName = p.star ?? (p.id === 5 ? '—' : '未配置');
    const godName = p.god ?? (p.id === 5 ? '—' : '未配置');

    const hostedEarthStr = Array.isArray(p.hostedEarth) && p.hostedEarth.length > 0 ? p.hostedEarth.join('、') : '無';
    const hostedHeavenStr = Array.isArray(p.hostedHeaven) && p.hostedHeaven.length > 0 ? p.hostedHeaven.join('、') : '無';

    detailCardEl.innerHTML = `
      <div class="qm-detail-header">
        <div class="qm-detail-title">${symbol} ${p.name}宮（第 ${p.id} 宮）</div>
        <div class="qm-detail-meta">${p.direction} · 五行屬${p.element}</div>
      </div>
      <div class="qm-detail-grid">
        <div class="qm-detail-item">
          <div class="qm-detail-label">人盤 · 八門</div>
          <div class="qm-detail-val" data-field="door">${doorName}</div>
        </div>
        <div class="qm-detail-item">
          <div class="qm-detail-label">天盤 · 九星</div>
          <div class="qm-detail-val" data-field="star">${starName}</div>
        </div>
        <div class="qm-detail-item">
          <div class="qm-detail-label">神盤 · 八神</div>
          <div class="qm-detail-val" data-field="god">${godName}</div>
        </div>
        <div class="qm-detail-item">
          <div class="qm-detail-label">天盤奇儀</div>
          <div class="qm-detail-val" data-field="heaven">${heavenStem}</div>
        </div>
        <div class="qm-detail-item">
          <div class="qm-detail-label">地盤奇儀</div>
          <div class="qm-detail-val" data-field="earth">${earthStem}</div>
        </div>
        <div class="qm-detail-item">
          <div class="qm-detail-label">地盤寄干</div>
          <div class="qm-detail-val" data-field="hostedEarth">${hostedEarthStr}</div>
        </div>
        <div class="qm-detail-item">
          <div class="qm-detail-label">天盤寄干</div>
          <div class="qm-detail-val" data-field="hostedHeaven">${hostedHeavenStr}</div>
        </div>
      </div>
      ${p.id === 5 ? '<div class="qm-detail-note">※ 中五宮無獨立門、星、神，其干寄於坤二宮</div>' : ''}
    `;
  }

  // 使用者點選宮位處理 (觸發 onPalaceSelect 回呼)
  function handleUserPalaceSelect(palaceId) {
    if (selectedPalaceId === palaceId) return;
    internalSelectPalace(palaceId);

    if (typeof options.onPalaceSelect === 'function') {
      try {
        options.onPalaceSelect(palaceId);
      } catch (err) {
        console.error('onPalaceSelect callback error:', err);
      }
    }
  }

  // 內部同步選中宮位 (不觸發外部回呼)
  function internalSelectPalace(id) {
    selectedPalaceId = id;
    const buttons = boardEl.querySelectorAll('.qm-palace-btn');
    buttons.forEach((btn) => {
      const bId = Number(btn.getAttribute('data-palace-id'));
      btn.setAttribute('aria-pressed', bId === id ? 'true' : 'false');
    });
    renderDetailCard();

    // 觸發該宮位地面 3D 光芒激發
    triggerPalaceGroundPulse(id);
  }

  // 宮位被選取時在地面激發衝擊波與微粒
  function triggerPalaceGroundPulse(id) {
    const idx = SECTOR_ORDER.indexOf(id);
    let px = 0;
    let pz = 0;
    if (idx !== -1) {
      const rad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
      const radius = 240;
      px = Math.cos(rad) * radius;
      pz = Math.sin(rad) * radius;
    }
    shockwaves.push({ x: px, z: pz, r: 10, maxR: 190, life: 1, color: '#facc15' });
    lightPillars.push({ x: px, z: pz, height: 340, color: '#facc15', life: 1 });

    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4.8;
      burstParticles.push({
        x: px,
        y: 0,
        z: pz,
        vx: Math.cos(a) * spd,
        vy: -(2.5 + Math.random() * 6.5),
        vz: Math.sin(a) * spd,
        size: 2 + Math.random() * 2.5,
        alpha: 1,
        color: '#facc15',
      });
    }
  }

  // 全局鍵盤事件監聽 (Esc 略過)
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      skip();
    }
  }
  window.addEventListener('keydown', handleKeyDown);

  // ========================================================
  // 3D 透視黑金法陣畫布繪圖引擎 (Canvas 2D 3D Perspective)
  // ========================================================
  function drawCanvas(elapsed) {
    if (isDestroyed || !ctx) return;
    ctx.clearRect(0, 0, width, height);

    // 平滑插值相機參數 (平滑跟隨滑鼠視差與運鏡)
    if (!isReducedMotionActive()) {
      camera.yaw += (camera.targetYaw - camera.yaw) * 0.08;
      camera.pitch += (camera.targetPitch - camera.pitch) * 0.08;
      camera.distance += (camera.targetDistance - camera.distance) * 0.08;
    }

    // 宇宙星空深邃暗角背景光
    renderCosmicBackdrop();

    const baseRadius = Math.min(width, height) * 0.44;

    // 減少動態模式：只繪製靜態溫潤法環，不旋轉、不閃爍
    if (isReducedMotionActive()) {
      drawStaticFormation(baseRadius);
      return;
    }

    const t = Math.max(0, elapsed);

    // 1. 地面透視九宮網格 (Ground Perspective Grid: y = 0)
    drawPerspectiveGroundGrid(baseRadius * 1.35);

    // 2. 展開進度計算 (0 -> 1)
    let expandRatio = 1.0;
    if (t < TIMELINE.expandMs) {
      expandRatio = (t / TIMELINE.expandMs) * 0.32;
    } else if (t < TIMELINE.directionsMs) {
      const p = (t - TIMELINE.expandMs) / (TIMELINE.directionsMs - TIMELINE.expandMs);
      expandRatio = 0.32 + 0.68 * Math.sin((p * Math.PI) / 2);
    }
    const currentR = baseRadius * expandRatio;

    // 1.1 地脈龍穴金裂紋 (Dragon Veins on y = 0)
    if (expandRatio > 0.18) {
      drawDragonVeins(t, currentR);
    }

    // 1.2 五行生剋地脈流光 (Flowing Qi Stream on y = 0)
    if (expandRatio > 0.28) {
      drawFiveElementsLeylineFlow(t, currentR);
    }

    // 1.3 風水正針二十四山刻度盤 (24 Mountains Compass on y = 0)
    if (expandRatio > 0.38) {
      draw24MountainsDisk(t, currentR);
    }

    // 3. 繪製浮空法環地面投影陰影 (Ambient Occlusion Shadow on Ground)
    if (expandRatio > 0.15) {
      drawGroundDropShadows(currentR);
    }

    // 4. 繪製中心太極陰陽雙魚 (Center Taiji: y = -4)
    draw3DTaiji(t, Math.min(58, currentR * 0.25));

    // 5. 繪製足踏中宮道者剪影 (Taoist Sorcerer Silhouette)
    draw3DSorcererSilhouette(t);

    // 6. 繪製立體多層奇門同心法盤 (Layered Floating Disks at Staggered Heights)
    if (expandRatio > 0.12) {
      draw3DLayeredAstrolabe(t, currentR);
    }

    // 7. 繪製星索天柱立柱與八方卦爻符號、神聖幾何結界 (Vertical Struts & Trigrams)
    if (expandRatio > 0.28) {
      draw3DTrigramsAndSectors(t, currentR);
    }

    // 8. 沖天靈氣光柱 (Light Pillars from y = 0 to y = -380)
    draw3DLightPillars(t);

    // 9. 地面爆震衝擊波與光環脈衝 (Shockwaves)
    draw3DShockwaves(t);

    // 10. 浮空飄升靈氣微粒與爆發火星 (3D Volumetric Particles)
    draw3DParticles(t);
  }

  // 0. 繪製背景星空深邃光暈
  function renderCosmicBackdrop() {
    const isSidePanelVisible = (currentPhase === 'complete' || currentPhase === 'interactive') && !isPlaying && !isSidePanelCollapsed;
    const sidePanelWidth = isSidePanelVisible && sidePanelEl ? sidePanelEl.offsetWidth : 0;
    const cx = isSidePanelVisible && sidePanelWidth > 0 ? (width - sidePanelWidth) / 2 : width / 2;
    const cy = height / 2 + camera.offsetY;

    const isYang = currentChart?.facts?.dun === 'yang';
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.65);
    if (isYang) {
      grad.addColorStop(0, 'rgba(42, 30, 10, 0.45)');
      grad.addColorStop(0.45, 'rgba(12, 16, 26, 0.28)');
    } else {
      grad.addColorStop(0, 'rgba(10, 32, 46, 0.45)');
      grad.addColorStop(0.45, 'rgba(8, 14, 28, 0.28)');
    }
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 1. 繪製地面透視九宮網格 (y = 0)
  function drawPerspectiveGroundGrid(size) {
    const step = size / 3;
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.12)';
    ctx.lineWidth = 1;

    for (let i = -size; i <= size; i += step) {
      const p1 = project3D(i, 0, -size);
      const p2 = project3D(i, 0, size);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }

      const p3 = project3D(-size, 0, i);
      const p4 = project3D(size, 0, i);
      if (p3 && p4) {
        ctx.beginPath();
        ctx.moveTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 1.1 繪製風水地脈金裂痕 (Dragon Veins on y = 0)
  function drawDragonVeins(elapsed, radius) {
    if (radius <= 20) return;
    ctx.save();
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.32;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p0 = project3D(0, 0, 0);
      const pEnd = project3D(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      if (p0 && pEnd) {
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(pEnd.sx, pEnd.sy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 1.2 繪製五行生剋地脈流光 (Flowing Qi Stream on y = 0)
  function drawFiveElementsLeylineFlow(elapsed, radius) {
    if (radius <= 30) return;
    const circuitAngles = [
      -Math.PI / 2,     // 坎水
      Math.PI,          // 震木
      Math.PI * 3 / 4,  // 巽木
      Math.PI / 2,      // 離火
      Math.PI / 4,      // 坤土
      -Math.PI * 3 / 4, // 艮土
      0,                // 兌金
      -Math.PI / 4,     // 乾金
    ];
    const circuitR = radius * 0.72;

    ctx.save();
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    let first = true;
    circuitAngles.forEach((ang) => {
      const pt = project3D(Math.cos(ang) * circuitR, 0, Math.sin(ang) * circuitR);
      if (pt) {
        if (first) { ctx.moveTo(pt.sx, pt.sy); first = false; }
        else { ctx.lineTo(pt.sx, pt.sy); }
      }
    });
    ctx.closePath();
    ctx.stroke();

    // 流動五行光粒
    leylineParticles.forEach((lp) => {
      lp.t = (lp.t + lp.speed) % 1;
      const totalSegs = circuitAngles.length;
      const globalT = lp.t * totalSegs;
      const segIdx = Math.floor(globalT) % totalSegs;
      const nextIdx = (segIdx + 1) % totalSegs;
      const localT = globalT - segIdx;

      const a1 = circuitAngles[segIdx];
      const a2 = circuitAngles[nextIdx];
      const curA = a1 + (a2 - a1) * localT;
      const pt = project3D(Math.cos(curA) * circuitR, 0, Math.sin(curA) * circuitR);
      if (pt) {
        ctx.fillStyle = lp.color;
        ctx.shadowColor = lp.color;
        ctx.shadowBlur = 8 * pt.scale;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, lp.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // 1.3 繪製風水正針二十四山刻度環 (y = 0)
  function draw24MountainsDisk(elapsed, radius) {
    if (radius <= 40) return;
    const rMount = radius * 0.98;
    draw3DCircle(0, 0, 0, rMount, '#f5c542', 1.8, 0.45);
    draw3DCircle(0, 0, 0, rMount * 0.94, 'rgba(245, 197, 66, 0.35)', 1, 0.25);

    const isYang = currentChart?.facts?.dun === 'yang';
    const rot = (elapsed * 0.0002) * (isYang ? -1 : 1);
    MOUNTAINS_24.forEach((item, i) => {
      const a = rot + (i / 24) * Math.PI * 2;
      const x = Math.cos(a) * (rMount * 0.96);
      const z = Math.sin(a) * (rMount * 0.96);

      if (i % 3 === 0) {
        const ptTick = project3D(Math.cos(a) * rMount, 0, Math.sin(a) * rMount);
        if (ptTick) {
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(ptTick.sx, ptTick.sy, 2.2 * ptTick.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      draw3DText(item.name, x, 0, z, 11, item.color, 0.75);
    });
  }

  // 3. 繪製浮空法環在地面上的柔和陰影 (Ambient Occlusion on y = 0)
  function drawGroundDropShadows(radius) {
    draw3DCircle(0, 0, 0, radius * 0.35, 'rgba(0, 0, 0, 0.5)', 4, 0.4);
    draw3DCircle(0, 0, 0, radius * 0.60, 'rgba(0, 0, 0, 0.4)', 6, 0.35);
    draw3DCircle(0, 0, 0, radius * 0.85, 'rgba(0, 0, 0, 0.35)', 8, 0.3);
  }

  // 4. 繪製中心太極陰陽雙魚 (y = -4)
  function draw3DTaiji(elapsed, radius) {
    if (radius <= 2) return;
    const segs = 40;
    const isYang = currentChart?.facts?.dun === 'yang';
    const dirSign = isYang ? 1 : -1;

    // 太極雙魚盤旋方向依陽/陰遁；局成後保持悠長仙氣慢速呼吸旋轉
    let angleOffset = 0;
    if (elapsed <= TIMELINE.completeMs) {
      angleOffset = elapsed * 0.0026 * dirSign;
    } else {
      const idleTime = elapsed - TIMELINE.completeMs;
      angleOffset = (TIMELINE.completeMs * 0.0026 + idleTime * 0.00065) * dirSign;
    }

    // 陽金半邊
    ctx.save();
    ctx.fillStyle = isYang ? '#f5c542' : '#38bdf8';
    ctx.beginPath();
    for (let i = 0; i <= segs / 2; i++) {
      const a = angleOffset + (i / segs) * Math.PI * 2;
      const pt = project3D(Math.cos(a) * radius, -4, Math.sin(a) * radius);
      if (pt) {
        if (i === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
    }
    const centerPt = project3D(0, -4, 0);
    if (centerPt) ctx.lineTo(centerPt.sx, centerPt.sy);
    ctx.closePath();
    ctx.fill();

    // 陰黑半邊
    ctx.fillStyle = '#070911';
    ctx.beginPath();
    for (let i = segs / 2; i <= segs; i++) {
      const a = angleOffset + (i / segs) * Math.PI * 2;
      const pt = project3D(Math.cos(a) * radius, -4, Math.sin(a) * radius);
      if (pt) {
        if (i === segs / 2) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
    }
    if (centerPt) ctx.lineTo(centerPt.sx, centerPt.sy);
    ctx.closePath();
    ctx.fill();

    // 陰陽雙眼
    const eyeDist = radius * 0.48;
    const eyeR = radius * 0.16;
    const ptEye1 = project3D(Math.cos(angleOffset + Math.PI / 2) * eyeDist, -4, Math.sin(angleOffset + Math.PI / 2) * eyeDist);
    const ptEye2 = project3D(Math.cos(angleOffset - Math.PI / 2) * eyeDist, -4, Math.sin(angleOffset - Math.PI / 2) * eyeDist);

    if (ptEye1) {
      ctx.fillStyle = '#070911';
      ctx.beginPath();
      ctx.arc(ptEye1.sx, ptEye1.sy, eyeR * ptEye1.scale, 0, Math.PI * 2);
      ctx.fill();
    }
    if (ptEye2) {
      ctx.fillStyle = isYang ? '#f5c542' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(ptEye2.sx, ptEye2.sy, eyeR * ptEye2.scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 太極外金環與呼吸光暈 (y = -4)
    const taijiPulse = elapsed > TIMELINE.completeMs ? Math.sin((elapsed - TIMELINE.completeMs) * 0.003) * 0.04 : 0;
    draw3DCircle(0, -4, 0, radius * (1 + taijiPulse), '#fde047', 2.2, 0.9);
    draw3DCircle(0, -4, 0, radius * 1.15 * (1 + taijiPulse), 'rgba(245, 197, 66, 0.45)', 1, 0.55);

    ctx.restore();
  }

  // 5. 繪製足踏中宮道者剪影 (Taoist Sorcerer Silhouette)
  function draw3DSorcererSilhouette(elapsed) {
    const pt = project3D(0, -4, 0);
    if (!pt) return;

    const scale = pt.scale * 1.25;
    const cx = pt.sx;
    const cy = pt.sy;

    ctx.save();
    ctx.translate(cx, cy);

    // 腳下踏定光環 (Pulsing footstep grounding ring)
    const pulse = Math.sin(elapsed * 0.005) * 0.15;
    ctx.fillStyle = '#f5c542';
    ctx.globalAlpha = 0.5 + pulse;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * scale, 11 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 飄逸道袍剪影
    ctx.fillStyle = '#0a0d14';
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.95;

    const sway = Math.sin(elapsed * 0.003) * 4 * scale;

    ctx.beginPath();
    ctx.moveTo(-11 * scale, -8 * scale);
    ctx.quadraticCurveTo(-16 * scale + sway, -38 * scale, -9 * scale, -66 * scale); // 左裙擺
    ctx.lineTo(9 * scale, -66 * scale); // 肩
    ctx.quadraticCurveTo(16 * scale - sway, -38 * scale, 11 * scale, -8 * scale); // 右裙擺
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 道冠髮髻
    ctx.beginPath();
    ctx.arc(0, -78 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 拂塵 / 靈氣微光
    ctx.fillStyle = '#fde047';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(0, -42 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 6. 繪製立體多層奇門同心法盤 (Layered Astrolabe Disks at Floating Heights)
  // 浮空高度階梯：
  // 洛書九數 (y = -14) -> 八卦 (y = -28) -> 人盤八門 (y = -48)
  // -> 天盤九星 (y = -70) -> 神盤八神 (y = -94) -> 二十八宿 (y = -120)
  function draw3DLayeredAstrolabe(elapsed, radius) {
    const isYang = currentChart?.facts?.dun === 'yang';
    const ju = currentChart?.facts?.ju || 1;
    const dirSign = isYang ? 1 : -1;
    const speedMult = 0.85 + (ju % 5) * 0.12;

    // 動態旋轉量：在展開期快速旋轉，4800ms 共鳴後阻尼歸位，5100ms 局成精確鎖入落宮
    let spinAngle = 0;
    if (elapsed < TIMELINE.resonanceMs) {
      const p = Math.max(0, (elapsed - TIMELINE.expandMs) / (TIMELINE.resonanceMs - TIMELINE.expandMs));
      spinAngle = dirSign * (1 - Math.pow(1 - p, 2.2)) * Math.PI * 4 * speedMult;
    } else if (elapsed < TIMELINE.completeMs) {
      const p = (elapsed - TIMELINE.resonanceMs) / (TIMELINE.completeMs - TIMELINE.resonanceMs);
      const ease = 1 - Math.sin((p * Math.PI) / 2);
      spinAngle = dirSign * ease * 0.6;
    } else {
      // 局成後極微幅天地呼吸漂移 (八門鎖定落宮)
      spinAngle = Math.sin((elapsed - TIMELINE.completeMs) * 0.0006) * 0.012;
    }

    // 各層浮空高度呼吸 (Floating Levitation Breathing)
    const floatPulse = (elapsed > TIMELINE.completeMs)
      ? Math.sin((elapsed - TIMELINE.completeMs) * 0.0016)
      : 0;

    // --- A. 洛書九宮數環 (y ≈ -14, r ≈ 0.34) ---
    const yLuoshu = -14 + floatPulse * 0.8;
    const rLuoshu = radius * 0.34;
    draw3DCircle(0, yLuoshu, 0, rLuoshu, 'rgba(245, 197, 66, 0.45)', 1.5, 0.6);
    LUOSHU_NUMS.forEach((num, i) => {
      const a = spinAngle * -0.7 + (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * rLuoshu;
      const z = Math.sin(a) * rLuoshu;
      draw3DText(num, x, yLuoshu, z, 13, '#ffe082', 0.85);
    });

    // --- A2. 道家九字真言符籙環 (y ≈ -36, r ≈ 0.42) ---
    const yMantra = -36 + floatPulse * 0.9;
    const rMantra = radius * 0.42;
    drawNineMantrasRing(elapsed, rMantra, yMantra);

    // --- B. 後天八卦爻象盤 (y ≈ -28, r ≈ 0.48) ---
    const yBagua = -28 + floatPulse * 1.0;
    const rBagua = radius * 0.48;
    draw3DCircle(0, yBagua, 0, rBagua, 'rgba(245, 197, 66, 0.55)', 1.8, 0.7);

    // --- C. 人盤八門環 (y ≈ -48, r ≈ 0.64) ---
    const yMen = -48 + floatPulse * 1.2;
    const rMen = radius * 0.64;
    draw3DCircle(0, yMen, 0, rMen, 'rgba(245, 197, 66, 0.52)', 2, 0.75);
    draw3DCircle(0, yMen, 0, rMen * 0.88, 'rgba(245, 197, 66, 0.25)', 1, 0.4);

    // 依當前盤面真盤分配渲染八門
    SECTOR_ORDER.forEach((palaceId, idx) => {
      const baseRad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
      const a = baseRad + spinAngle * 1.1;
      const pData = currentChart?.palaces?.find((p) => p.id === palaceId);
      const doorName = pData?.door || '休門';
      const doorColor = GATE_COLORS[doorName] || '#38bdf8';

      const x = Math.cos(a) * (rMen * 0.94);
      const z = Math.sin(a) * (rMen * 0.94);
      draw3DText(doorName, x, yMen, z, 14, doorColor, 0.9, true);

      // 隔斷立柱射線
      const sepA = a + Math.PI / 8;
      const p1 = project3D(Math.cos(sepA) * (rMen * 0.88), yMen, Math.sin(sepA) * (rMen * 0.88));
      const p2 = project3D(Math.cos(sepA) * rMen, yMen, Math.sin(sepA) * rMen);
      if (p1 && p2) {
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 197, 66, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
        ctx.restore();
      }
    });

    // --- D. 天盤九星環 (y ≈ -70, r ≈ 0.80) ---
    const yXing = -70 + floatPulse * 1.5;
    const rXing = radius * 0.80;
    draw3DCircle(0, yXing, 0, rXing, 'rgba(56, 189, 248, 0.5)', 1.8, 0.7);

    SECTOR_ORDER.forEach((palaceId, idx) => {
      const baseRad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
      const a = baseRad + spinAngle * -0.9;
      const pData = currentChart?.palaces?.find((p) => p.id === palaceId);
      const starName = pData?.star || '天蓬';
      const isDutyStar = currentChart?.facts?.duty?.star && starName.includes(currentChart.facts.duty.star);

      const x = Math.cos(a) * rXing;
      const z = Math.sin(a) * rXing;
      draw3DText(starName, x, yXing, z, 14, isDutyStar ? '#fde047' : '#70ffff', 0.9, isDutyStar);
    });

    // --- E. 神盤八神環 (y ≈ -94, r ≈ 0.94) ---
    const yShen = -94 + floatPulse * 1.8;
    const rShen = radius * 0.94;
    draw3DCircle(0, yShen, 0, rShen, 'rgba(245, 197, 66, 0.6)', 2, 0.8);

    SECTOR_ORDER.forEach((palaceId, idx) => {
      const baseRad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
      const a = baseRad + spinAngle * 1.3;
      const pData = currentChart?.palaces?.find((p) => p.id === palaceId);
      const godName = pData?.god || '值符';
      const isLeader = godName === '值符';

      const x = Math.cos(a) * rShen;
      const z = Math.sin(a) * rShen;
      draw3DText(godName, x, yShen, z, 14, isLeader ? '#fde047' : '#ffd54f', 0.95, isLeader);
    });

    // --- F. 外周天二十八宿周天環 (y ≈ -120, r ≈ 1.08) ---
    const yXiu = -120 + floatPulse * 1.4;
    const rXiu = radius * 1.08;
    draw3DCircle(0, yXiu, 0, rXiu, 'rgba(245, 197, 66, 0.38)', 1.5, 0.6);
    draw3DCircle(0, yXiu, 0, rXiu * 1.04, 'rgba(56, 189, 248, 0.28)', 1, 0.45);

    const idleStarDrift = (elapsed > TIMELINE.completeMs) ? (elapsed - TIMELINE.completeMs) * 0.00015 * dirSign : 0;
    const starCount = STARS_28.length;
    let curQuadrant = -1;
    let lastPt = null;

    STARS_28.forEach((sName, i) => {
      const qIdx = Math.floor(i / 7);
      const qColor = QUADRANTS_28[qIdx]?.color || '#cbd5e1';
      const a = (spinAngle * 0.25 + idleStarDrift) + (i / starCount) * Math.PI * 2;
      const x = Math.cos(a) * rXiu;
      const z = Math.sin(a) * rXiu;
      draw3DText(sName, x, yXiu, z, 12, qColor, 0.85);

      // 外周星宿發光節點 (星光明滅閃爍)
      const ptStar = project3D(Math.cos(a) * (rXiu * 1.04), yXiu, Math.sin(a) * (rXiu * 1.04));
      if (ptStar) {
        ctx.save();
        const twinkle = 0.5 + Math.sin(elapsed * 0.003 + i) * 0.45;
        ctx.fillStyle = qColor;
        ctx.globalAlpha = twinkle;
        ctx.shadowColor = qColor;
        ctx.shadowBlur = 8 * ptStar.scale;
        ctx.beginPath();
        ctx.arc(ptStar.sx, ptStar.sy, 2.4 * ptStar.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 四象同宮星官骨架幾何連線
        if (qIdx === curQuadrant && lastPt) {
          ctx.save();
          ctx.strokeStyle = qColor;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.moveTo(lastPt.sx, lastPt.sy);
          ctx.lineTo(ptStar.sx, ptStar.sy);
          ctx.stroke();
          ctx.restore();
        }
        curQuadrant = qIdx;
        lastPt = ptStar;
      }
    });
  }

  // 繪製道家九字真言金色符籙金環 (y ≈ -36)
  function drawNineMantrasRing(elapsed, radius, yMantra) {
    if (radius <= 20) return;
    draw3DCircle(0, yMantra, 0, radius, 'rgba(245, 197, 66, 0.65)', 2, 0.7);
    draw3DCircle(0, yMantra, 0, radius * 1.08, 'rgba(253, 224, 71, 0.35)', 1, 0.4);

    const isYang = currentChart?.facts?.dun === 'yang';
    const rot = (elapsed * 0.0006) * (isYang ? 1 : -1);
    const count = NINE_MANTRAS.length;
    for (let i = 0; i < count; i++) {
      const m = NINE_MANTRAS[i];
      const a = rot + (i / count) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;

      const ptM = project3D(x, yMantra, z);
      if (ptM) {
        ctx.save();
        ctx.fillStyle = 'rgba(245, 197, 66, 0.18)';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ptM.sx, ptM.sy, 11 * ptM.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      draw3DText(m.char, x, yMantra, z, 14, m.color, 0.95, true);
    }
  }

  // 7. 繪製星索天柱立柱、八方卦爻符號與神聖幾何結界
  function draw3DTrigramsAndSectors(elapsed, radius) {
    const activePalaceCoords = [];

    BAGUA_DATA.forEach((bg) => {
      const palaceId = bg.id;
      const idx = SECTOR_ORDER.indexOf(palaceId);
      const angleDeg = idx !== -1 ? SECTOR_ANGLES[idx] : 0;
      const rad = (angleDeg * Math.PI) / 180;
      const targetTime = idx !== -1 ? TIMELINE.directionsMs + idx * TIMELINE.directionIntervalMs : 0;
      const isActivated = elapsed >= targetTime;

      const px = Math.cos(rad) * radius * 0.95;
      const pz = Math.sin(rad) * radius * 0.95;

      // 方位射線 (Ground: Center to Rim)
      const p0 = project3D(0, 0, 0);
      const pDest = project3D(px, 0, pz);
      if (p0 && pDest) {
        ctx.save();
        ctx.strokeStyle = isActivated ? 'rgba(245, 197, 66, 0.65)' : 'rgba(245, 197, 66, 0.14)';
        ctx.lineWidth = isActivated ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(pDest.sx, pDest.sy);
        ctx.stroke();
        ctx.restore();
      }

      const isSelected = selectedPalaceId === palaceId;

      // 星索天柱：從地面 y = 0 向上貫穿至浮空天盤 y = -120 的立體金色光柱索線
      const pBase = project3D(px, 0, pz);
      const pSky = project3D(px, -120, pz);
      if (pBase && pSky) {
        ctx.save();
        if (isSelected) {
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2.4;
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = isActivated ? 'rgba(245, 197, 66, 0.55)' : 'rgba(245, 197, 66, 0.12)';
          ctx.lineWidth = isActivated ? 1.5 : 1;
        }
        ctx.beginPath();
        ctx.moveTo(pBase.sx, pBase.sy);
        ctx.lineTo(pSky.sx, pSky.sy);
        ctx.stroke();
        ctx.restore();
      }

      if (isActivated && pBase) {
        activePalaceCoords.push({ sx: pBase.sx, sy: pBase.sy });
        if (isSelected) {
          const pulseR = 28 + Math.sin(elapsed * 0.005) * 5;
          draw3DCircle(px, 0, pz, pulseR, '#fde047', 2, 0.85);
        }
      }

      // 八卦文字與 Unicode 符號 (y = -28, r ≈ 0.48)
      const yBagua = -28;
      const rBagua = radius * 0.48;
      const xBagua = Math.cos(rad) * rBagua;
      const zBagua = Math.sin(rad) * rBagua;
      const charColor = isActivated ? (isSelected ? '#fff' : bg.color) : 'rgba(245, 197, 66, 0.4)';
      draw3DText(`${bg.name} ${bg.symbol}`, xBagua, yBagua, zBagua, 16, charColor, isActivated ? 1 : 0.6, true);

      // 繪製八卦三爻線條 (陽爻 —、陰爻 --) (y = -28, r ≈ 0.40)
      const trigramDist = radius * 0.40;
      draw3DTrigramLines(rad, yBagua, trigramDist, bg.lines, isActivated ? '#fde047' : 'rgba(245, 197, 66, 0.28)');

      // 地盤奇儀天干 (y = 0 地面落宮節點)
      const pData = currentChart?.palaces?.find((p) => p.id === palaceId);
      if (pData && isActivated) {
        const xStem = Math.cos(rad) * (radius * 0.82);
        const zStem = Math.sin(rad) * (radius * 0.82);
        const stemText = `${pData.heaven || ''}${pData.earth || ''}`;
        draw3DText(stemText, xStem, 0, zStem, 12, isSelected ? '#ffffff' : '#fde047', 0.9);
      }
    });

    // 八方神聖幾何結界光網 (連線相鄰已啟動方位)
    if (activePalaceCoords.length >= 2) {
      ctx.save();
      const leylineAlpha = elapsed >= TIMELINE.resonanceMs
        ? 0.35 + Math.sin(elapsed * 0.002) * 0.15
        : 0.28;
      ctx.strokeStyle = `rgba(245, 197, 66, ${leylineAlpha})`;
      ctx.lineWidth = elapsed >= TIMELINE.resonanceMs && elapsed < TIMELINE.completeMs ? 2 : 1.2;
      ctx.beginPath();
      for (let i = 0; i < activePalaceCoords.length; i++) {
        const pt = activePalaceCoords[i];
        if (i === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
      if (activePalaceCoords.length === 8) {
        ctx.closePath();
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // 繪製三爻符號 (陽爻一條完整連線，陰爻斷為兩截)
  function draw3DTrigramLines(angle, y, r, lines, color) {
    const tangent = angle + Math.PI / 2;
    const len = 13;

    lines.forEach((isYang, lineIdx) => {
      const curR = r - lineIdx * 5.5;
      const cx = Math.cos(angle) * curR;
      const cz = Math.sin(angle) * curR;

      if (isYang) {
        // 陽爻：連線
        const p1 = project3D(cx - Math.cos(tangent) * len, y, cz - Math.sin(tangent) * len);
        const p2 = project3D(cx + Math.cos(tangent) * len, y, cz + Math.sin(tangent) * len);
        if (p1 && p2) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.2 * p1.scale;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();
          ctx.restore();
        }
      } else {
        // 陰爻：斷為兩截
        const halfLen = len * 0.42;
        const gap = len * 0.16;
        const pA1 = project3D(cx - Math.cos(tangent) * len, y, cz - Math.sin(tangent) * len);
        const pA2 = project3D(cx - Math.cos(tangent) * gap, y, cz - Math.sin(tangent) * gap);
        const pB1 = project3D(cx + Math.cos(tangent) * gap, y, cz + Math.sin(tangent) * gap);
        const pB2 = project3D(cx + Math.cos(tangent) * len, y, cz + Math.sin(tangent) * len);
        if (pA1 && pA2 && pB1 && pB2) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.2 * pA1.scale;
          ctx.beginPath();
          ctx.moveTo(pA1.sx, pA1.sy);
          ctx.lineTo(pA2.sx, pA2.sy);
          ctx.moveTo(pB1.sx, pB1.sy);
          ctx.lineTo(pB2.sx, pB2.sy);
          ctx.stroke();
          ctx.restore();
        }
      }
    });
  }

  // 8. 繪製 3D 空間文字 (文字永遠保持直立，不扭曲、不隨盤面轉動)
  function draw3DText(text, x, y, z, fontSize, color, alpha = 1, isBold = false) {
    const pt = project3D(x, y, z);
    if (!pt) return;
    const size = fontSize * pt.scale;
    if (size < 6) return;

    ctx.save();
    ctx.font = `${isBold ? '700 ' : '500 '}${Math.round(size)}px "Noto Serif TC", "Songti TC", "Microsoft YaHei", serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * pt.scale;
    ctx.fillText(text, pt.sx, pt.sy);
    ctx.restore();
  }

  // 9. 繪製 3D 沖天靈氣光柱 (Light Pillars from y = 0 to y = -height)
  function draw3DLightPillars(elapsed) {
    // 遍歷當前瞬態活躍光柱
    lightPillars = lightPillars.filter((p) => {
      const pBase = project3D(p.x, 0, p.z);
      const pTop = project3D(p.x, -p.height, p.z);
      if (pBase && pTop) {
        ctx.save();
        const grad = ctx.createLinearGradient(pBase.sx, pBase.sy, pTop.sx, pTop.sy);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.65, p.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.globalAlpha = p.life * 0.8;
        const beamW = 22 * pBase.scale;
        ctx.fillRect(pBase.sx - beamW / 2, pTop.sy, beamW, pBase.sy - pTop.sy);
        ctx.restore();
      }
      p.life -= 0.016;
      return p.life > 0;
    });

    // 八方光柱繪製：播放期 8 方逐一啟動，局成後轉為值符/值使與選中宮位之長明靈柱
    if (elapsed < TIMELINE.completeMs) {
      SECTOR_ORDER.forEach((palaceId, idx) => {
        const activateTime = TIMELINE.directionsMs + idx * TIMELINE.directionIntervalMs;
        if (elapsed >= activateTime) {
          const rad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
          const radius = 240;
          const px = Math.cos(rad) * radius;
          const pz = Math.sin(rad) * radius;

          const pBase = project3D(px, 0, pz);
          // 共鳴階段 (4800-5100ms) 光柱暴漲
          const isResonance = elapsed >= TIMELINE.resonanceMs && elapsed < TIMELINE.completeMs;
          const pillarH = isResonance ? 400 : 250;
          const pTop = project3D(px, -pillarH, pz);

          if (pBase && pTop) {
            ctx.save();
            const grad = ctx.createLinearGradient(pBase.sx, pBase.sy, pTop.sx, pTop.sy);
            grad.addColorStop(0, '#facc15');
            grad.addColorStop(0.6, idx % 2 === 0 ? '#fde047' : '#38bdf8');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grad;
            ctx.globalAlpha = isResonance ? 0.95 : 0.55;
            const beamW = (isResonance ? 28 : 18) * pBase.scale;
            ctx.fillRect(pBase.sx - beamW / 2, pTop.sy, beamW, pBase.sy - pTop.sy);
            ctx.restore();
          }
        }
      });
    } else {
      // 局成與互動模式 (5100ms+ 常駐活局)：
      // 值符星位、值使門位與當前選中宮位長明照耀，帶有呼吸靈動律動
      const dutyStar = currentChart?.facts?.duty?.star;
      const dutyDoor = currentChart?.facts?.duty?.door;

      SECTOR_ORDER.forEach((palaceId, idx) => {
        const pData = currentChart?.palaces?.find((p) => p.id === palaceId);
        const isDutyStar = dutyStar && pData?.star && pData.star.includes(dutyStar);
        const isDutyDoor = dutyDoor && pData?.door && pData.door.includes(dutyDoor);
        const isSelected = selectedPalaceId === palaceId;

        if (isDutyStar || isDutyDoor || isSelected) {
          const rad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
          const radius = 240;
          const px = Math.cos(rad) * radius;
          const pz = Math.sin(rad) * radius;

          const pillarH = isSelected ? 340 : 270;
          const pBase = project3D(px, 0, pz);
          const pTop = project3D(px, -pillarH, pz);

          if (pBase && pTop) {
            ctx.save();
            const beamColor = isSelected
              ? '#facc15'
              : (isDutyStar ? '#fde047' : '#38bdf8');

            const pulse = Math.sin(elapsed * 0.003 + idx) * 0.14;
            const alpha = isSelected ? (0.68 + pulse) : (0.40 + pulse);

            const grad = ctx.createLinearGradient(pBase.sx, pBase.sy, pTop.sx, pTop.sy);
            grad.addColorStop(0, beamColor);
            grad.addColorStop(0.55, beamColor);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grad;
            ctx.globalAlpha = Math.max(0.18, alpha);
            const beamW = (isSelected ? 24 : 16) * pBase.scale;
            ctx.fillRect(pBase.sx - beamW / 2, pTop.sy, beamW, pBase.sy - pTop.sy);
            ctx.restore();
          }
        }
      });
    }
  }

  // 10. 繪製 3D 地面衝擊波
  function draw3DShockwaves(elapsed) {
    shockwaves = shockwaves.filter((sw) => {
      draw3DCircle(sw.x, 0, sw.z, sw.r, sw.color, 2.8, sw.life * 0.9);
      sw.r += (sw.maxR - sw.r) * 0.12;
      sw.life -= 0.026;
      return sw.life > 0;
    });

    // 共鳴階段全陣金色震撼大衝擊波
    if (elapsed >= TIMELINE.resonanceMs && elapsed < TIMELINE.completeMs) {
      const p = (elapsed - TIMELINE.resonanceMs) / (TIMELINE.completeMs - TIMELINE.resonanceMs);
      const r = 240 + p * 280;
      draw3DCircle(0, 0, 0, r, '#facc15', 3.8, (1 - p) * 0.9);
      draw3DCircle(0, 0, 0, r * 0.7, '#ffffff', 2, (1 - p) * 0.8);
    }
  }

  // 11. 繪製浮空靈氣微粒與爆發火星 (3D Volumetric Particles)
  function draw3DParticles(elapsed) {
    ctx.save();

    // 常駐浮空靈氣微粒 (升騰流動)
    ambientParticles.forEach((p) => {
      p.y += p.vy;
      p.x += Math.sin(elapsed * 0.001 + p.size) * 0.2;
      p.z += Math.cos(elapsed * 0.001 + p.size) * 0.2;
      if (p.y < -300) {
        p.y = 0;
        p.x = (Math.random() - 0.5) * 620;
        p.z = (Math.random() - 0.5) * 620;
      }
      const pt = project3D(p.x, p.y, p.z);
      if (pt) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, p.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 爆發瞬間火星微粒
    burstParticles = burstParticles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.vy += 0.08; // 微重力
      p.alpha -= 0.025;

      const pt = project3D(p.x, p.y, p.z);
      if (pt && p.alpha > 0) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, p.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      return p.alpha > 0;
    });

    ctx.restore();
  }

  // 靜態溫潤法環 (無動態模式)
  function drawStaticFormation(radius) {
    drawPerspectiveGroundGrid(radius * 1.25);
    draw3DCircle(0, 0, 0, radius, 'rgba(245, 197, 66, 0.4)', 2, 0.7);
    draw3DCircle(0, -28, 0, radius * 0.8, 'rgba(245, 197, 66, 0.3)', 1.5, 0.5);
    draw3DCircle(0, -70, 0, radius * 0.5, 'rgba(245, 197, 66, 0.3)', 1, 0.5);

    SECTOR_ANGLES.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const p0 = project3D(0, 0, 0);
      const pDest = project3D(Math.cos(rad) * radius, 0, Math.sin(rad) * radius);
      if (p0 && pDest) {
        ctx.strokeStyle = 'rgba(245, 197, 66, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(pDest.sx, pDest.sy);
        ctx.stroke();
      }
    });

    draw3DTaiji(0, 52);
    draw3DSorcererSilhouette(0);
  }

  // 輔助：繪製 3D 空間圓環 (支援任意 y 軸浮空高度)
  function draw3DCircle(x, y, z, radius, color, lineWidth, alpha = 1) {
    if (radius <= 2) return;
    const segs = 48;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = alpha;
    ctx.beginPath();

    let first = true;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const pt = project3D(x + Math.cos(a) * radius, y, z + Math.sin(a) * radius);
      if (pt) {
        if (first) {
          ctx.moveTo(pt.sx, pt.sy);
          first = false;
        } else {
          ctx.lineTo(pt.sx, pt.sy);
        }
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // ========================================================
  // 動畫主循環控制器
  // ========================================================
  let lastActivatedSectorIdx = -1;

  function animationLoop(timestamp) {
    if (isDestroyed || !isPlaying) return;

    if (!startTime) {
      startTime = timestamp;
      // 0ms 白熱爆震閃光
      flashOverlayEl.classList.add('active');
      setTimeout(() => flashOverlayEl.classList.remove('active'), 450);

      // 踏定中宮瞬間相機微晃
      camera.shakeX = (Math.random() - 0.5) * 12;
      camera.shakeY = (Math.random() - 0.5) * 8;

      // 中心太極足踏衝擊波爆震
      shockwaves.push({ x: 0, z: 0, r: 10, maxR: 380, life: 1, color: '#ffffff' });
      shockwaves.push({ x: 0, z: 0, r: 10, maxR: 540, life: 1, color: '#f5c542' });
      shockwaves.push({ x: 0, z: 0, r: 10, maxR: 720, life: 1, color: '#eab308' });

      // 中心噴發 75 顆靈氣金火
      for (let i = 0; i < 75; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 8.5;
        burstParticles.push({
          x: 0,
          y: -4,
          z: 0,
          vx: Math.cos(a) * spd,
          vy: -(3.5 + Math.random() * 11),
          vz: Math.sin(a) * spd,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: Math.random() > 0.35 ? '#f5c542' : '#38bdf8',
        });
      }

      updateBanner('踏定中宮', '陰陽初定 · 萬象化生');
    }

    const elapsed = timestamp - startTime;
    animationElapsedMs = elapsed;

    // 動態相機軌跡運鏡控制
    if (!isReducedMotionActive()) {
      if (elapsed < TIMELINE.expandMs) {
        // 0-600ms: 低視角英雄近景 (pitch = 44°, distance = 540)
        camera.targetPitch = (44 * Math.PI) / 180;
        camera.targetDistance = 540;
        camera.targetYaw = 0;
        // 踏定餘震衰減
        const decay = Math.exp(-elapsed / 160);
        camera.shakeX = Math.sin(elapsed * 0.06) * 6 * decay;
        camera.shakeY = Math.cos(elapsed * 0.08) * 4 * decay;
      } else if (elapsed < TIMELINE.directionsMs) {
        // 600-1400ms: 展環遠景大拉升 (distance 540 -> 710, pitch 44° -> 55°)
        const p = (elapsed - TIMELINE.expandMs) / (TIMELINE.directionsMs - TIMELINE.expandMs);
        const ease = 1 - Math.pow(1 - p, 3);
        camera.targetDistance = 540 + (camera.baseDistance - 540) * ease;
        camera.targetPitch = (44 + (55 - 44) * ease) * (Math.PI / 180);
        camera.shakeX = 0;
        camera.shakeY = 0;
      } else if (elapsed < TIMELINE.resonanceMs) {
        // 1400-4800ms: 八方啟動時的細膩天體微搖視差 (yaw ±0.035, pitch ±1.5°)
        const timeSince = elapsed - TIMELINE.directionsMs;
        camera.targetYaw = Math.sin(timeSince * 0.0013) * 0.038;
        camera.targetPitch = camera.basePitch + Math.cos(timeSince * 0.0011) * 0.026;
      } else if (elapsed < TIMELINE.completeMs) {
        // 4800-5100ms: 共鳴高頻微幅共振
        camera.shakeX = Math.sin((elapsed - TIMELINE.resonanceMs) * 0.05) * 2.2;
        camera.shakeY = Math.cos((elapsed - TIMELINE.resonanceMs) * 0.05) * 1.5;
        camera.targetYaw = 0;
        camera.targetPitch = camera.basePitch;
      } else {
        // 5100-6000ms: 局成穩重回歸
        camera.shakeX = 0;
        camera.shakeY = 0;
        camera.targetYaw = camera.baseYaw;
        camera.targetPitch = camera.basePitch;
        camera.targetDistance = camera.baseDistance;
      }
    }

    // 計算當前時序階段與底部電影級橫幅
    if (elapsed < TIMELINE.expandMs) {
      setPhase('center');
    } else if (elapsed < TIMELINE.directionsMs) {
      setPhase('expand');
      updateBanner('四盤展環', '天地人神 · 流轉八荒');
    } else if (elapsed < TIMELINE.resonanceMs) {
      setPhase('directions');
      updateSectorButtonHighlight(elapsed);
    } else if (elapsed < TIMELINE.completeMs) {
      setPhase('resonance');
      updateBanner('全盤共鳴', '八方同振 · 氣衝霄漢');
    } else if (elapsed < TIMELINE.departureMs) {
      setPhase('complete');
      updateBanner('局 成', '天機入盤 · 吉凶自顯');
    } else if (elapsed < TIMELINE.durationMs) {
      // 5800 - 6000: 退場過渡
    } else {
      // 6000ms 完成
      concludeAnimation('completed');
      return;
    }

    drawCanvas(elapsed);
    rafId = requestAnimationFrame(animationLoop);
  }

  // 根據經過時間點亮八方按鈕並激發沖天光柱
  function updateSectorButtonHighlight(elapsed) {
    SECTOR_ORDER.forEach((palaceId, idx) => {
      const activateTime = TIMELINE.directionsMs + idx * TIMELINE.directionIntervalMs;
      const btn = boardEl.querySelector(`.qm-palace-btn[data-palace-id="${palaceId}"]`);
      if (btn) {
        if (elapsed >= activateTime) {
          btn.classList.add('qm-sector-active');
          if (idx > lastActivatedSectorIdx) {
            lastActivatedSectorIdx = idx;
            const rad = (SECTOR_ANGLES[idx] * Math.PI) / 180;
            const radius = 240;
            const px = Math.cos(rad) * radius;
            const pz = Math.sin(rad) * radius;

            // 激發該方位地面衝擊波與沖天光柱
            shockwaves.push({ x: px, z: pz, r: 8, maxR: 170, life: 1, color: '#fde047' });
            shockwaves.push({ x: px, z: pz, r: 8, maxR: 230, life: 1, color: '#ffffff' });
            lightPillars.push({ x: px, z: pz, height: 340, color: '#facc15', life: 1 });

            // 噴發方位金星微粒
            for (let i = 0; i < 28; i++) {
              const a = Math.random() * Math.PI * 2;
              const spd = 1.8 + Math.random() * 5.5;
              burstParticles.push({
                x: px,
                y: 0,
                z: pz,
                vx: Math.cos(a) * spd,
                vy: -(3 + Math.random() * 8),
                vz: Math.sin(a) * spd,
                size: 2 + Math.random() * 2.5,
                alpha: 1,
                color: idx % 2 === 0 ? '#fde047' : '#38bdf8',
              });
            }

            // 更新橫幅顯示當前被啟動之宮位
            const palace = currentChart?.palaces?.find((p) => p.id === palaceId);
            if (palace) {
              updateBanner(`${palace.name}宮（第 ${palace.id} 宮 · ${palace.direction}）`, `${palace.door || '吉門'}位啟動 · 沖天靈光`);
            }
          }
        } else {
          btn.classList.remove('qm-sector-active');
        }
      }
    });
  }

  // ========================================================
  // 局成常態活局主循環 (Living Idle Formation Loop)
  // 動畫結束後絕不死止，保持太極雙魚長轉、天體歲差、懸浮微粒與即時視差
  // ========================================================
  let idleRafId = null;
  let idleTimeStart = 0;

  function startIdleLoop() {
    if (isDestroyed || isReducedMotionActive() || isPlaying) return;
    if (idleRafId) return;

    idleTimeStart = performance.now();

    function idleLoop(now) {
      if (isDestroyed || isReducedMotionActive() || isPlaying) {
        idleRafId = null;
        return;
      }

      // 基準時間從 TIMELINE.durationMs 累加，保持物理呼吸持續運算
      const idleElapsed = TIMELINE.durationMs + (now - idleTimeStart);
      drawCanvas(idleElapsed);

      idleRafId = requestAnimationFrame(idleLoop);
    }

    idleRafId = requestAnimationFrame(idleLoop);
  }

  function stopIdleLoop() {
    if (idleRafId) {
      cancelAnimationFrame(idleRafId);
      idleRafId = null;
    }
  }

  // 結束動畫並結算 Promise
  function concludeAnimation(status) {
    isPlaying = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    lastActivatedSectorIdx = -1;
    flashOverlayEl.classList.remove('active');
    hideBanner();

    camera.shakeX = 0;
    camera.shakeY = 0;
    camera.targetYaw = camera.baseYaw;
    camera.targetPitch = camera.basePitch;
    camera.targetDistance = camera.baseDistance;

    const buttons = boardEl.querySelectorAll('.qm-palace-btn');
    buttons.forEach((b) => b.classList.remove('qm-sector-active'));

    setPhase('interactive');
    drawCanvas(TIMELINE.durationMs);

    if (activePlayResolve) {
      const result = {
        status,
        chartId: currentChart ? currentChart.id : '',
        elapsedMs: Math.round(animationElapsedMs),
      };
      const resolveFn = activePlayResolve;
      activePlayResolve = null;
      activePlayReject = null;
      if (activeAbortCleanup) {
        activeAbortCleanup();
        activeAbortCleanup = null;
      }
      resolveFn(result);
    }

    // 動畫結算後立即啟動常駐活局
    startIdleLoop();
  }

  // 取消當前播放
  function cancelCurrentPlay() {
    if (isPlaying) {
      isPlaying = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastActivatedSectorIdx = -1;
      flashOverlayEl.classList.remove('active');
      hideBanner();

      camera.shakeX = 0;
      camera.shakeY = 0;
      camera.targetYaw = camera.baseYaw;
      camera.targetPitch = camera.basePitch;
      camera.targetDistance = camera.baseDistance;

      if (activePlayResolve) {
        const result = {
          status: 'cancelled',
          chartId: currentChart ? currentChart.id : '',
          elapsedMs: Math.round(animationElapsedMs),
        };
        const resolveFn = activePlayResolve;
        activePlayResolve = null;
        activePlayReject = null;
        if (activeAbortCleanup) {
          activeAbortCleanup();
          activeAbortCleanup = null;
        }
        resolveFn(result);
      }
    }
  }

  // ========================================================
  // 外部 Scene 接口實作
  // ========================================================

  /**
   * 顯示該 Chart 的靜態互動盤，取消舊播放
   */
  function setChart(chart) {
    if (isDestroyed) return;
    if (!chart || typeof chart !== 'object') {
      throw new TypeError('setChart: chart must be a valid Chart object');
    }

    cancelCurrentPlay();
    stopIdleLoop();

    currentChart = chart;
    rootEl.setAttribute('data-chart-id', chart.id || '');
    selectedPalaceId = 5;

    renderTopBar();
    renderBoard();
    renderDetailCard();

    setPhase('interactive');
    drawCanvas(TIMELINE.durationMs);
    startIdleLoop();
  }

  /**
   * 播放六秒法陣展開動畫
   * @param {Object} chart
   * @param {Object} [playOptions]
   * @returns {Promise<PlayResult>}
   */
  function play(chart, playOptions = {}) {
    if (isDestroyed) {
      return Promise.resolve({
        status: 'cancelled',
        chartId: chart?.id || '',
        elapsedMs: 0,
      });
    }

    if (!chart || typeof chart !== 'object') {
      return Promise.reject(new TypeError('play: chart must be a valid Chart object'));
    }

    cancelCurrentPlay();
    stopIdleLoop();

    currentChart = chart;
    rootEl.setAttribute('data-chart-id', chart.id || '');
    selectedPalaceId = 5;

    renderTopBar();
    renderBoard();
    renderDetailCard();

    const signal = playOptions?.signal;
    if (signal && signal.aborted) {
      setPhase('interactive');
      drawCanvas(TIMELINE.durationMs);
      startIdleLoop();
      return Promise.resolve({
        status: 'cancelled',
        chartId: chart.id || '',
        elapsedMs: 0,
      });
    }

    if (isReducedMotionActive()) {
      setPhase('interactive');
      drawCanvas(TIMELINE.durationMs);
      return Promise.resolve({
        status: 'reduced-motion',
        chartId: chart.id || '',
        elapsedMs: 0,
      });
    }

    // 啟動動畫
    isPlaying = true;
    startTime = 0;
    animationElapsedMs = 0;
    lastActivatedSectorIdx = -1;
    setPhase('center');

    return new Promise((resolve, reject) => {
      activePlayResolve = resolve;
      activePlayReject = reject;

      if (signal) {
        const onAbort = () => {
          concludeAnimation('cancelled');
        };
        signal.addEventListener('abort', onAbort, { once: true });
        activeAbortCleanup = () => signal.removeEventListener('abort', onAbort);
      }

      rafId = requestAnimationFrame(animationLoop);
    });
  }

  /**
   * 立即略過動畫進入互動盤
   */
  function skip() {
    if (isDestroyed) return;
    if (isPlaying) {
      concludeAnimation('skipped');
    }
  }

  /**
   * 外部程式選中宮位 1-9 (null 清除)
   */
  function selectPalace(palaceId) {
    if (isDestroyed) return;
    if (palaceId === null) {
      selectedPalaceId = null;
      const buttons = boardEl.querySelectorAll('.qm-palace-btn');
      buttons.forEach((btn) => btn.setAttribute('aria-pressed', 'false'));
      renderDetailCard();
      return;
    }

    const num = Number(palaceId);
    if (num >= 1 && num <= 9) {
      internalSelectPalace(num);
    }
  }

  /**
   * 設置減少動態偏好
   */
  function setReducedMotion(reducedMotion) {
    if (isDestroyed) return;
    userReducedMotion = Boolean(reducedMotion);
    handleMediaChange();
  }

  /**
   * 銷毀模組，釋放資源
   */
  function destroy() {
    if (isDestroyed) return;
    isDestroyed = true;

    cancelCurrentPlay();
    stopIdleLoop();

    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleMediaChange);
    }
    resizeObserver.disconnect();

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (rootEl.parentNode) {
      rootEl.parentNode.removeChild(rootEl);
    }
  }

  return {
    setChart,
    play,
    skip,
    selectPalace,
    setReducedMotion,
    destroy,
  };
}
