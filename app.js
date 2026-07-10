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
    name: "大學", emoji: "🎓", desc: "共同基礎科目",
    subjects: {
      calculus:   { name: "微積分", grades: [0] },
      physics:    { name: "普通物理", grades: [0] },
      chemistry:  { name: "普通化學", grades: [0] },
      economics:  { name: "經濟學", grades: [0] },
      statistics: { name: "統計學", grades: [0] },
      csintro:    { name: "計算機概論", grades: [0] },
      uenglish:   { name: "大學英文", grades: [0] },
    },
  },
};

const GRADE_LABEL = {
  0: "", 1: "一年級", 2: "二年級", 3: "三年級", 4: "四年級", 5: "五年級", 6: "六年級",
  7: "國一", 8: "國二", 9: "國三", 10: "高一", 11: "高二", 12: "高三",
};
const DIFF_LABEL = { 1: "⭐ 基礎", 2: "⭐⭐ 中等", 3: "⭐⭐⭐ 挑戰" };

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
const K_WRONG = "tb_wrong", K_HISTORY = "tb_history", K_THEME = "tb_theme";

/* ---------- 狀態 ---------- */
const sel = { level: null, subject: null, grade: null, difficulty: "mix", count: 10 };
let session = null;   // { questions, answers, idx, startTime, timerId, mode, title }
let bankCache = {};   // fileKey -> questions

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
    if (m.total) $("home-stats").textContent = `目前題庫共 ${m.total.toLocaleString()} 題，持續擴充中`;
  } catch { /* 離線或本機直接開檔時忽略 */ }
}

/* ---------- 設定頁 ---------- */
function openSetup(levelKey) {
  sel.level = levelKey;
  sel.subject = null;
  sel.grade = null;
  const lv = CATALOG[levelKey];
  $("setup-title").textContent = `${lv.emoji} ${lv.name}測驗`;

  const grid = $("subject-grid");
  grid.innerHTML = "";
  for (const [key, sub] of Object.entries(lv.subjects)) {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = sub.name;
    chip.onclick = () => {
      sel.subject = key;
      sel.grade = null;
      grid.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      renderGradeRow();
    };
    grid.appendChild(chip);
  }
  $("grade-block").hidden = true;
  $("difficulty-block").hidden = true;
  $("count-block").hidden = true;
  refreshStartBtn();
  showScreen("setup");
}
function renderGradeRow() {
  const grades = CATALOG[sel.level].subjects[sel.subject].grades;
  const row = $("grade-row");
  row.innerHTML = "";
  if (grades.length === 1) {
    sel.grade = grades[0];
    $("grade-block").hidden = true;
    renderDifficultyRow();
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
      renderDifficultyRow();
    };
    row.appendChild(chip);
  });
  $("difficulty-block").hidden = true;
  $("count-block").hidden = true;
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
  renderCountRow();
}
function renderCountRow() {
  const row = $("count-row");
  row.innerHTML = "";
  [[5, "5 題"], [10, "10 題"], [15, "15 題"], [20, "20 題"], [Infinity, "全部"]].forEach(([val, label]) => {
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
  refreshStartBtn();
}
function refreshStartBtn() {
  const ready = sel.level && sel.subject && sel.grade !== null && sel.grade !== undefined;
  $("btn-start").disabled = !ready;
  $("start-hint").textContent = ready ? "" : "請先選擇科目與年級";
}

/* ---------- 取得題庫 ---------- */
async function fetchBank(levelKey, subjectKey, grade) {
  const fileKey = `${levelKey}_${subjectKey}_${grade === 0 ? "u" : grade}`;
  if (bankCache[fileKey]) return bankCache[fileKey];
  const res = await fetch(`data/${fileKey}.json`);
  if (!res.ok) throw new Error("題庫載入失敗");
  const bank = await res.json();
  bankCache[fileKey] = bank.questions;
  return bank.questions;
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
  let filtered = sel.difficulty === "mix" ? pool : pool.filter((q) => q.difficulty === sel.difficulty);
  if (!filtered.length) {
    $("start-hint").textContent = "此難度目前沒有題目，請改選「混合」。";
    btn.disabled = false;
    return;
  }
  const n = Math.min(sel.count === Infinity ? filtered.length : sel.count, filtered.length);
  const picked = shuffle(filtered).slice(0, n).map(prepQuestion);
  const meta = { level: sel.level, subject: sel.subject, grade: sel.grade };
  beginSession(picked, quizTitle(sel.level, sel.subject, sel.grade), "normal", meta);
  btn.disabled = false;
  $("start-hint").textContent = "";
}

/* 選項洗牌並重算答案位置 */
function prepQuestion(q) {
  const order = shuffle([0, 1, 2, 3]);
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    answer: order.indexOf(q.answer),
    original: q,          // 保留原題（錯題本存原始版本）
  };
}

function beginSession(questions, title, mode, meta) {
  if (session && session.timerId) clearInterval(session.timerId);
  session = {
    questions, title, mode, meta,
    answers: new Array(questions.length).fill(null),
    idx: 0,
    startTime: Date.now(),
    timerId: setInterval(() => {
      $("quiz-timer").textContent = fmtTime(Math.floor((Date.now() - session.startTime) / 1000));
    }, 500),
  };
  $("quiz-timer").textContent = "00:00";
  $("quiz-meta").textContent = `${title} · 共 ${questions.length} 題`;
  renderQuestion();
  showScreen("quiz");
}

/* ---------- 作答畫面 ---------- */
function renderQuestion() {
  const { questions, answers, idx } = session;
  const q = questions[idx];
  $("q-num").textContent = `第 ${idx + 1} / ${questions.length} 題`;
  $("q-diff").textContent = DIFF_LABEL[q.difficulty] || "";
  $("q-text").textContent = q.question;

  const optBox = $("q-options");
  optBox.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option" + (answers[idx] === i ? " picked" : "");
    btn.innerHTML = `<span class="opt-letter">(${letters[i]})</span><span class="opt-text"></span>`;
    btn.querySelector(".opt-text").textContent = opt;
    btn.onclick = () => {
      answers[idx] = i;
      renderQuestion();
      // 手機體驗：選完自動跳下一題（最後一題除外）
      if (idx < questions.length - 1) setTimeout(() => { session.idx = idx + 1; renderQuestion(); }, 220);
    };
    optBox.appendChild(btn);
  });

  $("btn-prev").disabled = idx === 0;
  const last = idx === questions.length - 1;
  $("btn-next").hidden = last;
  $("btn-submit").hidden = !last;

  const answered = answers.filter((a) => a !== null).length;
  $("progress-fill").style.width = `${(answered / questions.length) * 100}%`;

  const strip = $("numstrip");
  strip.innerHTML = "";
  questions.forEach((_, i) => {
    const c = document.createElement("button");
    c.className = "numchip" + (answers[i] !== null ? " answered" : "") + (i === idx ? " current" : "");
    c.textContent = i + 1;
    c.onclick = () => { session.idx = i; renderQuestion(); };
    strip.appendChild(c);
  });

  renderMath($("q-text"));
  renderMath(optBox);
}

