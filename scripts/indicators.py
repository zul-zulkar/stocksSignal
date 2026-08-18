#!/usr/bin/env python3
"""
indicators.py
=============
Indikator teknikal murni di atas data OHLCV.

Modul ini sengaja TIDAK meng-import yfinance dan tidak menyentuh jaringan:
semua fungsi menerima pandas DataFrame/Series dan mengembalikan angka biasa,
jadi bisa di-unit-test tanpa dependensi berat (pola yang sama dipakai
scripts/fetch_signals.py).

Kontrak input: DataFrame dengan kolom "Open", "High", "Low", "Close", "Volume"
— persis bentuk keluaran yfinance ``Ticker.history()``.

Kontrak output: setiap fungsi mengembalikan ``None`` (atau dict berisi None)
kalau datanya kurang panjang. Tidak ada yang melempar exception karena data
pendek — 984 ticker berarti selalu ada saja yang riwayatnya cuma beberapa
minggu, dan satu ticker cacat tidak boleh menjatuhkan seluruh run.

Paritas JS: js/indicators.js memuat port sebagian fungsi di sini supaya
tombol Refresh di browser menghitung angka yang sama. Keduanya diuji terhadap
fixture yang sama (tests/fixtures/ohlcv_sample.json) sehingga tidak bisa
melenceng diam-diam.
"""

from __future__ import annotations

import math
from typing import Optional

# pandas di-import lazy di dalam fungsi yang benar-benar butuh, mengikuti pola
# fetch_signals.py, supaya modul ini tetap bisa di-import untuk uji fungsi
# non-pandas tanpa dependensi terpasang.

TRADING_DAYS = 252


# ── helper ────────────────────────────────────────────────────────────────

def _f(x) -> Optional[float]:
    """Konversi ke float biasa; NaN/inf/None jadi None."""
    if x is None:
        return None
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    if math.isnan(v) or math.isinf(v):
        return None
    return v


def _last(series) -> Optional[float]:
    """Nilai terakhir sebuah Series sebagai float, atau None."""
    if series is None or len(series) == 0:
        return None
    return _f(series.iloc[-1])


def _wilder(series, period: int):
    """
    Smoothing Wilder — dipakai RSI, ATR, dan ADX.

    ewm(alpha=1/period) setara dengan rumus Wilder asli
    (prev*(n-1) + baru) / n, dan itu yang dipakai fetch_signals.rsi() sejak
    awal; dipertahankan supaya angka RSI lama tidak bergeser.
    """
    return series.ewm(alpha=1.0 / period, adjust=False).mean()


def _ema_series(series, period: int):
    return series.ewm(span=period, adjust=False).mean()


def _true_range(high, low, close):
    import pandas as pd

    prev_close = close.shift(1)
    return pd.concat(
        [high - low, (high - prev_close).abs(), (low - prev_close).abs()],
        axis=1,
    ).max(axis=1)


def _ok(df, need: int) -> bool:
    return df is not None and len(df) >= need


# ── tren ──────────────────────────────────────────────────────────────────

def ema(close, period: int) -> Optional[float]:
    if close is None or len(close) < period:
        return None
    return _last(_ema_series(close, period))


def sma(close, period: int) -> Optional[float]:
    if close is None or len(close) < period:
        return None
    return _last(close.rolling(period).mean())


def macd(close, fast: int = 12, slow: int = 26, signal: int = 9) -> dict:
    """MACD(12,26,9) → garis, sinyal, histogram."""
    empty = {"line": None, "signal": None, "hist": None}
    if close is None or len(close) < slow + signal:
        return empty
    line = _ema_series(close, fast) - _ema_series(close, slow)
    sig = _ema_series(line, signal)
    return {
        "line": _last(line),
        "signal": _last(sig),
        "hist": _f(_last(line) - _last(sig)) if _last(line) is not None and _last(sig) is not None else None,
    }


