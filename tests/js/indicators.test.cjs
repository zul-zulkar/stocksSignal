// Uji js/indicators.js.
//
// Dua lapis, sama seperti tests/test_indicators.py:
//   1. KEBENARAN — properti & nilai yang diketahui pasti.
//   2. PARITAS   — bandingkan dengan tests/fixtures/indicators_expected.json,
//      file yang persis sama dipakai sisi Python. Kalau salah satu port
//      diubah tanpa yang lain, suite ini merah.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { makeWindow, load, ROOT } = require("./_loader.cjs");

const ctx = makeWindow();
load(ctx, "js/indicators.js");
const IND = ctx.window.INDICATOR_LIB;

const FIXTURES = path.join(ROOT, "tests", "fixtures");
const ohlcv = JSON.parse(fs.readFileSync(path.join(FIXTURES, "ohlcv_sample.json"), "utf8"));
const expected = JSON.parse(fs.readFileSync(path.join(FIXTURES, "indicators_expected.json"), "utf8"));

const O = ohlcv.open, H = ohlcv.high, L = ohlcv.low, C = ohlcv.close, V = ohlcv.volume;

// Toleransi longgar-tapi-ketat: 1e-6 relatif. Beda floating point antara
// akumulasi pandas dan JS wajar di digit terakhir; beda rumus tidak.
function closeTo(actual, want, label) {
  if (want === null) return assert.strictEqual(actual, null, label);
  assert.ok(actual !== null && actual !== undefined, `${label}: dapat ${actual}`);
  const tol = Math.max(1e-6, Math.abs(want) * 1e-9);
  assert.ok(
    Math.abs(actual - want) <= tol,
    `${label}: JS ${actual} vs Python ${want} (selisih ${Math.abs(actual - want)})`
  );
}

const ramp = (n, start = 100, step = 1) => Array.from({ length: n }, (_, i) => start + step * i);
const flat = (n, v = 100) => new Array(n).fill(v);
const hiOf = (c) => c.map((x) => x * 1.01);
const loOf = (c) => c.map((x) => x * 0.99);

// ── paritas dengan Python ─────────────────────────────────────────────

test("paritas: indikator skalar cocok dengan fixture Python", () => {
  closeTo(IND.rsi(C), expected.rsi, "rsi");
  closeTo(IND.ema(C, 20), expected.ema20, "ema20");
  closeTo(IND.ema(C, 50), expected.ema50, "ema50");
  closeTo(IND.ema(C, 200), expected.ema200, "ema200");
  closeTo(IND.sma(C, 50), expected.sma50, "sma50");
  closeTo(IND.sma(C, 200), expected.sma200, "sma200");
  closeTo(IND.volumeRatio(V), expected.volRatio, "volRatio");
});

test("paritas: MACD cocok dengan fixture Python", () => {
  const m = IND.macd(C);
  closeTo(m.line, expected.macd.line, "macd.line");
  closeTo(m.signal, expected.macd.signal, "macd.signal");
  closeTo(m.hist, expected.macd.hist, "macd.hist");
});

test("paritas: Bollinger cocok dengan fixture Python", () => {
  const b = IND.bollinger(C);
  closeTo(b.upper, expected.bollinger.upper, "bb.upper");
  closeTo(b.mid, expected.bollinger.mid, "bb.mid");
  closeTo(b.lower, expected.bollinger.lower, "bb.lower");
  closeTo(b.pctB, expected.bollinger.pctB, "bb.pctB");
  closeTo(b.bandwidth, expected.bollinger.bandwidth, "bb.bandwidth");
  assert.strictEqual(b.squeeze, expected.bollinger.squeeze, "bb.squeeze");
});

test("paritas: ATR cocok dengan fixture Python", () => {
  const a = IND.atr(H, L, C);
  closeTo(a.atr, expected.atr.atr, "atr");
  closeTo(a.atrPct, expected.atr.atrPct, "atrPct");
});

test("paritas: Stochastic cocok dengan fixture Python", () => {
  const s = IND.stochastic(H, L, C);
  closeTo(s.k, expected.stoch.k, "stoch.k");
  closeTo(s.d, expected.stoch.d, "stoch.d");
});

test("paritas: ADX/DMI cocok dengan fixture Python", () => {
  const a = IND.adx(H, L, C);
  closeTo(a.adx, expected.adx.adx, "adx");
  closeTo(a.plusDI, expected.adx.plusDI, "plusDI");
  closeTo(a.minusDI, expected.adx.minusDI, "minusDI");
});

test("paritas: OBV cocok dengan fixture Python", () => {
  const o = IND.obv(C, V);
  closeTo(o.obv, expected.obv.obv, "obv");
  closeTo(o.slope, expected.obv.slope, "obv.slope");
});

test("paritas: posisi 52 minggu cocok dengan fixture Python", () => {
  const p = IND.position52w(C);
  closeTo(p.high, expected.pos52w.high, "pos52w.high");
  closeTo(p.low, expected.pos52w.low, "pos52w.low");
  closeTo(p.pct, expected.pos52w.pct, "pos52w.pct");
});

