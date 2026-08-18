const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

function ctx() {
  const c = makeWindow();
  load(c, "js/refresh.js");
  return c;
}

test("rsi14: uptrend > 70, downtrend < 30", () => {
  const R = ctx().REFRESH_LIB;
  const up = Array.from({ length: 60 }, (_, i) => 100 + i);
  const down = Array.from({ length: 60 }, (_, i) => 200 - i);
  assert.ok(R.rsi14(up) > 70);
  assert.ok(R.rsi14(down) < 30);
});

test("computeTechScore: butuh ≥200 titik, else 0", () => {
  const R = ctx().REFRESH_LIB;
  assert.strictEqual(R.computeTechScore([1, 2, 3]), 0);
});

test("computeTechScore: uptrend > downtrend, dalam batas", () => {
  const R = ctx().REFRESH_LIB;
  const up = Array.from({ length: 220 }, (_, i) => 100 + i);
  const down = Array.from({ length: 220 }, (_, i) => 400 - i);
  const su = R.computeTechScore(up), sd = R.computeTechScore(down);
  assert.ok(su > sd);
  assert.ok(su >= -100 && su <= 100);
});

test("parseStooqCSV: ekstrak closes & lastDate", () => {
  const R = ctx().REFRESH_LIB;
  const csv = "Date,Open,High,Low,Close,Volume\n2024-01-01,1,2,0.5,1.5,1000\n2024-01-02,1.5,2,1,1.8,1200\n";
  const { closes, lastDate } = R.parseStooqCSV(csv);
  // spread ke array realm-utama agar deepStrictEqual tak menolak karena beda prototype vm
  assert.deepStrictEqual([...closes], [1.5, 1.8]);
  assert.strictEqual(lastDate, "2024-01-02");
});

test("parseStooqCSV: ekstrak OHLCV penuh, bukan cuma close", () => {
  // Regresi: versi lama membuang High/Low/Volume, padahal ATR, Stochastic,
  // ADX, OBV, dan MFI semuanya butuh kolom-kolom itu.
  const R = ctx().REFRESH_LIB;
  const csv = "Date,Open,High,Low,Close,Volume\n2024-01-01,1,2,0.5,1.5,1000\n2024-01-02,1.5,2.4,1,1.8,1200\n";
  const p = R.parseStooqCSV(csv);
  assert.deepStrictEqual([...p.open], [1, 1.5]);
  assert.deepStrictEqual([...p.high], [2, 2.4]);
  assert.deepStrictEqual([...p.low], [0.5, 1]);
  assert.deepStrictEqual([...p.volume], [1000, 1200]);
});

test("parseStooqCSV: sel kosong pakai fallback, barisnya tidak dibuang", () => {
  // Close menentukan baris valid; satu sel bolong tidak boleh membuang bar.
  const R = ctx().REFRESH_LIB;
  const csv = "Date,Open,High,Low,Close,Volume\n2024-01-01,,,,1.5,\n";
  const p = R.parseStooqCSV(csv);
  assert.deepStrictEqual([...p.closes], [1.5]);
  assert.deepStrictEqual([...p.high], [1.5], "high jatuh ke close");
  assert.deepStrictEqual([...p.low], [1.5], "low jatuh ke close");
  assert.deepStrictEqual([...p.volume], [0], "volume jatuh ke 0");
});

test("parseStooqCSV: CSV kosong/tanpa kolom close memulangkan bentuk lengkap", () => {
  const R = ctx().REFRESH_LIB;
  for (const csv of ["", "Date,Foo\n2024-01-01,1\n"]) {
    const p = R.parseStooqCSV(csv);
    assert.deepStrictEqual([...p.closes], []);
    assert.deepStrictEqual([...p.volume], []);
    assert.strictEqual(p.lastDate, null);
  }
});

test("stooqSymbol: lowercase + ganti titik + .us", () => {
  const R = ctx().REFRESH_LIB;
  assert.strictEqual(R.stooqSymbol("BRK.B"), "brk-b.us");
  assert.strictEqual(R.stooqSymbol("AAPL"), "aapl.us");
});

test("overlayEntry: hitung prevClose & changePct", () => {
  const R = ctx().REFRESH_LIB;
  const closes = Array.from({ length: 220 }, (_, i) => 100 + i);
  const e = R.overlayEntry(closes, "2024-01-01");
  assert.strictEqual(e.lastClose, closes[closes.length - 1]);
  assert.strictEqual(e.prevClose, closes[closes.length - 2]);
  assert.ok(e.changePct > 0);
  assert.strictEqual(typeof e.technical, "number");
});

test("serializeOverlay: hasilkan assignment window.SIGNAL_OVERLAY", () => {
  const R = ctx().REFRESH_LIB;
  const out = R.serializeOverlay({ AAA: { technical: 5 } });
  assert.ok(out.includes("window.SIGNAL_OVERLAY ="));
  assert.ok(out.includes('"technical": 5'));
});
