"use strict";

/* ============================================================
 * 台灣全學段題庫測驗 — 主程式
 * 純前端、無後端；個人資料存 localStorage
 * ============================================================ */

/* ---------- 題庫目錄 ---------- */
const CATALOG = {
  elem: {
    name: "國小", emoji: "🎒", desc: "1～6 年級",
    subjects: {
      mandarin: { name: "國語", grades: [1, 2, 3, 4, 5, 6] },
      math:     { name: "數學", grades: [1, 2, 3, 4, 5, 6] },
      life:     { name: "生活", grades: [1, 2] },
      english:  { name: "英語", grades: [3, 4, 5, 6] },
      science:  { name: "自然", grades: [3, 4, 5, 6] },
      social:   { name: "社會", grades: [3, 4, 5, 6] },
    },
  },
  junior: {
    name: "國中", emoji: "📘", desc: "國一～國三",
    subjects: {
      chinese:   { name: "國文", grades: [7, 8, 9] },
      english:   { name: "英文", grades: [7, 8, 9] },
      math:      { name: "數學", grades: [7, 8, 9] },
      biology:   { name: "生物", grades: [7] },
      physchem:  { name: "理化", grades: [8, 9] },
      earth:     { name: "地球科學", grades: [9] },
      history:   { name: "歷史", grades: [7, 8, 9] },
      geography: { name: "地理", grades: [7, 8, 9] },
      civics:    { name: "公民", grades: [7, 8, 9] },
    },
  },
  senior: {
    name: "高中", emoji: "🏫", desc: "高一～高三",
    subjects: {
      chinese:   { name: "國文", grades: [10, 11, 12] },
      english:   { name: "英文", grades: [10, 11, 12] },
      math:      { name: "數學", grades: [10, 11, 12] },
      physics:   { name: "物理", grades: [10, 11] },
      chemistry: { name: "化學", grades: [10, 11] },
      biology:   { name: "生物", grades: [10, 11] },
      earth:     { name: "地球科學", grades: [10] },
      history:   { name: "歷史", grades: [10, 11] },
      geography: { name: "地理", grades: [10, 11] },
      civics:    { name: "公民與社會", grades: [10, 11] },
    },
  },
  uni: {
    name: "大學", emoji: "🎓", desc: "8 大學群 · 46 科",
    grouped: true,
    subjects: {
      /* 理學群 */
      calculus:    { name: "微積分",     grades: [0], group: "理學群" },
      linalg:      { name: "線性代數",   grades: [0], group: "理學群" },
      statistics:  { name: "統計學",     grades: [0], group: "理學群" },
      physics:     { name: "普通物理",   grades: [0], group: "理學群" },
      chemistry:   { name: "普通化學",   grades: [0], group: "理學群" },
      organic_chem:{ name: "有機化學",   grades: [0], group: "理學群" },
      biology:     { name: "生物學",     grades: [0], group: "理學群" },
      earth_sci:   { name: "地球科學",   grades: [0], group: "理學群" },
      /* 工學群 */
      engmath:       { name: "工程數學",   grades: [0], group: "工學群" },
      statics:       { name: "靜力學",     grades: [0], group: "工學群" },
      thermodynamics:{ name: "熱力學",     grades: [0], group: "工學群" },
      fluidmech:     { name: "流體力學",   grades: [0], group: "工學群" },
      materials:     { name: "材料科學",   grades: [0], group: "工學群" },
      circuits:      { name: "電路學",     grades: [0], group: "工學群" },
      /* 資訊學群 */
      csintro:       { name: "計算機概論", grades: [0], group: "資訊學群" },
      programming:   { name: "程式設計",   grades: [0], group: "資訊學群" },
      datastructure: { name: "資料結構",   grades: [0], group: "資訊學群" },
      database:      { name: "資料庫系統", grades: [0], group: "資訊學群" },
      network:       { name: "計算機網路", grades: [0], group: "資訊學群" },
      os:            { name: "作業系統",   grades: [0], group: "資訊學群" },
      algorithm:     { name: "演算法",     grades: [0], group: "資訊學群" },
      discrete:      { name: "離散數學",   grades: [0], group: "資訊學群" },
      /* 商管學群 */
      economics:  { name: "經濟學原理",   grades: [0], group: "商管學群" },
      macroecon:  { name: "總體經濟學",   grades: [0], group: "商管學群" },
      accounting: { name: "會計學",       grades: [0], group: "商管學群" },
      management: { name: "管理學",       grades: [0], group: "商管學群" },
      marketing:  { name: "行銷學",       grades: [0], group: "商管學群" },
      finance:    { name: "財務管理",     grades: [0], group: "商管學群" },
      /* 法政學群 */
      law_intro:      { name: "法學緒論", grades: [0], group: "法政學群" },
      civil_law:      { name: "民法概要", grades: [0], group: "法政學群" },
      criminal_law:   { name: "刑法概要", grades: [0], group: "法政學群" },
      constitution:   { name: "憲法",     grades: [0], group: "法政學群" },
      politics:       { name: "政治學",   grades: [0], group: "法政學群" },
      publicadmin:    { name: "公共行政", grades: [0], group: "法政學群" },
      intl_relations: { name: "國際關係", grades: [0], group: "法政學群" },
      /* 醫護學群 */
      anatomy:      { name: "解剖生理學", grades: [0], group: "醫護學群" },
      nutrition:    { name: "營養學",     grades: [0], group: "醫護學群" },
      pharmacology: { name: "藥理學",     grades: [0], group: "醫護學群" },
      publichealth: { name: "公共衛生",   grades: [0], group: "醫護學群" },
      /* 人文社科學群 */
      psychology:  { name: "心理學",     grades: [0], group: "人文社科學群" },
      sociology:   { name: "社會學",     grades: [0], group: "人文社科學群" },
      philosophy:  { name: "哲學概論",   grades: [0], group: "人文社科學群" },
      education:   { name: "教育學概論", grades: [0], group: "人文社科學群" },
      env_science: { name: "環境科學",   grades: [0], group: "人文社科學群" },
      /* 語文學群 */
      uenglish: { name: "大學英文",   grades: [0], group: "語文學群" },
      japanese: { name: "基礎日語",   grades: [0], group: "語文學群" },
    },
  },
};

