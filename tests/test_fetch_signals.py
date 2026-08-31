#!/usr/bin/env python3
"""
Unit test untuk scripts/fetch_signals.py.

Jalankan dari root repo:
    python -m unittest discover -s tests -v
atau:
    python -m pytest tests/ -v
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import fetch_signals as fs  # noqa: E402

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False


SAMPLE_STOCKS = """\
window.STOCK_UNIVERSE = [
  {
    ticker: "TST", name: "Test Co", sector: "Tech",
    ethics: {
      israelTie: "none",
      rationale: "tidak ada keterlibatan",
      sources: ["x"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.5, payoutRatio: 15, marketCapB: 100 },
    signals: { technical: 25, momentum: 20, sentiment: 30, news: 10, policy: 15, profile: 60, valuation: -10 }
  },
  {
    ticker: "OTH", name: "Other Co", sector: "Energy",
    ethics: {
      israelTie: "low",
      rationale: "minim",
      sources: ["y"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.0, payoutRatio: 40, marketCapB: 50 },
    signals: { technical: 5, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 30, valuation: 0 }
  }
];
"""


class NewsScore(unittest.TestCase):
    def test_positive_keywords(self):
        news = [{"title": "Company beats estimates, shares surge"}]
        self.assertGreater(fs.news_score(news), 0)

    def test_negative_keywords(self):
        news = [{"title": "Stock plunges on downgrade and lawsuit"}]
        self.assertLess(fs.news_score(news), 0)

    def test_empty(self):
        self.assertEqual(fs.news_score([]), 0)

    def test_clamped(self):
        news = [{"title": "beat surge record upgrade raise bull strong"}] * 20
        self.assertLessEqual(fs.news_score(news), 100)


class ProfileScore(unittest.TestCase):
    def test_mega_quality(self):
        info = {"marketCap": 600e9, "profitMargins": 0.25, "dividendYield": 2.0, "debtToEquity": 50}
        self.assertGreater(fs.profile_score(info), 50)

    def test_small_unprofitable(self):
        info = {"marketCap": 1e9, "profitMargins": -0.1, "debtToEquity": 300}
        self.assertLess(fs.profile_score(info), 0)

    def test_dividend_bonus_uses_percent_units(self):
        base = {"marketCap": 50e9, "profitMargins": 0.12}
        # dividendYield dalam persen: 2.5% memenuhi 1..7 → +10
        with_div = fs.profile_score({**base, "dividendYield": 2.5})
        no_div   = fs.profile_score({**base, "dividendYield": 0})
        self.assertEqual(with_div - no_div, 10)
        # 0.02 (artinya 0.02%) TIDAK lagi salah dihitung sebagai 2%
        self.assertEqual(fs.profile_score({**base, "dividendYield": 0.02}), no_div)

    def test_bounds(self):
        self.assertTrue(-100 <= fs.profile_score({}) <= 100)


class ValuationMetrics(unittest.TestCase):
    def test_extracts_and_derives(self):
        m = fs.valuation_metrics({
            "forwardPE": 18.0, "priceToBook": 3.2, "enterpriseToEbitda": 12.0,
            "freeCashflow": 5e9, "marketCap": 1e11, "trailingPegRatio": 1.4,
        })
        self.assertEqual(m["forwardPE"], 18.0)
        self.assertAlmostEqual(m["fcfYield"], 0.05)   # 5e9 / 1e11

    def test_rejects_out_of_band_values(self):
        # P/E 900 atau P/B negatif adalah artefak laba/ekuitas negatif,
        # bukan sinyal valuasi — masuk akan mencemari median sektor.
        m = fs.valuation_metrics({"forwardPE": 900.0, "priceToBook": -2.0})
        self.assertEqual(m, {})

    def test_missing_fields_are_skipped(self):
        self.assertEqual(fs.valuation_metrics({}), {})

    def test_fcf_yield_needs_both_parts(self):
        self.assertNotIn("fcfYield", fs.valuation_metrics({"freeCashflow": 5e9}))
        self.assertNotIn("fcfYield", fs.valuation_metrics({"marketCap": 1e11}))


class SectorMedians(unittest.TestCase):
    def _rows(self, sector, values):
        return {
            f"T{i}": {"sector": sector, "metrics": {"forwardPE": v}}
            for i, v in enumerate(values)
        }

    def test_computes_median_per_sector(self):
        med = fs.sector_medians(self._rows("Tech", [10, 20, 30, 40, 50]))
        self.assertEqual(med["Tech"]["forwardPE"], 30)

    def test_even_count_averages_middle_two(self):
        med = fs.sector_medians(self._rows("Tech", [10, 20, 30, 40, 50, 60]))
        self.assertEqual(med["Tech"]["forwardPE"], 35)

    def test_thin_sector_is_omitted(self):
        # Median dari 4 saham bukan pembanding yang bisa dipercaya.
        self.assertEqual(fs.sector_medians(self._rows("Tiny", [10, 20, 30, 40])), {})

    def test_sectors_are_kept_separate(self):
        rows = {}
        rows.update({f"A{i}": {"sector": "Tech", "metrics": {"forwardPE": 40}} for i in range(5)})
        rows.update({f"B{i}": {"sector": "Bank", "metrics": {"forwardPE": 8}} for i in range(5)})
        med = fs.sector_medians(rows)
        self.assertEqual(med["Tech"]["forwardPE"], 40)
        self.assertEqual(med["Bank"]["forwardPE"], 8)


class ValuationScore(unittest.TestCase):
    MEDIANS = {"Tech": {"forwardPE": 30.0}, "Bank": {"forwardPE": 10.0}}

    def test_cheaper_than_sector_is_positive(self):
        self.assertGreater(fs.valuation_score({"forwardPE": 15.0}, "Tech", self.MEDIANS), 0)

    def test_pricier_than_sector_is_negative(self):
        self.assertLess(fs.valuation_score({"forwardPE": 60.0}, "Tech", self.MEDIANS), 0)

    def test_at_sector_median_is_neutral(self):
        self.assertEqual(fs.valuation_score({"forwardPE": 30.0}, "Tech", self.MEDIANS), 0)

    def test_same_pe_scores_differently_across_sectors(self):
        # Inti perubahannya: P/E 20 itu murah untuk saham teknologi dan mahal
        # untuk bank. Patokan tetap 20× lama tidak bisa membedakan keduanya.
        tech = fs.valuation_score({"forwardPE": 20.0}, "Tech", self.MEDIANS)
        bank = fs.valuation_score({"forwardPE": 20.0}, "Bank", self.MEDIANS)
        self.assertGreater(tech, 0)
        self.assertLess(bank, 0)

    def test_unknown_sector_falls_back_to_absolute_baseline(self):
        # Baseline forwardPE = 20; P/E 10 harus tetap terbaca murah.
        self.assertGreater(fs.valuation_score({"forwardPE": 10.0}, "Nowhere", {}), 0)

    def test_missing_metrics_returns_zero(self):
        self.assertEqual(fs.valuation_score({}, "Tech", self.MEDIANS), 0)

    def test_higher_fcf_yield_is_positive(self):
        # fcfYield satu-satunya metrik yang "lebih tinggi lebih baik".
        med = {"Tech": {"fcfYield": 0.04}}
        self.assertGreater(fs.valuation_score({"fcfYield": 0.08}, "Tech", med), 0)
        self.assertLess(fs.valuation_score({"fcfYield": 0.01}, "Tech", med), 0)

    def test_stays_within_bounds(self):
        med = {"Tech": {"forwardPE": 30.0}}
        for pe in (0.6, 1.0, 199.0):
            self.assertTrue(-100 <= fs.valuation_score({"forwardPE": pe}, "Tech", med) <= 100)


class Fundamentals(unittest.TestCase):
    def test_conversion(self):
        # dividendYield sudah persen (tidak dikali 100); payoutRatio pecahan (×100)
        f = fs.fundamentals({"dividendYield": 1.5, "payoutRatio": 0.3, "marketCap": 2.5e12})
        self.assertEqual(f["dividendYield"], 1.5)
        self.assertEqual(f["payoutRatio"], 30.0)
        self.assertEqual(f["marketCapB"], 2500)

    def test_missing(self):
        f = fs.fundamentals({})
        self.assertEqual(f, {"dividendYield": 0, "payoutRatio": 0, "marketCapB": 0})


class AnalystBlock(unittest.TestCase):
    def test_extraction(self):
        info = {
            "recommendationKey": "buy", "recommendationMean": 2.1,
            "numberOfAnalystOpinions": 30, "targetMeanPrice": 210.5,
            "targetHighPrice": 260, "targetLowPrice": 150,
            "currentPrice": 190.25, "currency": "USD",
        }
        a = fs.analyst_block(info)
        self.assertEqual(a["rating"], "buy")
        self.assertEqual(a["ratingMean"], 2.1)
        self.assertEqual(a["numAnalysts"], 30)
        self.assertEqual(a["targetMean"], 210.5)
        self.assertEqual(a["price"], 190.25)

    def test_missing_safe(self):
        a = fs.analyst_block({})
        self.assertIsNone(a["rating"])
        self.assertIsNone(a["ratingMean"])
        self.assertEqual(a["numAnalysts"], 0)
        self.assertEqual(a["currency"], "USD")


class SentimentFromAnalyst(unittest.TestCase):
    def test_strong_buy_positive(self):
        self.assertEqual(fs.sentiment_from_analyst({"numAnalysts": 10, "ratingMean": 1.0}), 100)

    def test_hold_neutral(self):
        self.assertEqual(fs.sentiment_from_analyst({"numAnalysts": 10, "ratingMean": 3.0}), 0)

    def test_sell_negative(self):
        self.assertEqual(fs.sentiment_from_analyst({"numAnalysts": 10, "ratingMean": 5.0}), -100)

    def test_no_analysts_none(self):
        self.assertIsNone(fs.sentiment_from_analyst({"numAnalysts": 0, "ratingMean": 1.5}))

    def test_missing_mean_none(self):
        self.assertIsNone(fs.sentiment_from_analyst({"numAnalysts": 10, "ratingMean": None}))


class UpdateStockBlock(unittest.TestCase):
    def test_updates_signals_and_fundamentals(self):
        payload = {
            "technical": 99, "momentum": 88, "news": 77, "profile": 66, "valuation": 55,
            "fundamentals": {"dividendYield": 1.23, "payoutRatio": 44, "marketCapB": 2500},
        }
        out = fs.update_stock_block(SAMPLE_STOCKS, "TST", payload)
        self.assertIn("technical: 99", out)
        self.assertIn("momentum: 88", out)
        self.assertIn("news: 77", out)
        self.assertIn("dividendYield: 1.23", out)
        self.assertIn("marketCapB: 2500", out)
        # policy tidak ada di payload → tetap 15
        self.assertIn("policy: 15", out)
        # sentiment tidak ada di payload → tetap 30 (manual)
        self.assertIn("sentiment: 30", out)

    def test_sentiment_updated_when_present(self):
        payload = {
            "technical": 1, "momentum": 1, "news": 1, "profile": 1, "valuation": 1,
            "fundamentals": {"dividendYield": 0.5, "payoutRatio": 15, "marketCapB": 100},
            "sentiment": -42,
        }
        out = fs.update_stock_block(SAMPLE_STOCKS, "TST", payload)
        self.assertIn("sentiment: -42", out)

    def test_only_target_ticker_changes(self):
        payload = {
            "technical": 99, "momentum": 88, "news": 77, "profile": 66, "valuation": 55,
            "fundamentals": {"dividendYield": 1.23, "payoutRatio": 44, "marketCapB": 2500},
        }
        out = fs.update_stock_block(SAMPLE_STOCKS, "TST", payload)
        # OTH harus tetap utuh
        self.assertIn('technical: 5, momentum: 0', out)

    def test_unknown_ticker_noop(self):
        out = fs.update_stock_block(SAMPLE_STOCKS, "NOPE", {"technical": 1})
        self.assertEqual(out, SAMPLE_STOCKS)


class MergeAnalystFile(unittest.TestCase):
    def test_merge_preserves_existing(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "analyst.js"
            path.write_text('window.STOCK_ANALYST = {"AAA": {"rating": "buy"}};\n')
            orig = fs.ANALYST_JS
            try:
                fs.ANALYST_JS = path
                fs.merge_analyst_file({"BBB": {"rating": "hold"}})
            finally:
                fs.ANALYST_JS = orig
            txt = path.read_text()
            data = json.loads(txt[txt.index("{"): txt.rindex("}") + 1])
            self.assertIn("AAA", data)   # lama dipertahankan
            self.assertIn("BBB", data)   # baru ditambahkan


@unittest.skipUnless(HAS_PANDAS, "pandas tidak terpasang")
class PandasSignals(unittest.TestCase):
    def _series(self, vals):
        return pd.DataFrame({"Close": vals})

    def test_momentum_outperform_positive(self):
        stock = self._series([100 * (1.5 ** (i / 126)) for i in range(130)])
        bench = self._series([100 for _ in range(130)])
        self.assertGreater(fs.momentum_score(stock, bench), 0)

    def test_momentum_underperform_negative(self):
        stock = self._series([100 for _ in range(130)])
        bench = self._series([100 * (1.5 ** (i / 126)) for i in range(130)])
        self.assertLess(fs.momentum_score(stock, bench), 0)

    def test_momentum_blends_twelve_one_when_history_allows(self):
        # Dengan riwayat 2 tahun, horizon 12-1 bulan ikut dihitung dan
        # hasilnya harus berbeda dari yang hanya punya 6 bulan.
        n = 300
        stock = self._series([100 * (1.4 ** (i / 252)) for i in range(n)])
        bench = self._series([100.0 for _ in range(n)])
        long_hist = fs.momentum_score(stock, bench)
        short_hist = fs.momentum_score(
            self._series(stock["Close"].tolist()[-130:]),
            self._series(bench["Close"].tolist()[-130:]),
        )
        self.assertGreater(long_hist, 0)
        self.assertNotEqual(long_hist, short_hist)

    def test_momentum_short_history_is_zero(self):
        self.assertEqual(
            fs.momentum_score(self._series([1, 2, 3]), self._series([1, 2, 3])), 0
        )


class TechnicalParts(unittest.TestCase):
    """
    technical_parts() adalah fungsi murni dict→dict, jadi tidak butuh pandas
    maupun jaringan — itulah kenapa ia dipisah dari technical_score().
    """

    BULL = {
        "price": 120.0, "ema50": 110.0, "ema200": 100.0,
        "adx": {"adx": 30.0}, "macd": {"hist": 1.2},
        "rsi": 45.0, "stoch": {"k": 40.0}, "bollinger": {"pctB": 45.0},
        "obvSlope": 0.2, "volRatio": 1.2,
        "supertrend": {"dir": 1}, "pos52w": {"pct": 80.0},
    }
    BEAR = {
        "price": 80.0, "ema50": 90.0, "ema200": 100.0,
        "adx": {"adx": 30.0}, "macd": {"hist": -1.2},
        "rsi": 65.0, "stoch": {"k": 70.0}, "bollinger": {"pctB": 70.0},
        "obvSlope": -0.2, "volRatio": 1.2,
        "supertrend": {"dir": -1}, "pos52w": {"pct": 20.0},
    }

    def test_bullish_setup_scores_above_bearish(self):
        self.assertGreater(fs.technical_score(self.BULL), fs.technical_score(self.BEAR))

    def test_bullish_is_positive_and_bearish_negative(self):
        self.assertGreater(fs.technical_score(self.BULL), 0)
        self.assertLess(fs.technical_score(self.BEAR), 0)

    def test_empty_payload_scores_zero(self):
        self.assertEqual(fs.technical_score({}), 0)
        self.assertEqual(fs.technical_score(None), 0)

    def test_partial_payload_still_scores(self):
        # Ticker baru IPO cuma punya sebagian indikator; ia tetap harus dapat
        # skor, bukan 0 yang menyesatkan (0 berarti "netral", bukan "tak tahu").
        self.assertNotEqual(fs.technical_score({"rsi": 20.0}), 0)

    def test_parts_are_named_and_bounded_by_their_weight(self):
        parts = fs.technical_parts(self.BULL)
        self.assertTrue(set(parts).issubset(set(fs.TECH_WEIGHTS)))
        for name, value in parts.items():
            self.assertLessEqual(abs(value), fs.TECH_WEIGHTS[name] + 1e-9, name)

    def test_score_stays_within_bounds_at_extremes(self):
        extreme = dict(self.BULL, rsi=0.0, stoch={"k": 0.0}, bollinger={"pctB": 0.0},
                       macd={"hist": 999.0}, obvSlope=5.0)
        self.assertTrue(-100 <= fs.technical_score(extreme) <= 100)

    def test_weights_sum_to_one_hundred(self):
        # Kalau totalnya bukan 100, hasilnya berhenti terbaca sebagai -100..+100.
        self.assertEqual(sum(fs.TECH_WEIGHTS.values()), 100)

    def test_rsi_contribution_is_continuous_across_thirty(self):
        # Regresi: rumus lama melompat dari +16 ke +40 tepat di RSI 30, jadi
        # dua saham yang nyaris identik bisa terpaut 24 poin.
        just_above = fs.technical_parts({"rsi": 30.5})["rsi"]
        just_below = fs.technical_parts({"rsi": 29.5})["rsi"]
        self.assertLess(abs(just_above - just_below), 1.0)

    def test_weak_adx_dampens_trend_contribution(self):
        strong = fs.technical_parts(dict(self.BULL, adx={"adx": 35.0}))["trend"]
        weak = fs.technical_parts(dict(self.BULL, adx={"adx": 12.0}))["trend"]
        self.assertGreater(strong, weak)


class JRound(unittest.TestCase):
    def test_rounds_half_up_like_javascript(self):
        # round() Python membulatkan ke genap: round(0.5) == 0, round(2.5) == 2.
        self.assertEqual(fs.jround(0.5), 1)
        self.assertEqual(fs.jround(2.5), 3)
        self.assertEqual(fs.jround(-0.5), 0)
        self.assertEqual(fs.jround(1.4), 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