test("paritas: golden/death cross cocok dengan fixture Python", () => {
  const c = IND.crossState(C);
  assert.strictEqual(c.state, expected.cross.state, "cross.state");
  assert.strictEqual(c.daysSince, expected.cross.daysSince, "cross.daysSince");
});

test("fixture cukup panjang untuk semua indikator", () => {
  // Fixture yang dipendekkan diam-diam membuat indikator jadi null dan
  // uji paritas kehilangan taringnya.
  assert.ok(C.length >= 300, `fixture cuma ${C.length} bar`);
  for (const [k, v] of Object.entries(IND.computeAll({ high: H, low: L, close: C, volume: V }))) {
    if (["rsi", "sma200", "ema200", "atr", "volRatio", "price"].includes(k)) {
      assert.ok(v !== null, `${k} null — fixture kependekan`);
    }
  }
});

// ── primitif ──────────────────────────────────────────────────────────

test("ewm melewati NaN di awal lalu mulai rekursi dari nilai valid pertama", () => {
  // Ini semantik pandas dan sumber ketidakcocokan paling halus.
  const out = IND.ewm([NaN, 10, 20], 0.5);
  assert.ok(Number.isNaN(out[0]));
  assert.strictEqual(out[1], 10);
  assert.strictEqual(out[2], 15);
});

test("rollingMean butuh jendela penuh", () => {
  const out = IND.rollingMean([1, 2, 3, 4], 3);
  assert.ok(Number.isNaN(out[0]) && Number.isNaN(out[1]));
  assert.strictEqual(out[2], 2);
  assert.strictEqual(out[3], 3);
});

test("rollingStd memakai stdev populasi (ddof=0)", () => {
  // [2,4,4,4] → mean 3.5, ddof=0 → sqrt(0.75) ≈ 0.8660254
  const out = IND.rollingStd([2, 4, 4, 4], 4);
  assert.ok(Math.abs(out[3] - Math.sqrt(0.75)) < 1e-12);
});

test("quantile memakai interpolasi linear seperti numpy", () => {
  assert.strictEqual(IND.quantile([1, 2, 3, 4], 0.5), 2.5);
  assert.strictEqual(IND.quantile([1, 2, 3, 4, 5], 0.2), 1.8);
});

test("trueRange bar pertama memakai high−low, bukan NaN", () => {
  // pandas .max(axis=1) melewati NaN, jadi bar pertama tetap punya nilai.
  const tr = IND.trueRange([102, 103], [98, 99], [100, 101]);
  assert.strictEqual(tr[0], 4);
});

// ── kebenaran ─────────────────────────────────────────────────────────

test("SMA/EMA deret konstan sama dengan konstanta itu", () => {
  closeTo(IND.sma(flat(60, 42), 50), 42, "sma");
  closeTo(IND.ema(flat(60, 42), 20), 42, "ema");
});