const GRADE_LABEL = {
  0: "", 1: "一年級", 2: "二年級", 3: "三年級", 4: "四年級", 5: "五年級", 6: "六年級",
  7: "國一", 8: "國二", 9: "國三", 10: "高一", 11: "高二", 12: "高三",
};
const DIFF_LABEL = { 1: "⭐ 基礎", 2: "⭐⭐ 中等", 3: "⭐⭐⭐ 挑戰" };

/* ---------- 模式 ---------- */
const MODES = {
  normal: { name: "📝 一般練習", desc: "自選難度與題數，可前後翻題、慢慢想" },
  rush:   { name: "⚡ 搶答挑戰", desc: "每題限時 15 秒，逾時算錯，連續答對有加分" },
  stage:  { name: "🏆 闖關模式", desc: "基礎→中等→挑戰三關，每關 5 題答對 4 題才能晉級" },
};
const RUSH_SECONDS = 15;
const STAGE_SIZE = 5;      // 每關題數
const STAGE_PASS = 4;      // 過關門檻

/* ---------- localStorage ---------- */
const LS = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 私密模式可能失敗，忽略 */ }
  },
};
const K_WRONG = "tb_wrong", K_HISTORY = "tb_history", K_THEME = "tb_theme", K_SEEN = "tb_seen";

/* ---------- 狀態 ---------- */
const sel = { level: null, subject: null, grade: null, difficulty: "mix", count: 10, mode: "normal" };
let session = null;
let bankCache = {};
let dataVersion = "1";   // 由 manifest 帶入，題庫更新時自動破快取

/* ---------- 小工具 ---------- */
const $ = (id) => document.getElementById(id);
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function renderMath(el) {
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    } catch { /* 數學式渲染失敗時保留原文字 */ }
  }
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function fmtTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}
function quizTitle(levelKey, subjectKey, grade) {
  const lv = CATALOG[levelKey];
  const sub = lv.subjects[subjectKey];
  return grade ? `${lv.name}${sub.name}（${GRADE_LABEL[grade]}）` : `${lv.name}${sub.name}`;
}

