// =====================================================================
// Terapkan lapis edit manual ke dataset dunia 3D.
// =====================================================================
// world.html tidak membaca window.STOCK_UNIVERSE — ia membaca
// data/world-data.js, dataset ringkas yang skornya SUDAH dihitung di muka
// oleh scripts/build_world_data.py. Tanpa patch ini, saham yang diedit
// lewat tab "Edit" di dashboard akan tampil dengan skor & rekomendasi lama
// di dunia, bahkan bisa berdiri di babak yang salah.
//
// Ini HARUS classic script yang jalan sebelum module graph: js/world/curate.js
// membaca window.WORLD_DATA di top-level saat di-import, jadi patch harus
// sudah selesai sebelum itu.
//
// Sengaja hanya menyentuh ticker yang benar-benar diedit — sisanya dibiarkan
// persis seperti hasil Python, supaya tidak ada drift antara jround() di
// Python dan Math.round() di JS untuk 99% data yang tak tersentuh.
// =====================================================================

(function () {
  const D = window.WORLD_DATA;
  const RL = window.REFRESH_LIB;
  const SL = window.SIGNAL_LIB;
  const AL = window.ADVICE_LIB;
  if (!Array.isArray(D) || !RL || !SL || !AL) return;

  const manual = RL.mergedManual();
  const edited = Object.keys(manual).filter(t => manual[t] && manual[t].signals
                                                && Object.keys(manual[t].signals).length);
  if (!edited.length) return;   // tidak ada edit → WORLD_DATA tidak disentuh sama sekali

  // Entri world-data sudah membawa price/target/nA/rMean, jadi advice.js bisa
  // dipakai apa adanya tanpa memuat data/analyst.js (196KB) atau stocks.js (522KB).
  const analyst = {};
  for (const o of D) {
    analyst[o.t] = {
      targetMean:  o.target,
      price:       o.price,
      numAnalysts: o.nA,
      ratingMean:  o.rMean,
      rating:      o.rating,
    };
  }
  window.STOCK_ANALYST = Object.assign({}, window.STOCK_ANALYST, analyst);

  // Bentuk stock sesuai yang diharapkan signals.js & advice.js.
  function asStock(o) {
    return {
      ticker: o.t,
      name:   o.n,
      sector: o.sec,
      ethics: { israelTie: o.tie },
      fundamentals: { dividendYield: o.dy, marketCapB: o.cap },
      signals: o.sig,
    };
  }

  const byTicker = {};
  for (const o of D) byTicker[o.t] = o;

  let touched = 0;
  for (const t of edited) {
    const o = byTicker[t];
    if (!o) continue;   // ticker diedit tapi tidak ada di dataset dunia

    for (const [k, v] of Object.entries(manual[t].signals)) {
      if (Number.isFinite(v)) o.sig[k] = v;
    }

    const st = asStock(o);
    o.comp = SL.compositeSignal(st);
    o.adjS = SL.ethicsAdjustedScore(st, "strict");
    o.adjB = SL.ethicsAdjustedScore(st, "balanced");
    o.adjL = SL.ethicsAdjustedScore(st, "loose");

    const v = AL.actionVerdict(st, "balanced");
    o.act    = v.action;
    o.vscore = v.score;
    if (v.upsidePct != null) o.upside = Math.round(v.upsidePct * 10) / 10;
    o.edited = true;   // dipakai kalau nanti dunia mau menandai saham yang diedit
    touched++;
  }

  if (!touched) return;

  // Forever Pocket & hitungan KPI ikut dihitung ulang, kalau tidak babak
  // "sanctuary" di dunia bisa berbeda dari Forever Pocket di dashboard.
  const all = D.map(asStock);
  const META = window.WORLD_META || (window.WORLD_META = {});
  const pocket = SL.buildForeverPocket(all, (META.forever || []).length || 10);
  META.forever = pocket.map(p => p.stock.ticker);
  META.total   = D.length;
  META.flagged = D.filter(o => o.tie === "high").length;
  META.clean   = D.filter(o => ["none", "low"].includes(o.tie)).length;
  META.opps    = D.filter(o => o.act === "BUY" || o.act === "STRONG_BUY").length;

  console.info(`[world] lapis manual diterapkan ke ${touched} ticker`);
})();
