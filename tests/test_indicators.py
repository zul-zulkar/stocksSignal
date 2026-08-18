#!/usr/bin/env python3
"""
Unit test untuk scripts/indicators.py.

    pip install "pandas>=2.0"
    python -m unittest discover -s tests -p "test_*.py" -v

Dua lapis pengujian, sengaja dipisah:

  1. KEBENARAN — properti dan nilai yang diketahui pasti (RSI deret naik
     monoton harus mendekati 100, Bollinger mid harus sama dengan SMA20,
     dst). Ini yang membuktikan rumusnya benar.
  2. PARITAS/REGRESI — bandingkan dengan tests/fixtures/indicators_expected.json.
     File yang sama dipakai tests/js/indicators.test.cjs, jadi port JS tidak
     bisa melenceng dari Python tanpa ketahuan.

Membalik urutannya (menghasilkan expected dari implementasi lalu menyebutnya
uji kebenaran) hanya akan mengunci bug, jadi lapis 1 tidak boleh dilewat.
"""

import json
import math
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import indicators as ind  # noqa: E402

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

FIXTURE_DIR = ROOT / "tests" / "fixtures"


def series(values):
    return pd.Series([float(v) for v in values])


def frame(close, high=None, low=None, volume=None, open_=None):
    """DataFrame OHLCV dari daftar close; high/low/volume default masuk akal."""
    c = [float(x) for x in close]
    h = [float(x) for x in (high if high is not None else [x * 1.01 for x in c])]
    l = [float(x) for x in (low if low is not None else [x * 0.99 for x in c])]
    o = [float(x) for x in (open_ if open_ is not None else c)]
    v = [float(x) for x in (volume if volume is not None else [1_000_000.0] * len(c))]
    return pd.DataFrame({"Open": o, "High": h, "Low": l, "Close": c, "Volume": v})


def ramp(n, start=100.0, step=1.0):
    return [start + step * i for i in range(n)]


