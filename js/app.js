// Dashboard utama – render tabel + Forever Pocket + modal detail.
(function () {
"use strict";

const { compositeSignal, ethicsAdjustedScore, ethicsBadge, signalBar,
        buildForeverPocket, SIGNAL_WEIGHTS } = window.SIGNAL_LIB;

const state = {
  mode: "balanced",
  search: "",
  sector: "ALL",
  sortKey: "adjScore",
  sortDir: "desc"
};

const $ = sel => document.querySelector(sel);

// ---------- DOM builder ----------
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") e.className = v;
    else if (k === "onClick") e.addEventListener("click", v);
    else if (k === "html")    e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}

// ---------- Signal description engine ----------
// Setiap threshold = batas bawah skor untuk deskripsi tersebut
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

// ---------- Mini signal pill (mobile card) ----------
function miniSig(label, score) {
  const { pct, color } = signalBar(score);
  const valColor = score > 20 ? "var(--up)" : score < -20 ? "var(--down)" : "var(--flat)";
  const pill = el("div", { className: "sig-pill" });
  const barWrap = el("div", { className: "sig-bar" });
  const barFill = el("div", { className: "sig-bar-fill" });
  barFill.style.width = pct + "%";
  barFill.style.background = color;
  barWrap.append(barFill);
  const valEl = el("div", { className: "sig-val" }, (score >= 0 ? "+" : "") + score);
  valEl.style.color = valColor;
  pill.append(el("span", { className: "sig-label" }, label), barWrap, valEl);
  return pill;
}

// ---------- Desktop table row ----------
function renderRow(stock) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  if (adj === null) return null;
  const badge = ethicsBadge(stock.ethics.israelTie);
  const s = stock.signals;
  return el("tr", { className: "row-clickable", onClick: () => openDetail(stock) }, [
    el("td", {}, [
      el("div", { className: "ticker" }, stock.ticker),
      el("div", { className: "name" }, stock.name),
    ]),
    el("td", {}, stock.sector),
    el("td", {}, el("span", { className: "badge badge-" + badge.color }, badge.label)),
    el("td", {}, signalCell(s.technical)),
    el("td", {}, signalCell(s.momentum || 0)),
    el("td", {}, signalCell(s.sentiment)),
    el("td", {}, signalCell(s.news)),
    el("td", {}, signalCell(s.policy)),
    el("td", {}, signalCell(s.profile)),
    el("td", {}, signalCell(s.valuation || 0)),
    el("td", {}, el("span", { className: "score-num" }, String(adj))),
  ]);
}

// ---------- Mobile card ----------
function renderMobileCard(stock) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  if (adj === null) return null;
  const badge = ethicsBadge(stock.ethics.israelTie);
  const s = stock.signals;
  const card = el("div", { className: "stock-card", onClick: () => openDetail(stock) });
  card.append(
    el("div", { className: "row1" }, [
      el("span", { className: "ticker" }, stock.ticker),
      el("span", { className: "card-score" }, String(adj)),
    ]),
    el("div", { className: "row2" }, [
      el("span", { className: "cname" }, stock.name),
      el("span", { className: "badge badge-" + badge.color }, badge.label),
    ]),
    el("div", { className: "signals-mini" }, [
      miniSig("Tek",  s.technical),
      miniSig("Mom",  s.momentum  || 0),
      miniSig("Kual", s.profile),
      miniSig("Val",  s.valuation || 0),
      miniSig("Makro", s.policy),
    ])
  );
  return card;
}

// ---------- Filters & sort ----------
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
    } else {
      va = a.signals[key] || 0; vb = b.signals[key] || 0;
    }
    return (va - vb) * dir;
  });
}

function updateSortUI() {
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.classList.remove("sorted", "asc");
    if (th.dataset.sort === state.sortKey) {
      th.classList.add("sorted");
      if (state.sortDir === "asc") th.classList.add("asc");
    }
  });
  const sel = $("#sort-select");
  if (sel) sel.value = state.sortKey + "|" + state.sortDir;
}

// ---------- Render ----------
function renderTable() {
  const tbody = $("#stocks-tbody");
  const mobileList = $("#stocks-mobile");
  tbody.innerHTML = "";
  mobileList.innerHTML = "";
  const sorted = sortRows(applyFilters(window.STOCK_UNIVERSE));
  let visible = 0;
  for (const s of sorted) {
    const row = renderRow(s);
    if (row) {
      tbody.append(row);
      const card = renderMobileCard(s);
      if (card) mobileList.append(card);
      visible++;
    }
  }
  $("#kpi-visible").textContent = visible;
  updateSortUI();
}

