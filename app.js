// ============================================================
//  ✅ Disiplin Harian — 1 halaman full
//  • Checklist kotak-kotak (grid hari × kegiatan, kesamping)
//  • Statistik: ring progres + diagram lingkaran + diagram batang
//  • Kegiatan fleksibel: tambah / ubah / hapus langsung di tabel
//  localStorage:
//    disc-v2-activities / disc-v2-log / disc-v2-schedule
// ============================================================

const PALETTE = ["#4f46e5", "#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#84cc16"];

const DEFAULT_ACTIVITIES = [
  { id: "workout",  icon: "🏋️", name: "Workout",               targetMin: 90,  required: true,  color: "#f97316" },
  { id: "trading",  icon: "📈", name: "Trading",               targetMin: 240, required: true,  color: "#22c55e" },
  { id: "charting", icon: "🕯️", name: "Belajar Charting",      targetMin: 135, required: true,  color: "#a855f7" },
  { id: "news",     icon: "📰", name: "Baca News",             targetMin: 90,  required: true,  color: "#3b82f6" },
  { id: "bahasa",   icon: "🌍", name: "Belajar Bahasa",        targetMin: 135, required: true,  color: "#eab308" },
  { id: "meditasi", icon: "🧘", name: "Meditasi & Mindset",    targetMin: 15,  required: true,  color: "#06b6d4" },
  { id: "baca",     icon: "📚", name: "Baca Buku",             targetMin: 45,  required: true,  color: "#f43f5e" },
  { id: "review",   icon: "📝", name: "Review & Refleksi",     targetMin: 45,  required: true,  color: "#ec4899" },
  { id: "routine",  icon: "🌤️", name: "Rutinitas & Istirahat", targetMin: 165, required: false, color: "#64748b" },
];

// Data jadwal lama — panel UI sudah dihapus, tetap disimpan & ikut ekspor JSON
// sehingga bisa dikembalikan kapan saja.
const DEFAULT_SCHEDULE = [
  { s: "06:00", e: "06:45", cat: "routine",  label: "Rutinitas pagi (mandi & persiapan)" },
  { s: "06:45", e: "07:30", cat: "workout",  label: "Workout pagi" },
  { s: "07:30", e: "07:45", cat: "meditasi", label: "Meditasi & mindset" },
  { s: "07:45", e: "08:15", cat: "routine",  label: "Sarapan" },
  { s: "08:15", e: "09:00", cat: "bahasa",   label: "Belajar bahasa — sesi 1" },
  { s: "09:00", e: "09:15", cat: "routine",  label: "Persiapan trading & kalender ekonomi" },
  { s: "09:15", e: "11:15", cat: "trading",  label: "Trading sesi 1 (2 jam)" },
  { s: "11:15", e: "12:00", cat: "news",     label: "Baca news & market update" },
  { s: "12:00", e: "12:45", cat: "routine",  label: "Makan siang & istirahat" },
  { s: "12:45", e: "13:30", cat: "charting", label: "Charting blok 1" },
  { s: "13:30", e: "14:15", cat: "charting", label: "Charting blok 2" },
  { s: "14:15", e: "15:00", cat: "charting", label: "Charting blok 3" },
  { s: "15:00", e: "17:00", cat: "trading",  label: "Trading sesi 2 (2 jam)" },
  { s: "17:00", e: "17:45", cat: "news",     label: "Baca news sore" },
  { s: "17:45", e: "18:30", cat: "workout",  label: "Workout sore" },
  { s: "18:30", e: "19:00", cat: "routine",  label: "Makan maghrib" },
  { s: "19:00", e: "19:45", cat: "bahasa",   label: "Belajar bahasa — sesi 2" },
  { s: "19:45", e: "20:30", cat: "baca",     label: "Baca buku" },
  { s: "20:30", e: "21:15", cat: "bahasa",   label: "Belajar bahasa — sesi 3" },
  { s: "21:15", e: "22:00", cat: "review",   label: "Review jurnal & refleksi" },
];

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const LS = {
  act: "disc-v2-activities",
  log: "disc-v2-log",
  sched: "disc-v2-schedule",
  v1: "discipline-log-v1",
};

// ===== State =====
let activities = loadJSON(LS.act) || clone(DEFAULT_ACTIVITIES);
let schedule = loadJSON(LS.sched) || clone(DEFAULT_SCHEDULE);
let log = loadJSON(LS.log);
if (!log) log = migrateV1();

