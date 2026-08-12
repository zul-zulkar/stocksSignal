// Dashboard utama – render daftar + Forever Pocket + modal detail + view
// (Semua / Peluang / Watchlist / Dividen) + refresh per-saham + tema.
(function () {
"use strict";

const { compositeSignal, ethicsAdjustedScore, ethicsBadge, signalBar,
        buildForeverPocket, SIGNAL_WEIGHTS } = window.SIGNAL_LIB;
const ADVICE = window.ADVICE_LIB;
const WATCH  = window.WATCH_LIB;

const state = {
  mode: "balanced",
  search: "",
  sector: "ALL",
  sortKey: "adjScore",
  sortDir: "desc",
  view: "all",          // all | peluang | watchlist | dividen
};

const $ = sel => document.querySelector(sel);

// Indeks ticker → stock untuk lookup cepat
let UNIVERSE_BY_TICKER = {};
function indexUniverse() {
  UNIVERSE_BY_TICKER = {};
  for (const s of window.STOCK_UNIVERSE) UNIVERSE_BY_TICKER[s.ticker] = s;
}
function dividendOf(ticker) {
  const s = UNIVERSE_BY_TICKER[ticker];
  return s ? (s.fundamentals.dividendYield || 0) : 0;
}
function changeOf(ticker) {
  const ov = (window.SIGNAL_OVERLAY || {})[ticker];
  return ov && Number.isFinite(ov.changePct) ? ov.changePct : null;
}
// Format angka ala Pluang: koma sebagai desimal, titik sebagai pemisah ribuan
// ($219,93 · +1,13%). Mata uangnya tetap USD karena sahamnya saham AS —
// Pluang pun menampilkan harga saham AS dalam dolar.
function nf(n, d = 2) {
  return (Number(n) || 0).toLocaleString("id-ID",
    { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmt(n) { return nf(n, 2); }
function usd(n, d = 2) { return Number.isFinite(n) ? "$" + nf(n, d) : "—"; }
function pct(n, d = 2) { return Number.isFinite(n) ? nf(n, d) + "%" : "—"; }
function signedPct(n, d = 2) {
  if (!Number.isFinite(n)) return "—";
  return (n >= 0 ? "+" : "−") + nf(Math.abs(n), d) + "%";
}
function scoreCls(v) {
  if (v == null) return "";
  return v >= 60 ? " up" : v >= 40 ? " flat" : " down";
}

// ---------- DOM builder ----------
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") e.className = v;
    else if (k === "onClick") e.addEventListener("click", v);
    else if (k === "html")    e.innerHTML = v;
    else if (v === true)      e.setAttribute(k, "");
    else if (v === false || v == null) { /* skip */ }
    else e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}

// ---------- Signal description engine ----------
const SIGNAL_META = {
  technical: {
    label: "Teknikal",
    desc: [
      [50,  "Tren kuat naik · RSI sehat · di atas SMA50 & SMA200 · volume mendukung"],
      [20,  "Tren positif moderat · di atas SMA50 · momentum baik"],
      [-20, "Sideways / konsolidasi · sinyal teknikal mixed"],
      [-50, "Tren melemah · RSI mulai jenuh jual · di bawah SMA50"],
      [-101,"Tren turun kuat · risiko breakdown support · waspada"],
    ],
  },
  momentum: {
    label: "Momentum",
    desc: [
      [50,  "Return 6–12 bln jauh di atas rata-rata sektor · faktor momentum kuat (Fama-French)"],
      [20,  "Momentum positif moderat · return lebih baik dari peers"],
      [-20, "Momentum datar · belum ada konfirmasi arah"],
      [-50, "Return 6–12 bln di bawah pasar · momentum melemah"],
      [-101,"Momentum negatif kuat · lagging vs sektor & S&P500"],
    ],
  },
  sentiment: {
    label: "Sentimen",
    desc: [
      [40,  "Konsensus analis: mayoritas Strong Buy · short interest rendah (<2%)"],
      [10,  "Sentimen positif · lebih banyak Buy daripada Hold"],
      [-10, "Sentimen mixed · porsi Hold/Neutral dominan"],
      [-40, "Mayoritas Hold/Sell · short interest meningkat"],
      [-101,"Sentimen sangat negatif · banyak downgrade · short interest tinggi"],
    ],
  },
  news: {
    label: "Berita",
    desc: [
      [40,  "Berita positif dominan · earnings beat · guidance naik · katalis jelas"],
      [10,  "Berita moderat positif · tidak ada isu besar"],
      [-10, "Berita mixed · beberapa isu perlu pemantauan"],
      [-40, "Berita negatif · isu operasional, regulasi, atau reputasi"],
      [-101,"Berita negatif kuat · krisis reputasi atau fundamental"],
    ],
  },
  policy: {
    label: "Makro",
    desc: [
      [40,  "Makro sangat mendukung · tailwind sektoral kuat · suku bunga & USD menguntungkan"],
      [10,  "Makro positif moderat · kondisi siklus membaik"],
      [-10, "Makro netral · tidak ada katalis kebijakan yang jelas"],
      [-40, "Headwind makro · risiko regulasi atau siklus suku bunga tidak menguntungkan"],
      [-101,"Headwind makro kuat · risiko kebijakan atau geopolitik tinggi"],
    ],
  },
  profile: {
    label: "Kualitas",
    desc: [
      [50,  "Kualitas sangat tinggi · FCF kuat · moat lebar · neraca solid · ROE tinggi"],
      [20,  "Kualitas baik · profitabilitas memadai · debt terkelola"],
      [-20, "Kualitas moderat · perlu perhatian pada margin atau leverage"],
      [-50, "Kualitas rendah · FCF lemah atau debt tinggi"],
      [-101,"Fundamental lemah · risiko operasional atau kebangkrutan"],
    ],
  },
  valuation: {
    label: "Valuasi",
    desc: [
      [30,  "Valuasi sangat menarik · P/E & EV/FCF di bawah median sektor · margin of safety lebar"],
      [0,   "Valuasi wajar · harga mencerminkan fundamental secara adil"],
      [-30, "Valuasi sedikit premium · harga sudah priced-in pertumbuhan"],
      [-101,"Valuasi mahal · P/E signifikan di atas peers · risiko multiple compression"],
    ],
  },
};

function getSignalDesc(key, score) {
  const entries = (SIGNAL_META[key] || {}).desc || [];
  for (const [threshold, desc] of entries) {
    if (score >= threshold) return desc;
  }
  return "—";
}

// ---------- Signal bar ----------
function signalCell(score) {
  const { pct, color } = signalBar(score);
  const wrap = el("span", { className: "signal-cell" });
  const barWrap = el("span", { className: "bar-wrap" });
  const barFill = el("div",  { className: "bar-fill" });
  barFill.style.width = pct + "%";
  barFill.style.background = color;
  barWrap.append(barFill);
  wrap.append(barWrap, el("span", { className: "score-num" }, (score >= 0 ? "+" : "") + score));
  return wrap;
}

// ---------- Mini signal pill (kartu mobile) ----------
function miniSig(label, score) {
  const cls = score > 20 ? "up" : score < -20 ? "down" : "flat";
  return el("div", { className: "sig " + cls }, [
    el("div", { className: "lbl" }, label),
    el("div", { className: "val" }, (score >= 0 ? "+" : "") + score),
  ]);
}

// ---------- Grid statistik kunci (pola "Key Stats" Pluang) ----------
// Label kecil bergaris putus-putus di atas, nilai tebal di bawah, 3 kolom.
function keyStats(pairs) {
  return el("div", { className: "kstats" }, pairs.map(([label, value, cls]) =>
    el("div", { className: "kstat" }, [
      el("div", { className: "kstat-lbl" }, label),
      el("div", { className: "kstat-val " + (cls || "") }, value),
    ])
  ));
}

// ---------- Ringkasan arah 7 sinyal ----------
// Meniru blok "Analisis Teknikal" Pluang: satu pill verdict + bar tersegmen
// dengan cacah Bearish / Netral / Bullish. Ambang ±20 sama dengan yang
// dipakai signalBar() supaya warna di seluruh aplikasi konsisten.
function signalSummary(signals) {
  const keys = ["technical","momentum","sentiment","news","policy","profile","valuation"];
  let bear = 0, neut = 0, bull = 0;
  for (const k of keys) {
    const v = signals[k] || 0;
    if (v > 20) bull++; else if (v < -20) bear++; else neut++;
  }
  const total = keys.length;
  const verdict = bull > bear + 1 ? { label: "Bullish", cls: "up" }
                : bear > bull + 1 ? { label: "Bearish", cls: "down" }
                : { label: "Netral", cls: "flat" };

  const bar = el("div", { className: "ss-bar" });
  for (const [n, cls] of [[bear, "bear"], [neut, "neut"], [bull, "bull"]]) {
    if (!n) continue;
    const seg = el("div", { className: "ss-seg ss-" + cls });
    seg.style.flex = String(n / total);
    bar.append(seg);
  }

  return el("div", { className: "signal-summary" }, [
    el("div", { className: "ss-head" }, [
      el("span", { className: "ss-title" }, "Ringkasan 7 Sinyal"),
      el("span", { className: "ss-verdict " + verdict.cls }, verdict.label),
    ]),
    bar,
    el("div", { className: "ss-legend" }, [
      el("span", { className: "down" }, "Bearish (" + bear + ")"),
      el("span", { className: "muted" }, "Netral (" + neut + ")"),
      el("span", { className: "up" }, "Bullish (" + bull + ")"),
    ]),
  ]);
}

// ---------- Aksi / harga ----------
function actionBadge(v) {
  return el("span", { className: "action-badge action-" + v.color, title: v.rationale }, v.label);
}
function priceCell(price, chg) {
  const wrap = el("span", { className: "price-cell" });
  wrap.append(el("span", { className: "price-val" },
    usd(price)));
  if (chg != null) {
    wrap.append(el("span", { className: "price-chg " + (chg >= 0 ? "up" : "down") },
      (chg >= 0 ? "▲" : "▼") + nf(Math.abs(chg)) + "%"));
  }
  return wrap;
}

// ---------- Desktop table row ----------
function renderRow(stock, opts = {}) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  if (adj === null && !opts.allowExcluded) return null;
  const badge = ethicsBadge(stock.ethics.israelTie);
  const v = ADVICE.actionVerdict(stock, state.mode);
  const s = stock.signals;
  const price = ADVICE.priceOf(stock.ticker);
  const chg = changeOf(stock.ticker);
  return el("tr", { className: "row-clickable", onClick: () => openDetail(stock) }, [
    el("td", {}, [
      el("div", { className: "ticker" }, stock.ticker),
      el("div", { className: "name" }, stock.name),
    ]),
    el("td", {}, actionBadge(v)),
    el("td", {}, priceCell(price, chg)),
    el("td", {}, stock.sector),
    el("td", {}, el("span", { className: "badge badge-" + badge.color }, badge.label)),
    el("td", {}, signalCell(s.technical)),
    el("td", {}, signalCell(s.momentum || 0)),
    el("td", {}, signalCell(s.sentiment)),
    el("td", {}, signalCell(s.news)),
    el("td", {}, signalCell(s.policy)),
    el("td", {}, signalCell(s.profile)),
    el("td", {}, signalCell(s.valuation || 0)),
    el("td", {}, el("span", { className: "score-num" + (adj === null ? " excl" : "") },
      adj === null ? "✗" : String(adj))),
  ]);
}

// ---------- Mobile card (rich) ----------
function renderMobileCard(stock, opts = {}) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  if (adj === null && !opts.allowExcluded) return null;
  const badge = ethicsBadge(stock.ethics.israelTie);
  const v = ADVICE.actionVerdict(stock, state.mode);
  const s = stock.signals;
  const price = ADVICE.priceOf(stock.ticker);
  const chg = changeOf(stock.ticker);
  const an = ADVICE.analystOf(stock.ticker);
  const watched = WATCH.isWatched(stock.ticker);

  const star = el("button", {
    className: "icon-btn star" + (watched ? " on" : ""),
    "aria-label": "Watchlist",
  }, watched ? "★" : "☆");
  star.addEventListener("click", e => {
    e.stopPropagation();
    const on = WATCH.toggleWatch(stock.ticker);
    star.classList.toggle("on", on);
    star.textContent = on ? "★" : "☆";
    if (state.view === "watchlist") { renderList(); }
  });

  const ref = el("button", { className: "icon-btn refresh-one", "aria-label": "Refresh saham ini" }, "↻");
  ref.addEventListener("click", e => { e.stopPropagation(); refreshCard(stock.ticker, ref); });

  const analystMini = (an && an.numAnalysts > 0)
    ? el("span", { className: "analyst-mini" },
        ADVICE.ratingLabel(an.rating) + (an.targetMean ? " · target " + usd(an.targetMean) : ""))
    : null;

  // Tata letak baris ala Pluang: [monogram] [ticker + nama] [aksi] [harga + skor].
  // Pluang menaruh sparkline di slot ketiga; kita tidak punya riwayat harga
  // per saham, jadi slot itu diisi hal yang justru jadi inti produk ini —
  // badge Aksi dan skor etis — daripada memalsukan grafik.
  const card = el("div", { className: "stock-row" + (adj === null ? " excluded" : ""), onClick: () => openDetail(stock) }, [
    el("div", { className: "sr-logo", "data-tie": stock.ethics.israelTie }, stock.ticker.slice(0, 2)),
    el("div", { className: "sr-id" }, [
      el("div", { className: "sr-ticker" }, [stock.ticker, actionBadge(v)]),
      el("div", { className: "sr-name" }, stock.name),
      el("div", { className: "sr-meta" }, [
        el("span", { className: "badge badge-" + badge.color }, badge.label),
        analystMini,
      ]),
    ]),
    el("div", { className: "sr-num" }, [
      priceCell(price, chg),
      el("div", { className: "sr-score" + scoreCls(adj) },
        adj === null ? "✗" : String(adj)),
    ]),
    el("div", { className: "sr-act" }, [ref, star]),
  ]);
  if (state.view === "watchlist") card.append(holdingEditor(stock, price));
  return card;
}

// ---------- Editor posisi (watchlist) ----------
function holdingEditor(stock, price) {
  const h = WATCH.getHolding(stock.ticker) || { qty: "", avgPrice: "" };
  const wrap = el("div", { className: "holding-editor" });
  const qty = el("input", { type: "number", inputmode: "decimal", min: "0", placeholder: "0" });
  const avg = el("input", { type: "number", inputmode: "decimal", min: "0", step: "0.01", placeholder: "0.00" });
  qty.value = h.qty || ""; avg.value = h.avgPrice || "";
  const pnl = el("span", { className: "holding-pnl" });
  function updatePnl() {
    const hh = WATCH.getHolding(stock.ticker);
    if (hh && Number.isFinite(price)) {
      const d = hh.qty * price - hh.qty * (hh.avgPrice || 0);
      pnl.className = "holding-pnl " + (d >= 0 ? "up" : "down");
      pnl.textContent = (d >= 0 ? "+$" : "−$") + fmt(Math.abs(d));
    } else { pnl.className = "holding-pnl"; pnl.textContent = ""; }
  }
  [qty, avg].forEach(inp => {
    inp.addEventListener("click", e => e.stopPropagation());
    inp.addEventListener("change", e => {
      e.stopPropagation();
      WATCH.setHolding(stock.ticker, qty.value, avg.value);
      updatePnl();
      renderPortfolio();
    });
  });
  updatePnl();
  wrap.append(
    el("label", { className: "he-field" }, ["Lembar", qty]),
    el("label", { className: "he-field" }, ["Harga beli", avg]),
    pnl,
  );
  return wrap;
}

// ---------- Filter & sort ----------
function applyFilters(universe) {
  return universe.filter(s => {
    if (state.sector !== "ALL" && s.sector !== state.sector) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!s.ticker.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function verdictScore(s) { return ADVICE.actionVerdict(s, state.mode).score; }

function sortRows(stocks) {
  const dir = state.sortDir === "asc" ? 1 : -1;
  const key = state.sortKey;
  return stocks.slice().sort((a, b) => {
    let va, vb;
    if (key === "adjScore") {
      va = ethicsAdjustedScore(a, state.mode) ?? -1;
      vb = ethicsAdjustedScore(b, state.mode) ?? -1;
    } else if (key === "ticker" || key === "sector") {
      return a[key].localeCompare(b[key]) * dir;
    } else if (key === "ethics") {
      const order = { high: 4, medium: 3, low: 2, none: 1, unknown: 0 };
      va = order[a.ethics.israelTie]; vb = order[b.ethics.israelTie];
    } else if (key === "action") {
      va = verdictScore(a); vb = verdictScore(b);
    } else if (key === "price") {
      va = ADVICE.priceOf(a.ticker) ?? -1; vb = ADVICE.priceOf(b.ticker) ?? -1;
    } else if (key === "dividend") {
      va = a.fundamentals.dividendYield || 0; vb = b.fundamentals.dividendYield || 0;
    } else {
      va = a.signals[key] || 0; vb = b.signals[key] || 0;
    }
    return (va - vb) * dir;
  });
}

function updateSortUI() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.classList.toggle("sorted", th.dataset.sort === state.sortKey);
    th.classList.toggle("asc", th.dataset.sort === state.sortKey && state.sortDir === "asc");
  });
  const sel = $("#sort-select");
  if (sel) {
    const v = state.sortKey + "-" + state.sortDir;
    if ([...sel.options].some(o => o.value === v)) sel.value = v;
  }
}

// ---------- View handling ----------
const VIEW_INFO = {
  all:       "Semua saham di universe, dengan skor & rekomendasi aksi.",
  peluang:   "Hanya saham dengan rekomendasi BELI / BELI KUAT — diurut potensi terbaik.",
  watchlist: "Saham yang kamu tandai ★. Isi posisi untuk melacak untung/rugi & dividen.",
  dividen:   "Pembayar dividen, diurut yield tertinggi. Cocok untuk passive income.",
};

function currentList() {
  let list = window.STOCK_UNIVERSE.slice();
  if (state.view === "watchlist") {
    const w = new Set(WATCH.listWatch());
    list = list.filter(s => w.has(s.ticker));
  } else if (state.view === "dividen") {
    list = list.filter(s => (s.fundamentals.dividendYield || 0) > 0);
  } else if (state.view === "peluang") {
    list = list.filter(s => {
      const a = ADVICE.actionVerdict(s, state.mode).action;
      return a === "STRONG_BUY" || a === "BUY";
    });
  }
  return applyFilters(list);
}

function emptyMsg() {
  if (state.view === "watchlist") return "Belum ada saham di watchlist. Tap ☆ pada kartu mana pun untuk menambah.";
  if (state.view === "peluang")   return "Belum ada saham yang masuk kategori BELI pada filter ini.";
  if (state.view === "dividen")   return "Tidak ada pembayar dividen pada filter ini.";
  return "Tidak ada saham yang cocok dengan filter.";
}

function renderList() {
  const tbody = $("#stocks-tbody");
  const mobile = $("#stocks-mobile");
  tbody.innerHTML = "";
  mobile.innerHTML = "";
  const allowExcluded = state.view === "watchlist";
  const sorted = sortRows(currentList());
  let visible = 0;
  for (const s of sorted) {
    const row = renderRow(s, { allowExcluded });
    const card = renderMobileCard(s, { allowExcluded });
    if (row) { tbody.append(row); visible++; }
    if (card) mobile.append(card);
  }
  if (!visible) {
    mobile.append(el("div", { className: "stocks-empty" }, emptyMsg()));
    tbody.append(el("tr", {}, el("td", { colspan: "13", className: "stocks-empty" }, emptyMsg())));
  }
  $("#kpi-visible").textContent = visible;
  updateSortUI();
}

function applyViewChrome() {
  $("#portfolio-panel").hidden = state.view !== "watchlist";
  $("#dividend-panel").hidden = state.view !== "dividen";
  $("#view-info").textContent = VIEW_INFO[state.view] || "";
  $("#section-stocks").classList.toggle("force-cards", state.view === "watchlist");
  document.querySelectorAll(".view-tab").forEach(b => b.classList.toggle("active", b.dataset.view === state.view));
  document.querySelectorAll(".bn-item").forEach(b => b.classList.toggle("active", b.dataset.view === state.view));
  if (state.view === "watchlist") renderPortfolio();
  if (state.view === "dividen") renderDividendEstimator();
}

function setView(v) {
  if (!VIEW_INFO[v]) return;
  state.view = v;
  if (v === "peluang")      { state.sortKey = "action";   state.sortDir = "desc"; }
  else if (v === "dividen") { state.sortKey = "dividend"; state.sortDir = "desc"; }
  else                      { state.sortKey = "adjScore"; state.sortDir = "desc"; }
  applyViewChrome();
  renderList();
}

// ---------- Portofolio ----------
function pfKpi(label, value, cls) {
  return el("div", { className: "pf-kpi" }, [
    el("div", { className: "pf-val " + (cls || "") }, value),
    el("div", { className: "pf-lbl" }, label),
  ]);
}
function renderPortfolio() {
  const sum = WATCH.computePortfolio(t => ADVICE.priceOf(t), dividendOf);
  const box = $("#portfolio-summary");
  box.innerHTML = "";
  if (!sum.rows.length) {
    box.append(el("div", { className: "note" },
      "Belum ada posisi. Isi jumlah lembar & harga beli pada kartu di bawah."));
    return;
  }
  const pnlCls = sum.pnl >= 0 ? "up" : "down";
  box.append(el("div", { className: "pf-kpis" }, [
    pfKpi("Modal", "$" + fmt(sum.cost)),
    pfKpi("Nilai kini", "$" + fmt(sum.value)),
    pfKpi("Untung/Rugi",
      (sum.pnl >= 0 ? "+$" : "−$") + fmt(Math.abs(sum.pnl)) + " (" + nf(sum.pnlPct, 1) + "%)", pnlCls),
    pfKpi("Dividen/th", "$" + fmt(sum.annualDividend), "up"),
  ]));
}

// ---------- Estimator dividen ----------
function renderDividendEstimator() {
  const amt = parseFloat($("#dividend-invest").value) || 0;
  const out = $("#dividend-est-out");
  out.innerHTML = "";
  const top = currentList()
    .slice()
    .sort((a, b) => (b.fundamentals.dividendYield || 0) - (a.fundamentals.dividendYield || 0))
    .slice(0, 5);
  if (!top.length) {
    out.append(el("div", { className: "note" }, "Tidak ada saham dividen pada filter ini."));
    return;
  }
  const tbl = el("table", { className: "fund-table div-est-table" });
  tbl.append(el("tr", {}, [
    el("th", {}, "Saham"), el("th", {}, "Yield"), el("th", {}, "Est. dividen/th"),
  ]));
  for (const s of top) {
    const dy = s.fundamentals.dividendYield || 0;
    tbl.append(el("tr", {}, [
      el("td", {}, s.ticker),
      el("td", {}, pct(dy)),
      el("td", {}, amt ? "$" + fmt(amt * dy / 100) : "—"),
    ]));
  }
  out.append(tbl);
}

// ---------- KPI + Forever ----------
function animateNum(elm, to) {
  to = Number(to) || 0;
  const from = Number(elm.dataset.v || 0);
  if (from === to) { elm.textContent = String(to); return; }
  elm.dataset.v = to;
  const dur = 450, start = performance.now();
  function step(t) {
    const k = Math.min(1, (t - start) / dur);
    elm.textContent = String(Math.round(from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderKPIs() {
  const u = window.STOCK_UNIVERSE;
  animateNum($("#kpi-total"), u.length);
  animateNum($("#kpi-clean"), u.filter(s => ["none", "low"].includes(s.ethics.israelTie)).length);
  animateNum($("#kpi-flagged"), u.filter(s => s.ethics.israelTie === "high").length);
}

function renderForever() {
  const grid = $("#forever-grid");
  grid.innerHTML = "";
  const list = buildForeverPocket(window.STOCK_UNIVERSE, 30);
  for (const { stock, score } of list) {
    const badge = ethicsBadge(stock.ethics.israelTie);
    const dyield = stock.fundamentals.dividendYield;
    const card = el("div", { className: "pocket-card", onClick: () => openDetail(stock) }, [
      el("div", { className: "top" }, [
        el("span", { className: "ticker" }, stock.ticker),
        el("span", { className: "score" }, String(score)),
      ]),
      el("div", { className: "name" }, stock.name),
      el("div", {}, el("span", { className: "badge badge-" + badge.color }, badge.label)),
      el("div", { className: "meta" }, [
        el("div", {}, [el("strong", {}, "Sektor: "), stock.sector]),
        el("div", {}, [el("strong", {}, "Dividen: "), dyield ? pct(dyield) : "—"]),
        el("div", {}, [el("strong", {}, "Mkt Cap: "), usd(stock.fundamentals.marketCapB, 0) + "B"]),
      ]),
    ]);
    grid.append(card);
  }
  if (!list.length) {
    grid.append(el("div", { className: "note" }, "Tidak ada saham yang lolos filter ketat saat ini."));
  }
}

// Satu jalur untuk mengganti sektor, dipakai chip maupun <select>.
function setSector(value) {
  state.sector = value;
  const sel = $("#sector-filter");
  if (sel && sel.value !== value) sel.value = value;
  const chipVal = $("#sector-chip-val");
  if (chipVal) chipVal.textContent = value === "ALL" ? "Semua" : value;
  renderList();
  if (state.view === "dividen") renderDividendEstimator();
}

function populateSectorFilter() {
  const sectors = [...new Set(window.STOCK_UNIVERSE.map(s => s.sector))].sort();
  const sel = $("#sector-filter");
  sel.innerHTML = "";
  sel.append(el("option", { value: "ALL" }, "Semua Sektor"));
  for (const s of sectors) sel.append(el("option", { value: s }, s));
}

// ---------- Radar chart (pure SVG) ----------
function radarChart(signals, size) {
  size = size || 200;
  const cx = size / 2, cy = size / 2, R = size * 0.35;
  const keys   = ["technical","momentum","sentiment","news","policy","profile","valuation"];
  const labels = ["Teknikal","Momentum","Sentimen","Berita","Makro","Kualitas","Valuasi"];
  const N = keys.length;
  const angles = keys.map((_, i) => -Math.PI / 2 + (Math.PI * 2 * i / N));
  const norm = v => Math.max(0.02, Math.min(1, (v + 100) / 200));

  const pad = Math.round(size * 0.18);
  const vb = (-pad) + " " + (-pad) + " " + (size + pad * 2) + " " + (size + pad * 2);

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const grid = gridLevels.map(r => {
    const pts = angles.map(a => (cx + r * R * Math.cos(a)).toFixed(1) + "," + (cy + r * R * Math.sin(a)).toFixed(1)).join(" ");
    return '<polygon points="' + pts + '" fill="none" stroke="#262c3a" stroke-width="' + (r === 1 ? "1.2" : "0.8") + '"/>';
  }).join("");

  const axes = angles.map(a => {
    const x2 = (cx + R * Math.cos(a)).toFixed(1);
    const y2 = (cy + R * Math.sin(a)).toFixed(1);
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#262c3a" stroke-width="0.8"/>';
  }).join("");

  const dataPts = keys.map((k, i) => {
    const v = norm(signals[k] || 0);
    return (cx + v * R * Math.cos(angles[i])).toFixed(1) + "," + (cy + v * R * Math.sin(angles[i])).toFixed(1);
  }).join(" ");
  const dataPolygon = '<polygon points="' + dataPts + '" fill="rgba(74,222,128,0.18)" stroke="#4ade80" stroke-width="1.5" stroke-linejoin="round"/>';

  const dots = keys.map((k, i) => {
    const v = norm(signals[k] || 0);
    const x = (cx + v * R * Math.cos(angles[i])).toFixed(1);
    const y = (cy + v * R * Math.sin(angles[i])).toFixed(1);
    return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#4ade80" stroke="#0f1117" stroke-width="1.2"/>';
  }).join("");

  const labelOffset = R * 0.46;
  const fs = Math.round(size * 0.056);
  const lblEls = labels.map((l, i) => {
    const x = (cx + (R + labelOffset) * Math.cos(angles[i])).toFixed(1);
    const y = (cy + (R + labelOffset) * Math.sin(angles[i])).toFixed(1);
    const score = signals[keys[i]] || 0;
    const col = score > 20 ? "#4ade80" : score < -20 ? "#ef4444" : "#8a93a6";
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="middle" fill="' + col + '" font-size="' + fs + '" font-family="sans-serif" font-weight="600">' + l + '</text>';
  }).join("");

  return '<svg width="' + size + '" height="' + size + '" viewBox="' + vb + '">' + grid + axes + dataPolygon + dots + lblEls + '</svg>';
}

// ---------- Finviz price chart ----------
function tvChart(ticker) {
  const sym = ticker.replace(/\./g, "-").replace(/[^A-Za-z0-9\-]/g, "");
  const imgSrc = "https://finviz.com/chart.ashx?t=" + sym + "&ty=c&ta=1&p=d";
  const href   = "https://finviz.com/quote.ashx?t=" + sym;
  return '<div class="chart-wrap">'
       + '<a href="' + href + '" target="_blank" rel="noopener noreferrer">'
       + '<img src="' + imgSrc + '" alt="Chart ' + ticker + '" class="finviz-chart" loading="lazy">'
       + '</a></div>'
       + '<div class="tv-note">Grafik dari Finviz · Klik untuk buka detail · Membutuhkan koneksi internet</div>';
}

function fundRow(label, value, sub) {
  return el("tr", {}, [
    el("td", {}, label),
    el("td", {}, sub ? [value, el("span", { className: "td-sub" }, sub)] : value),
  ]);
}

function signalDetailRow(key, score) {
  const meta = SIGNAL_META[key] || { label: key };
  const { pct, color } = signalBar(score);
  const row = el("div", { className: "signal-detail-row" });
  const header = el("div", { className: "sd-header" }, [
    el("span", { className: "sd-label" }, meta.label),
    el("span", { className: "sd-score", style: "color:" + color }, (score >= 0 ? "+" : "") + score),
  ]);
  const barWrap = el("div", { className: "sd-bar-wrap" });
  const barFill = el("div", { className: "sd-bar-fill" });
  barFill.style.width = pct + "%";
  barFill.style.background = color;
  barWrap.append(barFill);
  const desc = el("div", { className: "sd-desc" }, getSignalDesc(key, score));
  row.append(header, barWrap, desc);
  return row;
}

// ---------- Advice strip ----------
function adviceStrip(v) {
  const detail = el("div", { className: "adv-detail" }, [
    el("div", { className: "adv-rationale" }, v.rationale),
  ]);
  if (v.target) {
    detail.append(el("div", { className: "adv-target" }, [
      el("span", {}, "Target analis: "),
      el("strong", {}, usd(v.target)),
      v.upsidePct != null
        ? el("span", { className: "adv-upside " + (v.upsidePct >= 0 ? "up" : "down") },
            "  " + signedPct(v.upsidePct, 1) + " upside")
        : null,
    ]));
  }
  return el("div", { className: "advice-strip action-" + v.color }, [
    el("div", { className: "adv-badge" }, actionBadge(v)),
    detail,
  ]);
}

// ---------- Modal detail ----------
function openDetail(stock) {
  stock = UNIVERSE_BY_TICKER[stock.ticker] || stock;
  const adj       = ethicsAdjustedScore(stock, state.mode);
  const badge     = ethicsBadge(stock.ethics.israelTie);
  const f         = stock.fundamentals;
  const s         = stock.signals;
  const composite = compositeSignal(stock);
  const verdict   = ADVICE.actionVerdict(stock, state.mode);
  const an        = ADVICE.analystOf(stock.ticker);

  $("#modal-title").textContent = stock.ticker + " — " + stock.name;
  const body = $("#modal-body");
  body.innerHTML = "";

  const scoreColor = v => v >= 60 ? "up" : v >= 40 ? "flat" : "down";
  const price = ADVICE.priceOf(stock.ticker);
  const chg   = changeOf(stock.ticker);

  // ── Hero ala Pluang: monogram + ticker, harga besar + perubahan di kiri,
  //    grid statistik kunci di kanan (label bergaris putus-putus).
  const refBtn = el("button", { className: "icon-btn", "aria-label": "Refresh saham ini" }, "↻");
  refBtn.addEventListener("click", async () => {
    refBtn.disabled = true;
    await refreshCard(stock.ticker);
    if ($("#modal-bg").classList.contains("show")) openDetail(stock);
  });
  const watched = WATCH.isWatched(stock.ticker);
  const starBtn = el("button", {
    className: "icon-btn star" + (watched ? " on" : ""), "aria-label": "Watchlist",
  }, watched ? "★" : "☆");
  starBtn.addEventListener("click", () => {
    const on = WATCH.toggleWatch(stock.ticker);
    starBtn.classList.toggle("on", on);
    starBtn.textContent = on ? "★" : "☆";
    renderList();
  });

  body.append(el("div", { className: "dh-id" }, [
    el("div", { className: "sr-logo", "data-tie": stock.ethics.israelTie }, stock.ticker.slice(0, 2)),
    el("div", { className: "dh-name" }, [
      el("div", { className: "dh-ticker" }, stock.ticker),
      el("div", { className: "dh-company" }, stock.name),
    ]),
    refBtn, starBtn,
  ]));

  // Harga besar di kiri, dua skor inti di kanan — seperti blok harga +
  // Open/High/Low/Prev di Pluang.
  body.append(el("div", { className: "dh-top" }, [
    el("div", { className: "dh-price-col" }, [
      el("div", { className: "dh-price" }, usd(price)),
      chg != null
        ? el("div", { className: "dh-chg " + (chg >= 0 ? "up" : "down") }, signedPct(chg))
        : el("div", { className: "dh-chg muted" }, "perubahan harian belum tersedia"),
    ]),
    el("div", { className: "dh-scores" }, [
      el("div", { className: "dh-score" }, [
        el("span", { className: "dh-score-lbl" }, "Komposit"),
        el("span", { className: "dh-score-val " + scoreColor(composite) }, String(composite)),
      ]),
      el("div", { className: "dh-score" }, [
        el("span", { className: "dh-score-lbl" }, "Etis (" + state.mode + ")"),
        el("span", { className: "dh-score-val " + (adj === null ? "excl" : scoreColor(adj)) },
           adj === null ? "✗" : String(adj)),
      ]),
    ]),
  ]));

  // Grid statistik selebar penuh — 3 kolom seperti Key Stats Pluang.
  body.append(keyStats([
    ["Sektor", stock.sector],
    ["Etika", badge.label, "tie-" + badge.color],
    ["Dividen", f.dividendYield ? pct(f.dividendYield) : "—", f.dividendYield ? "up" : ""],
    ["Market Cap", f.marketCapB >= 1000 ? usd(f.marketCapB / 1000, 2) + "T" : usd(f.marketCapB, 0) + "B"],
    ["Payout", f.payoutRatio ? pct(f.payoutRatio, 0) : "—"],
    ["Analis", an && an.numAnalysts ? an.numAnalysts + " analis" : "—"],
  ]));

  // Advice strip
  body.append(adviceStrip(verdict));

  // Ringkasan arah 7 sinyal — pola "Analisis Teknikal" di Pluang
  body.append(signalSummary(s));

  // Tab nav
  const tabLabels = ["Ringkasan", "Grafik Harga", "Detail Sinyal", "Profil & Etika"];
  const tabNav    = el("div", { className: "modal-tabs" });
  const panels    = [];
  function switchTab(i) {
    tabNav.querySelectorAll(".tab-btn").forEach((b, j) => b.classList.toggle("active", j === i));
    panels.forEach((p, j) => p.style.display = j === i ? "" : "none");
  }
  tabLabels.forEach((lbl, i) => {
    tabNav.append(el("button", { className: "tab-btn" + (i === 0 ? " active" : ""), onClick: () => switchTab(i) }, lbl));
  });
  body.append(tabNav);

  // Panel 0: Ringkasan
  const p0 = el("div", { className: "tab-panel" });
  const radarDiv = el("div", { className: "radar-wrap" });
  radarDiv.innerHTML = radarChart(s, 260);
  p0.append(radarDiv);
  p0.append(el("div", { className: "composite-row" }, [
    el("span", {}, "Sinyal tertinggi: "),
    el("strong", {}, (() => {
      const best = Object.entries(s).reduce((a, b) => b[1] > a[1] ? b : a);
      const meta = SIGNAL_META[best[0]] || { label: best[0] };
      return meta.label + " (" + (best[1] >= 0 ? "+" : "") + best[1] + ")";
    })()),
  ]));
  p0.append(el("div", { className: "composite-row" }, [
    el("span", {}, "Sinyal terendah: "),
    el("strong", {}, (() => {
      const worst = Object.entries(s).reduce((a, b) => b[1] < a[1] ? b : a);
      const meta  = SIGNAL_META[worst[0]] || { label: worst[0] };
      return meta.label + " (" + (worst[1] >= 0 ? "+" : "") + worst[1] + ")";
    })()),
  ]));
  p0.append(
    el("a", { href: "compare.html?a=" + encodeURIComponent(stock.ticker), className: "compare-link-btn" },
      ["⚖ Bandingkan " + stock.ticker + " dengan saham lain"])
  );
  panels.push(p0);

  // Panel 1: Grafik Harga
  const p1 = el("div", { className: "tab-panel", style: "display:none" });
  p1.innerHTML = tvChart(stock.ticker);
  panels.push(p1);

  // Panel 2: Detail Sinyal
  const p2 = el("div", { className: "tab-panel", style: "display:none" });
  p2.append(el("div", { className: "note" }, "Skala −100 (sangat bearish) hingga +100 (sangat bullish). Klik baris untuk deskripsi."));
  const SIGNAL_KEYS = ["technical","momentum","sentiment","news","policy","profile","valuation"];
  const maxSig = Math.max(...SIGNAL_KEYS.map(k => s[k] || 0));
  for (const key of SIGNAL_KEYS) {
    const row = signalDetailRow(key, s[key] || 0);
    if ((s[key] || 0) === maxSig) row.classList.add("highlight");
    p2.append(row);
  }
  p2.append(
    el("div", { className: "composite-row", style: "margin-top:14px; padding-top:10px; border-top:1px solid var(--border)" }, [
      el("span", {}, "Skor komposit (0–100):"),
      el("strong", {}, " " + composite),
    ]),
    el("div", { className: "composite-row" }, [
      el("span", {}, "Setelah penalti etis (mode " + state.mode + "):"),
      el("strong", {}, " " + (adj === null ? "DIKECUALIKAN" : adj)),
    ])
  );
  panels.push(p2);

  // Panel 3: Profil & Etika + Analis
  const p3 = el("div", { className: "tab-panel", style: "display:none" });

  // Konsensus analis
  if (an && an.numAnalysts > 0) {
    const upside = (an.targetMean && Number.isFinite(price) && price > 0)
      ? ((an.targetMean - price) / price * 100) : null;
    p3.append(el("div", { className: "section" }, [
      el("h4", {}, "Konsensus Analis"),
      el("table", { className: "fund-table" }, [
        fundRow("Rekomendasi", ADVICE.ratingLabel(an.rating), an.numAnalysts + " analis"),
        fundRow("Target rata-rata", an.targetMean ? "$" + an.targetMean : "—",
          upside != null ? signedPct(upside, 1) + " vs harga" : null),
        fundRow("Target tertinggi", an.targetHigh ? "$" + an.targetHigh : "—"),
        fundRow("Target terendah", an.targetLow ? "$" + an.targetLow : "—"),
      ]),
    ]));
  } else {
    p3.append(el("div", { className: "section" }, [
      el("h4", {}, "Konsensus Analis"),
      el("p", { className: "note" }, "Data analis belum tersedia. Tap \"Perbarui Data\" di atas untuk mengambilnya dari Yahoo Finance."),
    ]));
  }

  // Ethics
  p3.append(
    el("div", { className: "section" }, [
      el("h4", {}, "Status Etika"),
      el("div", { style: "margin-bottom:8px" }, el("span", { className: "badge badge-" + badge.color }, badge.label)),
      el("p", { style: "font-size:13px;line-height:1.6;margin:0 0 8px" }, stock.ethics.rationale),
      el("div", { className: "note" }, "Sumber: " + (stock.ethics.sources || []).join(" · ")),
    ])
  );

  // Fundamentals
  const dy  = f.dividendYield ? pct(f.dividendYield) : "—";
  const pr  = f.payoutRatio   ? f.payoutRatio + "%" : "—";
  const cap = f.marketCapB >= 1000 ? usd(f.marketCapB / 1000) + "T" : usd(f.marketCapB, 0) + "B";
  const capCategory = f.marketCapB >= 200 ? "Mega cap" : f.marketCapB >= 10 ? "Large cap" : f.marketCapB >= 2 ? "Mid cap" : "Small cap";
  p3.append(
    el("div", { className: "section" }, [
      el("h4", {}, "Fundamental"),
      el("table", { className: "fund-table" }, [
        fundRow("Market Cap", cap, capCategory),
        fundRow("Sektor", stock.sector),
        fundRow("Dividen Yield", dy, f.dividendYield > 0 ? (f.dividendYield >= 4 ? "Tinggi" : f.dividendYield >= 2 ? "Moderat" : "Rendah") : null),
        fundRow("Payout Ratio", pr, pr !== "—" && f.payoutRatio <= 60 ? "Aman" : pr !== "—" && f.payoutRatio > 80 ? "Tinggi" : null),
        fundRow("Kualitas (skor)", (s.profile >= 0 ? "+" : "") + s.profile + " / 100", getSignalDesc("profile", s.profile)),
        fundRow("Valuasi (skor)",  (s.valuation >= 0 ? "+" : "") + s.valuation + " / 100", getSignalDesc("valuation", s.valuation)),
      ]),
    ])
  );
  p3.append(
    el("div", { className: "note", style: "margin-top:14px" },
      "Rekomendasi Aksi menggabungkan skor multi-faktor + konsensus analis (yfinance). " +
      "BUKAN nasihat investasi — verifikasi mandiri diperlukan.")
  );
  panels.push(p3);

  panels.forEach(p => body.append(p));

  // Action bar menempel di dasar — adaptasi dari Jual/Beli milik Pluang.
  // Kita bukan broker, jadi dua aksi nyata yang kita punya yang dipasang:
  // menandai watchlist dan membandingkan. Keduanya tadinya terkubur di
  // dalam modal dan hilang begitu kamu menggulir.
  const barStar = el("button", { className: "da-btn da-outline", type: "button" },
    (watched ? "★ Di watchlist" : "☆ Watchlist"));
  barStar.addEventListener("click", () => {
    const on = WATCH.toggleWatch(stock.ticker);
    barStar.textContent = on ? "★ Di watchlist" : "☆ Watchlist";
    starBtn.classList.toggle("on", on);
    starBtn.textContent = on ? "★" : "☆";
    renderList();
  });
  const modalEl = $("#modal-bg").querySelector(".modal");
  modalEl.querySelectorAll(".detail-actions").forEach(n => n.remove());
  modalEl.append(el("div", { className: "detail-actions" }, [
    barStar,
    el("a", {
      className: "da-btn da-solid",
      href: "compare.html?a=" + encodeURIComponent(stock.ticker),
    }, "⚖ Bandingkan"),
  ]));

  $("#modal-bg").classList.add("show");
}

function closeDetail() { $("#modal-bg").classList.remove("show"); }

// ---------- Bottom sheet ----------
// Pola sheet Pluang: muncul dari bawah, sudut atas membulat, daftar pilihan
// dengan bingkai + centang pada yang aktif. Sengaja generik supaya bisa
// dipakai untuk pilihan lain, bukan cuma sektor.
function openSheet({ title, options, current, onPick }) {
  const bg   = $("#sheet-bg");
  const list = $("#sheet-list");
  $("#sheet-title").textContent = title;
  list.innerHTML = "";
  for (const opt of options) {
    const value = typeof opt === "string" ? opt : opt.value;
    const label = typeof opt === "string" ? opt : opt.label;
    const active = value === current;
    const row = el("button", {
      className: "sheet-opt" + (active ? " active" : ""),
      type: "button",
      "aria-pressed": active ? "true" : "false",
    }, [
      el("span", { className: "so-label" }, label),
      active ? el("span", { className: "so-check", "aria-hidden": "true" }, "✓") : null,
    ]);
    row.addEventListener("click", () => { closeSheet(); onPick(value); });
    list.append(row);
  }
  bg.classList.add("show");
}
function closeSheet() { $("#sheet-bg").classList.remove("show"); }

// ---------- Toast ----------
function showToast(text, kind = "info", link = null) {
  const t = $("#toast");
  t.textContent = text;
  // Dibangun sebagai node, bukan innerHTML — teks pesan bisa memuat balasan
  // mentah dari API GitHub.
  if (link && link.href) {
    t.append(" ");
    const a = el("a", { href: link.href, target: "_blank", rel: "noopener", className: "toast-link" },
                 link.label || "lihat");
    t.append(a);
  }
  t.className = "toast show " + kind;
}
function hideToast(delay = 0) {
  setTimeout(() => $("#toast").classList.remove("show"), delay);
}

// ---------- Skeleton ----------
function listSkeleton(n = 8) {
  const mobile = $("#stocks-mobile");
  mobile.innerHTML = "";
  for (let i = 0; i < n; i++) {
    mobile.append(el("div", { className: "stock-card skeleton-card" }, [
      el("div", { className: "skeleton sk-line w40" }),
      el("div", { className: "skeleton sk-line w70" }),
      el("div", { className: "skeleton sk-line w90" }),
    ]));
  }
}

// ---------- PAT modal ----------
function openPATModal(prefillReason) {
  $("#pat-reason").textContent = prefillReason || "";
  $("#pat-input").value = window.REFRESH_LIB.getPAT() || "";
  $("#pat-modal-bg").classList.add("show");
  setTimeout(() => $("#pat-input").focus(), 100);
}
function closePATModal() { $("#pat-modal-bg").classList.remove("show"); }

// ---------- Refresh per-saham (in-memory) ----------
async function refreshCard(ticker, btn) {
  if (btn) { btn.disabled = true; btn.classList.add("spinning"); }
  showToast("Refresh " + ticker + "…", "info");
  try {
    const entry = await window.REFRESH_LIB.refreshOne(ticker);
    window.SIGNAL_OVERLAY = window.SIGNAL_OVERLAY || {};
    window.SIGNAL_OVERLAY[ticker] = entry;
    window.REFRESH_LIB.applyOverlay();
    renderList();
    if (state.view === "watchlist") renderPortfolio();
    showToast(ticker + " diperbarui — sementara, hilang saat reload.", "success");
    hideToast(3500);
  } catch (e) {
    // Jalur Stooq lewat CORS proxy publik memang sering mati; arahkan ke
    // tombol yang jalan server-side dan tidak kena CORS.
    showToast("Gagal ambil " + ticker + " (proxy Stooq sedang mati). Pakai tombol Perbarui Data di atas.", "error");
    hideToast(6000);
  } finally {
    if (btn) { btn.disabled = false; btn.classList.remove("spinning"); }
  }
}

// ---------- Refresh global (Stooq → commit GitHub) ----------
// ---------- Refresh cepat (in-memory, top visible) ----------
async function doQuickRefresh() {
  const tickers = sortRows(currentList()).slice(0, 20).map(s => s.ticker);
  if (!tickers.length) return;
  showToast("Memuat ulang harga " + tickers.length + " saham…", "info");
  try {
    const { overlay } = await window.REFRESH_LIB.refreshAll(tickers);
    window.SIGNAL_OVERLAY = Object.assign(window.SIGNAL_OVERLAY || {}, overlay);
    window.REFRESH_LIB.applyOverlay();
    renderList(); renderKPIs();
    if (state.view === "watchlist") renderPortfolio();
    showToast("Harga diperbarui — sementara, hilang saat reload.", "success");
    hideToast(2500);
  } catch (e) {
    showToast("Proxy Stooq sedang mati. Pakai tombol Perbarui Data di atas.", "error");
    hideToast(5000);
  }
}

// ---------- Perbarui Data (trigger + pantau GitHub Actions) ----------
// Penanda "ada pipeline berjalan" bertahan lintas reload — scrape 984 ticker
// makan 30–60 menit, jauh lebih lama dari umur satu tab di HP.
const DEEP_KEY = "ss_deepRun";
function deepMark(startedAt) {
  try { localStorage.setItem(DEEP_KEY, String(startedAt)); } catch {}
}
function deepClear() {
  try { localStorage.removeItem(DEEP_KEY); } catch {}
}
function deepStartedAt() {
  try {
    const v = Number(localStorage.getItem(DEEP_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch { return null; }
}

// Aksi Perbarui Data punya dua pemicu — tombol header dan FAB bottom nav.
// Keduanya harus menunjukkan status yang sama supaya tidak ada yang terlihat
// bisa ditekan padahal pipeline sedang jalan.
function updateBtns() {
  return [$("#deep-update-btn"), $("#bn-update")].filter(Boolean);
}
function setUpdateBusy(busy) {
  for (const b of updateBtns()) {
    b.disabled = busy;
    b.classList.toggle("loading", busy);
  }
}

async function doDeepUpdate() {
  const lib = window.REFRESH_LIB;
  const pat = lib.getPAT();
  if (!pat) { openPATModal("Untuk memperbarui data di server, paste PAT dengan izin Actions: Read and write."); return; }
  setUpdateBusy(true);
  showToast("Memicu pipeline di GitHub Actions…", "info");
  try {
    await lib.ghDispatchWorkflow(pat);
    const startedAt = Date.now();
    deepMark(startedAt);
    showToast("Pipeline dimulai. Memantau status…", "info");
    pollDeep(pat, startedAt);
  } catch (e) {
    showToast("Gagal memicu: " + e.message, "error");
    hideToast(8000);
    setUpdateBusy(false);
    if (/PAT|Actions/i.test(e.message)) openPATModal(e.message);
  }
}

const { pollDelay, DEEP_TIMEOUT_MS } = window.REFRESH_LIB;

function deepElapsedLabel(elapsedMs) {
  const m = Math.floor(elapsedMs / 60_000);
  return m < 1 ? "baru mulai" : m + " menit";
}

function pollDeep(pat, startedAt) {
  const stop = () => { setUpdateBusy(false); deepClear(); };
  const elapsed = Date.now() - startedAt;

  if (elapsed > DEEP_TIMEOUT_MS) {
    showToast("Pemantauan dihentikan setelah 65 menit. Cek tab Actions di GitHub.", "info");
    hideToast(8000);
    stop();
    return;
  }

  setTimeout(async () => {
    try {
      const run = await window.REFRESH_LIB.ghLatestRun(pat);
      if (run && run.status === "completed") {
        if (run.conclusion === "success") {
          showToast("Data diperbarui ✓ Halaman dimuat ulang…", "success");
          stop();
          setTimeout(() => location.reload(), 3000);
        } else {
          showToast("Pipeline gagal (" + run.conclusion + ").", "error",
                    run.html_url ? { href: run.html_url, label: "lihat log" } : null);
          hideToast(12000);
          stop();
        }
        return;
      }
      if (run) {
        const state = run.status === "in_progress" ? "berjalan" : "antre";
        showToast(`Pipeline ${state} · ${deepElapsedLabel(Date.now() - startedAt)}…`, "info",
                  run.html_url ? { href: run.html_url, label: "lihat progres" } : null);
      }
      pollDeep(pat, startedAt);
    } catch (e) {
      // Gangguan jaringan sesaat jangan sampai membatalkan pemantauan.
      pollDeep(pat, startedAt);
    }
  }, pollDelay(elapsed));
}

// Dipanggil saat load: kalau ada pipeline yang belum kelar, sambung pemantauan.
function resumeDeepPoll() {
  const startedAt = deepStartedAt();
  if (!startedAt) return;
  if (Date.now() - startedAt > DEEP_TIMEOUT_MS) { deepClear(); return; }
  const pat = window.REFRESH_LIB.getPAT();
  if (!pat) { deepClear(); return; }
  setUpdateBusy(true);
  showToast(`Melanjutkan pantauan pipeline · ${deepElapsedLabel(Date.now() - startedAt)}…`, "info");
  pollDeep(pat, startedAt);
}

// ---------- Freshness badge ----------
function renderFreshness() {
  const meta = window.STOCK_META || {};
  const dot = $("#freshness-dot");
  const txt = $("#freshness-text");
  if (!meta.lastUpdated) {
    dot.className = "dot";
    txt.textContent = "Data baseline · belum di-refresh otomatis";
    return;
  }
  const updated = new Date(meta.lastUpdated);
  const ageMs = Date.now() - updated.getTime();
  const ageH = ageMs / 36e5;
  let bucket = "fresh", label = "Segar";
  if (ageH > 36) { bucket = "old";   label = "Lama"; }
  else if (ageH > 12) { bucket = "stale"; label = "Mulai usang"; }
  dot.className = "dot " + bucket;
  const rel = relativeTime(ageMs);
  const failed = (meta.tickersFailed || []).length;
  txt.textContent =
    `${label} · diperbarui ${rel} · ${meta.tickersUpdated}/${meta.tickersTotal} ticker` +
    (failed ? ` · ${failed} gagal` : "");
}

function relativeTime(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60)    return s + " detik lalu";
  const m = Math.round(s / 60);
  if (m < 60)    return m + " menit lalu";
  const h = Math.round(m / 60);
  if (h < 24)    return h + " jam lalu";
  const d = Math.round(h / 24);
  return d + " hari lalu";
}

// ---------- Tema ----------
// Terang = bawaan (mengikuti Pluang); gelap tetap tersedia lewat toggle.
const THEME_KEY = "ss_theme";
function applyTheme(t) { document.documentElement.dataset.theme = t === "dark" ? "dark" : "light"; }
function initTheme() {
  let t = "light";
  try { t = localStorage.getItem(THEME_KEY) || "light"; } catch {}
  applyTheme(t);
}
function toggleTheme() {
  const cur = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const next = cur === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch {}
}

// ---------- Gestur ----------
function setupModalSwipe() {
  const modalBg = $("#modal-bg");
  const modal = modalBg.querySelector(".modal");
  let startY = 0, dragging = false, dy = 0;
  modal.addEventListener("touchstart", e => {
    if (modal.scrollTop > 4) { dragging = false; return; }
    startY = e.touches[0].clientY; dragging = true; dy = 0;
    modal.style.transition = "none";
  }, { passive: true });
  modal.addEventListener("touchmove", e => {
    if (!dragging) return;
    dy = e.touches[0].clientY - startY;
    if (dy > 0) modal.style.transform = "translateY(" + dy + "px)";
  }, { passive: true });
  modal.addEventListener("touchend", () => {
    if (!dragging) return;
    modal.style.transition = "";
    modal.style.transform = "";
    if (dy > 110) closeDetail();
    dragging = false;
  });
}

function setupPullToRefresh() {
  const ind = $("#ptr-indicator");
  let startY = null, pulling = false;
  document.addEventListener("touchstart", e => {
    if (window.scrollY <= 0 && !$("#modal-bg").classList.contains("show")) {
      startY = e.touches[0].clientY;
    } else startY = null;
  }, { passive: true });
  document.addEventListener("touchmove", e => {
    if (startY == null) return;
    const d = e.touches[0].clientY - startY;
    if (d > 0) {
      const capped = Math.min(d, 90);
      ind.style.transform = "translateX(-50%) translateY(" + (capped - 40) + "px)";
      ind.classList.toggle("ready", capped >= 70);
      pulling = capped >= 70;
    }
  }, { passive: true });
  document.addEventListener("touchend", () => {
    if (startY == null) return;
    ind.style.transform = "";
    ind.classList.remove("ready");
    if (pulling) doQuickRefresh();
    startY = null; pulling = false;
  });
}

// ---------- Wiring ----------
function init() {
  initTheme();
  indexUniverse();
  window.REFRESH_LIB.applyOverlay();
  renderFreshness();
  populateSectorFilter();

  $("#deep-update-btn").addEventListener("click", doDeepUpdate);
  $("#theme-toggle").addEventListener("click", toggleTheme);

  $("#pat-save").addEventListener("click", () => {
    const v = $("#pat-input").value.trim();
    if (!v) return;
    window.REFRESH_LIB.setPAT(v);
    closePATModal();
    showToast("PAT tersimpan di HP ini. Tap tombol yang tadi lagi.", "success");
    hideToast(3000);
  });
  $("#pat-test").addEventListener("click", async () => {
    const out = $("#pat-test-result");
    const token = $("#pat-input").value.trim() || window.REFRESH_LIB.getPAT();
    out.style.display = "";
    out.style.color = "var(--muted)";
    out.textContent = "Memeriksa token…";
    const r = await window.REFRESH_LIB.ghCheckPAT(token);
    out.style.color = r.ok ? "var(--green)" : "var(--red)";
    out.textContent = (r.ok ? "✓ " : "✗ ") + r.message;
  });
  $("#pat-forget").addEventListener("click", () => {
    window.REFRESH_LIB.clearPAT();
    $("#pat-input").value = "";
    showToast("PAT dihapus dari HP ini.", "info");
    hideToast(2500);
    closePATModal();
  });
  $("#pat-cancel").addEventListener("click", closePATModal);
  $("#pat-modal-bg").addEventListener("click", e => { if (e.target.id === "pat-modal-bg") closePATModal(); });

  $("#mode-select").addEventListener("change", e => {
    state.mode = e.target.value; renderList(); renderForever();
  });
  $("#sector-filter").addEventListener("change", e => {
    setSector(e.target.value);
  });
  // Chip membuka bottom sheet; <select> aslinya tetap ada (tersembunyi)
  // supaya jalur keyboard tetap jalan dan kode lain tidak perlu diubah.
  $("#sector-chip").addEventListener("click", () => {
    const sectors = [...new Set(window.STOCK_UNIVERSE.map(x => x.sector))].sort();
    openSheet({
      title: "Sektor",
      current: state.sector,
      options: [{ value: "ALL", label: "Semua Sektor" },
                ...sectors.map(x => ({ value: x, label: x }))],
      onPick: setSector,
    });
  });
  $("#sheet-bg").addEventListener("click", e => {
    if (e.target.id === "sheet-bg") closeSheet();
  });
  $("#search-input").addEventListener("input", e => {
    state.search = e.target.value; renderList();
  });
  $("#sort-select").addEventListener("change", e => {
    const v = e.target.value;
    const idx = v.lastIndexOf("-");
    state.sortKey = v.slice(0, idx);
    state.sortDir = v.slice(idx + 1);
    renderList();
  });
  $("#dividend-invest").addEventListener("input", renderDividendEstimator);

  // View tabs + bottom nav
  document.querySelectorAll(".view-tab, .bn-item").forEach(b => {
    b.addEventListener("click", () => setView(b.dataset.view));
  });
  // FAB tengah: aksi utama yang sama dengan tombol di header, tapi tetap
  // terjangkau saat header sudah tergulir keluar layar.
  $("#bn-update").addEventListener("click", doDeepUpdate);

  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const k = th.dataset.sort;
      if (state.sortKey === k) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = k; state.sortDir = "desc";
      }
      renderList();
    });
  });

  $("#modal-close").addEventListener("click", closeDetail);
  $("#modal-bg").addEventListener("click", e => { if (e.target.id === "modal-bg") closeDetail(); });

  setupModalSwipe();
  setupPullToRefresh();

  renderKPIs();
  renderForever();
  setView("all");
  resumeDeepPoll();
}

document.addEventListener("DOMContentLoaded", init);
})();
