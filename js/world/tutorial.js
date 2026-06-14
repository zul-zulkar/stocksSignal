// =====================================================================
// tutorial.js — first-visit onboarding + persistent help/metadata panel.
// Tutorial: multi-step overlay, localStorage-gated (ss_tut_seen).
// Help: ? button → tabbed modal (Interaksi · Sinyal · Etika · Glosarium).
// =====================================================================

const STEPS = [
  {
    icon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="4" width="16" height="32" rx="8" stroke="#9fe3b1" stroke-width="3"/>
      <circle cx="32" cy="16" r="4" fill="#9fe3b1"/>
      <path d="M20 46 L32 58 L44 46" stroke="#ffce7a" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    title: "Gulir → Melaju",
    body: "Putar roda mouse atau geser layar untuk mengemudikan kamera melalui gurun emas — dari kedatangan, ke peluang, etika, hingga oasis Forever Pocket.",
  },
  {
    icon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="26" y="8" width="12" height="36" rx="4" fill="rgba(255,206,122,.2)" stroke="#ffce7a" stroke-width="2.5"/>
      <circle cx="32" cy="8" r="6" fill="#ffce7a" opacity=".8"/>
      <path d="M44 40 L54 50" stroke="#9fe3b1" stroke-width="3" stroke-linecap="round"/>
      <circle cx="54" cy="50" r="5" stroke="#9fe3b1" stroke-width="2.5"/>
    </svg>`,
    title: "Klik → Selidiki",
    body: "Klik monolit yang berdiri di dunia atau baris di konsol untuk membuka kartu detail lengkap: skor, 7 sinyal, target analis, status etika, dan portofolio.",
  },
  {
    icon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,.1)" stroke-width="5"/>
      <circle cx="32" cy="32" r="22" stroke="#9fe3b1" stroke-width="5"
        stroke-dasharray="90 138" transform="rotate(-90 32 32)" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="14" stroke="rgba(255,255,255,.08)" stroke-width="4"/>
      <circle cx="32" cy="32" r="14" stroke="#ffce7a" stroke-width="4"
        stroke-dasharray="55 88" transform="rotate(-90 32 32)" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="4" fill="#fff"/>
    </svg>`,
    title: "🔭 Selami Lebih Dalam",
    body: "Di kartu detail, tekan <b>Selami Lebih Dalam</b> — kamera bergerak mendekati monolit itu dan overlay 7 cincin sinyal terbuka secara sinematik.",
  },
  {
    icon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="48" height="48" rx="10" stroke="rgba(255,210,140,.4)" stroke-width="2"/>
      <circle cx="16" cy="16" r="3" fill="#9fe3b1"/>
      <rect x="22" y="13" width="28" height="5" rx="2.5" fill="rgba(255,255,255,.15)"/>
      <rect x="8" y="26" width="48" height="1.5" fill="rgba(255,210,140,.18)"/>
      <rect x="12" y="32" width="40" height="4" rx="2" fill="rgba(255,255,255,.08)"/>
      <rect x="12" y="40" width="30" height="4" rx="2" fill="rgba(255,255,255,.06)"/>
      <rect x="12" y="48" width="20" height="4" rx="2" fill="rgba(255,255,255,.05)"/>
    </svg>`,
    title: "✦ Jelajahi Semesta",
    body: "Tombol kanan-atas membuka konsol penuh: 984 saham, pencarian, filter sektor, sortir, view Semua / Peluang / Watchlist / Dividen, dan estimator pendapatan.",
  },
  {
    icon: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="4" width="8" height="30" rx="4" fill="rgba(159,227,177,.25)" stroke="#9fe3b1" stroke-width="2"/>
      <circle cx="32" cy="4" r="5" fill="#9fe3b1"/>
      <rect x="10" y="38" width="8" height="22" rx="4" fill="rgba(80,40,60,.6)" stroke="#6a5566" stroke-width="1.5"/>
      <rect x="24" y="44" width="8" height="16" rx="4" fill="rgba(80,40,60,.5)" stroke="#6a5566" stroke-width="1.5"/>
      <rect x="38" y="50" width="8" height="10" rx="4" fill="rgba(80,40,60,.4)" stroke="#6a5566" stroke-width="1.5"/>
      <path d="M8 60 H56" stroke="rgba(255,210,140,.3)" stroke-width="1.5"/>
    </svg>`,
    title: "Mode Etis → Dunia Berubah",
    body: "<b>Strict:</b> monolit terbendera tenggelam ke tanah. <b>Balanced:</b> dibayangi dengan penalti skor. <b>Loose:</b> semua saham menyala amber. Mercusuar kedaulatan bereaksi setiap perubahan.",
  },
];

