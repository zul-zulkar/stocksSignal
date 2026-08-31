// =====================================================================
// Indikator teknikal sisi-browser — port dari scripts/indicators.py.
//
// Dipakai tombol Refresh (data Stooq) supaya angka yang dihitung di HP
// identik dengan yang dihitung pipeline Python di laptop/Actions. Kalau
// keduanya melenceng, dashboard akan menampilkan dua kebenaran berbeda
// untuk saham yang sama tergantung siapa yang terakhir menyentuhnya.
//
// Paritas dijaga fixture bersama tests/fixtures/ohlcv_sample.json +
// indicators_expected.json: tests/test_indicators.py (Python) dan
// tests/js/indicators.test.cjs (JS) meng-assert angka yang sama persis.
//
// Hanya sebagian indikator yang diport — yang dibutuhkan skor teknikal.
// Ichimoku, CCI, Williams %R, MFI, beta, dan divergence hanya hidup di
// Python karena cuma dipakai saat build data, tidak saat refresh.
// =====================================================================

(function () {
  "use strict";

  // ── primitif deret ──────────────────────────────────────────────────
  // Semua helper meniru semantik pandas persis, termasuk soal NaN, karena
  // di situlah dua implementasi paling gampang diam-diam berbeda.

  const isNum = (x) => typeof x === "number" && Number.isFinite(x);

  // Padanan pandas .ewm(alpha=..., adjust=False).mean().
  // NaN di awal deret dilewati (output ikut NaN) lalu rekursi dimulai dari
  // nilai valid pertama — persis yang pandas lakukan.
  function ewm(values, alpha) {
    const out = new Array(values.length).fill(NaN);
    let prev = null;
    for (let i = 0; i < values.length; i++) {
      const x = values[i];
      if (!isNum(x)) continue;
      prev = prev === null ? x : prev + alpha * (x - prev);
      out[i] = prev;
    }
    return out;
  }

  // Smoothing Wilder — dasar RSI, ATR, dan ADX.
  const wilder = (values, period) => ewm(values, 1 / period);
  // EMA klasik: alpha = 2/(n+1), padanan pandas .ewm(span=n, adjust=False).
  const emaSeries = (values, period) => ewm(values, 2 / (period + 1));

  // Padanan pandas .rolling(period).mean(): butuh jendela penuh berisi
  // angka valid, kalau tidak hasilnya NaN.
  function rollingMean(values, period) {
    const out = new Array(values.length).fill(NaN);
    for (let i = period - 1; i < values.length; i++) {
      let sum = 0;
      let ok = true;
      for (let j = i - period + 1; j <= i; j++) {
        if (!isNum(values[j])) { ok = false; break; }
        sum += values[j];
      }
      if (ok) out[i] = sum / period;
    }
    return out;
  }

  // Padanan pandas .rolling(period).std(ddof=0) — stdev populasi.
  function rollingStd(values, period) {
    const out = new Array(values.length).fill(NaN);
    for (let i = period - 1; i < values.length; i++) {
      let sum = 0;
      let ok = true;
      for (let j = i - period + 1; j <= i; j++) {
        if (!isNum(values[j])) { ok = false; break; }
        sum += values[j];
      }
      if (!ok) continue;
      const mean = sum / period;
      let sq = 0;
      for (let j = i - period + 1; j <= i; j++) sq += (values[j] - mean) ** 2;
      out[i] = Math.sqrt(sq / period);
    }
    return out;
  }

  function rollingExtreme(values, period, useMax) {
    const out = new Array(values.length).fill(NaN);
    for (let i = period - 1; i < values.length; i++) {
      let best = NaN;
      let ok = true;
      for (let j = i - period + 1; j <= i; j++) {
        if (!isNum(values[j])) { ok = false; break; }
        if (!isNum(best) || (useMax ? values[j] > best : values[j] < best)) best = values[j];
      }
      if (ok) out[i] = best;
    }
    return out;
  }

  const rollingMax = (v, p) => rollingExtreme(v, p, true);
  const rollingMin = (v, p) => rollingExtreme(v, p, false);

  // Padanan .diff(): elemen pertama NaN.
  function diff(values) {
    const out = new Array(values.length).fill(NaN);
    for (let i = 1; i < values.length; i++) out[i] = values[i] - values[i - 1];
    return out;
  }

  // Nilai terakhir yang berhingga, atau null. Semua fungsi publik memulangkan
  // null (bukan NaN) supaya JSON.stringify tidak menghasilkan token invalid.
  function last(values) {
    if (!values || !values.length) return null;
    const v = values[values.length - 1];
    return isNum(v) ? v : null;
  }

  // ── tren ────────────────────────────────────────────────────────────

  function ema(close, period) {
    if (!close || close.length < period) return null;
    return last(emaSeries(close, period));
  }

  function sma(close, period) {
    if (!close || close.length < period) return null;
    return last(rollingMean(close, period));
  }

  function macd(close, fast, slow, signalPeriod) {
    fast = fast || 12; slow = slow || 26; signalPeriod = signalPeriod || 9;
    if (!close || close.length < slow + signalPeriod) {
      return { line: null, signal: null, hist: null };
    }
    const fastE = emaSeries(close, fast);
    const slowE = emaSeries(close, slow);
    const line = fastE.map((v, i) => v - slowE[i]);
    const signal = emaSeries(line, signalPeriod);
    const l = last(line), s = last(signal);
    return { line: l, signal: s, hist: l === null || s === null ? null : l - s };
  }

  // True range. Bar pertama tidak punya close sebelumnya, dan pandas
  // .max(axis=1) melewati NaN — jadi tr[0] = high - low, bukan NaN.
  function trueRange(high, low, close) {
    const out = new Array(close.length).fill(NaN);
    for (let i = 0; i < close.length; i++) {
      const hl = high[i] - low[i];
      if (i === 0) { out[i] = hl; continue; }
      out[i] = Math.max(hl, Math.abs(high[i] - close[i - 1]), Math.abs(low[i] - close[i - 1]));
    }
    return out;
  }

  function atr(high, low, close, period) {
    period = period || 14;
    if (!close || close.length < period + 1) return { atr: null, atrPct: null };
    const val = last(wilder(trueRange(high, low, close), period));
    const price = last(close);
    return {
      atr: val,
      atrPct: val !== null && price ? (100 * val) / price : null,
    };
  }

  function adx(high, low, close, period) {
    period = period || 14;
    if (!close || close.length < period * 2 + 1) {
      return { adx: null, plusDI: null, minusDI: null };
    }
    const up = diff(high);
    const down = diff(low).map((v) => -v);
    // NaN di bar pertama membuat kedua perbandingan false → DM = 0,
    // sama seperti np.where di sisi Python.
    const plusDM = up.map((u, i) => (u > down[i] && u > 0 ? u : 0));
    const minusDM = down.map((d, i) => (d > up[i] && d > 0 ? d : 0));

    const atrS = wilder(trueRange(high, low, close), period);
    const plusS = wilder(plusDM, period);
    const minusS = wilder(minusDM, period);

    const plusDI = [], minusDI = [], dx = [];
    for (let i = 0; i < close.length; i++) {
      const a = atrS[i];
      // ATR nol = pasar benar-benar datar; jangan bagi nol.
      const p = isNum(a) && a !== 0 ? (100 * plusS[i]) / a : NaN;
      const m = isNum(a) && a !== 0 ? (100 * minusS[i]) / a : NaN;
      plusDI.push(p);
      minusDI.push(m);
      const sum = p + m;
      dx.push(isNum(sum) && sum !== 0 ? (100 * Math.abs(p - m)) / sum : NaN);
    }
    // .fillna(0) sebelum smoothing, sama seperti Python.
    return {
      adx: last(wilder(dx.map((v) => (isNum(v) ? v : 0)), period)),
      plusDI: last(plusDI),
      minusDI: last(minusDI),
    };
  }

  // Supertrend(10,3) → level dan arah (1 bullish / −1 bearish).
  // Wajib ada di sini: technicalParts() memberinya bobot 10, jadi tanpa port
  // ini skor JS akan meleset 10 poin dari skor Python tanpa ada yang tahu.
  function supertrend(high, low, close, period, mult) {
    period = period || 10; mult = mult || 3;
    if (!close || close.length < period + 1) return { value: null, dir: null };

    const atrS = wilder(trueRange(high, low, close), period);
    const n = close.length;
    const upperBasic = [], lowerBasic = [];
    for (let i = 0; i < n; i++) {
      const hl2 = (high[i] + low[i]) / 2;
      upperBasic.push(hl2 + mult * atrS[i]);
      lowerBasic.push(hl2 - mult * atrS[i]);
    }

    const finalUpper = new Array(n).fill(0);
    const finalLower = new Array(n).fill(0);
    const direction = new Array(n).fill(1);
    for (let i = 0; i < n; i++) {
      if (i === 0 || !isNum(upperBasic[i]) || !isNum(lowerBasic[i])) {
        finalUpper[i] = isNum(upperBasic[i]) ? upperBasic[i] : 0;
        finalLower[i] = isNum(lowerBasic[i]) ? lowerBasic[i] : 0;
        continue;
      }
      finalUpper[i] = (upperBasic[i] < finalUpper[i - 1] || close[i - 1] > finalUpper[i - 1])
        ? upperBasic[i] : finalUpper[i - 1];
      finalLower[i] = (lowerBasic[i] > finalLower[i - 1] || close[i - 1] < finalLower[i - 1])
        ? lowerBasic[i] : finalLower[i - 1];
      if (close[i] > finalUpper[i]) direction[i] = 1;
      else if (close[i] < finalLower[i]) direction[i] = -1;
      else direction[i] = direction[i - 1];
    }

    const d = direction[n - 1];
    const value = d === 1 ? finalLower[n - 1] : finalUpper[n - 1];
    return { value: isNum(value) ? value : null, dir: d };
  }

  function crossState(close, fast, slow) {
    fast = fast || 50; slow = slow || 200;
    if (!close || close.length < slow + 2) return { state: null, daysSince: null };
    const f = rollingMean(close, fast);
    const s = rollingMean(close, slow);
    const d = [];
    for (let i = 0; i < close.length; i++) {
      if (isNum(f[i]) && isNum(s[i])) d.push(f[i] - s[i]);
    }
    if (d.length < 2) return { state: null, daysSince: null };

    const positive = d[d.length - 1] > 0;
    let days = 0;
    for (let i = d.length - 1; i >= 0; i--) {
      if (d[i] > 0 !== positive) break;
      days++;
    }
    return { state: positive ? "golden" : "death", daysSince: days };
  }

  // ── osilator ────────────────────────────────────────────────────────

  function rsi(close, period) {
    period = period || 14;
    if (!close || close.length < period + 1) return null;
    const delta = diff(close);
    const up = wilder(delta.map((v) => (isNum(v) ? Math.max(v, 0) : NaN)), period);
    const down = wilder(delta.map((v) => (isNum(v) ? Math.max(-v, 0) : NaN)), period);
    const u = last(up), dn = last(down);
    if (u === null || dn === null) return null;
    // Python memakai .replace(0, 1e-9); disamakan supaya deret datar
    // menghasilkan angka yang sama di kedua sisi.
    const rs = u / (dn === 0 ? 1e-9 : dn);
    return 100 - 100 / (1 + rs);
  }

  function stochastic(high, low, close, kPeriod, smooth, dPeriod) {
    kPeriod = kPeriod || 14; smooth = smooth || 3; dPeriod = dPeriod || 3;
    if (!close || close.length < kPeriod + smooth + dPeriod) return { k: null, d: null };
    const hh = rollingMax(high, kPeriod);
    const ll = rollingMin(low, kPeriod);
    const rawK = close.map((c, i) => {
      const rng = hh[i] - ll[i];
      return isNum(rng) && rng !== 0 ? (100 * (c - ll[i])) / rng : NaN;
    });
    const k = rollingMean(rawK, smooth);
    return { k: last(k), d: last(rollingMean(k, dPeriod)) };
  }

  // ── volatilitas ─────────────────────────────────────────────────────

  function bollinger(close, period, mult, squeezeLookback) {
    period = period || 20; mult = mult || 2; squeezeLookback = squeezeLookback || 120;
    if (!close || close.length < period) {
      return { upper: null, mid: null, lower: null, pctB: null, bandwidth: null, squeeze: null };
    }
    const mid = rollingMean(close, period);
    const sd = rollingStd(close, period);
    const upper = mid.map((m, i) => m + mult * sd[i]);
    const lower = mid.map((m, i) => m - mult * sd[i]);
    const pctB = close.map((c, i) => {
      const rng = upper[i] - lower[i];
      return isNum(rng) && rng !== 0 ? (100 * (c - lower[i])) / rng : NaN;
    });
    const bandwidth = mid.map((m, i) =>
      isNum(m) && m !== 0 ? (100 * (upper[i] - lower[i])) / m : NaN
    );

    // Squeeze = bandwidth di kuintil terendah selama lookback terakhir.
    let squeeze = null;
    const hist = bandwidth.filter(isNum);
    if (hist.length >= Math.min(squeezeLookback, period * 2)) {
      const window = hist.slice(-squeezeLookback);
      squeeze = window[window.length - 1] <= quantile(window, 0.2);
    }

    return {
      upper: last(upper), mid: last(mid), lower: last(lower),
      pctB: last(pctB), bandwidth: last(bandwidth), squeeze: squeeze,
    };
  }

  // Interpolasi linear — metode kuantil default pandas/numpy.
  function quantile(values, q) {
    const sorted = values.slice().sort((a, b) => a - b);
    if (!sorted.length) return NaN;
    const pos = (sorted.length - 1) * q;
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  // ── volume ──────────────────────────────────────────────────────────

  function obv(close, volume, slopePeriod) {
    slopePeriod = slopePeriod || 20;
    if (!close || !volume || close.length < slopePeriod + 1) return { obv: null, slope: null };
    const d = diff(close);
    let running = 0;
    const series = [];
    for (let i = 0; i < close.length; i++) {
      const dir = !isNum(d[i]) ? 0 : Math.sign(d[i]);
      running += dir * volume[i];
      series.push(running);
    }
    let recentVol = 0;
    for (let i = volume.length - slopePeriod; i < volume.length; i++) recentVol += volume[i];
    const slope = recentVol > 0
      ? (series[series.length - 1] - series[series.length - slopePeriod - 1]) / recentVol
      : null;
    return { obv: last(series), slope: slope };
  }

  function volumeRatio(volume, period) {
    period = period || 20;
    if (!volume || volume.length < period + 1) return null;
    let sum = 0;
    for (let i = volume.length - period - 1; i < volume.length - 1; i++) sum += volume[i];
    const avg = sum / period;
    if (!avg || avg <= 0) return null;
    return volume[volume.length - 1] / avg;
  }

  // ── posisi ──────────────────────────────────────────────────────────

  function position52w(close, period) {
    period = period || 252;
    if (!close || close.length < 20) return { high: null, low: null, pct: null };
    const w = close.slice(-period);
    const hi = Math.max.apply(null, w);
    const lo = Math.min.apply(null, w);
    const c = w[w.length - 1];
    if (hi === lo) return { high: hi, low: lo, pct: null };
    return { high: hi, low: lo, pct: (100 * (c - lo)) / (hi - lo) };
  }

  function distanceFrom(close, level) {
    const c = last(close);
    if (c === null || !level) return null;
    return (100 * (c - level)) / level;
  }

  // ── agregat ─────────────────────────────────────────────────────────

  // Bentuk keluarannya sengaja mencerminkan subset compute_all() Python
  // supaya konsumen (js/narrate.js, panel Indikator) bisa memakai kunci
  // yang sama baik datanya dari data/indicators.js maupun hasil refresh.
  function computeAll(bars) {
    if (!bars || !bars.close || !bars.close.length) return {};
    const { high, low, close, volume } = bars;
    const at = atr(high, low, close);
    const ob = volume ? obv(close, volume) : { obv: null, slope: null };
    const ema200 = ema(close, 200);
    return {
      price: last(close),
      ema20: ema(close, 20),
      ema50: ema(close, 50),
      ema200: ema200,
      sma50: sma(close, 50),
      sma200: sma(close, 200),
      macd: macd(close),
      adx: adx(high, low, close),
      supertrend: supertrend(high, low, close),
      cross: crossState(close),
      rsi: rsi(close),
      stoch: stochastic(high, low, close),
      bollinger: bollinger(close),
      atr: at.atr,
      atrPct: at.atrPct,
      obv: ob.obv,
      obvSlope: ob.slope,
      volRatio: volume ? volumeRatio(volume) : null,
      pos52w: position52w(close),
      distEma200: distanceFrom(close, ema200),
    };
  }

  // ── skoring teknikal ────────────────────────────────────────────────
  // Port persis dari technical_parts()/technical_score() di scripts/indicators.py.
  // Tanpa ini, tombol Refresh di HP akan menilai teknikal dengan rumus berbeda
  // dari pipeline — dashboard yang sama menampilkan dua angka berbeda untuk
  // saham yang sama, tergantung siapa yang terakhir menyentuhnya.

  const TECH_WEIGHTS = {
    trend: 25,       // susunan EMA, dikuatkan/dilemahkan oleh ADX
    macd: 15,
    rsi: 15,
    stoch: 10,
    bollinger: 10,
    volume: 10,      // konfirmasi OBV + rasio volume
    supertrend: 10,
    position: 5,     // posisi dalam rentang 52 minggu
  };

  // Padanan jround() Python: setengah-ke-atas, sama seperti Math.round().
  const jround = (x) => Math.floor(x + 0.5);
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  // `!= null` menangkap null maupun undefined sekaligus: Python memulangkan
  // None untuk kunci yang hilang, JS memulangkan undefined.
  const has = (x) => x != null;

  function technicalParts(p) {
    const parts = {};
    if (!p) return parts;
    const price = p.price;

    // Tren: susunan harga/EMA50/EMA200, diskalakan keyakinan ADX.
    const e50 = p.ema50, e200 = p.ema200;
    if (price && e50 && e200) {
      let raw;
      if (price > e50 && e50 > e200) raw = 1.0;
      else if (price < e50 && e50 < e200) raw = -1.0;
      else if (price > e200) raw = 0.4;
      else raw = -0.4;
      const adxVal = (p.adx || {}).adx;
      // ADX di bawah 20 artinya pasar menyamping — susunan EMA di situ
      // sering berupa derau, jadi keyakinannya dipangkas.
      const conv = !has(adxVal) ? 1.0 : (adxVal >= 25 ? 1.0 : adxVal >= 20 ? 0.7 : 0.4);
      parts.trend = raw * conv * TECH_WEIGHTS.trend;
    }

    const hist = (p.macd || {}).hist;
    if (has(hist) && price) {
      parts.macd = clamp((hist / price) * 100, -1, 1) * TECH_WEIGHTS.macd;
    }

    if (has(p.rsi)) {
      parts.rsi = clamp((50 - p.rsi) / 20, -1, 1) * TECH_WEIGHTS.rsi;
    }

    const k = (p.stoch || {}).k;
    if (has(k)) parts.stoch = clamp((50 - k) / 30, -1, 1) * TECH_WEIGHTS.stoch;

    const pctB = (p.bollinger || {}).pctB;
    if (has(pctB)) parts.bollinger = clamp((50 - pctB) / 50, -1, 1) * TECH_WEIGHTS.bollinger;

    if (has(p.obvSlope)) {
      let v = clamp(p.obvSlope * 3, -1, 1);
      if (p.volRatio) v *= clamp(0.5 + p.volRatio / 2, 0.5, 1.5);
      parts.volume = clamp(v, -1, 1) * TECH_WEIGHTS.volume;
    }

    const dir = (p.supertrend || {}).dir;
    if (dir) parts.supertrend = dir * TECH_WEIGHTS.supertrend;

    const pos = (p.pos52w || {}).pct;
    if (has(pos)) parts.position = ((pos - 50) / 50) * TECH_WEIGHTS.position;

    return parts;
  }

  function technicalScore(indicators) {
    const parts = technicalParts(indicators);
    const keys = Object.keys(parts);
    if (!keys.length) return 0;
    let sum = 0;
    for (const key of keys) sum += parts[key];
    return clamp(jround(sum), -100, 100);
  }

  // Jalur nyaman untuk js/refresh.js: dari OHLCV mentah langsung ke skor.
  function scoreFromBars(bars) {
    return technicalScore(computeAll(bars));
  }

  window.INDICATOR_LIB = {
    // primitif (diekspos untuk pengujian paritas)
    ewm, wilder, emaSeries, rollingMean, rollingStd, rollingMax, rollingMin,
    diff, quantile,
    // indikator
    ema, sma, macd, adx, supertrend, crossState, rsi, stochastic, bollinger,
    // skoring
    TECH_WEIGHTS, technicalParts, technicalScore, scoreFromBars, jround,
    atr, trueRange, obv, volumeRatio, position52w, distanceFrom,
    computeAll,
  };
})();
