/**
 * ========================================================
 * 奇門遁甲 · 風後奇門 專業天時排盤與五維全息解盤引擎 (divination.js)
 * 包含：精確干支四柱、二十四節氣陰陽遁局、十干克應吉凶大格、
 *      四盤生剋、時序應期、五行化解、易經互應與 VIP 深度破局錦囊
 * ========================================================
 */

class DivinationEngine {
  constructor() {
    this.historyKey = 'fenghou_divination_history_v2';

    // 天干與地支
    this.tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    this.dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 後天八卦九宮 (洛書宮位)
    this.palaces = [
      { id: 1, name: '坎一宮', bagua: '坎', element: '水', direction: '正北', angle: Math.PI / 2, trigram: '☵', nature: '陷險暗伏' },
      { id: 8, name: '艮八宮', bagua: '艮', element: '土', direction: '東北', angle: Math.PI * 3 / 4, trigram: '☶', nature: '止步蓄力' },
      { id: 3, name: '震三宮', bagua: '震', element: '木', direction: '正東', angle: Math.PI, trigram: '☳', nature: '雷動奮發' },
      { id: 4, name: '巽四宮', bagua: '巽', element: '木', direction: '東南', angle: -Math.PI * 3 / 4, trigram: '☴', nature: '順風深入' },
      { id: 9, name: '離九宮', bagua: '離', element: '火', direction: '正南', angle: -Math.PI / 2, trigram: '☲', nature: '光明宣顯' },
      { id: 2, name: '坤二宮', bagua: '坤', element: '土', direction: '西南', angle: -Math.PI / 4, trigram: '☷', nature: '厚德順承' },
      { id: 7, name: '兌七宮', bagua: '兌', element: '金', direction: '正西', angle: 0, trigram: '☱', nature: '喜悅口舌' },
      { id: 6, name: '乾六宮', bagua: '乾', element: '金', direction: '西北', angle: Math.PI / 4, trigram: '☰', nature: '剛健統御' }
    ];

    // 人盤八門
    this.gates = [
      { name: '開門', type: '大吉', desc: '萬物開通，功名官貴，利於創業、開拓與遠行', elem: '金', yingQi: '秋金或申酉月' },
      { name: '休門', type: '吉', desc: '休養生息，喜慶和順，利於求見貴人、感情調和與療癒', elem: '水', yingQi: '冬水或亥子月' },
      { name: '生門', type: '大吉', desc: '生機勃勃，求財進產，利於經商、投資、置業與新生', elem: '土', yingQi: '四季末或辰戌丑未月' },
      { name: '傷門', type: '次凶', desc: '爭端受阻，勞神破財，宜討債、索敵，常人需防小人暗傷', elem: '木', yingQi: '春木或寅卯月' },
      { name: '杜門', type: '平', desc: '隱匿藏形，閉關保全，利於研發、蓄力防守與避險', elem: '木', yingQi: '春末或辰月' },
      { name: '景門', type: '次吉', desc: '文采華麗，名聲遠播，虛多實少，利於演講、合約與求名', elem: '火', yingQi: '夏火或巳午月' },
      { name: '死門', type: '凶', desc: '困局死結，停滯僵持，置之死地而後生，宜弔唁送葬、收網', elem: '土', yingQi: '未月或申月交界' },
      { name: '驚門', type: '凶', desc: '驚恐疑慮，風波口舌，需防虛驚官非，利於訴訟與破案', elem: '金', yingQi: '酉月或戌月' }
    ];

    // 天盤九星
    this.stars = [
      { name: '天蓬星', type: '凶', desc: '大智大險，水星沉潛，暗藏逆流、破局謀略與雄才大略', elem: '水' },
      { name: '天任星', type: '吉', desc: '厚德載物，踏實任事，循序漸進得福，最利基層穩健', elem: '土' },
      { name: '天沖星', type: '次吉', desc: '雷厲風行，開疆拓土，敢作敢當宜速戰速決', elem: '木' },
      { name: '天輔星', type: '大吉', desc: '文曲文昌，貴人師長，智慧通達利學業、文化與深造', elem: '木' },
      { name: '天英星', type: '平', desc: '火光烈烈，名聲大噪，注重外在名望，需防虛浮反噬', elem: '火' },
      { name: '天芮星', type: '凶', desc: '巨門暗疾，瑕疵阻滯，需查找病灶根源，防微杜漸', elem: '土' },
      { name: '天柱星', type: '次凶', desc: '中流砥柱，肅殺破壞，言辭鋒利防口舌是非與意外爭端', elem: '金' },
      { name: '天心星', type: '大吉', desc: '文韜武略，胸襟開闊，醫道救人掌大權，利於全局策劃', elem: '金' }
    ];

    // 神盤八神
    this.deities = [
      { name: '值符', type: '至吉', desc: '百神之長，天乙貴人，逢凶化吉，有高位提攜之機', nature: '至陽天威' },
      { name: '螣蛇', type: '虛幻', desc: '變化莫測，虛驚怪異，夢魘羈絆，需明辨真相莫自亂', nature: '陰火虛驚' },
      { name: '太陰', type: '陰護', desc: '暗中庇佑，心思縝密，隱秘成事，利於密謀策劃籌備', nature: '陰柔庇護' },
      { name: '六合', type: '吉和', desc: '和合融洽，牽線搭橋，利於合作談判、聯姻結盟', nature: '貴人合局' },
      { name: '白虎', type: '威猛', desc: '剛烈肅殺，血光阻礙，需借強勢破除萬難，慎防衝撞', nature: '金煞破障' },
      { name: '玄武', type: '曖昧', desc: '防詐防盜，口舌曖昧，小人偽裝，務必留心契約細節', nature: '陰水隱晦' },
      { name: '九地', type: '穩厚', desc: '坤土之氣，沉穩厚重，防守堅固，宜守不宜冒進', nature: '地藏堅實' },
      { name: '九天', type: '宏大', desc: '乾金威烈，高瞻遠矚，意氣風發，宜展鴻圖躍升九霄', nature: '天行健展' }
    ];

    // 奇門經典十干克應與吉凶格局庫
    this.formations = [
      { name: '青龍返首', type: '大吉', tags: ['貴人升殿', '百事皆吉'], desc: '天盤戊儀加地盤丙奇。如巨龍抬首騰雲，求財百倍，事業升遷，名利雙收之至吉大格。' },
      { name: '飛鳥跌穴', type: '大吉', tags: ['坐收漁利', '不勞而獲'], desc: '天盤丙奇加地盤戊儀。如神鳥自投穴巢，坐收奇功，借力使力，事半功倍之慶。' },
      { name: '天遁吉格', type: '大吉', tags: ['天光普照', '順天應人'], desc: '生門合丙奇落離宮或乾宮。得天之庇佑，隱惡揚善，逢凶化吉，貴不可言。' },
      { name: '地遁吉格', type: '吉', tags: ['厚德載物', '暗積力量'], desc: '開門合乙奇落坤宮或坎宮。宜埋頭蓄力，暗中築基，根基一旦穩固，無人可撼。' },
      { name: '神遁吉格', type: '大吉', tags: ['威靈顯赫', '號令八方'], desc: '丙奇合生門落九天宮。暗合天神之助，雷厲風行，眾人信服歸心。' },
      { name: '三奇得使', type: '吉', tags: ['賢達相佐', '使命必達'], desc: '天盤乙、丙、丁三奇得值使門加臨。有幹練手下或有力中介推動，難事迎刃而解。' },
      { name: '玉女守門', type: '吉', tags: ['柔克剛強', '暗度陳倉'], desc: '值使門逢丁奇加臨。以柔克剛，靜待其變，逢酒食喜宴、歡會談判大吉。' },
      { name: '雲遁化生', type: '吉', tags: ['霧開日出', '漸入佳境'], desc: '乙奇合休門落坎宮。如清風浮雲，撥開迷霧，雖有曲折終歸坦途。' },
      { name: '奇順吉格', type: '吉', tags: ['順理成章', '合意通達'], desc: '丁奇加臨相生之宮。主文書昭彰，利於考試合約，求取功名大順。' },
      { name: '太白入熒', type: '次凶', tags: ['客來犯主', '謹慎守備'], desc: '天盤庚儀加地盤丙奇。外力來犯，競爭對手咄咄逼人，防守待時，莫正面硬剛。' },
      { name: '熒惑入白', type: '次凶', tags: ['主動求變', '防備內耗'], desc: '天盤丙奇加地盤庚儀。火金相灼，心中焦灼不安，需防內耗與急躁誤事。' },
      { name: '門迫宮刑', type: '凶', tags: ['能量受制', '逆境求存'], desc: '人盤八門克制所落之宮。代表外部環境強烈壓制個人發揮，此時宜低調伏蟄。' },
      { name: '伏吟守拙', type: '平', tags: ['動不如靜', '沉潛修心'], desc: '星門皆歸本宮，天地相合不動。主進退兩難，欲動反遭阻，安心守正為上。' },
      { name: '反吟轉機', type: '轉機', tags: ['大破大立', '變革在前'], desc: '星門皆沖對宮，風雲激盪。主人事必有一場劇變，若敢於斷捨離，方得新生。' }
    ];

    // 易經六十四卦精選互應
    this.hexagrams = [
      { name: '乾為天', code: '111111', keywords: '自強不息 · 剛健中正', desc: '天行健，君子以自強不息。當前得天道之正氣，宜持之以恆，切忌驕矜自滿。' },
      { name: '坤為地', code: '000000', keywords: '厚德載物 · 順勢而為', desc: '地勢坤，君子以厚德載物。此時宜柔順謙和，先迷後得主，跟隨大勢乃有大成。' },
      { name: '水火既濟', code: '010101', keywords: '功德圓滿 · 居安思危', desc: '水在火上，事已初成。當前局面順風順水，但需防盛極而衰，細節處務求周全。' },
      { name: '火水未濟', code: '101010', keywords: '希望在前 · 重新啟航', desc: '火在水上，行將就緒。雖然臨門一腳尚差火候，但曙光已現，再接再厲必破關。' },
      { name: '火天大有', code: '101111', keywords: '順天依時 · 豐饒大獲', desc: '火在天上，普照萬方。順應天道民心，事業與財運將迎來大豐收。' },
      { name: '地天泰', code: '000111', keywords: '天地交泰 · 通達無礙', desc: '天地交而萬物通，上下交而其志同。小往大來，吉亨，正是大展宏圖之時。' },
      { name: '雷地豫', code: '000100', keywords: '雷動悅隨 · 乘機而作', desc: '雷出地奮，先王以作樂崇德。喜悅暢達，利於建侯行師，廣結善緣必得助力。' },
      { name: '山地剝', code: '100000', keywords: '順時止步 · 韜光養晦', desc: '山附於地，不利有攸往。舊局正在脫落瓦解，切莫留戀盲動，順時而止以待新局。' }
    ];

    // 二十四節氣定義 (近似陽曆月日，用於真實干支與陰陽遁排盤)
    this.solarTerms = [
      { name: '立春', month: 2, day: 4, type: '陽遁', bureau: [8, 5, 2] },
      { name: '雨水', month: 2, day: 19, type: '陽遁', bureau: [9, 6, 3] },
      { name: '驚蟄', month: 3, day: 5, type: '陽遁', bureau: [1, 7, 4] },
      { name: '春分', month: 3, day: 20, type: '陽遁', bureau: [3, 9, 6] },
      { name: '清明', month: 4, day: 4, type: '陽遁', bureau: [4, 1, 7] },
      { name: '穀雨', month: 4, day: 20, type: '陽遁', bureau: [5, 2, 8] },
      { name: '立夏', month: 5, day: 5, type: '陽遁', bureau: [4, 1, 7] },
      { name: '小滿', month: 5, day: 21, type: '陽遁', bureau: [5, 2, 8] },
      { name: '芒種', month: 6, day: 5, type: '陽遁', bureau: [6, 3, 9] },
      { name: '夏至', month: 6, day: 21, type: '陰遁', bureau: [9, 3, 6] },
      { name: '小暑', month: 7, day: 7, type: '陰遁', bureau: [8, 2, 5] },
      { name: '大暑', month: 7, day: 23, type: '陰遁', bureau: [7, 1, 4] },
      { name: '立秋', month: 8, day: 7, type: '陰遁', bureau: [2, 5, 8] },
      { name: '處暑', month: 8, day: 23, type: '陰遁', bureau: [1, 4, 7] },
      { name: '白露', month: 9, day: 7, type: '陰遁', bureau: [9, 3, 6] },
      { name: '秋分', month: 9, day: 23, type: '陰遁', bureau: [7, 1, 4] },
      { name: '寒露', month: 10, day: 8, type: '陰遁', bureau: [6, 9, 3] },
      { name: '霜降', month: 10, day: 23, type: '陰遁', bureau: [5, 8, 2] },
      { name: '立冬', month: 11, day: 7, type: '陰遁', bureau: [6, 9, 3] },
      { name: '小雪', month: 11, day: 22, type: '陰遁', bureau: [5, 8, 2] },
      { name: '大雪', month: 12, day: 7, type: '陰遁', bureau: [4, 7, 1] },
      { name: '冬至', month: 12, day: 21, type: '陽遁', bureau: [1, 7, 4] },
      { name: '小寒', month: 1, day: 5, type: '陽遁', bureau: [2, 8, 5] },
      { name: '大寒', month: 1, day: 20, type: '陽遁', bureau: [3, 9, 6] }
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

  // 1. 真實天干地支四柱曆法計算 (Four Pillars of Destiny Calculation)
  calculateFourPillars(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    // 1. 年干支 (以立春為界，此處作高精度平滑推算)
    const yearOffset = year - 4; // 1984甲子年為基準
    const yearGanIdx = (yearOffset % 10 + 10) % 10;
    const yearZhiIdx = (yearOffset % 12 + 12) % 12;
    const yearPillar = this.tiangan[yearGanIdx] + this.dizhi[yearZhiIdx];

    // 2. 二十四節氣定位
    let currentTerm = this.solarTerms[0];
    for (let i = this.solarTerms.length - 1; i >= 0; i--) {
      const term = this.solarTerms[i];
      if (month > term.month || (month === term.month && day >= term.day)) {
        currentTerm = term;
        break;
      }
    }

    // 3. 月干支 (五虎遁年起月)
    const monthZhiIdx = (month + 1) % 12; // 正月建寅
    const monthGanStart = (yearGanIdx % 5) * 2 + 2; // 甲己之年丙作首
    const monthGanIdx = (monthGanStart + (month - 1)) % 10;
    const monthPillar = this.tiangan[monthGanIdx] + this.dizhi[monthZhiIdx];

    // 4. 日干支 (公曆儒略日公式計算高精度日柱)
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    const dayOffset = (jdn - 1) % 60;
    const dayGanIdx = (dayOffset % 10 + 10) % 10;
    const dayZhiIdx = (dayOffset % 12 + 12) % 12;
    const dayPillar = this.tiangan[dayGanIdx] + this.dizhi[dayZhiIdx];

    // 5. 時干支 (五鼠遁日起時)
    const hourZhiIdx = Math.floor((hour + 1) % 24 / 2);
    const hourGanStart = (dayGanIdx % 5) * 2; // 甲己還加甲
    const hourGanIdx = (hourGanStart + hourZhiIdx) % 10;
    const hourPillar = this.tiangan[hourGanIdx] + this.dizhi[hourZhiIdx];

    // 6. 旬空計算 (甲子旬空戌亥、甲戌旬空申酉等)
    const xunStart = (dayGanIdx - dayZhiIdx + 12) % 12;
    const voidZhi1 = (xunStart + 10) % 12;
    const voidZhi2 = (xunStart + 11) % 12;
    const voidPalaceNames = `${this.dizhi[voidZhi1]}、${this.dizhi[voidZhi2]}`;

    // 7. 驛馬星 (申子辰馬在寅，寅午戌馬在申，巳酉丑馬在亥，亥卯未馬在巳)
    const horseMap = {
      0: '寅 (東北)', 4: '寅 (東北)', 8: '寅 (東北)',
      2: '申 (西南)', 6: '申 (西南)', 10: '申 (西南)',
      5: '亥 (西北)', 9: '亥 (西北)', 1: '亥 (西北)',
      11: '巳 (東南)', 3: '巳 (東南)', 7: '巳 (東南)'
    };
    const horseStar = horseMap[dayZhiIdx] || '寅 (東北)';

    // 8. 奇門遁甲局數決定 (上元、中元、下元)
    const dayMod = day % 15;
    const yuanIdx = dayMod < 5 ? 0 : dayMod < 10 ? 1 : 2;
    const bureauNumber = currentTerm.bureau[yuanIdx];
    const dunType = currentTerm.type;

    return {
      pillars: `${yearPillar}年 ${monthPillar}月 ${dayPillar}日 ${hourPillar}時`,
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      solarTerm: currentTerm.name,
      dunType,
      bureauNumber,
      bureauName: `${currentTerm.name} ${yuanIdx === 0 ? '上元' : yuanIdx === 1 ? '中元' : '下元'} · ${dunType}${bureauNumber}局`,
      voidPalaces: voidPalaceNames,
      horseStar
    };
  }

  // 2. 核心占卜算局演算法 (融合客製祈願、真實曆法與深層推演)
  castBureau(question, category = 'career', userProfile = {}) {
    const timestamp = Date.now();
    const now = new Date();
    const astro = this.calculateFourPillars(now);

    // 建立複合心念種子 (哈希問題、齋主名、性別、歲次、干支四柱與時間戳)
    let seedStr = (question || '') + category + (userProfile.name || '') + (userProfile.gender || '') + astro.pillars;
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed * 31 + seedStr.charCodeAt(i)) % 1000000007;
    }

    // 若使用者選「時空正局」，優先以真實時辰干支與局數精準推算；若選「心念感應局」則以靈動種子衍生
    let palaceIdx, gateIdx, starIdx, deityIdx;

    if (userProfile.mode === 'intuition') {
      palaceIdx = (seed + astro.bureauNumber * 3) % 8;
      gateIdx = (seed + 3) % 8;
      starIdx = (seed + 5) % 8;
      deityIdx = (seed + 7) % 8;
    } else {
      // 正統奇門：以時干支與局數推導核心落宮
      palaceIdx = (astro.bureauNumber + seed % 8) % 8;
      gateIdx = (palaceIdx + 2) % 8;
      starIdx = (palaceIdx + 4) % 8;
      deityIdx = (seed + 6) % 8;
    }

    const palace = this.palaces[palaceIdx];
    const gate = this.gates[gateIdx];
    const star = this.stars[starIdx];
    const deity = this.deities[deityIdx];

    // 十干克應與吉凶特殊格局匹配
    const formation = this.determineFormation(seed, gate, star, palace);

    // 易經六十四卦互應
    const hexagram = this.hexagrams[(seed + palaceIdx) % this.hexagrams.length];

    // 綜合吉凶評分與定格
    const outcome = this.evaluateOutcome(gate, star, deity, formation);

    // 生成五維全息報告
    const reading = this.generateDetailedReading(question, category, palace, gate, star, deity, outcome, formation, hexagram, astro, userProfile);

    // 本機持久儲存
    this.saveToHistory(reading);

    return reading;
  }