/* ---------- 畫面切換 ---------- */
const SCREENS = ["home", "setup", "quiz", "result", "wrongbook", "history"];
function showScreen(name) {
  SCREENS.forEach((s) => { $("screen-" + s).hidden = s !== name; });
  window.scrollTo(0, 0);
}

/* ---------- 主題 ---------- */
function applyTheme(theme) {
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
  $("btn-theme").textContent =
    (theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark" ? "☀️" : "🌙";
}
function toggleTheme() {
  const cur = document.documentElement.dataset.theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = cur === "dark" ? "light" : "dark";
  LS.set(K_THEME, next);
  applyTheme(next);
}

/* ---------- 首頁 ---------- */
function renderHome() {
  const grid = $("level-grid");
  grid.innerHTML = "";
  for (const [key, lv] of Object.entries(CATALOG)) {
    const card = document.createElement("button");
    card.className = "level-card";
    card.innerHTML = `<span class="level-emoji">${lv.emoji}</span>
      <span class="level-name">${lv.name}</span>
      <div class="level-desc">${lv.desc}</div>`;
    card.onclick = () => openSetup(key);
    grid.appendChild(card);
  }
  updateWrongBadge();
}
async function loadStats() {
  try {
    const res = await fetch("data/manifest.json");
    if (!res.ok) return;
    const m = await res.json();
    if (m.generated) dataVersion = `${m.generated}-${m.total}`;
    if (m.total) $("home-stats").textContent = `目前題庫共 ${m.total.toLocaleString()} 題，持續擴充中`;
  } catch { /* 離線時忽略 */ }
}

/* ---------- 設定頁 ---------- */
function openSetup(levelKey) {
  sel.level = levelKey;
  sel.subject = null;
  sel.grade = null;
  const lv = CATALOG[levelKey];
  $("setup-title").textContent = `${lv.emoji} ${lv.name}測驗`;
  renderSubjectGrid(lv);
  $("grade-block").hidden = true;
  $("mode-block").hidden = true;
  $("difficulty-block").hidden = true;
  $("count-block").hidden = true;
  refreshStartBtn();
  showScreen("setup");
}

function renderSubjectGrid(lv) {
  const box = $("subject-grid");
  box.innerHTML = "";
  const pickSubject = (key, chip) => {
    sel.subject = key;
    sel.grade = null;
    box.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    renderGradeRow();
  };
  const makeChip = (key, sub) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = sub.name;
    chip.onclick = () => pickSubject(key, chip);
    return chip;
  };

  if (!lv.grouped) {
    const grid = document.createElement("div");
    grid.className = "chip-grid";
    for (const [key, sub] of Object.entries(lv.subjects)) grid.appendChild(makeChip(key, sub));
    box.appendChild(grid);
    return;
  }
  /* 大學：依學群分區顯示 */
  const groups = {};
  for (const [key, sub] of Object.entries(lv.subjects)) {
    (groups[sub.group] ||= []).push([key, sub]);
  }
  for (const [groupName, items] of Object.entries(groups)) {
    const h = document.createElement("div");
    h.className = "group-title";
    h.textContent = `${groupName}（${items.length} 科）`;
    box.appendChild(h);
    const grid = document.createElement("div");
    grid.className = "chip-grid";
    items.forEach(([key, sub]) => grid.appendChild(makeChip(key, sub)));
    box.appendChild(grid);
  }
}

function renderGradeRow() {
  const grades = CATALOG[sel.level].subjects[sel.subject].grades;
  const row = $("grade-row");
  row.innerHTML = "";
  if (grades.length === 1) {
    sel.grade = grades[0];
    $("grade-block").hidden = true;
    renderModeRow();
    return;
  }
  $("grade-block").hidden = false;
  grades.forEach((g) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = GRADE_LABEL[g];
    chip.onclick = () => {
      sel.grade = g;
      row.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      renderModeRow();
    };
    row.appendChild(chip);
  });
  $("mode-block").hidden = true;
  $("difficulty-block").hidden = true;
  $("count-block").hidden = true;
  refreshStartBtn();
}

