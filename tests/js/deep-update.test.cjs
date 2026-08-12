// Jalur "Perbarui Data": dispatch workflow, cek izin PAT, baca status run.
const test = require("node:test");
const assert = require("node:assert");
const { makeWindow, load } = require("./_loader.cjs");

// Konteks dengan fetch yang bisa diprogram. Tiap panggilan dicatat supaya
// URL/method/body bisa diperiksa.
function ctx(responder) {
  const c = makeWindow();
  c.calls = [];
  c.fetch = async (url, opts = {}) => {
    c.calls.push({ url, opts });
    const r = responder(url, opts) || {};
    return {
      ok: r.status === undefined ? true : r.status >= 200 && r.status < 300,
      status: r.status === undefined ? 200 : r.status,
      text: async () => r.body === undefined ? "" : String(r.body),
      json: async () => r.json === undefined ? {} : r.json,
    };
  };
  load(c, "js/refresh.js");
  return c;
}
const okDispatch = () => ({ status: 204 });

test("ghDispatchWorkflow: POST ke endpoint dispatches milik refresh.yml", async () => {
  const c = ctx(okDispatch);
  const res = await c.REFRESH_LIB.ghDispatchWorkflow("tok");
  assert.strictEqual(res, true);
  assert.strictEqual(c.calls.length, 1);
  const { url, opts } = c.calls[0];
  assert.ok(url.endsWith("/actions/workflows/refresh.yml/dispatches"), url);
  assert.strictEqual(opts.method, "POST");
  assert.strictEqual(JSON.parse(opts.body).ref, "main");
  assert.strictEqual(opts.headers.Authorization, "Bearer tok");
});

test("ghDispatchWorkflow: ref bisa ditimpa", async () => {
  const c = ctx(okDispatch);
  await c.REFRESH_LIB.ghDispatchWorkflow("tok", "dev");
  assert.strictEqual(JSON.parse(c.calls[0].opts.body).ref, "dev");
});

for (const [status, pola] of [[401, /tidak valid/i], [403, /Actions/i], [404, /tidak ditemukan|akses/i]]) {
  test(`ghDispatchWorkflow: ${status} → pesan yang bisa ditindaklanjuti`, async () => {
    const c = ctx(() => ({ status, body: "nope" }));
    await assert.rejects(() => c.REFRESH_LIB.ghDispatchWorkflow("tok"), pola);
  });
}

test("ghCheckPAT: token kosong ditolak tanpa memanggil jaringan", async () => {
  const c = ctx(okDispatch);
  const r = await c.REFRESH_LIB.ghCheckPAT("");
  assert.strictEqual(r.ok, false);
  assert.strictEqual(c.calls.length, 0);
});

test("ghCheckPAT: 200 → ok, dan menyentuh endpoint workflow", async () => {
  const c = ctx(() => ({ status: 200 }));
  const r = await c.REFRESH_LIB.ghCheckPAT("tok");
  assert.strictEqual(r.ok, true);
  assert.ok(c.calls[0].url.endsWith("/actions/workflows/refresh.yml"), c.calls[0].url);
  assert.ok(/Actions/i.test(r.message), r.message);
});

test("ghCheckPAT: 403 menyebut izin Actions yang kurang", async () => {
  const c = ctx(() => ({ status: 403 }));
  const r = await c.REFRESH_LIB.ghCheckPAT("tok");
  assert.strictEqual(r.ok, false);
  assert.ok(/Actions: Read and write/i.test(r.message), r.message);
});

test("ghCheckPAT: 401 dan 404 punya pesan berbeda", async () => {
  const a = await ctx(() => ({ status: 401 })).REFRESH_LIB.ghCheckPAT("tok");
  const b = await ctx(() => ({ status: 404 })).REFRESH_LIB.ghCheckPAT("tok");
  assert.ok(/kedaluwarsa|tidak valid/i.test(a.message), a.message);
  assert.ok(/Repository access|tak terlihat/i.test(b.message), b.message);
  assert.notStrictEqual(a.message, b.message);
});

test("ghCheckPAT: fetch melempar → dilaporkan, bukan crash", async () => {
  const c = makeWindow();
  c.fetch = async () => { throw new Error("offline"); };
  load(c, "js/refresh.js");
  const r = await c.REFRESH_LIB.ghCheckPAT("tok");
  assert.strictEqual(r.ok, false);
  assert.ok(/offline/.test(r.message), r.message);
});

test("ghLatestRun: memfilter event=workflow_dispatch & mengembalikan html_url", async () => {
  const c = ctx(() => ({
    json: { workflow_runs: [{
      status: "in_progress", conclusion: null,
      html_url: "https://github.com/zul-zulkar/stocksSignal/actions/runs/1",
      created_at: "2026-08-12T00:00:00Z",
    }] },
  }));
  const run = await c.REFRESH_LIB.ghLatestRun("tok");
  assert.ok(c.calls[0].url.includes("event=workflow_dispatch"), c.calls[0].url);
  assert.ok(c.calls[0].url.includes("/actions/workflows/refresh.yml/runs"), c.calls[0].url);
  assert.strictEqual(run.status, "in_progress");
  assert.strictEqual(run.html_url, "https://github.com/zul-zulkar/stocksSignal/actions/runs/1");
});

test("ghLatestRun: belum ada run → null, bukan lempar", async () => {
  const c = ctx(() => ({ json: { workflow_runs: [] } }));
  assert.strictEqual(await c.REFRESH_LIB.ghLatestRun("tok"), null);
});

test("ghLatestRun: respons gagal → lempar", async () => {
  const c = ctx(() => ({ status: 500 }));
  await assert.rejects(() => c.REFRESH_LIB.ghLatestRun("tok"), /500/);
});

test("pollDelay: rapat 10 detik di 2 menit pertama, lalu 30 detik", () => {
  const R = ctx(okDispatch).REFRESH_LIB;
  assert.strictEqual(R.pollDelay(0), 10_000);
  assert.strictEqual(R.pollDelay(119_000), 10_000);
  assert.strictEqual(R.pollDelay(120_000), 30_000, "batas 2 menit inklusif ke jeda longgar");
  assert.strictEqual(R.pollDelay(45 * 60_000), 30_000);
});

test("batas pemantauan melampaui timeout pipeline (55 menit)", () => {
  const R = ctx(okDispatch).REFRESH_LIB;
  assert.ok(R.DEEP_TIMEOUT_MS > 55 * 60_000,
            "harus lebih lama dari timeout-minutes refresh.yml");
  assert.ok(R.DEEP_TIMEOUT_MS <= 90 * 60_000, "jangan memantau tanpa akhir");
});

test("jumlah polling sepanjang pipeline tetap wajar (hemat rate limit)", () => {
  const R = ctx(okDispatch).REFRESH_LIB;
  let t = 0, n = 0;
  while (t < R.DEEP_TIMEOUT_MS) { t += R.pollDelay(t); n++; }
  assert.ok(n < 150, "terlalu banyak panggilan API: " + n);
  assert.ok(n > 100, "terlalu jarang, status jadi basi: " + n);
});
