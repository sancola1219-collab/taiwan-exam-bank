# AGENTS.md — 給 AI 助手（Codex / Claude / 其他模型）的專案規格

這份是本專案的**唯一權威技術規格**。任何 AI 助手接手前請完整讀完。
（`CLAUDE.md` 只是指向這裡的捷徑。）

---

## 一、這是什麼專案

「台灣全學段題庫測驗」——一個**純靜態**的線上題庫網站，涵蓋台灣國小、國中、高中、大學。
使用者選學段 → 科目年級 → 挑戰模式 → 作答 → 自動改分 + 逐題詳解。

- 正式網址：<https://sancola1219-collab.github.io/taiwan-exam-bank/>
- GitHub：`sancola1219-collab/taiwan-exam-bank`（`main` 分支，GitHub Pages legacy 建置，root 目錄）
- 本機路徑：`C:\Users\凱凱\Desktop\taiwan-exam-bank`
- 目前規模：**116 個題庫檔、3,598 題，其中 295 題附 SVG 圖**（國小 26 / 國中 22 / 高中 22 / 大學 46 檔）

### 專案使用者是誰
一位台灣的老師。他不寫程式，只會用瀏覽器開網址、把網址分享給別人。
**所有溝通請用繁體中文**，避免術語轟炸，改動完要告訴他「網址不變，重新整理就好」。

---

## 二、技術架構（刻意保持極簡，請勿破壞）

```
taiwan-exam-bank/
├── index.html          # 全部畫面（6 個 <section class="screen">，靠 hidden 切換）
├── style.css           # 全部樣式，CSS 變數 + 深色模式
├── app.js              # 全部邏輯（單檔，無框架、無打包）
├── validate.js         # 題庫驗證工具（node 執行）→ 產生 data/manifest.json
├── dev-server.js       # 本機預覽伺服器（node 執行，port 8735）
├── data/
│   ├── manifest.json   # 自動產生，勿手改
│   └── *.json          # 116 個題庫檔
├── docs/
│   ├── design.md       # 設計文件
│   └── HANDOVER.md     # 專案歷史與交接紀錄
├── AGENTS.md           # 本檔
└── README.md
```

### 鐵則（違反會壞掉）
1. **不引入建置工具、框架、npm 套件**。沒有 `package.json`，沒有 node_modules。
   GitHub Pages 直接吃 repo root 的靜態檔，加了打包流程就得改部署方式。
2. **唯一外部依賴是 KaTeX CDN**（渲染數學式）。不要再加外部依賴。
3. **沒有後端、沒有資料庫、沒有 API 金鑰**。使用者資料（錯題本、成績、已做過的題目、主題）
   全部存在瀏覽器 `localStorage`，key 為 `tb_wrong` / `tb_history` / `tb_seen` / `tb_theme`。
4. **不要碰使用者的其他 repo**：`pdf-translator`、`taiwan-island-life` 與本專案無關。

---

## 三、題庫檔格式（最重要）

檔名規則：`data/{level}_{subject}_{grade}.json`
大學的 grade 一律是數字 `0`，但**檔名用 `u`**（例：`uni_calculus_u.json`）。

```json
{
  "level": "junior",
  "subject": "math",
  "grade": 8,
  "questions": [
    {
      "id": "junior_math_8_001",
      "difficulty": 1,
      "question": "題幹，可含 $LaTeX$",
      "options": ["選項1", "選項2", "選項3", "選項4"],
      "answer": 2,
      "explanation": "詳解：先說明正確答案為何正確，再點出常見錯誤"
    }
  ]
}
```

| 欄位 | 規則 |
|------|------|
| `level` / `subject` / `grade` | 必須與檔名一致，否則 validate.js 報 `[標頭不符]` |
| `id` | `{檔名去掉.json}_{三位流水號}`，全站唯一 |
| `difficulty` | `1`=基礎 `2`=中等 `3`=挑戰。每檔配比 **7 / 7 / 6** 並依序排列 |
| `options` | **恰好 4 個**，互不相同，禁止「以上皆是／皆非」。錯誤選項要是常見失誤的結果 |
| `answer` | 正確選項的**索引 0～3**。整檔中 0/1/2/3 各出現約 5 次 |
| `explanation` | 至少兩句 |
| `figure`（選填） | 題目附圖，值為**單一 inline `<svg>` 字串**。規則見下方「附圖規則」 |