/* ---------- 交卷 ---------- */
function submitQuiz() {
  const un = session.answers.filter((a) => a === null).length;
  if (un > 0 && !confirm(`還有 ${un} 題未作答，確定要交卷嗎？`)) return;
  clearInterval(session.timerId);
  const elapsed = Math.floor((Date.now() - session.startTime) / 1000);

  const { questions, answers } = session;
  let correct = 0;
  const wrongBook = LS.get(K_WRONG, {});
  questions.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    if (ok) correct++;
    if (session.mode === "wrong") {
      if (ok) delete wrongBook[q.original.id];      // 錯題重考答對 → 移除
    } else if (!ok) {
      wrongBook[q.original.id] = { q: q.original, title: session.title, at: Date.now() };
    }
  });
  LS.set(K_WRONG, wrongBook);

  const score = Math.round((correct / questions.length) * 100);
  const history = LS.get(K_HISTORY, []);
  history.unshift({
    at: Date.now(), title: session.title, score, correct,
    total: questions.length, sec: elapsed,
    retake: session.mode === "wrong",
  });
  LS.set(K_HISTORY, history.slice(0, 100));

  renderResult(score, correct, elapsed);
  updateWrongBadge();
  showScreen("result");
}

function renderResult(score, correct, elapsed) {
  const { questions, answers, title, mode } = session;
  $("result-score").textContent = `${score} 分`;
  $("result-sub").textContent = `${title} · 答對 ${correct} / ${questions.length} 題 · 用時 ${fmtTime(elapsed)}`;
  $("result-msg").textContent =
    score === 100 ? "💯 滿分！太厲害了！" :
    score >= 90 ? "🎉 表現優異，繼續保持！" :
    score >= 70 ? "👍 不錯喔，把錯題弄懂就更強了！" :
    score >= 50 ? "💪 及格邊緣，錯題本等你複習！" :
    "📖 別灰心，從錯題本開始一題一題弄懂！";
  const wrongCount = questions.length - correct;
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
        <span class="review-verdict ${ok ? "ok" : "no"}">${ok ? "✔ 答對" : (answers[i] === null ? "－ 未作答" : "✘ 答錯")}</span>
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
  beginSession(picked, "錯題重考", "wrong", null);
}

/* ---------- 成績紀錄 ---------- */
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
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-info">
        ${esc(h.title)}${h.retake ? "（錯題重考）" : ""}<br>
        <span class="history-date">${dateStr} · ${h.correct}/${h.total} 題 · ${fmtTime(h.sec)}</span>
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
