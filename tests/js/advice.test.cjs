const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load, mkStock } = require("./_loader.cjs");

function ctx() {
  const c = makeWindow();
  load(c, "js/signals.js");
  load(c, "js/advice.js");
  return c;
}

test("actionVerdict: AVOID saat etika mengecualikan", () => {
  const c = ctx();
  const s = mkStock({ ethics: { israelTie: "high", rationale: "", sources: [] } });
  assert.strictEqual(c.ADVICE_LIB.actionVerdict(s, "balanced").action, "AVOID");
});

test("actionVerdict: STRONG_BUY untuk fundamental kuat + analis + upside besar", () => {
  const c = ctx();
  c.STOCK_ANALYST = { X: { rating: "strong_buy", ratingMean: 1.5, numAnalysts: 20, targetMean: 150, price: 100 } };
  c.SIGNAL_OVERLAY = { X: { lastClose: 100 } };
  const s = mkStock({ signals: { technical: 60, momentum: 60, sentiment: 60, news: 40, policy: 40, profile: 80, valuation: 40 } });
  const v = c.ADVICE_LIB.actionVerdict(s, "balanced");
  assert.strictEqual(v.action, "STRONG_BUY");
  assert.ok(v.upsidePct > 40);
  assert.strictEqual(v.target, 150);
});

test("actionVerdict: REDUCE/AVOID untuk saham lemah", () => {
  const c = ctx();
  const s = mkStock({ signals: { technical: -60, momentum: -50, sentiment: -40, news: -40, policy: -40, profile: -60, valuation: -60 } });
  assert.ok(["REDUCE", "AVOID"].includes(c.ADVICE_LIB.actionVerdict(s, "balanced").action));
});

test("priceOf: overlay diutamakan di atas data analis", () => {
  const c = ctx();
  c.SIGNAL_OVERLAY = { X: { lastClose: 123 } };
  c.STOCK_ANALYST = { X: { price: 999 } };
  assert.strictEqual(c.ADVICE_LIB.priceOf("X"), 123);
  assert.strictEqual(c.ADVICE_LIB.priceOf("Y"), null);
});

test("ratingLabel: pemetaan label", () => {
  const c = ctx();
  assert.strictEqual(c.ADVICE_LIB.ratingLabel("strong_buy"), "Strong Buy");
  assert.strictEqual(c.ADVICE_LIB.ratingLabel("hold"), "Hold");
  assert.strictEqual(c.ADVICE_LIB.ratingLabel(null), "—");
});