function renderModeRow() {
  const row = $("mode-row");
  row.innerHTML = "";
  for (const [key, m] of Object.entries(MODES)) {
    const card = document.createElement("button");
    card.className = "mode-card" + (sel.mode === key ? " selected" : "");
    card.innerHTML = `<div class="mode-name">${m.name}</div><div class="mode-desc">${m.desc}</div>`;
    card.onclick = () => {
      sel.mode = key;
      row.querySelectorAll(".mode-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      applyModeVisibility();
    };
    row.appendChild(card);
  }
  $("mode-block").hidden = false;
  applyModeVisibility();
}
function applyModeVisibility() {
  if (sel.mode === "stage") {
    $("difficulty-block").hidden = true;
    $("count-block").hidden = true;
  } else {
    renderDifficultyRow();
    renderCountRow();
  }
  refreshStartBtn();
}

function renderDifficultyRow() {
  const row = $("difficulty-row");
  row.innerHTML = "";
  const opts = [["mix", "🔀 混合"], ["1", DIFF_LABEL[1]], ["2", DIFF_LABEL[2]], ["3", DIFF_LABEL[3]]];
  opts.forEach(([val, label]) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (String(sel.difficulty) === val ? " selected" : "");
    chip.textContent = label;
    chip.onclick = () => {
      sel.difficulty = val === "mix" ? "mix" : Number(val);
      row.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
    };
    row.appendChild(chip);
  });
  $("difficulty-block").hidden = false;
}
function renderCountRow() {
  const row = $("count-row");
  row.innerHTML = "";
  [[5, "5 題"], [10, "10 題"], [15, "15 題"], [20, "20 題"]].forEach(([val, label]) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (sel.count === val ? " selected" : "");
    chip.textContent = label;
    chip.onclick = () => {
      sel.count = val;
      row.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
    };
    row.appendChild(chip);
  });
  $("count-block").hidden = false;
}
function refreshStartBtn() {
  const ready = sel.level && sel.subject && sel.grade !== null && sel.grade !== undefined;
  $("btn-start").disabled = !ready;
  $("btn-start").textContent = sel.mode === "stage" ? "開始闖關 🏆" : (sel.mode === "rush" ? "開始搶答 ⚡" : "開始測驗 ▶");
  $("start-hint").textContent = ready ? "" : "請先選擇科目與年級";
}

/* ---------- 取得題庫 ---------- */
async function fetchBank(levelKey, subjectKey, grade) {
  const fileKey = `${levelKey}_${subjectKey}_${grade === 0 ? "u" : grade}`;
  if (bankCache[fileKey]) return bankCache[fileKey];
  const res = await fetch(`data/${fileKey}.json?v=${encodeURIComponent(dataVersion)}`);
  if (!res.ok) throw new Error("題庫載入失敗");
  const bank = await res.json();
  bankCache[fileKey] = bank.questions;
  return bank.questions;
}

/* ---------- 出題：優先出沒做過的題目 ---------- */
function pickQuestions(pool, n) {
  const seen = new Set(LS.get(K_SEEN, []));
  const fresh = shuffle(pool.filter((q) => !seen.has(q.id)));
  const old = shuffle(pool.filter((q) => seen.has(q.id)));
  return fresh.concat(old).slice(0, n);
}
function markSeen(questions) {
  const seen = LS.get(K_SEEN, []);
  const set = new Set(seen);
  questions.forEach((q) => set.add(q.original.id));
  LS.set(K_SEEN, [...set].slice(-5000));
}

/* 選項洗牌並重算答案位置 */
function prepQuestion(q) {
  const order = shuffle([0, 1, 2, 3]);
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    answer: order.indexOf(q.answer),
    original: q,
  };
}

/* ---------- 開始測驗 ---------- */
async function startQuiz() {
  const btn = $("btn-start");
  btn.disabled = true;
  $("start-hint").textContent = "題庫載入中…";
  let pool;
  try {
    pool = await fetchBank(sel.level, sel.subject, sel.grade);
  } catch {
    $("start-hint").textContent = "⚠️ 題庫載入失敗，請確認網路連線後再試一次。";
    btn.disabled = false;
    return;
  }
  const meta = { level: sel.level, subject: sel.subject, grade: sel.grade };
  const title = quizTitle(sel.level, sel.subject, sel.grade);
  btn.disabled = false;
  $("start-hint").textContent = "";

  if (sel.mode === "stage") {
    startStage(pool, title, meta, 1);
    return;
  }
  const filtered = sel.difficulty === "mix" ? pool : pool.filter((q) => q.difficulty === sel.difficulty);
  if (!filtered.length) {
    $("start-hint").textContent = "此難度目前沒有題目，請改選「混合」。";
    return;
  }
  const n = Math.min(sel.count, filtered.length);
  beginSession(pickQuestions(filtered, n).map(prepQuestion), title, sel.mode, meta, pool);
}

