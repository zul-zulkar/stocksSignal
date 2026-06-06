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


class ValuationScore(unittest.TestCase):
    def test_cheap_is_positive(self):
        self.assertGreater(fs.valuation_score({"forwardPE": 10}), 0)

    def test_expensive_is_negative(self):
        self.assertLess(fs.valuation_score({"forwardPE": 40}), 0)

    def test_missing_returns_zero(self):
        self.assertEqual(fs.valuation_score({}), 0)
        self.assertEqual(fs.valuation_score({"forwardPE": -5}), 0)


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

    def test_rsi_uptrend_high(self):
        up = pd.Series([100 + i for i in range(60)])
        self.assertGreater(fs.rsi(up), 70)

    def test_rsi_downtrend_low(self):
        down = pd.Series([200 - i for i in range(60)])
        self.assertLess(fs.rsi(down), 30)

    def test_technical_trend_direction(self):
        up = self._series([100 + i for i in range(220)])
        down = self._series([400 - i for i in range(220)])
        self.assertGreater(fs.technical_score(up), fs.technical_score(down))

    def test_technical_short_history_zero(self):
        self.assertEqual(fs.technical_score(self._series([1, 2, 3])), 0)

    def test_momentum_outperform_positive(self):
        stock = self._series([100 * (1.5 ** (i / 126)) for i in range(130)])
        bench = self._series([100 for _ in range(130)])
        self.assertGreater(fs.momentum_score(stock, bench), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