let curMonth = new Date();
curMonth.setDate(1);

// ===== Util =====
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function $(id) { return document.getElementById(id); }
function pad(n) { return String(n).padStart(2, "0"); }

function toKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function fromKey(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function todayKey() { return toKey(new Date()); }

function addDaysKey(k, n) {
  const d = fromKey(k);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

function fmtMin(m) {
  m = Math.round(m);
  const h = Math.floor(m / 60), mm = m % 60;
  if (h > 0) return mm > 0 ? `${h}j ${mm}m` : `${h}j`;
  return `${mm}m`;
}

function loadJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

function saveAct() { localStorage.setItem(LS.act, JSON.stringify(activities)); flashSave(); }
function saveLog() { localStorage.setItem(LS.log, JSON.stringify(log)); flashSave(); }
function saveSched() { localStorage.setItem(LS.sched, JSON.stringify(schedule)); flashSave(); }

// Migrasi data lama (menit) -> centang (boolean)
function migrateV1() {
  const v1 = loadJSON(LS.v1);
  const out = {};
  if (v1 && typeof v1 === "object") {
    for (const [dateKey, mins] of Object.entries(v1)) {
      const set = {};
      for (const [id, m] of Object.entries(mins || {})) if (Number(m) > 0) set[id] = true;
      if (Object.keys(set).length) out[dateKey] = set;
    }
  }
  return out;
}

function requiredActs() { return activities.filter((a) => a.required); }
function reqTargetTotal() { return requiredActs().reduce((s, a) => s + a.targetMin, 0); }
function getAct(id) { return activities.find((a) => a.id === id); }

function isChecked(dateKey, id) { return !!(log[dateKey] && log[dateKey][id]); }

function toggle(dateKey, id, force) {
  const on = force !== undefined ? !!force : !isChecked(dateKey, id);
  if (on) {
    if (!log[dateKey]) log[dateKey] = {};
    log[dateKey][id] = true;
  } else if (log[dateKey]) {
    delete log[dateKey][id];
    if (!Object.keys(log[dateKey]).length) delete log[dateKey];
  }
  saveLog();
}

function hasData(key) { const d = log[key]; return d && Object.keys(d).length > 0; }

function dayDoneCount(key) {
  const d = log[key] || {};
  return requiredActs().filter((a) => d[a.id]).length;
}

function dayReqMinutes(key) {
  const d = log[key] || {};
  return requiredActs().reduce((s, a) => s + (d[a.id] ? a.targetMin : 0), 0);
}

// Skor harian berbasis menit
function dayPct(key) {
  const total = reqTargetTotal();
  if (!total) return 0;
  return Math.min(100, Math.round((dayReqMinutes(key) / total) * 100));
}

function flashSave() {
  const el = $("save-status");
  el.textContent = "✓ Tersimpan";
  el.classList.add("show");
  clearTimeout(flashSave._t);
  flashSave._t = setTimeout(() => el.classList.remove("show"), 1400);
}

function daysElapsed(month) {
  const now = new Date();
  const y = month.getFullYear(), m = month.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) return 0;
  if (y === now.getFullYear() && m === now.getMonth()) return now.getDate();
  return dim;
}

function daysInMonth(month) {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
}

function level(pct, has) {
  if (!has) return 0;
  if (pct >= 100) return 4;
  if (pct >= 80) return 3;
  if (pct >= 50) return 2;
  return 1;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ============================================================
//  CHECKLIST KOTAK-KOTAK (grid ke samping)
// ============================================================
function renderMatrix() {
  const y = curMonth.getFullYear(), m = curMonth.getMonth();
  $("month-label2").textContent = `${MONTHS[m]} ${y}`;

  const dim = daysInMonth(curMonth);
  const elapsed = daysElapsed(curMonth);
  const today = todayKey();
  const table = $("matrix");

  let html = "<thead><tr><th class='kname'>Kegiatan</th>";
  for (let d = 1; d <= dim; d++) {
    const dow = new Date(y, m, d).getDay();
    const weekend = dow === 0 || dow === 6 ? " weekend" : "";
    const key = `${y}-${pad(m + 1)}-${pad(d)}`;
    html += `<th class="day${weekend}${key === today ? " tcol" : ""}" title="${DOW[dow]}, ${d} ${MONTHS[m]}">${d}</th>`;
  }
  html += "<th class='sum'>Σ</th></tr></thead><tbody>";

  for (const a of activities) {
    let checks = 0;
    html += `<tr><td class="kname">` +
      `<span class="dot" style="background:${a.color}"></span>` +
      `<input class="name-input" data-a="${a.id}" value="${escapeHtml(a.name)}" maxlength="60" title="Nama kegiatan — klik untuk ubah">` +
      `<input class="tgt-input" data-a="${a.id}" type="number" value="${a.targetMin}" min="5" max="1440" step="5" title="Target menit/hari — klik untuk ubah">` +
      `<button class="row-del act-del" data-a="${a.id}" title="Hapus kegiatan">🗑</button></td>`;
    for (let d = 1; d <= dim; d++) {
      const key = `${y}-${pad(m + 1)}-${pad(d)}`;
      const on = isChecked(key, a.id);
      const future = key > today;
      if (on) checks++;
      html += `<td class="mcell${key === today ? " tcol" : ""}">` +
        `<button class="cell${on ? " on" : ""}" data-d="${key}" data-a="${a.id}"` +
        `${future ? " disabled" : ""} title="${escapeHtml(a.name)} • ${key}">${on ? "✓" : ""}</button></td>`;
    }
    html += `<td class="sum">${checks}${elapsed ? "/" + elapsed : ""}</td></tr>`;
  }

  // Baris input di ujung tabel — tambah kegiatan baru (ala Excel)
  html += `<tr class="addrow"><td class="kname addcell">` +
    `<input id="row-name" class="name-input" placeholder="Kegiatan baru…" maxlength="60" title="Nama kegiatan baru — tekan Enter atau tombol + untuk menambah">` +
    `<input id="row-target" class="tgt-input" type="number" value="45" min="5" max="1440" step="5" title="Target menit/hari">` +
    `<button class="primary-mini act-add" title="Tambah kegiatan">+</button></td>` +
    `<td class="addfill" colspan="${dim + 1}"></td></tr>` +
    `</tbody><tfoot><tr><th class='kname'>Σ / hari</th>`;

  for (let d = 1; d <= dim; d++) {
    const key = `${y}-${pad(m + 1)}-${pad(d)}`;
    const dset = log[key];
    const n = dset ? Object.keys(dset).length : 0;
    html += `<td>${n || ""}</td>`;
  }
  const monthTotal = Object.keys(log)
    .filter((k) => k.startsWith(`${y}-${pad(m + 1)}`))
    .reduce((s, k) => s + Object.keys(log[k]).length, 0);
  html += `<td>${monthTotal}</td></tr></tfoot>`;

  table.innerHTML = html;
}

function deleteActivity(id) {
  const a = getAct(id);
  if (!a) return;
  if (!confirm(`Hapus kegiatan "${a.name}"?\nCentangannya ikut dihapus dari checklist & statistik.`)) return;
  activities = activities.filter((x) => x.id !== id);
  for (const k of Object.keys(log)) {
    if (log[k]) {
      delete log[k][id];
      if (!Object.keys(log[k]).length) delete log[k];
    }
  }
  saveAct();
  saveLog();
  renderAll();
}

function addActivityFromRow() {
  const nameEl = $("row-name");
  const tgtEl = $("row-target");
  const name = nameEl.value.trim();
  if (!name) { nameEl.focus(); return; }
  const target = Math.max(5, Math.min(1440, Math.round(Number(tgtEl.value) || 45)));

  activities.push({
    id: "act-" + Date.now(),
    icon: "🎯",
    name: name.slice(0, 60),
    targetMin: target,
    required: true,
    color: PALETTE[activities.length % PALETTE.length],
  });
  saveAct();
  renderAll();

  const el = $("row-name");
  if (el) el.focus();
}

$("matrix").addEventListener("click", (e) => {
  if (e.target.closest(".act-add")) { addActivityFromRow(); return; }
  const delBtn = e.target.closest(".act-del");
  if (delBtn) { deleteActivity(delBtn.dataset.a); return; }

  const cell = e.target.closest(".cell");
  if (!cell || cell.disabled) return;
  toggle(cell.dataset.d, cell.dataset.a);
  const sl = $("grid-scroll").scrollLeft;
  renderMatrix();
  renderStats();
  $("grid-scroll").scrollLeft = sl;
});

// Edit inline: nama & target langsung di kolom Kegiatan
$("matrix").addEventListener("change", (e) => {
  const t = e.target;
  const a = t.dataset.a ? getAct(t.dataset.a) : null;
  if (!a) return;

  if (t.classList.contains("name-input")) {
    const v = t.value.trim();
    if (!v) { t.value = a.name; return; }
    a.name = v.slice(0, 60);
    t.value = a.name;
    saveAct();
    renderStats();
    return;
  }

  if (t.classList.contains("tgt-input")) {
    const n = Math.round(Number(t.value));
    a.targetMin = Number.isFinite(n) && n >= 5 && n <= 1440 ? n : a.targetMin;
    t.value = a.targetMin;
    saveAct();
    renderStats();
  }
});

// Enter = tambah kegiatan dari baris input
$("matrix").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.target.id === "row-name" || e.target.id === "row-target")) {
    e.preventDefault();
    addActivityFromRow();
  }
});