def flat(n, value=100.0):
    return [value] * n


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class MovingAverages(unittest.TestCase):
    def test_sma_of_constant_is_that_constant(self):
        self.assertAlmostEqual(ind.sma(series(flat(60, 42.0)), 50), 42.0, places=9)

    def test_ema_of_constant_is_that_constant(self):
        self.assertAlmostEqual(ind.ema(series(flat(60, 42.0)), 20), 42.0, places=9)

    def test_sma_matches_hand_computed_mean(self):
        # 5 bar terakhir dari 1..10 = 6,7,8,9,10 → 8.0
        self.assertAlmostEqual(ind.sma(series(range(1, 11)), 5), 8.0, places=9)

    def test_short_history_returns_none(self):
        self.assertIsNone(ind.sma(series(ramp(10)), 50))
        self.assertIsNone(ind.ema(series(ramp(10)), 200))


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Rsi(unittest.TestCase):
    def test_monotonic_rise_is_extreme_high(self):
        self.assertGreater(ind.rsi(series(ramp(60))), 99)

    def test_monotonic_fall_is_extreme_low(self):
        self.assertLess(ind.rsi(series(ramp(60, 200.0, -1.0))), 1)

    def test_flat_series_is_neutral_fifty(self):
        # Tidak ada gain maupun loss: up=down=0 → rs=0/1e-9=0 → RSI=0.
        # Yang penting ia tidak meledak; nilainya terdefinisi dan berbatas.
        val = ind.rsi(series(flat(60)))
        self.assertIsNotNone(val)
        self.assertGreaterEqual(val, 0)
        self.assertLessEqual(val, 100)

    def test_bounded_zero_to_hundred(self):
        vals = [100, 120, 90, 130, 85, 140, 80, 150, 95, 160] * 6
        val = ind.rsi(series(vals))
        self.assertGreaterEqual(val, 0)
        self.assertLessEqual(val, 100)

    def test_short_history_returns_none(self):
        self.assertIsNone(ind.rsi(series(ramp(5))))


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Macd(unittest.TestCase):
    def test_constant_series_gives_zero_everything(self):
        m = ind.macd(series(flat(80)))
        self.assertAlmostEqual(m["line"], 0.0, places=9)
        self.assertAlmostEqual(m["signal"], 0.0, places=9)
        self.assertAlmostEqual(m["hist"], 0.0, places=9)

    def test_rising_series_gives_positive_line(self):
        self.assertGreater(ind.macd(series(ramp(120)))["line"], 0)

    def test_falling_series_gives_negative_line(self):
        self.assertLess(ind.macd(series(ramp(120, 300.0, -1.0)))["line"], 0)

    def test_hist_is_line_minus_signal(self):
        m = ind.macd(series(ramp(120, 100.0, 0.7)))
        self.assertAlmostEqual(m["hist"], m["line"] - m["signal"], places=9)

    def test_short_history_returns_none_dict(self):
        m = ind.macd(series(ramp(10)))
        self.assertEqual(m, {"line": None, "signal": None, "hist": None})


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Bollinger(unittest.TestCase):
    def test_mid_equals_sma(self):
        s = series(ramp(60, 100.0, 0.9))
        self.assertAlmostEqual(ind.bollinger(s)["mid"], ind.sma(s, 20), places=9)

    def test_constant_series_has_zero_width(self):
        b = ind.bollinger(series(flat(60)))
        self.assertAlmostEqual(b["upper"], b["lower"], places=9)
        self.assertAlmostEqual(b["bandwidth"], 0.0, places=9)

    def test_bands_straddle_the_mid(self):
        b = ind.bollinger(series([100 + 8 * math.sin(i / 3) for i in range(80)]))
        self.assertGreater(b["upper"], b["mid"])
        self.assertLess(b["lower"], b["mid"])

    def test_pct_b_within_bands_is_between_zero_and_hundred(self):
        b = ind.bollinger(series([100 + 5 * math.sin(i / 4) for i in range(80)]))
        self.assertGreaterEqual(b["pctB"], 0)
        self.assertLessEqual(b["pctB"], 100)


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Atr(unittest.TestCase):
    def test_constant_range_equals_that_range(self):
        # Close datar 100, high 102, low 98 → true range selalu 4.
        df = frame(flat(60), high=flat(60, 102.0), low=flat(60, 98.0))
        a = ind.atr(df["High"], df["Low"], df["Close"])
        self.assertAlmostEqual(a["atr"], 4.0, places=6)
        self.assertAlmostEqual(a["atrPct"], 4.0, places=6)

    def test_never_negative(self):
        df = frame([100 + 10 * math.sin(i / 5) for i in range(80)])
        self.assertGreaterEqual(ind.atr(df["High"], df["Low"], df["Close"])["atr"], 0)

    def test_short_history_returns_none_dict(self):
        df = frame(ramp(5))
        self.assertEqual(
            ind.atr(df["High"], df["Low"], df["Close"]),
            {"atr": None, "atrPct": None},
        )


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Oscillators(unittest.TestCase):
    def test_stochastic_at_period_high_is_hundred(self):
        df = frame(ramp(60))
        self.assertGreater(ind.stochastic(df["High"], df["Low"], df["Close"])["k"], 90)

    def test_stochastic_at_period_low_is_near_zero(self):
        df = frame(ramp(60, 200.0, -1.0))
        self.assertLess(ind.stochastic(df["High"], df["Low"], df["Close"])["k"], 10)

    def test_williams_r_at_high_is_zero(self):
        # Close persis di high periode → %R = 0 (paling overbought).
        c = ramp(40)
        df = frame(c, high=c, low=[x * 0.9 for x in c])
        self.assertAlmostEqual(ind.williams_r(df["High"], df["Low"], df["Close"]), 0.0, places=6)

    def test_williams_r_at_low_is_minus_hundred(self):
        c = ramp(40, 200.0, -1.0)
        df = frame(c, high=[x * 1.1 for x in c], low=c)
        self.assertAlmostEqual(ind.williams_r(df["High"], df["Low"], df["Close"]), -100.0, places=6)

    def test_williams_r_bounded(self):
        df = frame([100 + 9 * math.sin(i / 3) for i in range(60)])
        val = ind.williams_r(df["High"], df["Low"], df["Close"])
        self.assertGreaterEqual(val, -100)
        self.assertLessEqual(val, 0)

    def test_mfi_all_up_days_is_hundred(self):
        df = frame(ramp(40))
        self.assertAlmostEqual(ind.mfi(df["High"], df["Low"], df["Close"], df["Volume"]), 100.0, places=6)

    def test_mfi_all_down_days_is_zero(self):
        df = frame(ramp(40, 200.0, -1.0))
        self.assertAlmostEqual(ind.mfi(df["High"], df["Low"], df["Close"], df["Volume"]), 0.0, places=6)

    def test_cci_constant_series_is_none(self):
        # Deviasi rata-rata nol → pembagi nol; harus None, bukan meledak.
        self.assertIsNone(ind.cci(*[series(flat(40))] * 3))


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class DirectionalMovement(unittest.TestCase):
    def test_uptrend_has_plus_di_above_minus_di(self):
        df = frame(ramp(80))
        a = ind.adx(df["High"], df["Low"], df["Close"])
        self.assertGreater(a["plusDI"], a["minusDI"])

    def test_downtrend_has_minus_di_above_plus_di(self):
        df = frame(ramp(80, 300.0, -1.5))
        a = ind.adx(df["High"], df["Low"], df["Close"])
        self.assertGreater(a["minusDI"], a["plusDI"])

    def test_adx_bounded_zero_to_hundred(self):
        df = frame([100 + 12 * math.sin(i / 6) for i in range(120)])
        a = ind.adx(df["High"], df["Low"], df["Close"])
        self.assertGreaterEqual(a["adx"], 0)
        self.assertLessEqual(a["adx"], 100)

    def test_flat_market_does_not_crash(self):
        # High==Low==Close → ATR nol; dulu ini pembagian nol.
        df = frame(flat(80), high=flat(80), low=flat(80))
        a = ind.adx(df["High"], df["Low"], df["Close"])
        self.assertIsInstance(a, dict)


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Supertrend(unittest.TestCase):
    def test_uptrend_is_bullish(self):
        df = frame(ramp(80))
        self.assertEqual(ind.supertrend(df["High"], df["Low"], df["Close"])["dir"], 1)

    def test_downtrend_is_bearish(self):
        df = frame(ramp(80, 400.0, -2.0))
        self.assertEqual(ind.supertrend(df["High"], df["Low"], df["Close"])["dir"], -1)

    def test_band_sits_below_price_in_uptrend(self):
        df = frame(ramp(80))
        st = ind.supertrend(df["High"], df["Low"], df["Close"])
        self.assertLess(st["value"], df["Close"].iloc[-1])


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Ichimoku(unittest.TestCase):
    def test_sustained_uptrend_is_above_cloud(self):
        df = frame(ramp(200))
        self.assertEqual(ind.ichimoku(df["High"], df["Low"], df["Close"])["cloudPos"], 1)

    def test_sustained_downtrend_is_below_cloud(self):
        df = frame(ramp(200, 500.0, -2.0))
        self.assertEqual(ind.ichimoku(df["High"], df["Low"], df["Close"])["cloudPos"], -1)

    def test_short_history_returns_none_dict(self):
        df = frame(ramp(20))
        self.assertIsNone(ind.ichimoku(df["High"], df["Low"], df["Close"])["cloudPos"])


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class VolumeIndicators(unittest.TestCase):
    def test_obv_all_up_days_accumulates_all_volume(self):
        df = frame(ramp(40))
        # Bar pertama diff-nya NaN→0, jadi 39 bar naik × 1jt.
        self.assertAlmostEqual(ind.obv(df["Close"], df["Volume"])["obv"], 39_000_000.0, places=2)

    def test_obv_slope_positive_on_accumulation(self):
        df = frame(ramp(40))
        self.assertGreater(ind.obv(df["Close"], df["Volume"])["slope"], 0)

    def test_obv_slope_negative_on_distribution(self):
        df = frame(ramp(40, 200.0, -1.0))
        self.assertLess(ind.obv(df["Close"], df["Volume"])["slope"], 0)

    def test_obv_slope_is_normalised_within_unit_range(self):
        # Inilah yang membuat OBV bisa dibandingkan antar-saham.
        df = frame(ramp(40))
        self.assertLessEqual(abs(ind.obv(df["Close"], df["Volume"])["slope"]), 1.0001)

    def test_volume_ratio_constant_volume_is_one(self):
        df = frame(ramp(40))
        self.assertAlmostEqual(ind.volume_ratio(df["Volume"]), 1.0, places=9)

    def test_volume_ratio_spike_detected(self):
        vols = [1_000_000.0] * 39 + [3_000_000.0]
        df = frame(ramp(40), volume=vols)
        self.assertAlmostEqual(ind.volume_ratio(df["Volume"]), 3.0, places=9)

    def test_vwap_of_flat_market_is_that_price(self):
        df = frame(flat(40), high=flat(40), low=flat(40))
        self.assertAlmostEqual(ind.vwap(df["High"], df["Low"], df["Close"], df["Volume"]), 100.0, places=9)


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class PositionAndPatterns(unittest.TestCase):
    def test_position_at_top_of_range(self):
        self.assertAlmostEqual(ind.position_52w(series(ramp(300)))["pct"], 100.0, places=6)

    def test_position_at_bottom_of_range(self):
        self.assertAlmostEqual(ind.position_52w(series(ramp(300, 500.0, -1.0)))["pct"], 0.0, places=6)

    def test_cross_state_golden_on_uptrend(self):
        c = ind.cross_state(series(ramp(260)))
        self.assertEqual(c["state"], "golden")
        self.assertGreater(c["daysSince"], 0)

    def test_cross_state_death_on_downtrend(self):
        self.assertEqual(ind.cross_state(series(ramp(260, 600.0, -1.5)))["state"], "death")

    def test_distance_from_level(self):
        self.assertAlmostEqual(ind.distance_from(series([110.0]), 100.0), 10.0, places=9)

    def test_distance_from_missing_level_is_none(self):
        self.assertIsNone(ind.distance_from(series([110.0]), None))

    def test_bullish_divergence_detected(self):
        # Paruh 1 jatuh tajam & monoton (RSI terjun ke ~0). Paruh 2 merayap ke
        # low sedikit lebih rendah tapi bergelombang, jadi RSI di titik low
        # baru itu jauh lebih tinggi — itulah bullish divergence.
        sharp = [100.0 - 1.0 * i for i in range(30)]
        chop = [71.0 - 0.07 * i + 1.5 * math.sin(i / 2.0) for i in range(30)]
        self.assertEqual(
            ind.rsi_divergence(series(flat(60) + sharp + chop), lookback=60), "bullish"
        )

    def test_bearish_divergence_detected(self):
        rise = [100.0 + 1.0 * i for i in range(30)]
        stall = [129.0 + 0.07 * i + 1.5 * math.sin(i / 2.0) for i in range(30)]
        self.assertEqual(
            ind.rsi_divergence(series(flat(60) + rise + stall), lookback=60), "bearish"
        )

    def test_no_divergence_on_clean_uptrend(self):
        self.assertIsNone(ind.rsi_divergence(series(ramp(200)), lookback=60))

    def test_no_divergence_on_clean_downtrend(self):
        self.assertIsNone(ind.rsi_divergence(series(ramp(200, 500.0, -1.0)), lookback=60))

    def test_divergence_reads_rsi_at_price_pivot_not_half_minimum(self):
        # Regresi: versi awal membandingkan min RSI per paruh, dan memori
        # Wilder ~14 bar membuat angka rendah paruh 1 merembes ke paruh 2
        # sehingga divergence nyata di atas tidak pernah terdeteksi.
        sharp = [100.0 - 1.0 * i for i in range(30)]
        chop = [71.0 - 0.07 * i + 1.5 * math.sin(i / 2.0) for i in range(30)]
        s = series(flat(60) + sharp + chop)
        rsi_window = []
        delta = s.diff()
        up = delta.clip(lower=0).ewm(alpha=1 / 14, adjust=False).mean()
        down = (-delta.clip(upper=0)).ewm(alpha=1 / 14, adjust=False).mean()
        rsi_window = (100 - 100 / (1 + up / down.replace(0, 1e-9))).dropna().iloc[-60:]
        # Min RSI kedua paruh sama-sama 0 → aturan lama pasti gagal…
        self.assertAlmostEqual(rsi_window.iloc[:30].min(), rsi_window.iloc[30:].min(), places=6)
        # …tapi aturan pivot tetap menemukannya.
        self.assertEqual(ind.rsi_divergence(s, lookback=60), "bullish")

    def test_divergence_short_history_is_none(self):
        self.assertIsNone(ind.rsi_divergence(series(ramp(20))))


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class Risk(unittest.TestCase):
    def test_volatility_of_constant_is_zero(self):
        self.assertAlmostEqual(ind.volatility(series(flat(120))), 0.0, places=9)

    def test_volatility_grows_with_swing_size(self):
        calm = series([100 + 1 * math.sin(i / 3) for i in range(150)])
        wild = series([100 + 20 * math.sin(i / 3) for i in range(150)])
        self.assertGreater(ind.volatility(wild), ind.volatility(calm))

    def test_max_drawdown_known_value(self):
        # Naik ke 200 lalu jatuh ke 150 → drawdown −25%.
        self.assertAlmostEqual(ind.max_drawdown(series([100, 200, 150])), -25.0, places=9)

    def test_max_drawdown_monotonic_rise_is_zero(self):
        self.assertAlmostEqual(ind.max_drawdown(series(ramp(100))), 0.0, places=9)

    def test_beta_against_itself_is_one(self):
        s = series([100 + 7 * math.sin(i / 4) for i in range(200)])
        self.assertAlmostEqual(ind.beta(s, s), 1.0, places=6)

    def test_beta_of_double_moves_is_two(self):
        base = [100.0]
        for i in range(200):
            base.append(base[-1] * (1 + 0.01 * math.sin(i / 3)))
        lev = [100.0]
        for i in range(200):
            lev.append(lev[-1] * (1 + 0.02 * math.sin(i / 3)))
        self.assertAlmostEqual(ind.beta(series(lev), series(base)), 2.0, places=1)

    def test_beta_insufficient_overlap_is_none(self):
        self.assertIsNone(ind.beta(series(ramp(10)), series(ramp(10))))

    def test_stop_loss_sits_two_atr_below_price(self):
        df = frame(flat(60), high=flat(60, 102.0), low=flat(60, 98.0))
        r = ind.risk_block(df)
        self.assertAlmostEqual(r["stopLoss"], 100.0 - 2 * 4.0, places=5)

    def test_risk_reward_uses_target(self):
        # Harga 100, ATR 4 → stop 92, risiko 8. Target 124 → imbalan 24 → RR 3.
        df = frame(flat(60), high=flat(60, 102.0), low=flat(60, 98.0))
        r = ind.risk_block(df, target=124.0)
        self.assertAlmostEqual(r["riskReward"], 3.0, places=5)

    def test_risk_reward_none_without_target(self):
        df = frame(flat(60), high=flat(60, 102.0), low=flat(60, 98.0))
        self.assertIsNone(ind.risk_block(df)["riskReward"])

    def test_neutral_metrics_map_to_middle_level(self):
        # Regresi: rumus lama memetakan kombinasi netral ke level 1.
        level, label = ind._risk_level(vol=25.0, bt=1.0, mdd=-20.0)
        self.assertEqual(level, 3)
        self.assertEqual(label, "Sedang")

    def test_calm_metrics_map_to_lowest_level(self):
        self.assertEqual(ind._risk_level(vol=10.0, bt=0.5, mdd=-5.0)[0], 1)

    def test_wild_metrics_map_to_highest_level(self):
        self.assertEqual(ind._risk_level(vol=80.0, bt=2.0, mdd=-70.0)[0], 5)

    def test_level_ignores_missing_metrics(self):
        # Hanya volatilitas yang ada: tetap harus memberi level yang masuk akal.
        level, _ = ind._risk_level(vol=80.0, bt=None, mdd=None)
        self.assertEqual(level, 5)

    def test_level_none_when_nothing_available(self):
        self.assertEqual(ind._risk_level(None, None, None), (None, None))


