// Uji js/lazydata.js — pemuat lambat untuk tiga berkas data besar.
//
// Yang penting: berkas yang BELUM digenerate adalah keadaan normal (semuanya
// generated), dan satu berkas hilang tidak boleh menggagalkan dua lainnya.

const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

function ctx(behaviour) {
  const c = makeWindow();
  const injected = [];
  c.document.head = { appendChild(tag) {
    injected.push(tag.src);
    const ok = behaviour ? behaviour(tag.src) : true;
    // Simulasikan pemuatan asinkron.
    setTimeout(() => (ok ? tag.onload() : tag.onerror()), 0);
  } };
  c.document.createElement = () => ({ set src(v) { this._src = v; }, get src() { return this._src; } });
  load(c, "js/lazydata.js");
  return { c, injected, LAZY: c.window.LAZY_DATA };
}

test("memuat ketiga berkas data", async () => {
  const { injected, LAZY } = ctx();
  await LAZY.ensure();
  assert.deepStrictEqual([...injected].sort(),
    ["data/ai-brief.js", "data/fundamentals.js", "data/indicators.js"]);
});

test("hanya memuat sekali walau dipanggil berkali-kali", async () => {
  // Membuka sepuluh saham tidak boleh berarti sepuluh unduhan.
  const { injected, LAZY } = ctx();
  await Promise.all([LAZY.ensure(), LAZY.ensure(), LAZY.ensure()]);
  await LAZY.ensure();
  assert.strictEqual(injected.length, 3);
});

test("berkas yang belum ada tidak menggagalkan yang lain", async () => {
  // Ini keadaan normal pada klon baru: semua berkas itu generated.
  const { c, LAZY } = ctx((src) => !src.includes("ai-brief"));
  c.window.STOCK_INDICATORS = { AAPL: {} };
  c.window.STOCK_FUNDAMENTALS = { AAPL: {} };
  const status = await LAZY.ensure();
  assert.strictEqual(status.indicators, true);
  assert.strictEqual(status.fundamentals, true);
  assert.strictEqual(status.briefs, false);
});

test("semua berkas hilang memulangkan status false, bukan melempar", async () => {
  const { LAZY } = ctx(() => false);
  const status = await LAZY.ensure();
  assert.deepStrictEqual({ ...status },
    { indicators: false, fundamentals: false, briefs: false });
});

test("pencari per-ticker aman saat datanya belum ada", () => {
  const { LAZY } = ctx();
  assert.strictEqual(LAZY.indicatorsFor("AAPL"), null);
  assert.strictEqual(LAZY.fundamentalsFor("AAPL"), null);
  assert.strictEqual(LAZY.briefFor("AAPL"), null);
});

test("pencari memulangkan entri saat datanya ada", () => {
  const { c, LAZY } = ctx();
  c.window.STOCK_INDICATORS = { AAPL: { rsi: 55 } };
  assert.deepStrictEqual({ ...LAZY.indicatorsFor("AAPL") }, { rsi: 55 });
  assert.strictEqual(LAZY.indicatorsFor("NOPE"), null);
});
