/**
 * ========================================================
 * 奇門遁甲 · 正統時家轉盤排盤與五維全息解盤引擎 (divination.js)
 * 核心演算法：
 *  1. 儒略日四柱干支、二十四節氣定局、正統【拆補法】符頭定上中下三元
 *  2. 地盤三奇六儀（戊己庚辛壬癸丁丙乙）陽順陰逆飛布九宮（中五寄坤二）
 *  3. 時柱旬首尋值符九星、值使八門；值符隨時干（帶天盤三奇六儀轉盤）、值使隨時宮
 *  4. 八神盤（值符、螣蛇、太陰、六合、白虎、玄武、九地、九天）陽順陰逆排布
 *  5. 100% 確定性推演（零隨機數 Math.random），依事體用神與觸機數鎖定落宮與十干克應
 * ========================================================
 */

class DivinationEngine {
  constructor() {
    this.historyKey = 'qimen_dunjia_history_v3';

    // 天干與地支
    this.tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    this.dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 轉盤奇門外八宮順時針環序：坎一 -> 艮八 -> 震三 -> 巽四 -> 離九 -> 坤二 -> 兌七 -> 乾六
    this.ringOrder = [1, 8, 3, 4, 9, 2, 7, 6];

    // 後天八卦外八宮 (依環序排列)
    this.palaces = [
      { id: 1, name: '坎一宮', bagua: '坎', element: '水', direction: '正北', angle: Math.PI / 2, trigram: '☵', nature: '陷險暗伏', branches: ['子'] },
      { id: 8, name: '艮八宮', bagua: '艮', element: '土', direction: '東北', angle: Math.PI * 3 / 4, trigram: '☶', nature: '止步蓄力', branches: ['丑', '寅'] },
      { id: 3, name: '震三宮', bagua: '震', element: '木', direction: '正東', angle: Math.PI, trigram: '☳', nature: '雷動奮發', branches: ['卯'] },
      { id: 4, name: '巽四宮', bagua: '巽', element: '木', direction: '東南', angle: -Math.PI * 3 / 4, trigram: '☴', nature: '順風深入', branches: ['辰', '巳'] },
      { id: 9, name: '離九宮', bagua: '離', element: '火', direction: '正南', angle: -Math.PI / 2, trigram: '☲', nature: '光明宣顯', branches: ['午'] },
      { id: 2, name: '坤二宮', bagua: '坤', element: '土', direction: '西南', angle: -Math.PI / 4, trigram: '☷', nature: '厚德順承', branches: ['未', '申'] },
      { id: 7, name: '兌七宮', bagua: '兌', element: '金', direction: '正西', angle: 0, trigram: '☱', nature: '喜悅口舌', branches: ['酉'] },
      { id: 6, name: '乾六宮', bagua: '乾', element: '金', direction: '西北', angle: Math.PI / 4, trigram: '☰', nature: '剛健統御', branches: ['戌', '亥'] }
    ];

    // 人盤八門 (原宮固定次序：坎休、艮生、震傷、巽杜、離景、坤死、兌驚、乾開)
    this.gatesRing = [
      { name: '休門', homePalace: 1, type: '吉', desc: '休養生息，喜慶和順，利於求見貴人、感情調和與療癒', elem: '水', yingQi: '一、六日或亥子水旺之時' },
      { name: '生門', homePalace: 8, type: '大吉', desc: '生機勃勃，求財進產，利於經商、投資、置業與營造', elem: '土', yingQi: '八、五日或辰戌丑未土旺之時' },
      { name: '傷門', homePalace: 3, type: '次凶', desc: '雷動爭端，變動耗神，宜討債索賠、博弈拆解，防口舌暗傷', elem: '木', yingQi: '三、八日或寅卯木旺之時' },
      { name: '杜門', homePalace: 4, type: '平', desc: '隱匿藏形，閉關固守，利於技術研發、保密籌備與避險', elem: '木', yingQi: '四、九日或辰巳風動之時' },
      { name: '景門', homePalace: 9, type: '次吉', desc: '文書契約，聲名遠播，利於品牌行銷、考核演講與合約締結', elem: '火', yingQi: '九、二日或巳午火旺之時' },
      { name: '死門', homePalace: 2, type: '凶', desc: '凝滯沉寂，終結舊局，宜斷捨止損、清理爛帳，忌盲目開張', elem: '土', yingQi: '二、七日或未申交界之時' },
      { name: '驚門', homePalace: 7, type: '凶', desc: '驚恐疑慮，唇槍舌劍，利於法務訴訟、談判施壓，防虛驚官非', elem: '金', yingQi: '七、四日或申酉金旺之時' },
      { name: '開門', homePalace: 6, type: '大吉', desc: '乾坤開泰，功名顯達，利於就任升遷、創業開市與跨界布局', elem: '金', yingQi: '六、一日或戌亥金旺之時' }
    ];
    // 兼容舊屬性名稱順序
    this.gates = [
      this.gatesRing[7], // 開門
      this.gatesRing[0], // 休門
      this.gatesRing[1], // 生門
      this.gatesRing[2], // 傷門
      this.gatesRing[3], // 杜門
      this.gatesRing[4], // 景門
      this.gatesRing[5], // 死門
      this.gatesRing[6]  // 驚門
    ];

    // 天盤九星 (原宮固定次序：坎蓬、艮任、震沖、巽輔、離英、坤芮[禽]、兌柱、乾心)
    this.stars = [
      { name: '天蓬星', homePalace: 1, type: '凶', desc: '水星沉潛，大智大險，暗藏破局謀略與跨界奇兵', elem: '水' },
      { name: '天任星', homePalace: 8, type: '吉', desc: '厚德載物，踏實任事，循序漸進，最利長線築基與置業', elem: '土' },
      { name: '天沖星', homePalace: 3, type: '次吉', desc: '雷厲風行，破障突圍，敢作敢當，宜速戰速決搶佔先機', elem: '木' },
      { name: '天輔星', homePalace: 4, type: '大吉', desc: '文昌貴人，智慧通達，利於策略規劃、教育文化與名師相佐', elem: '木' },
      { name: '天英星', homePalace: 9, type: '平', desc: '離火宣明，聲名鵲起，利於公關曝光，需防心浮氣躁', elem: '火' },
      { name: '天芮星', homePalace: 2, type: '凶', desc: '坤土厚藏，檢視病灶，宜查漏補缺、拜師修習，忌冒進貪快', elem: '土' },
      { name: '天柱星', homePalace: 7, type: '次凶', desc: '中流砥柱，破舊立新，言辭犀利，宜獨立攻堅與法務抗辯', elem: '金' },
      { name: '天心星', homePalace: 6, type: '大吉', desc: '乾金統御，文韜武略，醫道治世，最利核心決策與掌權立業', elem: '金' }
    ];

    // 神盤八神 (陽順陰逆固定次序)
    this.deities = [
      { name: '值符', type: '至吉', desc: '百神之長，天乙貴人，千災萬禍化為塵，得高層核心加持', nature: '至陽天威' },
      { name: '螣蛇', type: '虛幻', desc: '變化莫測，反覆纏繞，需明辨合約細節與虛實真偽', nature: '陰火虛驚' },
      { name: '太陰', type: '陰護', desc: '暗中庇佑，縝密籌謀，利於幕後布局、私密協商與柔性斡旋', nature: '陰柔庇護' },
      { name: '六合', type: '吉和', desc: '和合融洽，媒合結盟，最利商務合作、婚姻感情與多方共贏', nature: '貴人合局' },
      { name: '白虎', type: '威猛', desc: '剛烈果斷，硬仗破局，壓力雖大但執行力極強，慎防剛愎衝撞', nature: '金煞破障' },
      { name: '玄武', type: '曖昧', desc: '暗流湧動，防範漏損，務必核查財務帳目與背調底細', nature: '陰水隱晦' },
      { name: '九地', type: '穩厚', desc: '坤土厚載，屯兵固守，利於長線持倉、深耕基本盤與潛伏待時', nature: '地藏堅實' },
      { name: '九天', type: '宏大', desc: '乾金威烈，高瞻遠矚，宜主動遠行、開拓海外與拉高戰略維度', nature: '天行健展' }
    ];

    // 奇門經典十干克應與吉凶大格庫
    this.formations = [
      { name: '青龍返首', type: '大吉', tags: ['戊加丙奇', '百事大吉'], desc: '天盤戊儀加地盤丙奇（甲子戊會丙火）。如巨龍迴首騰雲，求財倍增、升遷順遂、貴人鼎力相助之至吉大格。' },
      { name: '飛鳥跌穴', type: '大吉', tags: ['丙加戊儀', '事半功倍'], desc: '天盤丙奇加地盤戊儀。如靈鳥歸巢得食，資源不求自來，借力使力即可坐收奇功。' },
      { name: '天遁吉格', type: '大吉', tags: ['丙合生門', '天光普照'], desc: '天盤丙奇合人盤生門。得天時大道庇佑，求財創業、跨界拓荒皆如順水推舟。' },
      { name: '地遁吉格', type: '吉', tags: ['乙合開門', '厚土築基'], desc: '天盤乙奇合開門或己土。宜穩紮穩打、建立護城河，根基既成則無人可撼。' },
      { name: '人遁吉格', type: '大吉', tags: ['丁合休門', '貴人密助'], desc: '天盤丁奇合人盤休門、太陰。得關鍵人脈暗中牽線，危機化解於無形。' },
      { name: '三奇得使', type: '大吉', tags: ['奇逢值使', '使命必達'], desc: '天盤乙、丙、丁三奇加臨值使之門。陰陽得配，有幹練智囊或關鍵推手助陣。' },
      { name: '玉女守門', type: '吉', tags: ['地盤丁奇', '以柔克剛'], desc: '值使門落於地盤丁奇之宮。最利私下協商、情感破冰與以巧破千斤。' },
      { name: '青龍耀明', type: '吉', tags: ['乙加丙奇', '遷官進職'], desc: '天盤乙奇加地盤丙奇，奇儀順遂。主名望晉升、貴人賞識，漸入佳境。' },
      { name: '星奇朱雀', type: '吉', tags: ['丁加丙奇', '文書喜訊'], desc: '天盤丁奇加地盤丙奇。主文書契約、審批考核傳來佳音，宜乘勢推進。' },
      { name: '太白入熒', type: '次凶', tags: ['庚加丙奇', '防範外侮'], desc: '天盤庚儀加地盤丙奇。主外部競爭者主動來犯，宜固守底線，切莫貪利冒進。' },
      { name: '熒惑入白', type: '次凶', tags: ['丙加庚儀', '退避保泰'], desc: '天盤丙奇加地盤庚儀。火金相剋，主對手外強中乾將退，此時不宜強追，守正自安。' },
      { name: '門迫宮刑', type: '凶', tags: ['門宮相剋', '韜光養晦'], desc: '人盤八門五行剋制所落宮位。主行事易受客觀體制或環境掣肘，宜化整為零、低調緩行。' },
      { name: '伏吟守拙', type: '平', tags: ['星門伏吟', '動不如靜'], desc: '九星與八門皆居原宮本位。主局勢凝滯、快不得，宜內部盤點與守成蓄力。' },
      { name: '反吟轉機', type: '轉機', tags: ['星門反吟', '破舊立新'], desc: '九星或八門對沖本宮。主外部局勢劇烈洗牌，反覆之中暗藏逆轉奇機，唯果斷變革者勝。' }
    ];

    // 易經六十四卦精選互應 (依上下卦五行與宮位精準推演)
    this.hexagrams = [
      { name: '乾為天', code: '111111', keywords: '自強不息 · 剛健中正', desc: '天行健，君子以自強不息。當前得天道剛健之氣，宜掌舵全局、持之以恆，切忌驕矜自滿。' },
      { name: '坤為地', code: '000000', keywords: '厚德載物 · 順勢而為', desc: '地勢坤，君子以厚德載物。此時宜柔順謙和，先迷後得主，依附大平台或大勢乃有大成。' },
      { name: '水火既濟', code: '010101', keywords: '陰陽各正 · 居安思危', desc: '水在火上，事已初成。當前局面陰陽協調，但需防初吉終亂，細節風控務求周全。' },
      { name: '火水未濟', code: '101010', keywords: '審慎渡河 · 蓄勢待發', desc: '火在水上，未濟亨。雖臨門一腳尚待磨合，但生機已現，辨清物所、穩步推進必能破關。' },
      { name: '火天大有', code: '101111', keywords: '順天依時 · 豐饒大獲', desc: '火在天上，大有。遏惡揚善，順天休命，資源與名望皆在匯聚，宜廣結善緣共分其利。' },
      { name: '地天泰', code: '000111', keywords: '天地交泰 · 上下同心', desc: '天地交而萬物通，上下交而其志同。內陽而外陰，君子道長，正是大展宏圖之良機。' },
      { name: '雷地豫', code: '000100', keywords: '順動豫立 · 未雨綢繆', desc: '雷出地奮，豫。凡事豫則立，不豫則廢；藉眾人合力順勢啟動，必得各方響應。' },
      { name: '風天小畜', code: '110111', keywords: '密雲不雨 · 積小成大', desc: '風行天上，君子以懿文德。力量尚在聚攏階段，不宜強求速成，打磨內功靜待時雨。' }
    ];

    // 二十四節氣定義 (按公曆 1 月至 12 月嚴格排序，避免跨年判斷錯誤)
    // isJie: true 代表十二節（換月建之界）
    this.solarTerms = [
      { name: '小寒', month: 1, day: 5, type: '陽遁', bureau: [2, 8, 5], isJie: true, monthZhi: 1 },
      { name: '大寒', month: 1, day: 20, type: '陽遁', bureau: [3, 9, 6], isJie: false, monthZhi: 1 },
      { name: '立春', month: 2, day: 4, type: '陽遁', bureau: [8, 5, 2], isJie: true, monthZhi: 2 },
      { name: '雨水', month: 2, day: 19, type: '陽遁', bureau: [9, 6, 3], isJie: false, monthZhi: 2 },
      { name: '驚蟄', month: 3, day: 5, type: '陽遁', bureau: [1, 7, 4], isJie: true, monthZhi: 3 },
      { name: '春分', month: 3, day: 20, type: '陽遁', bureau: [3, 9, 6], isJie: false, monthZhi: 3 },
      { name: '清明', month: 4, day: 4, type: '陽遁', bureau: [4, 1, 7], isJie: true, monthZhi: 4 },
      { name: '穀雨', month: 4, day: 20, type: '陽遁', bureau: [5, 2, 8], isJie: false, monthZhi: 4 },
      { name: '立夏', month: 5, day: 5, type: '陽遁', bureau: [4, 1, 7], isJie: true, monthZhi: 5 },
      { name: '小滿', month: 5, day: 21, type: '陽遁', bureau: [5, 2, 8], isJie: false, monthZhi: 5 },
      { name: '芒種', month: 6, day: 5, type: '陽遁', bureau: [6, 3, 9], isJie: true, monthZhi: 6 },
      { name: '夏至', month: 6, day: 21, type: '陰遁', bureau: [9, 3, 6], isJie: false, monthZhi: 6 },
      { name: '小暑', month: 7, day: 7, type: '陰遁', bureau: [8, 2, 5], isJie: true, monthZhi: 7 },
      { name: '大暑', month: 7, day: 23, type: '陰遁', bureau: [7, 1, 4], isJie: false, monthZhi: 7 },
      { name: '立秋', month: 8, day: 7, type: '陰遁', bureau: [2, 5, 8], isJie: true, monthZhi: 8 },
      { name: '處暑', month: 8, day: 23, type: '陰遁', bureau: [1, 4, 7], isJie: false, monthZhi: 8 },
      { name: '白露', month: 9, day: 7, type: '陰遁', bureau: [9, 3, 6], isJie: true, monthZhi: 9 },
      { name: '秋分', month: 9, day: 23, type: '陰遁', bureau: [7, 1, 4], isJie: false, monthZhi: 9 },
      { name: '寒露', month: 10, day: 8, type: '陰遁', bureau: [6, 9, 3], isJie: true, monthZhi: 10 },
      { name: '霜降', month: 10, day: 23, type: '陰遁', bureau: [5, 8, 2], isJie: false, monthZhi: 10 },
      { name: '立冬', month: 11, day: 7, type: '陰遁', bureau: [6, 9, 3], isJie: true, monthZhi: 11 },
      { name: '小雪', month: 11, day: 22, type: '陰遁', bureau: [5, 8, 2], isJie: false, monthZhi: 11 },
      { name: '大雪', month: 12, day: 7, type: '陰遁', bureau: [4, 7, 1], isJie: true, monthZhi: 0 },
      { name: '冬至', month: 12, day: 21, type: '陽遁', bureau: [1, 7, 4], isJie: false, monthZhi: 0 }
    ];

    // 奇門典籍哲理箴言庫
    this.daoQuotes = [
      '「善建者不拔，善抱者不脫。知天時而守地利，心定則八方自來朝。」——《道德經 · 奇門樞要》',
      '「天地設位，聖人成能。奇門之妙，不在趨避之巧，而在明勢知止、順道而行。」——《煙波釣叟歌》',
      '「吉凶生乎動，悔吝著乎象。未動之前先察中宮之念，念正則萬法歸宗。」——《奇門遁甲統宗》',
      '「人之所以焦慮，是想要最好的結果，又不願承擔相應的代價。把心定下，局自清明。」——《奇門心法》',
      '「順其自然不是聽天由命，而是審時度勢、盡了人事之後，坦然駕馭天地變局。」——《黃帝陰符經》',
      '「三奇得使，猶需人事相合；八門開闔，貴在應時而動。識得進退機宜，處處皆是生門。」——《奇門正宗》'
    ];
  }

