// =====================================================================
// Dataset dunia 3D — dibangun saat runtime dari sumber yang sama dengan
// dashboard, bukan dari berkas hasil generate terpisah.
// =====================================================================
// Sebelumnya data/world-data.js di-generate scripts/build_world_data.py,
// yang berarti seluruh matematika skoring js/signals.js + js/advice.js
// disalin ulang ke Python (lengkap dengan parser regex untuk stocks.js).
// Dua salinan logika yang harus selalu cocok = sumber bug yang menunggu
// terjadi. Di sini semuanya dihitung dari pustaka yang sama persis, jadi
// dunia tidak mungkin melenceng dari dashboard.
//
// Harus classic script yang jalan SEBELUM module graph: js/world/curate.js
// membaca window.WORLD_DATA di top-level saat di-import.
// =====================================================================

(function () {
  const SL = window.SIGNAL_LIB;
  const AL = window.ADVICE_LIB;
  const universe = window.STOCK_UNIVERSE;
  if (!SL || !AL || !Array.isArray(universe)) return;

  if (window.REFRESH_LIB) window.REFRESH_LIB.applyOverlay();

  // Bulatkan ke 1 desimal; kembalikan bilangan bulat kalau memang bulat.
  function round1(x) {
    if (x == null || !Number.isFinite(x)) return null;
    return Math.round(x * 10) / 10;
  }

  const rows = universe.map(s => {
    const an = AL.analystOf(s.ticker);
    const v  = AL.actionVerdict(s, "balanced");
    return {
      t:   s.ticker,
      n:   s.name,
      sec: s.sector,
      tie: s.ethics.israelTie,
      why: s.ethics.rationale,
      dy:  s.fundamentals.dividendYield || 0,
      cap: s.fundamentals.marketCapB || 0,
      sig: { ...s.signals },

      comp: SL.compositeSignal(s),
      adjS: SL.ethicsAdjustedScore(s, "strict"),
      adjB: SL.ethicsAdjustedScore(s, "balanced"),
      adjL: SL.ethicsAdjustedScore(s, "loose"),

      act:    v.action,
      vscore: v.score,
      price:  AL.priceOf(s.ticker),
      target: an && Number.isFinite(an.targetMean) ? an.targetMean : null,
      upside: round1(v.upsidePct),
      rating: an ? an.rating : null,
      nA:     an && Number.isFinite(an.numAnalysts) ? an.numAnalysts : 0,
      rMean:  an && Number.isFinite(an.ratingMean) ? an.ratingMean : null,
    };
  });

  const CLEAN = ["none", "low"];
  window.WORLD_DATA = rows;
  window.WORLD_META = {
    total:   rows.length,
    flagged: rows.filter(r => r.tie === "high").length,
    clean:   rows.filter(r => CLEAN.includes(r.tie)).length,
    opps:    rows.filter(r => r.act === "BUY" || r.act === "STRONG_BUY").length,
    forever: SL.buildForeverPocket(universe, 10).map(p => p.stock.ticker),
  };
})();
