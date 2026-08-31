// =====================================================================
// "Tanya AI" — tanya-jawab interaktif dengan API key milik pengguna sendiri.
//
// Tingkat 3 dari lapisan Sinyal AI. Tingkat 0-2 sudah tersedia tanpa setup
// apa pun (narasi aturan + brief pre-computed); ini untuk saat Anda ingin
// bertanya balik.
//
// KEAMANAN — baca ini sebelum memakai.
// API key disimpan di localStorage peramban dan dikirim langsung dari
// halaman ke api.anthropic.com. Artinya key itu bisa dibaca oleh skrip mana
// pun yang berjalan di halaman ini, termasuk ekstensi peramban. Anthropic
// mematikan akses-dari-browser secara default justru karena alasan ini, dan
// hanya membukanya lewat opt-in eksplisit. Untuk dashboard riset pribadi
// dengan key berkuota terbatas, itu kompromi yang wajar — untuk apa pun yang
// dipakai bersama orang lain, tidak. UI wajib menyampaikan ini apa adanya.
//
// Header 'anthropic-dangerous-direct-browser-access' adalah yang sama persis
// dipasang SDK resmi saat opsi dangerouslyAllowBrowser diaktifkan.
// =====================================================================

(function () {
  "use strict";

  const KEY_STORAGE = "anthropicKey";
  const API_URL = "https://api.anthropic.com/v1/messages";
  const API_VERSION = "2023-06-01";

  // Sonnet 5 untuk interaktif: pertanyaan bebas butuh nuansa yang tidak
  // dibutuhkan brief massal. Biayanya ditanggung key pengguna sendiri.
  const MODEL = "claude-sonnet-5";
  const MAX_TOKENS = 1200;

  const SYSTEM_PROMPT = [
    "Anda menjawab pertanyaan tentang satu saham di sebuah dashboard riset pribadi.",
    "",
    "Anda diberi objek JSON berisi seluruh angka yang tersedia untuk saham itu:",
    "skor komposit, tujuh faktor sinyal, indikator teknikal, metrik fundamental,",
    "konsensus analis, metrik risiko, dan tag etika.",
    "",
    "Aturan:",
    "1. Dasarkan setiap pernyataan pada angka yang diberikan. Jangan pernah menyebut",
    "   angka, tanggal, produk, atau peristiwa yang tidak ada di data itu.",
    "2. Kalau pertanyaannya butuh data yang tidak Anda miliki, katakan begitu",
    "   dengan jelas alih-alih menebak.",
    "3. Jangan memberi nasihat investasi maupun ajakan membeli/menjual.",
    "   Jelaskan apa yang ditunjukkan datanya.",
    "4. Bahasa Indonesia, lugas, ringkas. Langsung ke inti jawaban.",
    "5. Kalau sinyalnya bertentangan, katakan begitu — jangan dipaksa terdengar",
    "   meyakinkan.",
  ].join("\n");

  // Pertanyaan siap pakai. Dipilih dari yang benar-benar sering ditanyakan
  // saat menimbang satu saham, bukan sekadar mengisi ruang.
  const SUGGESTIONS = [
    "Kenapa skornya segini?",
    "Apa risiko terbesarnya?",
    "Bandingkan dengan sektornya",
    "Kapan waktu masuk yang wajar?",
    "Apa yang bisa membalik arahnya?",
  ];

  // ── penyimpanan key ─────────────────────────────────────────────────

  function getKey() {
    try { return localStorage.getItem(KEY_STORAGE); } catch { return null; }
  }
  function setKey(k) {
    try { localStorage.setItem(KEY_STORAGE, k); return true; } catch { return false; }
  }
  function clearKey() {
    try { localStorage.removeItem(KEY_STORAGE); } catch {}
  }
  const hasKey = () => !!getKey();

  // Cek bentuk saja, bukan keabsahan. Menangkap salah-tempel lebih awal
  // jauh lebih ramah daripada memunculkan 401 setelah request.
  function looksLikeKey(k) {
    return typeof k === "string" && /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k.trim());
  }

  // ── konteks ─────────────────────────────────────────────────────────

  // Bentuk konteksnya sengaja sama dengan build_payload() di ai_brief.py,
  // supaya jawaban interaktif dan brief pre-computed berpijak pada data yang
  // sama persis — bukan dua potret berbeda dari saham yang sama.
  const INDICATOR_KEYS = [
    "price", "ema50", "ema200", "rsi", "macd", "adx", "stoch", "bollinger",
    "supertrend", "cross", "pos52w", "obvSlope", "volRatio", "atrPct",
    "divergence", "mfi", "williamsR", "cci", "ichimoku", "distEma200",
    "techParts", "risk",
  ];

  function buildContext(stock, extra) {
    extra = extra || {};
    const ctx = {
      ticker: stock.ticker,
      nama: stock.name,
      sektor: stock.sector,
      tujuhFaktor: stock.signals,
      etika: { afiliasiIsrael: (stock.ethics || {}).israelTie },
    };
    if (extra.composite != null) ctx.skorKomposit = extra.composite;
    if (extra.verdict) {
      ctx.rekomendasi = {
        aksi: extra.verdict.label,
        alasan: extra.verdict.rationale,
        target: extra.verdict.target,
        upsidePct: extra.verdict.upsidePct,
      };
    }
    if (extra.indicators) {
      const ind = {};
      for (const k of INDICATOR_KEYS) {
        if (extra.indicators[k] != null) ind[k] = extra.indicators[k];
      }
      if (Object.keys(ind).length) ctx.indikator = ind;
    }
    if (extra.fundamentals && Object.keys(extra.fundamentals).length) {
      ctx.fundamental = extra.fundamentals;
    }
    if (extra.analyst && extra.analyst.numAnalysts) ctx.analis = extra.analyst;
    return ctx;
  }

  function buildRequest(context, question, history) {
    const messages = [];
    // Konteks dikirim sebagai giliran pertama, bukan diselipkan ke system
    // prompt: dengan begitu system prompt tetap identik antar-saham dan bisa
    // di-cache lintas pertanyaan.
    messages.push({
      role: "user",
      content: "Data saham:\n" + JSON.stringify(context, null, 1),
    });
    messages.push({ role: "assistant", content: "Siap. Silakan bertanya soal saham ini." });
    for (const turn of history || []) {
      messages.push({ role: turn.role, content: turn.content });
    }
    messages.push({ role: "user", content: question });

    return {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [{
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      }],
      messages: messages,
      // Tanya-jawab pendek tidak perlu penalaran panjang; ini menekan biaya
      // dan latensi tanpa mengurangi kualitas jawaban.
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      stream: true,
    };
  }

  // ── SSE ─────────────────────────────────────────────────────────────

  // Diekspos terpisah dari network supaya bisa diuji tanpa jaringan.
  // Memulangkan { text, done } untuk tiap baris SSE yang relevan.
  function parseSSELine(line) {
    if (!line.startsWith("data:")) return null;
    const raw = line.slice(5).trim();
    if (!raw || raw === "[DONE]") return { done: true };
    let evt;
    try { evt = JSON.parse(raw); } catch { return null; }
    if (evt.type === "content_block_delta" && evt.delta && evt.delta.type === "text_delta") {
      return { text: evt.delta.text };
    }
    if (evt.type === "message_stop") return { done: true };
    // Klasifikator keamanan bisa menolak; itu HTTP 200, bukan error.
    if (evt.type === "message_delta" && evt.delta && evt.delta.stop_reason === "refusal") {
      return { refusal: true };
    }
    if (evt.type === "error") {
      return { error: (evt.error && evt.error.message) || "kesalahan tak dikenal" };
    }
    return null;
  }

  function friendlyError(status, body) {
    if (status === 401) return "API key ditolak. Periksa kembali key-nya.";
    if (status === 400) return "Permintaan ditolak API: " + (body || "").slice(0, 200);
    if (status === 429) return "Kuota atau rate limit tercapai. Coba lagi sebentar lagi.";
    if (status >= 500) return "Server Anthropic sedang bermasalah. Coba lagi nanti.";
    return "Gagal menghubungi API (HTTP " + status + ").";
  }

  // ── panggilan utama ─────────────────────────────────────────────────

  /**
   * ask({ context, question, history, onDelta, signal }) -> Promise<string>
   *
   * onDelta dipanggil tiap potongan teks datang, supaya UI bisa menampilkan
   * jawaban sambil mengalir alih-alih diam lama lalu memuntahkan semuanya.
   */
  async function ask(opts) {
    const key = getKey();
    if (!key) throw new Error("Belum ada API key. Pasang dulu lewat tombol Tanya AI.");

    const res = await fetch(API_URL, {
      method: "POST",
      signal: opts.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": API_VERSION,
        // Header yang sama dipasang SDK resmi saat dangerouslyAllowBrowser
        // diaktifkan. Tanpa ini, permintaan dari browser ditolak.
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(buildRequest(opts.context, opts.question, opts.history)),
    });

    if (!res.ok) {
      let body = "";
      try { body = await res.text(); } catch {}
      throw new Error(friendlyError(res.status, body));
    }
    if (!res.body) throw new Error("Peramban ini tidak mendukung streaming respons.");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Baris terakhir bisa terpotong di tengah; simpan untuk chunk berikutnya.
      buffer = lines.pop() || "";
      for (const line of lines) {
        const evt = parseSSELine(line.trim());
        if (!evt) continue;
        if (evt.error) throw new Error(evt.error);
        if (evt.refusal) throw new Error("Permintaan ditolak oleh filter keamanan model.");
        if (evt.text) {
          answer += evt.text;
          if (opts.onDelta) opts.onDelta(evt.text, answer);
        }
        if (evt.done) return answer;
      }
    }
    return answer;
  }

  window.AI_LIB = {
    ask, buildContext, buildRequest, parseSSELine, friendlyError,
    getKey, setKey, clearKey, hasKey, looksLikeKey,
    SUGGESTIONS, MODEL, SYSTEM_PROMPT,
  };
})();