function renderKPIs() {
  const u = window.STOCK_UNIVERSE;
  $("#kpi-total").textContent = u.length;
  $("#kpi-clean").textContent = u.filter(s => ["none","low"].includes(s.ethics.israelTie)).length;
  $("#kpi-flagged").textContent = u.filter(s => s.ethics.israelTie === "high").length;
}

function renderForever() {
  const grid = $("#forever-grid");
  grid.innerHTML = "";
  const list = buildForeverPocket(window.STOCK_UNIVERSE, 10);
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
        el("div", {}, [el("strong", {}, "Dividen: "), dyield ? dyield.toFixed(2) + "%" : "—"]),
        el("div", {}, [el("strong", {}, "Mkt Cap: "), "$" + stock.fundamentals.marketCapB + "B"]),
      ]),
    ]);
    grid.append(card);
  }
  if (!list.length) {
    grid.append(el("div", { className: "note" }, "Tidak ada saham yang lolos filter ketat saat ini."));
  }
}

function populateSectorFilter() {
  const sectors = [...new Set(window.STOCK_UNIVERSE.map(s => s.sector))].sort();
  const sel = $("#sector-filter");
  sel.innerHTML = "";
  sel.append(el("option", { value: "ALL" }, "Semua Sektor"));
  for (const s of sectors) sel.append(el("option", { value: s }, s));
}

// ---------- Modal detail ----------
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

function openDetail(stock) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  const badge = ethicsBadge(stock.ethics.israelTie);
  const f = stock.fundamentals;
  const s = stock.signals;
  $("#modal-title").textContent = stock.ticker + " — " + stock.name;
  const body = $("#modal-body");
  body.innerHTML = "";

  // Etika
  body.append(
    el("div", { className: "section" }, [
      el("h4", {}, "Status Etika"),
      el("span", { className: "badge badge-" + badge.color }, badge.label),
      el("p", {}, stock.ethics.rationale),
      el("div", { className: "note" }, "Sumber: " + stock.ethics.sources.join(" · ")),
    ])
  );

  // Sinyal detail — 7 faktor
  const sigSection = el("div", { className: "section" });
  sigSection.append(el("h4", {}, "Sinyal Detail (−100 … +100)"));
  for (const key of ["technical","momentum","sentiment","news","policy","profile","valuation"]) {
    sigSection.append(signalDetailRow(key, s[key] || 0));
  }
  // Skor komposit
  const composite = compositeSignal(stock);
  sigSection.append(
    el("div", { className: "composite-row" }, [
      el("span", {}, "Skor komposit (0–100):"),
      el("strong", {}, " " + composite),
    ]),
    el("div", { className: "composite-row" }, [
      el("span", {}, "Setelah penalti etis (mode " + state.mode + "):"),
      el("strong", {}, " " + (adj === null ? "DIKECUALIKAN" : adj)),
    ])
  );
  body.append(sigSection);

  // Fundamental
  body.append(
    el("div", { className: "section" }, [
      el("h4", {}, "Fundamental"),
      el("ul", {}, [
        el("li", {}, "Market cap: $" + f.marketCapB + "B"),
        el("li", {}, "Dividen yield: " + (f.dividendYield ? f.dividendYield.toFixed(2) + "%" : "—")),
        el("li", {}, "Payout ratio: " + (f.payoutRatio ? f.payoutRatio + "%" : "—")),
      ]),
    ]),
    el("div", { className: "note" },
      "Penilaian etika berbasis BDS Movement, AFSC Investigate, Who Profits, laporan 'Don't Buy Into Occupation', dan media kredibel. " +
      "Sinyal adalah baseline kualitatif — jalankan scripts/fetch_signals.py untuk data live.")
  );

  $("#modal-bg").classList.add("show");
}

function closeDetail() { $("#modal-bg").classList.remove("show"); }

// ---------- Init ----------
function init() {
  populateSectorFilter();

  $("#mode-select").addEventListener("change", e => {
    state.mode = e.target.value; renderTable(); renderForever();
  });
  $("#sector-filter").addEventListener("change", e => {
    state.sector = e.target.value; renderTable();
  });
  $("#search-input").addEventListener("input", e => {
    state.search = e.target.value; renderTable();
  });
  $("#sort-select").addEventListener("change", e => {
    const [key, dir] = e.target.value.split("|");
    state.sortKey = key; state.sortDir = dir; renderTable();
  });

  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const k = th.dataset.sort;
      if (state.sortKey === k) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      else { state.sortKey = k; state.sortDir = "desc"; }
      renderTable();
    });
  });

  $("#modal-close").addEventListener("click", closeDetail);
  $("#modal-bg").addEventListener("click", e => { if (e.target.id === "modal-bg") closeDetail(); });

  renderKPIs();
  renderForever();
  renderTable();
}

document.addEventListener("DOMContentLoaded", init);
})();
