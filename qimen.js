/**
 * ========================================================
 * 奇門遁甲 · 3D 動態神域起局引擎 (Qimen Canvas 3D Engine v2.0)
 * 融匯道門步罡踏斗、風水二十四山、四象二十八宿、五行生剋與九字真言
 * 完美呈現【風後奇門】之極致電影級起局神韻
 * ========================================================
 */

class QimenRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 陣法核心狀態
    this.theme = 'fenghou'; // 'fenghou' (玄黑真金) | 'wuhou' (青玉太虛)
    this.isDeployed = false;
    this.deployProgress = 0;   // 0 -> 1 展開進度
    this.deployAnimTime = 0;   // 展開計時 (秒)
    this.animTime = 0;         // 全局動畫時間 (秒)

    // 電影級 3D 相機系統 (俯仰、航向、視角距離、震動位移與平滑阻尼)
    this.camera = {
      pitch: 58 * Math.PI / 180,
      basePitch: 58 * Math.PI / 180,
      targetPitch: 58 * Math.PI / 180,
      yaw: 0,
      baseYaw: 0,
      targetYaw: 0,
      distance: 750,
      baseDistance: 750,
      targetDistance: 750,
      fov: 680,
      offsetY: 28,
      shakeX: 0,
      shakeY: 0,
      trauma: 0,
      isAutoRotate: false,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0
    };

    // 奇門四盤獨立旋轉角速度與角度 (風後奇門特權：隨心撥動)
    this.disks = {
      taiji: 0,
      luoshu: 0,
      mantra: 0,   // 九字真言符籙環
      mountains: 0,// 二十四山風水盤
      bagua: 0,
      men: 0,      // 人盤八門
      xing: 0,     // 天盤九星
      shen: 0,     // 神盤八神
      xiu: 0,      // 二十八宿四象天球環
      // 自轉速度
      speedTaiji: 0.018,
      speedLuoshu: -0.003,
      speedMantra: 0.006,
      speedMountains: -0.001,
      speedBagua: -0.003,
      speedMen: 0.004,
      speedXing: -0.002,
      speedShen: 0.003,
      speedXiu: -0.0008
    };

    // 陣法視覺元素隊列
    this.shockwaves = [];
    this.particles = [];
    this.ambientMotes = [];  // 常駐向上飄升之靈氣微粒
    this.pillars = [];
    this.spells = [];        // 活躍法術特效 (土河車、火流星、亂金柝等)
    this.leylineParticles = []; // 五行生剋地脈流光微粒

    // 初始化文化與星宿數據
    this.initData();

    // 初始化常駐 3D 浮空靈氣微粒
    this.initAmbientMotes();

    // 初始化五行生剋地脈流動粒子
    this.initLeylineParticles();

    // 綁定滑鼠與觸控事件
    this.initEvents();

    // 尺寸自適應
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // 啟動 60 FPS 渲染循環
    this.lastTime = performance.now();
    this.startLoop();
  }

  // 60 FPS 主畫面循環 (Update & Render Loop)
  startLoop() {
    const loop = (currentTime) => {
      const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.update(delta);
      this.render();

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  // 1. 初始化奇門遁甲與風水堪輿核心資料庫
  initData() {
    // A. 風水羅盤正針二十四山 (24 Mountains Feng Shui Compass)
    // 依天心方位八方分配：壬子癸(北·坎)、丑艮寅(東北·艮)、甲卯乙(東·震)、辰巽巳(東南·巽)
    // 丙午丁(南·離)、未坤申(西南·坤)、庚酉辛(西·兌)、戌乾亥(西北·乾)
    this.mountains24 = [
      { name: '子', angle: -Math.PI / 2, color: '#38bdf8', trigram: '坎' },
      { name: '癸', angle: -Math.PI / 2 + (15 * Math.PI / 180), color: '#38bdf8', trigram: '坎' },
      { name: '丑', angle: -Math.PI / 2 + (30 * Math.PI / 180), color: '#fbbf24', trigram: '艮' },
      { name: '艮', angle: -Math.PI / 2 + (45 * Math.PI / 180), color: '#fbbf24', trigram: '艮' },
      { name: '寅', angle: -Math.PI / 2 + (60 * Math.PI / 180), color: '#fbbf24', trigram: '艮' },
      { name: '甲', angle: -Math.PI / 2 + (75 * Math.PI / 180), color: '#4ade80', trigram: '震' },
      { name: '卯', angle: -Math.PI / 2 + (90 * Math.PI / 180), color: '#4ade80', trigram: '震' },
      { name: '乙', angle: -Math.PI / 2 + (105 * Math.PI / 180), color: '#4ade80', trigram: '震' },
      { name: '辰', angle: -Math.PI / 2 + (120 * Math.PI / 180), color: '#2dd4bf', trigram: '巽' },
      { name: '巽', angle: -Math.PI / 2 + (135 * Math.PI / 180), color: '#2dd4bf', trigram: '巽' },
      { name: '巳', angle: -Math.PI / 2 + (150 * Math.PI / 180), color: '#2dd4bf', trigram: '巽' },
      { name: '丙', angle: -Math.PI / 2 + (165 * Math.PI / 180), color: '#f87171', trigram: '離' },
      { name: '午', angle: -Math.PI / 2 + (180 * Math.PI / 180), color: '#f87171', trigram: '離' },
      { name: '丁', angle: -Math.PI / 2 + (195 * Math.PI / 180), color: '#f87171', trigram: '離' },
      { name: '未', angle: -Math.PI / 2 + (210 * Math.PI / 180), color: '#eab308', trigram: '坤' },
      { name: '坤', angle: -Math.PI / 2 + (225 * Math.PI / 180), color: '#eab308', trigram: '坤' },
      { name: '申', angle: -Math.PI / 2 + (240 * Math.PI / 180), color: '#eab308', trigram: '坤' },
      { name: '庚', angle: -Math.PI / 2 + (255 * Math.PI / 180), color: '#f3e8ff', trigram: '兌' },
      { name: '酉', angle: -Math.PI / 2 + (270 * Math.PI / 180), color: '#f3e8ff', trigram: '兌' },
      { name: '辛', angle: -Math.PI / 2 + (285 * Math.PI / 180), color: '#f3e8ff', trigram: '兌' },
      { name: '戌', angle: -Math.PI / 2 + (300 * Math.PI / 180), color: '#e2e8f0', trigram: '乾' },
      { name: '乾', angle: -Math.PI / 2 + (315 * Math.PI / 180), color: '#e2e8f0', trigram: '乾' },
      { name: '亥', angle: -Math.PI / 2 + (330 * Math.PI / 180), color: '#e2e8f0', trigram: '乾' },
      { name: '壬', angle: -Math.PI / 2 + (345 * Math.PI / 180), color: '#38bdf8', trigram: '坎' },
    ];

    // B. 道家九字真言符籙 (Nine Words Talismanic Mantra)
    this.nineMantras = [
      { char: '臨', seal: '天元泰定 · 身心不動', color: '#fde047' },
      { char: '兵', seal: '萬法不侵 · 金光護體', color: '#facc15' },
      { char: '鬥', seal: '乾坤借法 · 破滅陰邪', color: '#fbbf24' },
      { char: '者', seal: '萬物化生 · 支配自如', color: '#38bdf8' },
      { char: '皆', seal: '心通九幽 · 識破虛妄', color: '#2dd4bf' },
      { char: '陣', seal: '踏定中宮 · 我即方位', color: '#4ade80' },
      { char: '列', seal: '時空裂隙 · 顛倒陰陽', color: '#a78bfa' },
      { char: '前', seal: '五行生剋 · 執掌造化', color: '#f87171' },
      { char: '行', seal: '大道至簡 · 歸真萬象', color: '#ffd700' }
    ];

    // C. 洛書九星紫白盤 (Luoshu 9 Purple-White Stars)
    this.luoshuData = [
      { num: '一白', palace: '坎水', color: '#38bdf8', angle: -Math.PI / 2 },
      { num: '八白', palace: '艮土', color: '#fbbf24', angle: -Math.PI * 3 / 4 },
      { num: '三碧', palace: '震木', color: '#4ade80', angle: Math.PI },
      { num: '四綠', palace: '巽木', color: '#2dd4bf', angle: Math.PI * 3 / 4 },
      { num: '九紫', palace: '離火', color: '#f87171', angle: Math.PI / 2 },
      { num: '二黑', palace: '坤土', color: '#ca8a04', angle: Math.PI / 4 },
      { num: '七赤', palace: '兌金', color: '#f3e8ff', angle: 0 },
      { num: '六白', palace: '乾金', color: '#e2e8f0', angle: -Math.PI / 4 }
    ];

    // D. 後天八卦盤 (Bagua)
    this.baguaData = [
      { name: '坎', palaceId: 1, symbol: '☵', lines: [0, 1, 0], angle: -Math.PI / 2, element: '水', color: '#38bdf8' },
      { name: '艮', palaceId: 8, symbol: '☶', lines: [1, 0, 0], angle: -Math.PI * 3 / 4, element: '土', color: '#fbbf24' },
      { name: '震', palaceId: 3, symbol: '☳', lines: [0, 0, 1], angle: Math.PI, element: '木', color: '#4ade80' },
      { name: '巽', palaceId: 4, symbol: '☴', lines: [1, 1, 0], angle: Math.PI * 3 / 4, element: '木', color: '#2dd4bf' },
      { name: '離', palaceId: 9, symbol: '☲', lines: [1, 0, 1], angle: Math.PI / 2, element: '火', color: '#f87171' },
      { name: '坤', palaceId: 2, symbol: '☷', lines: [0, 0, 0], angle: Math.PI / 4, element: '土', color: '#eab308' },
      { name: '兌', palaceId: 7, symbol: '☱', lines: [0, 1, 1], angle: 0, element: '金', color: '#f3e8ff' },
      { name: '乾', palaceId: 6, symbol: '☰', lines: [1, 1, 1], angle: -Math.PI / 4, element: '金', color: '#e2e8f0' }
    ];

    // E. 人盤八門 (Eight Gates)
    this.bamenData = [
      { name: '休門', type: '吉', desc: '水', color: '#67e8f9', element: '水' },
      { name: '生門', type: '大吉', desc: '土', color: '#4ade80', element: '土' },
      { name: '傷門', type: '凶', desc: '木', color: '#f43f5e', element: '木' },
      { name: '杜門', type: '平', desc: '木', color: '#a78bfa', element: '木' },
      { name: '景門', type: '吉', desc: '火', color: '#fb923c', element: '火' },
      { name: '死門', type: '大凶', desc: '土', color: '#ef4444', element: '土' },
      { name: '驚門', type: '凶', desc: '金', color: '#e879f9', element: '金' },
      { name: '開門', type: '大吉', desc: '金', color: '#facc15', element: '金' }
    ];

    // F. 天盤九星 (Nine Stars)
    this.jiuxingData = ['天蓬', '天任', '天沖', '天輔', '天英', '天芮', '天柱', '天心'];

    // G. 神盤八神 (Eight Deities)
    this.bashenData = ['值符', '螣蛇', '太陰', '六合', '白虎', '玄武', '九地', '九天'];

    // H. 二十八宿四象天圖 (Four Symbols & 28 Lunar Mansions)
    this.quadrants28 = [
      {
        beast: '東方青龍',
        color: '#2dd4bf',
        stars: ['角', '亢', '氐', '房', '心', '尾', '箕']
      },
      {
        beast: '北方玄武',
        color: '#60a5fa',
        stars: ['斗', '牛', '女', '虛', '危', '室', '壁']
      },
      {
        beast: '西方白虎',
        color: '#f1f5f9',
        stars: ['奎', '婁', '胃', '昴', '畢', '觜', '參']
      },
      {
        beast: '南方朱雀',
        color: '#f87171',
        stars: ['井', '鬼', '柳', '星', '張', '翼', '軫']
      }
    ];

    // 扁平二十八宿清單
    this.stars28 = [];
    this.quadrants28.forEach(q => {
      q.stars.forEach(s => {
        this.stars28.push({ name: s, beast: q.beast, color: q.color });
      });
    });
  }

  // 初始化 70 顆常駐空間靈氣微粒 (升騰流動於 y = 0 ~ -320)
  initAmbientMotes() {
    this.ambientMotes = [];
    for (let i = 0; i < 70; i++) {
      this.ambientMotes.push({
        x: (Math.random() - 0.5) * 660,
        y: -(Math.random() * 320),
        z: (Math.random() - 0.5) * 660,
        vy: -(0.6 + Math.random() * 1.6),
        size: 1.2 + Math.random() * 2.6,
        alpha: 0.2 + Math.random() * 0.7,
        color: Math.random() > 0.35 ? '#f5c542' : '#38bdf8'
      });
    }
  }

  // 初始化五行生剋地脈流光微粒 (沿八宮相生流動: 坎水->震木->離火->坤土->兌金->坎水)
  initLeylineParticles() {
    this.leylineParticles = [];
    for (let i = 0; i < 32; i++) {
      this.leylineParticles.push({
        t: Math.random(), // 0 -> 1 環循路徑進度
        speed: 0.0008 + Math.random() * 0.0012,
        size: 2.2 + Math.random() * 2.2,
        color: ['#38bdf8', '#4ade80', '#f87171', '#fbbf24', '#f3e8ff'][i % 5]
      });
    }
  }

  // 畫布尺寸自適應與高解析支援
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  // ========================================================
  // 3D 空間透視核心投影算法 (Project 3D)
  // 支援 Yaw 航向、Pitch 俯仰、相機衝擊微震與景深縮放
  // ========================================================
  project3D(x, y, z) {
    // 1. 圍繞 Y 軸旋轉 (Yaw)
    const cosY = Math.cos(this.camera.yaw);
    const sinY = Math.sin(this.camera.yaw);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // 2. 圍繞 X 軸俯仰 (Pitch)
    const cosP = Math.cos(this.camera.pitch);
    const sinP = Math.sin(this.camera.pitch);
    const y2 = y * cosP - z1 * sinP;
    const z2 = y * sinP + z1 * cosP;

    // 3. 透視收縮
    const depth = this.camera.distance + z2;
    if (depth <= 10) return null; // 相機背面裁切

    const scale = this.camera.fov / depth;
    const offX = this.width > 1000 ? this.width * 0.17 : 0;
    const sx = this.width / 2 + offX + x1 * scale + this.camera.shakeX;
    const sy = this.height / 2 + y2 * scale + this.camera.offsetY + this.camera.shakeY;

    return { sx, sy, scale, depth };
  }

  // 滑鼠與觸控事件監聽
  initEvents() {
    const c = this.canvas;

    let clickStartX = 0, clickStartY = 0, isClickDrag = false;

    // 滑鼠游標掠過畫布：產生細膩物理視差傾斜
    window.addEventListener('mousemove', (e) => {
      if (this.camera.isDragging) {
        const dx = e.clientX - this.camera.lastMouseX;
        const dy = e.clientY - this.camera.lastMouseY;
        this.camera.lastMouseX = e.clientX;
        this.camera.lastMouseY = e.clientY;

        if (Math.abs(e.clientX - clickStartX) > 6 || Math.abs(e.clientY - clickStartY) > 6) {
          isClickDrag = true;
        }

        this.camera.targetYaw += dx * 0.005;
        this.camera.targetPitch = Math.max(0.22, Math.min(Math.PI / 2 - 0.06, this.camera.targetPitch - dy * 0.004));
        return;
      }

      // 未拖曳時的柔和視差感應
      const normX = (e.clientX / this.width) - 0.5;
      const normY = (e.clientY / this.height) - 0.5;
      this.camera.targetYaw = this.camera.baseYaw + normX * 0.28;
      this.camera.targetPitch = this.camera.basePitch + normY * 0.18;
    });

    c.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.camera.isDragging = true;
      this.camera.lastMouseX = e.clientX;
      this.camera.lastMouseY = e.clientY;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      isClickDrag = false;
    });

    window.addEventListener('mouseup', () => {
      this.camera.isDragging = false;
    });

    // 點選 3D 九宮探查
    c.addEventListener('click', (e) => {
      if (isClickDrag) return;
      const rect = c.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 檢查是否點擊中八宮 (以八卦盤為準)
      const radius = 220;
      const yLevel = -80;
      const rot = this.disks.bagua;
      for (const item of this.baguaData) {
        const a = rot + (this.baguaData.indexOf(item) / 8) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const z = Math.sin(a) * radius;
        const pt = this.project3D(x, yLevel, z);
        if (pt) {
          const dist = Math.hypot(clickX - pt.sx, clickY - pt.sy);
          if (dist < 50 * pt.scale) {
            this.focusPalace(item.palaceId);
            if (typeof this.onPalaceClick === 'function') {
              this.onPalaceClick(item.palaceId);
            }
            break;
          }
        }
      }
    });

    // 雙擊重置視角
    c.addEventListener('dblclick', () => {
      this.camera.targetYaw = this.camera.baseYaw;
      this.camera.targetPitch = this.camera.basePitch;
      this.camera.targetDistance = this.camera.baseDistance;
    });

    // 滾輪縮放視角距離 (320 ~ 1350)
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.targetDistance = Math.max(320, Math.min(1350, this.camera.targetDistance + e.deltaY * 0.65));
    }, { passive: false });

    // 觸控手勢支援 (單指旋轉 + 雙指捏合縮放)
    let touchStartX = 0, touchStartY = 0;
    let initialPinchDistance = 0;
    let initialCameraDist = 750;

    c.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.camera.isDragging = true;
      } else if (e.touches.length === 2) {
        this.camera.isDragging = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialCameraDist = this.camera.targetDistance;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.camera.isDragging) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        this.camera.targetYaw += dx * 0.006;
        this.camera.targetPitch = Math.max(0.22, Math.min(Math.PI / 2 - 0.06, this.camera.targetPitch - dy * 0.005));
      } else if (e.touches.length === 2 && initialPinchDistance > 0) {
        const currentPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = currentPinchDistance - initialPinchDistance;
        this.camera.targetDistance = Math.max(320, Math.min(1350, initialCameraDist - diff * 1.2));
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.camera.isDragging = false;
      initialPinchDistance = 0;
    });
  }

  // 展開 / 收回法陣切換
  toggleDeploy() {
    this.isDeployed = !this.isDeployed;

    if (this.isDeployed) {
      this.deployAnimTime = 0;
      this.triggerCenterStomp();
    } else {
      // 收局：激發收縮波
      this.shockwaves.push(new Shockwave(0, 0, 520, 0, 1.2, this.getPrimaryColor()));
      this.camera.targetDistance = this.camera.baseDistance;
      this.camera.targetPitch = this.camera.basePitch;
      this.camera.targetYaw = this.camera.baseYaw;
    }

    return this.isDeployed;
  }

  // 術士步罡踏斗 · 踏定中宮瞬間的爆震與電影級運鏡
  triggerCenterStomp() {
    // 激發低頻音效
    if (window.soundEngine) {
      window.soundEngine.playStomp();
    }

    // 畫面白熱閃光特效
    const flash = document.getElementById('flash-overlay');
    if (flash) {
      flash.classList.add('flash-active');
      setTimeout(() => flash.classList.remove('flash-active'), 550);
    }

    // 相機激烈衝擊微震 (Trauma Decay)
    this.camera.trauma = 1.0;
    this.camera.shakeX = (Math.random() - 0.5) * 16;
    this.camera.shakeY = (Math.random() - 0.5) * 10;

    // 起局特寫鏡頭初始定位 (近身仰拍)
    this.camera.targetPitch = 38 * Math.PI / 180;
    this.camera.targetDistance = 500;
    this.camera.targetYaw = 0;

    // 核心爆發三重大衝擊波 (金色/幽藍/白熱)
    this.shockwaves.push(new Shockwave(0, 0, 0, 780, 2.0, this.getPrimaryColor()));
    this.shockwaves.push(new Shockwave(0, 0, 0, 540, 1.4, '#ffffff'));
    this.shockwaves.push(new Shockwave(0, 0, 0, 360, 0.9, this.getAccentColor()));

    // 中心爆發 90 顆金光靈氣飛星
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 9.5;
      const upward = -(3.5 + Math.random() * 14);
      this.particles.push(new Particle(
        Math.cos(angle) * 12,
        -4,
        Math.sin(angle) * 12,
        Math.cos(angle) * speed,
        upward,
        Math.sin(angle) * speed,
        Math.random() > 0.35 ? this.getPrimaryColor() : '#ffffff',
        2 + Math.random() * 4,
        65 + Math.random() * 45
      ));
    }

    // 八卦方位生成立體沖天光柱 (依洛書九宮步罡次序依序點亮)
    const palaceOrder = [0, 4, 1, 5, 2, 6, 3, 7];
    palaceOrder.forEach((idx, step) => {
      setTimeout(() => {
        const item = this.baguaData[idx];
        const radius = 260;
        const bx = Math.cos(item.angle) * radius;
        const bz = Math.sin(item.angle) * radius;
        this.pillars.push(new LightPillar(bx, bz, item.color, 140));
        this.shockwaves.push(new Shockwave(bx, bz, 8, 160, 1.0, item.color));

        if (window.soundEngine) {
          window.soundEngine.playRingExpand(step);
        }
      }, 450 + step * 90);
    });
  }

  // 撥動四盤 (風後奇門核心：顛倒時空、轉動乾坤)
  spinDisksArbitrary() {
    if (window.soundEngine) {
      window.soundEngine.playDiskSpin();
    }

    // 各盤瞬間激發高角動量反向狂飆
    const mult = (Math.random() > 0.5 ? 1 : -1) * (1.6 + Math.random() * 2.2);
    this.disks.speedTaiji = mult * 0.06;
    this.disks.speedBagua = -mult * 0.045;
    this.disks.speedMen = mult * 0.055;
    this.disks.speedXing = -mult * 0.04;
    this.disks.speedShen = mult * 0.035;
    this.disks.speedMantra = mult * 0.05;
    this.disks.speedMountains = -mult * 0.02;

    // 激發金光四射衝擊波
    this.shockwaves.push(new Shockwave(0, 0, 120, 600, 1.6, this.getAccentColor()));
  }

  // 釋放術士道法技能
  castSpell(spellKey) {
    if (!this.isDeployed) {
      this.toggleDeploy();
    }

    switch (spellKey) {
      case 'luanjintuo': // 亂金柝 (風後術法：時空凝滯)
        if (window.soundEngine) window.soundEngine.playLuanJinTuo();
        this.spells.push(new SpellLuanJinTuo());
        this.shockwaves.push(new Shockwave(0, 0, 0, 850, 2.5, '#ffd700'));
        break;

      case 'tuheche': // 坤字·土河車 (風後術法：破土石龍)
        if (window.soundEngine) window.soundEngine.playTuHeChe();
        this.spells.push(new SpellTuHeChe());
        break;

      case 'xiangtan': // 香檀功德 (風後術法：金光神木結界)
        this.spells.push(new SpellXiangTan());
        this.shockwaves.push(new Shockwave(0, 0, 0, 420, 2.2, '#facc15'));
        break;

      case 'huoliuxing': // 離字·煉獄火流星 (諸葛青：赤炎星隕)
        if (window.soundEngine) window.soundEngine.playHuoLiuXing();
        this.spells.push(new SpellHuoLiuXing());
        break;

      case 'tingfeng': // 巽字·聽風 (諸葛青：青碧龍捲風暴)
        if (window.soundEngine) window.soundEngine.playTingFeng();
        this.spells.push(new SpellTingFeng());
        break;

      case 'leiting': // 震字·雷霆霹靂 (諸葛青：紫電直劈)
        if (window.soundEngine) window.soundEngine.playLeiTing();
        this.spells.push(new SpellLeiTing());
        break;

      case 'kunlun': // 艮字·昆侖 (諸葛青：萬仞重嶽)
        this.spells.push(new SpellKunLun());
        this.shockwaves.push(new Shockwave(0, 0, 0, 520, 2.0, '#38bdf8'));
        break;
    }
  }

  // 主更新循環 (Update)
  update(delta) {
    this.animTime += delta;

    // 展開計時
    if (this.isDeployed) {
      this.deployAnimTime += delta;
    }

    // 展開進度平滑插值
    const targetProgress = this.isDeployed ? 1 : (this.idlePreview !== false ? 0.46 : 0);
    this.deployProgress += (targetProgress - this.deployProgress) * 0.06;

    // 電影級動態相機運鏡軌跡 (Cinematic Camera Choreography)
    if (this.isDeployed && !this.camera.isDragging) {
      const t = this.deployAnimTime;
      if (t < 0.6) {
        // 0 ~ 0.6s: 特寫中宮仰拍 (pitch = 38°, dist = 500)
        this.camera.targetPitch = 38 * Math.PI / 180;
        this.camera.targetDistance = 500;
        this.camera.targetYaw = this.camera.baseYaw;
      } else if (t < 2.4) {
        // 0.6 ~ 2.4s: 遠景大拉升 (dist: 500 -> 750, pitch: 38° -> 58°)
        const p = (t - 0.6) / 1.8;
        const ease = 1 - Math.pow(1 - p, 3);
        this.camera.targetDistance = 500 + (this.camera.baseDistance - 500) * ease;
        this.camera.targetPitch = (38 + (58 - 38) * ease) * (Math.PI / 180);
      } else if (t < 4.8) {
        // 2.4 ~ 4.8s: 八方定軸天平巡航微搖 (yaw ±0.038 rad)
        const cruiseTime = t - 2.4;
        this.camera.targetYaw = this.camera.baseYaw + Math.sin(cruiseTime * 1.4) * 0.042;
        this.camera.targetPitch = this.camera.basePitch + Math.cos(cruiseTime * 1.1) * 0.024;
      } else if (t < 5.6) {
        // 4.8 ~ 5.6s: 全盤共鳴微幅共振
        this.camera.trauma = Math.max(this.camera.trauma, 0.35);
      } else {
        // 5.6s+: 局成回正至神域俯瞰
        if (!this.camera.isAutoRotate) {
          this.camera.targetYaw = this.camera.baseYaw;
          this.camera.targetPitch = this.camera.basePitch;
          this.camera.targetDistance = this.camera.baseDistance;
        }
      }
    }

    // 自動旋轉巡航
    if (this.camera.isAutoRotate && !this.camera.isDragging) {
      this.camera.targetYaw += 0.0035;
    }

    // 相機參數平滑插值 (Lerp Damping)
    this.camera.yaw += (this.camera.targetYaw - this.camera.yaw) * 0.08;
    this.camera.pitch += (this.camera.targetPitch - this.camera.pitch) * 0.08;
    this.camera.distance += (this.camera.targetDistance - this.camera.distance) * 0.08;

    // 相機震動衰減 (Camera Trauma Decay)
    if (this.camera.trauma > 0) {
      this.camera.shakeX = (Math.random() - 0.5) * 16 * this.camera.trauma;
      this.camera.shakeY = (Math.random() - 0.5) * 10 * this.camera.trauma;
      this.camera.trauma = Math.max(0, this.camera.trauma - delta * 2.2);
    } else {
      this.camera.shakeX = 0;
      this.camera.shakeY = 0;
    }

    // 法盤動態旋轉推進
    if (this.deployProgress > 0.05) {
      this.disks.taiji += this.disks.speedTaiji;
      this.disks.luoshu += this.disks.speedLuoshu;
      this.disks.mantra += this.disks.speedMantra;
      this.disks.mountains += this.disks.speedMountains;
      this.disks.bagua += this.disks.speedBagua;
      this.disks.men += this.disks.speedMen;
      this.disks.xing += this.disks.speedXing;
      this.disks.shen += this.disks.speedShen;
      this.disks.xiu += this.disks.speedXiu;

      // 逐漸將激進撥盤速度平滑收斂至平穩常態活局速度
      this.disks.speedTaiji += (0.018 - this.disks.speedTaiji) * 0.02;
      this.disks.speedBagua += (-0.003 - this.disks.speedBagua) * 0.02;
      this.disks.speedMen += (0.004 - this.disks.speedMen) * 0.02;
      this.disks.speedXing += (-0.002 - this.disks.speedXing) * 0.02;
      this.disks.speedShen += (0.003 - this.disks.speedShen) * 0.02;
      this.disks.speedMantra += (0.006 - this.disks.speedMantra) * 0.02;
      this.disks.speedMountains += (-0.001 - this.disks.speedMountains) * 0.02;
    } else {
      this.disks.taiji += 0.008;
    }

    // 常駐空間浮空靈氣微粒更新
    this.ambientMotes.forEach(p => {
      p.y += p.vy;
      p.x += Math.sin(this.animTime * 0.8 + p.size) * 0.22;
      p.z += Math.cos(this.animTime * 0.8 + p.size) * 0.22;
      if (p.y < -340) {
        p.y = 0;
        p.x = (Math.random() - 0.5) * 660;
        p.z = (Math.random() - 0.5) * 660;
      }
    });

    // 五行生剋地脈流光微粒更新
    this.leylineParticles.forEach(lp => {
      lp.t = (lp.t + lp.speed) % 1;
    });

    // 隨機噴發地面靈氣微粒
    if (this.deployProgress > 0.25 && Math.random() < 0.65) {
      const ringR = (Math.random() * 460 + 20) * this.deployProgress;
      const pAngle = Math.random() * Math.PI * 2;
      this.particles.push(new Particle(
        Math.cos(pAngle) * ringR,
        0,
        Math.sin(pAngle) * ringR,
        (Math.random() - 0.5) * 0.6,
        -(1.2 + Math.random() * 2.8),
        (Math.random() - 0.5) * 0.6,
        Math.random() > 0.3 ? this.getPrimaryColor() : '#ffffff',
        1.5 + Math.random() * 2.8,
        65 + Math.random() * 45
      ));
    }

    // 陣列特效更新
    this.shockwaves = this.shockwaves.filter(sw => sw.update(delta));
    this.particles = this.particles.filter(p => p.update(delta));
    this.pillars = this.pillars.filter(pil => pil.update(delta));
    this.spells = this.spells.filter(sp => sp.update(delta, this));
  }

  // 主繪製方法 (Render)
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 0. 深空星河背景與神域水墨氤氳
    this.renderCosmicBackground();

    // 1. 地面透視九宮格、地脈金裂痕與五行流光 (y = 0)
    if (this.deployProgress > 0.01) {
      this.renderGroundGrid();
      this.renderDragonVeins();
      this.renderLeylineFlow();
    }

    // 2. 渾天儀多層立體同心法盤 (y = 0 ~ -250)
    if (this.deployProgress > 0.01) {
      this.renderLayeredAstrolabe();
    } else {
      // 待命靜謐狀態：中央微光太極雙魚溫潤慢轉
      this.renderTaijiVortex(45);
    }

    // 3. 沖天靈光柱 (Light Pillars)
    this.pillars.forEach(p => p.render(this));

    // 4. 活躍法術特效 (Spells)
    this.spells.forEach(s => s.render(this));

    // 5. 地面衝擊波光環 (Shockwaves)
    this.shockwaves.forEach(sw => sw.render(this));

    // 6. 浮空飄升靈氣微粒 (Ambient & Burst Particles)
    this.renderAllParticles();

    // 7. 中宮足踏道者剪影 (Taoist Silhouette at y = -8)
    this.renderSorcererSilhouette();
  }

  // 0. 繪製深空星河背景與水墨神域光暈
  renderCosmicBackground() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2 + this.camera.offsetY;

    const isFenghou = this.theme === 'fenghou';
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, this.width * 0.68);
    if (isFenghou) {
      grad.addColorStop(0, 'rgba(46, 32, 10, 0.48)');
      grad.addColorStop(0.45, 'rgba(14, 18, 28, 0.32)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      grad.addColorStop(0, 'rgba(10, 42, 60, 0.48)');
      grad.addColorStop(0.45, 'rgba(8, 16, 30, 0.32)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // 1. 繪製地面透視九宮格 (y = 0)
  renderGroundGrid() {
    const ctx = this.ctx;
    const size = 560 * this.deployProgress;
    const step = 70;
    const alpha = 0.14 * this.deployProgress;

    ctx.save();
    ctx.strokeStyle = this.getPrimaryColor();
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha;

    for (let i = -size; i <= size; i += step) {
      const p1 = this.project3D(i, 0, -size);
      const p2 = this.project3D(i, 0, size);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }

      const p3 = this.project3D(-size, 0, i);
      const p4 = this.project3D(size, 0, i);
      if (p3 && p4) {
        ctx.beginPath();
        ctx.moveTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 1.1 繪製風水地脈金裂痕 (Dragon Veins / Golden Cracks on y = 0)
  renderDragonVeins() {
    const ctx = this.ctx;
    const p = this.deployProgress;
    if (p < 0.2) return;

    ctx.save();
    ctx.strokeStyle = this.getAccentColor();
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.35 * p;

    // 八方主龍脈走穴射線
    const maxR = 480 * p;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p0 = this.project3D(0, 0, 0);
      const pEnd = this.project3D(Math.cos(a) * maxR, 0, Math.sin(a) * maxR);
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
  renderLeylineFlow() {
    const ctx = this.ctx;
    const p = this.deployProgress;
    if (p < 0.35) return;

    // 五行循環路徑節點：坎水(-90°) -> 震木(180°) -> 巽木(135°) -> 離火(90°) -> 坤土(45°) -> 艮土(-135°) -> 兌金(0°) -> 乾金(-45°)
    const circuitAngles = [
      -Math.PI / 2,     // 坎水
      Math.PI,          // 震木
      Math.PI * 3 / 4,  // 巽木
      Math.PI / 2,      // 離火
      Math.PI / 4,      // 坤土
      -Math.PI * 3 / 4, // 艮土
      0,                // 兌金
      -Math.PI / 4      // 乾金
    ];

    const circuitR = 250 * p;

    // 繪製微弱的五行地脈循環連線
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    let first = true;
    circuitAngles.forEach(ang => {
      const pt = this.project3D(Math.cos(ang) * circuitR, 0, Math.sin(ang) * circuitR);
      if (pt) {
        if (first) { ctx.moveTo(pt.sx, pt.sy); first = false; }
        else { ctx.lineTo(pt.sx, pt.sy); }
      }
    });
    ctx.closePath();
    ctx.stroke();

    // 奔騰流動的五行能量光粒
    this.leylineParticles.forEach(lp => {
      const totalSegs = circuitAngles.length;
      const globalT = lp.t * totalSegs;
      const segIdx = Math.floor(globalT) % totalSegs;
      const nextIdx = (segIdx + 1) % totalSegs;
      const localT = globalT - segIdx;

      const a1 = circuitAngles[segIdx];
      const a2 = circuitAngles[nextIdx];

      // 沿弧線內插
      const curA = a1 + (a2 - a1) * localT;
      const pt = this.project3D(Math.cos(curA) * circuitR, 0, Math.sin(curA) * circuitR);
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

  // ========================================================
  // 2. 渾天儀多層立體同心法盤 (Multi-tier Astrolabe)
  // 階梯立體高度：
  // y = 0: 二十四山風水盤
  // y = -8: 液態太極雙魚旋渦
  // y = -24: 洛書九星紫白盤
  // y = -48: 九字真言金色符籙環
  // y = -80: 後天八卦盤
  // y = -120: 人盤八門金輪
  // y = -165: 天盤九星天象儀
  // y = -205: 神盤八神靈曜輪
  // y = -250: 二十八宿四象天球穹頂
  // ========================================================
  renderLayeredAstrolabe() {
    const p = this.deployProgress;
    const baseR = 480 * p;

    // 浮空呼吸起伏 (Levitation Breathing Pulse)
    const floatPulse = Math.sin(this.animTime * 1.8);

    // 0. 地盤二十四山風水羅盤 (y = 0, r ≈ 470)
    if (p > 0.4) {
      this.render24MountainsDisk(baseR * 0.98);
    }

    // 1. 中宮液態太極陰陽雙魚 (y = -8, r ≈ 58)
    this.renderTaijiVortex(58 * Math.min(1, p * 1.5));

    // 2. 洛書九星紫白盤 (y ≈ -24 + floatPulse * 1.2, r ≈ 105)
    if (p > 0.18) {
      const yLuoshu = -24 + floatPulse * 1.2;
      this.renderLuoshuDisk(105 * Math.min(1, (p - 0.15) * 1.6), yLuoshu);
    }

    // 3. 九字真言金光符籙環 (y ≈ -48 + floatPulse * 1.5, r ≈ 155)
    if (p > 0.28) {
      const yMantra = -48 + floatPulse * 1.5;
      this.renderNineMantraDisk(155 * Math.min(1, (p - 0.25) * 1.5), yMantra);
    }

    // 4. 後天八卦盤 (y ≈ -80 + floatPulse * 1.8, r ≈ 220)
    if (p > 0.38) {
      const yBagua = -80 + floatPulse * 1.8;
      this.renderBaguaDisk(220 * Math.min(1, (p - 0.32) * 1.5), yBagua);
    }

    // 5. 人盤八門遁甲金輪 (y ≈ -120 + floatPulse * 2.2, r ≈ 290)
    if (p > 0.5) {
      const yMen = -120 + floatPulse * 2.2;
      this.renderEightGatesDisk(290 * Math.min(1, (p - 0.45) * 1.4), yMen);
    }

    // 6. 天盤九星天象儀 (y ≈ -165 + floatPulse * 2.6, r ≈ 365)
    if (p > 0.65) {
      const yXing = -165 + floatPulse * 2.6;
      this.renderNineStarsDisk(365 * Math.min(1, (p - 0.58) * 1.3), yXing);
    }

    // 7. 神盤八神靈曜輪 (y ≈ -205 + floatPulse * 3.0, r ≈ 435)
    if (p > 0.78) {
      const yShen = -205 + floatPulse * 3.0;
      this.renderEightDeitiesDisk(435 * Math.min(1, (p - 0.72) * 1.3), yShen);
    }

    // 8. 外周天二十八宿四象星穹穹頂 (y ≈ -250 + floatPulse * 2.5, r ≈ 510)
    if (p > 0.86) {
      const yXiu = -250 + floatPulse * 2.5;
      this.renderConstellationsDome(510 * Math.min(1, (p - 0.82) * 1.4), yXiu);
    }

    // 9. 八方星索天柱 (Vertical Struts from y = 0 to y = -250)
    if (p > 0.3) {
      this.renderCelestialVerticalStruts(baseR * 0.92);
    }
  }

  // 2.0 繪製風水二十四山羅盤刻度環 (y = 0)
  render24MountainsDisk(radius) {
    if (radius <= 20) return;
    const ctx = this.ctx;
    this.draw3DCircle(0, 0, radius, this.getPrimaryColor(), 1.8, 0.45);
    this.draw3DCircle(0, 0, radius * 0.94, this.getAccentColor(), 1, 0.25);

    const rot = this.disks.mountains;
    this.mountains24.forEach((item, i) => {
      const a = rot + (i / 24) * Math.PI * 2;
      const x = Math.cos(a) * (radius * 0.97);
      const z = Math.sin(a) * (radius * 0.97);

      // 刻度紅金小節點
      const ptTick = this.project3D(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      if (ptTick && i % 3 === 0) {
        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ptTick.sx, ptTick.sy, 2.2 * ptTick.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 二十四山正針文字
      this.draw3DText(item.name, x, 0, z, 11, item.color, 0.75);
    });
  }

  // 2.1 繪製中宮液態水墨太極雙魚旋渦 (y = -8)
  renderTaijiVortex(radius) {
    if (radius <= 2) return;
    const ctx = this.ctx;
    const segments = 48;
    const angleOffset = this.disks.taiji;
    const yTaiji = -8;

    // 太極外金環與雙層呼吸光暈
    const pulse = Math.sin(this.animTime * 3) * 0.05;
    this.draw3DCircle(0, yTaiji, radius * (1 + pulse), this.getPrimaryColor(), 2.4, 0.9);
    this.draw3DCircle(0, yTaiji, radius * 1.18 * (1 + pulse), this.getAccentColor(), 1.2, 0.5);

    // 陽金半邊 (Liquid Gold / Blue)
    ctx.save();
    ctx.fillStyle = this.getPrimaryColor();
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    for (let i = 0; i <= segments / 2; i++) {
      const a = angleOffset + (i / segments) * Math.PI * 2;
      const pt = this.project3D(Math.cos(a) * radius, yTaiji, Math.sin(a) * radius);
      if (pt) {
        if (i === 0) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
    }
    const centerPt = this.project3D(0, yTaiji, 0);
    if (centerPt) ctx.lineTo(centerPt.sx, centerPt.sy);
    ctx.closePath();
    ctx.fill();

    // 陰黑半邊 (Liquid Deep Ink)
    ctx.fillStyle = '#06080e';
    ctx.globalAlpha = 0.94;
    ctx.beginPath();
    for (let i = segments / 2; i <= segments; i++) {
      const a = angleOffset + (i / segments) * Math.PI * 2;
      const pt = this.project3D(Math.cos(a) * radius, yTaiji, Math.sin(a) * radius);
      if (pt) {
        if (i === segments / 2) ctx.moveTo(pt.sx, pt.sy);
        else ctx.lineTo(pt.sx, pt.sy);
      }
    }
    if (centerPt) ctx.lineTo(centerPt.sx, centerPt.sy);
    ctx.closePath();
    ctx.fill();

    // 陰陽雙眼神光
    const eyeDist = radius * 0.48;
    const eyeR = radius * 0.17;
    const ptEye1 = this.project3D(Math.cos(angleOffset + Math.PI / 2) * eyeDist, yTaiji, Math.sin(angleOffset + Math.PI / 2) * eyeDist);
    const ptEye2 = this.project3D(Math.cos(angleOffset - Math.PI / 2) * eyeDist, yTaiji, Math.sin(angleOffset - Math.PI / 2) * eyeDist);

    if (ptEye1) {
      ctx.fillStyle = '#06080e';
      ctx.beginPath();
      ctx.arc(ptEye1.sx, ptEye1.sy, eyeR * ptEye1.scale, 0, Math.PI * 2);
      ctx.fill();
    }
    if (ptEye2) {
      ctx.fillStyle = this.getPrimaryColor();
      ctx.shadowColor = this.getPrimaryColor();
      ctx.shadowBlur = 12 * ptEye2.scale;
      ctx.beginPath();
      ctx.arc(ptEye2.sx, ptEye2.sy, eyeR * ptEye2.scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2.2 繪製洛書九星紫白盤 (y ≈ -24)
  renderLuoshuDisk(radius, yLevel) {
    if (radius <= 2) return;
    this.draw3DCircle(0, yLevel, radius, this.getPrimaryColor(), 1.5, 0.55);

    const count = this.luoshuData.length;
    for (let i = 0; i < count; i++) {
      const item = this.luoshuData[i];
      const a = this.disks.luoshu + (i / count) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      this.draw3DText(item.num, x, yLevel, z, 13, item.color, 0.9, true);
    }
  }

  // 2.3 繪製道家九字真言金色符籙金環 (y ≈ -48)
  renderNineMantraDisk(radius, yLevel) {
    if (radius <= 2) return;
    const ctx = this.ctx;
    this.draw3DCircle(0, yLevel, radius, 'rgba(245, 197, 66, 0.65)', 2, 0.7);
    this.draw3DCircle(0, yLevel, radius * 1.08, 'rgba(253, 224, 71, 0.35)', 1, 0.4);

    const rot = this.disks.mantra;
    const count = this.nineMantras.length;
    for (let i = 0; i < count; i++) {
      const m = this.nineMantras[i];
      const a = rot + (i / count) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;

      // 符文金色圓形背光護印
      const ptM = this.project3D(x, yLevel, z);
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

      // 真言篆字
      this.draw3DText(m.char, x, yLevel, z, 14, m.color, 0.95, true);
    }
  }

  // 2.4 繪製後天八卦盤 (y ≈ -80)
  renderBaguaDisk(radius, yLevel) {
    if (radius <= 2) return;
    this.draw3DCircle(0, yLevel, radius, this.getPrimaryColor(), 2, 0.65);
    this.draw3DCircle(0, yLevel, radius * 0.84, this.getPrimaryColor(), 1.2, 0.35);

    const rot = this.disks.bagua;
    this.baguaData.forEach((item, i) => {
      const a = rot + (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;

      // 八卦文字 (如「離」、「坎」)
      this.draw3DText(item.name, x, yLevel, z, 18, item.color, 0.95, true);

      // 八卦卦象 Unicode (☲☵)
      const xSym = Math.cos(a) * (radius * 0.88);
      const zSym = Math.sin(a) * (radius * 0.88);
      this.draw3DText(item.symbol, xSym, yLevel, zSym, 15, item.color, 0.85);

      // 刻劃立體三爻連斷線條
      this.drawTrigramLines(a, yLevel, radius * 0.76, item.lines, item.color);

      // 宮位高亮探查靈光 (Focus / Selected Halo)
      if (this.highlightPalaceId === item.palaceId) {
        const ptHalo = this.project3D(x, yLevel, z);
        if (ptHalo) {
          const pulse = Math.sin(this.animTime * 4) * 4;
          const ctx = this.ctx;
          ctx.save();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2.5 * ptHalo.scale;
          ctx.shadowColor = '#f5c542';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(ptHalo.sx, ptHalo.sy, (24 + pulse) * ptHalo.scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    });
  }

  // 輔助：繪製三爻符號線條 (陽爻 —、陰爻 --)
  drawTrigramLines(angle, yLevel, r, lines, color) {
    const ctx = this.ctx;
    const tangent = angle + Math.PI / 2;
    const len = 14;

    lines.forEach((isYang, lineIdx) => {
      const curR = r - lineIdx * 6;
      const cx = Math.cos(angle) * curR;
      const cz = Math.sin(angle) * curR;

      if (isYang) {
        // 陽爻：一條完整連線
        const p1 = this.project3D(cx - Math.cos(tangent) * len, yLevel, cz - Math.sin(tangent) * len);
        const p2 = this.project3D(cx + Math.cos(tangent) * len, yLevel, cz + Math.sin(tangent) * len);
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

        const pA1 = this.project3D(cx - Math.cos(tangent) * len, yLevel, cz - Math.sin(tangent) * len);
        const pA2 = this.project3D(cx - Math.cos(tangent) * gap, yLevel, cz - Math.sin(tangent) * gap);
        const pB1 = this.project3D(cx + Math.cos(tangent) * gap, yLevel, cz + Math.sin(tangent) * gap);
        const pB2 = this.project3D(cx + Math.cos(tangent) * len, yLevel, cz + Math.sin(tangent) * len);

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

  // 2.5 繪製人盤八門遁甲金輪 (y ≈ -120)
  renderEightGatesDisk(radius, yLevel) {
    if (radius <= 2) return;
    this.draw3DCircle(0, yLevel, radius, this.getPrimaryColor(), 2, 0.7);
    this.draw3DCircle(0, yLevel, radius * 0.88, this.getPrimaryColor(), 1, 0.35);

    const rot = this.disks.men;
    this.bamenData.forEach((item, i) => {
      const a = rot + (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * (radius * 0.94);
      const z = Math.sin(a) * (radius * 0.94);

      // 八門字樣 (開休生傷杜景死驚)
      this.draw3DText(item.name, x, yLevel, z, 17, item.color, 0.95, true);

      // 隔斷立柱射線
      const sepA = a + Math.PI / 8;
      const p1 = this.project3D(Math.cos(sepA) * (radius * 0.88), yLevel, Math.sin(sepA) * (radius * 0.88));
      const p2 = this.project3D(Math.cos(sepA) * radius, yLevel, Math.sin(sepA) * radius);
      if (p1 && p2) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(245, 197, 66, 0.35)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.sx, p1.sy);
        this.ctx.lineTo(p2.sx, p2.sy);
        this.ctx.stroke();
        this.ctx.restore();
      }
    });
  }

  // 2.6 繪製天盤九星天象儀 (y ≈ -165)
  renderNineStarsDisk(radius, yLevel) {
    if (radius <= 2) return;
    this.draw3DCircle(0, yLevel, radius, 'rgba(56, 189, 248, 0.55)', 1.8, 0.65);

    const rot = this.disks.xing;
    this.jiuxingData.forEach((name, i) => {
      const a = rot + (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      this.draw3DText(name, x, yLevel, z, 15, '#70ffff', 0.9);
    });
  }

  // 2.7 繪製神盤八神靈曜輪 (y ≈ -205)
  renderEightDeitiesDisk(radius, yLevel) {
    if (radius <= 2) return;
    this.draw3DCircle(0, yLevel, radius, 'rgba(245, 197, 66, 0.65)', 2, 0.75);

    const rot = this.disks.shen;
    this.bashenData.forEach((name, i) => {
      const a = rot + (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const isLeader = name === '值符';
      this.draw3DText(name, x, yLevel, z, 16, isLeader ? '#fde047' : '#ffd54f', 0.95, isLeader);
    });
  }

  // 2.8 繪製外周天二十八宿四象星穹穹頂 (y ≈ -250)
  renderConstellationsDome(radius, yLevel) {
    if (radius <= 2) return;
    const ctx = this.ctx;
    this.draw3DCircle(0, yLevel, radius, this.getPrimaryColor(), 2.2, 0.65);
    this.draw3DCircle(0, yLevel, radius * 1.05, this.getAccentColor(), 1, 0.35);

    const rot = this.disks.xiu;
    const count = this.stars28.length;

    // 繪製四象星官真幾何連線 (Constellation Skeletal Lines)
    let curQuadrant = -1;
    let lastPt = null;

    this.stars28.forEach((s, i) => {
      const qIdx = Math.floor(i / 7);
      const a = rot + (i / count) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;

      // 星宿名稱
      this.draw3DText(s.name, x, yLevel, z, 13, s.color, 0.85);

      // 星宿發光節點
      const ptStar = this.project3D(Math.cos(a) * (radius * 1.05), yLevel, Math.sin(a) * (radius * 1.05));
      if (ptStar) {
        ctx.save();
        const twinkle = 0.5 + Math.sin(this.animTime * 3 + i) * 0.45;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = twinkle;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10 * ptStar.scale;
        ctx.beginPath();
        ctx.arc(ptStar.sx, ptStar.sy, 2.5 * ptStar.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 四象同宮星官連線
        if (qIdx === curQuadrant && lastPt) {
          ctx.save();
          ctx.strokeStyle = s.color;
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

  // 2.9 繪製八方星索天柱 (Vertical Celestial Struts: y = 0 -> -250)
  renderCelestialVerticalStruts(radius) {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const px = Math.cos(a) * radius;
      const pz = Math.sin(a) * radius;

      const pBase = this.project3D(px, 0, pz);
      const pSky = this.project3D(px, -250, pz);
      if (pBase && pSky) {
        ctx.strokeStyle = 'rgba(245, 197, 66, 0.38)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(pBase.sx, pBase.sy);
        ctx.lineTo(pSky.sx, pSky.sy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 3. 繪製中宮足踏道者剪影 (y = -8)
  renderSorcererSilhouette() {
    const ySorcerer = -8;
    const pt = this.project3D(0, ySorcerer, 0);
    if (!pt) return;

    const ctx = this.ctx;
    const scale = pt.scale * 1.35;
    const cx = pt.sx;
    const cy = pt.sy;

    ctx.save();
    ctx.translate(cx, cy);

    // 腳下踏定太極光環 (Pulsing footstep ring)
    const pulse = Math.sin(this.animTime * 3.5) * 0.18;
    ctx.fillStyle = this.getPrimaryColor();
    ctx.globalAlpha = 0.55 + pulse;
    ctx.beginPath();
    ctx.ellipse(0, 0, (24 + pulse * 4) * scale, (12 + pulse * 2) * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 術士身形道袍剪影 (隨風飄逸拂動)
    ctx.fillStyle = this.theme === 'fenghou' ? '#0d1017' : '#08121f';
    ctx.strokeStyle = this.getPrimaryColor();
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.95;

    const sway = Math.sin(this.animTime * 2.8) * 4 * scale;
    ctx.beginPath();
    ctx.moveTo(-12 * scale, -10 * scale);
    ctx.quadraticCurveTo(-18 * scale + sway, -40 * scale, -10 * scale, -70 * scale); // 左裙擺
    ctx.lineTo(10 * scale, -70 * scale); // 肩
    ctx.quadraticCurveTo(18 * scale - sway, -40 * scale, 12 * scale, -10 * scale); // 右裙擺
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 道冠髮髻
    ctx.beginPath();
    ctx.arc(0, -82 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 法器靈光
    if (this.theme === 'fenghou') {
      // 術士隨性拂塵 / 金光神木靈氣
      ctx.fillStyle = '#fde047';
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(0, -45 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 靈羽扇幽藍靈氣
      ctx.fillStyle = '#00f0ff';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(14 * scale, -50 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 輔助：繪製 3D 空間圓環 (支援任意 y 軸高度)
  draw3DCircle(x, y, radius, color, lineWidth, alpha = 1) {
    if (radius <= 2) return;
    const ctx = this.ctx;
    const segments = 48;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = alpha;
    ctx.beginPath();

    let first = true;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const px = x + Math.cos(a) * radius;
      const pz = Math.sin(a) * radius;
      const pt = this.project3D(px, y, pz);
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

  // 輔助：繪製 3D 空間文字
  draw3DText(text, x, y, z, fontSize, color, alpha = 1, isBold = false) {
    const pt = this.project3D(x, y, z);
    if (!pt) return;

    const ctx = this.ctx;
    const size = fontSize * pt.scale;
    if (size < 5) return;

    ctx.save();
    ctx.font = `${isBold ? 'bold ' : ''}${Math.round(size)}px 'Noto Serif TC', serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * pt.scale;
    ctx.fillText(text, pt.sx, pt.sy);
    ctx.restore();
  }

  // 繪製所有微粒 (常駐靈氣微粒 + 爆發火星)
  renderAllParticles() {
    const ctx = this.ctx;

    // 1. 常駐空間升騰靈氣微粒
    this.ambientMotes.forEach(p => {
      const pt = this.project3D(p.x, p.y, p.z);
      if (pt) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, p.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // 2. 爆發瞬態火星
    this.particles.forEach(p => {
      const pt = this.project3D(p.x, p.y, p.z);
      if (pt) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, p.size * pt.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // 占卜算局專屬：鎖定並點亮特定落宮 (Divination Palace Focus)
  focusOnPalace(palace, skipSpin = false) {
    if (!this.isDeployed) {
      this.toggleDeploy();
    }

    const angle = palace.angle;
    const radius = 260;
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius;

    // 撥動四盤呼應天機
    if (!skipSpin) {
      this.spinDisksArbitrary();
    }

    // 在該宮位生成強烈道術光柱與脈衝光圈
    this.pillars.push(new LightPillar(px, pz, '#fde047', 220));
    this.shockwaves.push(new Shockwave(px, pz, 10, 220, 1.6, '#ffd700'));
    this.shockwaves.push(new Shockwave(px, pz, 10, 300, 2.2, '#ffffff'));

    // 噴發宮位專屬靈氣金星
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1.2 + Math.random() * 6;
      this.particles.push(new Particle(
        px, 0, pz,
        Math.cos(a) * spd,
        -(3 + Math.random() * 9),
        Math.sin(a) * spd,
        '#facc15',
        2 + Math.random() * 3.5,
        80 + Math.random() * 40
      ));
    }

    if (window.soundEngine) {
      window.soundEngine.playRingExpand(4);
    }

    // 視角平滑微調聚焦該宮位
    this.camera.targetYaw = -angle + Math.PI / 2;
  }

  // 依宮位 ID 聚焦並激發靈柱
  focusPalace(palaceId) {
    this.highlightPalaceId = palaceId;
    const palace = window.divinationEngine ? window.divinationEngine.palaces.find(p => p.id === palaceId) : null;
    if (palace) {
      this.focusOnPalace(palace, false);
    }
  }

  // 占卜起局全流程動畫控制器 (步罡踏斗 -> 展環 -> 八方立柱 -> 落宮共鳴 -> 局成)
  startDivinationCasting(reading, callbacks = {}) {
    this.isDeployed = true;
    this.activeReading = reading;
    this.deployAnimTime = 0;
    this.triggerCenterStomp();
    this.spinDisksArbitrary();

    if (callbacks.onPhase) {
      callbacks.onPhase('stomp', `【踏定中宮 · 步罡起局】 求問：${reading.question}`);
      setTimeout(() => callbacks.onPhase('expand', '【向外展環 · 渾天立體】 二十四山羅盤 · 九字真言符籙環 · 八卦八門星象'), 600);
      setTimeout(() => callbacks.onPhase('directions', '【八方啟動 · 沖天靈光】 洛書九宮步罡 · 貫穿星索天柱'), 2400);
      setTimeout(() => callbacks.onPhase('resonance', '【全盤共鳴 · 鎖定落宮】 天時地利人和神助 · 萬象咸亨'), 4800);
    }

    // 4.8 秒時精準聚焦落宮，激發沖天神柱與宮位脈衝
    setTimeout(() => {
      if (reading && reading.palace) {
        this.focusOnPalace(reading.palace, true);
      }
    }, 4800);

    // 5.6 秒「局成」回呼解盤結果展開
    setTimeout(() => {
      if (callbacks.onPhase) {
        callbacks.onPhase('complete', `【局成 · ${reading.outcome.verdict}】 ${reading.palace.name} · ${reading.gate.name} · ${reading.star.name} · ${reading.deity.name}`);
      }
      if (callbacks.onComplete) {
        callbacks.onComplete();
      }
    }, 5600);
  }

  // 重置法陣回到待命靜謐狀態
  resetFormation() {
    this.isDeployed = false;
    this.activeReading = null;
    this.deployAnimTime = 0;
    this.camera.targetDistance = this.camera.baseDistance;
    this.camera.targetPitch = this.camera.basePitch;
    this.camera.targetYaw = this.camera.baseYaw;
    this.camera.trauma = 0;
  }

  // 獲取當前主色
  getPrimaryColor() {
    return this.theme === 'fenghou' ? '#f5c542' : '#00f0ff';
  }

  // 獲取當前輔助色
  getAccentColor() {
    return this.theme === 'fenghou' ? '#ffd700' : '#70ffff';
  }
}

// ========================================================
// 輔助視覺特效類別 (Classes for FX)
// ========================================================

// 1. 衝擊波光圈 (Shockwave)
class Shockwave {
  constructor(x, z, startR, maxR, duration, color) {
    this.x = x;
    this.z = z;
    this.radius = startR;
    this.maxRadius = maxR;
    this.duration = duration;
    this.elapsed = 0;
    this.color = color;
  }

  update(delta) {
    this.elapsed += delta;
    this.radius = this.radius + (this.maxRadius - this.radius) * 0.085;
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const alpha = Math.max(0, 1 - (this.elapsed / this.duration));
    renderer.draw3DCircle(this.x, 0, this.radius, this.color, 3, alpha * 0.9);
  }
}

// 2. 靈氣微粒 (Particle)
class Particle {
  constructor(x, y, z, vx, vy, vz, color, size, life) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.vx = vx;
    this.vy = vy;
    this.vz = vz;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.alpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
    this.vy += 0.06; // 微重力
    this.life--;
    this.alpha = Math.max(0, this.life / this.maxLife);
    return this.life > 0;
  }
}

// 3. 沖天靈光柱 (Light Pillar)
class LightPillar {
  constructor(x, z, color, maxLife = 120) {
    this.x = x;
    this.z = z;
    this.height = 0;
    this.maxHeight = 320;
    this.color = color;
    this.life = maxLife;
    this.maxLife = maxLife;
  }

  update() {
    this.height += (this.maxHeight - this.height) * 0.12;
    this.life--;
    return this.life > 0;
  }

  render(renderer) {
    const pBase = renderer.project3D(this.x, 0, this.z);
    const pTop = renderer.project3D(this.x, -this.height, this.z);
    if (!pBase || !pTop) return;

    const ctx = renderer.ctx;
    const alpha = (this.life / this.maxLife) * 0.72;
    const width = 20 * pBase.scale;

    ctx.save();
    const grad = ctx.createLinearGradient(pBase.sx, pBase.sy, pTop.sx, pTop.sy);
    grad.addColorStop(0, this.color);
    grad.addColorStop(0.7, this.color);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha;
    ctx.fillRect(pBase.sx - width / 2, pTop.sy, width, pBase.sy - pTop.sy);
    ctx.restore();
  }
}

// ========================================================
// 術法實例類別 (Spells Implementations)
// ========================================================

// 1.「亂金柝」：時間停滯、金色時鐘法盤浮空
class SpellLuanJinTuo {
  constructor() {
    this.duration = 4.0;
    this.elapsed = 0;
    this.clockRotation = 0;
  }

  update(delta) {
    this.elapsed += delta;
    this.clockRotation += delta * 0.8;
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const alpha = Math.sin((this.elapsed / this.duration) * Math.PI);
    const ctx = renderer.ctx;
    const pCenter = renderer.project3D(0, -90, 0);
    if (!pCenter) return;

    const r = 180 * pCenter.scale;

    ctx.save();
    ctx.translate(pCenter.sx, pCenter.sy);
    ctx.rotate(this.clockRotation);

    // 金色時鐘外環
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.globalAlpha = alpha * 0.85;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // 十二時辰古字刻度
    const shichen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    shichen.forEach((item, i) => {
      const a = (i / 12) * Math.PI * 2;
      const tx = Math.cos(a) * (r * 0.82);
      const ty = Math.sin(a) * (r * 0.82);
      ctx.font = `bold ${Math.round(16 * pCenter.scale)}px 'Noto Serif TC', serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item, tx, ty);
    });

    // 時鐘金色指針 (指針緩慢凍結)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(this.clockRotation * 2) * (r * 0.6), Math.sin(this.clockRotation * 2) * (r * 0.6));
    ctx.stroke();

    ctx.restore();
  }
}

// 2.「坤字·土河車」：地龍破土爆發
class SpellTuHeChe {
  constructor() {
    this.duration = 2.5;
    this.elapsed = 0;
    this.rocks = [];
    for (let i = 0; i < 18; i++) {
      const dist = 60 + i * 22;
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      this.rocks.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        height: 0,
        maxH: 50 + Math.random() * 90,
        size: 15 + Math.random() * 25,
        delay: i * 0.08
      });
    }
  }

  update(delta) {
    this.elapsed += delta;
    this.rocks.forEach(rk => {
      if (this.elapsed > rk.delay) {
        rk.height += (rk.maxH - rk.height) * 0.2;
      }
    });
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const ctx = renderer.ctx;
    this.rocks.forEach(rk => {
      if (rk.height > 2) {
        const p1 = renderer.project3D(rk.x, 0, rk.z);
        const p2 = renderer.project3D(rk.x, -rk.height, rk.z);
        if (p1 && p2) {
          ctx.save();
          ctx.strokeStyle = '#eab308';
          ctx.fillStyle = '#422006';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.sx - rk.size * p1.scale, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.lineTo(p1.sx + rk.size * p1.scale, p1.sy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    });
  }
}

// 3.「香檀功德」：木魚佛光結界護體
class SpellXiangTan {
  constructor() {
    this.duration = 2.8;
    this.elapsed = 0;
  }

  update(delta) {
    this.elapsed += delta;
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const alpha = Math.sin((this.elapsed / this.duration) * Math.PI) * 0.7;
    renderer.draw3DCircle(0, 0, 140, '#facc15', 4, alpha);
    renderer.draw3DCircle(0, 0, 160, '#fde047', 2, alpha * 0.6);
  }
}

// 4. 諸葛青 ·「離字·煉獄火流星」：赤炎群星隕落
class SpellHuoLiuXing {
  constructor() {
    this.duration = 2.4;
    this.elapsed = 0;
    this.meteors = [];
    for (let i = 0; i < 24; i++) {
      this.meteors.push({
        x: (Math.random() - 0.5) * 500,
        y: -400 - Math.random() * 250,
        z: -Math.random() * 400,
        speed: 9 + Math.random() * 12,
        color: Math.random() > 0.4 ? '#ef4444' : '#f97316'
      });
    }
  }

  update(delta) {
    this.elapsed += delta;
    this.meteors.forEach(m => {
      m.y += m.speed;
      m.x += 2.5;
    });
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const ctx = renderer.ctx;
    this.meteors.forEach(m => {
      const pt = renderer.project3D(m.x, m.y, m.z);
      if (pt) {
        ctx.save();
        ctx.fillStyle = m.color;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, 6 * pt.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }
}

// 5. 諸葛青 ·「巽字·風繩 / 聽風」：青色龍捲暴風
class SpellTingFeng {
  constructor() {
    this.duration = 2.5;
    this.elapsed = 0;
  }

  update(delta) {
    this.elapsed += delta;
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const ctx = renderer.ctx;
    const rings = 12;
    for (let i = 0; i < rings; i++) {
      const h = -i * 22;
      const r = 40 + i * 16;
      const angle = this.elapsed * 6 + i * 0.4;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const pt = renderer.project3D(x, h, z);
      if (pt) {
        ctx.save();
        ctx.fillStyle = '#2dd4bf';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, 5 * pt.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

// 6. 諸葛青 ·「震字·雷霆霹靂」：九天狂雷直劈
class SpellLeiTing {
  constructor() {
    this.duration = 1.2;
    this.elapsed = 0;
    this.bolts = [];
    for (let b = 0; b < 4; b++) {
      let curX = (Math.random() - 0.5) * 350;
      let curZ = (Math.random() - 0.5) * 350;
      let curY = -450;
      const pts = [{ x: curX, y: curY, z: curZ }];
      while (curY < 0) {
        curY += 25 + Math.random() * 20;
        curX += (Math.random() - 0.5) * 45;
        curZ += (Math.random() - 0.5) * 45;
        pts.push({ x: curX, y: Math.min(0, curY), z: curZ });
      }
      this.bolts.push(pts);
    }
  }

  update(delta) {
    this.elapsed += delta;
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const ctx = renderer.ctx;
    const alpha = Math.max(0, 1 - (this.elapsed / this.duration));
    ctx.save();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 20;

    this.bolts.forEach(bolt => {
      ctx.beginPath();
      let first = true;
      bolt.forEach(pt => {
        const p3 = renderer.project3D(pt.x, pt.y, pt.z);
        if (p3) {
          if (first) {
            ctx.moveTo(p3.sx, p3.sy);
            first = false;
          } else {
            ctx.lineTo(p3.sx, p3.sy);
          }
        }
      });
      ctx.stroke();
    });
    ctx.restore();
  }
}

// 7. 諸葛青 ·「艮字·昆侖」：千鈞巨嶽重壓
class SpellKunLun {
  constructor() {
    this.duration = 2.2;
    this.elapsed = 0;
  }

  update(delta) {
    this.elapsed += delta;
    return this.elapsed < this.duration;
  }

  render(renderer) {
    const alpha = Math.sin((this.elapsed / this.duration) * Math.PI);
    renderer.draw3DCircle(0, 0, 220, '#38bdf8', 4, alpha * 0.8);
    renderer.draw3DCircle(0, 0, 260, '#0284c7', 2, alpha * 0.5);
  }
}


