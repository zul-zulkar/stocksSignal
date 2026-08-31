// =====================================================================
// Panel detail: Analisis (narasi/AI + Tanya AI) dan Indikator.
//
// Keduanya bergantung pada data yang dimuat lambat (js/lazydata.js), jadi
// panelnya dirender dua tahap: kerangka dulu supaya modal langsung terbuka,
// isinya menyusul begitu datanya tiba. Modal yang menunggu 750 KB sebelum
// muncul terasa rusak, meski akhirnya benar.
// =====================================================================

(function () {
  "use strict";

  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === "className") node.className = v;
      else if (k === "onClick") node.addEventListener("click", v);
      else if (k === "html") node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    for (const c of [].concat(children || [])) {
      if (c == null) continue;
      node.append(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  };

  const has = (x) => x != null && !(typeof x === "number" && !Number.isFinite(x));
  const n1 = (x) => (Math.round(x * 10) / 10).toString();
  const n2 = (x) => (Math.round(x * 100) / 100).toString();

  // ── panel Analisis ──────────────────────────────────────────────────

  function sourceBadge(sumber, tier, model) {
    // Menandai asal narasi dengan jujur. Pengguna berhak tahu kalimat yang
    // ia baca datang dari model bahasa atau dari aturan deterministik —
    // keduanya sah, tapi bobot kepercayaannya berbeda.
    if (sumber === "ai") {
      return el("span", { className: "src-badge src-ai", title: "Dibuat model bahasa: " + (model || "?") },
        "Analisis AI" + (tier === 2 ? " · mendalam" : ""));
    }
    return el("span", { className: "src-badge src-rule", title: "Dirangkai dari indikator tanpa model bahasa" },
      "Analisis otomatis");
  }

  function renderBrief(brief) {
    const wrap = el("div", { className: "brief" });
    wrap.append(el("div", { className: "brief-head" }, [
      sourceBadge(brief.sumber, brief.tier, brief.model),
      brief.keyakinan
        ? el("span", { className: "brief-conf conf-" + brief.keyakinan }, "keyakinan " + brief.keyakinan)
        : null,
    ]));

    if (brief.ringkasan) wrap.append(el("p", { className: "brief-lede" }, brief.ringkasan));

    for (const [title, text] of [
      ["Teknikal", brief.teknikal],
      ["Fundamental", brief.fundamental],
      ["Sentimen", brief.sentimen],
    ]) {
      if (!text) continue;
      wrap.append(el("div", { className: "brief-sec" }, [
        el("h5", {}, title),
        el("p", {}, text),
      ]));
    }

    for (const [title, items, cls] of [
      ["Katalis", brief.katalis, "cat-pos"],
      ["Risiko", brief.risiko, "cat-neg"],
    ]) {
      if (!items || !items.length) continue;
      wrap.append(el("div", { className: "brief-sec" }, [
        el("h5", {}, title),
        el("ul", { className: "brief-list " + cls }, items.map((x) => el("li", {}, x))),
      ]));
    }

    const lk = brief.levelKunci || {};
    if (has(lk.support) || has(lk.resisten)) {
      wrap.append(el("div", { className: "brief-levels" }, [
        has(lk.support) ? el("span", {}, ["Support ", el("strong", {}, "$" + n2(lk.support))]) : null,
        has(lk.resisten) ? el("span", {}, ["Resisten ", el("strong", {}, "$" + n2(lk.resisten))]) : null,
        brief.horizon ? el("span", { className: "brief-horizon" }, "Horizon: " + brief.horizon) : null,
      ]));
    }

    wrap.append(el("div", { className: "note" },
      "Bukan nasihat investasi. Semua pernyataan bersandar pada angka yang tersimpan di dashboard ini."));
    return wrap;
  }

  // ── Tanya AI ────────────────────────────────────────────────────────

  function askBox(stock, extra) {
    const AI = window.AI_LIB;
    const box = el("div", { className: "ask-box" });
    box.append(el("h5", {}, "Tanya AI"));

    if (!AI) return box;

    if (!AI.hasKey()) {
      box.append(
        el("p", { className: "note" },
          "Butuh API key Anthropic milik Anda sendiri. Key disimpan hanya di peramban ini."),
        el("p", { className: "note warn" },
          "Perlu diketahui: key yang dipakai langsung dari halaman bisa dibaca skrip mana pun " +
          "di halaman ini, termasuk ekstensi peramban. Pakai key berkuota terbatas."),
        el("button", { className: "ask-setup-btn", onClick: () => promptForKey(box, stock, extra) },
          "Pasang API key")
      );
      return box;
    }
    box.append(askForm(stock, extra));
    return box;
  }

  function promptForKey(box, stock, extra) {
    const AI = window.AI_LIB;
    const input = el("input", {
      type: "password", className: "ask-key-input",
      placeholder: "sk-ant-…", autocomplete: "off", spellcheck: "false",
    });
    const msg = el("div", { className: "note" });
    const save = el("button", { className: "ask-setup-btn" }, "Simpan");
    save.addEventListener("click", () => {
      const v = input.value.trim();
      // Divalidasi bentuknya lebih dulu; memunculkan 401 setelah request
      // jauh kurang membantu daripada memberi tahu sekarang.
      if (!AI.looksLikeKey(v)) {
        msg.textContent = "Formatnya tidak seperti API key Anthropic (diawali sk-ant-).";
        return;
      }
      AI.setKey(v);
      box.replaceChildren(el("h5", {}, "Tanya AI"), askForm(stock, extra));
    });
    box.replaceChildren(el("h5", {}, "Tanya AI"), input, save, msg);
    input.focus();
  }

  function askForm(stock, extra) {
    const AI = window.AI_LIB;
    const wrap = el("div", {});
    const out = el("div", { className: "ask-answer", "aria-live": "polite" });
    const input = el("input", {
      type: "text", className: "ask-input",
      placeholder: "Tanya apa saja soal " + stock.ticker + "…",
    });
    const send = el("button", { className: "ask-send" }, "Tanya");

    let busy = false;
    async function run(question) {
      if (busy || !question) return;
      busy = true;
      send.disabled = true;
      out.textContent = "";
      out.classList.remove("err");
      try {
        await AI.ask({
          context: AI.buildContext(stock, extra),
          question: question,
          onDelta: (_chunk, full) => { out.textContent = full; },
        });
      } catch (e) {
        out.classList.add("err");
        out.textContent = (e && e.message) || String(e);
      } finally {
        busy = false;
        send.disabled = false;
      }
    }

    send.addEventListener("click", () => run(input.value.trim()));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") run(input.value.trim());
    });

    const chips = el("div", { className: "ask-chips" },
      AI.SUGGESTIONS.map((q) =>
        el("button", { className: "ask-chip", onClick: () => { input.value = q; run(q); } }, q)));

    wrap.append(chips, el("div", { className: "ask-row" }, [input, send]), out);
    return wrap;
  }

  // ── panel Indikator ─────────────────────────────────────────────────

  // Tiap baris: label, cara mengambil nilainya, cara memformatnya, dan cara
  // menyimpulkan keadaannya. Chip keadaan itu yang mengubah deretan angka
  // jadi sesuatu yang bisa dibaca sekilas.
  const ROWS = [
    ["Tren", [
      ["Harga vs EMA200", (i) => i.distEma200, (v) => (v >= 0 ? "+" : "") + n1(v) + "%",
        (v) => (v > 2 ? "bull" : v < -2 ? "bear" : "flat")],
      ["EMA 50", (i) => i.ema50, (v) => "$" + n2(v), null],
      ["EMA 200", (i) => i.ema200, (v) => "$" + n2(v), null],
      ["ADX", (i) => (i.adx || {}).adx, (v) => n1(v),
        (v) => (v >= 25 ? "bull" : v >= 20 ? "flat" : "weak"), "≥25 tren kuat, <20 menyamping"],
      ["MACD histogram", (i) => (i.macd || {}).hist, (v) => n2(v),
        (v) => (v > 0 ? "bull" : "bear")],
      ["Supertrend", (i) => (i.supertrend || {}).dir, (v) => (v > 0 ? "Bullish" : "Bearish"),
        (v) => (v > 0 ? "bull" : "bear")],
      ["Ichimoku", (i) => (i.ichimoku || {}).cloudPos,
        (v) => (v > 0 ? "Di atas awan" : v < 0 ? "Di bawah awan" : "Di dalam awan"),
        (v) => (v > 0 ? "bull" : v < 0 ? "bear" : "flat")],
      ["Golden/death cross", (i) => (i.cross || {}).state,
        (v, i) => (v === "golden" ? "Golden" : "Death") +
          (has((i.cross || {}).daysSince) ? " · " + i.cross.daysSince + " hari" : ""),
        (v) => (v === "golden" ? "bull" : "bear")],
    ]],
    ["Momentum & osilator", [
      ["RSI (14)", (i) => i.rsi, (v) => n1(v),
        (v) => (v < 30 ? "bull" : v > 70 ? "bear" : "flat"), "<30 jenuh jual, >70 jenuh beli"],
      ["Stochastic %K", (i) => (i.stoch || {}).k, (v) => n1(v),
        (v) => (v < 20 ? "bull" : v > 80 ? "bear" : "flat")],
      ["MFI (14)", (i) => i.mfi, (v) => n1(v),
        (v) => (v < 20 ? "bull" : v > 80 ? "bear" : "flat"), "RSI berbobot volume"],
      ["Williams %R", (i) => i.williamsR, (v) => n1(v),
        (v) => (v < -80 ? "bull" : v > -20 ? "bear" : "flat")],
      ["CCI (20)", (i) => i.cci, (v) => n1(v),
        (v) => (v < -100 ? "bull" : v > 100 ? "bear" : "flat")],
      ["Divergence RSI", (i) => i.divergence, (v) => (v === "bullish" ? "Bullish" : "Bearish"),
        (v) => (v === "bullish" ? "bull" : "bear"), "harga dan RSI bergerak berlawanan"],
    ]],
    ["Volatilitas", [
      ["Bollinger %B", (i) => (i.bollinger || {}).pctB, (v) => n1(v),
        (v) => (v < 0 ? "bull" : v > 100 ? "bear" : "flat"), "0 = pita bawah, 100 = pita atas"],
      ["Lebar pita", (i) => (i.bollinger || {}).bandwidth, (v) => n1(v) + "%", null],
      ["Squeeze", (i) => (i.bollinger || {}).squeeze, (v) => (v ? "Ya" : "Tidak"),
        (v) => (v ? "watch" : "flat"), "pita menyempit — sering mendahului pergerakan besar"],
      ["ATR", (i) => i.atrPct, (v) => n1(v) + "%", null, "rata-rata rentang harian"],
    ]],
    ["Volume", [
      ["Arah OBV", (i) => i.obvSlope, (v) => n2(v),
        (v) => (v > 0.05 ? "bull" : v < -0.05 ? "bear" : "flat"), "positif = akumulasi"],
      ["Volume vs rata-rata", (i) => i.volRatio, (v) => n2(v) + "×",
        (v) => (v >= 1.5 ? "watch" : v <= 0.6 ? "weak" : "flat")],
    ]],
    ["Posisi & risiko", [
      ["Posisi 52 minggu", (i) => (i.pos52w || {}).pct, (v) => n1(v) + "%",
        (v) => (v >= 80 ? "watch" : v <= 20 ? "weak" : "flat")],
      ["Beta", (i) => (i.risk || {}).beta, (v) => n2(v),
        (v) => (v >= 1.5 ? "watch" : "flat"), "1.0 = bergerak seiring pasar"],
      ["Volatilitas tahunan", (i) => (i.risk || {}).volatility, (v) => n1(v) + "%",
        (v) => (v >= 50 ? "watch" : "flat")],
      ["Max drawdown 1 thn", (i) => (i.risk || {}).maxDrawdown, (v) => n1(v) + "%",
        (v) => (v <= -40 ? "watch" : "flat")],
      ["Saran stop-loss", (i) => (i.risk || {}).stopLoss, (v) => "$" + n2(v), null,
        "2× ATR di bawah harga — melebar sesuai gejolak saham itu sendiri"],
      ["Tingkat risiko", (i) => (i.risk || {}).levelLabel, (v) => v, null],
    ]],
  ];

  function indicatorTable(ind) {
    const wrap = el("div", {});
    let shown = 0;
    for (const [group, rows] of ROWS) {
      const body = el("div", { className: "ind-rows" });
      for (const [label, get, fmt, state, hint] of rows) {
        let value;
        try { value = get(ind); } catch { value = null; }
        // Baris tanpa data tidak ditampilkan sama sekali. Menampilkan "—"
        // untuk selusin baris hanya menambah kebisingan.
        if (!has(value)) continue;
        shown++;
        const cls = state ? state(value) : null;
        body.append(el("div", { className: "ind-row" }, [
          el("span", { className: "ind-label", title: hint || null }, label),
          el("span", { className: "ind-value" }, String(fmt(value, ind))),
          cls ? el("span", { className: "ind-chip chip-" + cls }, chipLabel(cls)) : null,
        ]));
      }
      if (body.childNodes.length) {
        wrap.append(el("h5", { className: "ind-group" }, group), body);
      }
    }
    if (!shown) return null;
    return wrap;
  }

  function chipLabel(cls) {
    return { bull: "bullish", bear: "bearish", flat: "netral", weak: "lemah", watch: "perhatikan" }[cls] || cls;
  }

  // ── entri publik ────────────────────────────────────────────────────

  function analysisPanel(stock, extra) {
    const panel = el("div", { className: "tab-panel" });
    const slot = el("div", { className: "brief-slot" },
      el("div", { className: "note" }, "Menyiapkan analisis…"));
    panel.append(slot);

    window.LAZY_DATA.ensure().then(() => {
      const ind = window.LAZY_DATA.indicatorsFor(stock.ticker);
      const fund = window.LAZY_DATA.fundamentalsFor(stock.ticker);
      const aiBrief = window.LAZY_DATA.briefFor(stock.ticker);

      // Brief AI dipakai kalau ada; kalau tidak, narasi deterministik.
      // Yang penting: selalu ada sesuatu untuk dibaca.
      const brief = aiBrief || (window.NARRATE_LIB && window.NARRATE_LIB.narrate({
        ticker: stock.ticker, name: stock.name, sector: stock.sector,
        composite: extra.composite, signals: stock.signals,
        indicators: ind, fundamentals: fund,
        analyst: extra.analyst, verdict: extra.verdict, ethics: stock.ethics,
      }));

      slot.replaceChildren(
        brief ? renderBrief(brief) : el("div", { className: "note" }, "Analisis belum tersedia."),
        askBox(stock, { ...extra, indicators: ind, fundamentals: fund })
      );
    });
    return panel;
  }

  function indicatorPanel(stock) {
    const panel = el("div", { className: "tab-panel", style: "display:none" });
    const slot = el("div", {}, el("div", { className: "note" }, "Memuat indikator…"));
    panel.append(slot);

    window.LAZY_DATA.ensure().then((status) => {
      const ind = window.LAZY_DATA.indicatorsFor(stock.ticker);
      const table = ind ? indicatorTable(ind) : null;
      if (table) {
        slot.replaceChildren(table, el("div", { className: "note" },
          "Dihitung dari 2 tahun riwayat harga oleh scripts/indicators.py."));
      } else if (!status.indicators) {
        // Keadaan yang wajar sebelum pipeline pertama berjalan — katakan
        // apa adanya beserta cara memperbaikinya.
        slot.replaceChildren(el("div", { className: "note" },
          "data/indicators.js belum digenerate. Jalankan python scripts/fetch_signals.py " +
          "dari laptop, atau tunggu refresh terjadwal berikutnya."));
      } else {
        slot.replaceChildren(el("div", { className: "note" },
          "Belum ada indikator untuk " + stock.ticker + " — riwayat harganya mungkin terlalu pendek."));
      }
    });
    return panel;
  }

  window.DETAIL_LIB = {
    analysisPanel, indicatorPanel,
    renderBrief, indicatorTable, chipLabel, sourceBadge, ROWS,
  };
})();
