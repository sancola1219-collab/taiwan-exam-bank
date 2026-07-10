# 台灣全學段線上題庫測驗 — 設計文件

日期：2026-07-10
狀態：已與使用者確認並核准

## 目標

一個純靜態、免費、可分享的線上題庫測驗網站，涵蓋台灣國小到大學，
部署於 GitHub Pages（帳號 sancola1219-collab，新 repo `taiwan-exam-bank`，
不動 pdf-translator 與 taiwan-island-life）。手機與電腦皆可用。

## 已確認的決策

1. **題目來源**：教師原創題庫（依 108 課綱編寫，非各校真題，無版權問題）。
2. **使用情境**：線上互動測驗（作答 → 自動改分 → 詳解）。
3. **大學範圍**：共同基礎科目（微積分、普物、普化、經濟、統計、計概、大學英文）。

## 架構

- 純靜態網站：`index.html` + `style.css` + `app.js` + `data/*.json`
- 無後端、無 API 金鑰、無費用；數學式以 KaTeX（CDN）渲染
- 個人資料（錯題本、成績紀錄、主題偏好）存於瀏覽器 localStorage

## 題庫結構

每個「學段_科目_年級」一個 JSON 檔，共 77 檔、每檔 20 題
（難度 ⭐7 題、⭐⭐7 題、⭐⭐⭐6 題），合計約 1,540 題。

題目格式：

```json
{
  "level": "junior", "subject": "math", "grade": 8,
  "questions": [
    {
      "id": "junior_math_8_001",
      "difficulty": 2,
      "question": "題幹（可含 $LaTeX$）",
      "options": ["選項一", "選項二", "選項三", "選項四"],
      "answer": 0,
      "explanation": "詳解"
    }
  ]
}
```

## 科目總表

- 國小 elem：國語 mandarin 1–6、數學 math 1–6、生活 life 1–2、
  英語 english 3–6、自然 science 3–6、社會 social 3–6（26 檔）
- 國中 junior：國文 chinese、英文 english、數學 math、歷史 history、
  地理 geography、公民 civics（各 7–9）；生物 biology 7、理化 physchem 8–9、
  地球科學 earth 9（22 檔）
- 高中 senior：國文、英文、數學（10–12）；物理 physics、化學 chemistry、
  生物 biology、歷史、地理、公民與社會 civics（10–11）；地球科學 earth 10（22 檔）
- 大學 uni（grade 0）：calculus、physics、chemistry、economics、
  statistics、csintro、uenglish（7 檔）

## 功能

選學段 → 選科目年級 → 選難度（混合/1/2/3）與題數 → 逐題作答（可前後移動）
→ 交卷自動改分 → 成績＋逐題詳解。
加值：錯題本（可重考、答對即移除）、計時器、成績紀錄、一鍵分享、深色模式、
題目與選項隨機排序。

## 品質把關

`validate.js`（Node）檢查：JSON 合法、欄位齊全、答案索引 0–3、四個選項、
難度配比、題目不重複、id 唯一，並產生 `data/manifest.json`（各檔題數與總題數）。

## 部署

`gh repo create taiwan-exam-bank --public` → push → 開啟 GitHub Pages（main / root）
→ 驗證 https://sancola1219-collab.github.io/taiwan-exam-bank/ 可用。