// ============================================================
//  STATISTIK — ring, diagram lingkaran, diagram batang
// ============================================================
function renderStats() {
  const y = curMonth.getFullYear(), m = curMonth.getMonth();
  $("month-label").textContent = `${MONTHS[m]} ${y}`;

  const dim = daysInMonth(curMonth);
  const elapsed = daysElapsed(curMonth);
  const req = requiredActs();

  const keys = [];
  for (let d = 1; d <= dim; d++) keys.push(`${y}-${pad(m + 1)}-${pad(d)}`);

  // Akumulasi + menit per kegiatan
  const actMin = {};
  let monthMinutes = 0, monthChecks = 0, loggedDays = 0;
  for (const k of keys) {
    const d = log[k];
    if (!d) continue;
    const done = req.filter((a) => d[a.id]);
    if (done.length) loggedDays++;
    for (const a of done) {
      actMin[a.id] = (actMin[a.id] || 0) + a.targetMin;
      monthMinutes += a.targetMin;
      monthChecks++;
    }
  }

  const possibleMin = reqTargetTotal() * elapsed;
  const progressPct = possibleMin ? Math.min(100, Math.round((monthMinutes / possibleMin) * 100)) : 0;

  // Ring progres bulanan
  $("ring-pct").textContent = progressPct + "%";
  $("ring-progres").style.background =
    `conic-gradient(var(--accent) ${progressPct}%, #e8eaee ${progressPct}%)`;

  // Streak: hari berturut >= 50% (berbasis menit)
  let streak = 0;
  let k = todayKey();
  if (dayPct(k) < 50) k = addDaysKey(k, -1);
  while (dayPct(k) >= 50) { streak++; k = addDaysKey(k, -1); }

  // Kartu ringkasan
  const t = todayKey();
  const todayPct = dayPct(t);
  $("summary-grid").innerHTML = `
    <div class="summary-card">
      <div class="big">${todayPct}%</div>
      <div class="lbl">✅ Skor hari ini</div>
      <div class="sub">${dayDoneCount(t)}/${req.length} kegiatan</div>
    </div>
    <div class="summary-card">
      <div class="big">${progressPct}%</div>
      <div class="lbl">📊 Progres bulanan</div>
      <div class="sub">${fmtMin(monthMinutes)} / ${fmtMin(possibleMin)}</div>
    </div>
    <div class="summary-card">
      <div class="big">${(monthMinutes / 60).toFixed(1)} j</div>
      <div class="lbl">⏱️ Akumulasi</div>
      <div class="sub">${monthChecks} centang</div>
    </div>
    <div class="summary-card">
      <div class="big">${streak} hari</div>
      <div class="lbl">🔥 Streak ≥ 50%</div>
      <div class="sub">${loggedDays}/${dim} hari tercatat</div>
    </div>`;

  // ===== Diagram lingkaran (donut) — progres 0–100% =====
  // Busur terisi sesuai progres menuju target (penuh = 100%),
  // terbagi per kegiatan; sisa busur abu-abu.
  const progressFrac = possibleMin ? Math.min(1, monthMinutes / possibleMin) : 0;
  const filledDeg = progressFrac * 360;
  let acc = 0;
  const stops = [];
  const legendItems = [];
  for (const a of req) {
    const mins = actMin[a.id] || 0;
    if (!mins) continue;
    const start = (acc / monthMinutes) * filledDeg;
    acc += mins;
    const end = (acc / monthMinutes) * filledDeg;
    stops.push(`${a.color} ${start}deg ${end}deg`);
    const pct = Math.round((mins / monthMinutes) * 100);
    legendItems.push(
      `<li><span class="dot" style="background:${a.color}"></span>` +
      `<span class="nm">${escapeHtml(a.name)}</span>` +
      `<span class="hh">${fmtMin(mins)} · ${pct}%</span></li>`);
  }
  if (stops.length && filledDeg < 360) stops.push(`#e8eaee ${filledDeg}deg 360deg`);
  $("donut-dist").style.background =
    stops.length ? `conic-gradient(${stops.join(", ")})` : "#e8eaee";
  $("donut-total").textContent = progressPct + "%";
  $("donut-time").textContent = (monthMinutes / 60).toFixed(1) + "j";
  $("donut-legend").innerHTML = legendItems.length
    ? legendItems.join("")
    : `<li class="muted">Belum ada data bulan ini — centang kotak di sebelah kiri.</li>`;

  // ===== Diagram batang skor harian =====
  const db = $("daybars");
  db.innerHTML = "";
  for (const key of keys) {
    const has = hasData(key);
    const pct = dayPct(key);
    const wrap = document.createElement("div");
    wrap.className = "daybar-wrap";
    wrap.title = has ? `${key} — skor ${pct}%` : `${key} — belum dicatat`;

    const bar = document.createElement("div");
    bar.className = `daybar lvl-${level(pct, has)}`;
    bar.style.height = has ? Math.max(4, pct) + "%" : "3px";
    if (!has) bar.style.opacity = "0.4";

    const num = document.createElement("span");
    num.className = "daybar-num";
    num.textContent = Number(key.slice(-2));

    wrap.append(bar, num);
    db.appendChild(wrap);
  }

  // ===== Akumulasi per kegiatan =====
  const cb = $("cat-bars");
  cb.innerHTML = "";
  if (!elapsed) {
    $("cat-bars-note").textContent = "Bulan belum dimulai — belum ada hari berjalan.";
  } else {
    for (const a of req) {
      let checks = 0;
      for (let d = 1; d <= elapsed; d++) {
        if (isChecked(`${y}-${pad(m + 1)}-${pad(d)}`, a.id)) checks++;
      }
      const pct = Math.round((checks / elapsed) * 100);
      const row = document.createElement("div");
      row.className = "catbar-row";
      row.innerHTML = `
        <div class="catbar-head">
          <span>${escapeHtml(a.name)}</span>
          <span class="val">${checks}/${elapsed} hari • ${fmtMin(checks * a.targetMin)}</span>
        </div>
        <div class="catbar-track">
          <div class="catbar-fill" style="width:${Math.min(100, pct)}%;background:${a.color}"></div>
        </div>`;
      cb.appendChild(row);
    }
    $("cat-bars-note").textContent =
      `Akumulasi dari ${elapsed} hari berjalan • target harian wajib ${fmtMin(reqTargetTotal())}.`;
  }
}

