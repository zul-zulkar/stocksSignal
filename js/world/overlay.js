// =====================================================================
// overlay.js — the narrative + data layer floating over the 3D world.
// Drives scroll→progress, fades scene panels, projects in-world labels,
// animates live numbers, and wires the camera-motion Tweak.
// =====================================================================
import { topOpps, flagged, cleanRising, forever, meta } from "./curate.js";
import { initConsole } from "./console.js";

// ── Tweak defaults (host rewrites this block on persist) ────────────
const TWEAKS = /*EDITMODE-BEGIN*/{ "cameraMotion": 1 }/*EDITMODE-END*/;

const $ = (s, r = document) => r.querySelector(s);
const fmtUSD = (n) => n == null ? "—" : "$" + n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 2 : 0, minimumFractionDigits: n < 10 ? 2 : 0 });
const rampInOut = (p, [a, b], fade = 0.05) => {
  if (p < a - fade || p > b + fade) return 0;
  const inn = Math.min(1, (p - (a - fade)) / fade);
  const out = Math.min(1, ((b + fade) - p) / fade);
  return Math.max(0, Math.min(inn, out));
};

export function initOverlay(world) {
  buildPanels();
  const panels = [...document.querySelectorAll(".scene")].map((el) => ({
    el, range: el.dataset.range.split(",").map(Number),
  }));

  // ── scroll → progress ─────────────────────────────────────────
  const scroller = $("#scroll");
  let progress = 0;
  function onScroll() {
    const max = scroller.scrollHeight - innerHeight;
    progress = max > 0 ? scroller.scrollTop / max : 0;
    world.setProgress(progress);
    updatePanels(progress);
    updateRail(progress);
  }
  scroller.addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  function updatePanels(p) {
    for (const { el, range } of panels) {
      const o = rampInOut(p, range, 0.045);
      el.style.opacity = o;
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
      const dy = (0.5 - (p - range[0]) / (range[1] - range[0] || 1)) * 18;
      el.style.transform = el.classList.contains("scene-center")
        ? `translate(-50%, ${dy}px)` : `translateY(${dy}px)`;
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";
    }
  }

  // ── live numbers per scene ────────────────────────────────────
  setupOpportunities();
  setupForever();
  startTicker();

  // ── in-world label projection ─────────────────────────────────
  const layer = $("#labels");
  world.onLabels((labels, camera, p) => {
    for (const L of labels) {
      if (!L.el) {
        const el = document.createElement("div");
        el.className = "lab lab-" + L.kind;
        el.innerHTML = `<span class="lab-t">${L.ticker}</span><span class="lab-s">${L.sub || ""}</span>`;
        layer.appendChild(el);
        L.el = el;
      }
      const o = rampInOut(p, L.range, 0.03);
      if (o < 0.01) { L.el.style.opacity = 0; L.el.style.display = "none"; continue; }
      const v = L.anchor.clone().project(camera);
      if (v.z > 1) { L.el.style.opacity = 0; continue; }
      L.el.style.display = "block";
      L.el.style.left = (v.x * 0.5 + 0.5) * innerWidth + "px";
      L.el.style.top = (-v.y * 0.5 + 0.5) * innerHeight + "px";
      L.el.style.opacity = o;
    }
  });

  // ── progress rail ─────────────────────────────────────────────
  const stops = [
    { p: 0.04, label: "Tiba" },
    { p: 0.33, label: "Peluang" },
    { p: 0.60, label: "Etika" },
    { p: 0.90, label: "Forever" },
  ];
  function updateRail(p) {
    $("#rail-fill").style.height = (p * 100) + "%";
    let active = 0;
    stops.forEach((s, i) => { if (p >= s.p - 0.18) active = i; });
    [...document.querySelectorAll(".rail-stop")].forEach((el, i) => el.classList.toggle("on", i === active));
  }

  // ── camera-motion Tweak ───────────────────────────────────────
  world.setMotion(TWEAKS.cameraMotion);
  setupTweaks(world);

  // ── functional console + in-world click picking ───────────────
  const cons = initConsole(world);
  const sc = $("#scroll");
  let downX = 0, downY = 0, downT = 0;
  sc.addEventListener("pointerdown", (e) => { downX = e.clientX; downY = e.clientY; downT = Date.now(); });
  sc.addEventListener("pointerup", (e) => {
    if (Math.abs(e.clientX - downX) > 8 || Math.abs(e.clientY - downY) > 8 || Date.now() - downT > 450) return;
    const stock = world.pick(e.clientX, e.clientY);
    if (stock) cons.openDetail(stock);
  });

  onScroll();
}

