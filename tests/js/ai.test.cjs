// Uji js/ai.js — "Tanya AI" BYOK.
//
// Tidak ada jaringan: _loader.cjs sudah menyediakan fetch yang selalu
// melempar. Yang diuji di sini adalah bagian yang paling merugikan kalau
// salah — penyusunan konteks (jangan sampai mengirim data yang keliru),
// penguraian SSE, dan penanganan penolakan/kesalahan.

const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

function ctx(store) {
  const c = makeWindow({ localStorage: store || {} });
  load(c, "js/ai.js");
  return c.window.AI_LIB;
}

const STOCK = {
  ticker: "AAPL", name: "Apple Inc.", sector: "Technology",
  signals: { technical: 43, momentum: 0, sentiment: 44, news: 0, policy: 15, profile: 65, valuation: -36 },
  ethics: { israelTie: "medium" },
};

// ── penyimpanan key ──────────────────────────────────────────────────

test("key tersimpan, terbaca, dan terhapus", () => {
  const A = ctx();
  assert.strictEqual(A.hasKey(), false);
  A.setKey("sk-ant-abc");
  assert.strictEqual(A.getKey(), "sk-ant-abc");
  assert.strictEqual(A.hasKey(), true);
  A.clearKey();
  assert.strictEqual(A.hasKey(), false);
});

test("bentuk key divalidasi sebelum request, bukan setelah 401", () => {
  const A = ctx();
  assert.ok(A.looksLikeKey("sk-ant-api03-" + "x".repeat(40)));
  assert.ok(!A.looksLikeKey("ghp_inibukankeyanthropic"));
  assert.ok(!A.looksLikeKey("sk-ant-"), "terlalu pendek harus ditolak");
  assert.ok(!A.looksLikeKey(""));
  assert.ok(!A.looksLikeKey(null));
});

test("ask menolak lebih awal tanpa key, bukan menembak API", async () => {
  const A = ctx();
  await assert.rejects(
    () => A.ask({ context: {}, question: "halo" }),
    /API key/i
  );
});

// ── konteks ──────────────────────────────────────────────────────────

test("konteks memuat identitas, 7 faktor, dan tag etika", () => {
  const c = ctx().buildContext(STOCK, {});
  assert.strictEqual(c.ticker, "AAPL");
  assert.strictEqual(c.sektor, "Technology");
  assert.deepStrictEqual({ ...c.tujuhFaktor }, STOCK.signals);
  assert.strictEqual(c.etika.afiliasiIsrael, "medium");
});

test("bagian yang kosong tidak dikirim sama sekali", () => {
  // Mengirim kunci kosong hanya membakar token tanpa menambah informasi.
  const c = ctx().buildContext(STOCK, { indicators: {}, fundamentals: {}, analyst: {} });
  assert.ok(!("indikator" in c));
  assert.ok(!("fundamental" in c));
  assert.ok(!("analis" in c));
});

test("indikator dipangkas ke subset yang berguna", () => {
  const c = ctx().buildContext(STOCK, {
    indicators: { rsi: 55, obv: 99999999, ema20: 1, macd: { hist: 0.4 } },
  });
  assert.strictEqual(c.indikator.rsi, 55);
  assert.deepStrictEqual({ ...c.indikator.macd }, { hist: 0.4 });
  assert.ok(!("obv" in c.indikator), "OBV mentah tak sebanding antar-saham");
  assert.ok(!("ema20" in c.indikator));
});

test("analis tanpa liputan tidak disertakan", () => {
  const c = ctx().buildContext(STOCK, { analyst: { numAnalysts: 0 } });
  assert.ok(!("analis" in c));
});

test("verdict dan skor komposit ikut kalau tersedia", () => {
  const c = ctx().buildContext(STOCK, {
    composite: 60,
    verdict: { label: "BELI", rationale: "alasan", target: 322.28, upsidePct: 5.3 },
  });
  assert.strictEqual(c.skorKomposit, 60);
  assert.strictEqual(c.rekomendasi.aksi, "BELI");
  assert.strictEqual(c.rekomendasi.upsidePct, 5.3);
});

// ── penyusunan request ───────────────────────────────────────────────

test("system prompt di-cache dan sama untuk semua saham", () => {
  const A = ctx();
  const a = A.buildRequest({ ticker: "AAA" }, "q");
  const b = A.buildRequest({ ticker: "BBB" }, "q");
  assert.deepStrictEqual({ ...a.system[0].cache_control }, { type: "ephemeral" });
  assert.strictEqual(a.system[0].text, b.system[0].text,
    "system prompt harus identik agar cache-nya kena");
});

