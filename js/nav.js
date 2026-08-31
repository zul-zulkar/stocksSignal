// =====================================================================
// Sumber tunggal daftar view.
//
// Sebelum berkas ini ada, daftar view ditulis di EMPAT tempat: markup
// .view-tabs di index.html, markup .bottom-nav di index.html, objek
// VIEW_INFO di js/app.js, dan dua baris toggle di applyViewChrome().
// Menambah satu view berarti menyunting keempatnya dan berharap tidak ada
// yang terlewat — dan kalau terlewat, gejalanya diam: tab muncul di satu
// navigasi tapi tidak di navigasi satunya.
//
// Yang ada di sini murni data + fungsi murni yang menghasilkan
// *spesifikasi* tombol. Pembangunan DOM-nya di js/app.js, supaya bagian
// yang menentukan (view mana yang aktif di kedua navigasi) bisa diuji
// tanpa DOM sama sekali.
// =====================================================================

(function () {
  "use strict";

  const VIEWS = [
    {
      id: "all", ico: "📋", label: "Semua",
      info: "Semua saham di universe, dengan skor & rekomendasi aksi.",
      sort: { key: "adjScore", dir: "desc" },
    },
    {
      id: "peluang", ico: "🎯", label: "Peluang",
      info: "Hanya saham dengan rekomendasi BELI / BELI KUAT — diurut potensi terbaik.",
      sort: { key: "action", dir: "desc" },
    },
    {
      id: "watchlist", ico: "⭐", label: "Watchlist",
      info: "Saham yang kamu tandai ★. Isi posisi untuk melacak untung/rugi & dividen.",
      sort: { key: "adjScore", dir: "desc" },
    },
    {
      id: "dividen", ico: "💰", label: "Dividen",
      info: "Pembayar dividen, diurut yield tertinggi. Cocok untuk passive income.",
      sort: { key: "dividend", dir: "desc" },
    },
  ];

  const byId = (id) => VIEWS.find((v) => v.id === id) || null;
  const has = (id) => !!byId(id);
  const ids = () => VIEWS.map((v) => v.id);
  const infoFor = (id) => (byId(id) || {}).info || "";
  const sortFor = (id) => (byId(id) || {}).sort || { key: "adjScore", dir: "desc" };

  /**
   * Spesifikasi segmented tab (halaman utama).
   *
   * Roving tabindex: hanya tab aktif yang bisa dicapai Tab, sisanya lewat
   * panah kiri/kanan. Tanpa itu, Tab menelusuri empat tombol satu per satu
   * sebelum sampai ke isi halaman.
   */
  function tabSpecs(active) {
    return VIEWS.map((v) => ({
      id: v.id,
      label: v.label,
      ico: v.ico,
      active: v.id === active,
      ariaSelected: v.id === active ? "true" : "false",
      tabindex: v.id === active ? "0" : "-1",
    }));
  }

  /** Spesifikasi bottom-nav (mobile). Isinya sama, tanpa semantik tablist. */
  function navSpecs(active) {
    return VIEWS.map((v) => ({
      id: v.id,
      label: v.label,
      ico: v.ico,
      active: v.id === active,
    }));
  }

  /** Indeks tetangga untuk navigasi panah, membungkus di kedua ujung. */
  function neighbor(active, delta) {
    const i = VIEWS.findIndex((v) => v.id === active);
    if (i < 0) return VIEWS[0].id;
    return VIEWS[(i + delta + VIEWS.length) % VIEWS.length].id;
  }

  window.NAV_LIB = { VIEWS, byId, has, ids, infoFor, sortFor, tabSpecs, navSpecs, neighbor };
})();
