/**
 * ========================================================
 * 奇門遁甲 · 風後奇門 占卜算局資料與解盤引擎 (divination.js)
 * 結合奇門遁甲四盤（天地人神）、宮位五行生剋與道家哲理指引
 * ========================================================
 */

class DivinationEngine {
  constructor() {
    this.historyKey = 'fenghou_divination_history';
    this.palaces = [
      { name: '坎一宮', bagua: '坎', element: '水', direction: '正北', angle: Math.PI / 2 },
      { name: '艮八宮', bagua: '艮', element: '土', direction: '東北', angle: Math.PI * 3 / 4 },
      { name: '震三宮', bagua: '震', element: '木', direction: '正東', angle: Math.PI },
      { name: '巽四宮', bagua: '巽', element: '木', direction: '東南', angle: -Math.PI * 3 / 4 },
      { name: '離九宮', bagua: '離', element: '火', direction: '正南', angle: -Math.PI / 2 },
      { name: '坤二宮', bagua: '坤', element: '土', direction: '西南', angle: -Math.PI / 4 },
      { name: '兌七宮', bagua: '兌', element: '金', direction: '正西', angle: 0 },
      { name: '乾六宮', bagua: '乾', element: '金', direction: '西北', angle: Math.PI / 4 }
    ];

    this.gates = [
      { name: '開門', type: '大吉', desc: '萬物開通，出入通達，功名官貴利祿', elem: '金' },
      { name: '休門', type: '吉', desc: '休養生息，吉慶和順，感情姻緣貴人', elem: '水' },
      { name: '生門', type: '大吉', desc: '生生不息，求財進產，機遇生機勃勃', elem: '土' },
      { name: '傷門', type: '次凶', desc: '爭端受阻，勞神破財，宜防小人暗傷', elem: '木' },
      { name: '杜門', type: '平', desc: '隱匿藏形，守靜待變，防守保全之機', elem: '木' },
      { name: '景門', type: '次吉', desc: '名氣文采，聲名遠播，虛多實少宜清醒', elem: '火' },
      { name: '死門', type: '凶', desc: '困局死結，停滯不前，需置死地而後生', elem: '土' },
      { name: '驚門', type: '凶', desc: '驚恐疑慮，風波口舌，心浮氣躁宜靜心', elem: '金' }
    ];

    this.stars = [
      { name: '天蓬星', type: '凶', desc: '水星性沉，大智大險，暗藏逆流與謀略' },
      { name: '天任星', type: '吉', desc: '厚德載物，踏實任事，循序漸進得福' },
      { name: '天沖星', type: '次吉', desc: '雷厲風行，開疆拓土，敢作敢當宜速斷' },
      { name: '天輔星', type: '大吉', desc: '文曲文昌，貴人師長，智慧通達利學業' },
      { name: '天英星', type: '平', desc: '火光烈烈，名聲大噪，注重外在需防浮華' },
      { name: '天芮星', type: '凶', desc: '巨門暗疾，瑕疵阻滯，需查找根源修復' },
      { name: '天柱星', type: '次凶', desc: '中流砥柱，肅殺破壞，言辭鋒利防是非' },
      { name: '天心星', type: '大吉', desc: '文韜武略，胸襟開闊，醫道救人掌大權' }
    ];

    this.deities = [
      { name: '值符', type: '至吉', desc: '百神之長，貴人護佑，逢凶化吉萬惡不侵' },
      { name: '螣蛇', type: '虛幻', desc: '變化莫測，虛驚怪異，夢魘羈絆宜明辨' },
      { name: '太陰', type: '陰護', desc: '暗中庇佑，心思縝密，隱秘行事易功成' },
      { name: '六合', type: '吉和', desc: '和合融洽，牽線搭橋，合作求婚大吉利' },
      { name: '白虎', type: '威猛', desc: '肅殺剛烈，血光阻礙，需借強勢破阻礙' },
      { name: '玄武', type: '曖昧', desc: '防詐防盜，口舌曖昧，需防小人假面具' },
      { name: '九地', type: '穩厚', desc: '坤土之氣，沉穩厚重，宜守不宜冒進' },
      { name: '九天', type: '宏大', desc: '乾金威烈，高瞻遠矚，宜展鴻圖躍九霄' }
    ];

    // 道家哲理經典箴言庫
    this.daoQuotes = [
      '「何苦呢？這天下熙熙皆為利來，天下攘攘皆為利往。你放不下，這局便永遠扣著你。」',
      '「我即是方位，我即是吉凶。吉也罷，凶也罷，關鍵不在這盤，而在你自己肯不肯邁步。」',
      '「過去已定，未來未形。風後奇門能撥得動四盤，但撥不動你心中那一念。」',
      '「人之所以焦慮，是想要最好的結果，又不願承擔最壞的代價。把心定下，局自清明。」',
      '「順其自然不是聽天由命，而是盡了人事之後，坦然接納這天地大道。」',
      '「命數如溪流，順著游省力，逆著游成龍。你想當哪一種，自己挑。」',
      '「別老想著一步登天，中宮立得穩，八方風雨來了也是替你壯行。」'
    ];
  }

