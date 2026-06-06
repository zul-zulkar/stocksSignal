// =====================================================================
// Verdict "Aksi" — menerjemahkan skor komposit + konsensus analis +
// upside ke target + valuasi + teknikal + filter etis menjadi satu
// rekomendasi yang bisa ditindaklanjuti.
//
// BUKAN nasihat investasi. Gabungan model multi-faktor publik +
// konsensus analis (yfinance). Selalu verifikasi mandiri.
// =====================================================================

(function () {
  const { compositeSignal, ethicsAdjustedScore } = window.SIGNAL_LIB;

  const ACTION_META = {
    STRONG_BUY: { label: "BELI KUAT", color: "strongbuy" },
    BUY:        { label: "BELI",      color: "buy" },
    HOLD:       { label: "TAHAN",     color: "hold" },
    REDUCE:     { label: "KURANGI",   color: "reduce" },
    AVOID:      { label: "HINDARI",   color: "avoid" },
  };

  // Harga terkini: overlay (hasil refresh) → data analis (yfinance).
  function priceOf(ticker) {
    const ov = (window.SIGNAL_OVERLAY || {})[ticker];
    if (ov && Number.isFinite(ov.lastClose)) return ov.lastClose;
    const an = (window.STOCK_ANALYST || {})[ticker];
    if (an && Number.isFinite(an.price)) return an.price;
    return null;
  }

  function analystOf(ticker) {
    return (window.STOCK_ANALYST || {})[ticker] || null;
  }

  // actionVerdict(stock, mode) -> { action, label, color, score, rationale,
  //                                 target, upsidePct, analyst, price }
  function actionVerdict(stock, mode = "balanced") {
    const an    = analystOf(stock.ticker);
    const price = priceOf(stock.ticker);
    const composite = compositeSignal(stock);
    const adj   = ethicsAdjustedScore(stock, mode);
    const s     = stock.signals;

    // upside ke target analis
    let upsidePct = null;
    const target = an && Number.isFinite(an.targetMean) ? an.targetMean : null;
    if (target && Number.isFinite(price) && price > 0) {
      upsidePct = (target - price) / price * 100;
    }

    // Etika mengecualikan → langsung HINDARI
    if (adj === null) {
      return done("AVOID", "Dikecualikan oleh filter etis (afiliasi kuat).",
                  { target, upsidePct, an, price, score: -99 });
    }

    let pts = 0;
    const reasons = [];

    if (composite >= 65)      { pts += 2; reasons.push("skor komposit tinggi"); }
    else if (composite >= 55) { pts += 1; reasons.push("skor komposit positif"); }
    else if (composite <= 34) { pts -= 2; reasons.push("skor komposit lemah"); }
    else if (composite <= 45) { pts -= 1; reasons.push("skor komposit di bawah netral"); }

    if (an && an.numAnalysts > 0 && Number.isFinite(an.ratingMean)) {
      if (an.ratingMean <= 1.8)      { pts += 2; reasons.push("konsensus analis Strong Buy"); }
      else if (an.ratingMean <= 2.5) { pts += 1; reasons.push("mayoritas analis Buy"); }
      else if (an.ratingMean >= 3.5) { pts -= 1; reasons.push("analis cenderung Hold/Sell"); }
    }

    if (upsidePct !== null) {
      if (upsidePct >= 20)      { pts += 2; reasons.push(`upside ~${upsidePct.toFixed(0)}% ke target`); }
      else if (upsidePct >= 10) { pts += 1; reasons.push(`upside ~${upsidePct.toFixed(0)}% ke target`); }
      else if (upsidePct <= -5) { pts -= 2; reasons.push(`harga di atas target analis (${upsidePct.toFixed(0)}%)`); }
    }

    if ((s.valuation || 0) >= 20)      { pts += 1; reasons.push("valuasi menarik"); }
    else if ((s.valuation || 0) <= -40){ pts -= 1; reasons.push("valuasi mahal"); }

    if ((s.technical || 0) >= 40)      { pts += 1; reasons.push("tren teknikal kuat"); }
    else if ((s.technical || 0) <= -40){ pts -= 1; reasons.push("tren teknikal lemah"); }

    let action;
    if (pts >= 4)       action = "STRONG_BUY";
    else if (pts >= 2)  action = "BUY";
    else if (pts >= -1) action = "HOLD";
    else if (pts >= -3) action = "REDUCE";
    else                action = "AVOID";

    const rationale = reasons.length
      ? reasons.slice(0, 3).join(" · ")
      : "Sinyal campuran — belum ada arah yang jelas.";

    return done(action, rationale, { target, upsidePct, an, price, score: pts });
  }

  function done(action, rationale, extra) {
    const meta = ACTION_META[action];
    return {
      action,
      label: meta.label,
      color: meta.color,
      rationale,
      target:    extra.target,
      upsidePct: extra.upsidePct,
      analyst:   extra.an,
      price:     extra.price,
      score:     extra.score,
    };
  }

  // Label rating analis mentah → teks Indonesia ringkas
  function ratingLabel(rating) {
    return ({
      strong_buy: "Strong Buy",
      buy:        "Buy",
      hold:       "Hold",
      underperform: "Underperform",
      sell:       "Sell",
    }[rating] || (rating ? String(rating) : "—"));
  }

  window.ADVICE_LIB = {
    actionVerdict,
    ratingLabel,
    priceOf,
    analystOf,
    ACTION_META,
  };
})();