def adx(high, low, close, period: int = 14) -> dict:
    """ADX + Directional Movement (+DI/−DI). ADX>25 = tren kuat, <20 = ranging."""
    empty = {"adx": None, "plusDI": None, "minusDI": None}
    if close is None or len(close) < period * 2 + 1:
        return empty
    import numpy as np

    up = high.diff()
    down = -low.diff()
    plus_dm = np.where((up > down) & (up > 0), up, 0.0)
    minus_dm = np.where((down > up) & (down > 0), down, 0.0)

    import pandas as pd

    plus_dm = pd.Series(plus_dm, index=high.index)
    minus_dm = pd.Series(minus_dm, index=high.index)

    atr_s = _wilder(_true_range(high, low, close), period)
    # ATR nol berarti harga benar-benar datar; hindari bagi-nol tanpa
    # memalsukan arah dengan mengembalikan DI = 0.
    safe_atr = atr_s.replace(0, float("nan"))
    plus_di = 100 * _wilder(plus_dm, period) / safe_atr
    minus_di = 100 * _wilder(minus_dm, period) / safe_atr

    di_sum = (plus_di + minus_di).replace(0, float("nan"))
    dx = 100 * (plus_di - minus_di).abs() / di_sum
    return {
        "adx": _last(_wilder(dx.fillna(0), period)),
        "plusDI": _last(plus_di),
        "minusDI": _last(minus_di),
    }


def supertrend(high, low, close, period: int = 10, mult: float = 3.0) -> dict:
    """Supertrend(10,3) → level dan arah (1 bullish / −1 bearish)."""
    empty = {"value": None, "dir": None}
    if close is None or len(close) < period + 1:
        return empty

    atr_s = _wilder(_true_range(high, low, close), period)
    hl2 = (high + low) / 2.0
    upper_basic = (hl2 + mult * atr_s).tolist()
    lower_basic = (hl2 - mult * atr_s).tolist()
    closes = close.tolist()

    n = len(closes)
    final_upper = [0.0] * n
    final_lower = [0.0] * n
    direction = [1] * n

    for i in range(n):
        if i == 0 or any(math.isnan(x) for x in (upper_basic[i], lower_basic[i])):
            final_upper[i] = upper_basic[i] if not math.isnan(upper_basic[i]) else 0.0
            final_lower[i] = lower_basic[i] if not math.isnan(lower_basic[i]) else 0.0
            continue
        final_upper[i] = (
            upper_basic[i]
            if upper_basic[i] < final_upper[i - 1] or closes[i - 1] > final_upper[i - 1]
            else final_upper[i - 1]
        )
        final_lower[i] = (
            lower_basic[i]
            if lower_basic[i] > final_lower[i - 1] or closes[i - 1] < final_lower[i - 1]
            else final_lower[i - 1]
        )
        if closes[i] > final_upper[i]:
            direction[i] = 1
        elif closes[i] < final_lower[i]:
            direction[i] = -1
        else:
            direction[i] = direction[i - 1]

    d = direction[-1]
    return {
        "value": _f(final_lower[-1] if d == 1 else final_upper[-1]),
        "dir": d,
    }


def ichimoku(high, low, close, tenkan_p: int = 9, kijun_p: int = 26, senkou_p: int = 52) -> dict:
    """
    Ichimoku Cloud. ``cloudPos``: 1 di atas awan, 0 di dalam, −1 di bawah.

    Senkou di-shift 26 bar maju sesuai definisi, jadi awan "hari ini" dihitung
    dari data 26 bar lalu — itulah yang dibandingkan dengan harga sekarang.
    """
    empty = {"tenkan": None, "kijun": None, "senkouA": None, "senkouB": None, "cloudPos": None}
    if close is None or len(close) < senkou_p + kijun_p:
        return empty

    tenkan = (high.rolling(tenkan_p).max() + low.rolling(tenkan_p).min()) / 2
    kijun = (high.rolling(kijun_p).max() + low.rolling(kijun_p).min()) / 2
    senkou_a = ((tenkan + kijun) / 2).shift(kijun_p)
    senkou_b = ((high.rolling(senkou_p).max() + low.rolling(senkou_p).min()) / 2).shift(kijun_p)

    a, b, c = _last(senkou_a), _last(senkou_b), _last(close)
    pos = None
    if None not in (a, b, c):
        top, bottom = max(a, b), min(a, b)
        pos = 1 if c > top else (-1 if c < bottom else 0)

    return {
        "tenkan": _last(tenkan),
        "kijun": _last(kijun),
        "senkouA": a,
        "senkouB": b,
        "cloudPos": pos,
    }


