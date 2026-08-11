// Lapis manual: edit sinyal dari HP (draft localStorage → data/signals-manual.js).
const test = require("node:test");
const assert = require("node:assert");
const vm = require("node:vm");
const { makeWindow, load, mkStock } = require("./_loader.cjs");

// Objek yang lahir di dalam konteks vm punya prototipe berbeda dari Node,
// jadi deepStrictEqual selalu gagal soal referensi. Bandingkan isinya saja.
const sameJSON = (a, b, msg) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b), msg);

// Konteks dengan universe sintetis supaya baseline-nya deterministik.
function ctx(universe) {
  const c = makeWindow();
  c.STOCK_UNIVERSE = universe || [
    mkStock({ ticker: "AAA", signals: { technical: 10, momentum: 20, sentiment: 30, news: 0, policy: 0, profile: 40, valuation: -10 } }),
    mkStock({ ticker: "BBB" }),
  ];
  c.SIGNAL_OVERLAY = {};
  c.SIGNAL_MANUAL = {};
  load(c, "js/refresh.js");
  return c;
}
const stockOf = (c, t) => c.STOCK_UNIVERSE.find(s => s.ticker === t);

test("setManualSignal: clamp ke ±100 dan membulatkan", () => {
  const R = ctx().REFRESH_LIB;
  assert.strictEqual(R.setManualSignal({}, "AAA", "momentum", 999).AAA.signals.momentum, 100);
  assert.strictEqual(R.setManualSignal({}, "AAA", "momentum", -999).AAA.signals.momentum, -100);
  assert.strictEqual(R.setManualSignal({}, "AAA", "momentum", 12.7).AAA.signals.momentum, 13);
});

test("setManualSignal: nilai == baseline → key dibuang (tombol reset)", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  R.applyLayers();
  const d = R.setManualSignal({}, "AAA", "momentum", 55);
  assert.ok(d.AAA, "edit pertama harus tercatat");
  R.setManualSignal(d, "AAA", "momentum", R.baselineSignal("AAA", "momentum"));
  assert.ok(!d.AAA, "entri kosong harus dihapus dari draft");
});

test("setManualSignal: nilai non-numerik → key dibuang", () => {
  const R = ctx().REFRESH_LIB;
  const d = R.setManualSignal({}, "AAA", "news", 40);
  R.setManualSignal(d, "AAA", "news", "bukan angka");
  assert.ok(!d.AAA);
});

test("setManualNote: note saja cukup mempertahankan entri", () => {
  const R = ctx().REFRESH_LIB;
  const d = R.setManualNote({}, "AAA", "cek lagi setelah earnings");
  assert.strictEqual(d.AAA.note, "cek lagi setelah earnings");
  R.setManualNote(d, "AAA", "");
  assert.ok(!d.AAA);
});

test("draft: save → get → count → clear", () => {
  const R = ctx().REFRESH_LIB;
  assert.strictEqual(R.draftCount(), 0);
  R.saveDraft(R.setManualSignal({}, "AAA", "policy", 42));
  assert.strictEqual(R.draftCount(), 1);
  assert.strictEqual(R.getDraft().AAA.signals.policy, 42);
  R.clearDraft();
  assert.strictEqual(R.draftCount(), 0);
  sameJSON(R.getDraft(), {});
});

test("getDraft: localStorage rusak → {} bukan crash", () => {
  const c = ctx();
  c.localStorage.setItem("signalManualDraft", "{bukan json");
  sameJSON(c.REFRESH_LIB.getDraft(), {});
});

test("mergedManual: draft menang atas file committed, key lain bertahan", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  c.SIGNAL_MANUAL = { AAA: { signals: { momentum: 10, news: 20 } } };
  R.saveDraft({ AAA: { signals: { momentum: 90 } } });
  const m = R.mergedManual();
  assert.strictEqual(m.AAA.signals.momentum, 90);
  assert.strictEqual(m.AAA.signals.news, 20);
});

test("applyLayers: presedensi baseline < overlay < manual", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  c.SIGNAL_OVERLAY = { AAA: { technical: 44 } };
  R.applyLayers();
  assert.strictEqual(stockOf(c, "AAA").signals.technical, 44, "overlay harus menang atas baseline");
  R.saveDraft({ AAA: { signals: { technical: -77 } } });
  R.applyLayers();
  assert.strictEqual(stockOf(c, "AAA").signals.technical, -77, "manual harus menang atas overlay");
});