const SIGNALS = [
  { key: "technical",  label: "Teknikal",  weight: "15%", desc: "RSI(14), SMA50 vs SMA200 (golden/death cross), momentum 1 bulan. Mengukur kekuatan tren harga jangka pendek–menengah." },
  { key: "momentum",  label: "Momentum",  weight: "15%", desc: "Return harga 6 bulan vs benchmark S&P 500. Mengikuti Fama-French Momentum Factor — saham yang sudah naik cenderung terus naik." },
  { key: "sentiment", label: "Sentimen",  weight: "10%", desc: "Konsensus rating analis (Strong Buy … Sell) dan short interest. Sentimen positif berarti mayoritas analis rekomendasikan beli." },
  { key: "news",      label: "Berita",    weight: "10%", desc: "Analisis heuristik judul berita terkini. Kata kunci positif (beat, upgrade) vs negatif (miss, downgrade, boycott) dihitung otomatis." },
  { key: "policy",    label: "Makro",     weight: "15%", desc: "Kondisi makro & kebijakan: suku bunga Fed, nilai tukar USD, regulasi pemerintah, siklus ekonomi." },
  { key: "profile",   label: "Kualitas",  weight: "20%", desc: "FCF, margin keuntungan, ada tidaknya dividen, tingkat utang (D/E). Perusahaan besar, profitable, berdividen = skor tinggi. Bobot terbesar." },
  { key: "valuation", label: "Valuasi",   weight: "15%", desc: "Forward P/E dibandingkan rata-rata historis S&P 500 (~20×). P/E lebih rendah = skor positif (murah/wajar)." },
];

const ETHICS_MODES = [
  { name: "Strict",    cls: "shadow", desc: "Saham dengan afiliasi kuat Israel (high) disembunyikan sepenuhnya dan monolit mereka tenggelam di dunia 3D." },
  { name: "Balanced",  cls: "hold",  desc: "Saham afiliasi kuat tetap dikecualikan dari skor komposit. Default — eksklusif tapi tidak menyembunyikan dari pandangan." },
  { name: "Loose",     cls: "buy",   desc: "Semua saham tampil tanpa penalti. Berguna untuk melihat murni sinyal keuangan tanpa filter etis." },
];

const SCORES = [
  { range: "71–100", label: "Sinyal Kuat",          cls: "jade",   note: "Kombinasi faktor yang baik — layak dipertimbangkan serius." },
  { range: "56–70",  label: "Sinyal Positif",        cls: "jade",   note: "Sebagian besar faktor mendukung." },
  { range: "46–55",  label: "Netral",                cls: "hold",   note: "Belum ada arah yang jelas." },
  { range: "31–45",  label: "Sinyal Moderat Negatif",cls: "reduce", note: "Perlu kehati-hatian ekstra." },
  { range: "0–30",   label: "Sinyal Lemah",          cls: "avoid",  note: "Hindari atau pantau dari jauh." },
];

const GLOSSARY = [
  ["RSI", "Relative Strength Index (0–100). <30 = oversold, >70 = overbought."],
  ["SMA", "Simple Moving Average. SMA50 & SMA200 sering dipakai untuk melihat tren."],
  ["Golden Cross", "SMA50 melewati SMA200 dari bawah — sinyal tren naik jangka menengah."],
  ["Death Cross", "SMA50 melewati SMA200 dari atas — sinyal tren turun."],
  ["P/E Forward", "Harga saham ÷ estimasi laba per saham 12 bulan ke depan. Makin rendah = lebih murah."],
  ["Market Cap", "Harga × jumlah saham beredar. >$200B = mega-cap."],
  ["FCF", "Free Cash Flow — kas tersisa setelah belanja modal. Perusahaan sehat punya FCF positif."],
  ["DCA", "Dollar Cost Averaging — beli rutin dengan nominal tetap tanpa memandang harga."],
  ["Dividen Yield", "Dividen tahunan ÷ harga saham × 100%. Mis. $3/$100 = yield 3%."],
  ["Moat", "Keunggulan kompetitif yang sulit ditiru (merek kuat, efek jaringan, biaya beralih)."],
  ["Short Interest", "% saham yang sedang di-short. Tinggi = banyak yang bertaruh harga turun."],
  ["BDS", "Boycott, Divestment, Sanctions — gerakan sipil yang mendesak boikot perusahaan pendukung pendudukan Israel."],
];

