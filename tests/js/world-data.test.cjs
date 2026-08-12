// js/world/data.js — dataset dunia 3D dibangun runtime dari pustaka bersama.
// Dulu ini di-generate scripts/build_world_data.py (salinan kedua dari
// signals.js + advice.js); test ini menjaga agar tidak melenceng lagi.
const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

function worldCtx(seed) {
  const c = makeWindow();
  load(c, "data/stocks.js");
  load(c, "data/analyst.js");
  load(c, "data/signals-overlay.js");
  load(c, "js/signals.js");
  load(c, "js/advice.js");
  load(c, "js/refresh.js");
  if (seed) seed(c);
  load(c, "js/world/data.js");
  return c;
}
const C = worldCtx();
const row = (t) => C.WORLD_DATA.find(o => o.t === t);
const stock = (c, t) => c.STOCK_UNIVERSE.find(s => s.ticker === t);

test("satu baris per saham di universe", () => {
  assert.strictEqual(C.WORLD_DATA.length, C.STOCK_UNIVERSE.length);
  assert.ok(C.WORLD_DATA.length > 900, "universe terlalu kecil: " + C.WORLD_DATA.length);
  assert.strictEqual(new Set(C.WORLD_DATA.map(o => o.t)).size, C.WORLD_DATA.length, "ada ticker ganda");
});

test("comp & ketiga skor adj cocok dengan SIGNAL_LIB untuk SELURUH universe", () => {
  const S = C.SIGNAL_LIB;
  for (const o of C.WORLD_DATA) {
    const s = stock(C, o.t);
    assert.strictEqual(o.comp, S.compositeSignal(s), o.t + " comp");
    assert.strictEqual(o.adjS, S.ethicsAdjustedScore(s, "strict"), o.t + " adjS");
    assert.strictEqual(o.adjB, S.ethicsAdjustedScore(s, "balanced"), o.t + " adjB");
    assert.strictEqual(o.adjL, S.ethicsAdjustedScore(s, "loose"), o.t + " adjL");
  }
});

test("act & vscore cocok dengan ADVICE_LIB untuk SELURUH universe", () => {
  const A = C.ADVICE_LIB;
  for (const o of C.WORLD_DATA) {
    const v = A.actionVerdict(stock(C, o.t), "balanced");
    assert.strictEqual(o.act, v.action, o.t + " act");
    assert.strictEqual(o.vscore, v.score, o.t + " vscore");
  }
});

test("field dasar diambil apa adanya dari stocks.js", () => {
  const s = stock(C, "AAPL"), o = row("AAPL");
  assert.strictEqual(o.n, s.name);
  assert.strictEqual(o.sec, s.sector);
  assert.strictEqual(o.tie, s.ethics.israelTie);
  assert.strictEqual(o.why, s.ethics.rationale);
  assert.strictEqual(o.cap, s.fundamentals.marketCapB);
  assert.strictEqual(JSON.stringify(o.sig), JSON.stringify(s.signals));
});

test("sig adalah salinan — mengubahnya tidak merusak STOCK_UNIVERSE", () => {
  const c = worldCtx();
  c.WORLD_DATA[0].sig.momentum = 12345;
  assert.notStrictEqual(stock(c, c.WORLD_DATA[0].t).signals.momentum, 12345);
});

test("upside dibulatkan 1 desimal dan konsisten dengan harga/target", () => {
  for (const o of C.WORLD_DATA) {
    if (o.upside == null) continue;
    assert.strictEqual(o.upside, Math.round(o.upside * 10) / 10, o.t + " tidak 1 desimal");
    if (Number.isFinite(o.price) && o.price > 0 && Number.isFinite(o.target)) {
      const exp = Math.round(((o.target - o.price) / o.price * 100) * 10) / 10;
      assert.strictEqual(o.upside, exp, o.t + " upside");
    }
  }
});

test("nA selalu angka; rating/target boleh null tapi tidak undefined", () => {
  for (const o of C.WORLD_DATA) {
    assert.ok(Number.isFinite(o.nA), o.t + " nA=" + o.nA);
    assert.notStrictEqual(o.rating, undefined, o.t);
    assert.notStrictEqual(o.target, undefined, o.t);
    assert.notStrictEqual(o.price, undefined, o.t);
  }
});

test("WORLD_META konsisten dengan isi WORLD_DATA", () => {
  const M = C.WORLD_META, D = C.WORLD_DATA;
  assert.strictEqual(M.total, D.length);
  assert.strictEqual(M.flagged, D.filter(o => o.tie === "high").length);
  assert.strictEqual(M.clean, D.filter(o => ["none", "low"].includes(o.tie)).length);
  assert.strictEqual(M.opps, D.filter(o => o.act === "BUY" || o.act === "STRONG_BUY").length);
});

test("WORLD_META.forever = buildForeverPocket, urutan sama persis", () => {
  const expected = C.SIGNAL_LIB.buildForeverPocket(C.STOCK_UNIVERSE, 10).map(p => p.stock.ticker);
  assert.strictEqual(JSON.stringify(C.WORLD_META.forever), JSON.stringify(expected));
  for (const t of C.WORLD_META.forever) {
    assert.ok(["none", "low"].includes(row(t).tie), t + " tidak bersih");
  }
});

test("overlay teknikal ikut terbawa ke dataset dunia", () => {
  const c = worldCtx(w => { w.SIGNAL_OVERLAY = { AAPL: { technical: -88 } }; });
  const o = c.WORLD_DATA.find(x => x.t === "AAPL");
  assert.strictEqual(o.sig.technical, -88);
  assert.strictEqual(o.comp, c.SIGNAL_LIB.compositeSignal(stock(c, "AAPL")),
                     "comp harus dihitung setelah overlay diterapkan");
});

test("tanpa pustaka bersama, dataset tidak dibangun (bukan crash)", () => {
  const c = makeWindow();
  load(c, "data/stocks.js");
  load(c, "js/world/data.js");   // SIGNAL_LIB & ADVICE_LIB absen
  assert.strictEqual(c.WORLD_DATA, undefined);
});
