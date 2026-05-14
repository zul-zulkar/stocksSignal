// =====================================================================
// Dashboard utama – render tabel + Forever Pocket + modal detail.
// =====================================================================

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

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") e.className = v;
    else if (k === "onClick") e.addEventListener("click", v);
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}

function signalCell(score) {
  const { pct, color } = signalBar(score);
  const wrap = el("span", { className: "signal-cell" });
  const bar = el("span", { className: "bar-wrap" },
    el("div", { className: "bar-fill" }))
  bar.firstChild.style.width = pct + "%";
  bar.firstChild.style.background = color;
  wrap.append(bar);
  wrap.append(el("span", { className: "score-num" }, (score >= 0 ? "+" : "") + score));
  return wrap;
}

function renderRow(stock) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  if (adj === null) return null;
  const badge = ethicsBadge(stock.ethics.israelTie);
  const tr = el("tr", { className: "row-clickable", onClick: () => openDetail(stock) }, [
    el("td", {}, [
      el("div", { className: "ticker" }, stock.ticker),
      el("div", { className: "name"   }, stock.name)
    ]),
    el("td", {}, stock.sector),
    el("td", {}, el("span", { className: "badge badge-" + badge.color }, badge.label)),
    el("td", {}, signalCell(stock.signals.technical)),
    el("td", {}, signalCell(stock.signals.sentiment)),
    el("td", {}, signalCell(stock.signals.news)),
    el("td", {}, signalCell(stock.signals.policy)),
    el("td", {}, signalCell(stock.signals.profile)),
    el("td", {}, el("span", { className: "score-num" }, String(adj))),
  ]);
  return tr;
}

function miniSig(label, score) {
  const cls = score > 20 ? "up" : score < -20 ? "down" : "flat";
  return el("div", { className: "sig " + cls }, [
    el("div", { className: "lbl" }, label),
    el("div", { className: "val" }, (score >= 0 ? "+" : "") + score)
  ]);
}

function renderMobileCard(stock) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  if (adj === null) return null;
  const badge = ethicsBadge(stock.ethics.israelTie);
  const s = stock.signals;
  return el("div", { className: "stock-card", onClick: () => openDetail(stock) }, [
    el("div", { className: "row1" }, [
      el("span", { className: "ticker" }, stock.ticker),
      el("span", { className: "score" }, String(adj))
    ]),
    el("div", { className: "row2" }, [
      el("span", { className: "name" }, stock.name),
      el("span", { className: "badge badge-" + badge.color }, badge.label)
    ]),
    el("div", { className: "signals-mini" }, [
      miniSig("Tek", s.technical),
      miniSig("Sen", s.sentiment),
      miniSig("Ber", s.news),
      miniSig("Keb", s.policy),
      miniSig("Pro", s.profile)
    ])
  ]);
}

function applyFilters(universe) {
  return universe.filter(s => {
    if (state.sector !== "ALL" && s.sector !== state.sector) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!s.ticker.toLowerCase().includes(q) &&
          !s.name.toLowerCase().includes(q)) return false;
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
      va = a[key]; vb = b[key];
      return va.localeCompare(vb) * dir;
    } else if (key === "ethics") {
      const order = { high: 4, medium: 3, low: 2, none: 1, unknown: 0 };
      va = order[a.ethics.israelTie]; vb = order[b.ethics.israelTie];
    } else {
      va = a.signals[key]; vb = b.signals[key];
    }
    return (va - vb) * dir;
  });
}