test("applyLayers: faktor selain technical ikut bisa diedit", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  R.saveDraft({ AAA: { signals: { valuation: 66, sentiment: -33 } } });
  R.applyLayers();
  assert.strictEqual(stockOf(c, "AAA").signals.valuation, 66);
  assert.strictEqual(stockOf(c, "AAA").signals.sentiment, -33);
});

test("applyLayers: hapus draft → nilai kembali persis ke baseline", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  R.applyLayers();
  const before = { ...stockOf(c, "AAA").signals };
  R.saveDraft({ AAA: { signals: { profile: -100, news: 100 } } });
  R.applyLayers();
  assert.strictEqual(stockOf(c, "AAA").signals.profile, -100);
  R.clearDraft();
  R.applyLayers();
  sameJSON(stockOf(c, "AAA").signals, before, "baseline tidak pulih setelah reset");
});

test("applyLayers: ticker lain tidak ikut terpengaruh", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  R.applyLayers();
  const bbbBefore = { ...stockOf(c, "BBB").signals };
  R.saveDraft({ AAA: { signals: { momentum: 88 } } });
  R.applyLayers();
  sameJSON(stockOf(c, "BBB").signals, bbbBefore);
});

test("resetManual: entri committed dibuang lewat tombstone", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  c.SIGNAL_MANUAL = { AAA: { signals: { policy: 80 } } };
  R.applyLayers();
  assert.strictEqual(stockOf(c, "AAA").signals.policy, 80);
  R.saveDraft(R.resetManual(R.getDraft(), "AAA"));
  R.applyLayers();
  assert.ok(!R.mergedManual().AAA, "entri harus hilang dari merged");
  assert.notStrictEqual(stockOf(c, "AAA").signals.policy, 80);
});

test("applyLayers: idempoten — dipanggil 2x hasilnya sama", () => {
  const c = ctx(); const R = c.REFRESH_LIB;
  R.saveDraft({ AAA: { signals: { momentum: 71 } } });
  R.applyLayers();
  const once = { ...stockOf(c, "AAA").signals };
  R.applyLayers();
  sameJSON(stockOf(c, "AAA").signals, once);
});

test("applyOverlay tetap ada sebagai alias applyLayers", () => {
  const R = ctx().REFRESH_LIB;
  assert.strictEqual(R.applyOverlay, R.applyLayers);
});

test("serializeManual: round-trip → JS yang sah & isi cocok", () => {
  const R = ctx().REFRESH_LIB;
  const manual = {
    AAA: { signals: { momentum: 40, sentiment: -10 }, note: "pasca earnings", editedAt: "2026-08-11T09:00:00.000Z" },
  };
  const tmp = vm.createContext({ window: {} });
  vm.runInContext(R.serializeManual(manual), tmp);
  sameJSON(tmp.window.SIGNAL_MANUAL, manual);
});

test("serializeManual: manual kosong tetap menghasilkan JS yang sah", () => {
  const R = ctx().REFRESH_LIB;
  const tmp = vm.createContext({ window: {} });
  vm.runInContext(R.serializeManual({}), tmp);
  sameJSON(tmp.window.SIGNAL_MANUAL, {});
});

test("data/signals-manual.js: default kosong & bentuknya object", () => {
  const c = makeWindow();
  load(c, "data/signals-manual.js");
  assert.strictEqual(typeof c.SIGNAL_MANUAL, "object");
  assert.strictEqual(Object.keys(c.SIGNAL_MANUAL).length, 0);
});

test("universe asli: edit manual mengubah skor komposit", () => {
  const c = makeWindow();
  load(c, "data/stocks.js");
  load(c, "data/signals-overlay.js");
  load(c, "data/signals-manual.js");
  load(c, "js/signals.js");
  load(c, "js/refresh.js");
  const R = c.REFRESH_LIB, S = c.SIGNAL_LIB;
  R.applyLayers();
  const stock = c.STOCK_UNIVERSE.find(s => s.ticker === "AAPL");
  const before = S.compositeSignal(stock);
  R.saveDraft({ AAPL: { signals: { profile: 100, momentum: 100, valuation: 100 } } });
  R.applyLayers();
  assert.ok(S.compositeSignal(stock) > before, "komposit tidak naik setelah edit");
  R.clearDraft();
  R.applyLayers();
  assert.strictEqual(S.compositeSignal(stock), before, "komposit tidak pulih setelah reset");
});
