// js/interpret.js — lapis interpretasi "angka ini artinya apa buatku".
// Yang dijaga di sini bukan cuma "tidak crash", tapi dua janji isi:
//   1. peringatannya SPESIFIK ke saham itu (menyebut faktor terlemahnya),
//   2. tidak pernah mengarang konsensus analis saat datanya tidak ada.
const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load, mkStock } = require("./_loader.cjs");

function ctx() {
  const c = makeWindow();
  load(c, "js/signals.js");
  load(c, "js/advice.js");
  load(c, "js/interpret.js");
  return c;
}
const C = ctx();
const I = C.INTERPRET_LIB;
const A = C.ADVICE_LIB;

const stockWith = (signals, over = {}) => mkStock({
  ticker: "AAA",
  signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 0, ...signals },
  ...over,
});
const insight = (stock, mode = "balanced") =>
  I.verdictInsight(stock, mode, A.actionVerdict(stock, mode), C.SIGNAL_LIB.ethicsAdjustedScore(stock, mode));
const allText = (o) => [o.headline, ...o.doNow, ...o.watchOut, ...o.verify].join(" ");

test("weakest/strongest menemukan faktor yang benar", () => {
  const s = { technical: 10, momentum: -70, sentiment: 5, news: 0, policy: 0, profile: 80, valuation: -3 };
  assert.strictEqual(I.weakest(s).key, "momentum");
  assert.strictEqual(I.weakest(s).value, -70);
  assert.strictEqual(I.strongest(s).key, "profile");
});

test("kelima verdict menghasilkan insight yang terisi", () => {
  const cases = [
    stockWith({ technical: 90, momentum: 90, sentiment: 90, news: 90, policy: 90, profile: 90, valuation: 90 }),
    stockWith({ profile: 60, momentum: 40 }),
    stockWith({}),
    stockWith({ technical: -60, profile: -50, valuation: -60 }),
    stockWith({ technical: -95, momentum: -95, sentiment: -95, news: -95, policy: -95, profile: -95, valuation: -95 }),
  ];
  const actions = new Set();
  for (const st of cases) {
    const v = A.actionVerdict(st, "balanced");
    actions.add(v.action);
    const o = insight(st);
    assert.ok(o.headline.length > 20, v.action + " headline pendek: " + o.headline);
    assert.ok(o.doNow.length > 0, v.action + " tanpa doNow");
    assert.ok(o.watchOut.length > 0, v.action + " tanpa watchOut");
    assert.ok(o.verify.length > 0, v.action + " tanpa verify");
  }
  assert.ok(actions.size >= 4, "verdict yang teruji cuma: " + [...actions].join(","));
});

test("watchOut menyebut faktor terlemah saham itu, bukan teks tetap", () => {
  const a = insight(stockWith({ profile: 70, momentum: 60, valuation: -80 }));
  const b = insight(stockWith({ profile: 70, valuation: 40, news: -80 }));
  assert.ok(a.watchOut.join(" ").includes("Valuasi"), a.watchOut.join(" "));
  assert.ok(b.watchOut.join(" ").includes("Berita"), b.watchOut.join(" "));
  assert.notStrictEqual(a.watchOut[0], b.watchOut[0], "peringatannya identik — berarti template");
});

test("tier high di strict/balanced → insight pengecualian & menyebut Loose", () => {
  const st = stockWith({ profile: 90 }, { ethics: { israelTie: "high", rationale: "", sources: [] } });
  for (const mode of ["strict", "balanced"]) {
    const o = insight(st, mode);
    const txt = allText(o);
    assert.ok(/dikecualikan|disingkirkan/i.test(txt), mode + ": " + txt);
    assert.ok(/Loose/.test(txt), mode + " tidak menyebut jalan keluarnya");
    assert.ok(!/cicil bertahap/i.test(txt), mode + " malah menyarankan masuk");
  }
});

test("tier high di mode loose tidak dikecualikan, tapi tetap diberi tahu", () => {
  const st = stockWith({ profile: 90 }, { ethics: { israelTie: "high", rationale: "", sources: [] } });
  const txt = allText(insight(st, "loose"));
  assert.ok(/pilihan sadar|Loose/i.test(txt), txt);
});

