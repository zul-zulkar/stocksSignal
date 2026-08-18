#!/usr/bin/env python3
"""
Unit test untuk scripts/build_indicators.py.

Hanya menguji logika murni — pembulatan, pembuangan entri kosong, penguraian
file lama, parsing argumen. Bagian yang menyentuh jaringan (yfinance) tidak
diuji di sini; itu yang membuat suite ini bisa jalan di CI tanpa kuota Yahoo.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import build_indicators as bi  # noqa: E402


class Rounding(unittest.TestCase):
    def test_uses_per_key_precision(self):
        self.assertEqual(bi._round("rsi", 32.891234), 32.9)       # osilator → 1 desimal
        self.assertEqual(bi._round("line", -4.3658554), -4.366)   # MACD → 3 desimal
        self.assertEqual(bi._round("obvSlope", -0.2746768), -0.275)

    def test_unknown_key_falls_back_to_two_decimals(self):
        self.assertEqual(bi._round("ema20", 105.005980), 105.01)

    def test_leaves_non_numbers_alone(self):
        self.assertEqual(bi._round("state", "golden"), "golden")
        self.assertIs(bi._round("squeeze", True), True)
        self.assertIsNone(bi._round("whatever", None))

    def test_leaves_ints_exact(self):
        # daysSince dan level adalah hitungan, bukan pengukuran.
        self.assertEqual(bi._round("daysSince", 61), 61)
        self.assertEqual(bi._round("level", 2), 2)

    def test_bool_is_not_treated_as_int(self):
        # bool adalah subclass int di Python; kalau urutan cek salah,
        # True akan lolos ke round() dan keluar sebagai 1.
        self.assertIs(bi._round("squeeze", False), False)


class Compact(unittest.TestCase):
    def test_drops_none_values(self):
        out = bi.compact({"rsi": 50.0, "sma200": None, "ema20": 12.345})
        self.assertEqual(set(out), {"rsi", "ema20"})

    def test_drops_nested_none_and_empty_groups(self):
        out = bi.compact({
            "macd": {"line": None, "signal": None, "hist": None},
            "adx": {"adx": 25.55, "plusDI": None, "minusDI": None},
        })
        self.assertNotIn("macd", out)          # seluruh grup kosong → hilang
        self.assertEqual(out["adx"], {"adx": 25.6})

    def test_drops_raw_obv(self):
        # OBV mentah skalanya ikut ukuran saham → tak berguna lintas-ticker.
        out = bi.compact({"obv": 9021704.17, "obvSlope": -0.2746768})
        self.assertNotIn("obv", out)
        self.assertIn("obvSlope", out)

    def test_keeps_false_and_zero(self):
        # Regresi: penyaring "if value" naif akan membuang keduanya.
        out = bi.compact({"squeeze": False, "hist": 0.0, "pct": 0.0})
        self.assertIs(out["squeeze"], False)
        self.assertEqual(out["hist"], 0.0)
        self.assertEqual(out["pct"], 0.0)

    def test_output_is_json_serialisable(self):
        payload = json.dumps(bi.compact({"rsi": 32.9, "cross": {"state": "golden", "daysSince": 61}}))
        self.assertIn("golden", payload)


class ParseLimit(unittest.TestCase):
    def test_space_separated(self):
        self.assertEqual(bi.parse_limit(["--limit", "5"]), 5)

    def test_equals_form(self):
        self.assertEqual(bi.parse_limit(["--limit=7"]), 7)

    def test_absent_is_none(self):
        self.assertIsNone(bi.parse_limit([]))
        self.assertIsNone(bi.parse_limit(["--other"]))

    def test_garbage_is_none_not_crash(self):
        self.assertIsNone(bi.parse_limit(["--limit", "abc"]))
        self.assertIsNone(bi.parse_limit(["--limit="]))


class LoadExisting(unittest.TestCase):
    def _with_file(self, text):
        tmp = Path(tempfile.mkdtemp()) / "indicators.js"
        tmp.write_text(text, encoding="utf-8")
        return mock.patch.object(bi, "INDICATORS_JS", tmp)

    def test_reads_previous_payload(self):
        body = (
            "// header\n"
            'window.INDICATORS_META = {"tickers": 1};\n'
            'window.STOCK_INDICATORS = {"AAPL":{"rsi":55.0}};\n'
        )
        with self._with_file(body):
            self.assertEqual(bi.load_existing(), {"AAPL": {"rsi": 55.0}})

    def test_missing_file_is_empty_dict(self):
        with mock.patch.object(bi, "INDICATORS_JS", Path("/nonexistent/x.js")):
            self.assertEqual(bi.load_existing(), {})

    def test_corrupt_file_is_empty_dict_not_crash(self):
        # File rusak setengah jalan harus memulai bersih, bukan menjatuhkan run.
        with self._with_file("window.STOCK_INDICATORS = {broken"):
            self.assertEqual(bi.load_existing(), {})


class LoadTargets(unittest.TestCase):
    def _with_file(self, text):
        tmp = Path(tempfile.mkdtemp()) / "analyst.js"
        tmp.write_text(text, encoding="utf-8")
        return mock.patch.object(bi, "ANALYST_JS", tmp)

    def test_extracts_target_mean(self):
        body = 'window.STOCK_ANALYST = {"AAPL":{"targetMean":322.28},"MSFT":{"targetMean":567.2}};\n'
        with self._with_file(body):
            self.assertEqual(bi.load_targets(), {"AAPL": 322.28, "MSFT": 567.2})

    def test_skips_entries_without_target(self):
        body = 'window.STOCK_ANALYST = {"AAPL":{"targetMean":null},"MSFT":{"targetMean":567.2}};\n'
        with self._with_file(body):
            self.assertEqual(bi.load_targets(), {"MSFT": 567.2})

    def test_missing_file_is_empty(self):
        with mock.patch.object(bi, "ANALYST_JS", Path("/nonexistent/a.js")):
            self.assertEqual(bi.load_targets(), {})


class WriteFile(unittest.TestCase):
    def test_writes_parseable_globals(self):
        tmp = Path(tempfile.mkdtemp()) / "indicators.js"
        with mock.patch.object(bi, "INDICATORS_JS", tmp):
            bi.write_file({"AAPL": {"rsi": 55.0}}, updated=1, failed=[])
        text = tmp.read_text(encoding="utf-8")
        self.assertIn("window.STOCK_INDICATORS", text)
        self.assertIn("window.INDICATORS_META", text)
        # Harus bisa dibaca kembali oleh load_existing().
        with mock.patch.object(bi, "INDICATORS_JS", tmp):
            self.assertEqual(bi.load_existing(), {"AAPL": {"rsi": 55.0}})

    def test_round_trips_through_load_existing(self):
        # Uji siklus penuh: --limit tidak boleh menghapus ticker lain.
        tmp = Path(tempfile.mkdtemp()) / "indicators.js"
        with mock.patch.object(bi, "INDICATORS_JS", tmp):
            bi.write_file({"AAPL": {"rsi": 55.0}, "MSFT": {"rsi": 61.0}}, 2, [])
            existing = bi.load_existing()
            existing["AAPL"] = {"rsi": 40.0}
            bi.write_file(existing, 1, [])
            final = bi.load_existing()
        self.assertEqual(final["AAPL"]["rsi"], 40.0)
        self.assertEqual(final["MSFT"]["rsi"], 61.0, "ticker yang tak diproses harus tetap ada")

    def test_truncates_failed_list(self):
        # 900 ticker gagal tidak boleh membengkakkan file dengan daftar nama.
        tmp = Path(tempfile.mkdtemp()) / "indicators.js"
        with mock.patch.object(bi, "INDICATORS_JS", tmp):
            bi.write_file({"A": {}}, 1, [f"T{i}" for i in range(500)])
        meta = json.loads(
            tmp.read_text(encoding="utf-8").split("window.INDICATORS_META = ")[1].split(";\n")[0]
        )
        self.assertEqual(len(meta["failed"]), 20)


if __name__ == "__main__":
    unittest.main()
