// Uji js/narrate.js — narasi deterministik tingkat 0.
//
// Yang paling penting diuji di sini bukan keindahan kalimatnya, melainkan
// dua janji: (1) setiap saham selalu dapat penjelasan, betapapun bolongnya
// data, dan (2) tidak pernah ada angka yang dikarang.

const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

const ctx = makeWindow();
load(ctx, "js/narrate.js");
const N = ctx.window.NARRATE_LIB;

const FULL_IND = {
  price: 120, ema20: 118, ema50: 110, ema200: 100,
  adx: { adx: 30, plusDI: 28, minusDI: 12 },
  macd: { line: 2.1, signal: 1.4, hist: 0.7 },
  rsi: 58, stoch: { k: 62, d: 58 },
  bollinger: { upper: 130, mid: 118, lower: 106, pctB: 58, bandwidth: 20, squeeze: false },
  supertrend: { dir: 1, value: 112 },
  cross: { state: "golden", daysSince: 8 },
  pos52w: { high: 135, low: 90, pct: 67 },
  obvSlope: 0.2, volRatio: 1.6, atr: 3.1, atrPct: 2.6,
  divergence: null,
  risk: { beta: 1.1, volatility: 28, maxDrawdown: -22, stopLoss: 113.8, level: 3, levelLabel: "Sedang" },
};

const FULL_FUND = {
  roe: 0.31, profitMargin: 0.24, fcfYield: 0.07, revenueGrowth: 0.18,
  debtToEquity: 90, currentRatio: 1.6, shortPctFloat: 0.03, heldInstitutions: 0.74,
};

const BASE = {
  ticker: "AAPL", name: "Apple Inc.", sector: "Technology", composite: 64,
  signals: { technical: 30, momentum: 20, sentiment: 44, news: 5, policy: 15, profile: 65, valuation: 10 },
  indicators: FULL_IND,
  fundamentals: FULL_FUND,
  analyst: { numAnalysts: 41, ratingMean: 2.13, targetMean: 322.28 },
  verdict: { label: "BELI", target: 322.28, upsidePct: 5.3 },
  ethics: { israelTie: "medium" },
};

// ── janji 1: selalu ada penjelasan ───────────────────────────────────

test("saham dengan data lengkap mendapat semua bagian terisi", () => {
  const r = N.narrate(BASE);
  for (const key of ["ringkasan", "teknikal", "fundamental", "sentimen"]) {
    assert.ok(r[key] && r[key].length > 20, `${key} kosong/terlalu pendek: ${r[key]}`);
  }
  assert.ok(r.katalis.length > 0, "katalis kosong");
  assert.ok(r.risiko.length > 0, "risiko kosong");
  assert.ok(r.keyakinan, "keyakinan kosong");
});

test("tanpa indikator sama sekali tetap memulangkan narasi yang jujur", () => {
  // data/indicators.js belum pernah digenerate — kasus nyata pada run pertama.
  const r = N.narrate({ ...BASE, indicators: null });
  assert.ok(r, "narasi null");
  assert.match(r.teknikal, /belum tersedia/i);
  assert.ok(r.ringkasan.length > 0);
});

test("tanpa fundamental, analis, dan verdict tetap tidak crash", () => {
  const r = N.narrate({ ticker: "XYZ", indicators: FULL_IND });
  assert.ok(r.teknikal.length > 20);
  assert.strictEqual(r.fundamental, "");
  assert.strictEqual(r.sentimen, "");
});

test("konteks kosong/tak bertickers memulangkan null, bukan melempar", () => {
  assert.strictEqual(N.narrate(null), null);
  assert.strictEqual(N.narrate({}), null);
});

test("indikator serba-null tidak menghasilkan NaN atau undefined di teks", () => {
  const empty = {
    price: null, ema50: null, ema200: null, adx: {}, macd: {}, rsi: null,
    stoch: {}, bollinger: {}, supertrend: {}, cross: {}, pos52w: {}, risk: {},
  };
  const r = N.narrate({ ticker: "ZZZ", indicators: empty });
  const blob = JSON.stringify(r);
  assert.ok(!blob.includes("NaN"), "ada NaN: " + blob);
  assert.ok(!blob.includes("undefined"), "ada undefined: " + blob);
  assert.ok(!blob.includes("null%"), "ada null% : " + blob);
});

// ── janji 2: tidak mengarang angka ───────────────────────────────────

test("kalimat RSI hanya muncul kalau RSI-nya ada", () => {
  assert.match(N.technical({ rsi: 25 }), /RSI 25/);
  assert.ok(!/RSI/.test(N.technical({ price: 100, ema200: 90 })));
});

test("level kunci diambil dari indikator, tidak pernah dikarang", () => {
  assert.deepStrictEqual(
    { ...N.levelKunci({ bollinger: { lower: 106.123, upper: 130.456 } }) },
    { support: 106.12, resisten: 130.46 }
  );
  // Tanpa Bollinger, jatuh ke stop-loss ATR lalu ke rentang 52 minggu.
  assert.strictEqual(N.levelKunci({ risk: { stopLoss: 95.5 } }).support, 95.5);
  assert.strictEqual(N.levelKunci({ pos52w: { low: 80, high: 140 } }).resisten, 140);
  // Tanpa apa pun: objek kosong, bukan angka tebakan.
  assert.deepStrictEqual({ ...N.levelKunci({}) }, {});
  assert.deepStrictEqual({ ...N.levelKunci(null) }, {});
});

test("angka yang disebut cocok dengan indikator yang diberikan", () => {
  const t = N.technical({ ...FULL_IND, rsi: 73, adx: { adx: 31 }, pos52w: { pct: 94 } });
  assert.match(t, /RSI 73/);
  assert.match(t, /ADX 31/);
  assert.match(t, /puncak 52 minggu/);
});

