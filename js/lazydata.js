// =====================================================================
// Pemuat data lambat (lazy) untuk berkas besar yang hanya dibutuhkan
// saat panel detail dibuka.
//
//   data/indicators.js    ~750 KB  ~30 indikator + blok risiko per saham
//   data/fundamentals.js  ~325 KB  metrik fundamental
//   data/ai-brief.js       varies  brief hasil Claude (opsional)
//
// Ketiganya TIDAK dimuat lewat <script> di index.html. Menambahkannya ke
// payload awal akan melipatgandakan waktu muat pertama demi data yang
// kebanyakan pengunjung tidak pernah buka — sementara daftar saham sendiri
// sudah bisa dirender tanpa satu pun dari ketiganya.
//
// Ketiganya juga GENERATED, jadi pada klon baru atau sebelum pipeline
// pertama berjalan, berkasnya memang belum ada. Itu keadaan normal, bukan
// kesalahan: pemuat ini menanganinya dengan tenang dan UI jatuh ke narasi
// deterministik js/narrate.js.
// =====================================================================

(function () {
  "use strict";

  const SOURCES = [
    { url: "data/indicators.js", global: "STOCK_INDICATORS" },
    { url: "data/fundamentals.js", global: "STOCK_FUNDAMENTALS" },
    { url: "data/ai-brief.js", global: "AI_BRIEF" },
  ];

  let pending = null;

  function injectScript(url) {
    return new Promise((resolve) => {
      const tag = document.createElement("script");
      tag.src = url;
      tag.async = true;
      // Selalu resolve, tidak pernah reject: berkas yang belum digenerate
      // adalah keadaan yang diharapkan, dan satu berkas hilang tidak boleh
      // menggagalkan pemuatan dua lainnya.
      tag.onload = () => resolve(true);
      tag.onerror = () => resolve(false);
      document.head.appendChild(tag);
    });
  }

  /**
   * Muat ketiga berkas sekali saja. Panggilan berikutnya memakai promise
   * yang sama, jadi membuka sepuluh saham tidak berarti sepuluh unduhan.
   *
   * Memulangkan { indicators, fundamentals, briefs } berisi boolean
   * ketersediaan, supaya UI bisa berkata jujur soal apa yang belum ada.
   */
  function ensure() {
    if (pending) return pending;
    pending = Promise.all(SOURCES.map((s) => injectScript(s.url))).then(() => ({
      indicators: !!window.STOCK_INDICATORS,
      fundamentals: !!window.STOCK_FUNDAMENTALS,
      briefs: !!window.AI_BRIEF,
    }));
    return pending;
  }

  const indicatorsFor = (t) => (window.STOCK_INDICATORS || {})[t] || null;
  const fundamentalsFor = (t) => (window.STOCK_FUNDAMENTALS || {})[t] || null;
  const briefFor = (t) => (window.AI_BRIEF || {})[t] || null;

  // Dipakai pengujian dan pemuatan ulang setelah refresh manual.
  function reset() { pending = null; }

  window.LAZY_DATA = { ensure, reset, indicatorsFor, fundamentalsFor, briefFor, SOURCES };
})();
