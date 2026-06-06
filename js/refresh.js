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

  // Ambil status run terbaru → { status, conclusion, html_url, createdAt }
  async function ghLatestRun(pat) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=1`;
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

  // ---------- Apply overlay ke STOCK_UNIVERSE saat load ----------
  function applyOverlay() {
    const ov = window.SIGNAL_OVERLAY || {};
    if (!window.STOCK_UNIVERSE) return;
    window.STOCK_UNIVERSE.forEach(s => {
      const o = ov[s.ticker];
      if (o && Number.isFinite(o.technical)) {
        s.signals.technical = o.technical;
      }
    });
  }

  window.REFRESH_LIB = {
    getPAT, setPAT, clearPAT,
    refreshAll, refreshOne, commitOverlay,
    ghDispatchWorkflow, ghLatestRun,
    applyOverlay, computeTechScore, rsi14, overlayEntry,
    serializeOverlay, serializeMeta,
    stooqSymbol, parseStooqCSV
  };
})();