test("tanpa data analis, tidak ada klaim konsensus analis", () => {
  const st = stockWith({ profile: 70, momentum: 50 });   // STOCK_ANALYST kosong
  const txt = allText(insight(st));
  assert.ok(!/konsensus analis|Strong Buy|target analis/i.test(txt), txt);
  assert.ok(/tidak ada liputan analis/i.test(txt), "seharusnya menyebut ketiadaan liputan: " + txt);
});

test("dengan data analis, tidak mengklaim ketiadaan liputan", () => {
  const c = ctx();
  c.STOCK_ANALYST = { AAA: { numAnalysts: 30, ratingMean: 1.6, targetMean: 200, price: 100 } };
  const st = stockWith({ profile: 70 });
  const o = c.INTERPRET_LIB.verdictInsight(st, "balanced",
    c.ADVICE_LIB.actionVerdict(st, "balanced"),
    c.SIGNAL_LIB.ethicsAdjustedScore(st, "balanced"));
  const txt = [o.headline, ...o.doNow, ...o.watchOut, ...o.verify].join(" ");
  assert.ok(!/tidak ada liputan analis/i.test(txt), txt);
  assert.ok(/30 analis/.test(txt), "seharusnya menyebut jumlah analis: " + txt);
});

test("upside sangat besar diberi peringatan tersendiri", () => {
  const c = ctx();
  c.STOCK_ANALYST = { AAA: { numAnalysts: 12, ratingMean: 1.5, targetMean: 300, price: 100 } };
  const st = stockWith({ profile: 70 });
  const o = c.INTERPRET_LIB.verdictInsight(st, "balanced",
    c.ADVICE_LIB.actionVerdict(st, "balanced"),
    c.SIGNAL_LIB.ethicsAdjustedScore(st, "balanced"));
  assert.ok(o.watchOut.join(" ").includes("Upside"), o.watchOut.join(" "));
});

test("signalInsight punya teks untuk seluruh 7 faktor di tiap pita", () => {
  for (const k of ["technical","momentum","sentiment","news","policy","profile","valuation"]) {
    for (const v of [90, 0, -90]) {
      assert.ok(I.signalInsight(k, v).length > 15, `${k}@${v} kosong`);
    }
  }
});

test("dividendInsight membedakan payout aman vs payout tinggi", () => {
  const aman   = I.dividendInsight(4, 40);
  const tinggi = I.dividendInsight(4, 92);
  assert.ok(/aman/i.test(aman), aman);
  assert.ok(/80%|sempit/i.test(tinggi), tinggi);
  assert.notStrictEqual(aman, tinggi);
  assert.ok(/Tidak membagikan dividen/i.test(I.dividendInsight(0, 0)));
});

test("dividendInsight menandai yield sangat tinggi sebagai kemungkinan jebakan", () => {
  assert.ok(/harganya jatuh/i.test(I.dividendInsight(9, 50)), I.dividendInsight(9, 50));
});

test("scoreInsight menutup seluruh pita termasuk null", () => {
  for (const v of [null, 10, 40, 50, 60, 90]) {
    assert.ok(I.scoreInsight(v).length > 15, "pita " + v + " kosong");
  }
  assert.ok(/Dikecualikan/i.test(I.scoreInsight(null)));
});

test("ethicsInsight berbeda untuk tiap tier, dan peka mode", () => {
  const tiers = ["none", "low", "medium", "high", "unknown"];
  const seen = new Set(tiers.map(t => I.ethicsInsight(t, "balanced")));
  assert.strictEqual(seen.size, tiers.length, "ada tier yang teksnya sama");
  assert.notStrictEqual(I.ethicsInsight("high", "balanced"), I.ethicsInsight("high", "loose"));
  assert.notStrictEqual(I.ethicsInsight("medium", "balanced"), I.ethicsInsight("medium", "loose"));
});

test("portfolioInsight menangani kosong, untung, dan rugi", () => {
  assert.ok(/Belum ada posisi/i.test(I.portfolioInsight(null)));
  assert.ok(/Untung/i.test(I.portfolioInsight({ cost: 100, pnlPct: 30, annualDividend: 0 })));
  assert.ok(/Rugi/i.test(I.portfolioInsight({ cost: 100, pnlPct: -30, annualDividend: 0 })));
  assert.ok(/dividen setahun/i.test(I.portfolioInsight({ cost: 100, pnlPct: 5, annualDividend: 4 })));
});