// ============================================================
//  Navigasi bulan
// ============================================================
function changeMonth(n) {
  curMonth.setMonth(curMonth.getMonth() + n);
  renderMatrix();
  renderStats();
}

$("prev-month2").addEventListener("click", () => changeMonth(-1));
$("next-month2").addEventListener("click", () => changeMonth(1));

// ============================================================
//  Render semua
// ============================================================
function renderAll() {
  renderMatrix();
  renderStats();
}

// ============================================================
//  Ekspor / Impor
// ============================================================
$("export-btn").addEventListener("click", () => {
  const data = { app: "discipline-checklist", version: 2, activities, log, schedule };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `disiplin-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$("import-btn").addEventListener("click", () => $("import-file").click());

$("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== "object") throw new Error("format salah");
      if (!confirm("Impor akan MENGANTI semua data saat ini dengan isi file ini. Lanjutkan?")) return;
      if (Array.isArray(data.activities)) activities = data.activities;
      if (Array.isArray(data.schedule)) schedule = data.schedule;
      if (data.log && typeof data.log === "object") log = data.log;
      saveAct(); saveLog(); saveSched();
      renderAll();
      alert("✓ Data berhasil diimpor!");
    } catch {
      alert("✗ File tidak valid.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ============================================================
//  Init
// ============================================================
renderAll();
