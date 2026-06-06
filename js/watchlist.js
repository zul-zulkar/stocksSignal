// =====================================================================
// Watchlist & Portofolio — disimpan di localStorage HP ini saja.
//   WATCH_KEY    : array ticker favorit  ["AAPL","TSM",...]
//   HOLDINGS_KEY : { TICKER: { qty, avgPrice } }  posisi yang dimiliki
// =====================================================================

(function () {
  const WATCH_KEY    = "ss_watchlist";
  const HOLDINGS_KEY = "ss_holdings";

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }

  // ---------- Watchlist ----------
  function listWatch()        { return read(WATCH_KEY, []); }
  function isWatched(ticker)  { return listWatch().includes(ticker); }
  function toggleWatch(ticker) {
    const set = new Set(listWatch());
    if (set.has(ticker)) set.delete(ticker); else set.add(ticker);
    const arr = [...set];
    write(WATCH_KEY, arr);
    return set.has(ticker);
  }

  // ---------- Holdings (portofolio) ----------
  function allHoldings()      { return read(HOLDINGS_KEY, {}); }
  function getHolding(ticker) { return allHoldings()[ticker] || null; }
  function setHolding(ticker, qty, avgPrice) {
    const h = allHoldings();
    qty = Number(qty); avgPrice = Number(avgPrice);
    if (!qty || qty <= 0) { delete h[ticker]; }
    else { h[ticker] = { qty, avgPrice: Number.isFinite(avgPrice) ? avgPrice : 0 }; }
    write(HOLDINGS_KEY, h);
  }
  function removeHolding(ticker) {
    const h = allHoldings();
    delete h[ticker];
    write(HOLDINGS_KEY, h);
  }

  // ---------- Ringkasan portofolio ----------
  // priceOf(ticker) -> harga terkini | null ; dividendOf(ticker) -> yield % | 0
  function computePortfolio(priceOf, dividendOf) {
    const h = allHoldings();
    let cost = 0, value = 0, annualDividend = 0;
    const rows = [];
    for (const ticker of Object.keys(h)) {
      const { qty, avgPrice } = h[ticker];
      const price = priceOf(ticker);
      const lineCost  = qty * (avgPrice || 0);
      const lineValue = Number.isFinite(price) ? qty * price : lineCost;
      const dy = (dividendOf ? dividendOf(ticker) : 0) || 0; // persen
      const lineDiv = lineValue * dy / 100;
      cost  += lineCost;
      value += lineValue;
      annualDividend += lineDiv;
      rows.push({
        ticker, qty, avgPrice, price,
        cost: lineCost, value: lineValue,
        pnl: lineValue - lineCost,
        pnlPct: lineCost > 0 ? (lineValue - lineCost) / lineCost * 100 : 0,
        annualDividend: lineDiv,
      });
    }
    return {
      rows,
      cost, value,
      pnl: value - cost,
      pnlPct: cost > 0 ? (value - cost) / cost * 100 : 0,
      annualDividend,
    };
  }

  window.WATCH_LIB = {
    listWatch, isWatched, toggleWatch,
    allHoldings, getHolding, setHolding, removeHolding,
    computePortfolio,
  };
})();