// ── isi narasi bereaksi terhadap data ────────────────────────────────

test("susunan EMA naik dan turun menghasilkan kalimat berbeda", () => {
  const up = N.technical({ price: 120, ema50: 110, ema200: 100, adx: { adx: 30 } });
  const down = N.technical({ price: 80, ema50: 90, ema200: 100, adx: { adx: 30 } });
  assert.match(up, /tren naik/);
  assert.match(down, /tren turun/);
});

test("ADX lemah diberi peringatan, ADX kuat tidak", () => {
  const weak = N.technical({ price: 120, ema50: 110, ema200: 100, adx: { adx: 12 } });
  const strong = N.technical({ price: 120, ema50: 110, ema200: 100, adx: { adx: 32 } });
  assert.match(weak, /lemah/);
  assert.match(strong, /kuat/);
});

test("umur golden cross ikut disebut", () => {
  assert.match(N.technical({ cross: { state: "golden", daysSince: 3 } }), /3 hari lalu/);
  // sentence() mengapitalkan huruf pertama, jadi cocokkan kedua kapitalisasi
  assert.match(N.technical({ cross: { state: "death", daysSince: 400 } }), /[Dd]eath cross/);
  assert.match(N.technical({ cross: { state: "death", daysSince: 400 } }), /400 hari/);
});

test("squeeze Bollinger muncul sebagai katalis", () => {
  const k = N.katalis({ bollinger: { squeeze: true } }, null, null, null);
  assert.ok(k.some((x) => /menyempit/i.test(x)), JSON.stringify(k));
});

test("divergence bullish jadi katalis, bearish jadi risiko", () => {
  assert.ok(N.katalis({ divergence: "bullish" }, null, null, null).some((x) => /bullish/i.test(x)));
  assert.ok(N.risiko({ divergence: "bearish" }, null, null, null, null).some((x) => /bearish/i.test(x)));
});

test("afiliasi etis kuat selalu jadi risiko teratas", () => {
  // Ini pembeda utama aplikasi ini; ia tidak boleh tenggelam di daftar.
  const r = N.risiko(FULL_IND, FULL_FUND, null, null, { israelTie: "high" });
  assert.match(r[0], /etis/i);
});

test("valuasi disebut relatif sektor, bukan relatif angka absolut", () => {
  // Skor valuasi memang sudah relatif sektor sejak Fase 2.
  const cheap = N.fundamental(FULL_FUND, 40);
  const rich = N.fundamental(FULL_FUND, -50);
  assert.match(cheap, /median sektor/);
  assert.match(rich, /median sektor/);
  assert.notStrictEqual(cheap, rich);
});

test("short interest tinggi ikut disebut di sentimen", () => {
  const s = N.sentimen({ numAnalysts: 10, ratingMean: 2.0 }, { shortPctFloat: 0.22 }, null);
  assert.match(s, /short interest/i);
});

// ── keyakinan ────────────────────────────────────────────────────────

test("keyakinan tinggi saat semua bukti searah", () => {
  const bull = { price: 120, ema200: 100, macd: { hist: 1 }, supertrend: { dir: 1 }, pos52w: { pct: 80 } };
  assert.strictEqual(N.keyakinan(bull, { numAnalysts: 20 }), "tinggi");
});

test("keyakinan rendah saat bukti saling bertentangan", () => {
  const mixed = { price: 120, ema200: 100, macd: { hist: -1 }, supertrend: { dir: -1 }, pos52w: { pct: 80 } };
  assert.strictEqual(N.keyakinan(mixed, { numAnalysts: 20 }), "rendah");
});

test("keyakinan rendah saat buktinya terlalu sedikit", () => {
  // Data tipis harus menurunkan keyakinan, bukan menaikkannya diam-diam.
  assert.strictEqual(N.keyakinan({ rsi: 20 }, null), "rendah");
  assert.strictEqual(N.keyakinan(null, null), "rendah");
});

// ── bentuk keluaran ──────────────────────────────────────────────────

test("bentuknya sama dengan brief AI supaya UI cukup satu renderer", () => {
  const r = N.narrate(BASE);
  assert.deepStrictEqual(
    Object.keys(r).sort(),
    ["fundamental", "horizon", "katalis", "keyakinan", "levelKunci",
     "ringkasan", "risiko", "sentimen", "sumber", "teknikal"]
  );
  assert.strictEqual(r.sumber, "aturan", "asal narasi harus ditandai jujur");
});

test("daftar katalis dan risiko dibatasi agar tetap terbaca", () => {
  const r = N.narrate(BASE);
  assert.ok(r.katalis.length <= 4, "katalis: " + r.katalis.length);
  assert.ok(r.risiko.length <= 5, "risiko: " + r.risiko.length);
});

test("kalimat gabungan dirangkai rapi, bukan daftar terpotong", () => {
  assert.strictEqual(N.sentence(["satu"]), "Satu.");
  assert.strictEqual(N.sentence(["satu", "dua"]), "Satu, dan dua.");
  assert.strictEqual(N.sentence(["satu", "dua", "tiga"]), "Satu, dua, dan tiga.");
  assert.strictEqual(N.sentence([null, undefined, ""]), "");
});

test("setiap kalimat diakhiri titik dan diawali huruf besar atau angka", () => {
  const r = N.narrate(BASE);
  for (const key of ["ringkasan", "teknikal", "fundamental", "sentimen"]) {
    if (!r[key]) continue;
    // Angka di awal itu sah ("41 analis mengikuti saham ini").
    assert.match(r[key], /^[A-Z0-9]/, `${key} tidak diawali huruf besar/angka: ${r[key]}`);
    assert.match(r[key], /\.$/, `${key} tidak diakhiri titik: ${r[key]}`);
  }
});