function renderTable() {
  const tbody = $("#stocks-tbody");
  const mobile = $("#stocks-mobile");
  tbody.innerHTML = "";
  mobile.innerHTML = "";
  const filtered = applyFilters(window.STOCK_UNIVERSE);
  const sorted = sortRows(filtered);
  let visible = 0;
  for (const s of sorted) {
    const row = renderRow(s);
    const card = renderMobileCard(s);
    if (row)  { tbody.append(row);   visible++; }
    if (card) mobile.append(card);
  }
  if (!visible) {
    mobile.append(el("div", { className: "stocks-empty" },
      "Tidak ada saham yang cocok dengan filter."));
  }
  $("#kpi-visible").textContent = visible;
  // Update sort indicators
  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.classList.toggle("sorted", th.dataset.sort === state.sortKey);
    th.classList.toggle("asc", th.dataset.sort === state.sortKey && state.sortDir === "asc");
  });
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
    const div = stock.fundamentals.dividendYield;
    const card = el("div", { className: "pocket-card", onClick: () => openDetail(stock) }, [
      el("div", { className: "top" }, [
        el("span", { className: "ticker" }, stock.ticker),
        el("span", { className: "score" }, String(score))
      ]),
      el("div", { className: "name" }, stock.name),
      el("div", {}, el("span", { className: "badge badge-" + badge.color }, badge.label)),
      el("div", { className: "meta" }, [
        el("div", {}, [el("strong", {}, "Sektor: "), stock.sector]),
        el("div", {}, [el("strong", {}, "Dividen: "), (div ? div.toFixed(2) + "%" : "—")]),
        el("div", {}, [el("strong", {}, "Mkt Cap: "), "$" + stock.fundamentals.marketCapB + "B"]),
      ])
    ]);
    card.style.cursor = "pointer";
    grid.append(card);
  }
  if (!list.length) {
    grid.append(el("div", { className: "note" },
      "Tidak ada saham yang lolos filter ketat saat ini."));
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
function openDetail(stock) {
  const adj = ethicsAdjustedScore(stock, state.mode);
  const badge = ethicsBadge(stock.ethics.israelTie);
  const f = stock.fundamentals;
  $("#modal-title").textContent = stock.ticker + " — " + stock.name;
  $("#modal-body").innerHTML = "";
  $("#modal-body").append(
    el("div", { className: "section" }, [
      el("h4", {}, "Status Etika"),
      el("span", { className: "badge badge-" + badge.color }, badge.label),
      el("p", {}, stock.ethics.rationale),
      el("div", { className: "note" },
        "Sumber: " + stock.ethics.sources.join(" · "))
    ]),
    el("div", { className: "section" }, [
      el("h4", {}, "Sinyal (−100 … +100)"),
      el("ul", {}, [
        el("li", {}, "Teknikal: "  + stock.signals.technical),
        el("li", {}, "Sentimen: "  + stock.signals.sentiment),
        el("li", {}, "Berita: "    + stock.signals.news),
        el("li", {}, "Kebijakan: " + stock.signals.policy),
        el("li", {}, "Profil: "    + stock.signals.profile),
        el("li", {}, "Skor komposit (0-100): " + compositeSignal(stock)),
        el("li", {}, "Skor setelah penalti etis (mode " + state.mode + "): " + (adj === null ? "DIKECUALIKAN" : adj))
      ])
    ]),
    el("div", { className: "section" }, [
      el("h4", {}, "Fundamental"),
      el("ul", {}, [
        el("li", {}, "Dividen yield: " + (f.dividendYield ? f.dividendYield.toFixed(2) + "%" : "—")),
        el("li", {}, "Payout ratio: "  + (f.payoutRatio ? f.payoutRatio + "%" : "—")),
        el("li", {}, "Market cap: $"   + f.marketCapB + "B"),
      ])
    ]),
    el("div", { className: "note" },
      "Catatan: penilaian etika berbasis sumber publik (BDS Movement, AFSC Investigate, Who Profits, laporan 'Don't Buy Into Occupation', dan media kredibel). Verifikasi mandiri sebelum mengambil keputusan investasi.")
  );
  $("#modal-bg").classList.add("show");
}

function closeDetail() { $("#modal-bg").classList.remove("show"); }

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

// ---------- Wiring ----------
function init() {
  renderFreshness();
  populateSectorFilter();

  $("#mode-select").addEventListener("change", e => {
    state.mode = e.target.value; renderTable();
  });
  $("#sector-filter").addEventListener("change", e => {
    state.sector = e.target.value; renderTable();
  });
  $("#search-input").addEventListener("input", e => {
    state.search = e.target.value; renderTable();
  });

  $("#sort-select").addEventListener("change", e => {
    const [k, d] = e.target.value.split("-");
    state.sortKey = k;
    state.sortDir = d;
    renderTable();
  });

  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const k = th.dataset.sort;
      if (state.sortKey === k) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = k; state.sortDir = "desc";
      }
      // Sync sort dropdown
      const sel = $("#sort-select");
      const v = state.sortKey + "-" + state.sortDir;
      if ([...sel.options].some(o => o.value === v)) sel.value = v;
      renderTable();
    });
  });

  $("#modal-close").addEventListener("click", closeDetail);
  $("#modal-bg").addEventListener("click", e => {
    if (e.target.id === "modal-bg") closeDetail();
  });

  renderKPIs();
  renderForever();
  renderTable();
}

document.addEventListener("DOMContentLoaded", init);