/* 闖關：第 n 關 = 難度 n */
function startStage(pool, title, meta, stageNo) {
  const filtered = pool.filter((q) => q.difficulty === stageNo);
  if (filtered.length < 1) {
    alert("此科目題數不足，無法闖關，請改用一般練習。");
    showScreen("setup");
    return;
  }
  const n = Math.min(STAGE_SIZE, filtered.length);
  const qs = pickQuestions(filtered, n).map(prepQuestion);
  beginSession(qs, title, "stage", meta, pool, stageNo);
}

function beginSession(questions, title, mode, meta, pool, stageNo) {
  if (session && session.timerId) clearInterval(session.timerId);
  session = {
    questions, title, mode, meta, pool,
    stageNo: stageNo || 0,
    answers: new Array(questions.length).fill(null),
    idx: 0,
    locked: false,
    streak: 0,
    bestStreak: 0,
    startTime: Date.now(),
    qDeadline: 0,
    timerId: setInterval(tick, 200),
  };
  $("quiz-timer").textContent = mode === "rush" ? `${RUSH_SECONDS}` : "00:00";
  $("quiz-timer").classList.toggle("countdown", mode === "rush");
  $("streak-tag").hidden = mode !== "rush";
  $("numstrip").hidden = mode === "rush";
  $("btn-prev").hidden = mode === "rush";

  const stageTag = $("stage-tag");
  stageTag.hidden = mode !== "stage";
  if (mode === "stage") stageTag.textContent = `第 ${stageNo} 關 · ${DIFF_LABEL[stageNo]}（答對 ${STAGE_PASS}/${questions.length} 過關）`;

  $("quiz-meta").textContent = `${title} · 共 ${questions.length} 題`;
  renderQuestion();
  showScreen("quiz");
}

function tick() {
  if (!session) return;
  if (session.mode === "rush") {
    if (session.locked) return;
    const left = Math.max(0, Math.ceil((session.qDeadline - Date.now()) / 1000));
    const el = $("quiz-timer");
    el.textContent = String(left);
    el.classList.toggle("urgent", left <= 5);
    if (left <= 0) rushLock(null);
  } else {
    $("quiz-timer").textContent = fmtTime(Math.floor((Date.now() - session.startTime) / 1000));
  }
}

/* ---------- 作答畫面 ---------- */
function renderQuestion() {
  const { questions, answers, idx, mode } = session;
  const q = questions[idx];
  session.locked = false;
  $("q-num").textContent = `第 ${idx + 1} / ${questions.length} 題`;
  $("q-diff").textContent = DIFF_LABEL[q.difficulty] || "";
  $("q-text").textContent = q.question;

  if (mode === "rush") {
    session.qDeadline = Date.now() + RUSH_SECONDS * 1000;
    $("quiz-timer").textContent = String(RUSH_SECONDS);
    $("quiz-timer").classList.remove("urgent");
    $("streak-tag").textContent = session.streak >= 2 ? `🔥 連對 ${session.streak}` : "";
  }

  const optBox = $("q-options");
  optBox.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option" + (answers[idx] === i ? " picked" : "");
    btn.dataset.i = i;
    btn.innerHTML = `<span class="opt-letter">(${letters[i]})</span><span class="opt-text"></span>`;
    btn.querySelector(".opt-text").textContent = opt;
    btn.onclick = () => {
      if (session.locked) return;
      if (mode === "rush") { rushLock(i); return; }
      answers[idx] = i;
      renderQuestion();
      if (idx < questions.length - 1) setTimeout(() => { session.idx = idx + 1; renderQuestion(); }, 220);
    };
    optBox.appendChild(btn);
  });

  $("btn-prev").disabled = idx === 0;
  const last = idx === questions.length - 1;
  $("btn-next").hidden = last || mode === "rush";
  $("btn-submit").hidden = !last || mode === "rush";

  const answered = answers.filter((a) => a !== null).length;
  $("progress-fill").style.width = `${(answered / questions.length) * 100}%`;

  if (mode !== "rush") {
    const strip = $("numstrip");
    strip.innerHTML = "";
    questions.forEach((_, i) => {
      const c = document.createElement("button");
      c.className = "numchip" + (answers[i] !== null ? " answered" : "") + (i === idx ? " current" : "");
      c.textContent = i + 1;
      c.onclick = () => { session.idx = i; renderQuestion(); };
      strip.appendChild(c);
    });
  }

  renderMath($("q-text"));
  renderMath(optBox);
}

