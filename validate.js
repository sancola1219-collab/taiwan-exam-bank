"use strict";
/* 題庫驗證工具：node validate.js
 * 檢查 data/*.json 格式與內容品質，全部通過後產生 data/manifest.json */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

/* 期望的檔案清單（與 app.js CATALOG 一致） */
const CATALOG = {
  elem: {
    mandarin: [1, 2, 3, 4, 5, 6], math: [1, 2, 3, 4, 5, 6], life: [1, 2],
    english: [3, 4, 5, 6], science: [3, 4, 5, 6], social: [3, 4, 5, 6],
  },
  junior: {
    chinese: [7, 8, 9], english: [7, 8, 9], math: [7, 8, 9], biology: [7],
    physchem: [8, 9], earth: [9], history: [7, 8, 9], geography: [7, 8, 9], civics: [7, 8, 9],
  },
  senior: {
    chinese: [10, 11, 12], english: [10, 11, 12], math: [10, 11, 12],
    physics: [10, 11], chemistry: [10, 11], biology: [10, 11], earth: [10],
    history: [10, 11], geography: [10, 11], civics: [10, 11],
  },
  uni: {
    /* 理學群 */
    calculus: [0], linalg: [0], statistics: [0], physics: [0],
    chemistry: [0], organic_chem: [0], biology: [0], earth_sci: [0],
    /* 工學群 */
    engmath: [0], statics: [0], thermodynamics: [0], fluidmech: [0],
    materials: [0], circuits: [0],
    /* 資訊學群 */
    csintro: [0], programming: [0], datastructure: [0], database: [0],
    network: [0], os: [0], algorithm: [0], discrete: [0],
    /* 商管學群 */
    economics: [0], macroecon: [0], accounting: [0], management: [0],
    marketing: [0], finance: [0],
    /* 法政學群 */
    law_intro: [0], civil_law: [0], criminal_law: [0], constitution: [0],
    politics: [0], publicadmin: [0], intl_relations: [0],
    /* 醫護學群 */
    anatomy: [0], nutrition: [0], pharmacology: [0], publichealth: [0],
    /* 人文社科學群 */
    psychology: [0], sociology: [0], philosophy: [0], education: [0], env_science: [0],
    /* 語文學群 */
    uenglish: [0], japanese: [0],
  },
};

const expectedFiles = [];
for (const [level, subjects] of Object.entries(CATALOG)) {
  for (const [subject, grades] of Object.entries(subjects)) {
    for (const g of grades) {
      expectedFiles.push({ level, subject, grade: g, file: `${level}_${subject}_${g === 0 ? "u" : g}.json` });
    }
  }
}

const MIN_QUESTIONS = 18;   // 每檔至少題數
let errors = [], warnings = [];
const manifest = { generated: new Date().toISOString().slice(0, 10), total: 0, files: {} };
const allIds = new Set();
let present = 0;