test("SMA cocok dengan rata-rata yang dihitung tangan", () => {
  closeTo(IND.sma([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), 8, "sma5");
});

test("RSI ekstrem pada tren monoton", () => {
  assert.ok(IND.rsi(ramp(60)) > 99, "naik monoton harus mendekati 100");
  assert.ok(IND.rsi(ramp(60, 200, -1)) < 1, "turun monoton harus mendekati 0");
});

test("RSI selalu di rentang 0..100", () => {
  const zig = [];
  for (let i = 0; i < 60; i++) zig.push(100 + (i % 2 ? 20 : -20) + i * 0.3);
  const v = IND.rsi(zig);
  assert.ok(v >= 0 && v <= 100, `rsi=${v}`);
});

test("MACD deret konstan nol di ketiga komponennya", () => {
  const m = IND.macd(flat(80));
  closeTo(m.line, 0, "line");
  closeTo(m.signal, 0, "signal");
  closeTo(m.hist, 0, "hist");
});

test("MACD hist selalu line dikurangi signal", () => {
  const m = IND.macd(ramp(120, 100, 0.7));
  closeTo(m.hist, m.line - m.signal, "hist");
});

test("Bollinger mid identik dengan SMA20", () => {
  const c = ramp(60, 100, 0.9);
  closeTo(IND.bollinger(c).mid, IND.sma(c, 20), "mid==sma20");
});

test("Bollinger deret konstan lebarnya nol", () => {
  const b = IND.bollinger(flat(60));
  closeTo(b.upper, b.lower, "upper==lower");
  closeTo(b.bandwidth, 0, "bandwidth");
});

test("ATR rentang konstan sama dengan rentang itu", () => {
  const a = IND.atr(flat(60, 102), flat(60, 98), flat(60, 100));
  closeTo(a.atr, 4, "atr");
  closeTo(a.atrPct, 4, "atrPct");
});

test("Stochastic ekstrem sesuai arah tren", () => {
  const up = ramp(60);
  assert.ok(IND.stochastic(hiOf(up), loOf(up), up).k > 90, "tren naik → %K tinggi");
  const dn = ramp(60, 200, -1);
  assert.ok(IND.stochastic(hiOf(dn), loOf(dn), dn).k < 10, "tren turun → %K rendah");
});

test("DMI menunjuk arah tren yang benar", () => {
  const up = ramp(80);
  const a = IND.adx(hiOf(up), loOf(up), up);
  assert.ok(a.plusDI > a.minusDI, "tren naik → +DI > −DI");
  const dn = ramp(80, 300, -1.5);
  const b = IND.adx(hiOf(dn), loOf(dn), dn);
  assert.ok(b.minusDI > b.plusDI, "tren turun → −DI > +DI");
});

test("ADX pasar datar tidak meledak jadi NaN", () => {
  // High==Low==Close → ATR nol; dulu ini pembagian nol.
  const a = IND.adx(flat(80), flat(80), flat(80));
  assert.ok(a.adx === null || Number.isFinite(a.adx), `adx=${a.adx}`);
});

test("OBV mengakumulasi seluruh volume di hari naik", () => {
  const c = ramp(40);
  const v = flat(40, 1e6);
  closeTo(IND.obv(c, v).obv, 39e6, "obv");
  assert.ok(IND.obv(c, v).slope > 0, "slope positif saat akumulasi");
});

test("kemiringan OBV ternormalisasi ke rentang satuan", () => {
  // Inilah yang membuat OBV bisa dibandingkan antar-saham.
  const c = ramp(40);
  assert.ok(Math.abs(IND.obv(c, flat(40, 1e6)).slope) <= 1.0001);
});

test("rasio volume mendeteksi lonjakan", () => {
  const v = flat(39, 1e6).concat([3e6]);
  closeTo(IND.volumeRatio(v), 3, "volRatio");
  closeTo(IND.volumeRatio(flat(40, 1e6)), 1, "volume rata");
});

test("posisi 52 minggu di puncak dan di dasar rentang", () => {
  closeTo(IND.position52w(ramp(300)).pct, 100, "puncak");
  closeTo(IND.position52w(ramp(300, 500, -1)).pct, 0, "dasar");
});

test("cross state mengenali golden dan death", () => {
  assert.strictEqual(IND.crossState(ramp(260)).state, "golden");
  assert.strictEqual(IND.crossState(ramp(260, 600, -1.5)).state, "death");
  assert.ok(IND.crossState(ramp(260)).daysSince > 0);
});

// ── penjagaan data pendek ─────────────────────────────────────────────

test("riwayat pendek memulangkan null, bukan melempar", () => {
  // 984 ticker berarti selalu ada saja yang riwayatnya beberapa minggu;
  // satu ticker cacat tidak boleh menjatuhkan seluruh refresh.
  // spread ke objek realm-utama agar deepStrictEqual tak menolak karena beda prototype vm
  assert.strictEqual(IND.rsi(ramp(5)), null);
  assert.strictEqual(IND.sma(ramp(10), 50), null);
  assert.strictEqual(IND.ema(ramp(10), 200), null);
  assert.deepStrictEqual({ ...IND.macd(ramp(10)) }, { line: null, signal: null, hist: null });
  assert.deepStrictEqual({ ...IND.atr(hiOf(ramp(5)), loOf(ramp(5)), ramp(5)) }, { atr: null, atrPct: null });
  assert.deepStrictEqual({ ...IND.crossState(ramp(10)) }, { state: null, daysSince: null });
  assert.deepStrictEqual({ ...IND.stochastic(hiOf(ramp(5)), loOf(ramp(5)), ramp(5)) }, { k: null, d: null });
});

test("computeAll bentuk kuncinya stabil apa pun panjang datanya", () => {
  const full = IND.computeAll({ high: H, low: L, close: C, volume: V });
  const shortBars = { high: hiOf(ramp(5)), low: loOf(ramp(5)), close: ramp(5), volume: flat(5, 1e6) };
  assert.deepStrictEqual(Object.keys(IND.computeAll(shortBars)).sort(), Object.keys(full).sort());
});

test("computeAll data kosong memulangkan objek kosong", () => {
  // spread ke objek realm-utama agar deepStrictEqual tak menolak karena beda prototype vm
  assert.deepStrictEqual({ ...IND.computeAll({ close: [] }) }, {});
  assert.deepStrictEqual({ ...IND.computeAll(null) }, {});
});

test("computeAll tanpa volume tidak crash", () => {
  const out = IND.computeAll({ high: H, low: L, close: C, volume: null });
  assert.strictEqual(out.obv, null);
  assert.strictEqual(out.volRatio, null);
  assert.ok(out.rsi !== null, "indikator berbasis harga tetap terisi");
});

test("computeAll hasilnya bisa diserialisasi JSON", () => {
  // NaN akan lolos diam-diam dan menghasilkan JSON yang tak bisa di-parse.
  const payload = JSON.stringify(IND.computeAll({ high: H, low: L, close: C, volume: V }));
  assert.ok(!payload.includes("NaN"), "ada NaN di output");
  assert.ok(!payload.includes("null,null,null"), "terlalu banyak null berurutan");
});