/* 搶答：鎖定作答 → 立即顯示對錯 → 自動下一題 */
function rushLock(picked) {
  const { questions, idx } = session;
  const q = questions[idx];
  session.locked = true;
  session.answers[idx] = picked;
  const ok = picked === q.answer;
  session.streak = ok ? session.streak + 1 : 0;
  session.bestStreak = Math.max(session.bestStreak, session.streak);

  $("q-options").querySelectorAll(".option").forEach((btn) => {
    const i = Number(btn.dataset.i);
    btn.classList.add("locked");
    if (i === q.answer) btn.classList.add("reveal-correct");
    else if (i === picked) btn.classList.add("reveal-wrong");
  });
  $("streak-tag").textContent = ok
    ? (session.streak >= 2 ? `🔥 連對 ${session.streak}` : "✔ 答對")
    : (picked === null ? "⏰ 逾時" : "✘ 答錯");

  setTimeout(() => {
    if (!session) return;
    if (idx < questions.length - 1) { session.idx = idx + 1; renderQuestion(); }
    else finishQuiz();
  }, ok ? 700 : 1100);
}

/* ---------- 交卷 ---------- */
function submitQuiz() {
  const un = session.answers.filter((a) => a === null).length;
  if (un > 0 && !confirm(`還有 ${un} 題未作答，確定要交卷嗎？`)) return;
  finishQuiz();
}

function finishQuiz() {
  clearInterval(session.timerId);
  const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
  const { questions, answers, mode } = session;

  let correct = 0;
  const wrongBook = LS.get(K_WRONG, {});
  questions.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    if (ok) correct++;
    if (mode === "wrong") {
      if (ok) delete wrongBook[q.original.id];
    } else if (!ok) {
      wrongBook[q.original.id] = { q: q.original, title: session.title, at: Date.now() };
    }
  });
  LS.set(K_WRONG, wrongBook);
  markSeen(questions);

  const score = Math.round((correct / questions.length) * 100);
  const history = LS.get(K_HISTORY, []);
  history.unshift({
    at: Date.now(), title: session.title, score, correct, total: questions.length, sec: elapsed,
    mode, stageNo: session.stageNo, retake: mode === "wrong",
  });
  LS.set(K_HISTORY, history.slice(0, 100));

  session.correct = correct;
  session.score = score;
  session.elapsed = elapsed;
  session.stagePassed = mode === "stage" && correct >= Math.min(STAGE_PASS, questions.length);

  renderResult();
  updateWrongBadge();
  showScreen("result");
}

