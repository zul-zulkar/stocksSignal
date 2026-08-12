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
  // spread ke objek realm-utama agar deepStrictEqual tak menolak karena beda prototype vm
  assert.deepStrictEqual({ ...W.getHolding("AAA") }, { qty: 10, avgPrice: 5 });
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

// Objek yang lahir di konteks vm punya prototipe berbeda dari Node, jadi
// deepStrictEqual gagal soal referensi. Bandingkan isinya saja.
const sameJSON = (a, b, m) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b), m);

// ── Migrasi kunci lama dunia 3D ─────────────────────────────────────
// Dunia dulu menyimpan sendiri: ss_watch (array) & ss_port ({shares, avg}),
// terpisah dari ss_watchlist / ss_holdings milik dashboard.

test("migrasi: ss_watch digabung ke watchlist lalu kunci lama dibuang", () => {
  const c = ctx({ ss_watch: JSON.stringify(["AAA", "BBB"]) });
  const W = c.WATCH_LIB;
  assert.ok(W.isWatched("AAA") && W.isWatched("BBB"));
  assert.strictEqual(c.localStorage.getItem("ss_watch"), null, "kunci lama harus dihapus");
});

test("migrasi: watchlist lama & baru digabung, tanpa duplikat", () => {
  const c = ctx({
    ss_watchlist: JSON.stringify(["AAA", "CCC"]),
    ss_watch:     JSON.stringify(["AAA", "BBB"]),
  });
  const list = c.WATCH_LIB.listWatch();
  sameJSON([...list].sort(), ["AAA", "BBB", "CCC"]);
});

test("migrasi: ss_port {shares, avg} → holdings {qty, avgPrice}", () => {
  const c = ctx({ ss_port: JSON.stringify({ AAA: { shares: 5, avg: 100 } }) });
  sameJSON(c.WATCH_LIB.getHolding("AAA"), { qty: 5, avgPrice: 100 });
  assert.strictEqual(c.localStorage.getItem("ss_port"), null);
});

test("migrasi: posisi format baru menang atas yang lama", () => {
  const c = ctx({
    ss_holdings: JSON.stringify({ AAA: { qty: 9, avgPrice: 50 } }),
    ss_port:     JSON.stringify({ AAA: { shares: 1, avg: 1 } }),
  });
  sameJSON(c.WATCH_LIB.getHolding("AAA"), { qty: 9, avgPrice: 50 });
});

test("migrasi: posisi lama tanpa lembar diabaikan", () => {
  const c = ctx({ ss_port: JSON.stringify({ AAA: { shares: 0, avg: 10 }, BBB: null }) });
  assert.strictEqual(c.WATCH_LIB.getHolding("AAA"), null);
  assert.strictEqual(c.WATCH_LIB.getHolding("BBB"), null);
});

test("migrasi: kunci lama rusak tidak bikin crash", () => {
  const c = ctx({ ss_watch: "{bukan json", ss_port: "[[[" });
  sameJSON(c.WATCH_LIB.listWatch(), []);
  sameJSON(c.WATCH_LIB.allHoldings(), {});
});

test("tanpa kunci lama, tidak ada efek samping", () => {
  const c = ctx({ ss_watchlist: JSON.stringify(["AAA"]) });
  sameJSON(c.WATCH_LIB.listWatch(), ["AAA"]);
  sameJSON(c.WATCH_LIB.allHoldings(), {});
});