test("data saham dikirim sebagai giliran percakapan, bukan di system prompt", () => {
  // Menyelipkannya ke system prompt akan membuat prompt berbeda per saham
  // dan menghapus seluruh manfaat caching.
  const r = ctx().buildRequest({ ticker: "AAPL" }, "kenapa?");
  assert.ok(!r.system[0].text.includes("AAPL"));
  assert.match(r.messages[0].content, /AAPL/);
  assert.strictEqual(r.messages[0].role, "user");
});

test("pertanyaan selalu jadi giliran terakhir", () => {
  const r = ctx().buildRequest({ ticker: "A" }, "pertanyaan saya");
  const last = r.messages[r.messages.length - 1];
  assert.strictEqual(last.role, "user");
  assert.strictEqual(last.content, "pertanyaan saya");
});

test("riwayat percakapan dipertahankan urutannya", () => {
  const r = ctx().buildRequest({ ticker: "A" }, "lanjutannya?", [
    { role: "user", content: "pertama" },
    { role: "assistant", content: "jawab pertama" },
  ]);
  const roles = r.messages.map((m) => m.role).join(",");
  assert.match(roles, /user,assistant,user,assistant,user$/);
});

test("thinking dimatikan dan streaming dinyalakan", () => {
  // Tanya-jawab pendek tidak perlu penalaran panjang; Sonnet 5 menyalakannya
  // secara default, jadi harus dimatikan eksplisit.
  const r = ctx().buildRequest({}, "q");
  assert.deepStrictEqual({ ...r.thinking }, { type: "disabled" });
  assert.strictEqual(r.output_config.effort, "low");
  assert.strictEqual(r.stream, true);
  assert.ok(r.max_tokens > 0 && r.max_tokens <= 2000);
});

// ── penguraian SSE ───────────────────────────────────────────────────

test("delta teks diambil dari event yang benar", () => {
  const A = ctx();
  const line = 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"halo"}}';
  assert.deepStrictEqual({ ...A.parseSSELine(line) }, { text: "halo" });
});

test("event yang tidak relevan diabaikan, bukan bikin crash", () => {
  const A = ctx();
  for (const line of [
    'data: {"type":"message_start","message":{}}',
    'data: {"type":"ping"}',
    'data: {"type":"content_block_start","index":0}',
    "event: ping",
    "",
    "data: bukan-json",
  ]) {
    assert.strictEqual(A.parseSSELine(line), null, line);
  }
});

test("akhir stream dikenali dari kedua bentuknya", () => {
  const A = ctx();
  assert.ok(A.parseSSELine('data: {"type":"message_stop"}').done);
  assert.ok(A.parseSSELine("data: [DONE]").done);
});

test("penolakan filter keamanan dikenali, bukan dianggap jawaban kosong", () => {
  // Penolakan datang sebagai HTTP 200; tanpa penanganan ini, UI akan diam
  // tanpa penjelasan apa pun.
  const A = ctx();
  const line = 'data: {"type":"message_delta","delta":{"stop_reason":"refusal"}}';
  assert.ok(A.parseSSELine(line).refusal);
});

test("event error membawa pesannya", () => {
  const A = ctx();
  const line = 'data: {"type":"error","error":{"message":"overloaded"}}';
  assert.strictEqual(A.parseSSELine(line).error, "overloaded");
});

// ── pesan kesalahan ──────────────────────────────────────────────────

test("kesalahan HTTP diterjemahkan jadi kalimat yang bisa ditindaklanjuti", () => {
  const A = ctx();
  assert.match(A.friendlyError(401, ""), /key/i);
  assert.match(A.friendlyError(429, ""), /kuota|limit/i);
  assert.match(A.friendlyError(500, ""), /server/i);
  assert.match(A.friendlyError(418, ""), /418/);
});

test("badan respons 400 tidak dimuntahkan mentah-mentah ke pengguna", () => {
  const A = ctx();
  const msg = A.friendlyError(400, "x".repeat(5000));
  assert.ok(msg.length < 300, "panjang pesan: " + msg.length);
});

// ── kejujuran antarmuka ──────────────────────────────────────────────

test("system prompt melarang mengarang angka dan memberi nasihat investasi", () => {
  const A = ctx();
  assert.match(A.SYSTEM_PROMPT, /tidak ada di data/i);
  assert.match(A.SYSTEM_PROMPT, /nasihat investasi/i);
});

test("ada saran pertanyaan siap pakai", () => {
  const A = ctx();
  assert.ok(A.SUGGESTIONS.length >= 3);
  for (const s of A.SUGGESTIONS) assert.strictEqual(typeof s, "string");
});