  // 核心占卜算局演算法：融合問題字串哈希、當前時間天干地支與隨機心念
  castBureau(question, category = 'career') {
    const timestamp = Date.now();
    let seed = 0;
    const str = (question || '') + category + timestamp;
    for (let i = 0; i < str.length; i++) {
      seed = (seed * 31 + str.charCodeAt(i)) % 1000000007;
    }

    // 隨機但基於心念種子衍生各盤落宮
    const palaceIdx = seed % 8;
    const gateIdx = (seed + 3) % 8;
    const starIdx = (seed + 5) % 8;
    const deityIdx = (seed + 7) % 8;

    const palace = this.palaces[palaceIdx];
    const gate = this.gates[gateIdx];
    const star = this.stars[starIdx];
    const deity = this.deities[deityIdx];

    // 綜合吉凶定格
    const outcome = this.evaluateOutcome(gate, star, deity, category);

    // 生成深度解盤
    const reading = this.generateDetailedReading(question, category, palace, gate, star, deity, outcome);

    // 存入歷史
    this.saveToHistory(reading);

    return reading;
  }

  // 評判格局吉凶
  evaluateOutcome(gate, star, deity, category) {
    let score = 0;
    if (gate.type === '大吉') score += 4;
    else if (gate.type === '吉' || gate.type === '次吉') score += 2;
    else if (gate.type === '凶' || gate.type === '大凶') score -= 3;

    if (star.type === '大吉') score += 3;
    else if (star.type === '吉' || star.type === '次吉') score += 2;
    else if (star.type === '凶') score -= 2;

    if (deity.type === '至吉' || deity.type === '吉和') score += 3;
    else if (deity.type === '穩厚' || deity.type === '宏大' || deity.type === '陰護') score += 1;
    else if (deity.type === '虛幻') score -= 1;

    let verdict = '中吉 · 守正待時';
    let grade = '中吉';
    let color = '#facc15';

    if (score >= 8) {
      verdict = '大吉 · 萬象咸亨';
      grade = '大吉';
      color = '#4ade80';
    } else if (score >= 4) {
      verdict = '上吉 · 雲開見日';
      grade = '上吉';
      color = '#60a5fa';
    } else if (score >= 0) {
      verdict = '平吉 · 順天應人';
      grade = '中平';
      color = '#facc15';
    } else if (score >= -3) {
      verdict = '困局 · 暗藏轉機';
      grade = '轉機';
      color = '#fb923c';
    } else {
      verdict = '凶局 · 宜避其鋒';
      grade = '謹慎';
      color = '#f87171';
    }

    return { score, verdict, grade, color };
  }

  // 生成詳盡斷卦報告
  generateDetailedReading(question, category, palace, gate, star, deity, outcome) {
    const quote = this.daoQuotes[Math.floor(Math.random() * this.daoQuotes.length)];

    // 四言籤詩
    const poems = [
      '太極初開萬象新，中宮端坐定乾坤。四盤流轉隨心動，吉凶由我不由人。',
      '九宮洛書藏妙法，八門開闔驗天機。休嗟眼前逢逆浪，時來風送步雲梯。',
      '陰陽交泰生生處，撥亂反正見真如。莫教私慾迷心目，守靜安常自得舒。',
      '龍吟虎嘯風雲起，九天值符映日明。行止有常明造化，何愁前路未成名。'
    ];
    const poem = poems[Math.floor(Math.random() * poems.length)];

    // 針對各維度的分析文字
    const analysis = this.buildContextualAnalysis(category, palace, gate, star, deity, outcome);

    // 風後奇門破局之法 (逆轉局勢心法)
    const strategy = this.buildStrategy(category, palace, gate, outcome);

    return {
      id: 'qh_' + Date.now().toString(36),
      time: new Date().toLocaleString('zh-TW', { hour12: false }),
      question: question || '心念所向 · 當前局勢探尋',
      category: this.getCategoryName(category),
      palace,
      gate,
      star,
      deity,
      outcome,
      poem,
      quote,
      analysis,
      strategy
    };
  }

