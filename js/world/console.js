// =====================================================================
// console.js — the functional product layer over the cinematic world.
// "Jelajahi Semesta" drawer: search · ethics mode · sector · sort · views
// (Semua / Peluang / Watchlist / Dividen) + watchlist/portfolio (localStorage)
// + dividend estimator. Plus the in-world detail card (7-signal breakdown).
// =====================================================================

const DATA = (window.WORLD_DATA || []).slice();
const $ = (s, r = document) => r.querySelector(s);

const ACT = {
  STRONG_BUY: { label: "BELI KUAT", cls: "strong" },
  BUY: { label: "BELI", cls: "buy" },
  HOLD: { label: "TAHAN", cls: "hold" },
  REDUCE: { label: "KURANGI", cls: "reduce" },
  AVOID: { label: "HINDARI", cls: "avoid" },
};
const SIGS = [
  ["technical", "Teknikal"], ["momentum", "Momentum"], ["sentiment", "Sentimen"],
  ["news", "Berita"], ["policy", "Makro"], ["profile", "Kualitas"], ["valuation", "Valuasi"],
];
const TIE = {
  none: { label: "Bersih", cls: "clean" }, low: { label: "Eksposur Rendah", cls: "clean" },
  medium: { label: "Terlibat Sedang", cls: "warn" }, high: { label: "Afiliasi Kuat", cls: "shadow" },
  unknown: { label: "Belum Ditinjau", cls: "warn" },
};
const RATING = { strong_buy: "Strong Buy", buy: "Buy", hold: "Hold", underperform: "Underperform", sell: "Sell" };
const tieRank = { none: 0, low: 1, unknown: 2, medium: 3, high: 4 };

const fmtUSD = (n) => n == null ? "—" : "$" + n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 2 : 0, minimumFractionDigits: n < 10 ? 2 : 0 });
const scoreFor = (o, m) => m === "loose" ? o.adjL : m === "strict" ? o.adjS : o.adjB;

// ── persistence ────────────────────────────────────────────────────
const LS = {
  get watch() { try { return new Set(JSON.parse(localStorage.getItem("ss_watch") || "[]")); } catch { return new Set(); } },
  set watch(s) { localStorage.setItem("ss_watch", JSON.stringify([...s])); },
  get port() { try { return JSON.parse(localStorage.getItem("ss_port") || "{}"); } catch { return {}; } },
  set port(p) { localStorage.setItem("ss_port", JSON.stringify(p)); },
};