test("tidak ada kalimat yang menyuruh membeli atau menjual", () => {
  // Batas yang disengaja: interpretasi, bukan nasihat transaksi.
  const larangan = /\b(belilah|jual sekarang|segera beli|wajib beli|harus jual|pasti naik|dijamin)\b/i;
  const samples = [
    stockWith({ technical: 90, momentum: 90, profile: 90 }),
    stockWith({}),
    stockWith({ technical: -90, profile: -90 }),
    stockWith({ profile: 50 }, { ethics: { israelTie: "high", rationale: "", sources: [] } }),
  ];
  for (const st of samples) {
    for (const mode of ["strict", "balanced", "loose"]) {
      const txt = allText(insight(st, mode));
      assert.ok(!larangan.test(txt), "kalimat menyuruh transaksi: " + txt);
    }
  }
});

test("universe asli: 984 saham menghasilkan insight tanpa error", () => {
  const c = makeWindow();
  load(c, "data/stocks.js");
  load(c, "data/analyst.js");
  load(c, "data/signals-overlay.js");
  load(c, "js/signals.js");
  load(c, "js/advice.js");
  load(c, "js/interpret.js");
  const I2 = c.INTERPRET_LIB, A2 = c.ADVICE_LIB, S2 = c.SIGNAL_LIB;
  let n = 0, excluded = 0;
  for (const st of c.STOCK_UNIVERSE) {
    const adj = S2.ethicsAdjustedScore(st, "balanced");
    const o = I2.verdictInsight(st, "balanced", A2.actionVerdict(st, "balanced"), adj);
    assert.ok(o.headline && o.doNow.length && o.watchOut.length, st.ticker);
    I2.foreverInsight(st);
    I2.dividendInsight(st.fundamentals.dividendYield || 0, st.fundamentals.payoutRatio || 0);
    if (adj === null) excluded++;
    n++;
  }
  assert.ok(n > 900, "universe terlalu kecil: " + n);
  assert.ok(excluded > 0, "tidak ada saham dikecualikan — jalur itu tak teruji");
});

test("ambang impact selaras dengan band SIGNAL_META di app.js", () => {
  // Keduanya tampil bersebelahan di tab Detail Sinyal. Kalau band-nya
  // berbeda, layar menampilkan dua kalimat yang bertentangan — persis bug
  // yang pernah muncul: Teknikal +31 dideskripsikan "tren positif moderat"
  // sementara interpretasinya bilang "arah harga belum jelas".
  const BOUNDARY = {
    technical: 20, momentum: 20, profile: 20,
    sentiment: 10, news: 10, policy: 10,
    valuation: 0,
  };
  for (const [key, edge] of Object.entries(BOUNDARY)) {
    const positif = I.signalInsight(key, edge);
    const netral  = I.signalInsight(key, edge - 1);
    assert.notStrictEqual(positif, netral,
      `${key}: band tidak berpindah tepat di ${edge}`);
    // Tepat di ambang harus sudah versi positif, bukan versi netral.
    assert.strictEqual(I.signalInsight(key, edge + 5), positif,
      `${key}: di atas ambang seharusnya tetap versi positif`);
  }
});

test("tidak ada teks impact yang dipakai ulang lintas faktor", () => {
  // Teks yang sama di dua faktor berarti interpretasinya generik.
  // Dibandingkan LINTAS faktor saja. Di dalam satu faktor, dua skor
  // memang boleh jatuh di band yang sama (mis. valuation +60 dan 0
  // sama-sama masuk band positif yang dimulai dari 0).
  const seen = new Map();
  for (const k of ["technical","momentum","sentiment","news","policy","profile","valuation"]) {
    const milik = new Set([60, 0, -60].map(v => I.signalInsight(k, v)));
    for (const t of milik) {
      if (seen.has(t)) assert.fail(`teks sama dipakai ${seen.get(t)} dan ${k}: "${t.slice(0, 40)}…"`);
      seen.set(t, k);
    }
  }
});
