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
// ---------- Radar chart (pure SVG) ----------
function radarChart(signals, size) {
  size = size || 200;
  const cx = size / 2, cy = size / 2, R = size * 0.35;
  const keys   = ["technical","momentum","sentiment","news","policy","profile","valuation"];
  const labels = ["Teknikal","Momentum","Sentimen","Berita","Makro","Kualitas","Valuasi"];
  const N = keys.length;
  const angles = keys.map((_, i) => -Math.PI / 2 + (Math.PI * 2 * i / N));
  const norm = v => Math.max(0.02, Math.min(1, (v + 100) / 200));

  // Expand viewBox beyond SVG size so labels have room without clipping
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

// ---------- Finviz price chart (img, no iframe restrictions) ----------
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

// ---------- Fund table row helper ----------
function fundRow(label, value, sub) {
  const tr = el("tr", {}, [
    el("td", {}, label),
    el("td", {}, sub
      ? [value, el("span", { className: "td-sub" }, sub)]
      : value),
  ]);
  return tr;
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

function openDetail(stock) {
  const adj       = ethicsAdjustedScore(stock, state.mode);
  const badge     = ethicsBadge(stock.ethics.israelTie);
  const f         = stock.fundamentals;
  const s         = stock.signals;
  const composite = compositeSignal(stock);

  // Header
  $("#modal-title").textContent = stock.ticker + " — " + stock.name;
  const body = $("#modal-body");
  body.innerHTML = "";

  // Subtitle (sector)
  body.append(el("div", { className: "modal-sector" }, stock.sector));

  // Score header strip
  const scoreColor = v => v >= 60 ? "up" : v >= 40 ? "flat" : "down";
  body.append(
    el("div", { className: "modal-score-header" }, [
      el("div", { className: "msh-item" }, [
        el("div", { className: "msh-val " + scoreColor(composite) }, String(composite)),
        el("div", { className: "msh-lbl" }, "Komposit"),
      ]),
      el("div", { className: "msh-item" }, [
        el("div", { className: "msh-val " + (adj === null ? "excl" : scoreColor(adj)) }, adj === null ? "✗" : String(adj)),
        el("div", { className: "msh-lbl" }, "Etis (" + state.mode + ")"),
      ]),
      el("div", { className: "msh-item" }, [
        el("span", { className: "badge badge-" + badge.color }, badge.label),
        el("div", { className: "msh-lbl" }, "Etika"),
      ]),
      el("div", { className: "msh-item" }, [
        el("div", { className: "msh-val flat" }, f.marketCapB >= 1 ? "$" + f.marketCapB + "B" : "—"),
        el("div", { className: "msh-lbl" }, "Mkt Cap"),
      ]),
    ])
  );

  // Tab nav
  const tabLabels = ["Ringkasan", "Grafik Harga", "Detail Sinyal", "Profil & Etika"];
  const tabNav    = el("div", { className: "modal-tabs" });
  const panels    = [];

  function switchTab(i) {
    tabNav.querySelectorAll(".tab-btn").forEach((b, j) => b.classList.toggle("active", j === i));
    panels.forEach((p, j) => p.style.display = j === i ? "" : "none");
  }
  tabLabels.forEach((lbl, i) => {
    const btn = el("button", { className: "tab-btn" + (i === 0 ? " active" : ""), onClick: () => switchTab(i) }, lbl);
    tabNav.append(btn);
  });
  body.append(tabNav);

  // ── Panel 0: Ringkasan ────────────────────────────────────
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
    el("a", {
      href: "compare.html?a=" + encodeURIComponent(stock.ticker),
      className: "compare-link-btn",
    }, ["⚖ Bandingkan " + stock.ticker + " dengan saham lain"])
  );
  panels.push(p0);

  // ── Panel 1: Grafik Harga ─────────────────────────────────
  const p1 = el("div", { className: "tab-panel", style: "display:none" });
  p1.innerHTML = tvChart(stock.ticker);
  panels.push(p1);

  // ── Panel 2: Detail Sinyal ────────────────────────────────
  const p2 = el("div", { className: "tab-panel", style: "display:none" });
  p2.append(el("div", { className: "note" }, "Skala −100 (sangat bearish) hingga +100 (sangat bullish). Klik baris untuk deskripsi."));
  const SIGNAL_KEYS = ["technical","momentum","sentiment","news","policy","profile","valuation"];
  for (const key of SIGNAL_KEYS) {
    const row = signalDetailRow(key, s[key] || 0);
    if ((s[key] || 0) === Math.max(...SIGNAL_KEYS.map(k => s[k] || 0))) {
      row.classList.add("highlight");
    }
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

  // ── Panel 3: Profil & Etika ───────────────────────────────
  const p3 = el("div", { className: "tab-panel", style: "display:none" });

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
  const dy  = f.dividendYield ? f.dividendYield.toFixed(2) + "%" : "—";
  const pr  = f.payoutRatio   ? f.payoutRatio + "%" : "—";
  const cap = f.marketCapB >= 1000 ? "$" + (f.marketCapB / 1000).toFixed(2) + "T" : "$" + f.marketCapB + "B";
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
      "Data sinyal diperbarui oleh scripts/fetch_signals.py (yfinance). " +
      "Penilaian etika merujuk BDS Movement, AFSC Investigate, Who Profits, OHCHR, dan media kredibel — verifikasi mandiri diperlukan.")
  );
  panels.push(p3);

  // Mount panels
  panels.forEach(p => body.append(p));
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

  // Sidebar scroll-to-section buttons
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  ["sb-kpi","sb-forever","sb-stocks"].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const target = btn.dataset.target;
    btn.addEventListener("click", () => scrollTo(target));
  });
  const sbGuide = document.getElementById("sb-guide");
  if (sbGuide) {
    sbGuide.addEventListener("click", () => {
      const details = document.querySelector("#section-guide details");
      if (details && !details.open) details.open = true;
      scrollTo("section-guide");
    });
  }

  // Hide sidebar when modal is open so it doesn't overlap on mobile
  const modalBg = $("#modal-bg");
  const sidebarEl = document.getElementById("sidebar");
  if (sidebarEl) {
    const obs = new MutationObserver(() => {
      sidebarEl.style.display = modalBg.classList.contains("show") ? "none" : "";
    });
    obs.observe(modalBg, { attributes: true, attributeFilter: ["class"] });
  }

  renderKPIs();
  renderForever();
  renderTable();
}

document.addEventListener("DOMContentLoaded", init);
})();