@unittest.skipUnless(HAS_PANDAS, "butuh pandas")
class ComputeAll(unittest.TestCase):
    EXPECTED_KEYS = {
        "price", "ema20", "ema50", "ema200", "sma50", "sma200", "macd", "adx",
        "supertrend", "ichimoku", "cross", "rsi", "stoch", "cci", "williamsR",
        "mfi", "bollinger", "atr", "atrPct", "obv", "obvSlope", "volRatio",
        "vwap", "pos52w", "distEma200", "divergence", "risk",
    }

    def test_returns_full_key_set(self):
        self.assertEqual(set(ind.compute_all(frame(ramp(300))).keys()), self.EXPECTED_KEYS)

    def test_key_set_stable_even_on_short_history(self):
        # Ticker baru IPO tidak boleh menghasilkan dict yang bentuknya beda.
        self.assertEqual(set(ind.compute_all(frame(ramp(5))).keys()), self.EXPECTED_KEYS)

    def test_empty_frame_returns_empty_dict(self):
        self.assertEqual(ind.compute_all(frame([])), {})

    def test_none_input_returns_empty_dict(self):
        self.assertEqual(ind.compute_all(None), {})

    def test_missing_volume_column_does_not_crash(self):
        df = frame(ramp(300)).drop(columns=["Volume"])
        out = ind.compute_all(df)
        self.assertIsNone(out["obv"])
        self.assertIsNone(out["mfi"])
        self.assertIsNotNone(out["rsi"])

    def test_all_values_are_json_serialisable(self):
        # data/indicators.js ditulis lewat json.dumps — NaN/inf akan lolos
        # diam-diam dan menghasilkan JS yang tidak bisa di-parse.
        payload = json.dumps(ind.compute_all(frame(ramp(300))))
        self.assertNotIn("NaN", payload)
        self.assertNotIn("Infinity", payload)