function renderResult() {
  const { questions, answers, title, mode, correct, score, elapsed, stageNo, stagePassed, bestStreak } = session;
  $("result-score").textContent = `${score} 分`;
  let sub = `${title} · 答對 ${correct} / ${questions.length} 題 · 用時 ${fmtTime(elapsed)}`;
  if (mode === "rush" && bestStreak >= 2) sub += ` · 最高連對 ${bestStreak} 題 🔥`;
  if (mode === "stage") sub = `${title} · 第 ${stageNo} 關 · 答對 ${correct} / ${questions.length} 題`;
  $("result-sub").textContent = sub;

  if (mode === "stage") {
    $("result-msg").textContent = stagePassed
      ? (stageNo >= 3 ? "🏆 三關全破，你是這科的王者！" : `🎉 第 ${stageNo} 關通過！準備迎接第 ${stageNo + 1} 關`)
      : `😤 差一點！答對 ${STAGE_PASS} 題才能過關，再挑戰一次`;
  } else {
    $("result-msg").textContent =
      score === 100 ? "💯 滿分！太厲害了！" :
      score >= 90 ? "🎉 表現優異，繼續保持！" :
      score >= 70 ? "👍 不錯喔，把錯題弄懂就更強了！" :
      score >= 50 ? "💪 及格邊緣，錯題本等你複習！" :
      "📖 別灰心，從錯題本開始一題一題弄懂！";
  }

  /* 按鈕組合依模式切換 */
  const wrongCount = questions.length - correct;
  $("btn-next-stage").hidden = !(mode === "stage" && stagePassed && stageNo < 3);
  $("btn-retry-stage").hidden = !(mode === "stage" && !stagePassed);
  $("btn-retry").hidden = mode === "stage";
  $("result-note").textContent =
    mode === "wrong"
      ? (wrongCount ? `還有 ${wrongCount} 題留在錯題本，繼續加油！` : "🎊 錯題全部過關，錯題本清空了！")
      : (wrongCount ? `${wrongCount} 題已加入錯題本 📒，可隨時重考。` : "");

  const list = $("review-list");
  list.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  questions.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    const item = document.createElement("div");
    item.className = "review-item " + (ok ? "correct" : "wrong");
    let optsHtml = "";
    q.options.forEach((opt, j) => {
      const cls =
        j === q.answer ? "review-opt is-answer" :
        j === answers[i] ? "review-opt is-picked-wrong" : "review-opt";
      const mark = j === q.answer ? " ✔" : (j === answers[i] ? " ✘ 你的答案" : "");
      optsHtml += `<div class="${cls}">(${letters[j]}) ${esc(opt)}${mark}</div>`;
    });
    item.innerHTML = `
      <div class="review-head">
        <span>第 ${i + 1} 題 · ${DIFF_LABEL[q.difficulty] || ""}</span>
        <span class="review-verdict ${ok ? "ok" : "no"}">${ok ? "✔ 答對" : (answers[i] === null ? "⏰ 未作答" : "✘ 答錯")}</span>
      </div>
      <div class="review-q">${esc(q.question)}</div>
      ${optsHtml}
      <div class="review-exp"><b>【詳解】</b>${esc(q.explanation)}</div>`;
    list.appendChild(item);
  });
  renderMath(list);
}

/* ---------- 分享 ---------- */
async function shareResult() {
  const scoreText = $("result-score").textContent;
  const subText = $("result-sub").textContent;
  const text = `我在「台灣全學段題庫」完成測驗：${subText}，拿到 ${scoreText}！一起來挑戰 👉`;
  const url = location.href.split("#")[0];
  if (navigator.share) {
    try { await navigator.share({ title: "台灣全學段題庫", text, url }); return; } catch { /* 使用者取消 */ }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    alert("已複製成績與網址，可以貼給朋友了！");
  } catch {
    prompt("複製這段文字分享給朋友：", `${text} ${url}`);
  }
}

/* ---------- 錯題本 ---------- */
function updateWrongBadge() {
  const n = Object.keys(LS.get(K_WRONG, {})).length;
  const b = $("wrong-badge");
  b.hidden = n === 0;
  b.textContent = n > 99 ? "99+" : n;
}
function renderWrongbook() {
  const wrongBook = LS.get(K_WRONG, {});
  const entries = Object.values(wrongBook).sort((a, b) => b.at - a.at);
  const list = $("wrong-list");
  list.innerHTML = "";
  $("btn-retake-wrong").disabled = entries.length === 0;
  if (!entries.length) {
    list.innerHTML = `<p class="empty-note">錯題本是空的 🎉<br>作答時答錯的題目會自動收進來。</p>`;
    showScreen("wrongbook");
    return;
  }
  const letters = ["A", "B", "C", "D"];
  entries.forEach((e) => {
    const q = e.q;
    const item = document.createElement("div");
    item.className = "review-item wrong";
    let optsHtml = "";
    q.options.forEach((opt, j) => {
      optsHtml += `<div class="review-opt ${j === q.answer ? "is-answer" : ""}">(${letters[j]}) ${esc(opt)}${j === q.answer ? " ✔" : ""}</div>`;
    });
    item.innerHTML = `
      <div class="review-head"><span>${esc(e.title)} · ${DIFF_LABEL[q.difficulty] || ""}</span></div>
      <div class="review-q">${esc(q.question)}</div>
      ${optsHtml}
      <div class="review-exp"><b>【詳解】</b>${esc(q.explanation)}</div>`;
    list.appendChild(item);
  });
  renderMath(list);
  showScreen("wrongbook");
}
function retakeWrong() {
  const entries = Object.values(LS.get(K_WRONG, {}));
  if (!entries.length) return;
  const picked = shuffle(entries).slice(0, 50).map((e) => prepQuestion(e.q));
  beginSession(picked, "錯題重考", "wrong", null, null);
}

