#!/usr/bin/env python3
"""
Generator fixture paritas Python↔JS.

Jalankan dari root repo saat rumus indikator sengaja diubah:

    python tests/fixtures/generate_fixture.py

Menulis dua file:
  ohlcv_sample.json      – deret OHLCV deterministik (input bersama)
  indicators_expected.json – nilai indikator hasil scripts/indicators.py

tests/test_indicators.py dan tests/js/indicators.test.cjs sama-sama membaca
kedua file itu, jadi kalau port JS melenceng dari Python, salah satu suite
langsung merah. File expected ini mengunci REGRESI dan PARITAS — kebenaran
rumusnya diuji terpisah lewat properti & nilai-diketahui di test_indicators.py.
"""

import json
import math
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

BARS = 400


def build_series(bars: int = BARS) -> dict:
    """
    Deret sintetis deterministik — tanpa RNG sama sekali.

    Sengaja mencampur tren naik lambat dengan dua gelombang beda periode
    supaya menghasilkan golden/death cross, MACD yang berpotongan, RSI yang
    menjelajah zona ekstrem, dan pita Bollinger yang menyempit-melebar.
    """
    o, h, l, c, v = [], [], [], [], []
    prev_close = 100.0
    for i in range(bars):
        close = 100.0 + 0.045 * i + 14.0 * math.sin(i / 17.0) + 6.0 * math.sin(i / 5.3)
        open_ = prev_close
        top = max(open_, close)
        bottom = min(open_, close)
        high = top * (1.0 + 0.004 + 0.004 * abs(math.sin(i / 3.0)))
        low = bottom * (1.0 - 0.004 - 0.004 * abs(math.cos(i / 4.0)))
        vol = 1_000_000.0 * (1.3 + 0.5 * math.sin(i / 9.0) + 0.2 * math.cos(i / 2.0))

        o.append(round(open_, 6))
        h.append(round(high, 6))
        l.append(round(low, 6))
        c.append(round(close, 6))
        v.append(round(vol, 2))
        prev_close = close

    return {"open": o, "high": h, "low": l, "close": c, "volume": v}


def to_frame(data: dict):
    import pandas as pd

    return pd.DataFrame({
        "Open": data["open"],
        "High": data["high"],
        "Low": data["low"],
        "Close": data["close"],
        "Volume": data["volume"],
    })


def main() -> int:
    import indicators as ind

    data = build_series()
    (HERE / "ohlcv_sample.json").write_text(json.dumps(data), encoding="utf-8")

    df = to_frame(data)
    close, high, low, volume = df["Close"], df["High"], df["Low"], df["Volume"]

    # Hanya indikator yang DIPORT ke JS yang masuk file expected — sisanya
    # (Ichimoku, CCI, Williams %R, MFI, beta, …) hanya hidup di Python dan
    # diuji di test_indicators.py saja.
    expected = {
        "rsi": ind.rsi(close),
        "ema20": ind.ema(close, 20),
        "ema50": ind.ema(close, 50),
        "ema200": ind.ema(close, 200),
        "sma50": ind.sma(close, 50),
        "sma200": ind.sma(close, 200),
        "macd": ind.macd(close),
        "bollinger": ind.bollinger(close),
        "atr": ind.atr(high, low, close),
        "stoch": ind.stochastic(high, low, close),
        "adx": ind.adx(high, low, close),
        "obv": ind.obv(close, volume),
        "volRatio": ind.volume_ratio(volume),
        "pos52w": ind.position_52w(close),
        "cross": ind.cross_state(close),
        "supertrend": ind.supertrend(high, low, close),
        # Skor teknikal ikut dikunci: inilah angka yang benar-benar dilihat
        # pengguna, dan yang paling merugikan kalau kedua sisi melenceng.
        "techParts": ind.technical_parts(ind.compute_all(df)),
        "techScore": ind.technical_score(ind.compute_all(df)),
    }
    (HERE / "indicators_expected.json").write_text(
        json.dumps(expected, indent=2, sort_keys=True), encoding="utf-8"
    )
    print(f"Fixture ditulis: {BARS} bar → {HERE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