class FixtureParity(unittest.TestCase):
    """
    Kunci paritas dengan js/indicators.js.

    Nilai yang sama juga di-assert tests/js/indicators.test.cjs, jadi kalau
    salah satu sisi diubah tanpa yang lain, suite ini merah.
    """

    @classmethod
    def setUpClass(cls):
        ohlcv = FIXTURE_DIR / "ohlcv_sample.json"
        expected = FIXTURE_DIR / "indicators_expected.json"
        if not ohlcv.exists() or not expected.exists():
            raise unittest.SkipTest("fixture belum digenerate")
        cls.data = json.loads(ohlcv.read_text(encoding="utf-8"))
        cls.expected = json.loads(expected.read_text(encoding="utf-8"))

    def setUp(self):
        if not HAS_PANDAS:
            self.skipTest("butuh pandas")
        self.df = pd.DataFrame({
            "Open": self.data["open"],
            "High": self.data["high"],
            "Low": self.data["low"],
            "Close": self.data["close"],
            "Volume": self.data["volume"],
        })

    def assertClose(self, actual, want, key):
        if want is None:
            self.assertIsNone(actual, key)
        elif isinstance(want, bool):
            self.assertEqual(actual, want, key)
        elif isinstance(want, str):
            self.assertEqual(actual, want, key)
        else:
            self.assertAlmostEqual(actual, want, places=6, msg=key)

    def test_scalar_indicators_match_fixture(self):
        c, h, l, v = self.df["Close"], self.df["High"], self.df["Low"], self.df["Volume"]
        for key, actual in [
            ("rsi", ind.rsi(c)),
            ("ema20", ind.ema(c, 20)),
            ("ema50", ind.ema(c, 50)),
            ("ema200", ind.ema(c, 200)),
            ("sma50", ind.sma(c, 50)),
            ("sma200", ind.sma(c, 200)),
            ("volRatio", ind.volume_ratio(v)),
        ]:
            with self.subTest(key):
                self.assertClose(actual, self.expected[key], key)

    def test_dict_indicators_match_fixture(self):
        c, h, l, v = self.df["Close"], self.df["High"], self.df["Low"], self.df["Volume"]
        groups = {
            "macd": ind.macd(c),
            "bollinger": ind.bollinger(c),
            "atr": ind.atr(h, l, c),
            "stoch": ind.stochastic(h, l, c),
            "adx": ind.adx(h, l, c),
            "obv": ind.obv(c, v),
            "pos52w": ind.position_52w(c),
            "cross": ind.cross_state(c),
        }
        for group, actual in groups.items():
            for field, want in self.expected[group].items():
                with self.subTest(f"{group}.{field}"):
                    self.assertClose(actual[field], want, f"{group}.{field}")

    def test_fixture_series_is_long_enough_for_every_indicator(self):
        # Kalau fixture dipendekkan, banyak indikator diam-diam jadi None dan
        # uji paritas kehilangan taringnya.
        self.assertGreaterEqual(len(self.df), 300)
        out = ind.compute_all(self.df)
        for key in ("rsi", "sma200", "ema200", "atr", "volRatio"):
            self.assertIsNotNone(out[key], f"{key} None — fixture kependekan")


if __name__ == "__main__":
    unittest.main()