/* ---------- 成績紀錄 ---------- */
const MODE_TAG = { rush: "⚡搶答", stage: "🏆闖關", wrong: "📒重考", normal: "" };
function renderHistory() {
  const history = LS.get(K_HISTORY, []);
  const list = $("history-list");
  list.innerHTML = "";
  if (!history.length) {
    list.innerHTML = `<p class="empty-note">還沒有測驗紀錄，快去考第一份吧！</p>`;
    showScreen("history");
    return;
  }
  history.forEach((h) => {
    const d = new Date(h.at);
    const dateStr = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const cls = h.score >= 80 ? "good" : h.score < 60 ? "bad" : "";
    const tag = MODE_TAG[h.mode || (h.retake ? "wrong" : "normal")] || "";
    const stage = h.mode === "stage" ? `第${h.stageNo}關 ` : "";
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-info">
        ${esc(h.title)} ${tag ? `<span class="mode-tag">${tag}</span>` : ""}<br>
        <span class="history-date">${stage}${dateStr} · ${h.correct}/${h.total} 題 · ${fmtTime(h.sec)}</span>
      </div>
      <div class="history-score ${cls}">${h.score}</div>`;
    list.appendChild(item);
  });
  showScreen("history");
}

/* ---------- 事件繫結 ---------- */
function bind() {
  $("btn-home").onclick = () => { if (leaveQuizOk()) showScreen("home"); };
  $("btn-theme").onclick = toggleTheme;
  $("btn-wrongbook").onclick = () => { if (leaveQuizOk()) renderWrongbook(); };
  $("btn-history").onclick = () => { if (leaveQuizOk()) renderHistory(); };
  $("setup-back").onclick = () => showScreen("home");
  $("btn-start").onclick = startQuiz;
  $("quiz-quit").onclick = () => {
    if (confirm("確定要離開測驗嗎？本次作答不會計分。")) {
      clearInterval(session.timerId);
      session = null;
      showScreen("home");
    }
  };
  $("btn-prev").onclick = () => { session.idx--; renderQuestion(); };
  $("btn-next").onclick = () => { session.idx++; renderQuestion(); };
  $("btn-submit").onclick = submitQuiz;
  $("btn-share").onclick = shareResult;
  $("btn-next-stage").onclick = () => startStage(session.pool, session.title, session.meta, session.stageNo + 1);
  $("btn-retry-stage").onclick = () => startStage(session.pool, session.title, session.meta, session.stageNo);
  $("btn-retry").onclick = () => {
    if (session.mode === "wrong") retakeWrong();
    else if (session.meta) {
      sel.level = session.meta.level; sel.subject = session.meta.subject; sel.grade = session.meta.grade;
      startQuiz();
    }
  };
  $("btn-result-home").onclick = () => showScreen("home");
  $("wrong-back").onclick = () => showScreen("home");
  $("history-back").onclick = () => showScreen("home");
  $("btn-retake-wrong").onclick = retakeWrong;
  $("btn-clear-wrong").onclick = () => {
    if (confirm("確定要清空錯題本嗎？")) { LS.set(K_WRONG, {}); updateWrongBadge(); renderWrongbook(); }
  };
  $("btn-clear-history").onclick = () => {
    if (confirm("確定要清空所有成績紀錄嗎？")) { LS.set(K_HISTORY, []); renderHistory(); }
  };
}
function leaveQuizOk() {
  if (!$("screen-quiz").hidden && session) {
    if (!confirm("測驗進行中，確定要離開嗎？本次作答不會計分。")) return false;
    clearInterval(session.timerId);
    session = null;
  }
  return true;
}

/* ---------- 啟動 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(LS.get(K_THEME, null));
  bind();
  renderHome();
  loadStats();
  showScreen("home");
});
