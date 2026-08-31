// =====================================================================
// Tema terang/gelap — dipakai bersama index.html dan compare.html.
//
// Sebelumnya fungsi-fungsi ini terkurung di js/app.js, yang hanya dimuat
// index.html. Akibatnya compare.html selamanya gelap meski pengguna sudah
// memilih tema terang: pilihannya tersimpan, cuma tidak pernah dibaca di
// halaman itu.
// =====================================================================

(function () {
  "use strict";

  const THEME_KEY = "ss_theme";

  function applyTheme(t) {
    document.documentElement.dataset.theme = t === "light" ? "light" : "dark";
  }

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  }

  function initTheme() {
    // Pilihan eksplisit menang; kalau belum pernah memilih, ikuti preferensi
    // sistem alih-alih memaksa gelap.
    const stored = storedTheme();
    if (stored) return applyTheme(stored);
    const prefersLight = typeof matchMedia === "function" &&
      matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  function toggleTheme() {
    const cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    return next;
  }

  window.THEME_LIB = { applyTheme, initTheme, toggleTheme, storedTheme, THEME_KEY };

  // Dijalankan segera, bukan menunggu DOMContentLoaded: menunggu berarti
  // halaman sempat berkedip dengan tema yang salah lebih dulu.
  initTheme();
})();