// ---------------------------------------------------------------------
function buildPanels() {
  const root = $("#overlay");
  root.innerHTML = `
    <div class="topbar">
      <div class="tb-left">
        <a class="world-back" href="index.html" title="Kembali ke dashboard klasik">← Dashboard</a>
        <div class="brand"><span class="brand-dot"></span>STOCK&nbsp;SIGNAL</div>
        <div class="brand-sub">Pasar AS · disaring lewat hati nurani</div>
      </div>
    </div>

    <!-- 01 ARRIVAL -->
    <section class="scene scene-center" data-range="0,0.13">
      <div class="eyebrow">01 — Tiba</div>
      <h1 class="mega">Sebuah pasar<br>yang <em>hidup</em></h1>
      <p class="lede">Bukan dashboard untuk digulir. Sebuah dunia untuk dijelajahi —
        <b>${meta.total}</b> saham AS, dinilai lewat tujuh sinyal dan satu hati nurani.</p>
      <div class="arr-stats">
        <div><span class="num" data-count="${meta.total}">0</span><label>saham di semesta</label></div>
        <div><span class="num jade" data-count="${meta.clean}">0</span><label>lolos filter etis</label></div>
        <div><span class="num shadow" data-count="${meta.flagged}">0</span><label>dikecualikan</label></div>
      </div>
      <div class="scrollhint"><span>Gulir untuk masuk</span><i></i></div>
    </section>

    <!-- 02 OPPORTUNITIES -->
    <section class="scene scene-left" data-range="0.18,0.48">
      <div class="eyebrow gold">02 — Peluang</div>
      <h1 class="mega">Peluang yang<br>sedang <em>naik</em></h1>
      <p class="lede"><b>${meta.opps}</b> signals across the universe read <b>BUY</b> or
        <b>STRONG&nbsp;BUY</b>. These nine rise highest after the ethics penalty.</p>
      <div class="feature" id="opp-feature"></div>
    </section>

    <!-- 03 ETHICS -->
    <section class="scene scene-right" data-range="0.50,0.72">
      <div class="eyebrow jade">03 — Etika</div>
      <h1 class="mega">Yang bersih<br>akan <em>berdiri</em></h1>
      <p class="lede">Saham dengan afiliasi kuat pada pendudukan tenggelam dalam bayang;
        yang bersih menjulang menuju cahaya. Kedaulatan Palestina sebagai inti penilaian.</p>
      <div class="ethics-cols">
        <div class="ecol">
          <div class="ecol-h shadow">Dikecualikan · ${meta.flagged}</div>
          <div id="eth-flagged"></div>
        </div>
        <div class="ecol">
          <div class="ecol-h jade">Berdiri bersih · ${meta.clean}</div>
          <div id="eth-clean"></div>
        </div>
      </div>
    </section>

    <!-- 04 FOREVER + CLOSE -->
    <section class="scene scene-center" data-range="0.80,1.001">
      <div class="eyebrow jade">04 — Forever Pocket</div>
      <h1 class="mega">Tempat berlabuh<br>jangka <em>panjang</em></h1>
      <p class="lede">Sepuluh saham terbersih dengan kualitas tertinggi — untuk diakumulasi
        perlahan, ditahan selamanya.</p>
      <div class="forever-grid" id="forever-grid"></div>
      <p class="disclaimer">Bukan nasihat investasi. Gabungan model multi-faktor publik +
        konsensus analis (Yahoo Finance) dengan filter etis. Selalu verifikasi mandiri.</p>
    </section>

    <!-- progress rail -->
    <div class="rail">
      <div class="rail-track"><div class="rail-fill" id="rail-fill"></div></div>
      <div class="rail-stops">
        <div class="rail-stop on">Tiba</div>
        <div class="rail-stop">Peluang</div>
        <div class="rail-stop">Etika</div>
        <div class="rail-stop">Forever</div>
      </div>
    </div>`;

  // arrival counters
  const io = new IntersectionObserver(() => {}, {});
  setTimeout(() => animateCounters($(".arr-stats")), 400);
}

function animateCounters(scope) {
  scope.querySelectorAll("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    let s = 0; const step = to / 60;
    const id = setInterval(() => { s += step; if (s >= to) { s = to; clearInterval(id); } el.textContent = Math.round(s).toLocaleString("en-US"); }, 16);
  });
}

