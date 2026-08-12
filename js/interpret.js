// =====================================================================
// interpret.js — lapis "angka ini artinya apa buatku".
// =====================================================================
// Dashboard sudah menjawab "ini apa" (SIGNAL_META.desc) dan "kenapa begitu"
// (advice.js rationale). Berkas ini menjawab pertanyaan ketiga: lalu apa
// konsekuensinya, apa risikonya, dan apa yang perlu kamu periksa sendiri.
//
// DUA BATAS YANG DISENGAJA:
//   1. Ini BUKAN nasihat beli/jual. Tidak ada kalimat yang menyuruh membeli
//      atau menjual. Yang ditulis: arti angkanya, konsekuensi praktis,
//      risiko yang menyertainya, dan hal yang perlu diverifikasi sendiri.
//   2. Ini BUKAN AI. Seluruh isinya diturunkan dengan aturan dari angka
//      saham yang bersangkutan. Menyebutnya AI akan menyesatkan.
//
// Fungsi murni, tanpa DOM — sama polanya dengan signals.js & advice.js,
// supaya bisa diuji langsung dan dipakai ulang di dunia 3D.
// =====================================================================

(function () {
  const LABEL = {
    technical: "Teknikal", momentum: "Momentum", sentiment: "Sentimen",
    news: "Berita", policy: "Makro", profile: "Kualitas", valuation: "Valuasi",
  };
  const KEYS = Object.keys(LABEL);
  const signed = v => (v >= 0 ? "+" : "−") + Math.abs(v);

  // ---------- Per faktor: konsekuensi, bukan definisi ----------
  // Deskripsi keadaan sudah ditangani SIGNAL_META.desc di app.js; di sini
  // khusus "apa dampaknya buat keputusanmu".
  // Ambang di sini WAJIB selaras dengan SIGNAL_META.desc di js/app.js —
  // keduanya tampil bersebelahan, jadi kalau bandnya beda, layar akan
  // menampilkan dua kalimat yang saling bertentangan (mis. deskripsi bilang
  // "tren positif" sementara interpretasi bilang "arah belum jelas").
  //   technical/momentum/profile : 20 / −20
  //   sentiment/news/policy      : 10 / −10
  //   valuation                  :  0 / −30
  const SIGNAL_IMPACT = {
    technical: [
      [20,  "Tren sedang berpihak. Tapi tren yang sudah naik juga berarti kamu masuk setelah kenaikan — bukan di harga murah."],
      [-20, "Arah harga belum jelas. Tidak ada dorongan tren untuk membantu maupun melawanmu."],
      [-101,"Harga sedang dalam tekanan. Kalau kamu masuk sekarang, siapkan diri melihat merah dulu sebelum hijau."],
    ],
    momentum: [
      [20,  "Unggul dari pasar. Momentum cenderung berlanjut, tapi juga yang paling keras berbalik saat sentimen berubah."],
      [-20, "Bergerak seiring pasar. Tidak ada keunggulan maupun ketertinggalan yang menonjol."],
      [-101,"Tertinggal dari pasar. Perlu alasan kuat lain untuk memilih ini dibanding indeks."],
    ],
    sentiment: [
      [10,  "Analis condong positif. Ingat: konsensus sudah tercermin di harga — kejutan justru datang saat konsensus salah."],
      [-10, "Analis terbelah. Kalau kamu masuk, kamu bertaruh pada pandanganmu sendiri, bukan konsensus."],
      [-101,"Analis condong negatif. Melawan konsensus bisa berbuah, tapi butuh tesis yang jelas."],
    ],
    news: [
      [10,  "Aliran berita mendukung. Cek apakah katalisnya sekali jalan atau berulang."],
      [-10, "Tidak ada berita yang menggerakkan. Harga kemungkinan mengikuti faktor lain."],
      [-101,"Ada isu yang membebani. Pahami dulu isunya sebelum menganggap harga murah itu peluang."],
    ],
    policy: [
      [10,  "Kondisi makro/sektoral sedang membantu. Ini faktor di luar kendali perusahaan — bisa berubah cepat."],
      [-10, "Makro netral. Tidak menambah maupun mengurangi daya tarik."],
      [-101,"Ada tekanan regulasi atau siklus. Risiko jenis ini biasanya berlangsung lama, bukan sebulan dua bulan."],
    ],
    profile: [
      [50,  "Fundamentalnya kuat. Ini faktor yang paling relevan kalau niatmu memegang lama."],
      [20,  "Fundamental memadai. Cukup sehat untuk dipegang, belum tentu istimewa."],
      [-20, "Kualitas biasa saja. Untuk pegangan jangka panjang, ini titik lemahnya."],
      [-101,"Fundamental rapuh. Jangka panjang, ini risiko paling serius di antara tujuh faktor."],
    ],
    valuation: [
      [0,   "Harga relatif murah dibanding sektornya. Cari tahu kenapa — murah kadang ada sebabnya."],
      [-30, "Harga wajar. Imbal hasil akan datang dari kinerja perusahaan, bukan dari koreksi valuasi."],
      [-101,"Harga sudah premium. Ekspektasi tinggi sudah termasuk di harga; kecewa sedikit saja bisa mahal akibatnya."],
    ],
  };

  function signalInsight(key, score) {
    const rows = SIGNAL_IMPACT[key] || [];
    for (const [threshold, text] of rows) if (score >= threshold) return text;
    return "";
  }

  // Faktor terlemah — dipakai untuk menyusun peringatan yang spesifik
  // pada saham itu, bukan peringatan template.
  function weakest(signals) {
    let key = null, val = Infinity;
    for (const k of KEYS) {
      const v = signals[k] || 0;
      if (v < val) { val = v; key = k; }
    }
    return { key, value: val, label: LABEL[key] };
  }
  function strongest(signals) {
    let key = null, val = -Infinity;
    for (const k of KEYS) {
      const v = signals[k] || 0;
      if (v > val) { val = v; key = k; }
    }
    return { key, value: val, label: LABEL[key] };
  }

  // ---------- Pita skor komposit ----------
  function scoreInsight(score) {
    if (score == null) return "Dikecualikan oleh filter etis, jadi tidak diberi skor.";
    if (score >= 71) return "Kombinasi faktor tergolong kuat — beberapa faktor searah positif sekaligus.";
    if (score >= 56) return "Lebih banyak faktor positif daripada negatif, tapi belum meyakinkan di semua sisi.";
    if (score >= 46) return "Netral. Faktor positif dan negatif kira-kira saling meniadakan.";
    if (score >= 31) return "Lebih banyak yang melemahkan daripada mendukung.";
    return "Mayoritas faktor negatif. Perlu alasan khusus untuk tetap melirik ini.";
  }

  // ---------- Etika ----------
  function ethicsInsight(tie, mode) {
    if (tie === "high") {
      return mode === "loose"
        ? "Berafiliasi kuat dengan Israel menurut sumber yang dirujuk. Kamu sedang di mode Loose, jadi ia tetap tampil dengan skor penuh — itu pilihan sadarmu."
        : "Berafiliasi kuat menurut sumber yang dirujuk, jadi filter etismu mengecualikannya sepenuhnya. Kalau kamu ingin tetap melihat skornya, ganti ke mode Loose — sebagai keputusan sadar, bukan kelalaian.";
    }
    if (tie === "medium") {
      return mode === "loose"
        ? "Eksposur sedang. Di mode Loose tidak ada penalti, jadi skor yang kamu lihat belum memperhitungkan hal ini."
        : "Eksposur sedang, jadi skornya sudah dipotong 25 poin. Angka yang kamu lihat sudah termasuk potongan itu.";
    }
    if (tie === "low")     return "Eksposur rendah — potongan kecil 5 poin. Layak lanjut kalau kriteriamu tidak paling ketat.";
    if (tie === "none")    return "Tidak ditemukan afiliasi bermasalah di sumber yang dirujuk. Ini kandidat yang lolos filter paling ketat sekalipun.";
    return "Belum ditinjau. Diberi potongan 10 poin sebagai kehati-hatian — bukan tuduhan, tapi juga bukan lampu hijau.";
  }

  // ---------- Dividen ----------
  function dividendInsight(dy, payout) {
    if (!dy) return "Tidak membagikan dividen. Imbal hasil hanya bisa datang dari kenaikan harga.";
    const parts = [];
    if (dy >= 5)      parts.push(`Yield ${dy.toFixed(2)}% tergolong tinggi — dan yield setinggi ini kadang muncul karena harganya jatuh, bukan karena dividennya naik.`);
    else if (dy >= 2) parts.push(`Yield ${dy.toFixed(2)}% termasuk moderat — cukup berarti untuk tujuan pendapatan rutin.`);
    else              parts.push(`Yield ${dy.toFixed(2)}% kecil — kontribusinya ke total imbal hasil tipis.`);

    if (payout > 80)       parts.push("Payout di atas 80%: hampir seluruh laba dibagikan, jadi ruang untuk menaikkan — atau bahkan mempertahankan — dividen sempit.");
    else if (payout > 0 && payout <= 60) parts.push(`Payout ${Math.round(payout)}% masih longgar, dividennya relatif aman.`);
    return parts.join(" ");
  }

  // ---------- Forever Pocket ----------
  function foreverInsight(stock) {
    const f = stock.fundamentals || {};
    const why = [];
    if (["none", "low"].includes(stock.ethics.israelTie)) why.push("lolos filter etis paling ketat");
    if ((stock.signals.profile || 0) >= 60) why.push(`kualitas fundamental kuat (${signed(stock.signals.profile)})`);
    if ((f.dividendYield || 0) >= 1) why.push(`dividen ${f.dividendYield.toFixed(2)}%`);
    else if ((f.marketCapB || 0) >= 200) why.push("ukuran perusahaan sangat besar");
    return `Masuk daftar karena ${why.join(" · ")}. Daftar ini disusun untuk akumulasi rutin — dinilai dari ketahanan jangka panjang, bukan dari peluang jangka pendek.`;
  }

  // ---------- Portofolio ----------
  function portfolioInsight(sum) {
    if (!sum || !sum.cost) return "Belum ada posisi tercatat. Isi jumlah lembar & harga beli di kartu watchlist untuk melacak untung/rugi.";
    const parts = [];
    const pct = sum.pnlPct;
    if (pct >= 20)      parts.push(`Untung ${pct.toFixed(1)}% di atas modal.`);
    else if (pct >= 0)  parts.push(`Untung tipis ${pct.toFixed(1)}%.`);
    else if (pct > -20) parts.push(`Rugi ${Math.abs(pct).toFixed(1)}% dari modal.`);
    else                parts.push(`Rugi ${Math.abs(pct).toFixed(1)}% — cukup dalam.`);
    parts.push("Angka ini bergerak mengikuti harga terakhir yang tersedia, bukan harga real-time.");
    if (sum.annualDividend > 0) {
      parts.push(`Estimasi dividen setahun $${sum.annualDividend.toFixed(2)} — sekitar ${(sum.annualDividend / sum.cost * 100).toFixed(1)}% dari modalmu.`);
    }
    return parts.join(" ");
  }

  // ---------- Insight utama per saham ----------
  // → { headline, doNow[], watchOut[], verify[] }
  function verdictInsight(stock, mode, verdict, adjScore) {
    const s = stock.signals || {};
    const f = stock.fundamentals || {};
    const tie = stock.ethics.israelTie;
    const w = weakest(s), b = strongest(s);
    const an = verdict && verdict.analyst;
    const hasAnalyst = !!(an && an.numAnalysts > 0);

    const out = { headline: "", doNow: [], watchOut: [], verify: [] };

    // Dikecualikan filter etis → itu berita utamanya, bukan skornya.
    if (adjScore === null) {
      out.headline = ethicsInsight(tie, mode);
      out.doNow.push("Tidak ada yang perlu kamu putuskan soal saham ini selama filtermu masih strict atau balanced — ia memang sengaja disingkirkan.");
      out.doNow.push("Kalau ingin membandingkan sebagai pembanding pasar, ganti mode ke Loose untuk sementara.");
      out.watchOut.push("Penilaian etika bersumber dari laporan publik dan bisa berubah. Kalau kamu ragu, telusuri sumbernya di tab Profil & Etika.");
      out.verify.push("Baca alasan di tab Profil & Etika beserta sumbernya.");
      return out;
    }

    // Headline: rangkai dari alasan yang memang dihitung advice.js.
    const act = verdict ? verdict.action : "HOLD";
    const reason = verdict && verdict.rationale ? verdict.rationale : "";
    const headMap = {
      STRONG_BUY: "Beberapa faktor sejalan positif sekaligus",
      BUY:        "Lebih banyak faktor mendukung daripada menahan",
      HOLD:       "Sinyalnya campuran — tidak condong ke mana pun",
      REDUCE:     "Lebih banyak faktor melemahkan",
      AVOID:      "Hampir semua faktor menunjuk arah negatif",
    };
    out.headline = `${headMap[act] || headMap.HOLD}: ${reason.toLowerCase()}.`;

    // Yang bisa dilakukan — dibingkai sebagai pertimbangan, bukan perintah.
    if (act === "STRONG_BUY" || act === "BUY") {
      out.doNow.push("Skor tinggi tidak mencegah harga turun jangka pendek. Kalau kamu memang berniat masuk, mencicil bertahap mengurangi risiko salah waktu dibanding masuk sekaligus.");
      out.doNow.push("Tentukan dulu porsi maksimum untuk satu saham sebelum menambah — supaya keputusannya bukan ditentukan oleh euforia angka.");
      if ((s.profile || 0) >= 60) out.doNow.push(`Kualitas fundamentalnya ${signed(s.profile)}, jadi ini termasuk kandidat yang masuk akal untuk dipegang lama, bukan sekadar ditradingkan.`);
    } else if (act === "HOLD") {
      out.doNow.push("Tidak ada dorongan kuat ke arah mana pun. Kalau kamu sudah memegangnya, sinyal ini bukan alasan untuk berubah.");
      out.doNow.push(`Kalau belum punya, faktor terkuatnya (${b.label} ${signed(b.value)}) belum cukup mengimbangi yang terlemah (${w.label} ${signed(w.value)}).`);
    } else {
      out.doNow.push("Ini bukan sinyal untuk buru-buru menjual — melainkan tanda bahwa alasan untuk menambah sedang tipis.");
      out.doNow.push("Kalau kamu sudah memegangnya, periksa lagi kenapa dulu kamu membelinya, dan apakah alasan itu masih berlaku.");
    }

    // Yang perlu diwaspadai — WAJIB spesifik ke saham ini.
    out.watchOut.push(`Titik terlemahnya ${w.label} (${signed(w.value)}). ${signalInsight(w.key, w.value)}`);
    if ((s.valuation || 0) <= -40 && act !== "AVOID") {
      out.watchOut.push("Valuasinya mahal sementara sinyal lain positif — kombinasi yang paling sering berujung kecewa kalau pertumbuhan sedikit saja meleset.");
    }
    if (verdict && verdict.upsidePct != null && verdict.upsidePct >= 40) {
      out.watchOut.push(`Upside ${verdict.upsidePct.toFixed(0)}% ke target analis itu besar sekali. Target setinggi itu biasanya mengandaikan segalanya berjalan mulus.`);
    }
    // Tier high hanya sampai sini kalau mode Loose (di mode lain skornya null
    // dan sudah ditangani di atas). Justru kasus inilah yang paling penting
    // disebut: skor penuh yang tampil sama sekali tidak memotong soal etika.
    if (tie === "high" || tie === "medium" || tie === "unknown") {
      out.watchOut.push(ethicsInsight(tie, mode));
    }
    if (!hasAnalyst) out.watchOut.push("Tidak ada liputan analis untuk saham ini, jadi sinyalnya bersandar sepenuhnya pada faktor internal — tanpa pembanding dari luar.");

    // Verifikasi mandiri.
    out.verify.push("Bandingkan dengan satu-dua saham sesektor sebelum memutuskan.");
    out.verify.push("Cek rilis kinerja terbaru — data di sini diperbarui berkala, bukan real-time.");
    if (hasAnalyst && an.targetMean) out.verify.push(`Target analis $${an.targetMean} berasal dari ${an.numAnalysts} analis; sebaran pendapatnya bisa lebar.`);

    return out;
  }

  window.INTERPRET_LIB = {
    verdictInsight, signalInsight, ethicsInsight, scoreInsight,
    dividendInsight, foreverInsight, portfolioInsight,
    weakest, strongest,
  };
})();