export function initConsole(world) {
  const state = { view: "all", mode: "balanced", sector: "all", sort: "score-desc", q: "" };
  let watch = LS.watch, port = LS.port;

  // ── DOM ──
  const btn = document.createElement("button");
  btn.id = "explore-btn";
  btn.innerHTML = `<span class="ex-dot"></span>Jelajahi Semesta`;
  document.body.appendChild(btn);

  const drawer = document.createElement("aside");
  drawer.id = "console";
  const sectors = ["all", ...[...new Set(DATA.map((o) => o.sec))].sort()];
  drawer.innerHTML = `
    <header class="cn-head">
      <div class="cn-title">Jelajahi Semesta<span id="cn-count"></span></div>
      <button id="cn-close" aria-label="Tutup">×</button>
    </header>
    <div class="cn-views" role="tablist">
      <button data-v="all" class="on">Semua</button>
      <button data-v="peluang">Peluang</button>
      <button data-v="watchlist">Watchlist</button>
      <button data-v="dividen">Dividen</button>
    </div>
    <div class="cn-filters">
      <input id="cn-q" type="search" placeholder="Cari ticker atau nama…" autocomplete="off" />
      <div class="cn-selrow">
        <label>Etis<select id="cn-mode">
          <option value="strict">Strict</option><option value="balanced" selected>Balanced</option><option value="loose">Loose</option>
        </select></label>
        <label>Sektor<select id="cn-sector">${sectors.map((s) => `<option value="${s}">${s === "all" ? "Semua" : s}</option>`).join("")}</select></label>
        <label>Urut<select id="cn-sort">
          <option value="score-desc">Skor ↓</option><option value="score-asc">Skor ↑</option>
          <option value="upside-desc">Upside ↓</option><option value="dividend-desc">Dividen ↓</option>
          <option value="ticker-asc">Ticker A-Z</option><option value="ethics-asc">Etika (bersih dulu)</option>
        </select></label>
      </div>
    </div>
    <div id="cn-extra"></div>
    <div id="cn-list"></div>`;
  document.body.appendChild(drawer);

  const dbg = document.createElement("div");
  dbg.id = "detail-bg";
  dbg.innerHTML = `<div id="detail-card"></div>`;
  document.body.appendChild(dbg);

  const dive = document.createElement("div");
  dive.id = "dive-scene";
  dive.innerHTML = `<div id="dive-content"></div>`;
  document.body.appendChild(dive);

  // ── events ──
  const toggle = (on) => { drawer.classList.toggle("open", on); btn.classList.toggle("hide", on); };
  btn.onclick = () => { toggle(true); render(); };
  $("#cn-close").onclick = () => toggle(false);

  drawer.querySelectorAll(".cn-views button").forEach((b) => b.onclick = () => {
    state.view = b.dataset.v;
    drawer.querySelectorAll(".cn-views button").forEach((x) => x.classList.toggle("on", x === b));
    render();
  });
  $("#cn-q").oninput = (e) => { state.q = e.target.value.trim().toLowerCase(); render(); };
  $("#cn-mode").onchange = (e) => { state.mode = e.target.value; world.setEthicsMode(state.mode); render(); };
  $("#cn-sector").onchange = (e) => { state.sector = e.target.value; render(); };
  $("#cn-sort").onchange = (e) => { state.sort = e.target.value; render(); };
  dbg.onclick = (e) => { if (e.target === dbg) dbg.classList.remove("open"); };

  // ── filtering / sorting ──
  function rows() {
    let list = DATA.slice();
    if (state.q) list = list.filter((o) => o.t.toLowerCase().includes(state.q) || o.n.toLowerCase().includes(state.q));
    if (state.sector !== "all") list = list.filter((o) => o.sec === state.sector);

    if (state.view === "watchlist") list = list.filter((o) => watch.has(o.t));
    else if (state.view === "peluang") list = list.filter((o) => (o.act === "BUY" || o.act === "STRONG_BUY") && scoreFor(o, state.mode) != null);
    else if (state.view === "dividen") list = list.filter((o) => o.dy > 0);
    // 'all': in strict/balanced, excluded (high) shown greyed; in loose all normal

    const sc = (o) => scoreFor(o, state.mode);
    const cmp = {
      "score-desc": (a, b) => (sc(b) ?? -1) - (sc(a) ?? -1),
      "score-asc": (a, b) => (sc(a) ?? 999) - (sc(b) ?? 999),
      "upside-desc": (a, b) => (b.upside ?? -1e9) - (a.upside ?? -1e9),
      "dividend-desc": (a, b) => b.dy - a.dy,
      "ticker-asc": (a, b) => a.t.localeCompare(b.t),
      "ethics-asc": (a, b) => tieRank[a.tie] - tieRank[b.tie] || (sc(b) ?? -1) - (sc(a) ?? -1),
    }[state.sort];
    if (state.view === "dividen" && state.sort === "score-desc") list.sort((a, b) => b.dy - a.dy);
    else list.sort(cmp);
    return list;
  }

  // ── render list + extras ──
  function render() {
    const list = rows();
    $("#cn-count").textContent = ` · ${list.length}`;
    const ex = $("#cn-extra");

    if (state.view === "dividen") {
      ex.innerHTML = `<div class="cn-est"><label>Simulasi investasi (USD)
        <input id="cn-invest" type="number" inputmode="decimal" min="0" step="100" placeholder="mis. 10000" value="${ex.dataset.inv || ""}"></label>
        <div id="cn-est-out" class="cn-est-out"></div></div>`;
      const inv = $("#cn-invest");
      const calc = () => {
        const amt = +inv.value || 0; ex.dataset.inv = inv.value;
        const top = list.slice(0, 6);
        $("#cn-est-out").innerHTML = amt > 0 ? top.map((o) => {
          const annual = amt * (o.dy / 100);
          return `<div><span>${o.t}</span><b>${fmtUSD(annual)}/th</b><i>${o.dy.toFixed(1)}%</i></div>`;
        }).join("") : `<p class="cn-note">Masukkan nominal untuk estimasi dividen tahunan pada saham yield tertinggi.</p>`;
      };
      inv.oninput = calc; calc();
    } else if (state.view === "watchlist") {
      const held = Object.entries(port).filter(([t, p]) => p && p.shares > 0);
      let totVal = 0, totPL = 0, totDiv = 0;
      held.forEach(([t, p]) => {
        const o = DATA.find((x) => x.t === t); if (!o || o.price == null) return;
        totVal += p.shares * o.price; totPL += p.shares * (o.price - (p.avg || 0)); totDiv += p.shares * o.price * (o.dy / 100);
      });
      ex.innerHTML = held.length ? `<div class="cn-port">
        <div><label>Nilai</label><b>${fmtUSD(totVal)}</b></div>
        <div><label>Untung/Rugi</label><b class="${totPL >= 0 ? "pos" : "neg"}">${totPL >= 0 ? "+" : ""}${fmtUSD(totPL)}</b></div>
        <div><label>Dividen/th</label><b class="pos">${fmtUSD(totDiv)}</b></div></div>`
        : `<p class="cn-note" style="padding:0 16px">Tandai ★ saham & isi lembar di kartu detail untuk melacak portofolio.</p>`;
    } else ex.innerHTML = "";

    $("#cn-list").innerHTML = list.length ? list.map((o) => {
      const sc = scoreFor(o, state.mode);
      const excluded = sc == null;
      const a = ACT[o.act];
      return `<button class="cn-row${excluded ? " excl" : ""}" data-t="${o.t}">
        <span class="r-star${watch.has(o.t) ? " on" : ""}" data-star="${o.t}">${watch.has(o.t) ? "★" : "☆"}</span>
        <span class="r-main"><b>${o.t}</b><i>${o.n}</i></span>
        <span class="r-act ${a.cls}">${excluded ? "DIKECUALIKAN" : a.label}</span>
        <span class="r-px">${fmtUSD(o.price)}</span>
        <span class="r-score">${excluded ? "—" : sc}</span>
      </button>`;
    }).join("") : `<p class="cn-note" style="padding:24px 16px;text-align:center">Tidak ada saham yang cocok.</p>`;

    $("#cn-list").querySelectorAll(".cn-row").forEach((r) => r.onclick = (e) => {
      const t = e.target.closest("[data-star]");
      if (t) { toggleWatch(t.dataset.star); return; }
      openDetail(DATA.find((o) => o.t === r.dataset.t));
    });
  }

  function toggleWatch(t) {
    if (watch.has(t)) watch.delete(t); else watch.add(t);
    LS.watch = watch; render();
    if (dbg.classList.contains("open") && dbg.dataset.t === t) openDetail(DATA.find((o) => o.t === t));
  }

  // ── detail card ──
  function openDetail(o) {
    if (!o) return;
    const sc = scoreFor(o, state.mode), excluded = sc == null;
    const a = ACT[o.act], tie = TIE[o.tie] || TIE.unknown;
    const p = port[o.t] || { shares: 0, avg: 0 };
    const starred = watch.has(o.t);
    dbg.dataset.t = o.t;
    const bars = SIGS.map(([k, lbl]) => {
      const v = o.sig[k] || 0, pct = (v + 100) / 2;
      const col = v > 20 ? "pos" : v < -20 ? "neg" : "flat";
      return `<div class="d-sig"><label>${lbl}<em>${v > 0 ? "+" : ""}${v}</em></label>
        <div class="d-bar"><i class="${col}" style="width:${pct}%"></i></div></div>`;
    }).join("");
    const upClass = o.upside == null ? "" : o.upside >= 0 ? "pos" : "neg";

    $("#detail-card").innerHTML = `
      <button id="d-close" aria-label="Tutup">×</button>
      <div class="d-top">
        <div><div class="d-tkr">${o.t}</div><div class="d-name">${o.n}</div>
          <div class="d-sec">${o.sec}</div></div>
        <div class="d-act ${excluded ? "avoid" : a.cls}">${excluded ? "DIKECUALIKAN" : a.label}</div>
      </div>
      <div class="d-prices">
        <div><label>Harga</label><b>${fmtUSD(o.price)}</b></div>
        <div><label>Target</label><b>${fmtUSD(o.target)}</b></div>
        <div><label>Upside</label><b class="${upClass}">${o.upside == null ? "—" : (o.upside >= 0 ? "+" : "") + o.upside + "%"}</b></div>
        <div><label>Skor (${state.mode})</label><b>${excluded ? "—" : sc + "/100"}</b></div>
      </div>
      <div class="d-eth ${tie.cls}">
        <div class="d-eth-h"><span class="d-badge ${tie.cls}">${tie.label}</span>
          ${o.rating ? `<span class="d-rate">Analis: ${RATING[o.rating] || o.rating} · ${o.nA}</span>` : ""}</div>
        <p>${o.why || "Tidak ada catatan etika."}</p>
      </div>
      <div class="d-sigs"><div class="d-sigs-h">Rincian 7 Sinyal <span>−100 … +100</span></div>${bars}</div>
      <div class="d-fund">
        <span>Dividen <b>${o.dy.toFixed(2)}%</b></span><span>Market cap <b>$${o.cap >= 1000 ? (o.cap / 1000).toFixed(1) + "T" : o.cap + "B"}</b></span>
      </div>
      <div class="d-actions">
        <button id="d-dive" class="d-dive">🔭 Selami Lebih Dalam</button>
        <button id="d-star" class="${starred ? "on" : ""}">${starred ? "★ Di Watchlist" : "☆ Tambah Watchlist"}</button>
      </div>
      ${starred ? `<div class="d-port">
        <label>Lembar<input id="d-shares" type="number" min="0" step="1" value="${p.shares || ""}" placeholder="0"></label>
        <label>Harga beli rata-rata<input id="d-avg" type="number" min="0" step="0.01" value="${p.avg || ""}" placeholder="0"></label>
        <div id="d-pl" class="d-pl"></div>
      </div>` : ""}`;
    dbg.classList.add("open");

    $("#d-close").onclick = () => dbg.classList.remove("open");
    $("#d-dive").onclick = () => openDiveScene(o);
    $("#d-star").onclick = () => toggleWatch(o.t);
    if (starred) {
      const sh = $("#d-shares"), av = $("#d-avg");
      const save = () => {
        port[o.t] = { shares: +sh.value || 0, avg: +av.value || 0 }; LS.port = port;
        const val = (port[o.t].shares) * (o.price || 0);
        const pl = (port[o.t].shares) * ((o.price || 0) - (port[o.t].avg || 0));
        const div = val * (o.dy / 100);
        $("#d-pl").innerHTML = port[o.t].shares > 0
          ? `<span>Nilai <b>${fmtUSD(val)}</b></span><span>P/L <b class="${pl >= 0 ? "pos" : "neg"}">${pl >= 0 ? "+" : ""}${fmtUSD(pl)}</b></span><span>Dividen/th <b class="pos">${fmtUSD(div)}</b></span>`
          : "";
      };
      sh.oninput = save; av.oninput = save; save();
    }
  }

  // ── dive scene ──────────────────────────────────────────────────
  function openDiveScene(o) {
    const wPos = world.getMonolithPos ? world.getMonolithPos(o.t) : null;
    if (wPos) world.focusMonolith(wPos, o.t);
    dbg.classList.remove("open");
    const sc = scoreFor(o, state.mode), excl = sc == null;
    const a = ACT[o.act], tie = TIE[o.tie] || TIE.unknown;
    function ring(label, value) {
      const R = 28, C = 2 * Math.PI * R;
      const filled = Math.min(((value + 100) / 2) / 100 * C, C - 0.5);
      const col = value > 20 ? "#9fe3b1" : value < -20 ? "#f0a890" : "#ffc874";
      return `<div class="dv-ring">
        <svg viewBox="0 0 70 70" width="70" height="70">
          <circle cx="35" cy="35" r="${R}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/>
          <circle cx="35" cy="35" r="${R}" fill="none" stroke="${col}" stroke-width="5"
            stroke-dasharray="${filled.toFixed(1)} ${C.toFixed(1)}"
            transform="rotate(-90 35 35)" stroke-linecap="round"/>
          <text x="35" y="40" text-anchor="middle" font-size="11" fill="${col}"
            font-family="Space Mono,monospace" font-weight="700">${value > 0 ? "+" : ""}${value}</text>
        </svg>
        <div class="dv-rlbl">${label}</div>
      </div>`;
    }
    const rings = SIGS.map(([k, lbl]) => ring(lbl, o.sig[k] || 0)).join("");
    const upPct = o.upside != null ? Math.max(2, Math.min(98, 50 + o.upside / 2)) : 50;
    $("#dive-content").innerHTML = `
      <button id="dv-exit">← Kembali ke dunia</button>
      <div class="dv-top">
        <div class="dv-tkr">${o.t}</div>
        <div class="dv-name">${o.n}</div>
        <div class="dv-tags">
          <span class="dv-act ${excl ? "avoid" : a.cls}">${excl ? "DIKECUALIKAN" : a.label}</span>
          <span class="dv-sec">${o.sec}</span>
        </div>
      </div>
      <div class="dv-rings">${rings}</div>
      <div class="dv-data">
        <div class="dv-price">
          <div class="dv-prow"><label>Harga saat ini</label><b>${fmtUSD(o.price)}</b></div>
          <div class="dv-prow"><label>Target analis</label><b class="pos">${fmtUSD(o.target)}</b></div>
          <div class="dv-prow"><label>Skor (${state.mode})</label><b>${excl ? "dikecualikan" : sc + "/100"}</b></div>
          <div class="dv-upbar"><i style="width:${upPct}%"></i></div>
          <div class="dv-uplbl">${o.upside != null ? (o.upside >= 0 ? "+" : "") + o.upside + "% upside ke target" : "Target tidak tersedia"}</div>
        </div>
        <div class="dv-eth ${tie.cls}">
          <div class="dv-badge ${tie.cls}">${tie.label}</div>
          <p>${o.why || "Tidak ada catatan etika."}</p>
          <div class="dv-dv">Dividen <b>${o.dy.toFixed(2)}%</b>&nbsp;·&nbsp;Mkt cap <b>$${o.cap >= 1000 ? (o.cap / 1000).toFixed(1) + "T" : o.cap + "B"}</b></div>
        </div>
      </div>`;
    $("#dv-exit").onclick = () => { dive.classList.remove("open"); world.clearFocus && world.clearFocus(); };
    dive.classList.add("open");
  }

  // initial ethics mode link
  world.setEthicsMode(state.mode);
  render();
  return { openDetail, openDiveScene, toggle };
}