### 附圖（figure）規則
- 必須以 `<svg` 開頭、含 `viewBox`（例 `0 0 240 180`），**不要**寫 width/height（要自適應縮放）。
- 線條/座標軸用 `stroke="currentColor"`、文字用 `fill="currentColor" stroke="none"`（深淺色模式都清楚）。
  需要填色只用中間色（藍 #3b82f6、紅 #ef4444、綠 #22c55e、琥珀 #f59e0b、紫 #a855f7）配 `fill-opacity 0.15~0.3`。
- **嚴禁** `<script>`、`<image>`、`<foreignObject>`、`on*` 事件屬性、外部網址——
  `validate.js` 會擋，前端 `sanitizeFigure()` 也會再過濾一次。
- 圖必須是解題必要或明確輔助，答案要能由「圖＋題幹」唯一決定；不放裝飾圖。
- 在 JSON 字串內，SVG 的雙引號要跳脫為 `\"`。

- 每檔 **20 題**（validate.js 最低要求 18 題）。
- LaTeX 用 `$...$` 包住，`$` 必須成對；JSON 字串裡反斜線要寫兩個（`\\frac`、`\\sqrt`）。
- 國小題目**不要用 LaTeX**，直接用文字寫數字。
- 出題前先想清楚：題目是**原創**的，依 108 課綱（大學則依各系基礎課程）。
  **不得抄襲各校真實試題或教科書課文**（有版權）。引用文言文限公有領域古文。

---

## 四、新增科目的完整流程（最容易踩雷的地方）

**科目 key 必須同時登記在兩個地方，兩邊拼字要完全一致**，否則：
- 只加 `app.js` → 網站選單有這科，但點下去載入失敗
- 只加 `validate.js` → 檔案被驗證，但網站選單看不到
- 兩邊都沒加 → validate.js 會警告「多餘檔案」

### 步驟
1. **寫題庫檔**：`data/{level}_{subject}_{grade}.json`，照上面格式，20 題。
2. **改 `app.js` 的 `CATALOG`**（檔案最上方）：
   ```js
   uni: {
     subjects: {
       your_subject: { name: "科目中文名", grades: [0], group: "資訊學群" },  // 大學要有 group
     }
   }
   ```
   非大學學段不需要 `group` 欄位。
3. **改 `validate.js` 的 `CATALOG`**（同樣在檔案最上方，但只需要 key → 年級陣列）：
   ```js
   uni: { your_subject: [0], ... }
   ```
4. **跑驗證**：`node validate.js`
   - 全過才會重新產生 `data/manifest.json`（含 `total` 總題數）
   - 有錯會列出來並 exit 1，**修到全過為止**
5. **本機實測**：`node dev-server.js` → 開 <http://localhost:8735> 點進新科目考一次。
6. **提交**：`git add -A && git commit -m "..." && git push`
7. **等 1～3 分鐘**讓 GitHub Pages 部署，然後驗證線上是不是真的更新了：
   ```bash
   curl -s "https://sancola1219-collab.github.io/taiwan-exam-bank/data/manifest.json?cb=$RANDOM"
   ```
   看 `total` 有沒有變。**不要只 push 就宣稱完成**。

### 大學現有學群（新增大學科目請歸入其中之一）
理學群、工學群、資訊學群、商管學群、法政學群、醫護學群、人文社科學群、語文學群

---

## 五、三種挑戰模式（`app.js` 的 `MODES`）

