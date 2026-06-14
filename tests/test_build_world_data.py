#!/usr/bin/env python3
"""
Unit test untuk scripts/build_world_data.py (generator dataset dunia 3D).

Memastikan skoring (komposit, adjust etis, verdict Aksi) tetap CERMIN
js/signals.js + js/advice.js, plus invarian struktural file yang dihasilkan.

Jalankan dari root repo:
    python -m unittest discover -s tests -v
"""
import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import build_world_data as bw  # noqa: E402

WORLD_JS = ROOT / "data" / "world-data.js"
REQUIRED_ROW_KEYS = {
    "t", "n", "sec", "tie", "why", "dy", "cap", "sig",
    "comp", "adjB", "adjL", "adjS", "act", "vscore",
    "price", "target", "upside", "rating", "nA", "rMean",
}
ACTIONS = {"STRONG_BUY", "BUY", "HOLD", "REDUCE", "AVOID"}

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
    ticker: "FLG", name: "Flagged \\"Giant\\" Co", sector: "Energy",
    ethics: {
      israelTie: "high",
      rationale: "kontrak militer",
      sources: ["y"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1500 },
    signals: { technical: 36, momentum: 24, sentiment: 78, news: 0, policy: 0, profile: 65, valuation: -14 }
  }
];
"""


class JRound(unittest.TestCase):
    """JS Math.round = setengah ke arah +tak hingga (bukan banker's rounding)."""
    def test_half_up(self):
        self.assertEqual(bw.jround(60.325), 60)
        self.assertEqual(bw.jround(2.5), 3)
        self.assertEqual(bw.jround(0.5), 1)

    def test_negative_half_toward_pos_inf(self):
        self.assertEqual(bw.jround(-0.5), 0)
        self.assertEqual(bw.jround(-1.5), -1)


class CompositeSignal(unittest.TestCase):
    def test_aapl_known_value(self):
        # AAPL signals nyata → komposit 60 (sama dengan js/signals.js & shipped design)
        sig = {"technical": 42, "momentum": -9, "sentiment": 51,
               "news": 0, "policy": 15, "profile": 65, "valuation": -31}
        self.assertEqual(bw.composite_signal(sig), 60)

    def test_all_zero_is_50(self):
        self.assertEqual(bw.composite_signal({k: 0 for k in bw.SIG_KEYS}), 50)

    def test_missing_keys_default_zero(self):
        self.assertEqual(bw.composite_signal({}), 50)


class EthicsAdjusted(unittest.TestCase):
    def test_high_excluded_in_strict_and_balanced(self):
        self.assertIsNone(bw.ethics_adjusted(64, "high", "strict"))
        self.assertIsNone(bw.ethics_adjusted(64, "high", "balanced"))

    def test_high_visible_in_loose_no_penalty(self):
        self.assertEqual(bw.ethics_adjusted(64, "high", "loose"), 64)

    def test_medium_penalty_balanced(self):
        # AAPL: comp 60, tie medium → balanced 35 (penalti 25)
        self.assertEqual(bw.ethics_adjusted(60, "medium", "balanced"), 35)

    def test_loose_zero_penalty(self):
        self.assertEqual(bw.ethics_adjusted(60, "medium", "loose"), 60)

    def test_floor_at_zero(self):
        self.assertEqual(bw.ethics_adjusted(10, "medium", "balanced"), 0)


class UpsideAndRound(unittest.TestCase):
    def test_upside_basic(self):
        self.assertAlmostEqual(bw.upside_pct({"price": 100, "targetMean": 130}), 30.0)

    def test_upside_none_when_no_target_or_price(self):
        self.assertIsNone(bw.upside_pct({"price": 100, "targetMean": None}))
        self.assertIsNone(bw.upside_pct({"price": None, "targetMean": 130}))
        self.assertIsNone(bw.upside_pct(None))

    def test_round1_int_when_whole(self):
        v = bw.round1(31.003)
        self.assertEqual(v, 31)
        self.assertIsInstance(v, int)

    def test_round1_one_decimal(self):
        self.assertEqual(bw.round1(7.4158), 7.4)

    def test_round1_none(self):
        self.assertIsNone(bw.round1(None))


class ActionVerdict(unittest.TestCase):
    def test_excluded_is_avoid_minus99(self):
        act, vs = bw.action_verdict(64, None, {"valuation": 0, "technical": 0}, {"price": 1, "targetMean": 2})
        self.assertEqual((act, vs), ("AVOID", -99))

    def test_strong_buy_stacks_points(self):
        sig = {"valuation": 0, "technical": 0}
        an = {"price": 100, "targetMean": 130, "numAnalysts": 10, "ratingMean": 1.5}
        # comp 70 (+2) + analis 1.5 (+2) + upside 30 (+2) = 6 → STRONG_BUY
        act, vs = bw.action_verdict(70, 70, sig, an)
        self.assertEqual(act, "STRONG_BUY")
        self.assertGreaterEqual(vs, 4)

    def test_hold_when_ratingmean_missing(self):
        # JPM-like: comp 62, banyak analis tapi ratingMean None → tak ada poin analis
        sig = {"valuation": 19, "technical": 35}
        an = {"price": 320.72, "targetMean": 342.19, "numAnalysts": 21, "ratingMean": None}
        act, vs = bw.action_verdict(62, 37, sig, an)
        self.assertEqual((act, vs), ("HOLD", 1))


class ParseStocks(unittest.TestCase):
    def setUp(self):
        self.rows = bw.parse_stocks(SAMPLE_STOCKS)

    def test_count(self):
        self.assertEqual(len(self.rows), 2)

    def test_fields(self):
        tst = self.rows[0]
        self.assertEqual(tst["t"], "TST")
        self.assertEqual(tst["n"], "Test Co")
        self.assertEqual(tst["sec"], "Tech")
        self.assertEqual(tst["tie"], "none")
        self.assertEqual(tst["why"], "tidak ada keterlibatan")
        self.assertEqual(tst["dy"], 0.5)
        self.assertEqual(tst["cap"], 100)
        self.assertEqual(tst["sig"]["profile"], 60)
        self.assertEqual(tst["sig"]["valuation"], -10)

    def test_escaped_quotes_in_name(self):
        # name FLG mengandung tanda kutip yang di-escape
        self.assertEqual(self.rows[1]["n"], 'Flagged "Giant" Co')

    def test_high_tie_parsed(self):
        self.assertEqual(self.rows[1]["tie"], "high")
        self.assertEqual(self.rows[1]["cap"], 1500)


class BuildRowsAndForever(unittest.TestCase):
    def setUp(self):
        stocks = bw.parse_stocks(SAMPLE_STOCKS)
        analyst = {
            "TST": {"price": 100, "targetMean": 125, "numAnalysts": 8,
                    "ratingMean": 1.6, "rating": "strong_buy"},
            "FLG": {"price": 200, "targetMean": 280, "numAnalysts": 30,
                    "ratingMean": 1.3, "rating": "strong_buy"},
        }
        self.rows = bw.build_rows(stocks, analyst)
        self.by = {r["t"]: r for r in self.rows}

    def test_all_required_keys(self):
        for r in self.rows:
            self.assertEqual(set(r.keys()), REQUIRED_ROW_KEYS, f"key mismatch for {r['t']}")

    def test_flagged_excluded_scores(self):
        flg = self.by["FLG"]
        self.assertIsNone(flg["adjB"])
        self.assertIsNone(flg["adjS"])
        self.assertIsNotNone(flg["adjL"])      # loose tetap tampil
        self.assertEqual(flg["act"], "AVOID")
        self.assertEqual(flg["vscore"], -99)
        # upside tetap dihitung walau dikecualikan
        self.assertEqual(flg["upside"], 40)

    def test_clean_row_action(self):
        tst = self.by["TST"]
        self.assertIn(tst["act"], ACTIONS)
        self.assertEqual(tst["adjB"], tst["adjL"])   # tie none → tanpa penalti

    def test_build_forever_filters_and_sorts(self):
        rows = [
            {"t": "A", "tie": "none", "comp": 80, "dy": 2.0, "cap": 10, "sig": {"profile": 70}},
            {"t": "B", "tie": "low",  "comp": 90, "dy": 0.0, "cap": 300, "sig": {"profile": 65}},
            {"t": "C", "tie": "high", "comp": 95, "dy": 5.0, "cap": 500, "sig": {"profile": 90}},  # excluded
            {"t": "D", "tie": "none", "comp": 70, "dy": 0.0, "cap": 10, "sig": {"profile": 80}},   # fails liquidity
            {"t": "E", "tie": "none", "comp": 60, "dy": 3.0, "cap": 50, "sig": {"profile": 40}},   # fails quality
        ]
        forever = bw.build_forever(rows, max_n=10)
        self.assertEqual(forever, ["B", "A"])  # B (adjS 85) before A (adjS 80); C/D/E filtered out


class GeneratedFileInvariants(unittest.TestCase):
    """Validasi file data/world-data.js yang sudah ter-generate (jika ada)."""
    @classmethod
    def setUpClass(cls):
        if not WORLD_JS.exists():
            raise unittest.SkipTest("data/world-data.js belum di-generate")
        raw = WORLD_JS.read_text(encoding="utf-8")
        dm = re.search(r"window\.WORLD_DATA\s*=\s*(\[.*?\]);", raw, re.DOTALL)
        mm = re.search(r"window\.WORLD_META\s*=\s*(\{.*?\});", raw, re.DOTALL)
        cls.rows = json.loads(dm.group(1))
        cls.meta = json.loads(mm.group(1))

    def test_nonempty(self):
        self.assertGreater(len(self.rows), 0)

    def test_every_row_has_keys(self):
        for r in self.rows[:50]:
            self.assertEqual(set(r.keys()), REQUIRED_ROW_KEYS)
        self.assertEqual(set(self.rows[-1].keys()), REQUIRED_ROW_KEYS)

    def test_score_ranges_and_actions(self):
        for r in self.rows:
            self.assertTrue(0 <= r["comp"] <= 100)
            self.assertIn(r["act"], ACTIONS)
            for key in ("adjB", "adjL", "adjS"):
                self.assertTrue(r[key] is None or 0 <= r[key] <= 100)

    def test_meta_counts_consistent(self):
        self.assertEqual(self.meta["total"], len(self.rows))
        self.assertEqual(self.meta["flagged"], sum(1 for r in self.rows if r["tie"] == "high"))
        self.assertEqual(self.meta["clean"], sum(1 for r in self.rows if r["tie"] in bw.CLEAN_TIES))
        self.assertEqual(self.meta["opps"], sum(1 for r in self.rows if r["act"] in ("BUY", "STRONG_BUY")))

    def test_forever_subset_and_capped(self):
        tickers = {r["t"] for r in self.rows}
        self.assertLessEqual(len(self.meta["forever"]), 10)
        for t in self.meta["forever"]:
            self.assertIn(t, tickers)


if __name__ == "__main__":
    unittest.main(verbosity=2)
