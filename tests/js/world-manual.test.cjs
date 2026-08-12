// js/world/manual.js — lapis edit manual pada dataset dunia 3D (world.html).
const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

// Objek dari konteks vm punya prototipe berbeda dari Node, jadi
// deepStrictEqual selalu gagal soal referensi. Bandingkan isinya saja.
const sameJSON = (a, b, msg) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b), msg);

// Muat rantai world.html sampai SEBELUM patch, supaya tiap test bisa
// menyiapkan draft dulu baru menjalankan patcher.
function worldCtx(draft) {
  const c = makeWindow();
  load(c, "data/world-data.js");
  load(c, "data/signals-manual.js");
  load(c, "js/signals.js");
  load(c, "js/advice.js");
  load(c, "js/refresh.js");
  if (draft) c.REFRESH_LIB.saveDraft(draft);
  return c;
}
const patch  = (c) => load(c, "js/world/manual.js");
const entry  = (c, t) => c.WORLD_DATA.find(o => o.t === t);

test("tanpa edit: WORLD_DATA & WORLD_META tidak tersentuh sama sekali", () => {
  const c = worldCtx();
  const before = JSON.stringify(c.WORLD_DATA);
  const metaBefore = JSON.stringify(c.WORLD_META);
  patch(c);
  assert.strictEqual(JSON.stringify(c.WORLD_DATA), before);
  assert.strictEqual(JSON.stringify(c.WORLD_META), metaBefore);
});

test("draft mengubah sig, comp, dan ketiga skor adj entri terkait", () => {
  const c = worldCtx();
  const before = { ...entry(c, "AAPL") };
  c.REFRESH_LIB.saveDraft({ AAPL: { signals: { momentum: 100, profile: 100, valuation: 100 } } });
  patch(c);
  const a = entry(c, "AAPL");
  assert.strictEqual(a.sig.momentum, 100);
  assert.strictEqual(a.sig.profile, 100);
  assert.ok(a.comp > before.comp, `comp harus naik: ${before.comp} → ${a.comp}`);
  assert.ok(a.adjB > before.adjB, "adjB harus naik");
  assert.ok(a.adjL > before.adjL, "adjL harus naik");
  assert.strictEqual(a.edited, true);
});

test("faktor yang tidak diedit tetap seperti semula", () => {
  const c = worldCtx();
  const beforeNews = entry(c, "AAPL").sig.news;
  c.REFRESH_LIB.saveDraft({ AAPL: { signals: { momentum: 77 } } });
  patch(c);
  assert.strictEqual(entry(c, "AAPL").sig.news, beforeNews);
});

test("entri lain tidak ikut terpengaruh", () => {
  const c = worldCtx();
  const before = JSON.stringify(entry(c, "MSFT"));
  c.REFRESH_LIB.saveDraft({ AAPL: { signals: { momentum: 100 } } });
  patch(c);
  assert.strictEqual(JSON.stringify(entry(c, "MSFT")), before);
});

test("edit ekstrem positif mendorong act ke arah BELI", () => {
  const c = worldCtx({
    AAPL: { signals: { technical: 100, momentum: 100, sentiment: 100, news: 100, policy: 100, profile: 100, valuation: 100 } },
  });
  patch(c);
  assert.ok(["BUY", "STRONG_BUY"].includes(entry(c, "AAPL").act),
            "act = " + entry(c, "AAPL").act);
});

test("edit ekstrem negatif mendorong act menjauh dari BELI", () => {
  const c = worldCtx({
    AAPL: { signals: { technical: -100, momentum: -100, sentiment: -100, news: -100, policy: -100, profile: -100, valuation: -100 } },
  });
  patch(c);
  const a = entry(c, "AAPL");
  assert.ok(["HOLD", "REDUCE", "AVOID"].includes(a.act), "act = " + a.act);
  assert.ok(a.comp < 30, "comp = " + a.comp);
});

test("comp hasil patch cocok dengan SIGNAL_LIB.compositeSignal", () => {
  const c = worldCtx({ AAPL: { signals: { policy: 55 } } });
  patch(c);
  const a = entry(c, "AAPL");
  const st = {
    ticker: a.t, ethics: { israelTie: a.tie },
    fundamentals: { dividendYield: a.dy, marketCapB: a.cap }, signals: a.sig,
  };
  assert.strictEqual(a.comp, c.SIGNAL_LIB.compositeSignal(st));
  assert.strictEqual(a.adjS, c.SIGNAL_LIB.ethicsAdjustedScore(st, "strict"));
});

test("WORLD_META dihitung ulang & tetap konsisten dengan dataset", () => {
  const c = worldCtx({ AAPL: { signals: { profile: 100, momentum: 100 } } });
  patch(c);
  const M = c.WORLD_META;
  assert.strictEqual(M.total, c.WORLD_DATA.length);
  assert.strictEqual(M.flagged, c.WORLD_DATA.filter(o => o.tie === "high").length);
  assert.ok(Array.isArray(M.forever) && M.forever.length > 0);
  // Forever Pocket hanya boleh berisi saham bersih/eksposur rendah.
  for (const t of M.forever) {
    const o = c.WORLD_DATA.find(x => x.t === t);
    assert.ok(o, "ticker forever tidak ada di dataset: " + t);
    assert.ok(["none", "low"].includes(o.tie), t + " punya tie=" + o.tie);
  }
});

test("edit committed (SIGNAL_MANUAL) ikut diterapkan, bukan cuma draft", () => {
  const c = worldCtx();
  c.SIGNAL_MANUAL = { AAPL: { signals: { momentum: 95 } } };
  patch(c);
  assert.strictEqual(entry(c, "AAPL").sig.momentum, 95);
});

test("idempoten: dijalankan 2x hasilnya sama", () => {
  const c = worldCtx({ AAPL: { signals: { momentum: 64 } } });
  patch(c);
  const once = JSON.stringify(c.WORLD_DATA);
  const metaOnce = JSON.stringify(c.WORLD_META);
  patch(c);
  assert.strictEqual(JSON.stringify(c.WORLD_DATA), once);
  assert.strictEqual(JSON.stringify(c.WORLD_META), metaOnce);
});

test("ticker yang diedit tapi tidak ada di dataset dunia → tidak crash", () => {
  const c = worldCtx({ TIDAKADA: { signals: { momentum: 50 } } });
  const before = JSON.stringify(c.WORLD_DATA);
  patch(c);
  assert.strictEqual(JSON.stringify(c.WORLD_DATA), before);
});

test("draft dengan entri kosong tidak memicu perubahan apa pun", () => {
  const c = worldCtx({ AAPL: { signals: {} } });
  const before = JSON.stringify(c.WORLD_DATA);
  patch(c);
  sameJSON(JSON.parse(JSON.stringify(c.WORLD_DATA)), JSON.parse(before));
});

test("tanpa REFRESH_LIB (mis. gagal muat) patcher diam saja", () => {
  const c = makeWindow();
  load(c, "data/world-data.js");
  const before = JSON.stringify(c.WORLD_DATA);
  patch(c);   // SIGNAL_LIB/ADVICE_LIB/REFRESH_LIB absen
  assert.strictEqual(JSON.stringify(c.WORLD_DATA), before);
});