| key | 名稱 | 行為 |
|-----|------|------|
| `normal` | 📝 一般練習 | 自選難度與題數，可前後翻題、用號碼列跳題 |
| `rush` | ⚡ 搶答挑戰 | 每題限時 `RUSH_SECONDS`(15) 秒，剩 5 秒倒數變紅；逾時 `answer=null` 判錯並自動換題；作答後立刻揭曉正解（綠）與誤答（紅）；`streak` 累計連對，成績頁顯示最高連對 |
| `stage` | 🏆 闖關模式 | 第 n 關 = 難度 n，每關 `STAGE_SIZE`(5) 題，答對 ≥ `STAGE_PASS`(4) 才晉級，否則只能重打本關；破三關為通關 |

另有內部模式 `wrong`（錯題重考）：答對的題目會從錯題本移除。

### 出題去重機制
`pickQuestions()` 會先抽 `tb_seen` 裡沒出現過的題目，用完才回頭抽做過的。
交卷時 `markSeen()` 記錄本次題目。**這是「題目一直換」需求的實作，不要拿掉。**

### 快取破除
`fetchBank()` 會加 `?v={manifest.generated}-{manifest.total}` 查詢參數。
題庫更新後 `total` 改變 → URL 改變 → 使用者拿到新題而不是瀏覽器舊快取。
**新增題目後一定要重跑 `validate.js` 讓 manifest 更新，否則使用者看不到新題。**

---

## 六、驗證與測試

```bash
node validate.js     # 題庫全檢 + 重生 manifest.json（會 exit 1 如果有錯）
node dev-server.js   # 本機預覽 http://localhost:8735
```

`validate.js` 檢查項目：缺檔、JSON 語法、標頭與檔名一致、題數 ≥18、id 唯一、
difficulty 合法、選項恰 4 個且不重複、answer 索引 0–3、詳解長度、同檔題目不重複、
LaTeX `$` 成對、難度配比、**不在科目清單內的多餘檔案**。

### 手動測試清單（改動 app.js 後請跑過）
- [ ] 首頁四個學段都能進入，大學顯示 8 個學群標題
- [ ] 一般練習：選項可選、可前後翻題、交卷後顯示分數與逐題詳解
- [ ] 搶答：倒數會動、逾時自動換題並判錯、答對顯示綠色、連對數字會累加
- [ ] 闖關：第 1 關全難度 1；答對 3/5 顯示「重新挑戰本關」；答對 4+ 顯示「前往下一關」
- [ ] 錯題本：答錯的題目進得去、重考答對後會消失
- [ ] 手機寬度（375px）不會左右捲動

---

## 七、常見陷阱（前人踩過的）

1. **平行出題會撞檔**：多個 agent 同時寫 `data/`，可能寫出檔名不符規格的檔
   （如 `uni_linearalgebra_u.json` vs 正版 `uni_linalg_u.json`）。
   `validate.js` 的「多餘檔案」警告就是為此而設。發現後：確認正版存在且題數足夠 → 刪除重複檔；
   若是有價值的新科目 → 改成正確檔名 + 修正 `subject` 與 `id` + 登記到兩份 CATALOG。
2. **同一檔內出現重複題目**：曾發生同一份國語檔出了兩題一樣的「下列哪一句使用了擬人法？」。
   `validate.js` 會抓，但出題時就該避免。
3. **`session` 是 `app.js` 的 top-level `let`**，在瀏覽器 console 可直接讀取，方便除錯。
4. **交卷確認框**：`submitQuiz()` 有未作答時會跳原生 `confirm()`，自動化測試會被卡住。
   測試時直接呼叫 `finishQuiz()` 繞過。
5. **git 沒設全域 identity**：本 repo 已設 local `user.name` / `user.email`，不要動。
6. **不要把測試留下的 localStorage 資料留著**：測完清 `tb_seen`/`tb_wrong`/`tb_history`。

---

## 八、待辦與可能的下一步

使用者提過但尚未實作的想法：
- **列印考卷模式**：選好範圍後產生可列印版面（題目在前、解答在後），給老師出紙本考卷。
- 持續擴充題庫（每檔目前 20 題，可加到 40、60 題）。
- 高三物理/化學（目前高中理化只到高二）、更多大學科目。

實作任何新功能前，請先讀 `docs/design.md` 了解既有決策。