def cross_state(close, fast: int = 50, slow: int = 200) -> dict:
    """
    Golden/death cross beserta umurnya dalam bar.

    ``daysSince`` penting: golden cross umur 3 hari punya arti berbeda dari
    yang umur 300 hari, dan skor teknikal lama memperlakukan keduanya sama.
    """
    empty = {"state": None, "daysSince": None}
    if close is None or len(close) < slow + 2:
        return empty
    f = close.rolling(fast).mean()
    s = close.rolling(slow).mean()
    diff = (f - s).dropna()
    if len(diff) < 2:
        return empty

    vals = diff.tolist()
    state = "golden" if vals[-1] > 0 else "death"
    days = 0
    sign_now = vals[-1] > 0
    for v in reversed(vals):
        if (v > 0) != sign_now:
            break
        days += 1
    return {"state": state, "daysSince": days}


# ── osilator ──────────────────────────────────────────────────────────────

def rsi(close, period: int = 14) -> Optional[float]:
    """
    RSI Wilder(14).

    Dipindahkan dari fetch_signals.rsi() tanpa mengubah matematikanya supaya
    nilai RSI yang tersimpan di data/stocks.js tidak bergeser.
    """
    if close is None or len(close) < period + 1:
        return None
    delta = close.diff()
    up = _wilder(delta.clip(lower=0), period)
    down = _wilder(-delta.clip(upper=0), period)
    rs = up / down.replace(0, 1e-9)
    return _f(100 - 100 / (1 + rs.iloc[-1]))


def stochastic(high, low, close, k_period: int = 14, smooth: int = 3, d_period: int = 3) -> dict:
    """Slow Stochastic(14,3,3) → %K dan %D."""
    empty = {"k": None, "d": None}
    if close is None or len(close) < k_period + smooth + d_period:
        return empty
    hh = high.rolling(k_period).max()
    ll = low.rolling(k_period).min()
    rng = (hh - ll).replace(0, float("nan"))
    raw_k = 100 * (close - ll) / rng
    k = raw_k.rolling(smooth).mean()
    d = k.rolling(d_period).mean()
    return {"k": _last(k), "d": _last(d)}


def cci(high, low, close, period: int = 20) -> Optional[float]:
    """Commodity Channel Index(20)."""
    if close is None or len(close) < period:
        return None
    tp = (high + low + close) / 3.0
    ma = tp.rolling(period).mean()
    mad = tp.rolling(period).apply(lambda x: abs(x - x.mean()).mean(), raw=True)
    denom = (0.015 * mad).replace(0, float("nan"))
    return _last((tp - ma) / denom)


def williams_r(high, low, close, period: int = 14) -> Optional[float]:
    """Williams %R(14) — skala −100 (oversold) … 0 (overbought)."""
    if close is None or len(close) < period:
        return None
    hh = high.rolling(period).max()
    ll = low.rolling(period).min()
    rng = (hh - ll).replace(0, float("nan"))
    return _last(-100 * (hh - close) / rng)


def mfi(high, low, close, volume, period: int = 14) -> Optional[float]:
    """Money Flow Index(14) — RSI yang diberi bobot volume."""
    if close is None or volume is None or len(close) < period + 1:
        return None
    tp = (high + low + close) / 3.0
    flow = tp * volume
    delta = tp.diff()
    pos = flow.where(delta > 0, 0.0).rolling(period).sum()
    neg = flow.where(delta < 0, 0.0).rolling(period).sum()
    ratio = pos / neg.replace(0, float("nan"))
    val = _last(100 - 100 / (1 + ratio))
    # neg == 0 berarti tidak ada aliran keluar sama sekali → MFI maksimum.
    if val is None and _last(pos) not in (None, 0):
        return 100.0
    return val


# ── volatilitas ───────────────────────────────────────────────────────────

