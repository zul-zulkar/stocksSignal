const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

function ctx(initial) {
  const c = makeWindow({ localStorage: initial || {} });
  load(c, "js/watchlist.js");
  return c;
}

test("toggleWatch: tambah lalu hapus", () => {
  const W = ctx().WATCH_LIB;
  assert.strictEqual(W.isWatched("AAA"), false);
  assert.strictEqual(W.toggleWatch("AAA"), true);
  assert.ok(W.listWatch().includes("AAA"));
  assert.strictEqual(W.toggleWatch("AAA"), false);
  assert.ok(!W.listWatch().includes("AAA"));
});

test("setHolding/getHolding; qty 0 menghapus posisi", () => {
  const W = ctx().WATCH_LIB;
  W.setHolding("AAA", 10, 5);
  assert.deepStrictEqual(W.getHolding("AAA"), { qty: 10, avgPrice: 5 });
  W.setHolding("AAA", 0, 5);
  assert.strictEqual(W.getHolding("AAA"), null);
});

test("computePortfolio: total modal/nilai/pnl/dividen", () => {
  const W = ctx().WATCH_LIB;
  W.setHolding("AAA", 10, 100); // modal 1000
  const priceOf = (t) => (t === "AAA" ? 120 : null); // nilai 1200
  const divOf = (t) => (t === "AAA" ? 2 : 0);          // 2% dari 1200 = 24
  const sum = W.computePortfolio(priceOf, divOf);
  assert.strictEqual(sum.cost, 1000);
  assert.strictEqual(sum.value, 1200);
  assert.strictEqual(sum.pnl, 200);
  assert.ok(Math.abs(sum.pnlPct - 20) < 1e-9);
  assert.ok(Math.abs(sum.annualDividend - 24) < 1e-9);
});

test("computePortfolio: tanpa harga, nilai = modal (pnl 0)", () => {
  const W = ctx().WATCH_LIB;
  W.setHolding("AAA", 10, 100);
  const sum = W.computePortfolio(() => null, () => 0);
  assert.strictEqual(sum.value, 1000);
  assert.strictEqual(sum.pnl, 0);
});

test("data bertahan via localStorage (instance baru membaca seed)", () => {
  const seed = { ss_watchlist: JSON.stringify(["ZZZ"]) };
  const W = ctx(seed).WATCH_LIB;
  assert.ok(W.isWatched("ZZZ"));
});
