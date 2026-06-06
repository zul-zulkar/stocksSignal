const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load, mkStock } = require("./_loader.cjs");

function ctx() {
  const c = makeWindow();
  load(c, "js/signals.js");
  return c;
}

test("compositeSignal: semua netral → 50", () => {
  const L = ctx().SIGNAL_LIB;
  assert.strictEqual(L.compositeSignal(mkStock()), 50);
});

test("compositeSignal: semua +100 → 100", () => {
  const L = ctx().SIGNAL_LIB;
  const s = mkStock({ signals: { technical: 100, momentum: 100, sentiment: 100, news: 100, policy: 100, profile: 100, valuation: 100 } });
  assert.strictEqual(L.compositeSignal(s), 100);
});

test("ethicsAdjustedScore: tie 'high' dikecualikan di strict & balanced, tampil di loose", () => {
  const L = ctx().SIGNAL_LIB;
  const s = mkStock({ ethics: { israelTie: "high", rationale: "", sources: [] } });
  assert.strictEqual(L.ethicsAdjustedScore(s, "strict"), null);
  assert.strictEqual(L.ethicsAdjustedScore(s, "balanced"), null);
  assert.strictEqual(typeof L.ethicsAdjustedScore(s, "loose"), "number");
});

test("ethicsAdjustedScore: penalti 'medium' = 25 di balanced, 0 di loose", () => {
  const L = ctx().SIGNAL_LIB;
  const s = mkStock({ ethics: { israelTie: "medium", rationale: "", sources: [] } });
  const base = L.compositeSignal(s);
  assert.strictEqual(L.ethicsAdjustedScore(s, "balanced"), Math.max(0, base - 25));
  assert.strictEqual(L.ethicsAdjustedScore(s, "loose"), base);
});

test("buildForeverPocket: menyaring etika & kualitas, urut skor", () => {
  const L = ctx().SIGNAL_LIB;
  const good = mkStock({ ticker: "G", fundamentals: { dividendYield: 2, payoutRatio: 30, marketCapB: 300 },
    signals: { technical: 50, momentum: 50, sentiment: 50, news: 50, policy: 50, profile: 80, valuation: 50 } });
  const badEthics = mkStock({ ticker: "B", ethics: { israelTie: "high", rationale: "", sources: [] },
    fundamentals: { dividendYield: 2, payoutRatio: 30, marketCapB: 300 },
    signals: { technical: 50, momentum: 50, sentiment: 50, news: 50, policy: 50, profile: 80, valuation: 50 } });
  const lowProfile = mkStock({ ticker: "L", fundamentals: { dividendYield: 2, payoutRatio: 30, marketCapB: 300 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 10, valuation: 0 } });
  const tickers = L.buildForeverPocket([good, badEthics, lowProfile], 10).map((p) => p.stock.ticker);
  assert.ok(tickers.includes("G"));
  assert.ok(!tickers.includes("B"));
  assert.ok(!tickers.includes("L"));
});

test("signalBar: normalisasi -100..100 → 0..100", () => {
  const L = ctx().SIGNAL_LIB;
  assert.strictEqual(L.signalBar(0).pct, 50);
  assert.strictEqual(L.signalBar(100).pct, 100);
  assert.strictEqual(L.signalBar(-100).pct, 0);
});