def bollinger(close, period: int = 20, mult: float = 2.0, squeeze_lookback: int = 120) -> dict:
    """
    Bollinger Bands(20,2) + %B + bandwidth + deteksi squeeze.

    ``squeeze`` True ketika bandwidth berada di kuintil terendah selama
    ``squeeze_lookback`` bar terakhir — pita yang menyempit sering mendahului
    breakout, dan itu informasi yang hilang kalau cuma melihat upper/lower.
    """
    empty = {"upper": None, "mid": None, "lower": None, "pctB": None, "bandwidth": None, "squeeze": None}
    if close is None or len(close) < period:
        return empty
    mid = close.rolling(period).mean()
    sd = close.rolling(period).std(ddof=0)
    upper = mid + mult * sd
    lower = mid - mult * sd
    rng = (upper - lower).replace(0, float("nan"))
    pct_b = 100 * (close - lower) / rng
    bandwidth = 100 * (upper - lower) / mid.replace(0, float("nan"))

    squeeze = None
    bw_hist = bandwidth.dropna()
    if len(bw_hist) >= min(squeeze_lookback, period * 2):
        window = bw_hist.iloc[-squeeze_lookback:]
        squeeze = bool(_f(window.iloc[-1]) <= _f(window.quantile(0.2)))

    return {
        "upper": _last(upper),
        "mid": _last(mid),
        "lower": _last(lower),
        "pctB": _last(pct_b),
        "bandwidth": _last(bandwidth),
        "squeeze": squeeze,
    }


def atr(high, low, close, period: int = 14) -> dict:
    """ATR(14) absolut dan sebagai persen harga (untuk sizing lintas-saham)."""
    empty = {"atr": None, "atrPct": None}
    if close is None or len(close) < period + 1:
        return empty
    val = _last(_wilder(_true_range(high, low, close), period))
    last_close = _last(close)
    pct = None
    if val is not None and last_close:
        pct = 100.0 * val / last_close
    return {"atr": val, "atrPct": pct}


def volatility(close, period: int = 60) -> Optional[float]:
    """Volatilitas tahunan (%) dari stdev log-return."""
    import numpy as np

    if close is None or len(close) < period + 1:
        return None
    rets = np.log(close / close.shift(1)).dropna().iloc[-period:]
    if len(rets) < 2:
        return None
    return _f(rets.std(ddof=1) * math.sqrt(TRADING_DAYS) * 100)


def max_drawdown(close, period: int = TRADING_DAYS) -> Optional[float]:
    """Max drawdown (%) selama ``period`` bar terakhir. Negatif = turun."""
    if close is None or len(close) < 2:
        return None
    w = close.iloc[-period:]
    peak = w.cummax()
    dd = (w / peak - 1) * 100
    return _f(dd.min())


def beta(close, bench_close, period: int = TRADING_DAYS) -> Optional[float]:
    """Beta terhadap benchmark, dihitung dari return harian yang beririsan."""
    import numpy as np
    import pandas as pd

    if close is None or bench_close is None:
        return None
    a = close.pct_change().dropna()
    b = bench_close.pct_change().dropna()
    joined = pd.concat([a, b], axis=1, join="inner").dropna().iloc[-period:]
    if len(joined) < 30:
        return None
    x = joined.iloc[:, 1].to_numpy()
    y = joined.iloc[:, 0].to_numpy()
    var = np.var(x, ddof=1)
    if var == 0:
        return None
    return _f(np.cov(y, x, ddof=1)[0][1] / var)


# ── volume ────────────────────────────────────────────────────────────────

def obv(close, volume, slope_period: int = 20) -> dict:
    """
    On-Balance Volume + kemiringan ternormalisasi.

    ``slope`` dinormalisasi terhadap total volume periode yang sama sehingga
    berada di kisaran −1..+1 dan bisa dibandingkan antar-saham — OBV mentah
    tidak ada artinya lintas ticker karena skalanya ikut ukuran saham.
    """
    empty = {"obv": None, "slope": None}
    if close is None or volume is None or len(close) < slope_period + 1:
        return empty
    import numpy as np

    direction = np.sign(close.diff().fillna(0.0))
    series = (direction * volume).fillna(0.0).cumsum()

    recent_vol = volume.iloc[-slope_period:].sum()
    slope = None
    if recent_vol and recent_vol > 0:
        slope = _f((series.iloc[-1] - series.iloc[-slope_period - 1]) / recent_vol)
    return {"obv": _last(series), "slope": slope}


def volume_ratio(volume, period: int = 20) -> Optional[float]:
    """Volume terakhir dibanding rata-rata ``period`` bar. 1.0 = normal."""
    if volume is None or len(volume) < period + 1:
        return None
    avg = volume.iloc[-period - 1:-1].mean()
    if not avg or avg <= 0:
        return None
    return _f(volume.iloc[-1] / avg)