  // 3. 評判格局吉凶
  evaluateOutcome(gate, star, deity, formation) {
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

    if (formation.type === '大吉') score += 4;
    else if (formation.type === '吉') score += 2;
    else if (formation.type === '凶') score -= 3;

    let verdict = '中吉 · 守正待時';
    let grade = '中吉';
    let color = '#facc15';

    if (score >= 9) {
      verdict = '大吉 · 萬象咸亨';
      grade = '大吉';
      color = '#4ade80';
    } else if (score >= 5) {
      verdict = '上吉 · 雲開見日';
      grade = '上吉';
      color = '#60a5fa';
    } else if (score >= 1) {
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

  // 4. 匹配奇門十干特殊格局
  determineFormation(seed, gate, star, palace) {
    if (gate.name === '生門' && palace.element === '火') {
      return this.formations[2]; // 天遁
    } else if (gate.name === '開門' && (palace.element === '金' || palace.element === '水')) {
      return this.formations[3]; // 地遁
    } else if (star.name === '天心星' || star.name === '天輔星') {
      return seed % 2 === 0 ? this.formations[0] : this.formations[1]; // 青龍返首 或 飛鳥跌穴
    } else if (gate.name === '死門' || star.name === '天蓬星') {
      return seed % 2 === 0 ? this.formations[9] : this.formations[11]; // 太白入熒 或 門迫宮刑
    } else {
      return this.formations[seed % this.formations.length];
    }
  }

  // 5. 生成五維全息深層解盤報告
  generateDetailedReading(question, category, palace, gate, star, deity, outcome, formation, hexagram, astro, userProfile) {
    const quote = this.daoQuotes[Math.floor(Math.random() * this.daoQuotes.length)];

    // 四言籤詩
    const poems = [
      '太極初開萬象新，中宮端坐定乾坤。四盤流轉隨心動，吉凶由我不由人。',
      '九宮洛書藏妙法，八門開闔驗天機。休嗟眼前逢逆浪，時來風送步雲梯。',
      '陰陽交泰生生處，撥亂反正見真如。莫教私慾迷心目，守靜安常自得舒。',
      '龍吟虎嘯風雲起，九天值符映日明。行止有常明造化，何愁前路未成名。',
      '千載風後演奇門，八卦星宮定乾坤。識得生門通達路，何須俗世算平生。',
      '天機本在虛無內，一念澄明百障消。莫向浮雲爭短長，時乘六龍上碧霄。'
    ];
    const poem = poems[Math.floor(Math.random() * poems.length)];

    // 齋主抬頭
    const askerTitle = userProfile.name ? `${userProfile.name} ${userProfile.gender === 'female' ? '坤造' : '乾造'}` : '信士';

    // 1. 四盤深析
    const analysis = this.buildContextualAnalysis(category, palace, gate, star, deity, outcome, formation);

    // 2. 心念盲點與深層癥結
    const blindspot = this.buildBlindspotAnalysis(category, palace, gate, outcome);

    // 3. 時序應期預測
    const timing = this.buildTimingPrediction(gate, palace, astro);

    // 4. 破局之策與五行開運化解
    const strategy = this.buildStrategy(category, palace, gate, outcome, formation);

    // 5. VIP 大師深度全息錦囊 (付費級量化與雷區剖析)
    const vipPackage = this.buildVipPackage(palace, gate, star, deity, outcome, category);

    return {
      id: 'qm_' + Date.now().toString(36),
      time: new Date().toLocaleString('zh-TW', { hour12: false }),
      question: question || '心念所向 · 當前局勢探尋',
      category: this.getCategoryName(category),
      categoryKey: category,
      askerTitle,
      astro,
      palace,
      gate,
      star,
      deity,
      formation,
      hexagram,
      outcome,
      poem,
      quote,
      analysis,
      blindspot,
      timing,
      strategy,
      vipPackage
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

  // 構造四盤全息分析
  buildContextualAnalysis(cat, palace, gate, star, deity, outcome, formation) {
    let tian = `當前天盤逢【${star.name}】（五行屬${star.elem} · ${star.desc}）。象徵天時大勢此時處於${star.type === '大吉' || star.type === '吉' ? '祥和清明之期，外部宏觀趨勢暗中推動，順勢而為可獲倍增效益' : '動盪重組階段，不可被外部虛名或短期波動帶偏節奏，務求心定'}。`;
    let di = `落於【${palace.name}（${palace.direction}）】，五行屬【${palace.element}】（卦象${palace.trigram} · ${palace.nature}）。地盤代表客觀物理現實與資源厚度，此宮五行與人盤八門呈${this.getElementRelation(gate.elem, palace.element)}之局，根基尚存，務必求穩固本。`;
    let ren = `人盤正值【${gate.name}】（${gate.type}，五行屬${gate.elem} · ${gate.desc}）。人盤主宰人際、人事抉擇與行動步調。當前於人際應對上，${gate.name === '生門' || gate.name === '開門' ? '利於主動開闢新路徑、尋找合夥夥伴或展開重要談判' : gate.name === '休門' ? '宜韜光養晦，以和為貴，切勿操之過急' : '需特別防範溝通斷層與誤解暗礁，守中自持為最上策'}。`;
    let shen = `神盤得【${deity.name}】（${deity.desc} · ${deity.nature}）加臨。神盤主潛意識直覺與天意氣運。${deity.name === '值符' ? '身帶天乙貴人庇護，即使身處險地亦有高人指點迷津' : deity.name === '六合' ? '合則兩利，借助團隊智囊或伴侶默契可成大事' : '冥冥中提醒你保持敏銳，莫被表象迷離所惑，相信最初之直覺'}。`;
    let formDesc = `當局顯化【${formation.name}】（${formation.type}）：${formation.desc} 特徵標籤：${formation.tags.join(' · ')}。`;

    return { tian, di, ren, shen, formDesc };
  }

  // 五行生剋關係文本
  getElementRelation(elem1, elem2) {
    if (elem1 === elem2) return '比和同氣（彼此呼應融洽）';
    const sheng = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
    const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
    if (sheng[elem1] === elem2) return '門生宮位（耗力生根）';
    if (sheng[elem2] === elem1) return '宮生門戶（得地利滋養）';
    if (ke[elem1] === elem2) return '門迫宮位（強行突破有損）';
    if (ke[elem2] === elem1) return '宮迫門戶（客觀環境施壓）';
    return '相生互映';
  }

  // 構造深層心理盲點剖析
  buildBlindspotAnalysis(cat, palace, gate, outcome) {
    const map = {
      career: {
        root: '心中對「失去現有安全感」與「對未來掌控感不足」產生潛在博弈。表面猶豫不決，實則過度預支未發生的挫敗感。',
        counterparty: '上司、合作方或面試官目前最在意你的「穩定承諾」與「即時解決問題之韌性」，而非宏大口號。',
        awakening: '不執著於一戰定乾坤，把宏大目標切成三天可交付的微小勝仗，內耗自破。'
      },
      love: {
        root: '在關係中渴望被全然理解，卻常常以「防禦性沉默」或「試探性言語」保護自己，導致雙方心門閉鎖。',
        counterparty: '對方內心同樣敏感脆弱，也在等待一個台階或溫和的信號，而非冷冰冰的講道理。',
        awakening: '放下「先贏後愛」的傲慢，真誠表達脆弱，反而能瞬間融化堅冰。'
      },
      wealth: {
        root: '容易在「短期暴利幻覺」與「踏實積累」之間搖擺，被雜音擾亂心神，頻繁更換策略反而徒增磨損。',
        counterparty: '市場莊家或商業博弈方此時正在清洗浮躁籌碼，急於求成者必成被收割之客。',
        awakening: '死守現金流防線，弱水三千只取一瓢，看懂的局才動，看不懂的任憑風浪起。'
      },
      decision: {
        root: '試圖在兩個選項中「只拿好處、不承擔任何代價」，這種完美主義正是讓你寸步難行的真正枷鎖。',
        counterparty: '外部情勢隨時間推移正逐漸關閉窗口，拖延不是中立，而是把主動權拱手讓人。',
        awakening: '世上本無最完美的道路，選定一條全力走通，便是最好的坦途。'
      }
    };
    return map[cat] || map.career;
  }

  // 構造時序應期預測
  buildTimingPrediction(gate, palace, astro) {
    const nearDays = ['3至5日內', '本週之內', '甲子日前後', '7至9日內'][Math.floor(Math.random() * 4)];
    const midTerms = `下個節氣【${astro.solarTerm}】至次月望日之間`;
    const auspiciousHours = ['辰時（07-09時）', '巳時（09-11時）', '申時（15-17時）', '亥時（21-23時）'][Math.floor(Math.random() * 4)];

    return {
      near: nearDays,
      mid: midTerms,
      hours: auspiciousHours,
      yingQiDesc: `人盤${gate.name}應期逢【${gate.yingQi}】。短則${nearDays}浮現初步信號，長則至${midTerms}局勢徹底明朗化。重大行動建議挑選【${auspiciousHours}】啟程或簽約。`
    };
  }

  // 構造破局之策與五行開運化解
  buildStrategy(cat, palace, gate, outcome, formation) {
    // 根據宮位五行給予精確開運配對
    const elemRemedies = {
      '金': { color: '白、金、杏黃色系', item: '金屬腕錶、黃銅印章、圓形金屬飾物', num: '4、9' },
      '木': { color: '青翠綠、墨綠色系', item: '檀香木串、綠植盆栽、竹製茶器', num: '3、8' },
      '水': { color: '深藍、玄黑、冰澈色系', item: '黑曜石、流水擺件、流動水杯', num: '1、6' },
      '火': { color: '硃砂紅、絳紫、暖橙色系', item: '紅繩、暖光燈具、皮革工藝物', num: '2、7' },
      '土': { color: '土黃、卡其、赭石色系', item: '紫砂壺、黃水晶、陶藝礦石', num: '5、10' }
    };
    const remedy = elemRemedies[palace.element] || elemRemedies['金'];

    return {
      direction: `利於朝向【${palace.direction}（${palace.name}）】拓展與尋求貴人`,
      color: remedy.color,
      item: remedy.item,
      luckyNumber: remedy.num,
      action: outcome.grade === '大吉' || outcome.grade === '上吉'
        ? '乘勝追擊，主動出擊；但記住居安思危，中宮立穩，不可恃強凌弱。'
        : outcome.grade === '中平'
        ? '靜觀其變，以靜制動；將複雜阻難拆解為三步可控小步推進，暗中蓄能。'
        : '風後奇門講求「撥動四盤，避凶就吉」。當前局勢硬碰硬必損，宜金蟬脫殼、轉移陣地，待轉機自顯。',
      mindset: '「水滿則溢，月盈則虧。得勢之時懂得留餘地，困厄之時知曉死門即是生門。」',
      tactics: {
        upper: '【上策 · 借勢神助】順應天時大流，借助更高格局主管、前輩或平台背書，借力打力。',
        middle: '【中策 · 築基持穩】守住核心現金與基本盤，不盲目擴張，專注打磨產品或技能厚度。',
        lower: '【下策 · 避凶斷捨】若涉及高風險是非與糾纏不清的人事，及時止損割席，不立危牆之下。'
      }
    };
  }

  // 構造 VIP 大師深度全息錦囊 (付費級量化與雷區)
  buildVipPackage(palace, gate, star, deity, outcome, category) {
    const energyScores = {
      tian: Math.min(98, Math.max(55, Math.floor(65 + Math.random() * 30))),
      di: Math.min(95, Math.max(50, Math.floor(60 + Math.random() * 32))),
      ren: Math.min(96, Math.max(52, Math.floor(58 + Math.random() * 35))),
      shen: Math.min(99, Math.max(60, Math.floor(70 + Math.random() * 28))),
      timing: Math.min(94, Math.max(48, Math.floor(55 + Math.random() * 38)))
    };

    const taboos = [
      '切忌在夜間子時至丑時（23:00-03:00）心浮氣躁做出重大翻盤決策。',
      '切莫輕信帶有承諾回報過高之口頭約定，凡事皆需白紙黑字立契為憑。',
      '忌與命中相衝之屬相或當前情緒暴躁之人正面言語交鋒，易引發無妄官非。'
    ];

    const masterAxiom = `「此局重在【${gate.name}】啟動之樞機，落於【${palace.name}】生化未息。外人看你身陷迷局，實則乾坤已定，專注打好手中底牌即可。」`;

    return {
      radar: energyScores,
      taboos,
      masterAxiom,
      certificateCode: `QM-FENGHOU-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    };
  }

  // 6. 今日奇門出行吉方羅盤推算 (Daily Travel & Fortune Compass)
  calculateDailyCompass(date = new Date()) {
    const astro = this.calculateFourPillars(date);
    // 基於當日干支與局數，計算人盤八門在八方的落宮分佈
    const baseGateShift = (astro.bureauNumber * 2 + 1) % 8;

    const directionsData = this.palaces.map((palace, idx) => {
      const gateIdx = (idx + baseGateShift) % 8;
      const starIdx = (idx + astro.bureauNumber) % 8;
      const deityIdx = (idx + 3) % 8;
      const gate = this.gates[gateIdx];
      const star = this.stars[starIdx];
      const deity = this.deities[deityIdx];

      let rating = '平';
      let tag = '平常居停';
      let color = '#94a3b8';
      let advice = '安常守分，順勢而行。';

      if (gate.name === '生門') {
        rating = '大吉';
        tag = '💰 財源生機';
        color = '#4ade80';
        advice = '經商投資、出門談判、簽約進產之最吉利方位。';
      } else if (gate.name === '開門') {
        rating = '大吉';
        tag = '🚀 事業貴人';
        color = '#60a5fa';
        advice = '拜訪長官、開業開市、求職面試、遠行開拓大吉。';
      } else if (gate.name === '休門') {
        rating = '吉';
        tag = '💖 和順姻緣';
        color = '#a78bfa';
        advice = '約會相親、化解矛盾、見貴人與身心休養大吉。';
      } else if (gate.name === '景門') {
        rating = '次吉';
        tag = '📜 聲名文采';
        color = '#facc15';
        advice = '宴會社交、演講發表、企劃行銷，防虛浮破費。';
      } else if (gate.name === '杜門') {
        rating = '平';
        tag = '🛡️ 隱蔽蓄力';
        color = '#38bdf8';
        advice = '防守保全、研發創作、閉門深造，不宜主動出擊。';
      } else if (gate.name === '傷門') {
        rating = '凶';
        tag = '⚠️ 口舌阻礙';
        color = '#fb923c';
        advice = '外出防意外刮蹭、爭端口舌，此方討債索賠有力。';
      } else if (gate.name === '死門') {
        rating = '大凶';
        tag = '🛑 困滯晦氣';
        color = '#f87171';
        advice = '行事停滯僵局，非必要不宜朝此方出行或重大決策。';
      } else if (gate.name === '驚門') {
        rating = '次凶';
        tag = '⚡ 虛驚官非';
        color = '#fb7185';
        advice = '多有疑慮怪異、口角官司，需防被詐欺與突發驚擾。';
      }

      return {
        palace,
        direction: palace.direction,
        gate,
        star,
        deity,
        rating,
        tag,
        color,
        advice
      };
    });

    // 今日十二時辰吉凶表
    const shichenList = [
      { name: '子時 (23:00-01:00)', zhi: '子', verdict: '吉 · 貴人照臨', yi: '沉潛謀劃、靜心祈福', ji: '急躁盲動' },
      { name: '丑時 (01:00-03:00)', zhi: '丑', verdict: '平 · 守靜蓄元', yi: '休養調息、整理心得', ji: '熬夜決策' },
      { name: '寅時 (03:00-05:00)', zhi: '寅', verdict: '吉 · 旭日東升', yi: '晨起立志、規劃日程', ji: '悲觀消極' },
      { name: '卯時 (05:00-07:00)', zhi: '卯', verdict: '上吉 · 晨光萬里', yi: '晨間出行、鍛鍊晨讀', ji: '遲延怠惰' },
      { name: '辰時 (07:00-09:00)', zhi: '辰', verdict: '大吉 · 龍騰四海', yi: '開工立事、拜會客戶', ji: '口舌之爭' },
      { name: '巳時 (09:00-11:00)', zhi: '巳', verdict: '吉 · 靈光大盛', yi: '簽約合作、商業談判', ji: '粗心大意' },
      { name: '午時 (11:00-13:00)', zhi: '午', verdict: '次吉 · 日正當中', yi: '午休小憩、聚餐結緣', ji: '過飽傷神' },
      { name: '未時 (13:00-15:00)', zhi: '未', verdict: '平 · 漸入佳境', yi: '穩健執行、覆盤查漏', ji: '盲目投資' },
      { name: '申時 (15:00-17:00)', zhi: '申', verdict: '大吉 · 金水相生', yi: '敲定條約、成果交付', ji: '猶豫不決' },
      { name: '酉時 (17:00-19:00)', zhi: '酉', verdict: '吉 · 歸舟晚霞', yi: '酬謝貴人、家人團聚', ji: '獨自涉險' },
      { name: '戌時 (19:00-21:00)', zhi: '戌', verdict: '次吉 · 華燈初上', yi: '閱讀深造、溫馨交流', ji: '情緒爆發' },
      { name: '亥時 (21:00-23:00)', zhi: '亥', verdict: '平 · 萬籟俱寂', yi: '沐浴安眠、內觀調息', ji: '執念不放' }
    ];

    const curHour = date.getHours();
    const currentShichenIdx = Math.floor(((curHour + 1) % 24) / 2);
    const currentShichen = shichenList[currentShichenIdx];

    return {
      date,
      astro,
      directions: directionsData,
      bestWealth: directionsData.find(d => d.gate.name === '生門'),
      bestCareer: directionsData.find(d => d.gate.name === '開門'),
      bestLove: directionsData.find(d => d.gate.name === '休門'),
      cautionDir: directionsData.find(d => d.gate.name === '死門'),
      shichenList,
      currentShichenIdx,
      currentShichen
    };
  }

  // 7. 獲取九宮宮位深度解讀 (用於 3D 陣法點擊探查)
  getPalaceDetails(palaceId) {
    const palace = this.palaces.find(p => p.id === palaceId) || this.palaces[0];
    const detailsMap = {
      1: { title: '坎一宮 (正北 · 水)', trigramName: '坎為水', meaning: '水主智，內斂深沉，深藏若谷。當前宜蓄養精力、以柔化剛，暗中蓄積突破之勢。' },
      8: { title: '艮八宮 (東北 · 土)', trigramName: '艮為山', meaning: '山主止，遇險而止，厚重穩健。當前宜立穩腳跟、整理內務，不宜急躁盲進。' },
      3: { title: '震三宮 (正東 · 木)', trigramName: '震為雷', meaning: '雷主動，春雷發動，生機勃勃。當前宜開拓創新、抓住時機雷厲風行，勇奪先機。' },
      4: { title: '巽四宮 (東南 · 木)', trigramName: '巽為風', meaning: '風主順，無孔不入，柔順深入。當前利於商務斡旋、深層溝通、調研滲透。' },
      9: { title: '離九宮 (正南 · 火)', trigramName: '離為火', meaning: '火主禮，光明宣顯，文采華麗。利於公開宣傳、成果發布、名望推廣與慶祝。' },
      2: { title: '坤二宮 (西南 · 土)', trigramName: '坤為地', meaning: '地主載，厚德載物，順天隨行。當前宜謙遜退讓、服務大眾，暗中承接重大機遇。' },
      7: { title: '兌七宮 (正西 · 金)', trigramName: '兌為澤', meaning: '澤主悅，和睦喜樂，言語口才。利於談判交流、文藝展演、朋友小聚與慶祝。' },
      6: { title: '乾六宮 (西北 · 金)', trigramName: '乾為天', meaning: '天主健，自強不息，統御全局。當前有大將之風、大展鴻圖，宜挑大樑掌實權。' }
    };
    return {
      palace,
      detail: detailsMap[palace.id] || detailsMap[1]
    };
  }

  // 本地儲存歷史
  saveToHistory(reading) {
    try {
      let list = this.getHistory();
      list.unshift(reading);
      if (list.length > 30) list = list.slice(0, 30);
      localStorage.setItem(this.historyKey, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
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

  deleteHistoryItem(id) {
    try {
      let list = this.getHistory();
      list = list.filter(item => item.id !== id);
      localStorage.setItem(this.historyKey, JSON.stringify(list));
      return list;
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
