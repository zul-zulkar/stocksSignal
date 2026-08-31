// =====================================================================
// Narasi deterministik — tingkat 0 dari lapisan "Sinyal AI".
//
// Merangkai kalimat penjelasan dari indikator, tanpa LLM sama sekali:
// nol biaya, jalan offline, hasilnya sama setiap kali, dan bisa di-unit-test.
//
// Ini yang menjamin SETIAP saham punya penjelasan — termasuk saat anggaran
// AI habis, workflow gagal, atau pengguna belum memasang API key sama sekali.
// Dengan 984 ticker, lapisan yang hanya menjangkau sebagian bukan lapisan.
//
// Keluarannya sengaja berbentuk SAMA dengan brief dari Claude (lihat
// scripts/ai_brief.py), sehingga UI cukup punya satu komponen render dan
// tidak peduli narasinya datang dari aturan atau dari model.
//
// Aturan yang dipegang: jangan pernah mengarang angka. Kalau indikatornya
// tidak ada, kalimatnya tidak ditulis — bukan diisi tebakan.
// =====================================================================

(function () {
  "use strict";

  const has = (x) => x != null && !(typeof x === "number" && !Number.isFinite(x));
  const n1 = (x) => (Math.round(x * 10) / 10).toString();
  const n0 = (x) => Math.round(x).toString();
  const money = (x) => "$" + (Math.round(x * 100) / 100).toFixed(2);
  const pct = (x) => (x >= 0 ? "+" : "") + n1(x) + "%";

  // Gabungkan klausa jadi satu kalimat yang enak dibaca, bukan daftar
  // terpotong-potong. Menyerahkan sederet fragmen ke pembaca itu bukan
  // penjelasan, itu memindahkan pekerjaan.
  function sentence(clauses) {
    const parts = clauses.filter(Boolean);
    if (!parts.length) return "";
    if (parts.length === 1) return cap(parts[0]) + ".";
    const last = parts.pop();
    return cap(parts.join(", ")) + ", dan " + last + ".";
  }

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  // ── teknikal ────────────────────────────────────────────────────────

  function trendClause(ind) {
    const { price, ema50, ema200 } = ind;
    if (!has(price) || !has(ema200)) return null;
    const adx = (ind.adx || {}).adx;
    let base;
    if (has(ema50) && price > ema50 && ema50 > ema200) {
      base = "harga berada di atas EMA50 dan EMA200 — susunan tren naik yang utuh";
    } else if (has(ema50) && price < ema50 && ema50 < ema200) {
      base = "harga berada di bawah EMA50 dan EMA200 — susunan tren turun yang utuh";
    } else if (price > ema200) {
      base = "harga masih di atas EMA200 meski susunannya belum rapi";
    } else {
      base = "harga masih di bawah EMA200";
    }
    if (!has(adx)) return base;
    // ADX rendah adalah peringatan yang sering hilang: susunan EMA terlihat
    // meyakinkan padahal pasarnya sedang menyamping.
    if (adx >= 25) return base + ", dengan ADX " + n0(adx) + " menandakan tren yang kuat";
    if (adx >= 20) return base + ", tapi ADX " + n0(adx) + " menunjukkan tren yang baru terbentuk";
    return base + ", namun ADX hanya " + n0(adx) + " sehingga arahnya masih lemah";
  }

  function macdClause(ind) {
    const m = ind.macd || {};
    if (!has(m.hist)) return null;
    if (m.hist > 0) return "histogram MACD positif, momentum jangka menengah condong naik";
    return "histogram MACD negatif, momentum jangka menengah masih tertekan";
  }

  function rsiClause(ind) {
    if (!has(ind.rsi)) return null;
    const r = ind.rsi;
    if (r < 30) return "RSI " + n0(r) + " sudah masuk wilayah jenuh jual";
    if (r > 70) return "RSI " + n0(r) + " sudah masuk wilayah jenuh beli";
    if (r < 45) return "RSI " + n0(r) + " condong lemah tapi belum ekstrem";
    if (r > 55) return "RSI " + n0(r) + " condong kuat tapi belum ekstrem";
    return "RSI " + n0(r) + " netral";
  }

  function bollingerClause(ind) {
    const b = ind.bollinger || {};
    if (!has(b.pctB)) return null;
    let s;
    if (b.pctB > 100) s = "harga menembus pita Bollinger atas";
    else if (b.pctB < 0) s = "harga menembus pita Bollinger bawah";
    else if (b.pctB > 80) s = "harga menempel di pita Bollinger atas";
    else if (b.pctB < 20) s = "harga menempel di pita Bollinger bawah";
    else s = null;
    if (b.squeeze === true) {
      const sq = "pita Bollinger menyempit, sering mendahului pergerakan besar";
      return s ? s + " dan " + sq : sq;
    }
    return s;
  }

  function volumeClause(ind) {
    const slope = ind.obvSlope, ratio = ind.volRatio;
    if (!has(slope)) return null;
    const dir = slope > 0.05 ? "akumulasi" : slope < -0.05 ? "distribusi" : null;
    if (!dir) return null;
    let s = "OBV menunjukkan " + dir;
    if (has(ratio) && ratio >= 1.5) s += " dengan volume " + n1(ratio) + "× rata-rata";
    else if (has(ratio) && ratio <= 0.6) s += ", tapi volumenya tipis";
    return s;
  }

  function crossClause(ind) {
    const c = ind.cross || {};
    if (!c.state || !has(c.daysSince)) return null;
    const label = c.state === "golden" ? "golden cross" : "death cross";
    // Umur cross itu penting: yang baru 3 hari beda arti dari yang 300 hari.
    if (c.daysSince <= 10) return label + " baru terjadi " + c.daysSince + " hari lalu";
    if (c.daysSince <= 60) return label + " terbentuk sekitar " + c.daysSince + " hari lalu";
    return label + " sudah berjalan lama (" + c.daysSince + " hari)";
  }

  function positionClause(ind) {
    const p = (ind.pos52w || {}).pct;
    if (!has(p)) return null;
    if (p >= 90) return "harga berada di dekat puncak 52 minggu";
    if (p <= 10) return "harga berada di dekat dasar 52 minggu";
    return "harga di " + n0(p) + "% rentang 52 minggu";
  }

  function technical(ind) {
    if (!ind) return "";
    return sentence([
      trendClause(ind), macdClause(ind), rsiClause(ind),
      bollingerClause(ind), volumeClause(ind), crossClause(ind), positionClause(ind),
    ]);
  }

  // ── fundamental ─────────────────────────────────────────────────────

  function fundamental(f, valuationScore) {
    if (!f) return "";
    const c = [];
    if (has(f.roe)) {
      const v = "ROE " + n1(f.roe * 100) + "%";
      c.push(f.roe >= 0.2 ? v + " tergolong tinggi" : f.roe < 0 ? v + " negatif" : v);
    }
    if (has(f.profitMargin)) {
      c.push("margin laba " + n1(f.profitMargin * 100) + "%");
    }
    if (has(f.fcfYield)) {
      const v = "FCF yield " + n1(f.fcfYield * 100) + "%";
      c.push(f.fcfYield >= 0.06 ? v + " termasuk menarik" : f.fcfYield < 0 ? v + " (arus kas bebas negatif)" : v);
    }
    if (has(f.revenueGrowth)) {
      c.push("pendapatan tumbuh " + pct(f.revenueGrowth * 100) + " tahunan");
    }
    if (has(f.debtToEquity) && f.debtToEquity > 200) {
      c.push("rasio utang terhadap ekuitas " + n0(f.debtToEquity) + " tergolong berat");
    }
    if (has(f.currentRatio) && f.currentRatio < 1) {
      c.push("current ratio di bawah 1, likuiditas jangka pendek ketat");
    }
    // Skor valuasi sudah relatif sektor, jadi kalimatnya boleh menyebut
    // "dibanding sektornya" tanpa mengarang.
    if (has(valuationScore)) {
      if (valuationScore >= 25) c.push("valuasinya lebih murah dari median sektornya");
      else if (valuationScore <= -25) c.push("valuasinya lebih mahal dari median sektornya");
    }
    return sentence(c);
  }

  // ── sentimen ────────────────────────────────────────────────────────

  function sentimen(an, f, verdict) {
    const c = [];
    if (an && an.numAnalysts > 0) {
      let s = an.numAnalysts + " analis mengikuti saham ini";
      if (has(an.ratingMean)) {
        s += an.ratingMean <= 1.8 ? " dengan konsensus Strong Buy"
           : an.ratingMean <= 2.5 ? " dengan mayoritas merekomendasikan Beli"
           : an.ratingMean >= 3.5 ? " dan cenderung menahan atau menjual"
           : " dengan konsensus netral";
      }
      c.push(s);
    }
    if (verdict && has(verdict.upsidePct) && has(verdict.target)) {
      c.push("target rata-rata " + money(verdict.target) + " atau " + pct(verdict.upsidePct) + " dari harga sekarang");
    }
    if (f && has(f.shortPctFloat)) {
      if (f.shortPctFloat >= 0.15) c.push("short interest " + n1(f.shortPctFloat * 100) + "% dari float tergolong tinggi");
      else if (f.shortPctFloat >= 0.08) c.push("short interest " + n1(f.shortPctFloat * 100) + "% cukup terasa");
    }
    if (f && has(f.heldInstitutions) && f.heldInstitutions >= 0.7) {
      c.push("kepemilikan institusi " + n0(f.heldInstitutions * 100) + "%");
    }
    return sentence(c);
  }

  // ── katalis & risiko ────────────────────────────────────────────────

  function katalis(ind, f, verdict, signals) {
    const out = [];
    if (ind) {
      const c = ind.cross || {};
      if (c.state === "golden" && has(c.daysSince) && c.daysSince <= 30) {
        out.push("Golden cross masih baru (" + c.daysSince + " hari)");
      }
      if ((ind.bollinger || {}).squeeze === true) out.push("Pita Bollinger menyempit — potensi breakout");
      if (ind.divergence === "bullish") out.push("Divergence bullish antara harga dan RSI");
      if (has(ind.obvSlope) && ind.obvSlope > 0.15) out.push("Akumulasi volume yang kuat");
      if (has(ind.rsi) && ind.rsi < 30) out.push("RSI jenuh jual, peluang pantulan teknikal");
    }
    if (verdict && has(verdict.upsidePct) && verdict.upsidePct >= 20) {
      out.push("Upside " + n0(verdict.upsidePct) + "% ke target analis");
    }
    if (f && has(f.revenueGrowth) && f.revenueGrowth >= 0.15) out.push("Pertumbuhan pendapatan di atas 15%");
    if (signals && has(signals.valuation) && signals.valuation >= 30) out.push("Valuasi diskon terhadap sektor");
    return out.slice(0, 4);
  }

  function risiko(ind, f, verdict, signals, ethics) {
    const out = [];
    if (ethics && ethics.israelTie === "high") {
      out.push("Dikecualikan filter etis: afiliasi Israel kuat");
    } else if (ethics && ethics.israelTie === "medium") {
      out.push("Eksposur etis sedang — kena penalti skor");
    }
    if (ind) {
      const r = ind.risk || {};
      if (has(r.volatility) && r.volatility >= 50) out.push("Volatilitas tahunan " + n0(r.volatility) + "%");
      if (has(r.maxDrawdown) && r.maxDrawdown <= -40) out.push("Pernah turun " + n0(Math.abs(r.maxDrawdown)) + "% dari puncak");
      if (has(r.beta) && r.beta >= 1.5) out.push("Beta " + n1(r.beta) + " — bergerak lebih liar dari pasar");
      if (ind.divergence === "bearish") out.push("Divergence bearish antara harga dan RSI");
      if (has(ind.rsi) && ind.rsi > 70) out.push("RSI jenuh beli");
      const adx = (ind.adx || {}).adx;
      if (has(adx) && adx < 20) out.push("Tren lemah (ADX " + n0(adx) + ") — sinyal arah kurang bisa diandalkan");
    }
    if (f && has(f.debtToEquity) && f.debtToEquity > 200) out.push("Beban utang tinggi");
    if (verdict && has(verdict.upsidePct) && verdict.upsidePct <= -5) {
      out.push("Harga sudah di atas target analis");
    }
    if (signals && has(signals.valuation) && signals.valuation <= -40) out.push("Valuasi premium terhadap sektor");
    return out.slice(0, 5);
  }

  // ── level kunci ─────────────────────────────────────────────────────

  function levelKunci(ind) {
    if (!ind) return {};
    const b = ind.bollinger || {}, p = ind.pos52w || {}, r = ind.risk || {};
    const out = {};
    // Support: pita bawah kalau ada, kalau tidak stop-loss ATR, kalau tidak
    // dasar 52 minggu. Tidak pernah mengarang level.
    if (has(b.lower)) out.support = Math.round(b.lower * 100) / 100;
    else if (has(r.stopLoss)) out.support = Math.round(r.stopLoss * 100) / 100;
    else if (has(p.low)) out.support = Math.round(p.low * 100) / 100;

    if (has(b.upper)) out.resisten = Math.round(b.upper * 100) / 100;
    else if (has(p.high)) out.resisten = Math.round(p.high * 100) / 100;
    return out;
  }

  // ── keyakinan & horizon ─────────────────────────────────────────────

  function keyakinan(ind, an) {
    // Keyakinan diukur dari seberapa banyak bukti yang tersedia DAN seberapa
    // sepakat arahnya — bukan dari seberapa ekstrem skornya.
    let evidence = 0, agree = 0;
    if (ind) {
      const checks = [
        has(ind.ema200) && has(ind.price) ? (ind.price > ind.ema200 ? 1 : -1) : null,
        has((ind.macd || {}).hist) ? (ind.macd.hist > 0 ? 1 : -1) : null,
        has((ind.supertrend || {}).dir) ? ind.supertrend.dir : null,
        has((ind.pos52w || {}).pct) ? (ind.pos52w.pct > 50 ? 1 : -1) : null,
      ];
      for (const c of checks) {
        if (c === null) continue;
        evidence++; agree += c;
      }
    }
    if (an && an.numAnalysts > 0) evidence++;
    if (evidence < 3) return "rendah";
    const ratio = Math.abs(agree) / Math.max(1, evidence);
    return ratio >= 0.75 ? "tinggi" : ratio >= 0.4 ? "sedang" : "rendah";
  }

  function horizon(ind) {
    if (!ind) return null;
    const adx = (ind.adx || {}).adx;
    if (has(adx) && adx >= 25) return "menengah (tren sedang berjalan)";
    if (has(ind.rsi) && (ind.rsi < 30 || ind.rsi > 70)) return "pendek (kondisi ekstrem, rawan berbalik)";
    return "menengah–panjang (belum ada urgensi teknikal)";
  }

  // ── ringkasan ───────────────────────────────────────────────────────

  function ringkasan(ctx, ind) {
    const bits = [];
    const label = ctx.verdict && ctx.verdict.label;
    if (label) bits.push(ctx.ticker + " saat ini terbaca " + label);
    else bits.push(ctx.ticker);

    if (has(ctx.composite)) bits.push("skor komposit " + n0(ctx.composite) + "/100");

    if (ind) {
      const t = trendClause(ind);
      if (t) bits.push(t.split(" — ")[0].split(", dengan ")[0].split(", tapi ")[0].split(", namun ")[0]);
    }
    if (ctx.verdict && has(ctx.verdict.upsidePct)) {
      bits.push("jarak ke target analis " + pct(ctx.verdict.upsidePct));
    }
    return sentence(bits);
  }

  // ── entri utama ─────────────────────────────────────────────────────

  /**
   * ctx: { ticker, name, sector, composite, signals, indicators,
   *        fundamentals, analyst, verdict, ethics }
   *
   * Memulangkan bentuk yang sama dengan brief AI, ditambah sumber:"aturan"
   * supaya UI bisa menandai asal narasinya dengan jujur.
   */
  function narrate(ctx) {
    if (!ctx || !ctx.ticker) return null;
    const ind = ctx.indicators || null;
    const f = ctx.fundamentals || null;

    const out = {
      ringkasan: ringkasan(ctx, ind),
      teknikal: technical(ind),
      fundamental: fundamental(f, ctx.signals ? ctx.signals.valuation : null),
      sentimen: sentimen(ctx.analyst, f, ctx.verdict),
      katalis: katalis(ind, f, ctx.verdict, ctx.signals),
      risiko: risiko(ind, f, ctx.verdict, ctx.signals, ctx.ethics),
      levelKunci: levelKunci(ind),
      keyakinan: keyakinan(ind, ctx.analyst),
      horizon: horizon(ind),
      sumber: "aturan",
    };

    // Saat indikator belum tersedia sama sekali (mis. data/indicators.js
    // belum pernah digenerate), katakan apa adanya alih-alih memulangkan
    // bagian-bagian kosong yang membingungkan.
    if (!out.teknikal) {
      out.teknikal = "Indikator teknikal belum tersedia untuk saham ini.";
    }
    return out;
  }

  window.NARRATE_LIB = {
    narrate,
    // diekspos untuk pengujian per-bagian
    technical, fundamental, sentimen, katalis, risiko,
    levelKunci, keyakinan, horizon, sentence,
  };
})();