def vwap(high, low, close, volume, period: int = 20) -> Optional[float]:
    """VWAP rolling ``period`` bar."""
    if close is None or volume is None or len(close) < period:
        return None
    tp = (high + low + close) / 3.0
    pv = (tp * volume).rolling(period).sum()
    v = volume.rolling(period).sum().replace(0, float("nan"))
    return _last(pv / v)


# ── posisi & pola ─────────────────────────────────────────────────────────

def position_52w(close, period: int = TRADING_DAYS) -> dict:
    """Posisi harga dalam rentang 52 minggu. pct 0 = di dasar, 100 = di puncak."""
    empty = {"high": None, "low": None, "pct": None}
    if close is None or len(close) < 20:
        return empty
    w = close.iloc[-period:]
    hi, lo, c = _f(w.max()), _f(w.min()), _last(w)
    if None in (hi, lo, c) or hi == lo:
        return {"high": hi, "low": lo, "pct": None}
    return {"high": hi, "low": lo, "pct": _f(100 * (c - lo) / (hi - lo))}


def distance_from(close, level: Optional[float]) -> Optional[float]:
    """Jarak harga terakhir dari sebuah level, dalam persen."""
    c = _last(close)
    if c is None or not level:
        return None
    return _f(100 * (c - level) / level)


def rsi_divergence(close, period: int = 14, lookback: int = 60) -> Optional[str]:
    """
    Divergence RSI vs harga → "bullish", "bearish", atau None.

    Metodenya sengaja sederhana dan deterministik supaya bisa diport persis
    ke JS: bagi jendela ``lookback`` jadi dua paruh, cari bar tempat HARGA
    membuat ekstrem di masing-masing paruh, lalu bandingkan RSI **di kedua
    bar itu**. Harga bikin low lebih rendah sementara RSI di titik itu justru
    lebih tinggi = bullish divergence; kebalikannya bearish.

    Membandingkan min/max RSI per paruh (alih-alih nilainya di titik pivot
    harga) tidak bekerja: RSI Wilder punya memori ~14 bar, jadi angka rendah
    dari paruh pertama merembes ke awal paruh kedua dan menutupi divergence
    yang sebenarnya ada.
    """
    if close is None or len(close) < lookback + period + 1:
        return None
    delta = close.diff()
    up = _wilder(delta.clip(lower=0), period)
    down = _wilder(-delta.clip(upper=0), period)
    rsi_s = (100 - 100 / (1 + up / down.replace(0, 1e-9))).dropna()
    if len(rsi_s) < lookback:
        return None

    p = close.iloc[-lookback:].tolist()
    r = rsi_s.iloc[-lookback:].tolist()
    if len(p) != len(r):
        return None
    half = lookback // 2

    def arg_ext(seq, lo, hi, want_min):
        best = lo
        for i in range(lo, hi):
            if (seq[i] < seq[best]) if want_min else (seq[i] > seq[best]):
                best = i
        return best

    lo1 = arg_ext(p, 0, half, True)
    lo2 = arg_ext(p, half, len(p), True)
    if p[lo2] < p[lo1] and r[lo2] > r[lo1]:
        return "bullish"

    hi1 = arg_ext(p, 0, half, False)
    hi2 = arg_ext(p, half, len(p), False)
    if p[hi2] > p[hi1] and r[hi2] < r[hi1]:
        return "bearish"
    return None


# ── agregat ───────────────────────────────────────────────────────────────

