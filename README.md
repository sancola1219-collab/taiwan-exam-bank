# 📚 台灣全學段題庫測驗

免費線上題庫測驗網站，涵蓋台灣 **國小、國中、高中、大學** 各科目。
題目由教師依 **108 課綱** 原創編寫（非任何學校真實試題），每題附詳解。

🔗 **線上使用**：https://sancola1219-collab.github.io/taiwan-exam-bank/

## 功能

- 選學段 → 選科目年級 → 選難度與題數 → 線上作答 → 自動改分 + 逐題詳解
- 📒 錯題本：答錯自動收錄，可重考，答對即移除
- 📊 成績紀錄、⏱️ 計時器、🔗 一鍵分享、🌙 深色模式
- 手機、平板、電腦皆可使用，免安裝、免登入、完全免費

## 技術

純靜態網站（HTML/CSS/JS + JSON 題庫），部署於 GitHub Pages。
數學公式以 KaTeX 渲染。個人資料只存在使用者自己的瀏覽器（localStorage）。

## 開發

```bash
node dev-server.js   # 本機預覽 http://localhost:8735
node validate.js     # 驗證題庫格式並產生 data/manifest.json
```

題庫檔：`data/{學段}_{科目}_{年級}.json`，格式見 `docs/design.md`。
