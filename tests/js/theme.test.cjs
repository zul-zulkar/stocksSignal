// Uji js/theme.js — diekstrak dari app.js supaya compare.html ikut
// menghormati pilihan tema (sebelumnya halaman itu selamanya gelap).

const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

function ctx(stored, prefersLight) {
  const c = makeWindow({ localStorage: stored ? { ss_theme: stored } : {} });
  c.document.documentElement = { dataset: {} };
  c.matchMedia = (q) => ({ matches: !!prefersLight && q.includes("light") });
  load(c, "js/theme.js");
  return c;
}

test("pilihan tersimpan dipakai dan menang atas preferensi sistem", () => {
  const c = ctx("light", false);
  assert.strictEqual(c.document.documentElement.dataset.theme, "light");
  const d = ctx("dark", true);
  assert.strictEqual(d.document.documentElement.dataset.theme, "dark");
});

test("tanpa pilihan tersimpan, ikuti preferensi sistem", () => {
  assert.strictEqual(ctx(null, true).document.documentElement.dataset.theme, "light");
  assert.strictEqual(ctx(null, false).document.documentElement.dataset.theme, "dark");
});

test("toggle bergantian dan menyimpan pilihannya", () => {
  const c = ctx(null, false);
  const T = c.window.THEME_LIB;
  assert.strictEqual(T.toggleTheme(), "light");
  assert.strictEqual(c.document.documentElement.dataset.theme, "light");
  assert.strictEqual(T.storedTheme(), "light");
  assert.strictEqual(T.toggleTheme(), "dark");
  assert.strictEqual(T.storedTheme(), "dark");
});

test("nilai tak dikenal diperlakukan sebagai gelap", () => {
  assert.strictEqual(ctx("ungu", false).document.documentElement.dataset.theme, "dark");
});

test("tema dipasang saat dimuat, bukan menunggu DOMContentLoaded", () => {
  // Menunggu berarti halaman sempat berkedip dengan tema yang salah.
  assert.ok(ctx("light", false).document.documentElement.dataset.theme);
});