  // 輔助：確定性雜湊函數 (零 Math.random)
  hashString(str) {
    let h = 2166136261;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  // 0. 求問內容誠心與語義檢驗器 (攔截 test、亂碼、鍵盤亂敲、無規律長數字；支援 1~3 位正統報數起局)
  validateQuestionInput(rawInput, category = 'career') {
    const text = String(rawInput || '').trim();

    // 1. 空白未填：提示必須誠心立念輸入問題或點選快捷求問
    if (!text) {
      return {
        valid: false,
        reason: 'empty',
        message: '《易》曰：「無誠不占，心亂不應。」請先輸入您欲求問之具體事項（或點選下方常見求問）。'
      };
    }

    const lower = text.toLowerCase();

    // 2. 常見測試字眼與鍵盤亂敲攔截
    const blacklist = new Set([
      'test', 'testing', 'tester', 'abc', 'abcd', 'abcdef', 'qwer', 'qwerty',
      'asdf', 'asdfg', 'zxcv', 'hello', 'hi', 'ok', '123', '1234', '12345',
      '123456', '1234567', '12345678', '111', '1111', '000', '0000', '666',
      '888', '999', 'null', 'undefined', 'none', 'xxx', 'zzz', '測試', '测试', '隨便', '随便'
    ]);
    if (blacklist.has(lower)) {
      return {
        valid: false,
        reason: 'test_word',
        message: '偵測到測試字眼（「' + text + '」）。奇門問卜講求「一念至誠，方感天機」，請輸入真實求問之事。'
      };
    }

    // 3. 單一字元重複（如 aaaaa、11111、哈哈哈、？？？）
    if (/^(.)\1{2,}$/u.test(text)) {
      return {
        valid: false,
        reason: 'repeated_chars',
        message: '輸入內容為重複字元。請靜心凝神，以完整語句敘述您欲決斷之事項。'
      };
    }

    // 4. 純數字輸入一律攔截（不論位數長短皆不輸出）
    if (/^\d+$/.test(text)) {
      return {
        valid: false,
        reason: 'pure_numbers',
        message: '偵測到純數字輸入。請以完整文字敘述您欲求問之具體事項（例如：這份新工作機會適合轉換嗎？）。'
      };
    }

    // 5. 注音符號或純標點符號亂碼攔截
    if (/^[\u3100-\u312F\u31A0-\u31BF\s\p{P}\p{S}]+$/u.test(text)) {
      return {
        valid: false,
        reason: 'symbols_or_zhuyin',
        message: '輸入內容僅含符號或注音，無法感應事體用神。請以完整中文或英文句子輸入求問事項。'
      };
    }

    // 6. 統計有效中文字數與英文單詞
    const cjkChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const latinWords = (text.match(/[a-zA-Z]{2,}/g) || []);
    const digitsCount = (text.match(/\d/g) || []).length;

    // 英數隨機夾雜亂碼（如 a83kf9201、dkfjsl234）
    if (cjkChars === 0 && digitsCount >= 2 && latinWords.length <= 2) {
      return {
        valid: false,
        reason: 'alphanumeric_gibberish',
        message: '偵測到無規律英數亂碼。請輸入具體求問問題（例如：這份工作機會適合轉換嗎？）。'
      };
    }

    // 純英文時：檢查是否為無母音鍵盤亂敲（如 dfghjkl、bcdfgh）或少於 3 個單詞
    if (cjkChars === 0) {
      const hasGibberishToken = latinWords.some(w => w.length >= 5 && !/[aeiouyAEIOUY]/.test(w))
        || latinWords.some(w => /[bcdfghjklmnpqrstvwxz]{5,}/i.test(w));
      if (hasGibberishToken || latinWords.length < 3 || text.length < 10) {
        return {
          valid: false,
          reason: 'english_gibberish',
          message: '請輸入完整且具體的求問句子（中文至少 4 字，或英文至少 3 個完整單詞）。'
        };
      }
    }

    // 含中文時：有效中文字少於 4 字，或亂碼數字佔比過高
    if (cjkChars > 0 && cjkChars < 4) {
      return {
        valid: false,
        reason: 'too_short_cjk',
        message: '求問語意過於簡短（少於 4 字），難以鎖定奇門事體用神。請稍加具體描述您的處境或抉擇。'
      };
    }

    if (digitsCount > text.length * 0.5) {
      return {
        valid: false,
        reason: 'too_many_digits',
        message: '問題中夾雜過多無規律數字，請以清晰文字敘述求問之事。'
      };
    }

    return {
      valid: true,
      isSacredNumber: false,
      sacredNumber: null,
      normalizedQuestion: text
    };
  }

  // 1. 真實天干地支四柱曆法與正統【拆補法】定局計算
  calculateFourPillars(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    // 1. 定位二十四節氣 (1/1 ~ 1/4 屬於前一年冬至)
    let currentTerm = this.solarTerms[this.solarTerms.length - 1]; // 預設冬至
    for (let i = this.solarTerms.length - 1; i >= 0; i--) {
      const term = this.solarTerms[i];
      if (month > term.month || (month === term.month && day >= term.day)) {
        currentTerm = term;
        break;
      }
    }

    // 2. 年干支 (以立春 2月4日 為換年界線)
    const isBeforeLiChun = (month === 1) || (month === 2 && day < 4);
    const ganZhiYear = isBeforeLiChun ? year - 1 : year;
    const yearOffset = ganZhiYear - 4; // 1984 甲子年
    const yearGanIdx = ((yearOffset % 10) + 10) % 10;
    const yearZhiIdx = ((yearOffset % 12) + 12) % 12;
    const yearPillar = this.tiangan[yearGanIdx] + this.dizhi[yearZhiIdx];

    // 3. 月干支 (依節氣月建 + 五虎遁年起月：甲己之年丙作首)
    const monthZhiIdx = currentTerm.monthZhi; // 寅(2)..丑(1)
    const tigerMonthSeq = (monthZhiIdx - 2 + 12) % 12; // 寅月=0, 卯月=1, ..., 丑月=11
    const monthGanStart = (yearGanIdx % 5) * 2 + 2;
    const monthGanIdx = (monthGanStart + tigerMonthSeq) % 10;
    const monthPillar = this.tiangan[monthGanIdx] + this.dizhi[monthZhiIdx];

    // 4. 日干支 (格里曆儒略日 JDN 精確日柱：2024-01-01 JDN 2460311 為甲子日 index 0)
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    const dayOffset = ((jdn + 49) % 60 + 60) % 60;
    const dayGanIdx = dayOffset % 10;
    const dayZhiIdx = dayOffset % 12;
    const dayPillar = this.tiangan[dayGanIdx] + this.dizhi[dayZhiIdx];

    // 5. 時干支 (五鼠遁日起時：甲己還加甲，23:00 後入子時)
    const hourZhiIdx = Math.floor(((hour + 1) % 24) / 2);
    const effectiveDayGanIdx = (hour === 23) ? (dayGanIdx + 1) % 10 : dayGanIdx;
    const hourGanStart = (effectiveDayGanIdx % 5) * 2;
    const hourGanIdx = (hourGanStart + hourZhiIdx) % 10;
    const hourPillar = this.tiangan[hourGanIdx] + this.dizhi[hourZhiIdx];

    // 6. 時柱旬首與旬空 (正統時家奇門以時柱旬空與旬首為樞紐)
    const hourXunDiff = (hourZhiIdx - hourGanIdx + 12) % 12;
    const xunStemMap = { 0: '戊', 10: '己', 8: '庚', 6: '辛', 4: '壬', 2: '癸' };
    const xunNameMap = { 0: '甲子戊', 10: '甲戌己', 8: '甲申庚', 6: '甲午辛', 4: '甲辰壬', 2: '甲寅癸' };
    const xunStem = xunStemMap[hourXunDiff] || '戊';
    const xunName = xunNameMap[hourXunDiff] || '甲子戊';

    const voidZhi1 = (hourXunDiff + 10) % 12;
    const voidZhi2 = (hourXunDiff + 11) % 12;
    const voidBranches = [this.dizhi[voidZhi1], this.dizhi[voidZhi2]];
    const voidPalaceNames = `${voidBranches[0]}、${voidBranches[1]}`;

    // 7. 驛馬星 (依時支/日支三合局：申子辰馬在寅、寅午戌馬在申、巳酉丑馬在亥、亥卯未馬在巳)
    const horseMap = {
      0: { branch: '寅', dir: '東北', palaceId: 8 },
      4: { branch: '寅', dir: '東北', palaceId: 8 },
      8: { branch: '寅', dir: '東北', palaceId: 8 },
      2: { branch: '申', dir: '西南', palaceId: 2 },
      6: { branch: '申', dir: '西南', palaceId: 2 },
      10: { branch: '申', dir: '西南', palaceId: 2 },
      5: { branch: '亥', dir: '西北', palaceId: 6 },
      9: { branch: '亥', dir: '西北', palaceId: 6 },
      1: { branch: '亥', dir: '西北', palaceId: 6 },
      11: { branch: '巳', dir: '東南', palaceId: 4 },
      3: { branch: '巳', dir: '東南', palaceId: 4 },
      7: { branch: '巳', dir: '東南', palaceId: 4 }
    };
    const horseObj = horseMap[hourZhiIdx] || horseMap[0];
    const horseStar = `${horseObj.branch} (${horseObj.dir})`;

    // 8. 正統【拆補法】符頭定上中下三元：
    // 日柱六十甲子往前推至最近的甲/己日為符頭：
    // 符頭地支為 子、午、卯、酉 -> 上元 (0)
    // 符頭地支為 寅、申、巳、亥 -> 中元 (1)
    // 符頭地支為 辰、戌、丑、未 -> 下元 (2)
    const fuTouIdx = dayOffset - (dayOffset % 5);
    const fuTouZhi = ((fuTouIdx % 12) + 12) % 12;
    const yuanIdx = [0, 3, 6, 9].includes(fuTouZhi) ? 0 : ([2, 5, 8, 11].includes(fuTouZhi) ? 1 : 2);
    const yuanName = yuanIdx === 0 ? '上元' : yuanIdx === 1 ? '中元' : '下元';
    const bureauNumber = currentTerm.bureau[yuanIdx];
    const dunType = currentTerm.type;

    return {
      pillars: `${yearPillar}年 ${monthPillar}月 ${dayPillar}日 ${hourPillar}時`,
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      dayGanIdx,
      dayZhiIdx,
      hourGanIdx,
      hourZhiIdx,
      xunStem,
      xunName,
      solarTerm: currentTerm.name,
      yuanName,
      dunType,
      bureauNumber,
      bureauName: `${currentTerm.name}${yuanName} · ${dunType}${bureauNumber}局`,
      voidPalaces: voidPalaceNames,
      voidBranches,
      horseStar,
      horsePalaceId: horseObj.palaceId
    };
  }

  // 1.5 正統時家轉盤奇門排盤核心 (飛布地盤三奇六儀、尋旬首值符值使、轉天盤九星、轉人盤八門、排八神盤)
  buildQimenBoard(astro) {
    const stemsOrder = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
    const isYang = astro.dunType === '陽遁';
    const bureau = astro.bureauNumber;

    // A. 地盤三奇六儀飛布洛書九宮 (1..9)
    // 陽遁順布六儀逆布三奇 (由局數宮起戊，順飛 1->2->...->9)；陰遁逆飛 (9->8->...->1)
    const diPan = {};
    const stemToDiPalace = {};
    for (let k = 0; k < 9; k++) {
      const pNum = isYang
        ? ((bureau - 1 + k) % 9) + 1
        : (((bureau - 1 - k) % 9) + 9) % 9 + 1;
      const stem = stemsOrder[k];
      diPan[pNum] = stem;
      stemToDiPalace[stem] = pNum;
    }

    // B. 時柱旬首落宮 -> 定【值符九星】與【值使八門】
    const xunPalaceRaw = stemToDiPalace[astro.xunStem] || 1;
    const xunPalace = xunPalaceRaw === 5 ? 2 : xunPalaceRaw; // 中五寄坤二
    const xunRingIdx = this.ringOrder.indexOf(xunPalace);
    const zhiFuStar = xunPalaceRaw === 5 ? { name: '天禽星', homePalace: 5, type: '大吉', desc: '中宮樞紐，寄坤二宮，統攝四方，尊貴無極', elem: '土' } : this.stars[xunRingIdx];
    const zhiShiGate = this.gatesRing[xunRingIdx];

    // C. 值符隨時干 (天盤九星攜帶本宮地盤奇儀，隨值符轉至時干地盤落宮)
    const hourStem = this.tiangan[astro.hourGanIdx];
    const effectiveHourStem = hourStem === '甲' ? astro.xunStem : hourStem;
    const hourStemPalaceRaw = stemToDiPalace[effectiveHourStem] || 1;
    const hourStemPalace = hourStemPalaceRaw === 5 ? 2 : hourStemPalaceRaw;
    const targetStarRingIdx = this.ringOrder.indexOf(hourStemPalace);
    const starShift = (targetStarRingIdx - xunRingIdx + 8) % 8;

    const starPan = {};
    const tianPan = {};
    for (let r = 0; r < 8; r++) {
      const pId = this.ringOrder[r];
      const srcRingIdx = (r - starShift + 8) % 8;
      const srcPalaceId = this.ringOrder[srcRingIdx];
      starPan[pId] = this.stars[srcRingIdx];
      tianPan[pId] = diPan[srcPalaceId];
    }

    // D. 值使隨時宮 (自旬首宮起甲時，陽順陰逆沿洛書九宮數至當前時干步數)
    const hoursFromXun = astro.hourGanIdx; // 甲=0, 乙=1, ..., 癸=9
    const zhiShiPalaceRaw = isYang
      ? ((xunPalaceRaw - 1 + hoursFromXun) % 9) + 1
      : (((xunPalaceRaw - 1 - hoursFromXun) % 9) + 90) % 9 + 1;
    const zhiShiPalace = zhiShiPalaceRaw === 5 ? 2 : zhiShiPalaceRaw;
    const targetGateRingIdx = this.ringOrder.indexOf(zhiShiPalace);
    const gateShift = (targetGateRingIdx - xunRingIdx + 8) % 8;

    const gatePan = {};
    for (let r = 0; r < 8; r++) {
      const pId = this.ringOrder[r];
      const srcGateIdx = (r - gateShift + 8) % 8;
      gatePan[pId] = this.gatesRing[srcGateIdx];
    }

    // E. 八神盤 (自天盤值符落宮起「值符」，陽遁順時針、陰遁逆時針排布八宮)
    const deityPan = {};
    for (let d = 0; d < 8; d++) {
      const rIdx = isYang
        ? (targetStarRingIdx + d) % 8
        : (targetStarRingIdx - d + 8) % 8;
      const pId = this.ringOrder[rIdx];
      deityPan[pId] = this.deities[d];
    }

    // 日干落宮 (代表求測人當下日干命宮)
    const dayStem = this.tiangan[astro.dayGanIdx];
    const effectiveDayStem = dayStem === '甲' ? astro.xunStem : dayStem;
    const dayStemPalaceRaw = stemToDiPalace[effectiveDayStem] || 1;
    const dayStemPalace = dayStemPalaceRaw === 5 ? 2 : dayStemPalaceRaw;

    return {
      diPan,
      stemToDiPalace,
      tianPan,
      starPan,
      gatePan,
      deityPan,
      zhiFuStar,
      zhiShiGate,
      starShift,
      gateShift,
      hourStemPalace,
      dayStemPalace,
      zhiShiPalace
    };
  }

  // 1.8 計算求測者出生年份之【年命天干地支與地盤落宮】
  resolveNianMing(birthYear, astro, board) {
    const yr = parseInt(birthYear, 10);
    if (!yr || yr < 1920 || yr > 2025) {
      const dayStem = this.tiangan[astro.dayGanIdx];
      const selfPalace = this.palaces.find(p => p.id === board.dayStemPalace) || this.palaces[0];
      return {
        hasBirthYear: false,
        birthYear: null,
        nianMingPillar: `${astro.dayPillar}日干`,
        nianMingStem: dayStem,
        zodiac: '當日日干',
        selfPalace,
        label: `日干【${dayStem}】落${selfPalace.name}`
      };
    }

    const zodiacs = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
    const offset = yr - 4;
    const ganIdx = ((offset % 10) + 10) % 10;
    const zhiIdx = ((offset % 12) + 12) % 12;
    const stem = this.tiangan[ganIdx];
    const branch = this.dizhi[zhiIdx];
    const pillar = `${stem}${branch}`;
    const zodiac = zodiacs[zhiIdx];

    const effectiveStem = stem === '甲' ? astro.xunStem : stem;
    const rawPalace = (board.stemToDiPalace && board.stemToDiPalace[effectiveStem]) || board.dayStemPalace;
    const finalPalaceId = rawPalace === 5 ? 2 : rawPalace;
    const selfPalace = this.palaces.find(p => p.id === finalPalaceId) || this.palaces[0];

    return {
      hasBirthYear: true,
      birthYear: yr,
      nianMingPillar: `${yr}年（${pillar} · 屬${zodiac}）`,
      nianMingStem: stem,
      zodiac,
      selfPalace,
      label: `年命【${stem}】（${yr}${pillar}年）落${selfPalace.name}`
    };
  }

  // 1.9 十六大核心問事場景語意識別與正統用神定位引擎
  detectScenario(question, category = 'career') {
    const q = String(question || '').trim();
    const scenarios = [
      {
        id: 'job_switch',
        name: '轉職跳槽 · 去留決斷',
        cat: 'career',
        keywords: ['轉職', '跳槽', '換工作', '離職', '新工作', '去留', 'offer', '辭職', '新公司'],
        yongShenType: 'kai_men',
        yongShenLabel: '開門（新職平台）與時干（新機會）',
        rootInsight: '表面猶豫是否轉換跑道，實則對「現有職位沉沒成本」與「新環境適應風險」存在拉鋸。',
        counterInsight: '新東家或獵頭最看重你能否「即戰力無縫接軌」並解決他們當前的部門痛點，而非過往資歷頭銜。',
        awakeInsight: '先確認新職的核心權責與匯報對象（值符）是否清晰，談妥保底薪資與試用期指標後再行遞交辭呈。'
      },
      {
        id: 'interview_exam',
        name: '求職面試 · 考核上岸',
        cat: 'career',
        keywords: ['面試', '考公', '考試', '考核', '錄取', '上岸', '複試', '筆試', '求職', '應徵'],
        yongShenType: 'jing_men',
        yongShenLabel: '景門（文書考卷）與天輔星（考官評審）',
        rootInsight: '擔心臨場表現失常或競爭者眾多，把注意力過度放在無法控制的錄取率上。',
        counterInsight: '面試官與審核方已有明確評分標準，特別關注你的邏輯結構與過往實績的可驗證性。',
        awakeInsight: '將作品集與應答濃縮為三個具體案例數據（STAR 法則），展現沉穩定力即可脫穎而出。'
      },
      {
        id: 'promotion_raise',
        name: '升遷加薪 · 掌權立威',
        cat: 'career',
        keywords: ['升遷', '升職', '加薪', '調薪', '晉升', '主管', '提拔', '考核', '年終'],
        yongShenType: 'zhi_fu',
        yongShenLabel: '值符（直屬高層）與開門（官祿職權）',
        rootInsight: '默默承擔大量業務卻羞於主動向高層爭取籌碼，誤以為苦勞會自動轉化為職級回報。',
        counterInsight: '決策高層目前正處於資源分配與組織平衡考量，優先提拔能「替上層分憂且具不可替代性」之人。',
        awakeInsight: '在關鍵專案結案節點，主動以量化戰報呈現你為部門創造的淨價值，順勢提出職級與薪酬訴求。'
      },
      {
        id: 'startup_partner',
        name: '創業合夥 · 跨界開拓',
        cat: 'career',
        keywords: ['創業', '合夥', '開店', '開公司', '副業', '新市場', '海外', '擴張', '加盟', '團隊'],
        yongShenType: 'sheng_men',
        yongShenLabel: '生門（利潤造血）與六合（合夥契約）',
        rootInsight: '對商業藍圖充滿熱情，但容易在初期低估現金流消耗速度與合夥人權責邊界摩擦。',
        counterInsight: '市場客戶與合作夥伴只為「真實痛點解決方案」買單，初期情懷無法替代穩定正向現金流。',
        awakeInsight: '先以最小可行性規模（MVP）驗證單點獲利模型，並以白紙黑字鎖定股權退出機制與分潤條款。'
      },
      {
        id: 'contract_deal',
        name: '商務談判 · 合約簽署',
        cat: 'career',
        keywords: ['簽約', '合約', '談判', '訂單', '客戶', '標案', '競標', '合作', '併購', '協議'],
        yongShenType: 'liu_he',
        yongShenLabel: '六合（契約媒合）與景門（條款文書）',
        rootInsight: '急於推進成交進度，容易在交付驗收標準或違約責任條款上做出過度讓步。',
        counterInsight: '交易對手正在試探你的底線與時間壓力，表面挑剔價格，實則想爭取更寬鬆的付款條件。',
        awakeInsight: '把握主客生剋節奏，守住首付款比例與核心驗收條款，以附加服務價值代替直接折價。'
      },
      {
        id: 'stock_crypto',
        name: '金融投資 · 標的進退',
        cat: 'wealth',
        keywords: ['股票', '投資', '基金', '加倉', '出場', '進場', '獲利', '套牢', '期貨', '幣', '理財', '股市'],
        yongShenType: 'sheng_men',
        yongShenLabel: '生門（利潤空間）與戊儀（本金資本）',
        rootInsight: '受市場短期漲跌情緒牽動，在「害怕踏空」與「恐懼回吐」之間頻繁搖擺。',
        counterInsight: '主力資金正利用消息面震盪洗盤，追高殺低者最容易在波段轉折前交出帶血籌碼。',
        awakeInsight: '嚴格執行分批建倉與移動停利紀律，本金（地盤戊）若逢沖克則寧可空手觀望，不賺最後一分險錢。'
      },
      {
        id: 'real_estate',
        name: '買房置產 · 店面選址',
        cat: 'wealth',
        keywords: ['買房', '置產', '房地產', '看房', '賣房', '租房', '店面', '搬家', '裝潢', '置業'],
        yongShenType: 'sheng_men',
        yongShenLabel: '生門（陽宅房產）與死門（地基田土）',
        rootInsight: '在地段價格、格局採光與未來增值潛力間難以取捨，擔心買在高點或資金鎖死。',
        counterInsight: '屋主或仲介方目前對價格仍有試探空間，尤其關注買方貸款條件與交屋時程的確定性。',
        awakeInsight: '優先檢視標的周邊機能與現金流負擔比（房貸不逾月收入四成），逢吉門生宮即可果斷議價落定。'
      },
      {
        id: 'debt_cashflow',
        name: '資金周轉 · 催收款項',
        cat: 'wealth',
        keywords: ['討債', '欠款', '周轉', '貸款', '借錢', '尾款', '帳款', '融資', '現金流', '還錢'],
        yongShenType: 'shang_men',
        yongShenLabel: '傷門（催討索債）與值符（放款債權人）',
        rootInsight: '顧慮情面或擔心關係破裂而遲遲未採取正式法律與商務催收行動，導致帳期無限拖延。',
        counterInsight: '欠款方目前採取「誰盯得緊先還誰」的拖延策略，口頭承諾多半缺乏實質償還排程。',
        awakeInsight: '立刻改以書面存證或分期抵押協議鎖定債權，選定傷門或驚門當值之吉辰正式施壓。'
      },
      {
        id: 'reunion_ex',
        name: '前任復合 · 破鏡重圓',
        cat: 'love',
        keywords: ['復合', '前任', '前男友', '前女友', '斷聯', '挽回', '分手', '回頭', '聯絡'],
        yongShenType: 'liu_he',
        yongShenLabel: '六合（情感連結）與乙庚（男女雙方落宮）',
        rootInsight: '把過去相處的高光時刻理想化，卻忽略了當初導致分手的結構性相處矛盾是否已真正化解。',
        counterInsight: '對方目前處於情緒冷卻與防禦觀察期，任何高密度的情緒勒索或追問只會加深其逃避心理。',
        awakeInsight: '先停止過度索取回應，將重心拉回自身生活品質提升；待旬空填實或休門吉辰，再以輕鬆自然話題破冰。'
      },
      {
        id: 'crush_confess',
        name: '曖昧推進 · 表白追求',
        cat: 'love',
        keywords: ['曖昧', '表白', '喜歡', '追求', '脫單', '約會', '告白', '暗戀', '對象', '好感'],
        yongShenType: 'xiu_men',
        yongShenLabel: '休門（喜慶約會）與六合（雙向奔赴）',
        rootInsight: '過度解讀對方的每一句訊息與回覆速度，因患得患失而不敢創造實質線下相處推進。',
        counterInsight: '對方對你並非毫無察覺，正在評估你的情緒穩定度、生活品味以及是否具備長久相處的安全感。',
        awakeInsight: '少在通訊軟體上空談試探，直接邀約共同感興趣的具體活動（朝休門或六合方位），用真實互動定調關係。'
      },
      {
        id: 'marriage_family',
        name: '婚姻經營 · 伴侶磨合',
        cat: 'love',
        keywords: ['結婚', '婚姻', '伴侶', '夫妻', '冷戰', '吵架', '感情', '正緣', '歸宿', '長久'],
        yongShenType: 'liu_he',
        yongShenLabel: '六合（婚姻宮位）與乙庚（夫妻相生相剋）',
        rootInsight: '在日常瑣事與價值觀磨合中，習慣以「爭辯對錯」取代「表達真實需求」，造成心意隔閡。',
        counterInsight: '伴侶內心渴望被理解與肯定，硬碰硬的指責會觸發其防禦機制，唯有溫和堅定的傾聽能卸下心防。',
        awakeInsight: '把握乙庚落宮生剋之道，在次要生活習慣上包容退讓，在核心家庭目標上建立共同儀式感。'
      },
      {
        id: 'lawsuit_dispute',
        name: '官司訴訟 · 糾紛維權',
        cat: 'decision',
        keywords: ['官司', '訴訟', '法律', '糾紛', '提告', '和解', '調解', '法院', '違約', '仲裁'],
        yongShenType: 'jing_men_shock',
        yongShenLabel: '驚門（法庭抗辯）與景門（訴狀證據）',
        rootInsight: '被爭端情緒消耗大量心力，容易在蒐證完整性與法條時效上出現疏漏。',
        counterInsight: '對造正試圖尋找程序瑕疵或證據斷層，若見我方準備周全且底線強硬，實則更有意願走向庭外和解。',
        awakeInsight: '以完整書面證據鏈與專業法務意見為盾，審視主客利弊——利客則果斷出擊，利主則以戰逼和。'
      },
      {
        id: 'travel_relocate',
        name: '出國遠行 · 外派遷徙',
        cat: 'decision',
        keywords: ['出國', '留學', '移民', '外派', '遠行', '搬遷', '旅行', '簽證', '異地'],
        yongShenType: 'jiu_tian',
        yongShenLabel: '九天（遠行萬里）與馬星（驛馬動象）',
        rootInsight: '嚮往外部廣闊天地，但對異地人脈重建與初期變動成本抱持隱憂。',
        counterInsight: '遠方平台與外地機遇正處於招納人才與資源開放期，越早卡位越能享受先行紅利。',
        awakeInsight: '順應驛馬星與九天之氣，提前辦妥文書簽證與備用資金，動中生財、遠方必有貴人接引。'
      },
      {
        id: 'health_wellness',
        name: '身心調養 · 疾厄康復',
        cat: 'decision',
        keywords: ['健康', '生病', '手術', '醫院', '身體', '焦慮', '失眠', '睡眠', '調養', '康復'],
        yongShenType: 'tian_xin',
        yongShenLabel: '天心星（醫藥良醫）與休門（休養復原）',
        rootInsight: '長期處於高壓透支與作息失衡狀態，身體發出的警訊正是提醒你必須停下內耗。',
        counterInsight: '外在事務並非缺你不可，過度緊繃的責任感反而阻礙了氣血與心神的自然修復。',
        awakeInsight: '尋訪天心、乙奇所在方位之專業醫師，嚴格落實早睡與靜心調息，心寬一寸則病退一尺。'
      },
      {
        id: 'lost_item',
        name: '失物尋回 · 尋人探蹤',
        cat: 'decision',
        keywords: ['失物', '不見', '遺失', '找不到', '找回', '尋物', '走失', '弄丟'],
        yongShenType: 'hour_stem',
        yongShenLabel: '時干落宮（失物方位）與玄武（隱匿之處）',
        rootInsight: '慌亂中反覆搜尋已經找過的明處，忽略了視野死角或移動軌跡交界點。',
        counterInsight: '物品多半並未遠離，而是被衣物、文件或容器遮蔽於用神宮位所對應的方位與高度。',
        awakeInsight: '依循本局用神落宮方位與五行物象（木為書櫃衣櫥、金為金屬器皿旁、水為盥洗近水處、土為低處角落）靜心細尋。'
      }
    ];

    for (const sc of scenarios) {
      if (sc.keywords.some(kw => q.toLowerCase().includes(kw))) {
        return sc;
      }
    }

    // 若無特定關鍵字命中，依大分類給予精準用神定義
    const fallbackMap = {
      career: {
        id: 'career_general',
        name: '事業前程 · 功名布局',
        yongShenType: 'kai_men',
        yongShenLabel: '開門（事業官祿）與日干／年命（求測人）',
        rootInsight: '心中對「維持現有穩定」與「突破職涯天花板」存在拉鋸，過度預支了尚未發生的阻力。',
        counterInsight: '上司、合作方與決策者目前最看重你的「可預期交付能力」與「抗壓定力」，而非空泛遠景。',
        awakeInsight: '不執著於一役定乾坤，將目標拆解為三階段可驗證的里程碑，借值符貴人之力順勢推進。'
      },
      wealth: {
        id: 'wealth_general',
        name: '財富謀略 · 利潤開拓',
        yongShenType: 'sheng_men',
        yongShenLabel: '生門（正財利潤）與戊儀（資本本金）',
        rootInsight: '容易在「短期波段誘惑」與「長線複利布局」之間搖擺，受外部雜音干擾決策定力。',
        counterInsight: '市場與交易對手正在考驗你的風險控管能力，急於求成者最易落入資訊不對稱陷阱。',
        awakeInsight: '嚴守本金與現金流安全邊際，只做認知範圍內的高勝率布局，生門得位則果斷收割。'
      },
      love: {
        id: 'love_general',
        name: '姻緣情感 · 心意共鳴',
        yongShenType: 'liu_he',
        yongShenLabel: '六合（媒合正緣）與乙庚（雙方心意）',
        rootInsight: '渴望深度情感共鳴，卻容易以「防禦性沉默」或「過度試探」自我保護，阻礙真實心意流動。',
        counterInsight: '對方內心同樣在觀察你的篤定程度，等待一個溫和而真誠的溝通契機，而非冷戰拉鋸。',
        awakeInsight: '放下「誰先主動誰吃虧」的執念，坦率表達內心真實感受，反而能瞬間掌握關係主動權。'
      },
      decision: {
        id: 'decision_general',
        name: '進退抉擇 · 破疑定策',
        yongShenType: 'hour_stem',
        yongShenLabel: '時干（所問事體）與值使門（執行樞紐）',
        rootInsight: '試圖在多個選項中「全拿好處、不付代價」，這種零風險完美主義正是導致停滯的根源。',
        counterInsight: '外部時空窗口正隨節氣流轉而收斂，拖延並非中立，而是將主動選擇權拱手讓人。',
        awakeInsight: '奇門貴在知機立斷，審視命宮與事體宮生剋，選定最契合核心價值的一條路全力走通。'
      },
      daily: {
        id: 'daily_general',
        name: '今日氣運 · 趨吉避凶',
        yongShenType: 'day_stem',
        yongShenLabel: '日干／年命（今日命宮）與時干（當下機遇）',
        rootInsight: '日常事務繁雜容易分散心力，需先定下今日最重要的一件核心推進事項。',
        counterInsight: '今日外部環境氣場隨十二時辰流轉，順應吉門吉方行事可事半功倍。',
        awakeInsight: '把握今日生門與開門所落方位規劃重要會晤，避開死門驚門之口舌內耗。'
      }
    };

    return fallbackMap[category] || fallbackMap.career;
  }

  // 1.10 計算【求測人命宮（年命／日干）vs 所問事體宮（時干）vs 核心用神宮】三才生剋真訣
  buildTrinityAnalysis(nianMing, astro, board, targetPalace, scenario) {
    const sheng = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
    const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

    const selfPalace = nianMing.selfPalace;
    const matterPalace = this.palaces.find(p => p.id === board.hourStemPalace) || targetPalace;
    const focusPalace = targetPalace;

    const eSelf = selfPalace.element;
    const eFocus = focusPalace.element;

    let relationTag = '';
    let relationVerdict = '';
    let relationTone = 'gold';

    if (selfPalace.id === focusPalace.id) {
      relationTag = '命用同宮 · 機遇臨身';
      relationVerdict = `您的命宮（${nianMing.label}）與核心用神宮（${focusPalace.name} · 五行屬${eFocus}）同宮共鳴！代表此事與您氣場高度契合，資源與決策權皆在您手中，主動出手即可成事。`;
      relationTone = 'jade';
    } else if (eSelf === eFocus) {
      relationTag = '命用比和 · 順水推舟';
      relationVerdict = `命宮（${selfPalace.name}屬${eSelf}）與用神宮（${focusPalace.name}屬${eFocus}）五行比和同氣。主客雙方默契極佳、阻力極小，宜積極結盟合作，順勢推進必有所獲。`;
      relationTone = 'jade';
    } else if (sheng[eFocus] === eSelf) {
      relationTag = '用神生我 · 天時助益';
      relationVerdict = `用神宮（${focusPalace.name}屬${eFocus}）主動相生您的命宮（${selfPalace.name}屬${eSelf}）。屬於「事來就我、人來助我」之上吉格局，外部平台、標的或對方正對您釋放紅利，宜欣然承接、順勢擴大戰果。`;
      relationTone = 'jade';
    } else if (sheng[eSelf] === eFocus) {
      relationTag = '我生用神 · 傾力灌溉';
      relationVerdict = `您的命宮（${selfPalace.name}屬${eSelf}）相生用神宮（${focusPalace.name}屬${eFocus}）。代表您對此事投入極多心力、資金或情感（「我生者為付出」），雖能促成局面，但務必設立回報檢核點，切莫單方面無底線消耗。`;
      relationTone = 'gold';
    } else if (ke[eSelf] === eFocus) {
      relationTag = '我剋用神 · 強勢主導';
      relationVerdict = `您的命宮（${selfPalace.name}屬${eSelf}）剋制用神宮（${focusPalace.name}屬${eFocus}）。古訣云「我剋者為財、為掌控」，代表您具備攻克此事的實力與話語權，但必須親自盯緊執行細節、主動施力方能拿下成果。`;
      relationTone = 'gold';
    } else if (ke[eFocus] === eSelf) {
      relationTag = '用神剋我 · 審慎避鋒';
      relationVerdict = `用神宮（${focusPalace.name}屬${eFocus}）剋制您的命宮（${selfPalace.name}屬${eSelf}）。顯示外部環境、考核門檻或對手氣勢較強，正面硬碰硬易感壓力倍增；宜借「通關五行」或值符貴人迂迴斡旋，以守代攻方保不失。`;
      relationTone = 'caution';
    }

    const hourStem = this.tiangan[astro.hourGanIdx];
    return {
      scenarioName: scenario.name,
      yongShenLabel: scenario.yongShenLabel,
      selfLabel: `${nianMing.label}（${eSelf}）`,
      matterLabel: `時干【${hourStem}】落${matterPalace.name}（${matterPalace.element}）`,
      focusLabel: `用神落${focusPalace.name}（${eFocus} · ${board.gatePan[focusPalace.id].name}）`,
      relationTag,
      relationVerdict,
      relationTone
    };
  }

  // 2. 核心占卜算局演算法 (正統奇門排盤 + 16場景用神識別 + 年命共振鎖定落宮)
  castBureau(question, category = 'career', userProfile = {}) {
    const now = new Date();
    const astro = this.calculateFourPillars(now);
    const board = this.buildQimenBoard(astro);

    // 0. 識別具體問題語意場景與年命落宮
    const scenario = this.detectScenario(question, category);
    const nianMing = this.resolveNianMing(userProfile.birthYear, astro, board);

    // 1. 依識別場景取正統奇門【主用神宮位】：
    let yongShenPalaceId = board.hourStemPalace;
    const ysType = scenario.yongShenType;
    if (ysType === 'kai_men') {
      yongShenPalaceId = this.ringOrder.find(id => board.gatePan[id].name === '開門') || board.hourStemPalace;
    } else if (ysType === 'sheng_men') {
      yongShenPalaceId = this.ringOrder.find(id => board.gatePan[id].name === '生門') || board.hourStemPalace;
    } else if (ysType === 'liu_he') {
      yongShenPalaceId = this.ringOrder.find(id => board.deityPan[id].name === '六合') || board.hourStemPalace;
    } else if (ysType === 'jing_men') {
      yongShenPalaceId = this.ringOrder.find(id => board.gatePan[id].name === '景門') || board.hourStemPalace;
    } else if (ysType === 'xiu_men') {
      yongShenPalaceId = this.ringOrder.find(id => board.gatePan[id].name === '休門') || board.hourStemPalace;
    } else if (ysType === 'shang_men') {
      yongShenPalaceId = this.ringOrder.find(id => board.gatePan[id].name === '傷門') || board.hourStemPalace;
    } else if (ysType === 'jing_men_shock') {
      yongShenPalaceId = this.ringOrder.find(id => board.gatePan[id].name === '驚門') || board.hourStemPalace;
    } else if (ysType === 'zhi_fu') {
      yongShenPalaceId = this.ringOrder.find(id => board.deityPan[id].name === '值符') || board.hourStemPalace;
    } else if (ysType === 'jiu_tian') {
      yongShenPalaceId = this.ringOrder.find(id => board.deityPan[id].name === '九天') || astro.horsePalaceId || board.hourStemPalace;
    } else if (ysType === 'tian_xin') {
      yongShenPalaceId = this.ringOrder.find(id => board.starPan[id].name === '天心星') || board.hourStemPalace;
    } else if (ysType === 'day_stem') {
      yongShenPalaceId = nianMing.selfPalace.id;
    }

    // 2. 結合求問者具體問題文字、稱謂與年命之【奇門觸機數】：
    const cleanQ = (question || '').trim();
    const seed = this.hashString(`${cleanQ}|${category}|${userProfile.name || ''}|${userProfile.gender || ''}|${userProfile.birthYear || ''}|${astro.pillars}`);

    let targetPalaceId = yongShenPalaceId;
    if (userProfile.mode === 'intuition' || cleanQ.length > 0) {
      const baseRingIdx = this.ringOrder.indexOf(yongShenPalaceId);
      const birthShift = nianMing.hasBirthYear ? (nianMing.birthYear % 8) : 0;
      const offset = cleanQ.length > 0 ? ((this.hashString(cleanQ) + birthShift) % 8) : (seed % 8);
      targetPalaceId = this.ringOrder[(baseRingIdx + offset) % 8];
    }

    const palace = this.palaces.find(p => p.id === targetPalaceId) || this.palaces[0];
    const gate = board.gatePan[targetPalaceId];
    const star = board.starPan[targetPalaceId];
    const deity = board.deityPan[targetPalaceId];
    const tianGan = board.tianPan[targetPalaceId];
    const diGan = board.diPan[targetPalaceId];

    // 3. 真實十干克應與吉凶特殊格局判定
    const formation = this.determineFormation(tianGan, diGan, gate, star, deity, palace, board);

    // 4. 易經六十四卦互應 (由天盤九星五行與地盤宮位八卦精準推導)
    const hexIdx = (palace.id + this.tiangan.indexOf(tianGan) + this.tiangan.indexOf(diGan)) % this.hexagrams.length;
    const hexagram = this.hexagrams[hexIdx];

    // 5. 綜合吉凶評分與定格 (考量門、星、神、奇儀格局與門宮生剋)
    const outcome = this.evaluateOutcome(gate, star, deity, formation, palace, tianGan, diGan);

    // 5.5 構造三才主客生剋定語 (命宮 vs 事體宮 vs 用神宮)
    const trinity = this.buildTrinityAnalysis(nianMing, astro, board, palace, scenario);

    // 6. 生成五維全息報告
    const reading = this.generateDetailedReading(
      question,
      category,
      palace,
      gate,
      star,
      deity,
      outcome,
      formation,
      hexagram,
      astro,
      userProfile,
      board,
      tianGan,
      diGan,
      seed,
      scenario,
      nianMing,
      trinity
    );

    // 本機持久儲存
    this.saveToHistory(reading);

    return reading;
  }

  // 3. 評判格局吉凶 (結合八門、九星、八神、奇儀克應與門宮生剋)
  evaluateOutcome(gate, star, deity, formation, palace, tianGan, diGan) {
    let score = 0;
    if (gate.type === '大吉') score += 4;
    else if (gate.type === '吉' || gate.type === '次吉') score += 2;
    else if (gate.type === '凶' || gate.type === '次凶') score -= 3;

    if (star.type === '大吉') score += 3;
    else if (star.type === '吉' || star.type === '次吉') score += 2;
    else if (star.type === '凶' || star.type === '次凶') score -= 2;

    if (deity.type === '至吉' || deity.type === '吉和') score += 3;
    else if (deity.type === '穩厚' || deity.type === '宏大' || deity.type === '陰護') score += 1;
    else if (deity.type === '虛幻' || deity.type === '曖昧') score -= 1;

    if (formation.type === '大吉') score += 4;
    else if (formation.type === '吉') score += 2;
    else if (formation.type === '凶' || formation.type === '次凶') score -= 3;

    // 三奇（乙、丙、丁）得助加分
    if (['乙', '丙', '丁'].includes(tianGan)) score += 2;
    if (['乙', '丙', '丁'].includes(diGan)) score += 1;

    let verdict = '中吉 · 守正待時';
    let grade = '中吉';
    let color = '#c9a45c';

    if (score >= 9) {
      verdict = '大吉 · 萬象咸亨';
      grade = '大吉';
      color = '#8ab09a';
    } else if (score >= 5) {
      verdict = '上吉 · 雲開見日';
      grade = '上吉';
      color = '#e6c67c';
    } else if (score >= 1) {
      verdict = '平吉 · 順天應人';
      grade = '中平';
      color = '#c9a45c';
    } else if (score >= -3) {
      verdict = '困局 · 暗藏轉機';
      grade = '轉機';
      color = '#d48252';
    } else {
      verdict = '凶局 · 宜避其鋒';
      grade = '謹慎';
      color = '#d46552';
    }

    return { score, verdict, grade, color };
  }

  // 4. 正統奇門十干克應與特殊格局判定
  determineFormation(tianGan, diGan, gate, star, deity, palace, board) {
    const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

    if (tianGan === '戊' && diGan === '丙') return this.formations[0]; // 青龍返首
    if (tianGan === '丙' && diGan === '戊') return this.formations[1]; // 飛鳥跌穴
    if (tianGan === '丙' && gate.name === '生門') return this.formations[2]; // 天遁吉格
    if (tianGan === '乙' && (gate.name === '開門' || diGan === '己')) return this.formations[3]; // 地遁吉格
    if (tianGan === '丁' && (gate.name === '休門' || deity.name === '太陰')) return this.formations[4]; // 人遁吉格
    if (['乙', '丙', '丁'].includes(tianGan) && board && board.zhiShiGate && gate.name === board.zhiShiGate.name) {
      return this.formations[5]; // 三奇得使
    }
    if (diGan === '丁' && board && board.zhiShiGate && gate.name === board.zhiShiGate.name) {
      return this.formations[6]; // 玉女守門
    }
    if (tianGan === '乙' && diGan === '丙') return this.formations[7]; // 青龍耀明
    if (tianGan === '丁' && diGan === '丙') return this.formations[8]; // 星奇朱雀
    if (tianGan === '庚' && diGan === '丙') return this.formations[9]; // 太白入熒
    if (tianGan === '丙' && diGan === '庚') return this.formations[10]; // 熒惑入白

    if (board && board.starShift === 0 && board.gateShift === 0) {
      return this.formations[12]; // 星門伏吟
    }
    if (board && (board.starShift === 4 || board.gateShift === 4)) {
      return this.formations[13]; // 星門反吟
    }
    if (ke[gate.elem] === palace.element) {
      return this.formations[11]; // 門迫宮刑
    }

    // 依天盤與地盤十干組合返回對應定格
    if (['乙', '丙', '丁'].includes(tianGan)) {
      return this.formations[7]; // 青龍耀明 / 三奇順遂
    }
    if (gate.name === '生門' || gate.name === '開門') {
      return this.formations[2]; // 天遁/開泰吉格
    }
    if (gate.name === '休門') {
      return this.formations[4]; // 人遁和合
    }
    const idx = (this.tiangan.indexOf(tianGan) + palace.id) % 9;
    return this.formations[idx];
  }

  // 5. 生成五維全息深層解盤報告 (零隨機數，完全由盤面參數推導)
  generateDetailedReading(question, category, palace, gate, star, deity, outcome, formation, hexagram, astro, userProfile, board, tianGan, diGan, seed, scenario = null, nianMing = null, trinity = null) {
    const quote = this.daoQuotes[seed % this.daoQuotes.length];
    const resolvedScenario = scenario || this.detectScenario(question, category);
    const resolvedNianMing = nianMing || this.resolveNianMing(userProfile.birthYear, astro, board);
    const resolvedTrinity = trinity || this.buildTrinityAnalysis(resolvedNianMing, astro, board, palace, resolvedScenario);

    // 四言斷語籤詩 (依八門與宮位確定性匹配)
    const poems = [
      '太極初開萬象新，中宮端坐定乾坤。四盤流轉循天道，吉凶知機在寸心。',
      '九宮洛書藏妙法，八門開闔驗天機。休嗟眼前逢逆浪，時來風送步雲梯。',
      '陰陽交泰生生處，撥霧見日顯真如。莫教浮議迷心目，守靜安常自得舒。',
      '龍吟虎嘯風雲起，九天值符映日明。行止有常明造化，何愁前路未成名。',
      '奇門演遁一千八，星門奇儀定樞機。識得生門通達路，順天應人萬事宜。',
      '天機本在虛靜內，一念澄明百障消。莫向浮雲爭短長，時乘六龍上碧霄。'
    ];
    const poem = poems[(palace.id + this.gatesRing.indexOf(gate)) % poems.length];

    // 齋主抬頭 (若有年命則一併顯示)
    const genderLabel = userProfile.gender === 'female' ? '坤造' : '乾造';
    const baseName = userProfile.name ? `${userProfile.name} ${genderLabel}` : `信士 ${genderLabel}`;
    const askerTitle = resolvedNianMing.hasBirthYear
      ? `${baseName} · 年命${resolvedNianMing.nianMingPillar}`
      : baseName;

    // 1. 四盤深析 (含天盤奇儀、地盤奇儀、值符、值使與三才生剋)
    const analysis = this.buildContextualAnalysis(category, palace, gate, star, deity, outcome, formation, tianGan, diGan, board, resolvedScenario, resolvedTrinity);

    // 2. 心念盲點與深層癥結 (結合 16 大場景精準切入)
    const blindspot = this.buildBlindspotAnalysis(category, palace, gate, outcome, resolvedScenario, resolvedTrinity);

    // 3. 時序應期預測 (依洛書宮數與八門應期確定性推算)
    const timing = this.buildTimingPrediction(gate, palace, astro, tianGan, diGan);

    // 4. 破局之策與五行開運化解
    const strategy = this.buildStrategy(category, palace, gate, outcome, formation);

    // 5. VIP 大師深度全息錦囊 (付費級量化與雷區剖析)
    const vipPackage = this.buildVipPackage(palace, gate, star, deity, outcome, category, tianGan, diGan, seed);

    return {
      id: 'qm_' + seed.toString(36),
      time: new Date().toLocaleString('zh-TW', { hour12: false }),
      question: question || '心念所向 · 當前局勢探尋',
      category: this.getCategoryName(category),
      categoryKey: category,
      askerTitle,
      nianMing: resolvedNianMing,
      scenario: resolvedScenario,
      trinity: resolvedTrinity,
      astro,
      palace,
      gate,
      star,
      deity,
      tianGan,
      diGan,
      formation,
      hexagram,
      outcome,
      poem,
      quote,
      analysis,
      blindspot,
      timing,
      strategy,
      vipPackage,
      hostGuest: this.buildHostGuestAnalysis(category, palace, gate, star, formation, astro),
      ninePalacesChart: this.getNinePalacesChart(astro, palace.id, resolvedNianMing.selfPalace.id),
      historicalDoctrine: this.buildHistoricalDoctrine(category, palace, gate, star, formation),
      timelineSimulation: this.calculateTimelineSimulation(category, astro, palace, gate)
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

  // 構造四盤全息分析 (融入天盤奇儀、地盤奇儀、值符值使與場景用神)
  buildContextualAnalysis(cat, palace, gate, star, deity, outcome, formation, tianGan = '戊', diGan = '丙', board = null, scenario = null, trinity = null) {
    const zhiFuInfo = board && board.zhiFuStar ? `當局值符為【${board.zhiFuStar.name}】、值使為【${board.zhiShiGate.name}】。` : '';
    const scInfo = scenario ? `本局針對「${scenario.name}」，取${scenario.yongShenLabel}為核心用神樞紐。` : '';
    let tian = `${scInfo}${zhiFuInfo}用神落宮天盤逢【${star.name}】（五行屬${star.elem} · ${star.desc}），攜天盤奇儀【${tianGan}】加臨。象徵天時大勢處於${star.type === '大吉' || star.type === '吉' ? '得道順行之期，外部宏觀趨勢暗中助推，順勢布局可獲倍增效益' : '結構洗牌階段，切勿被外部短期雜訊帶偏節奏，務求固本清源'}。`;
    let di = `地盤落於【${palace.name}（${palace.direction}）】，地盤奇儀為【${diGan}】，宮位五行屬【${palace.element}】（卦象${palace.trigram} · ${palace.nature}）。天盤【${tianGan}】加地盤【${diGan}】，此宮五行與人盤八門呈${this.getElementRelation(gate.elem, palace.element)}之象，客觀資源與地利脈絡清晰。`;
    let ren = `人盤當值【${gate.name}】（${gate.type}，五行屬${gate.elem} · ${gate.desc}）。人盤主宰人事進退與執行決策。當前在行動步調上，${gate.name === '生門' || gate.name === '開門' ? '利於主動開闢新局、敲定核心盟約或推進關鍵商務談判' : gate.name === '休門' ? '宜從容斡旋、借貴人之力暗中調度，切莫急躁強推' : '需特別防範溝通斷層與條款細節疏漏，先求立於不敗之地'}。`;
    let shen = `神盤得【${deity.name}】（${deity.desc} · ${deity.nature}）乘勢。神盤主高維機緣與無形助力。${deity.name === '值符' ? '千災萬禍化為塵，得頂層長官或核心貴人背書護航' : deity.name === '六合' ? '合則兩利，借助契約結盟或中介橋樑可迅速破局' : '提醒你在關鍵節點保持冷靜洞察，洞悉對手底牌後再行落子'}。`;
    let formDesc = `當局顯化【${formation.name}】（${formation.type}）：${formation.desc} 特徵標籤：${formation.tags.join(' · ')}。`;

    return { tian, di, ren, shen, formDesc, trinity };
  }

  // 五行生剋關係文本
  getElementRelation(elem1, elem2) {
    if (elem1 === elem2) return '比和同氣（門宮相合融洽）';
    const sheng = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
    const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
    if (sheng[elem1] === elem2) return '門生宮位（和義 · 人事傾力滋養根基）';
    if (sheng[elem2] === elem1) return '宮生門戶（義和 · 得地利資源滋養人事）';
    if (ke[elem1] === elem2) return '門迫宮位（門剋宮 · 強行推進易生耗損）';
    if (ke[elem2] === elem1) return '宮制門戶（宮剋門 · 客觀環境約束人事）';
    return '相生互映';
  }

  // 構造深層心理盲點剖析 (結合 16 大細分場景與三才生剋)
  buildBlindspotAnalysis(cat, palace, gate, outcome, scenario = null, trinity = null) {
    if (scenario && scenario.rootInsight) {
      return {
        root: `【${scenario.name} · 落${palace.name}逢${gate.name}】${scenario.rootInsight}`,
        counterparty: `${scenario.counterInsight}${trinity ? `（盤面顯示：${trinity.relationTag}）` : ''}`,
        awakening: scenario.awakeInsight
      };
    }
    const map = {
      career: {
        root: `落於【${palace.name}】逢【${gate.name}】，反映心中對「失去現有穩態」與「新局掌控度」存在拉鋸，表面猶豫不決，實則過度預支了尚未發生的阻力。`,
        counterparty: '上司、合作方或決策者目前最看重你的「可預期交付能力」與「抗壓定力」，而非華麗遠景。',
        awakening: '不執著於一役定乾坤，將龐大目標拆解為三階段可驗證的里程碑，焦慮自解。'
      },
      love: {
        root: `【${palace.name}】氣場顯示你在關係中渴望深度共鳴，卻容易以「防禦性沉默」或「試探性退讓」自我保護，導致心意未能真正流通。`,
        counterparty: '對方內心同樣在觀察你的篤定程度，等待一個溫和而明確的台階，而非爭辯對錯。',
        awakening: '放下「誰先低頭誰輸」的執念，坦率表達真實需求，反而能瞬間掌握關係主動權。'
      },
      wealth: {
        root: `逢【${gate.name}】臨【${palace.name}】，容易在「短期波段誘惑」與「長線複利布局」之間搖擺，受市場雜音干擾而頻繁更動部位。`,
        counterparty: '市場主力或交易對手此時正在利用資訊不對稱洗盤，急於求成者最易成為流動性籌碼。',
        awakening: '嚴守本金與現金流安全邊際，只做認知範圍內的高勝率布局，不賺最後一分險錢。'
      },
      decision: {
        root: `試圖在多個選項中「全拿好處、不付代價」，這種追求零風險的完美主義，正是導致在【${palace.name}】停滯的根源。`,
        counterparty: '外部時空窗口正隨節氣流轉而收斂，拖延並非中立，而是將選擇權拱手讓人。',
        awakening: '奇門貴在知機立斷，選定最契合核心價值的一條路全力走通，即是最佳解。'
      }
    };
    return map[cat] || map.career;
  }

  // 構造時序應期預測 (依奇門洛書宮數、旬空填實與衝實法則，100% 確定性推算)
  buildTimingPrediction(gate, palace, astro, tianGan = '戊', diGan = '丙') {
    const luoshuNum = palace.id; // 1, 8, 3, 4, 9, 2, 7, 6
    const nearDays = `近則 ${luoshuNum} 日或 ${luoshuNum + 5} 日內（逢${tianGan}、${diGan}日干引動）`;
    const midTerms = `本節氣【${astro.solarTerm}】交節後至旬空【${astro.voidPalaces}】填實／衝實之期`;
    const branchHoursMap = {
      1: '子時（23-01時）或申辰水局吉辰',
      8: '丑寅時（01-05時）或辰戌土旺吉辰',
      3: '卯時（05-07時）或亥未木局吉辰',
      4: '辰巳時（07-11時）或水木相生吉辰',
      9: '午時（11-13時）或寅戌火局吉辰',
      2: '未申時（13-17時）或巳酉土金吉辰',
      7: '酉時（17-19時）或巳丑金局吉辰',
      6: '戌亥時（19-23時）或辰申金水吉辰'
    };
    const auspiciousHours = branchHoursMap[palace.id] || '辰時（07-09時）或巳時（09-11時）';

    return {
      near: nearDays,
      mid: midTerms,
      hours: auspiciousHours,
      yingQiDesc: `依奇門應期法則，用神落【${palace.name}】（洛書數為 ${luoshuNum}），人盤【${gate.name}】應於${gate.yingQi}。${nearDays}將浮現關鍵信號；中期則以${midTerms}為局勢拍板應驗之期。重大行動宜取【${auspiciousHours}】推進。`
    };
  }

  // 構造破局之策與五行開運化解
  buildStrategy(cat, palace, gate, outcome, formation) {
    const elemRemedies = {
      '金': { color: '素白、泥金、杏黃色系', item: '金屬腕錶、黃銅鎮紙、圓形金石印章', num: '4、9' },
      '木': { color: '松石綠、青碧、墨綠色系', item: '沉香木串、案頭青松、竹製茶器', num: '3、8' },
      '水': { color: '玄黑、黛藍、冰澈色系', item: '黑曜石、墨玉佩飾、琉璃水盂', num: '1、6' },
      '火': { color: '硃砂紅、絳紫、赭石色系', item: '硃砂印泥、暖光桌燈、茶晶飾物', num: '2、7' },
      '土': { color: '宣紙米、伽羅黃、琥珀色系', item: '紫砂茶器、黃玉鎮尺、天然礦石', num: '5、10' }
    };
    const remedy = elemRemedies[palace.element] || elemRemedies['金'];

    return {
      direction: `利於朝向【${palace.direction}（${palace.name}）】洽談布局與尋求貴人`,
      color: remedy.color,
      item: remedy.item,
      luckyNumber: remedy.num,
      action: outcome.grade === '大吉' || outcome.grade === '上吉'
        ? '得天時地利之助，宜主動出擊敲定關鍵條款；但須知居安思危，留三分餘地以保長久。'
        : outcome.grade === '中平'
        ? '靜觀其變，以靜制動；將龐雜局勢拆解為三步可控節點，先固本後圖進。'
        : '奇門講求「知機借勢、避實擊虛」。當前正面強攻易受門宮克制，宜轉換切入點、以退為進。',
      mindset: '「水滿則溢，月盈則虧。得勢之時懂得留餘地，困厄之時知曉死門之側即是生門。」',
      tactics: {
        upper: '【上策 · 借勢乘時】順應值符與三奇所向，借助關鍵決策者或高維平台背書，四兩撥千斤。',
        middle: '【中策 · 築基固本】守住核心現金流與基本盤，不作無把握之擴張，深耕護城河。',
        lower: '【下策 · 避凶止損】若逢門迫或庚格阻隔，果斷切割無效內耗，待時辰輪轉再開新局。'
      }
    };
  }

  // 構造 VIP 大師深度全息錦囊 (100% 由盤面星、門、神、奇儀生剋確定性量化計算)
  buildVipPackage(palace, gate, star, deity, outcome, category, tianGan = '戊', diGan = '丙', seed = 1001) {
    const sheng = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
    const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

    const starBase = star.type === '大吉' ? 92 : star.type === '吉' ? 85 : star.type === '次吉' ? 79 : star.type === '平' ? 73 : 64;
    const diBase = sheng[palace.element] === gate.elem ? 90 : (palace.element === gate.elem ? 84 : (ke[gate.elem] === palace.element ? 62 : 76));
    const renBase = gate.type === '大吉' ? 94 : gate.type === '吉' ? 87 : gate.type === '次吉' ? 80 : gate.type === '平' ? 74 : 63;
    const shenBase = deity.type === '至吉' ? 95 : deity.type === '吉和' ? 89 : (deity.type === '陰護' || deity.type === '穩厚' || deity.type === '宏大') ? 82 : 68;
    const timingBase = ['乙', '丙', '丁', '戊'].includes(tianGan) ? 88 : 75;

    const energyScores = {
      tian: Math.min(98, Math.max(58, starBase + (palace.id % 5))),
      di: Math.min(96, Math.max(56, diBase + (palace.id % 4))),
      ren: Math.min(97, Math.max(58, renBase + ((palace.id + 2) % 4))),
      shen: Math.min(99, Math.max(60, shenBase + (palace.id % 3))),
      timing: Math.min(95, Math.max(58, timingBase + ((palace.id + 1) % 6)))
    };

    const taboos = [
      `切忌在旬空方位【${palace.direction}】未填實前，未經書面契約即先行投入大額資金或承諾。`,
      `本局天盤【${tianGan}】臨地盤【${diGan}】，忌在情緒波動或資訊未核實時倉促拍板。`,
      `避開與人盤【${gate.name}】相衝之時段正面交鋒，重大談判宜先定底線再談籌碼。`
    ];

    const masterAxiom = `「此局樞機在於天盤【${tianGan}】會地盤【${diGan}】，人盤【${gate.name}】落於【${palace.name}】。外象雖有波瀾，實則脈絡已明，緊扣${gate.name}之義穩步落子，自可轉危為安、大獲全勝。」`;

    const certNum = 1000 + (seed % 9000);
    return {
      radar: energyScores,
      taboos,
      masterAxiom,
      certificateCode: `QM-DUNJIA-${palace.id}${gate.homePalace}-${certNum}`
    };
  }

  // 6. 今日奇門出行吉方羅盤推算 (100% 採用正統轉盤奇門實時盤面)
  calculateDailyCompass(date = new Date()) {
    const astro = this.calculateFourPillars(date);
    const board = this.buildQimenBoard(astro);

    const directionsData = this.palaces.map((palace) => {
      const gate = board.gatePan[palace.id];
      const star = board.starPan[palace.id];
      const deity = board.deityPan[palace.id];
      const tianGan = board.tianPan[palace.id];
      const diGan = board.diPan[palace.id];

      let rating = '平';
      let tag = '安常居停';
      let color = '#a89f8b';
      let advice = '安常守分，順勢而行。';

      if (gate.name === '生門') {
        rating = '大吉';
        tag = '財源生機';
        color = '#8ab09a';
        advice = '經商投資、出門談判、簽約進產之最吉利方位。';
      } else if (gate.name === '開門') {
        rating = '大吉';
        tag = '事業貴人';
        color = '#e6c67c';
        advice = '拜訪長官、開業開市、求職面試、遠行開拓大吉。';
      } else if (gate.name === '休門') {
        rating = '吉';
        tag = '和順姻緣';
        color = '#c9a45c';
        advice = '約會相親、化解矛盾、見貴人與身心休養大吉。';
      } else if (gate.name === '景門') {
        rating = '次吉';
        tag = '聲名文采';
        color = '#d48252';
        advice = '宴會社交、演講發表、企劃行銷，留意文書細節。';
      } else if (gate.name === '杜門') {
        rating = '平';
        tag = '隱蔽蓄力';
        color = '#a8b8c0';
        advice = '防守保全、研發創作、閉門深造，不宜高調張揚。';
      } else if (gate.name === '傷門') {
        rating = '凶';
        tag = '變動阻礙';
        color = '#b57b6c';
        advice = '外出防交通刮蹭、爭端口舌，此方唯討債索賠有力。';
      } else if (gate.name === '死門') {
        rating = '大凶';
        tag = '困滯晦氣';
        color = '#d46552';
        advice = '行事停滯僵局，非必要不宜朝此方出行或重大決策。';
      } else if (gate.name === '驚門') {
        rating = '次凶';
        tag = '虛驚口舌';
        color = '#c84b3e';
        advice = '多有疑慮怪異、口角官非，需防合約陷阱與突發驚擾。';
      }

      return {
        palace,
        direction: palace.direction,
        gate,
        star,
        deity,
        tianGan,
        diGan,
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
      bestWealth: directionsData.find(d => d.gate.name === '生門') || directionsData[0],
      bestCareer: directionsData.find(d => d.gate.name === '開門') || directionsData[1],
      bestLove: directionsData.find(d => d.gate.name === '休門') || directionsData[2],
      cautionDir: directionsData.find(d => d.gate.name === '死門') || directionsData[5],
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

  // 8. 構造商戰主客博弈之道 (Host vs Guest Combat Engine)
  buildHostGuestAnalysis(category, palace, gate, star, formation, astro) {
    const sheng = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
    const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

    // 1. 五陽時 vs 五陰時 (時干: 甲乙丙丁戊為陽時利客，己庚辛壬癸為陰時利主)
    const hourStem = astro.hourPillar ? astro.hourPillar[0] : '甲';
    const isYangHour = ['甲', '乙', '丙', '丁', '戊'].includes(hourStem);

    // 2. 星宮生剋 (天盤九星為客，地盤落宮為主)
    const starElem = star.elem;
    const palaceElem = palace.element;
    let relation = '比和';
    let rawGuestScore = 50;

    if (starElem === palaceElem) {
      relation = '主客比和（同氣連枝）';
      rawGuestScore = 50;
    } else if (sheng[starElem] === palaceElem) {
      relation = '客生主（客方耗氣，主方坐收其利）';
      rawGuestScore = 35;
    } else if (sheng[palaceElem] === starElem) {
      relation = '主生客（主方付出，客方獲益匪淺）';
      rawGuestScore = 65;
    } else if (ke[starElem] === palaceElem) {
      relation = '客克主（客方強勢壓迫，摧枯拉朽）';
      rawGuestScore = 75;
    } else if (ke[palaceElem] === starElem) {
      relation = '主克客（主方固守反制，客方四處碰壁）';
      rawGuestScore = 25;
    }

    if (isYangHour) rawGuestScore += 10;
    else rawGuestScore -= 10;

    if (formation.name.includes('伏吟')) rawGuestScore -= 15;
    else if (formation.name.includes('反吟')) rawGuestScore += 15;

    const guestScore = Math.max(15, Math.min(85, rawGuestScore));
    const hostScore = 100 - guestScore;

    let verdict = '【利客 · 宜主動出擊】';
    let tacticSummary = '當前天時大氣動向偏向「發起者」。先聲奪人、主動提案、出門拜訪或率先開拓，能搶佔制高點。';
    if (guestScore < 45) {
      verdict = '【利主 · 宜以逸待勞】';
      tacticSummary = '當前磁場利於「守御者」。按兵不動、後發制人、坐守大本營讓對方先開口亮底牌，可立於不敗之地。';
    } else if (guestScore >= 45 && guestScore <= 55) {
      verdict = '【主客均勢 · 借力使力】';
      tacticSummary = '雙方勢均力敵，不可硬碰硬。宜採取中道斡旋、利益綑綁或尋找第三信任方破局。';
    }

    const hostAdvice = `【身為守方／甲方／迎候者】：${guestScore < 50 ? '大勢在您！堅持既有價格與核心底線，不必主動降價讓步，對方終將按捺不住主動妥協。' : '當前守勢較為吃力，切莫頑固死守僵局，適度在次要條款放寬空間，換取核心利益落地。'}`;
    const guestAdvice = `【身為攻方／乙方／提案者】：${guestScore >= 50 ? '戰機稍縱即逝！積極主動出擊約見對手，直接亮出殺手級價值與限時方案，一鼓作氣敲定合約。' : '當前強攻必碰軟釘子！切忌頻繁催促追問，暫退一步給予對方思考緩衝期，暗中補強方案漏洞。'}`;

    const negotiationGimmick = category === 'wealth'
      ? '談判商戰：凡涉及利潤分配，陽時簽約宜爭取前置分潤；陰時簽約宜固守保底資產防線。'
      : category === 'love'
      ? '情感交鋒：若利客，宜主動破冰邀約出遊；若利主，宜給予對方空間，保持神秘與自身生活專注。'
      : '決策戰略：先定主客身分，動者為客靜者為主。順天應人，利客時雷厲風行，利主時靜若處子。';

    return {
      hourStem,
      isYangHour,
      hourType: isYangHour ? '五陽時（利客）' : '五陰時（利主）',
      starElem,
      palaceElem,
      relation,
      guestScore,
      hostScore,
      verdict,
      tacticSummary,
      hostAdvice,
      guestAdvice,
      negotiationGimmick
    };
  }

  // 9. 獲取傳統三階九宮全景排盤數據 (100% 同步正統轉盤奇門盤面，標記用神宮與命宮)
  getNinePalacesChart(astro, activePalaceId = null, selfPalaceId = null) {
    const board = this.buildQimenBoard(astro);
    const effectiveSelfId = selfPalaceId || board.dayStemPalace;
    const layout = [
      { id: 4, name: '巽四宮', bagua: '巽', elem: '木', dir: '東南', trigram: '☴', branches: ['辰', '巳'] },
      { id: 9, name: '離九宮', bagua: '離', elem: '火', dir: '正南', trigram: '☲', branches: ['午'] },
      { id: 2, name: '坤二宮', bagua: '坤', elem: '土', dir: '西南', trigram: '☷', branches: ['未', '申'] },
      { id: 3, name: '震三宮', bagua: '震', elem: '木', dir: '正東', trigram: '☳', branches: ['卯'] },
      { id: 5, name: '中五宮', bagua: '中', elem: '土', dir: '中宮', trigram: '☯', branches: [] },
      { id: 7, name: '兌七宮', bagua: '兌', elem: '金', dir: '正西', trigram: '☱', branches: ['酉'] },
      { id: 8, name: '艮八宮', bagua: '艮', elem: '土', dir: '東北', trigram: '☶', branches: ['丑', '寅'] },
      { id: 1, name: '坎一宮', bagua: '坎', elem: '水', dir: '正北', trigram: '☵', branches: ['子'] },
      { id: 6, name: '乾六宮', bagua: '乾', elem: '金', dir: '西北', trigram: '☰', branches: ['戌', '亥'] }
    ];

    const ke = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };

    return layout.map((item) => {
      if (item.id === 5) {
        return {
          ...item,
          isCenter: true,
          tianGan: '天禽',
          diGan: board.diPan[5] || '戊',
          gate: { name: '寄坤二宮', type: '吉' },
          star: { name: '天禽星', type: '吉' },
          deity: { name: '中宮樞紐', type: '至吉' },
          isTarget: activePalaceId === 5,
          isSelf: false,
          isVoid: false,
          isHorse: false
        };
      }

      const gate = board.gatePan[item.id];
      const star = board.starPan[item.id];
      const deity = board.deityPan[item.id];
      const tianGan = board.tianPan[item.id];
      const diGan = board.diPan[item.id];
      const isPo = ke[gate.elem] === item.elem;
      const isVoid = (astro.voidBranches || []).some(b => item.branches.includes(b));
      const isHorse = astro.horsePalaceId === item.id;

      return {
        ...item,
        isCenter: false,
        tianGan,
        diGan,
        gate,
        star,
        deity,
        isPo,
        isTarget: activePalaceId === item.id,
        isSelf: effectiveSelfId === item.id,
        isVoid,
        isHorse
      };
    });
  }

  // 10. 構造未來七日開運吉辰曆 (7-Day Golden Windows Planner)
  calculateWeeklyGoldenWindows(category = 'career', startDate = new Date()) {
    const days = [];
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    for (let d = 0; d < 7; d++) {
      const curDate = new Date(startDate.getTime() + d * 86400000);
      const dateStr = `${curDate.getMonth() + 1}月${curDate.getDate()}日 (週${weekdays[curDate.getDay()]})`;
      const astro = this.calculateFourPillars(curDate);
      const dailyCompass = this.calculateDailyCompass(curDate);

      let topWindows = [];
      if (category === 'wealth') {
        topWindows = [
          { shichen: '辰時 (07:00-09:00)', palace: `${dailyCompass.bestWealth.direction} · ${dailyCompass.bestWealth.palace.name}`, action: '簽約進產、大額理財佈局、商業會晤', score: 96 },
          { shichen: '申時 (15:00-17:00)', palace: `${dailyCompass.bestCareer.direction} · ${dailyCompass.bestCareer.palace.name}`, action: '敲定合作合約、交付成果、收款核帳', score: 92 },
          { shichen: '巳時 (09:00-11:00)', palace: `${dailyCompass.bestLove.direction} · ${dailyCompass.bestLove.palace.name}`, action: '商務談判、客戶提案、拓展新客源', score: 88 }
        ];
      } else if (category === 'love') {
        topWindows = [
          { shichen: '酉時 (17:00-19:00)', palace: `${dailyCompass.bestLove.direction} · ${dailyCompass.bestLove.palace.name}`, action: '相親約會、真誠談心、化解誤會心結', score: 95 },
          { shichen: '午時 (11:00-13:00)', palace: `${dailyCompass.bestWealth.direction} · ${dailyCompass.bestWealth.palace.name}`, action: '互贈心意、聚餐結緣、釋放善意', score: 91 },
          { shichen: '戌時 (19:00-21:00)', palace: `${dailyCompass.bestCareer.direction} · ${dailyCompass.bestCareer.palace.name}`, action: '深度交流、溫馨傾聽、確認未來方向', score: 87 }
        ];
      } else {
        topWindows = [
          { shichen: '卯時 (05:00-07:00)', palace: `${dailyCompass.bestCareer.direction} · ${dailyCompass.bestCareer.palace.name}`, action: '晨起立志、重要面試、啟程出發、開工大吉', score: 95 },
          { shichen: '辰時 (07:00-09:00)', palace: `${dailyCompass.bestWealth.direction} · ${dailyCompass.bestWealth.palace.name}`, action: '拜見長官貴人、提交重大專案審批', score: 93 },
          { shichen: '申時 (15:00-17:00)', palace: `${dailyCompass.bestLove.direction} · ${dailyCompass.bestLove.palace.name}`, action: '拍板重大決策、統御團隊推進關鍵環節', score: 89 }
        ];
      }

      days.push({
        dayIndex: d,
        isToday: d === 0,
        dateStr,
        fourPillars: `${astro.yearPillar} ${astro.monthPillar} ${astro.dayPillar}`,
        bureauName: astro.bureauName,
        bestDirection: dailyCompass.bestCareer.direction,
        topWindows
      });
    }

    return days;
  }

  // 11. 千古名戰奇門局象共鳴與商戰兵法對照
  buildHistoricalDoctrine(category, palace, gate, star, formation) {
    const battles = [
      {
        id: 'chibi',
        name: '諸葛孔明 · 赤壁奇門借東風局',
        commander: '諸葛孔明 (武侯)',
        era: '三國建安十三年 (西元208年)',
        targetPalaceId: 4,
        targetGates: ['杜門', '休門', '生門'],
        trigram: '☴ 巽風',
        resonanceBase: 94,
        coreDoctrine: '順風借勢 · 四兩撥千斤',
        historicalContext: '建安十三年冬，曹操引八十萬大軍順江直下，劉備與孫權處於絕對劣勢。孔明於南屏山築七星壇，依奇門演遁步罡踏斗，於十一月甲子日測得東南風起，助周瑜行火攻之計，一戰定天下三分。',
        businessApplication: '當前面臨強大競爭對手或市場宏觀逆境時，切忌以硬碰硬。此局兵法核心在於「槓桿原理」：善用即將出台的行業新政、平台流量風口或巨頭間的博弈縫隙（東風），以精準痛點作為引信。尋求具備互補資源的盟友聯合，把對手的體量劣勢轉化為自己突圍的燃料。',
        tacticalCaution: '兵法警策：借風不可戀風。借勢起飛之後，需即刻佈局自己落地的防禦工事，不可完全依附於外在風口。',
        quote: '欲破曹公，宜用火攻。萬事俱備，只欠東風。'
      },
      {
        id: 'zhuolu',
        name: '黃帝軒轅 · 涿鹿指南破霧局',
        commander: '黃帝軒轅氏',
        era: '上古華夏紀元',
        targetPalaceId: 6,
        targetGates: ['開門', '景門', '生門'],
        trigram: '☰ 乾天',
        resonanceBase: 96,
        coreDoctrine: '撥雲見日 · 指南破虛',
        historicalContext: '蚩尤作大霧三日，內外莫辨，軒轅之師迷失方向。於是仰觀天象、俯察洛書法度，造指南車以辨四方，並演成奇門遁甲一千八十局，終破迷霧於涿鹿之野。',
        businessApplication: '當前市場充斥著低價混戰、虛假宣傳與各類資訊雜音（大霧），容易讓人迷失核心定位。此局提示你：立刻回歸核心基本面（指南車）——你的真實交付價值、高黏性種子客戶與健康正向現金流。只要自己方向不偏，對手的虛晃一槍在三至五個月內必因資金鏈或口碑問題自我崩解。',
        tacticalCaution: '兵法警策：霧中不行險棋。在局勢不明朗之際，不做過激擴張，緊扣主軸穩步推進。',
        quote: '四方迷濛不見日，指南靈車定乾坤。'
      },
      {
        id: 'gaixia',
        name: '張子房 · 垓下十面埋伏滅楚局',
        commander: '張良 (留侯)',
        era: '漢高祖五年 (前202年)',
        targetPalaceId: 3,
        targetGates: ['驚門', '傷門', '杜門'],
        trigram: '☳ 震雷',
        resonanceBase: 92,
        coreDoctrine: '四面楚歌 · 攻心為上',
        historicalContext: '漢軍將楚軍圍困於垓下，張良深諳心理兵法，命漢軍四面唱楚歌。項羽夜聞楚歌大驚，以為漢皆已得楚，楚軍軍心瓦解，遂成十面埋伏大獲全勝。',
        businessApplication: '商戰競爭與重大商務談判的至高境界在於「不戰而屈人之兵」。與其在價格與成本上跟競品拼到兩敗俱傷，不如直搗對方心理底線與團隊組織結構。在談判桌上亮出無法被替代的獨家優勢，讓對方產生「與你合作是唯一生路」的共識。',
        tacticalCaution: '兵法警策：圍師必闕。逼退對手時務必給其留下一條體面的退路或轉型出口，切勿窮追不捨導致狗急跳牆。',
        quote: '運籌帷幄之中，決勝千里之外。'
      },
      {
        id: 'jinling',
        name: '劉伯溫 · 金陵玄武定鼎帝業局',
        commander: '劉伯溫 (文成公)',
        era: '明洪武元年 (西元1368年)',
        targetPalaceId: 8,
        targetGates: ['生門', '開門', '休門'],
        trigram: '☶ 艮山',
        resonanceBase: 95,
        coreDoctrine: '高築牆 · 廣積糧 · 緩稱王',
        historicalContext: '元末群雄並起，陳友諒、張士誠急於僭位稱尊。劉伯溫密呈九字箴言，定都金陵，依奇門佈設紫金山龍脈大局，先固根本、後掃殘寇，開創大明基業。',
        businessApplication: '目前正是打磨內部產品底層架構、扎實積累技術壁壘與客戶口碑的黃金窗口期。外界熱鬧喧囂的融資炒作莫去眼紅。把防禦壁壘（高築牆）築牢，深耕高復購的核心客戶（廣積糧），時機一到自然登頂產業龍頭。',
        tacticalCaution: '兵法警策：莫貪浮名。當前階段任何過早的宣傳曝光都會引來既得利益者的圍剿，悶聲沉澱方能笑到最後。',
        quote: '深挖洞，廣積糧，不稱霸，王道自成。'
      },
      {
        id: 'muye',
        name: '太公望 · 牧野鷹揚順天伐紂局',
        commander: '姜子牙 (太公望)',
        era: '商周之際 (約前1046年)',
        targetPalaceId: 1,
        targetGates: ['休門', '生門', '傷門'],
        trigram: '☵ 坎水',
        resonanceBase: 93,
        coreDoctrine: '蓄勢如淵 · 鳴鏑雷霆',
        historicalContext: '太公垂釣渭水，待天命歸周。牧野之役，太公望左杖黃鉞，右秉白旄以麾，趁殷商主力南征東夷之際，一戰而覆商紂，奠定周朝八百年禮樂之基。',
        businessApplication: '在關鍵節點到來前，保持水一樣的沉靜與定力。內部嚴格打磨核心產品與供應鏈，外部不露半點鋒芒。一旦競對或市場出現結構性空缺，果斷調集所有資源以雷霆之勢迅速佔領市場。',
        tacticalCaution: '兵法警策：一鼓作氣，再而衰，三而竭。發動總攻前必須確保彈藥與後勤百分之百到位。',
        quote: '寧在直中取，不向曲中求；時至天運合，雷霆破山川。'
      },
      {
        id: 'bailang',
        name: '郭奉孝 · 白狼山奇兵絕塵平遼局',
        commander: '郭嘉 (奉孝)',
        era: '東漢建安十二年 (西元207年)',
        targetPalaceId: 9,
        targetGates: ['景門', '開門', '驚門'],
        trigram: '☲ 離火',
        resonanceBase: 91,
        coreDoctrine: '兵貴神速 · 奇兵絕塵',
        historicalContext: '曹操遠征烏桓，部將皆恐後方有失。郭奉孝獨排眾議，建言「兵貴神速，今千里襲人，輜重多，難以趨利，不如棄輜重，兼道兼行出其不意」，於白狼山一役斬殺蹋頓，大獲全勝。',
        businessApplication: '在瞬息萬變的數位商業時代，敏捷性勝過冗長完美的方案。砍掉所有繁重的審批鏈條與官僚形式主義，帶著最小可行性產品（MVP）迅速切入市場搶先登陸。',
        tacticalCaution: '兵法警策：輕兵易折。急速推進必須建立在嚴苛的風險止損線之上，留足安全底線資金。',
        quote: '策無遺算，算無虛發；兵貴神速，奇勝正合。'
      }
    ];

    let bestMatch = battles[0];
    let maxScore = -1;

    battles.forEach((b, idx) => {
      let score = b.resonanceBase;
      if (b.targetPalaceId === palace.id) score += 6;
      if (b.targetGates.includes(gate.name)) score += 4;
      if (formation && (formation.type === '大吉' || formation.type === '吉')) score += 2;
      score = Math.min(99, Math.max(86, score + ((palace.id * 3 + idx) % 5) - 2));

      if (score > maxScore) {
        maxScore = score;
        bestMatch = { ...b, matchScore: score };
      }
    });

    return bestMatch;
  }

  // 12. 運勢演化沙盤 (24小時真實流時奇門盤推演模擬器)
  calculateTimelineSimulation(category, astro, palace, gate) {
    const shichenHours = [
      { name: '子時', range: '23:00 - 01:00', branch: '子', repHour: 0 },
      { name: '丑時', range: '01:00 - 03:00', branch: '丑', repHour: 2 },
      { name: '寅時', range: '03:00 - 05:00', branch: '寅', repHour: 4 },
      { name: '卯時', range: '05:00 - 07:00', branch: '卯', repHour: 6 },
      { name: '辰時', range: '07:00 - 09:00', branch: '辰', repHour: 8 },
      { name: '巳時', range: '09:00 - 11:00', branch: '巳', repHour: 10 },
      { name: '午時', range: '11:00 - 13:00', branch: '午', repHour: 12 },
      { name: '未時', range: '13:00 - 15:00', branch: '未', repHour: 14 },
      { name: '申時', range: '15:00 - 17:00', branch: '申', repHour: 16 },
      { name: '酉時', range: '17:00 - 19:00', branch: '酉', repHour: 18 },
      { name: '戌時', range: '19:00 - 21:00', branch: '戌', repHour: 20 },
      { name: '亥時', range: '21:00 - 23:00', branch: '亥', repHour: 22 }
    ];

    const now = new Date();
    const curHour = now.getHours();
    const curShichenIdx = Math.floor(((curHour + 1) % 24) / 2);

    const simulationList = [];
    let bestScore = -1;
    let goldenIndex = 0;

    for (let i = 0; i < 12; i++) {
      const sIdx = (curShichenIdx + i) % 12;
      const shInfo = shichenHours[sIdx];

      // 以每個時辰的真實時家奇門盤推算該時辰用神與門星吉凶
      const simDate = new Date(now.getTime() + i * 2 * 3600000);
      const simAstro = this.calculateFourPillars(simDate);
      const simBoard = this.buildQimenBoard(simAstro);

      let targetPId = palace.id;
      if (category === 'wealth') {
        targetPId = this.ringOrder.find(id => simBoard.gatePan[id].name === '生門') || palace.id;
      } else if (category === 'career') {
        targetPId = this.ringOrder.find(id => simBoard.gatePan[id].name === '開門') || palace.id;
      } else {
        targetPId = simBoard.hourStemPalace;
      }

      const curPal = this.palaces.find(p => p.id === targetPId) || palace;
      const curGate = simBoard.gatePan[palace.id] || gate;

      let level = '中平';
      let score = 72;
      let action = '守正安常，按部就班推動事務';

      if (curGate.name === '生門' || curGate.name === '開門') {
        level = '大吉';
        score = 92 + ((sIdx + curPal.id) % 7);
        action = category === 'wealth' ? '進財簽約、大額交易洽談、搶佔商機' : '提呈重要專案、主動面談拜會、開創局勢';
      } else if (curGate.name === '休門') {
        level = '吉';
        score = 86 + ((sIdx + curPal.id) % 6);
        action = category === 'love' ? '傾心相談、約會聚首、破冰增溫' : '貴人會晤、團隊協同、梳理關鍵節奏';
      } else if (curGate.name === '景門') {
        level = '次吉';
        score = 81 + ((sIdx + curPal.id) % 5);
        action = '發布公開提案、合約文書審核、展示成果';
      } else if (curGate.name === '死門' || curGate.name === '驚門') {
        level = '謹慎';
        score = 58 + ((sIdx + curPal.id) % 8);
        action = '避開口舌是非、不作重大拍板、沉潛防守';
      } else {
        level = '平穩';
        score = 73 + ((sIdx + curPal.id) % 6);
        action = '穩步推進常規進度，留意細節校對';
      }

      if (score > bestScore) {
        bestScore = score;
        goldenIndex = i;
      }

      simulationList.push({
        stepOffset: i,
        isCurrent: i === 0,
        shichen: shInfo.name,
        range: shInfo.range,
        palaceName: curPal.name,
        palaceDir: curPal.direction,
        gateName: curGate.name,
        gateType: curGate.type,
        level,
        score,
        action,
        isGolden: false
      });
    }

    if (simulationList[goldenIndex]) {
      simulationList[goldenIndex].isGolden = true;
    }

    return {
      curShichenIdx,
      goldenWindow: simulationList[goldenIndex] || simulationList[0],
      timeline: simulationList
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