for (const exp of expectedFiles) {
  const fp = path.join(DATA_DIR, exp.file);
  if (!fs.existsSync(fp)) { errors.push(`[缺檔] ${exp.file}`); continue; }
  present++;

  let bank;
  try { bank = JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch (e) { errors.push(`[JSON壞掉] ${exp.file}: ${e.message}`); continue; }

  if (bank.level !== exp.level || bank.subject !== exp.subject || Number(bank.grade) !== exp.grade) {
    errors.push(`[標頭不符] ${exp.file}: level/subject/grade 與檔名不一致`);
  }
  if (!Array.isArray(bank.questions)) { errors.push(`[格式] ${exp.file}: 缺 questions 陣列`); continue; }
  if (bank.questions.length < MIN_QUESTIONS) {
    errors.push(`[題數不足] ${exp.file}: 只有 ${bank.questions.length} 題（需 ≥ ${MIN_QUESTIONS}）`);
  }

  const seenText = new Set();
  const diffCount = { 1: 0, 2: 0, 3: 0 };
  let figCount = 0;
  bank.questions.forEach((q, i) => {
    const tag = `${exp.file} 第${i + 1}題`;
    if (!q.id || typeof q.id !== "string") errors.push(`[缺id] ${tag}`);
    else if (allIds.has(q.id)) errors.push(`[id重複] ${tag}: ${q.id}`);
    else allIds.add(q.id);

    if (![1, 2, 3].includes(q.difficulty)) errors.push(`[難度錯誤] ${tag}: difficulty=${q.difficulty}`);
    else diffCount[q.difficulty]++;

    if (typeof q.question !== "string" || q.question.trim().length < 5) errors.push(`[題幹太短] ${tag}`);
    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`[選項數量錯誤] ${tag}`);
    else {
      q.options.forEach((o, j) => {
        if (typeof o !== "string" || !o.trim()) errors.push(`[空選項] ${tag} 選項${j + 1}`);
      });
      const uniq = new Set(q.options.map((o) => String(o).trim()));
      if (uniq.size !== 4) errors.push(`[選項重複] ${tag}`);
    }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(`[答案索引錯誤] ${tag}: answer=${q.answer}`);
    if (typeof q.explanation !== "string" || q.explanation.trim().length < 10) errors.push(`[詳解太短] ${tag}`);

    const key = String(q.question).replace(/\s+/g, "");
    if (seenText.has(key)) errors.push(`[題目重複] ${tag}`);
    seenText.add(key);

    /* LaTeX 分隔符號需成對 */
    const dollars = (String(q.question) + q.options.join("") + String(q.explanation)).split("$").length - 1;
    if (dollars % 2 !== 0) warnings.push(`[LaTeX $ 不成對] ${tag}`);

    /* 附圖（選填）：僅接受自製 inline SVG */
    if (q.figure !== undefined) {
      const fig = String(q.figure);
      if (!/^\s*<svg[\s>]/i.test(fig)) errors.push(`[附圖非SVG] ${tag}`);
      else {
        figCount++;
        const open = (fig.match(/<svg[\s>]/gi) || []).length;
        const close = (fig.match(/<\/svg>/gi) || []).length;
        if (open !== close) errors.push(`[附圖SVG標籤不成對] ${tag}`);
        if (!/viewBox\s*=/i.test(fig)) warnings.push(`[附圖缺viewBox] ${tag}（可能無法縮放）`);
        if (/<script|<foreignObject|<image|\son[a-z]+\s*=|javascript:/i.test(fig))
          errors.push(`[附圖含危險內容] ${tag}（script/image/事件/js）`);
        if (fig.length > 12000) warnings.push(`[附圖過大] ${tag}（${fig.length} 字元）`);
      }
    }
  });

  if (diffCount[1] < 4 || diffCount[2] < 4 || diffCount[3] < 3) {
    warnings.push(`[難度配比] ${exp.file}: ⭐${diffCount[1]} ⭐⭐${diffCount[2]} ⭐⭐⭐${diffCount[3]}（建議至少 7/7/6）`);
  }

  manifest.files[exp.file] = bank.questions.length;
  manifest.total += bank.questions.length;
  manifest.figures = (manifest.figures || 0) + figCount;
}

/* 目錄中不在期望清單內的多餘 JSON（例如檔名拼錯的殘留檔） */
const expectedNames = new Set(expectedFiles.map((e) => e.file).concat(["manifest.json"]));
const strays = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && !expectedNames.has(f));
strays.forEach((f) => warnings.push(`[多餘檔案] ${f}（不在科目清單中，網站不會載入，建議刪除）`));

console.log(`檔案：${present}/${expectedFiles.length}　總題數：${manifest.total}　圖片題：${manifest.figures || 0}`);
if (warnings.length) {
  console.log(`\n⚠️ 警告 ${warnings.length} 項：`);
  warnings.slice(0, 40).forEach((w) => console.log("  " + w));
}
if (errors.length) {
  console.log(`\n❌ 錯誤 ${errors.length} 項：`);
  errors.slice(0, 80).forEach((e) => console.log("  " + e));
  process.exit(1);
}
fs.writeFileSync(path.join(DATA_DIR, "manifest.json"), JSON.stringify(manifest, null, 1), "utf8");
console.log("✅ 全部通過，已產生 data/manifest.json");
