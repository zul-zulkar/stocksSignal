// =====================================================================
// Client-side refresh: Stooq → recompute technical → commit ke GitHub
// =====================================================================
// Sumber data: https://stooq.com/q/d/l/?s=<sym>.us&i=d (CSV)
// Stooq TIDAK mengirim CORS headers, jadi fetch via CORS proxy publik
// (corsproxy.io, fallback allorigins.win).
// Commit via GitHub Contents API menggunakan PAT yang disimpan di localStorage.
// Port matematika sinyal teknikal dari scripts/fetch_signals.py.
// =====================================================================

(function () {
  const REPO_OWNER = "zul-zulkar";
  const REPO_NAME  = "stocksSignal";
  const BRANCH     = "main";
  const PAT_KEY    = "githubPAT";
  const DRAFT_KEY  = "signalManualDraft";

  const SIGNAL_KEYS = ["technical","momentum","sentiment","news","policy","profile","valuation"];

  // ---------- localStorage PAT ----------
  function getPAT()        { try { return localStorage.getItem(PAT_KEY); } catch { return null; } }
  function setPAT(token)   { try { localStorage.setItem(PAT_KEY, token); } catch {} }
  function clearPAT()      { try { localStorage.removeItem(PAT_KEY); } catch {} }

  // ---------- Math helpers ----------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const avg = arr => arr.reduce((s, x) => s + x, 0) / arr.length;

  // Wilder's RSI (sama dengan ewm(alpha=1/period) di Python pandas)
  function rsi14(closes) {
    const period = 14;
    if (closes.length < period + 1) return 50;
    let up = 0, down = 0;
    for (let i = 1; i <= period; i++) {
      const d = closes[i] - closes[i - 1];
      if (d > 0) up += d; else down -= d;
    }
    up /= period; down /= period;
    const alpha = 1 / period;
    for (let i = period + 1; i < closes.length; i++) {
      const d = closes[i] - closes[i - 1];
      const u = d > 0 ? d : 0;
      const v = d < 0 ? -d : 0;
      up   = up   * (1 - alpha) + u * alpha;
      down = down * (1 - alpha) + v * alpha;
    }
    if (down === 0) return 100;
    const rs = up / down;
    return 100 - 100 / (1 + rs);
  }

  function computeTechScore(closes) {
    if (!closes || closes.length < 200) return 0;
    const sma50  = avg(closes.slice(-50));
    const sma200 = avg(closes.slice(-200));
    const crossScore = sma50 > sma200 ? 40 : -40;
    const r = rsi14(closes);
    const rsiScore = r < 30 ? 40
                   : r > 70 ? -40
                   : Math.round((50 - r) * 0.8);
    const mom = (closes[closes.length - 1] / closes[closes.length - 22] - 1) * 100;
    const momScore = clamp(Math.round(mom), -20, 20);
    return clamp(crossScore + rsiScore + momScore, -100, 100);
  }

  // ---------- Stooq fetch ----------
  function stooqSymbol(ticker) {
    return ticker.toLowerCase().replace(/\./g, "-") + ".us";
  }

  function parseStooqCSV(csv) {
    // Header: Date,Open,High,Low,Close,Volume
    const lines = csv.trim().split(/\r?\n/);
    if (lines.length < 2) return { closes: [], lastDate: null };
    const header = lines[0].toLowerCase().split(",");
    const closeIdx = header.indexOf("close");
    const dateIdx  = header.indexOf("date");
    if (closeIdx < 0) return { closes: [], lastDate: null };
    const closes = [];
    let lastDate = null;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      const c = parseFloat(parts[closeIdx]);
      if (Number.isFinite(c)) {
        closes.push(c);
        if (dateIdx >= 0) lastDate = parts[dateIdx];
      }
    }
    return { closes, lastDate };
  }

  // Stooq tidak punya CORS, jadi rangkai via CORS proxy publik.
  // Urutan dicoba: direct (jarang sukses), corsproxy.io, allorigins.win.
  function proxyVariants(stooqUrl) {
    const enc = encodeURIComponent(stooqUrl);
    return [
      stooqUrl,
      "https://corsproxy.io/?url=" + enc,
      "https://api.allorigins.win/raw?url=" + enc,
      "https://api.codetabs.com/v1/proxy?quest=" + enc
    ];
  }

  async function fetchStooqHistory(ticker, signal) {
    const sym = stooqSymbol(ticker);
    const stooqUrl = `https://stooq.com/q/d/l/?s=${sym}&i=d`;
    let lastErr = null;
    for (const url of proxyVariants(stooqUrl)) {
      try {
        const res = await fetch(url, { signal, cache: "no-store" });
        if (!res.ok) { lastErr = new Error(`HTTP ${res.status} via ${hostOf(url)}`); continue; }
        const csv = await res.text();
        if (!csv || csv.startsWith("<") || csv.includes("No data") || csv.length < 50) {
          lastErr = new Error(`empty/HTML response via ${hostOf(url)}`);
          continue;
        }
        const parsed = parseStooqCSV(csv);
        if (parsed.closes.length < 1) {
          lastErr = new Error(`parse failed via ${hostOf(url)}`);
          continue;
        }
        return parsed;
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
      }
    }
    throw lastErr || new Error("all proxies failed");
  }

  function hostOf(u) {
    try { return new URL(u).host; } catch { return "?"; }
  }

  // Bangun entri overlay (technical + harga + perubahan) dari deret closes.
  function overlayEntry(closes, lastDate) {
    const lastClose = closes[closes.length - 1];
    const prevClose = closes.length >= 2 ? closes[closes.length - 2] : lastClose;
    const changePct = prevClose ? (lastClose / prevClose - 1) * 100 : 0;
    return {
      technical: computeTechScore(closes),
      lastClose,
      prevClose,
      changePct: Math.round(changePct * 100) / 100,
      lastDate
    };
  }

  // ---------- Refresh satu saham (in-memory, tanpa PAT) ----------
  async function refreshOne(ticker) {
    const parsed = await fetchStooqHistory(ticker);
    if (!parsed || parsed.closes.length < 200) {
      throw new Error(`data tidak cukup untuk ${ticker} (butuh ≥200 hari)`);
    }
    return overlayEntry(parsed.closes, parsed.lastDate);
  }

  // ---------- Refresh orchestrator ----------
  async function refreshAll(tickers, onProgress) {
    const overlay = {};
    const failed = [];
    const errors = [];
    const batchSize = 5;
    let done = 0;
    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(t => fetchStooqHistory(t))
      );
      results.forEach((r, idx) => {
        const ticker = batch[idx];
        if (r.status === "fulfilled" && r.value.closes.length >= 200) {
          overlay[ticker] = overlayEntry(r.value.closes, r.value.lastDate);
        } else {
          failed.push(ticker);
          const reason = r.status === "rejected"
            ? (r.reason && r.reason.message) || String(r.reason)
            : `closes=${r.value && r.value.closes.length}`;
          errors.push({ ticker, reason });
          if (errors.length <= 5) console.warn(`[refresh] ${ticker}: ${reason}`);
        }
      });
      done += batch.length;
      if (onProgress) onProgress(done, tickers.length, failed.length);
      if (i + batchSize < tickers.length) await new Promise(r => setTimeout(r, 200));
    }
    const firstError = errors[0] || null;
    return { overlay, failed, errors, firstError };
  }

  // ---------- GitHub Contents API ----------
  function utf8Base64(str) {
    // btoa hanya support latin1; encode UTF-8 dulu
    return btoa(unescape(encodeURIComponent(str)));
  }

  function ghHeaders(pat) {
    return {
      "Authorization": "Bearer " + pat,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  async function ghGetFileSha(pat, path) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`;
    const res = await fetch(url, { headers: ghHeaders(pat), cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GET ${path} → ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = await res.json();
    return json.sha;
  }

  async function ghPutFile(pat, path, content, message) {
    const sha = await ghGetFileSha(pat, path);
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    const body = {
      message,
      content: utf8Base64(content),
      branch: BRANCH
    };
    if (sha) body.sha = sha;
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...ghHeaders(pat), "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const detail = await res.text();
      if (res.status === 401) throw new Error("PAT tidak valid. Periksa scope: Contents Read/Write untuk repo ini.");
      if (res.status === 403) throw new Error("PAT ditolak. Pastikan repo access mencakup zul-zulkar/stocksSignal.");
      if (res.status === 409) throw new Error("Konflik commit (ada update bersamaan). Tap Refresh lagi.");
      throw new Error(`PUT ${path} → ${res.status}: ${detail.slice(0, 200)}`);
    }
    return res.json();
  }

  function serializeOverlay(overlay) {
    const lines = ['// Auto-generated by browser refresh — jangan edit manual.'];
    lines.push('window.SIGNAL_OVERLAY = ' + JSON.stringify(overlay, null, 2) + ';');
    return lines.join('\n') + '\n';
  }

  function serializeMeta(meta) {
    const lines = ['// Auto-generated by browser refresh — jangan edit manual.'];
    lines.push('window.STOCK_META = ' + JSON.stringify(meta, null, 2) + ';');
    return lines.join('\n') + '\n';
  }

  async function commitOverlay(pat, overlay, meta) {
    const today = new Date().toISOString().slice(0, 10);
    const msg = `refresh: technical signals from HP (${today})`;
    await ghPutFile(pat, "data/signals-overlay.js", serializeOverlay(overlay), msg);
    await ghPutFile(pat, "data/meta.js", serializeMeta(meta), msg);
  }

  // ---------- Trigger pipeline lengkap (GitHub Actions) ----------
  const WORKFLOW_FILE = "refresh.yml";

  // Jalankan ulang scrape penuh (semua sinyal + data analis) di cloud.
  // Butuh PAT dengan izin Actions: Read and write.
  async function ghDispatchWorkflow(pat, ref = BRANCH) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...ghHeaders(pat), "Content-Type": "application/json" },
      body: JSON.stringify({ ref })
    });
    if (res.status === 204) return true;
    const detail = await res.text();
    if (res.status === 401) throw new Error("PAT tidak valid untuk Actions.");
    if (res.status === 403) throw new Error("PAT ditolak. Tambah izin Actions: Read and write untuk repo ini.");
    if (res.status === 404) throw new Error("Workflow tidak ditemukan / PAT tak punya akses Actions.");
    throw new Error(`Dispatch → ${res.status}: ${detail.slice(0, 200)}`);
  }

  // Ambil status run terbaru KHUSUS workflow refresh.yml yang dipicu manual
  // (event=workflow_dispatch) → { status, conclusion, html_url, createdAt }.
  // Penting: jangan pakai endpoint /actions/runs umum, karena bisa mengembalikan
  // run dari workflow lain (mis. deploy/tests) sehingga status salah lapor.
  async function ghLatestRun(pat) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1&event=workflow_dispatch`;
    const res = await fetch(url, { headers: ghHeaders(pat), cache: "no-store" });
    if (!res.ok) throw new Error(`GET runs → ${res.status}`);
    const json = await res.json();
    const run = (json.workflow_runs || [])[0];
    if (!run) return null;
    return {
      status:     run.status,       // queued | in_progress | completed
      conclusion: run.conclusion,   // success | failure | null
      html_url:   run.html_url,
      createdAt:  run.created_at,
    };
  }

  // =====================================================================
  // Lapis manual — edit sinyal dari HP tanpa fetch harga sama sekali.
  // =====================================================================
  // Nilai akhir sebuah sinyal = tumpukan 4 lapis, yang di bawah menang:
  //   1. baseline  data/stocks.js
  //   2. auto      data/signals-overlay.js  (hanya `technical`, dari Stooq)
  //   3. manual    data/signals-manual.js   (subset bebas dari 7 faktor)
  //   4. draft     localStorage             (edit yang belum di-commit)
  // Lapis manual sengaja dipisah dari lapis auto supaya refresh Stooq/Actions
  // tidak pernah menimpa edit tangan, dan keduanya tidak rebutan file sama.

  // ---------- Draft di localStorage ----------
  function getDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const d = raw ? JSON.parse(raw) : {};
      return d && typeof d === "object" ? d : {};
    } catch { return {}; }
  }
  function saveDraft(draft) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft || {})); } catch {}
  }
  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }
  function draftCount() { return Object.keys(getDraft()).length; }

  // Nilai baseline sebuah faktor (setelah lapis auto, sebelum lapis manual).
  // Dipakai untuk menentukan apakah sebuah edit masih "beda dari asli".
  function baselineSignal(ticker, key) {
    const universe = window.STOCK_UNIVERSE || [];
    const stock = universe.find(s => s.ticker === ticker);
    if (!stock) return null;
    const base = stock._base || stock.signals || {};
    if (key === "technical") {
      const o = (window.SIGNAL_OVERLAY || {})[ticker];
      if (o && Number.isFinite(o.technical)) return o.technical;
    }
    return Number.isFinite(base[key]) ? base[key] : 0;
  }

  // Set satu faktor di draft. Mengembalikan draft yang sama (dimutasi).
  // Kalau nilainya sama dengan baseline, key-nya dibuang — itu yang bikin
  // tombol reset bekerja dan draft tidak menggembung oleh nilai identik.
  function setManualSignal(draft, ticker, key, value) {
    if (!draft || typeof draft !== "object") draft = {};
    const entry = draft[ticker] || { signals: {} };
    if (!entry.signals) entry.signals = {};

    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      delete entry.signals[key];
    } else {
      const v = clamp(Math.round(Number(value)), -100, 100);
      if (v === baselineSignal(ticker, key)) delete entry.signals[key];
      else entry.signals[key] = v;
    }

    const hasSignals = Object.keys(entry.signals).length > 0;
    const hasNote = typeof entry.note === "string" && entry.note.trim() !== "";
    if (!hasSignals && !hasNote) delete draft[ticker];
    else {
      entry.editedAt = new Date().toISOString();
      draft[ticker] = entry;
    }
    return draft;
  }

  function setManualNote(draft, ticker, note) {
    if (!draft || typeof draft !== "object") draft = {};
    const entry = draft[ticker] || { signals: {} };
    if (!entry.signals) entry.signals = {};
    const txt = (note || "").trim();
    if (txt) entry.note = txt; else delete entry.note;

    const hasSignals = Object.keys(entry.signals).length > 0;
    if (!hasSignals && !txt) delete draft[ticker];
    else {
      entry.editedAt = new Date().toISOString();
      draft[ticker] = entry;
    }
    return draft;
  }

  // Buang seluruh edit manual (committed + draft) untuk satu ticker.
  // Perlu tombstone `cleared` supaya entri di file committed ikut kalah.
  function resetManual(draft, ticker) {
    if (!draft || typeof draft !== "object") draft = {};
    const committed = (window.SIGNAL_MANUAL || {})[ticker];
    if (committed) draft[ticker] = { signals: {}, cleared: true, editedAt: new Date().toISOString() };
    else delete draft[ticker];
    return draft;
  }

  // Gabung file committed dengan draft. Draft menang per-key.
  function mergedManual() {
    const committed = window.SIGNAL_MANUAL || {};
    const draft = getDraft();
    const out = {};
    for (const t of new Set([...Object.keys(committed), ...Object.keys(draft)])) {
      const c = committed[t] || {};
      const d = draft[t] || {};
      const signals = d.cleared ? { ...(d.signals || {}) }
                                : { ...(c.signals || {}), ...(d.signals || {}) };
      const entry = { signals };
      const note = d.cleared ? d.note : (d.note !== undefined ? d.note : c.note);
      if (note) entry.note = note;
      const editedAt = d.editedAt || c.editedAt;
      if (editedAt) entry.editedAt = editedAt;
      if (Object.keys(signals).length || entry.note) out[t] = entry;
    }
    return out;
  }

  // ---------- Apply semua lapis ke STOCK_UNIVERSE ----------
  function applyLayers() {
    const universe = window.STOCK_UNIVERSE;
    if (!universe) return;
    const ov = window.SIGNAL_OVERLAY || {};
    const man = mergedManual();
    universe.forEach(s => {
      // Snapshot baseline sekali. Tanpa ini, reset edit tidak bisa
      // mengembalikan nilai asli karena s.signals sudah ditimpa.
      if (!s._base) s._base = { ...s.signals };
      s.signals = { ...s._base };

      const o = ov[s.ticker];
      if (o && Number.isFinite(o.technical)) s.signals.technical = o.technical;

      const m = man[s.ticker];
      if (m && m.signals) {
        for (const [k, v] of Object.entries(m.signals)) {
          if (Number.isFinite(v)) s.signals[k] = v;
        }
      }
    });
  }

  // Nama lama tetap dipertahankan — dipakai js/app.js, js/compare.js, tests.
  const applyOverlay = applyLayers;

  function serializeManual(manual) {
    const lines = ['// Edit sinyal manual dari dashboard (tab "Edit"). Aman diedit tangan juga.'];
    lines.push('window.SIGNAL_MANUAL = ' + JSON.stringify(manual, null, 2) + ';');
    return lines.join('\n') + '\n';
  }

  async function commitManual(pat, manual) {
    const today = new Date().toISOString().slice(0, 10);
    const n = Object.keys(manual).length;
    const msg = `manual: edit sinyal ${n} ticker dari HP (${today})`;
    await ghPutFile(pat, "data/signals-manual.js", serializeManual(manual), msg);
  }

  window.REFRESH_LIB = {
    SIGNAL_KEYS,
    getPAT, setPAT, clearPAT,
    refreshAll, refreshOne, commitOverlay,
    ghDispatchWorkflow, ghLatestRun,
    applyOverlay, applyLayers, computeTechScore, rsi14, overlayEntry,
    serializeOverlay, serializeMeta,
    stooqSymbol, parseStooqCSV,
    getDraft, saveDraft, clearDraft, draftCount,
    baselineSignal, setManualSignal, setManualNote, resetManual,
    mergedManual, serializeManual, commitManual
  };
})();
