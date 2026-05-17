#!/usr/bin/env node
// =====================================================================
// Test runner — no deps, jalankan dengan `node tests/run.js`
// =====================================================================
// Cakupan:
//   - signals.js   : compositeSignal, ethicsAdjustedScore, ethicsBadge,
//                    signalBar, buildForeverPocket
//   - refresh.js   : rsi14, computeTechScore, stooqSymbol, parseStooqCSV,
//                    serializeOverlay/Meta, applyOverlay, PAT helpers
//   - data/stocks.js : schema validation, no duplicates, semua nilai
//                      berada dalam rentang valid
//   - syntax check semua file JS via vm.Script (parser-only)
// Exit code: 0 = semua lulus, 1 = ada yang gagal.
// =====================================================================

const fs   = require("fs");
const path = require("path");
const vm   = require("vm");

const ROOT = path.resolve(__dirname, "..");

// ---------- Mini test harness ----------
let passed = 0, failed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); console.log("  ✓ " + name); passed++; }
  catch (e) { console.log("  ✗ " + name + "\n    " + e.message); failed++; failures.push({ name, err: e }); }
}
function group(label, fn) { console.log("\n" + label); fn(); }
function eq(actual, expected, msg = "") {
  if (actual !== expected) throw new Error(`${msg} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function near(actual, expected, tol, msg = "") {
  if (Math.abs(actual - expected) > tol)
    throw new Error(`${msg} expected ${expected} ±${tol}, got ${actual}`);
}
function truthy(v, msg = "")   { if (!v)  throw new Error(msg || "expected truthy"); }
function falsy(v, msg = "")    { if (v)   throw new Error(msg || "expected falsy"); }
function throws(fn, msg = "")  { let t = false; try { fn(); } catch { t = true; } if (!t) throw new Error(msg || "expected throw"); }
function deepEq(a, b, msg = "") {
  if (JSON.stringify(a) !== JSON.stringify(b))
    throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ---------- Browser-environment sandbox ----------
function makeWindow() {
  const ls = {};
  return {
    document: { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] },
    fetch:    () => Promise.reject(new Error("fetch not stubbed")),
    btoa:     s => Buffer.from(s, "binary").toString("base64"),
    atob:     s => Buffer.from(s, "base64").toString("binary"),
    setTimeout, clearTimeout, console, URL,
    Promise, Math, JSON, Number, Object, Array, Date, String, Boolean,
    encodeURIComponent, decodeURIComponent, unescape, escape,
    localStorage: {
      getItem: k => (k in ls ? ls[k] : null),
      setItem: (k, v) => { ls[k] = String(v); },
      removeItem: k => { delete ls[k]; },
      _store: ls
    }
  };
}

function loadScript(ctx, file) {
  const code = fs.readFileSync(path.join(ROOT, file), "utf8");
  new vm.Script(code, { filename: file }).runInContext(ctx);
}

function newCtx(files) {
  const w = makeWindow();
  w.window = w;
  vm.createContext(w);
  for (const f of files) loadScript(w, f);
  return w;
}

// =====================================================================
// 1. SYNTAX CHECK — semua file JS parse tanpa error
// =====================================================================
group("[1] Syntax check — semua JS parse", () => {
  const files = [
    "data/stocks.js", "data/signals-overlay.js", "data/meta.js",
    "js/signals.js", "js/refresh.js", "js/app.js", "js/compare.js"
  ];
  for (const f of files) {
    test(f, () => {
      const src = fs.readFileSync(path.join(ROOT, f), "utf8");
      new vm.Script(src, { filename: f });
    });
  }
});

// =====================================================================
// 2. signals.js
// =====================================================================
group("[2] signals.js — komposit, etika, forever pocket", () => {
  const ctx = newCtx(["js/signals.js"]);
  const LIB = ctx.window.SIGNAL_LIB;

  const stockOf = (signals, israelTie = "none", fundamentals = {}) => ({
    ticker: "T", name: "Test", sector: "Tech",
    ethics: { israelTie, rationale: "", sources: [], palestineSupport: "none" },
    fundamentals: { dividendYield: 2, payoutRatio: 30, marketCapB: 500, ...fundamentals },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 0, ...signals }
  });

  test("SIGNAL_WEIGHTS jumlahnya 1.0", () => {
    const total = Object.values(LIB.SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
    near(total, 1.0, 1e-9, "weights sum");
  });

  test("compositeSignal: semua 0 → 50 (netral)", () => {
    eq(LIB.compositeSignal(stockOf({})), 50);
  });

  test("compositeSignal: semua +100 → 100 (max bullish)", () => {
    const all = { technical: 100, momentum: 100, sentiment: 100, news: 100, policy: 100, profile: 100, valuation: 100 };
    eq(LIB.compositeSignal(stockOf(all)), 100);
  });

  test("compositeSignal: semua -100 → 0 (max bearish)", () => {
    const all = { technical: -100, momentum: -100, sentiment: -100, news: -100, policy: -100, profile: -100, valuation: -100 };
    eq(LIB.compositeSignal(stockOf(all)), 0);
  });

  test("compositeSignal: weighted mix benar (profile 20% dominan)", () => {
    // profile=+100, rest=0 → raw = 0.20*100 = 20 → (20+100)/2 = 60
    eq(LIB.compositeSignal(stockOf({ profile: 100 })), 60);
  });

  test("ethicsAdjustedScore: high di mode strict → null (dieliminasi)", () => {
    eq(LIB.ethicsAdjustedScore(stockOf({ profile: 100 }, "high"), "strict"), null);
  });

  test("ethicsAdjustedScore: high di mode balanced → null", () => {
    eq(LIB.ethicsAdjustedScore(stockOf({ profile: 100 }, "high"), "balanced"), null);
  });

  test("ethicsAdjustedScore: high di mode loose → tetap muncul (tanpa penalti)", () => {
    eq(LIB.ethicsAdjustedScore(stockOf({ profile: 100 }, "high"), "loose"), 60);
  });

  test("ethicsAdjustedScore: medium balanced → -25 penalty", () => {
    eq(LIB.ethicsAdjustedScore(stockOf({ profile: 100 }, "medium"), "balanced"), 35);
  });

  test("ethicsAdjustedScore: low balanced → -5 penalty", () => {
    eq(LIB.ethicsAdjustedScore(stockOf({ profile: 100 }, "low"), "balanced"), 55);
  });

  test("ethicsAdjustedScore: none → tanpa penalti", () => {
    eq(LIB.ethicsAdjustedScore(stockOf({ profile: 100 }, "none"), "balanced"), 60);
  });

  test("ethicsAdjustedScore: unknown balanced → -10 penalty", () => {
    eq(LIB.ethicsAdjustedScore(stockOf({ profile: 100 }, "unknown"), "balanced"), 50);
  });

  test("ethicsAdjustedScore: tidak pernah negatif (clamp ke 0)", () => {
    const s = stockOf({ profile: -100, technical: -100 }, "medium");
    const v = LIB.ethicsAdjustedScore(s, "balanced");
    truthy(v >= 0, "score negative: " + v);
  });

  test("ethicsBadge: semua tier punya label & color", () => {
    for (const t of ["high","medium","low","none","unknown"]) {
      const b = LIB.ethicsBadge(t);
      truthy(b.label && b.color, t + " missing");
    }
  });

  test("signalBar: skor >20 → up, <-20 → down, antara → flat", () => {
    truthy(LIB.signalBar(50).color.includes("up"));
    truthy(LIB.signalBar(-50).color.includes("down"));
    truthy(LIB.signalBar(0).color.includes("flat"));
    eq(LIB.signalBar(0).pct, 50);
    eq(LIB.signalBar(100).pct, 100);
    eq(LIB.signalBar(-100).pct, 0);
  });

  test("buildForeverPocket: filter ethics (only none/low)", () => {
    const universe = [
      stockOf({ profile: 80 }, "high",   { dividendYield: 5 }),
      stockOf({ profile: 80 }, "medium", { dividendYield: 5 }),
      stockOf({ profile: 80 }, "none",   { dividendYield: 5 }),
      stockOf({ profile: 80 }, "low",    { dividendYield: 5 })
    ];
    const result = LIB.buildForeverPocket(universe, 10);
    eq(result.length, 2);
  });

  test("buildForeverPocket: filter profile ≥ 60", () => {
    const universe = [
      stockOf({ profile: 59 }, "none", { dividendYield: 5 }),
      stockOf({ profile: 60 }, "none", { dividendYield: 5 }),
      stockOf({ profile: 61 }, "none", { dividendYield: 5 })
    ];
    eq(LIB.buildForeverPocket(universe, 10).length, 2);
  });

  test("buildForeverPocket: filter dividend ≥1% OR mktCap ≥ $200B", () => {
    const universe = [
      stockOf({ profile: 80 }, "none", { dividendYield: 0,   marketCapB: 100 }),  // out
      stockOf({ profile: 80 }, "none", { dividendYield: 1.5, marketCapB: 50  }),  // in (div)
      stockOf({ profile: 80 }, "none", { dividendYield: 0,   marketCapB: 250 })   // in (cap)
    ];
    eq(LIB.buildForeverPocket(universe, 10).length, 2);
  });

  test("buildForeverPocket: hasil tersortir desc berdasar skor", () => {
    const u = [
      stockOf({ profile: 80, momentum: 100, technical: 100, sentiment: 100, news: 100, policy: 100, valuation: 100 }, "none", { dividendYield: 5 }),
      stockOf({ profile: 60, momentum: -100, technical: -100, sentiment: -100, news: -100, policy: -100, valuation: -100 }, "none", { dividendYield: 5 })
    ];
    const r = LIB.buildForeverPocket(u, 10);
    truthy(r[0].score >= r[1].score, "not sorted desc");
  });

  test("buildForeverPocket: respects max parameter", () => {
    const u = Array.from({ length: 20 }, () => stockOf({ profile: 70 }, "none", { dividendYield: 2 }));
    eq(LIB.buildForeverPocket(u, 5).length, 5);
  });
});

// =====================================================================
// 3. refresh.js — math, parsing, serialization, PAT
// =====================================================================
group("[3] refresh.js — RSI, tech score, CSV, serialization, PAT", () => {
  const ctx = newCtx(["data/stocks.js", "data/signals-overlay.js", "js/refresh.js"]);
  const LIB = ctx.window.REFRESH_LIB;

  test("rsi14: data terlalu pendek → 50 (netral)", () => {
    eq(LIB.rsi14([1, 2, 3]), 50);
  });

  test("rsi14: monoton naik → 100", () => {
    const closes = Array.from({ length: 60 }, (_, i) => 100 + i);
    eq(LIB.rsi14(closes), 100);
  });

  test("rsi14: monoton turun → mendekati 0", () => {
    const closes = Array.from({ length: 60 }, (_, i) => 160 - i);
    truthy(LIB.rsi14(closes) < 5, "expected RSI<5 for crash");
  });

  test("rsi14: harga flat → 100 (down=0 edge case)", () => {
    // up=0 dan down=0 → kode return 100 (Wilder konvensi: no losses)
    eq(LIB.rsi14(Array(40).fill(100)), 100);
  });

  test("rsi14: data realistik (gerak 1-1.5%) → 30..70", () => {
    let p = 100;
    const closes = [];
    for (let i = 0; i < 100; i++) {
      p *= 1 + (i % 2 === 0 ? 0.01 : -0.012);
      closes.push(p);
    }
    const r = LIB.rsi14(closes);
    truthy(r > 20 && r < 80, "RSI out of range: " + r);
  });

  test("computeTechScore: data < 200 → 0", () => {
    eq(LIB.computeTechScore([100, 101, 102]), 0);
    eq(LIB.computeTechScore(null), 0);
  });

  test("computeTechScore: bull run linier (+1/hari, 250 hari) → +6", () => {
    // sma50 > sma200 → +40 ; RSI=100 (>70) → -40 ; momentum 21d = (349/328-1)*100 ≈ 6.4 → +6
    const closes = Array.from({ length: 250 }, (_, i) => 100 + i);
    eq(LIB.computeTechScore(closes), 6);
  });

  test("computeTechScore: bear run linier (-1/hari, 250 hari) → -17", () => {
    // sma50 < sma200 → -40 ; RSI=0 (<30) → +40 ; momentum 21d = (101/122-1)*100 ≈ -17.2 → -17
    const closes = Array.from({ length: 250 }, (_, i) => 350 - i);
    eq(LIB.computeTechScore(closes), -17);
  });

  test("computeTechScore: bull run + momentum kuat (clamp +20)", () => {
    // Pakai growth multiplicative supaya 21-day momentum > 20% → kena clamp
    const closes = Array.from({ length: 250 }, (_, i) => 100 * Math.pow(1.02, i));
    eq(LIB.computeTechScore(closes), 20);
  });

  test("computeTechScore: bear run + momentum kuat (clamp -20)", () => {
    const closes = Array.from({ length: 250 }, (_, i) => 100 * Math.pow(0.98, i));
    eq(LIB.computeTechScore(closes), -20);
  });

  test("computeTechScore: output selalu di [-100, 100]", () => {
    const closes = Array.from({ length: 250 }, () => 100 + Math.random() * 50);
    const s = LIB.computeTechScore(closes);
    truthy(s >= -100 && s <= 100, "out of range: " + s);
  });

  test("stooqSymbol: lowercase + .us suffix", () => {
    eq(LIB.stooqSymbol("AAPL"), "aapl.us");
  });

  test("stooqSymbol: titik diganti dash (BRK.B)", () => {
    eq(LIB.stooqSymbol("BRK.B"), "brk-b.us");
  });

  test("stooqSymbol: multiple dots (e.g. RDS.A)", () => {
    eq(LIB.stooqSymbol("RDS.A"), "rds-a.us");
  });

  test("parseStooqCSV: CSV valid → array closes & lastDate terbaru", () => {
    const csv = [
      "Date,Open,High,Low,Close,Volume",
      "2024-01-02,100,101,99,100.5,1000",
      "2024-01-03,100.5,102,100,101.0,1200",
      "2024-01-04,101,103,100,102.5,1500"
    ].join("\n");
    const r = LIB.parseStooqCSV(csv);
    deepEq(r.closes, [100.5, 101.0, 102.5]);
    eq(r.lastDate, "2024-01-04");
  });

  test("parseStooqCSV: empty input → empty closes", () => {
    const r = LIB.parseStooqCSV("");
    eq(r.closes.length, 0);
  });

  test("parseStooqCSV: kolom close hilang → empty closes", () => {
    const csv = "Date,Open,High,Low,Volume\n2024-01-02,100,101,99,1000";
    eq(LIB.parseStooqCSV(csv).closes.length, 0);
  });

  test("parseStooqCSV: skip baris dengan close non-numeric", () => {
    const csv = "Date,Close\n2024-01-02,100\n2024-01-03,N/A\n2024-01-04,102";
    deepEq(LIB.parseStooqCSV(csv).closes, [100, 102]);
  });

  test("parseStooqCSV: handles CRLF line endings", () => {
    const csv = "Date,Close\r\n2024-01-02,100\r\n2024-01-03,101";
    deepEq(LIB.parseStooqCSV(csv).closes, [100, 101]);
  });

  test("serializeOverlay: round-trip → JS yang sah & isi cocok", () => {
    const overlay = { AAPL: { technical: 30, lastClose: 195.5, lastDate: "2025-01-02" } };
    const js = LIB.serializeOverlay(overlay);
    const tmp = vm.createContext({ window: {} });
    new vm.Script(js).runInContext(tmp);
    deepEq(tmp.window.SIGNAL_OVERLAY, overlay);
  });

  test("serializeMeta: round-trip", () => {
    const meta = { lastUpdated: "2025-01-02T00:00:00Z", tickersTotal: 50, tickersUpdated: 50, tickersFailed: [], source: "test" };
    const js = LIB.serializeMeta(meta);
    const tmp = vm.createContext({ window: {} });
    new vm.Script(js).runInContext(tmp);
    deepEq(tmp.window.STOCK_META, meta);
  });

  test("applyOverlay: hanya override field technical, signals lain tetap", () => {
    const sub = newCtx(["data/stocks.js"]);
    sub.window.SIGNAL_OVERLAY = { AAPL: { technical: 99 } };
    loadScript(sub, "js/refresh.js");
    sub.window.REFRESH_LIB.applyOverlay();
    const aapl = sub.window.STOCK_UNIVERSE.find(s => s.ticker === "AAPL");
    eq(aapl.signals.technical, 99);
    truthy(typeof aapl.signals.profile === "number", "profile hilang");
  });

  test("applyOverlay: overlay kosong → tidak crash", () => {
    const sub = newCtx(["data/stocks.js", "data/signals-overlay.js", "js/refresh.js"]);
    sub.window.REFRESH_LIB.applyOverlay();
    const aapl = sub.window.STOCK_UNIVERSE.find(s => s.ticker === "AAPL");
    truthy(aapl, "AAPL missing");
  });

  test("PAT helpers: set → get → clear roundtrip", () => {
    LIB.setPAT("github_pat_abc123");
    eq(LIB.getPAT(), "github_pat_abc123");
    LIB.clearPAT();
    eq(LIB.getPAT(), null);
  });
});

// =====================================================================
// 4. data/stocks.js — schema, no duplicates, value ranges
// =====================================================================
group("[4] data/stocks.js — integrity & schema", () => {
  const ctx = newCtx(["data/stocks.js"]);
  const universe = ctx.window.STOCK_UNIVERSE;

  test("STOCK_UNIVERSE adalah array tidak kosong", () => {
    truthy(Array.isArray(universe) && universe.length > 0);
  });

  test("tidak ada ticker duplikat", () => {
    const seen = new Set(), dupes = [];
    for (const s of universe) {
      if (seen.has(s.ticker)) dupes.push(s.ticker);
      seen.add(s.ticker);
    }
    eq(dupes.length, 0, "duplicates: " + dupes.join(","));
  });

  test("setiap entry punya field wajib (ticker/name/sector/ethics/fundamentals/signals)", () => {
    const bad = universe.filter(s =>
      !s.ticker || !s.name || !s.sector ||
      !s.ethics || !s.fundamentals || !s.signals);
    eq(bad.length, 0, "incomplete: " + bad.map(s => s.ticker).join(","));
  });

  test("ethics.israelTie ∈ {high, medium, low, none, unknown}", () => {
    const valid = new Set(["high","medium","low","none","unknown"]);
    const bad = universe.filter(s => !valid.has(s.ethics.israelTie));
    eq(bad.length, 0, "invalid israelTie: " + bad.map(s => `${s.ticker}=${s.ethics.israelTie}`).join(","));
  });

  test("ethics.palestineSupport ∈ {documented, statements, none}", () => {
    const valid = new Set(["documented","statements","none"]);
    const bad = universe.filter(s => !valid.has(s.ethics.palestineSupport));
    eq(bad.length, 0, "invalid palestineSupport: " + bad.map(s => `${s.ticker}=${s.ethics.palestineSupport}`).join(","));
  });

  test("ethics.sources adalah array (boleh kosong, tapi harus array)", () => {
    const bad = universe.filter(s => !Array.isArray(s.ethics.sources));
    eq(bad.length, 0, "non-array sources: " + bad.map(s => s.ticker).join(","));
  });

  test("ethics.rationale non-empty string", () => {
    const bad = universe.filter(s => typeof s.ethics.rationale !== "string" || s.ethics.rationale.trim() === "");
    eq(bad.length, 0, "empty rationale: " + bad.map(s => s.ticker).join(","));
  });

  test("semua skor sinyal numeric & berada di [-100, 100]", () => {
    const fields = ["technical","momentum","sentiment","news","policy","profile","valuation"];
    const bad = [];
    for (const s of universe) {
      for (const f of fields) {
        const v = s.signals[f];
        if (typeof v !== "number" || !Number.isFinite(v) || v < -100 || v > 100) {
          bad.push(`${s.ticker}.${f}=${v}`);
        }
      }
    }
    eq(bad.length, 0, "out-of-range: " + bad.slice(0, 5).join(", "));
  });

  test("fundamentals numeric & non-negative", () => {
    const bad = [];
    for (const s of universe) {
      for (const f of ["dividendYield","payoutRatio","marketCapB"]) {
        const v = s.fundamentals[f];
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0) bad.push(`${s.ticker}.${f}=${v}`);
      }
    }
    eq(bad.length, 0, "bad fundamentals: " + bad.slice(0, 5).join(", "));
  });

  test("ticker hanya huruf, digit, titik (format Stooq-compatible)", () => {
    const re = /^[A-Z0-9.]+$/;
    const bad = universe.filter(s => !re.test(s.ticker));
    eq(bad.length, 0, "weird ticker: " + bad.map(s => s.ticker).join(","));
  });

  test("Forever Pocket menghasilkan setidaknya 5 kandidat", () => {
    const sub = newCtx(["js/signals.js", "data/stocks.js"]);
    const pocket = sub.window.SIGNAL_LIB.buildForeverPocket(sub.window.STOCK_UNIVERSE, 30);
    truthy(pocket.length >= 5, "only " + pocket.length + " pocket candidates");
  });

  test("ada saham bersih (none) untuk Forever Pocket", () => {
    const clean = universe.filter(s => s.ethics.israelTie === "none");
    truthy(clean.length >= 5, "clean stocks: " + clean.length);
  });
});

// =====================================================================
// 5. Cross-cutting consistency
// =====================================================================
group("[5] Integrasi end-to-end", () => {
  test("load full chain: stocks + signals + refresh tanpa exception", () => {
    const ctx = newCtx([
      "data/stocks.js", "data/signals-overlay.js", "data/meta.js",
      "js/signals.js", "js/refresh.js"
    ]);
    truthy(ctx.window.STOCK_UNIVERSE && ctx.window.SIGNAL_LIB && ctx.window.REFRESH_LIB);
  });

  test("ethicsAdjustedScore strict: SEMUA high stocks tereliminasi", () => {
    const ctx = newCtx(["data/stocks.js", "js/signals.js"]);
    const high = ctx.window.STOCK_UNIVERSE.filter(s => s.ethics.israelTie === "high");
    truthy(high.length > 0, "no high stocks to test");
    const survivors = high.filter(s => ctx.window.SIGNAL_LIB.ethicsAdjustedScore(s, "strict") !== null);
    eq(survivors.length, 0);
  });

  test("ethicsAdjustedScore loose: SEMUA stocks dapat skor (tidak ada null)", () => {
    const ctx = newCtx(["data/stocks.js", "js/signals.js"]);
    const nulls = ctx.window.STOCK_UNIVERSE.filter(s =>
      ctx.window.SIGNAL_LIB.ethicsAdjustedScore(s, "loose") === null);
    eq(nulls.length, 0);
  });
});

// =====================================================================
// SUMMARY
// =====================================================================
console.log("\n" + "=".repeat(56));
console.log(`Hasil: ${passed} lulus, ${failed} gagal (total ${passed + failed})`);
if (failed > 0) {
  console.log("\nDetail kegagalan:");
  for (const f of failures) console.log("  - " + f.name + "\n    " + f.err.message);
  process.exit(1);
}
console.log("Semua test lulus.");
process.exit(0);
