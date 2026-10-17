# 奇門遁甲 桌面法陣呈現模組 (Desktop Formation v1)

本模組為 Antigravity 依據 `ANTIGRAVITY_PROMPT.md` 規範製作之**獨立桌面法陣呈現模組**。
沿用 `E:\占卜` 之黑金法陣視覺風格（透視地面、多層盤環、粒子與光柱），完全對齊 `scene-contract.ts` 與 `chart-types.ts` 固定接口，交由 Codex 進行 React 封裝與主專案整合。

---

## 🌟 模組核心特點

1. **純前端零外部依賴**：
   - 採用無依賴原創 ES Module (`src/qimen-scene.js`) 與獨立 CSS (`src/qimen-scene.css`)。
   - 不新增 Three.js、外部動畫庫、CDN 或外部字型下載，純原創程序 Canvas 2D 透視繪圖與語意化可訪問 DOM。
2. **真盤資料唯讀呈顯**：
   - 不包含任何模擬排盤、雜湊抽籤、加分演算法或角色台詞。
   - 所有符號（九宮、八門、九星、八神、奇儀、寄干）完全取自傳入之 `Chart` 資料結構。
   - 中五宮如實呈顯輸入值，其無獨立門星神（顯示為「—」），寄干取自 `hostedEarth` 與 `hostedHeaven`，不另造寄宮演算法。
3. **精準六秒時序裝飾動畫**：
   - 0–600ms：`center`（中心凝聚）
   - 600–1400ms：`expand`（向外展環）
   - 1400–4800ms：`directions`（八方啟動：9 → 2 → 7 → 6 → 1 → 8 → 3 → 4，每 420ms 啟動一方）
   - 4800–5100ms：`resonance`（全陣共鳴）
   - 5100–5800ms：`complete`（局成，穩定可讀）
   - 5800–6000ms：退場過渡
   - 6000ms：結算為 `interactive`（互動作盤模式）
4. **易用性與無障礙 (Accessibility)**：
   - 固定方位：南上北下、東左西右。文字保持直立，不隨盤環轉動。
   - 九宮按鈕支援鍵盤導航（Tab / Enter / Space），具有 `aria-label` 與 `aria-pressed`。
   - 支援 `prefers-reduced-motion` 與 `setReducedMotion()`，啟用時立即顯示靜態互動盤，無高頻閃爍或光流。
   - 提供無障礙略過按鈕（或鍵盤 `Esc`），點擊立即跳至互動盤。

---

## 🚀 檔案結構

```text
desktop-formation-v1/
  README.md                  啟動方式、入口、環境、限制
  src/qimen-scene.js          API 完整 ES module 實作
  src/qimen-scene.css         .qm-scene 前綴封裝樣式表
  scene-contract.ts          原接口型別定義
  chart-types.ts             原資料結構型別定義
  demo.html                  獨立可播放 Demo 頁面
  fixtures/*.json            四份原資料樣本 (未改寫，SHA 核對吻合)
  FIXTURE_PROVENANCE.json    原始來源紀錄
  tests/run-suite.mjs        自動化測試與採樣腳本
  evidence/screenshots/      雙尺寸 6 階段真實瀏覽器截圖 (共 12 張 PNG)
  evidence/animation.webm    完整正常速度桌面播放錄影 (2.4MB)
  evidence/test-report.json  實測數據報告與通過狀態
  evidence/commands.json     執行命令環境與日誌
  evidence/stdout/           原始 stdout 執行日誌
  evidence/stderr/           原始 stderr 執行日誌
  CHANGES.md                 變更清單、技術方法與限制
  SHA256SUMS.json            每個交付檔案 SHA-256 清單
```

---

## 🛠️ 本機啟動方式

本模組為靜態 ES Module，可透過任何本機 HTTP 伺服器啟動：

```bash
# 使用 Python 內建伺服器 (推薦)
cd E:\占卜\antigravity-delivery\desktop-formation-v1
python -m http.server 8899

# 或使用 Node.js
npx serve -l 8899 .
```

開啟瀏覽器造訪：
**`http://localhost:8899/demo.html`**

---

## 🧪 實測驗收結果摘要

- **樣本書實核對**：4 / 4 通過（SHA256 吻合、9 宮完整、中五無門星神如實呈現）
- **接口功能測試**：9 / 9 通過（setChart, play, skip, reduced-motion 初始/動態, abort, rapid replay, unmount/remount, palace select callback prevention）
- **效能抽樣數據**（雙尺寸各 5 次正常播放）：
  - 1920×1080：平均耗時 ~6031ms（目標 ≤6500ms），p95 影格間隔 30.8~41.5ms（目標 <50ms），>100ms 影格比例 0.0%
  - 1366×768：平均耗時 ~6020ms（目標 ≤6500ms），p95 影格間隔 24.6~25.8ms（目標 <50ms），>100ms 影格比例 0.0%
- **截圖與錄影**：12 張實際 PNG 截圖與 1 份完整 WebM 錄影已存於 `evidence/`

---

## ⚠️ 限制與邊界條件

1. 本模組聚焦於桌面版 1920×1080 與 1366×768 兩尺寸之驗收，未包含手機版專屬佈局（依交接約定交由 Codex 整合保留手機既有行為）。
2. 不含任何排盤算法，所有符號與局象數據嚴格依賴外部 `Chart` 傳入。
