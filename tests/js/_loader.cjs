// Loader untuk menguji file JS sisi-browser di Node tanpa DOM.
// Membuat konteks vm dengan `window` (self-referensial) + stub minimal,
// lalu meng-eval file sumber sehingga `window.X = ...` tersedia di konteks.
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");

function makeWindow(opts = {}) {
  const store = new Map(Object.entries(opts.localStorage || {}));
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  sandbox.console = console;
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  sandbox.performance = { now: () => Date.now() };
  sandbox.btoa = (s) => Buffer.from(s, "binary").toString("base64");
  sandbox.atob = (s) => Buffer.from(s, "base64").toString("binary");
  sandbox.fetch = async () => { throw new Error("network disabled in tests"); };
  sandbox.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
  sandbox.document = { addEventListener() {}, querySelector() { return null; } };
  vm.createContext(sandbox);
  return sandbox;
}

function load(ctx, relFile) {
  const file = path.join(ROOT, relFile);
  const src = fs.readFileSync(file, "utf8");
  vm.runInContext(src, ctx, { filename: file });
}

// Stock contoh dengan semua sinyal 0 (komposit = 50)
function mkStock(over = {}) {
  return {
    ticker: "X", name: "X Co", sector: "Tech",
    ethics: { israelTie: "none", rationale: "", sources: [] },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 10 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 0 },
    ...over,
  };
}

module.exports = { makeWindow, load, mkStock, ROOT };