// ── Scene 2: featured opportunity card that cycles + animates ──────
function setupOpportunities() {
  const host = $("#opp-feature");
  const actLabel = { STRONG_BUY: "BELI KUAT", BUY: "BELI" };
  let idx = 0;
  function render() {
    const o = topOpps[idx % topOpps.length];
    host.innerHTML = `
      <div class="ft-top">
        <div><div class="ft-tkr">${o.t}</div><div class="ft-name">${o.n}</div></div>
        <div class="ft-act ${o.act === "STRONG_BUY" ? "strong" : ""}">${actLabel[o.act]}</div>
      </div>
      <div class="ft-score">
        <div class="ft-bar"><i style="width:0%"></i></div>
        <div class="ft-num"><span class="big" data-to="${o.adjB}">0</span><span class="of">/100 skor</span></div>
      </div>
      <div class="ft-row">
        <div><label>Harga</label><b class="px" data-px="${o.price ?? 0}">${fmtUSD(o.price)}</b></div>
        <div><label>Target</label><b>${fmtUSD(o.target)}</b></div>
        <div><label>Upside</label><b class="jade up" data-to="${o.upside}" data-suffix="%" data-sign="1">0%</b></div>
      </div>`;
    requestAnimationFrame(() => {
      host.querySelector(".ft-bar i").style.width = o.adjB + "%";
      host.querySelectorAll("[data-to]").forEach((el) => tweenTo(el, +el.dataset.to, el.dataset.suffix || "", el.dataset.sign === "1"));
    });
  }
  render();
  setInterval(() => { idx++; render(); }, 4500);
}

function tweenTo(el, to, suffix = "", signed = false) {
  let s = 0; const dur = 900, t0 = performance.now();
  function f(t) {
    const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
    const v = to * e;
    el.textContent = (signed && v > 0 ? "+" : "") + (Math.abs(to) < 10 ? v.toFixed(1) : Math.round(v)) + suffix;
    if (k < 1) requestAnimationFrame(f);
  }
  requestAnimationFrame(f);
}

// ── Scene 3: ethics columns ────────────────────────────────────────
function setupEthics() {}
function fillEthics() {
  $("#eth-flagged").innerHTML = flagged.slice(0, 4).map((o) =>
    `<div class="echip shadow"><span>${o.t}</span><i>${o.n.split(" ")[0]}</i></div>`).join("");
  $("#eth-clean").innerHTML = cleanRising.slice(0, 4).map((o) =>
    `<div class="echip jade"><span>${o.t}</span><i>skor ${o.comp}</i></div>`).join("");
}

// ── Scene 4: forever grid ──────────────────────────────────────────
function setupForever() {
  fillEthics();
  $("#forever-grid").innerHTML = forever.map((o) => `
    <div class="fcard">
      <div class="fc-tkr">${o.t}</div>
      <div class="fc-name">${o.n}</div>
      <div class="fc-meta"><span>${o.dy.toFixed(1)}% div</span><span>${o.sec}</span></div>
    </div>`).join("");
}

// ── live ticker strip (top opportunities, jittering prices) ────────
function startTicker() {
  const strip = document.createElement("div");
  strip.className = "ticker";
  const items = topOpps.concat(cleanRising.slice(0, 4));
  const state = items.map((o) => ({ o, px: o.price || 50, dir: 1 }));
  strip.innerHTML = `<div class="tk-track">${state.concat(state).map((s, i) =>
    `<span class="tk" data-i="${i % state.length}"><b>${s.o.t}</b><em class="px"></em></span>`).join("")}</div>`;
  $("#overlay").appendChild(strip);
  function tick() {
    state.forEach((s) => {
      const drift = (Math.random() - 0.48) * s.px * 0.0009;
      s.px = Math.max(1, s.px + drift);
    });
    strip.querySelectorAll(".tk").forEach((el) => {
      const s = state[+el.dataset.i];
      const up = Math.random() > 0.5;
      el.querySelector(".px").textContent = fmtUSD(s.px);
      el.classList.toggle("up", up); el.classList.toggle("down", !up);
    });
  }
  tick(); setInterval(tick, 1100);
}

// ── camera-motion Tweak panel (vanilla host protocol) ──────────────
function setupTweaks(world) {
  const panel = document.createElement("div");
  panel.id = "tweaks";
  panel.innerHTML = `
    <div class="tw-head"><span>Tweaks</span><button id="tw-close" aria-label="Tutup">×</button></div>
    <div class="tw-row">
      <label>Intensitas gerak kamera</label>
      <div class="tw-slide">
        <input type="range" id="tw-motion" min="0" max="2" step="0.05" value="${TWEAKS.cameraMotion}">
        <output id="tw-motion-out">${(+TWEAKS.cameraMotion).toFixed(2)}×</output>
      </div>
      <p class="tw-note">Seberapa banyak kamera mengayun saat menjelajah dunia.</p>
    </div>`;
  document.body.appendChild(panel);

  const slider = $("#tw-motion"), out = $("#tw-motion-out");
  slider.addEventListener("input", () => {
    const v = +slider.value;
    out.textContent = v.toFixed(2) + "×";
    world.setMotion(v);
    try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { cameraMotion: v } }, "*"); } catch (e) {}
  });
  $("#tw-close").addEventListener("click", () => {
    panel.classList.remove("open");
    try { window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*"); } catch (e) {}
  });
  addEventListener("message", (e) => {
    const t = e?.data?.type;
    if (t === "__activate_edit_mode") panel.classList.add("open");
    else if (t === "__deactivate_edit_mode") panel.classList.remove("open");
  });
  try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch (e) {}
}
