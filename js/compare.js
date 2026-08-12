// compare.js — halaman perbandingan 2 saham
(function () {
"use strict";

const { compositeSignal, ethicsAdjustedScore, ethicsBadge, signalBar } = window.SIGNAL_LIB;

const SIGNAL_KEYS   = ["technical","momentum","sentiment","news","policy","profile","valuation"];
const SIGNAL_LABELS = {
  technical: "Teknikal",
  momentum:  "Momentum",
  sentiment: "Sentimen",
  news:      "Berita",
  policy:    "Makro",
  profile:   "Kualitas",
  valuation: "Valuasi",
};

// ── Helpers ────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
function el(tag, attrs, children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "className") e.className = v;
    else if (k === "html")  e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of [].concat(children || [])) {
    if (c == null) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}

function findStock(query) {
  const q = query.trim().toUpperCase();
  return window.STOCK_UNIVERSE.find(s => s.ticker === q)
      || window.STOCK_UNIVERSE.find(s => s.name.toUpperCase().includes(q));
}

function scoreColor(v) {
  return v >= 60 ? "var(--up)" : v >= 40 ? "var(--flat)" : "var(--down)";
}

function sigColor(v) {
  return v > 20 ? "var(--up)" : v < -20 ? "var(--down)" : "var(--flat)";
}

function pct(v) {
  return Math.round((v + 100) / 2) + "%";
}

function fmtCap(b) {
  if (!b) return "—";
  return b >= 1000 ? "$" + (b / 1000).toFixed(2) + "T" : "$" + b + "B";
}

// ── Datalist ────────────────────────────────────────────────────────────────

function buildDatalist() {
  const dl = $("stock-datalist");
  if (!dl || !window.STOCK_UNIVERSE) return;
  for (const s of window.STOCK_UNIVERSE) {
    const opt = document.createElement("option");
    opt.value = s.ticker;
    opt.label = s.ticker + " — " + s.name;
    dl.append(opt);
  }
}

// ── Comparison renderer ─────────────────────────────────────────────────────

function renderComparison(sa, sb) {
  const result  = $("cmp-result");
  result.innerHTML = "";

  const adjA = ethicsAdjustedScore(sa, "balanced") ?? 0;
  const adjB = ethicsAdjustedScore(sb, "balanced") ?? 0;
  const cmpA = compositeSignal(sa);
  const cmpB = compositeSignal(sb);
  const badgeA = ethicsBadge(sa.ethics.israelTie);
  const badgeB = ethicsBadge(sb.ethics.israelTie);

  // ── Stock headers ──────────────────────────────────────────
  const headers = el("div", { className: "cmp-headers" }, [
    stockHeader(sa, cmpA, adjA, badgeA),
    stockHeader(sb, cmpB, adjB, badgeB),
  ]);
  result.append(headers);

  // ── Signal comparison ──────────────────────────────────────
  const sigCard = el("div", { className: "cmp-card" });
  sigCard.append(el("h3", {}, "Sinyal 7 Faktor"));
  const sigHeader = el("div", { className: "cmp-signal-row" }, [
    el("div", { className: "csr-label" }, ""),
    el("div", { className: "csr-label", style: "font-size:12px;color:var(--text)" }, sa.ticker),
    el("div", { className: "csr-label", style: "font-size:12px;color:var(--text)" }, sb.ticker),
  ]);
  sigCard.append(sigHeader);

  for (const key of SIGNAL_KEYS) {
    const vA = sa.signals[key] || 0;
    const vB = sb.signals[key] || 0;
    const winner = vA > vB ? "a" : vB > vA ? "b" : null;
    sigCard.append(signalRow(SIGNAL_LABELS[key], vA, vB, winner));
  }
  result.append(sigCard);

  // ── Fundamentals comparison ────────────────────────────────
  const fundCard = el("div", { className: "cmp-card" });
  fundCard.append(el("h3", {}, "Fundamental"));

  const fA = sa.fundamentals, fB = sb.fundamentals;
  const fundRows = [
    ["Market Cap",   fmtCap(fA.marketCapB), fmtCap(fB.marketCapB)],
    ["Sektor",       sa.sector,             sb.sector],
    ["Dividen Yield", fA.dividendYield ? fA.dividendYield.toFixed(2) + "%" : "—",
                      fB.dividendYield ? fB.dividendYield.toFixed(2) + "%" : "—"],
    ["Payout Ratio", fA.payoutRatio ? fA.payoutRatio + "%" : "—",
                     fB.payoutRatio ? fB.payoutRatio + "%" : "—"],
    ["Skor Komposit", String(cmpA), String(cmpB)],
    ["Skor Etis",    adjA !== null ? String(adjA) : "✗", adjB !== null ? String(adjB) : "✗"],
  ];
  for (const [label, valA, valB] of fundRows) {
    fundCard.append(el("div", { className: "cmp-fund-row" }, [
      el("div", { className: "cfr-label" }, label),
      el("div", { className: "cfr-val" }, valA),
      el("div", { className: "cfr-val" }, valB),
    ]));
  }
  result.append(fundCard);

  // ── Ethics comparison ──────────────────────────────────────
  const ethCard = el("div", { className: "cmp-card" });
  ethCard.append(el("h3", {}, "Status Etika"));
  ethCard.append(el("div", { className: "cmp-ethics-row" }, [
    ethicsItem(sa, badgeA),
    ethicsItem(sb, badgeB),
  ]));
  result.append(ethCard);

  // ── Verdict ────────────────────────────────────────────────
  result.append(verdict(sa, sb, adjA, adjB, cmpA, cmpB));

  result.classList.add("show");
}

function stockHeader(stock, composite, adj, badge) {
  const div = el("div", { className: "cmp-stock-header" });
  div.append(
    el("div", { className: "ticker" }, stock.ticker),
    el("div", { className: "name" }, stock.name),
    el("div", { style: "margin-bottom:8px" }, el("span", { className: "badge badge-" + badge.color }, badge.label)),
    el("div", { className: "scores" }, [
      el("div", { className: "cmp-sh-score" }, [
        el("div", { className: "v", style: "color:" + scoreColor(composite) }, String(composite)),
        el("div", { className: "l" }, "Komposit"),
      ]),
      el("div", { className: "cmp-sh-score" }, [
        el("div", { className: "v", style: "color:" + (adj === null ? "var(--muted)" : scoreColor(adj)) },
           adj === null ? "✗" : String(adj)),
        el("div", { className: "l" }, "Etis"),
      ]),
    ])
  );
  return div;
}

function signalRow(label, vA, vB, winner) {
  function cell(v, isWinner) {
    const { color } = signalBar(v);
    const c = el("div", { className: "csr-cell" + (isWinner ? " csr-win" : "") });
    const scoreEl = el("span", { className: "csr-score" }, (v >= 0 ? "+" : "") + v);
    scoreEl.style.color = sigColor(v);
    const barWrap = el("div", { className: "csr-bar" });
    const barFill = el("div", { className: "csr-bar-fill" });
    barFill.style.width = pct(v);
    barFill.style.background = color;
    barWrap.append(barFill);
    c.append(scoreEl, barWrap);
    return c;
  }
  return el("div", { className: "cmp-signal-row" }, [
    el("div", { className: "csr-label" }, label),
    cell(vA, winner === "a"),
    cell(vB, winner === "b"),
  ]);
}

function ethicsItem(stock, badge) {
  return el("div", { className: "cer-item" }, [
    el("div", {}, [
      el("span", { className: "badge badge-" + badge.color }, badge.label),
      el("strong", { style: "margin-left:8px;font-size:13px" }, stock.ticker),
    ]),
    el("div", { className: "rationale" }, stock.ethics.rationale),
    el("div", { className: "note", style: "margin-top:6px" }, (stock.ethics.sources || []).join(" · ")),
  ]);
}

function verdict(sa, sb, adjA, adjB, cmpA, cmpB) {
  const card = el("div", { className: "cmp-card" });
  card.append(el("h3", {}, "Kesimpulan Perbandingan"));

  const lines = [];
  const winner = adjA > adjB ? sa : adjB > adjA ? sb : null;
  if (winner) {
    lines.push(winner.ticker + " unggul dalam skor etis-adjusted (" + Math.max(adjA, adjB) + " vs " + Math.min(adjA, adjB) + ").");
  } else {
    lines.push("Kedua saham memiliki skor etis-adjusted yang sama (" + adjA + ").");
  }

  const sigWins = { [sa.ticker]: 0, [sb.ticker]: 0 };
  for (const k of SIGNAL_KEYS) {
    const vA = sa.signals[k] || 0, vB = sb.signals[k] || 0;
    if (vA > vB) sigWins[sa.ticker]++;
    else if (vB > vA) sigWins[sb.ticker]++;
  }
  lines.push(sa.ticker + " unggul di " + sigWins[sa.ticker] + "/7 faktor, " +
             sb.ticker + " unggul di " + sigWins[sb.ticker] + "/7 faktor.");

  const ethOrder = { none: 0, low: 1, medium: 2, high: 3, unknown: 4 };
  const ethA = ethOrder[sa.ethics.israelTie] ?? 4;
  const ethB = ethOrder[sb.ethics.israelTie] ?? 4;
  if (ethA < ethB) lines.push(sa.ticker + " memiliki profil etika lebih bersih.");
  else if (ethB < ethA) lines.push(sb.ticker + " memiliki profil etika lebih bersih.");
  else lines.push("Keduanya memiliki kategori etika yang sama (" + sa.ethics.israelTie + ").");

  const ul = el("ul", { style: "margin:0;padding-left:18px;font-size:13px;line-height:1.9;color:var(--text)" });
  lines.forEach(t => ul.append(el("li", {}, t)));
  card.append(ul);
  card.append(el("div", { className: "note" }, "Disclaimer: Ini adalah perbandingan berbasis data kuantitatif dan referensi publik — bukan nasihat investasi."));
  return card;
}

// ── Init ────────────────────────────────────────────────────────────────────

function showError(msg) {
  const e = $("cmp-error");
  e.textContent = msg;
  e.style.display = msg ? "" : "none";
}

function run() {
  showError("");
  const qA = $("input-a").value.trim();
  const qB = $("input-b").value.trim();

  if (!qA || !qB) { showError("Masukkan ticker untuk kedua saham."); return; }
  if (qA.toUpperCase() === qB.toUpperCase()) { showError("Pilih dua saham yang berbeda."); return; }

  const sa = findStock(qA);
  const sb = findStock(qB);

  if (!sa) { showError("Saham '" + qA + "' tidak ditemukan di database."); return; }
  if (!sb) { showError("Saham '" + qB + "' tidak ditemukan di database."); return; }

  renderComparison(sa, sb);
  $("cmp-result").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", function () {
  if (!window.STOCK_UNIVERSE) return;

  buildDatalist();

  $("go-btn").addEventListener("click", run);
  [$("input-a"), $("input-b")].forEach(inp => {
    inp.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
  });

  // Pre-fill from URL query ?a=AAPL&b=MSFT
  const params = new URLSearchParams(location.search);
  const pA = params.get("a"), pB = params.get("b");
  if (pA) $("input-a").value = pA;
  if (pB) $("input-b").value = pB;
  if (pA && pB) run();
  else if (pA) $("input-b").focus();
});

})();