def compute_all(hist, bench_hist=None) -> dict:
    """
    Hitung seluruh indikator dari satu DataFrame OHLCV.

    Selalu mengembalikan dict dengan kunci yang sama; nilai None menandakan
    data tidak cukup. Konsumen (build_indicators.py, js/narrate.js) boleh
    mengandalkan bentuknya konsisten.
    """
    if hist is None or len(hist) == 0:
        return {}

    high, low, close = hist["High"], hist["Low"], hist["Close"]
    volume = hist["Volume"] if "Volume" in hist else None

    bb = bollinger(close)
    at = atr(high, low, close)
    ob = obv(close, volume) if volume is not None else {"obv": None, "slope": None}
    ema200 = ema(close, 200)

    out = {
        "price": _last(close),
        "ema20": ema(close, 20),
        "ema50": ema(close, 50),
        "ema200": ema200,
        "sma50": sma(close, 50),
        "sma200": sma(close, 200),
        "macd": macd(close),
        "adx": adx(high, low, close),
        "supertrend": supertrend(high, low, close),
        "ichimoku": ichimoku(high, low, close),
        "cross": cross_state(close),
        "rsi": rsi(close),
        "stoch": stochastic(high, low, close),
        "cci": cci(high, low, close),
        "williamsR": williams_r(high, low, close),
        "mfi": mfi(high, low, close, volume) if volume is not None else None,
        "bollinger": bb,
        "atr": at["atr"],
        "atrPct": at["atrPct"],
        "obv": ob["obv"],
        "obvSlope": ob["slope"],
        "volRatio": volume_ratio(volume) if volume is not None else None,
        "vwap": vwap(high, low, close, volume) if volume is not None else None,
        "pos52w": position_52w(close),
        "distEma200": distance_from(close, ema200),
        "divergence": rsi_divergence(close),
    }
    out["risk"] = risk_block(hist, bench_hist, atr_val=at["atr"])
    return out


def risk_block(hist, bench_hist=None, atr_val: Optional[float] = None, target: Optional[float] = None) -> dict:
    """
    Metrik risiko — sengaja DI LUAR komposit 7-faktor.

    Risiko bukan sinyal arah: saham berisiko tinggi tidak otomatis "jelek",
    ia cuma butuh ukuran posisi berbeda. Menggabungkannya ke skor komposit
    akan mencampur dua pertanyaan yang berbeda, jadi ia berdiri sendiri.
    """
    empty = {
        "beta": None, "volatility": None, "maxDrawdown": None,
        "stopLoss": None, "riskReward": None, "level": None, "levelLabel": None,
    }
    if hist is None or len(hist) == 0:
        return empty

    close = hist["Close"]
    price = _last(close)
    if atr_val is None:
        atr_val = atr(hist["High"], hist["Low"], close)["atr"]

    vol = volatility(close)
    bt = beta(close, bench_hist["Close"]) if bench_hist is not None and "Close" in bench_hist else None
    mdd = max_drawdown(close)

    # Stop-loss 2×ATR di bawah harga: lebar stop menyesuaikan volatilitas
    # saham itu sendiri, bukan persentase seragam yang terlalu ketat untuk
    # saham bergejolak dan terlalu longgar untuk yang tenang.
    stop = None
    if price and atr_val:
        stop = _f(price - 2 * atr_val)

    rr = None
    if price and stop and target and price > stop:
        reward = target - price
        risk = price - stop
        if risk > 0 and reward > 0:
            rr = _f(reward / risk)

    level, label = _risk_level(vol, bt, mdd)
    return {
        "beta": bt,
        "volatility": vol,
        "maxDrawdown": mdd,
        "stopLoss": stop,
        "riskReward": rr,
        "level": level,
        "levelLabel": label,
    }


_RISK_LABELS = {
    1: "Sangat Rendah",
    2: "Rendah",
    3: "Sedang",
    4: "Tinggi",
    5: "Sangat Tinggi",
}


def _risk_level(vol: Optional[float], bt: Optional[float], mdd: Optional[float]):
    """
    Gabung volatilitas + beta + drawdown jadi label risiko 1–5.

    Dirata-ratakan atas metrik yang TERSEDIA saja, supaya saham yang tidak
    punya beta (mis. riwayat terlalu pendek) tidak otomatis dianggap lebih
    aman ketimbang yang datanya lengkap. Ambang eksplisit dipakai alih-alih
    round() karena round() Python membulatkan ke genap terdekat.
    """
    points, seen = 0, 0
    if vol is not None:
        seen += 1
        points += 2 if vol >= 60 else 1 if vol >= 35 else 0 if vol >= 20 else -1
    if bt is not None:
        seen += 1
        points += 2 if bt >= 1.6 else 1 if bt >= 1.2 else 0 if bt >= 0.8 else -1
    if mdd is not None:
        seen += 1
        points += 2 if mdd <= -50 else 1 if mdd <= -30 else 0 if mdd <= -15 else -1
    if seen == 0:
        return None, None

    avg = points / seen
    if avg <= -0.8:
        level = 1
    elif avg <= -0.3:
        level = 2
    elif avg < 0.5:
        level = 3
    elif avg < 1.2:
        level = 4
    else:
        level = 5
    return level, _RISK_LABELS[level]
