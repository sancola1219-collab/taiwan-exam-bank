# CLAUDE.md

**請先完整閱讀 [`AGENTS.md`](AGENTS.md)** — 那是本專案唯一權威的技術規格，
內容包含架構鐵則、題庫檔格式、新增科目流程、三種挑戰模式的實作、測試清單與已知陷阱。

以下只是最容易出錯的三件事，細節一律以 `AGENTS.md` 為準：

1. **新增科目時，`app.js` 的 `CATALOG` 與 `validate.js` 的 `CATALOG` 必須同步登記，
   subject key 拼字要完全一致**，否則科目不是載入失敗就是根本不顯示。

2. **改完題庫一定要跑 `node validate.js`**。它會全檢並重新產生 `data/manifest.json`；
   前端靠 manifest 的 `total` 破瀏覽器快取，不跑的話使用者拿到的還是舊題。

3. **push 後不算完成**。要等 GitHub Pages 部署（1～3 分鐘），
   再抓一次線上 `data/manifest.json` 確認 `total` 真的變了，才能跟使用者說更新好了。

專案是純靜態網站，**不要引入框架、打包工具或 npm 套件**。
使用者是一位不寫程式的台灣老師，**請用繁體中文溝通**。