  getCategoryName(cat) {
    const map = {
      career: '事業前程',
      love: '感情姻緣',
      wealth: '財富運勢',
      decision: '抉擇疑難',
      health: '心靈身心',
      daily: '今日一局'
    };
    return map[cat] || '綜合運勢';
  }

  // 根據類別與四盤組織分析文本
  buildContextualAnalysis(cat, palace, gate, star, deity, outcome) {
    let tian = '';
    let di = '';
    let ren = '';
    let shen = '';

    // 天時 (九星)
    tian = `當前天時逢【${star.name}】（${star.desc}）。象徵宏觀大勢此時處於變動交會期，外部環境節奏偏${star.type === '凶' ? '晦暗動盪，不宜貿然隨波逐流' : '平穩清明，順應時勢可獲事半功倍之效'}。`;

    // 地利 (八卦宮位)
    di = `落於【${palace.name}（${palace.direction}）】，五行屬【${palace.element}】。代表客觀基礎與基石所在，此方位氣場沉潛，務必腳踏實地夯實根本，方能經受波瀾考驗。`;

    // 人和 (人盤八門)
    ren = `人盤正值【${gate.name}】（${gate.type}，五行屬${gate.elem}）。${gate.desc}。於人事應對上，${gate.name === '生門' || gate.name === '開門' ? '利於主動出擊，開闢新局面' : gate.name === '休門' ? '宜養精蓄銳，廣結善緣，以柔克剛' : '需防範人事齟齬，切莫衝動失言，守中待機為上策'}。`;

    // 神助 (神盤八神)
    shen = `冥冥中得【${deity.name}】（${deity.desc}）庇蔭。暗示內在潛意識與第六感指引，${deity.name === '值符' ? '貴人暗中相助，胸懷大志可破千難' : deity.name === '六合' ? '合則兩利，借助團隊或伴侶力量成事' : '當明察秋毫，莫被表象迷離惑住心神'}。`;

    return { tian, di, ren, shen };
  }

  // 構造風後奇門破局之策
  buildStrategy(cat, palace, gate, outcome) {
    if (outcome.grade === '大吉' || outcome.grade === '上吉') {
      return {
        direction: `利於朝向【${palace.direction}】拓展`,
        action: '乘勝追擊，主動出擊；但記住居安思危，中宮不可亂。',
        mindset: '「水滿則溢，月盈則虧。得勢之時，更要懂得給別人留餘地。」'
      };
    } else if (outcome.grade === '中平') {
      return {
        direction: `暫守【${palace.direction}】，厚植實力`,
        action: '靜觀其變，以靜制動；將複雜問題拆解為可控小步推進。',
        mindset: '「不急不躁，盤在轉，時在變，該來的不會慢一秒。」'
      };
    } else {
      return {
        direction: `避開衝煞，借力【乾方西北】或【坤方西南】調息`,
        action: '風後奇門講求「撥動四盤，避凶就吉」。當前局勢硬碰硬必損，宜金蟬脫殼、轉移戰場。',
        mindset: '「死門之後便是生門，世上沒有解不開的局，只有鑽進死胡同不願回頭的人。」'
      };
    }
  }

  // 本地儲存歷史
  saveToHistory(reading) {
    try {
      let list = this.getHistory();
      list.unshift(reading);
      if (list.length > 20) list = list.slice(0, 20); // 保留最新 20 筆
      localStorage.setItem(this.historyKey, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }

  getHistory() {
    try {
      const data = localStorage.getItem(this.historyKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  clearHistory() {
    try {
      localStorage.removeItem(this.historyKey);
    } catch (e) {}
  }
}

// 建立全域單例
window.divinationEngine = new DivinationEngine();