export function initTutorial() {
  const seen = localStorage.getItem("ss_tut_seen");
  buildHelp();
  if (!seen) openTutorial();
}

// ── Tutorial ──────────────────────────────────────────────────────
let tutEl = null, tutStep = 0;
function openTutorial() {
  if (!tutEl) {
    tutEl = document.createElement("div");
    tutEl.id = "tut-bg";
    tutEl.innerHTML = `
      <div id="tut-card">
        <button id="tut-skip">Lewati ×</button>
        <div id="tut-icon"></div>
        <div id="tut-step-lbl"></div>
        <h2 id="tut-title"></h2>
        <p id="tut-body"></p>
        <div class="tut-nav">
          <div class="tut-dots" id="tut-dots"></div>
          <div class="tut-btns">
            <button id="tut-prev">←</button>
            <button id="tut-next">Lanjut →</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(tutEl);
    document.getElementById("tut-skip").onclick = closeTutorial;
    document.getElementById("tut-prev").onclick = () => goStep(tutStep - 1);
    document.getElementById("tut-next").onclick = () => {
      if (tutStep < STEPS.length - 1) goStep(tutStep + 1);
      else closeTutorial();
    };
  }
  tutStep = 0;
  tutEl.classList.add("open");
  goStep(0);
}
function goStep(n) {
  tutStep = Math.max(0, Math.min(n, STEPS.length - 1));
  const s = STEPS[tutStep];
  document.getElementById("tut-icon").innerHTML = s.icon;
  document.getElementById("tut-step-lbl").textContent = `${tutStep + 1} / ${STEPS.length}`;
  document.getElementById("tut-title").textContent = s.title;
  document.getElementById("tut-body").innerHTML = s.body;
  document.getElementById("tut-next").textContent = tutStep === STEPS.length - 1 ? "Mulai Menjelajah ✦" : "Lanjut →";
  document.getElementById("tut-prev").style.visibility = tutStep === 0 ? "hidden" : "visible";
  const dots = document.getElementById("tut-dots");
  dots.innerHTML = STEPS.map((_, i) => `<span class="tut-dot${i === tutStep ? " on" : ""}"></span>`).join("");
}
function closeTutorial() {
  tutEl && tutEl.classList.remove("open");
  localStorage.setItem("ss_tut_seen", "1");
}

// ── Help / Petunjuk panel ─────────────────────────────────────────
function buildHelp() {
  // ? button
  const helpBtn = document.createElement("button");
  helpBtn.id = "help-btn";
  helpBtn.title = "Petunjuk & Metadata";
  helpBtn.innerHTML = `<span>?</span>`;
  document.body.appendChild(helpBtn);

  // help modal
  const modal = document.createElement("div");
  modal.id = "help-modal";
  modal.innerHTML = `
    <div id="help-card">
      <div class="help-head">
        <div class="help-title">Petunjuk &amp; Metadata</div>
        <button id="help-close">×</button>
      </div>
      <div class="help-tabs" role="tablist">
        <button class="on" data-tab="interaksi">Interaksi</button>
        <button data-tab="sinyal">7 Sinyal</button>
        <button data-tab="etika">Etika</button>
        <button data-tab="glosarium">Glosarium</button>
      </div>
      <div class="help-body" id="help-body"></div>
    </div>`;
  document.body.appendChild(modal);

  const tabs = { interaksi: buildInteraksi, sinyal: buildSinyal, etika: buildEtika, glosarium: buildGlosarium };
  let activeTab = "interaksi";
  function loadTab(t) {
    activeTab = t;
    modal.querySelectorAll(".help-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
    document.getElementById("help-body").innerHTML = tabs[t]();
  }
  modal.querySelectorAll(".help-tabs button").forEach((b) => b.onclick = () => loadTab(b.dataset.tab));
  document.getElementById("help-close").onclick = () => modal.classList.remove("open");
  modal.onclick = (e) => { if (e.target === modal) modal.classList.remove("open"); };

  helpBtn.onclick = () => { modal.classList.add("open"); loadTab(activeTab); };
  loadTab("interaksi");

  // wire the tutorial reopen button (added in metadata section)
  document.body.addEventListener("click", (e) => {
    if (e.target.id === "tut-reopen") openTutorial();
  });
}

function buildInteraksi() {
  return `
    <div class="hi-grid">
      ${STEPS.map((s) => `<div class="hi-card">
        <div class="hi-icon">${s.icon}</div>
        <div><b>${s.title}</b><p>${s.body}</p></div>
      </div>`).join("")}
    </div>
    <div class="hi-meta">
      <div class="hi-meta-row"><span>Universe</span><b>984 saham AS tersedia di Pluang</b></div>
      <div class="hi-meta-row"><span>Refresh data</span><b>Otomatis setiap Senin via GitHub Actions (yfinance)</b></div>
      <div class="hi-meta-row"><span>Skor</span><b>0–100 setelah penalti etis sesuai mode aktif</b></div>
      <div class="hi-meta-row"><span>Penyimpanan</span><b>Watchlist &amp; portofolio disimpan di perangkat ini (localStorage)</b></div>
      <button id="tut-reopen" class="hi-tut-btn">↺ Tampilkan ulang tutorial</button>
    </div>`;
}

function buildSinyal() {
  return `
    <div class="hs-score">
      <div class="hs-score-h">Skala Skor Komposit (0–100)</div>
      ${SCORES.map((s) => `<div class="hs-row"><span class="r-act ${s.cls}">${s.range}</span>
        <b>${s.label}</b><i>${s.note}</i></div>`).join("")}
    </div>
    <div class="hs-sigs">
      ${SIGNALS.map((s) => `<div class="hs-sig">
        <div class="hs-sig-h"><b>${s.label}</b><span class="hs-w">bobot ${s.weight}</span></div>
        <p>${s.desc}</p>
      </div>`).join("")}
    </div>
    <p class="help-note">Metodologi: Fama-French (2015) 5-factor · AQR "Quality Minus Junk" · BlackRock factor investing · Research Affiliates value framework.</p>`;
}

function buildEtika() {
  return `
    <p class="help-intro">Setiap saham dinilai berdasarkan laporan publik tentang keterlibatan perusahaan dengan apartheid dan pendudukan Israel di Palestina.</p>
    <div class="he-modes">
      ${ETHICS_MODES.map((m) => `<div class="he-mode">
        <span class="r-act ${m.cls}">${m.name}</span><p>${m.desc}</p>
      </div>`).join("")}
    </div>
    <div class="he-ties">
      <div class="he-tie"><span class="r-act strong">Bersih / Eksposur Rendah</span><p>Tidak ada keterlibatan yang diketahui dari sumber publik. Monolit bercahaya giok.</p></div>
      <div class="he-tie"><span class="r-act hold">Terlibat Sedang</span><p>Ada indikasi afiliasi tapi bukan bisnis inti. Penalti skor 25 poin di mode non-Loose.</p></div>
      <div class="he-tie"><span class="r-act avoid">Afiliasi Kuat</span><p>Terbukti aktif menyokong: kontrak, investasi, atau pernyataan publik. Masuk daftar BDS / Who Profits. Dikecualikan dari skor.</p></div>
    </div>
    <p class="help-note">Sumber: BDS Movement · AFSC Investigate · Who Profits Research Center · UN OHCHR · HRW · Reuters · AP. Kondisi perusahaan bisa berubah — lakukan verifikasi mandiri.</p>`;
}

function buildGlosarium() {
  return `<div class="hg-grid">
    ${GLOSSARY.map(([t, d]) => `<div class="hg-item"><dt>${t}</dt><dd>${d}</dd></div>`).join("")}
  </div>
  <p class="help-note">Bukan nasihat investasi. Skor &amp; rekomendasi adalah output model multi-faktor publik — selalu lakukan riset dan verifikasi mandiri sebelum keputusan investasi.</p>`;
}
