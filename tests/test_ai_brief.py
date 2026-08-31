#!/usr/bin/env python3
"""
Unit test untuk scripts/ai_brief.py dan scripts/ai_provider.py.

Tidak ada satu pun panggilan jaringan di sini — providernya di-stub. Yang
diuji adalah bagian yang benar-benar bisa rusak diam-diam: pemilihan tingkat,
kontrol biaya lewat hash, penyusunan payload, dan yang terpenting, safeguard
"jangan pernah timpa data valid dengan hasil run yang gagal".
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import ai_brief as ab  # noqa: E402
import ai_provider as ap  # noqa: E402


SAMPLE_STOCKS = """\
window.STOCK_UNIVERSE = [
  {
    ticker: "AAA", name: "Alpha Corp", sector: "Technology",
    ethics: { israelTie: "none", rationale: "x", sources: ["s"], palestineSupport: "none" },
    fundamentals: { dividendYield: 0.5, payoutRatio: 15, marketCapB: 100 },
    signals: { technical: 40, momentum: 30, sentiment: 50, news: 10, policy: 15, profile: 70, valuation: 20 }
  },
  {
    ticker: "BBB", name: "Beta Inc", sector: "Energy",
    ethics: { israelTie: "high", rationale: "y", sources: ["s"], palestineSupport: "none" },
    fundamentals: { dividendYield: 2.0, payoutRatio: 40, marketCapB: 50 },
    signals: { technical: -20, momentum: -10, sentiment: 0, news: 0, policy: 0, profile: 30, valuation: 0 }
  },
  {
    ticker: "CCC", name: "Gamma Ltd", sector: "Technology",
    ethics: { israelTie: "low", rationale: "z", sources: ["s"], palestineSupport: "none" },
    fundamentals: { dividendYield: 1.0, payoutRatio: 20, marketCapB: 80 },
    signals: { technical: 5, momentum: 5, sentiment: 5, news: 5, policy: 5, profile: 40, valuation: 5 }
  }
];
"""


class StubProvider:
    """Provider palsu: mencatat apa yang diminta, memulangkan brief valid."""

    name = "stub"
    available = True

    def __init__(self, fail_all=False):
        self.calls = []
        self.fail_all = fail_all

    def _brief(self, ticker):
        return {
            "ringkasan": f"Ringkasan {ticker}.", "teknikal": "T.", "fundamental": "F.",
            "sentimen": "S.", "katalis": ["k"], "risiko": ["r"],
            "levelKunci": {"support": 1.0, "resisten": 2.0},
            "keyakinan": "sedang", "horizon": "menengah",
        }

    def brief(self, payload, schema, model=None):
        return None if self.fail_all else self._brief(payload["ticker"])

    def batch(self, payloads, schema, model=None):
        self.calls.append({"model": model, "tickers": sorted(payloads)})
        if self.fail_all:
            return {}
        return {t: self._brief(t) for t in payloads}


class ParseUniverse(unittest.TestCase):
    def test_extracts_all_fields(self):
        u = ab.parse_universe(SAMPLE_STOCKS)
        self.assertEqual(set(u), {"AAA", "BBB", "CCC"})
        self.assertEqual(u["AAA"]["name"], "Alpha Corp")
        self.assertEqual(u["AAA"]["sector"], "Technology")
        self.assertEqual(u["BBB"]["israelTie"], "high")
        self.assertEqual(u["AAA"]["signals"]["technical"], 40)
        self.assertEqual(u["AAA"]["signals"]["valuation"], 20)

    def test_handles_negative_signal_values(self):
        self.assertEqual(ab.parse_universe(SAMPLE_STOCKS)["BBB"]["signals"]["technical"], -20)

    def test_empty_text_is_empty_dict(self):
        self.assertEqual(ab.parse_universe(""), {})


class Composite(unittest.TestCase):
    def test_matches_js_signals_weighting(self):
        # Semua nol → tepat 50, sama seperti compositeSignal() di js/signals.js.
        self.assertEqual(ab.composite({k: 0 for k in
                                       ("technical", "momentum", "sentiment", "news",
                                        "policy", "profile", "valuation")}), 50)

    def test_all_max_is_hundred(self):
        self.assertEqual(ab.composite({k: 100 for k in
                                       ("technical", "momentum", "sentiment", "news",
                                        "policy", "profile", "valuation")}), 100)

    def test_empty_is_none(self):
        self.assertIsNone(ab.composite({}))


class BuildPayload(unittest.TestCase):
    def setUp(self):
        self.stock = ab.parse_universe(SAMPLE_STOCKS)["AAA"]

    def test_includes_core_context(self):
        p = ab.build_payload(self.stock, {}, {}, {})
        self.assertEqual(p["ticker"], "AAA")
        self.assertEqual(p["etika"]["afiliasiIsrael"], "none")
        self.assertIn("skorKomposit", p)
        self.assertIn("tujuhFaktor", p)

    def test_trims_indicators_to_useful_subset(self):
        # Mengirim seluruh dict indikator mentah menaikkan biaya token tanpa
        # menambah apa pun yang bisa dipakai model.
        p = ab.build_payload(self.stock, {"rsi": 55, "obv": 12345678, "ema20": 9}, {}, {})
        self.assertIn("rsi", p["indikator"])
        self.assertNotIn("obv", p["indikator"])
        self.assertNotIn("ema20", p["indikator"])

    def test_omits_empty_sections(self):
        p = ab.build_payload(self.stock, {}, {}, {})
        self.assertNotIn("indikator", p)
        self.assertNotIn("fundamental", p)
        self.assertNotIn("analis", p)

    def test_omits_analyst_without_coverage(self):
        p = ab.build_payload(self.stock, {}, {}, {"numAnalysts": 0})
        self.assertNotIn("analis", p)


class ContentHash(unittest.TestCase):
    def test_stable_across_key_order(self):
        # Tanpa sort_keys, tiap run terlihat berubah dan --only-changed
        # kehilangan seluruh manfaatnya.
        a = ab.content_hash({"x": 1, "y": {"b": 2, "a": 3}})
        b = ab.content_hash({"y": {"a": 3, "b": 2}, "x": 1})
        self.assertEqual(a, b)

    def test_changes_when_content_changes(self):
        self.assertNotEqual(ab.content_hash({"rsi": 50}), ab.content_hash({"rsi": 51}))


class SelectTop(unittest.TestCase):
    def setUp(self):
        self.universe = ab.parse_universe(SAMPLE_STOCKS)
        self.payloads = {t: {} for t in self.universe}

    def test_picks_highest_composite(self):
        top = ab.select_top(self.universe, self.payloads, top_n=1)
        self.assertEqual(top, {"AAA"})

    def test_excludes_ethics_high(self):
        # BBB dikecualikan filter etis — menganalisisnya dalam-dalam itu
        # membakar uang untuk saham yang tidak akan pernah muncul.
        top = ab.select_top(self.universe, self.payloads, top_n=99)
        self.assertNotIn("BBB", top)

    def test_respects_top_n(self):
        self.assertEqual(len(ab.select_top(self.universe, self.payloads, top_n=2)), 2)


class Tiering(unittest.TestCase):
    """Alur main(): tingkat mana dapat model mana, dan apa yang ditulis."""

    def _run(self, argv, previous=None, provider=None):
        tmp = Path(tempfile.mkdtemp())
        (tmp / "stocks.js").write_text(SAMPLE_STOCKS, encoding="utf-8")
        brief_js = tmp / "ai-brief.js"
        if previous is not None:
            brief_js.write_text(
                "window.AI_BRIEF = " + json.dumps(previous) + ";\n", encoding="utf-8")
        prov = provider or StubProvider()
        with mock.patch.object(ab, "STOCKS_JS", tmp / "stocks.js"), \
             mock.patch.object(ab, "AI_BRIEF_JS", brief_js), \
             mock.patch.object(ab, "INDICATORS_JS", tmp / "nope-ind.js"), \
             mock.patch.object(ab, "FUNDAMENTALS_JS", tmp / "nope-fund.js"), \
             mock.patch.object(ab, "ANALYST_JS", tmp / "nope-an.js"), \
             mock.patch.object(ap, "get_provider", lambda *a, **k: prov), \
             mock.patch.object(sys, "argv", ["ai_brief.py"] + argv):
            rc = ab.main()
        return rc, prov, brief_js

    def _written(self, path):
        raw = path.read_text(encoding="utf-8")
        return json.loads(raw.split("window.AI_BRIEF = ")[1].rstrip().rstrip(";\n").rstrip(";"))

    def test_top_stocks_get_the_stronger_model(self):
        rc, prov, path = self._run(["--top", "1"])
        self.assertEqual(rc, 0)
        by_model = {c["model"]: c["tickers"] for c in prov.calls}
        self.assertEqual(by_model[ap.TOP_MODEL], ["AAA"])
        self.assertEqual(by_model[ap.BULK_MODEL], ["BBB", "CCC"])

    def test_every_brief_records_its_provenance(self):
        # UI harus bisa menandai dengan jujur dari mana narasi itu datang.
        _, _, path = self._run(["--top", "1"])
        data = self._written(path)
        self.assertEqual(data["AAA"]["tier"], 2)
        self.assertEqual(data["AAA"]["model"], ap.TOP_MODEL)
        self.assertEqual(data["CCC"]["tier"], 1)
        self.assertEqual(data["AAA"]["sumber"], "ai")
        self.assertIn("hash", data["AAA"])

    def test_unchanged_tickers_are_skipped(self):
        _, _, path = self._run(["--top", "1"])
        first = self._written(path)
        # Jalankan lagi dengan hasil sebelumnya sebagai masukan.
        _, prov2, _ = self._run(["--top", "1"], previous=first)
        self.assertEqual(prov2.calls, [], "seharusnya tidak memanggil API sama sekali")

    def test_all_flag_reprocesses_everything(self):
        _, _, path = self._run(["--top", "1"])
        first = self._written(path)
        _, prov2, _ = self._run(["--top", "1", "--all"], previous=first)
        self.assertTrue(prov2.calls, "--all harus memaksa proses ulang")

    def test_changed_ticker_is_reprocessed(self):
        _, _, path = self._run(["--top", "1"])
        first = self._written(path)
        first["AAA"]["hash"] = "berubah"
        _, prov2, _ = self._run(["--top", "1"], previous=first)
        processed = {t for c in prov2.calls for t in c["tickers"]}
        self.assertEqual(processed, {"AAA"})

    def test_previous_briefs_are_preserved(self):
        # --limit tidak boleh menghapus brief ticker lain.
        _, _, path = self._run(["--limit", "1", "--top", "1"],
                               previous={"ZZZ": {"ringkasan": "lama", "hash": "h"}})
        data = self._written(path)
        self.assertIn("ZZZ", data)
        self.assertIn("AAA", data)

    def test_limit_restricts_work(self):
        _, prov, _ = self._run(["--limit", "1"])
        processed = {t for c in prov.calls for t in c["tickers"]}
        self.assertEqual(processed, {"AAA"})


class Safeguards(unittest.TestCase):
    def _run_with(self, provider):
        tmp = Path(tempfile.mkdtemp())
        (tmp / "stocks.js").write_text(SAMPLE_STOCKS, encoding="utf-8")
        brief_js = tmp / "ai-brief.js"
        brief_js.write_text('window.AI_BRIEF = {"OLD":{"ringkasan":"valid"}};\n', encoding="utf-8")
        with mock.patch.object(ab, "STOCKS_JS", tmp / "stocks.js"), \
             mock.patch.object(ab, "AI_BRIEF_JS", brief_js), \
             mock.patch.object(ab, "INDICATORS_JS", tmp / "x.js"), \
             mock.patch.object(ab, "FUNDAMENTALS_JS", tmp / "y.js"), \
             mock.patch.object(ab, "ANALYST_JS", tmp / "z.js"), \
             mock.patch.object(ap, "get_provider", lambda *a, **k: provider), \
             mock.patch.object(sys, "argv", ["ai_brief.py"]):
            rc = ab.main()
        return rc, brief_js.read_text(encoding="utf-8")

    def test_missing_api_key_exits_clean_without_touching_data(self):
        # Pola yang sama seperti fetch_signals.py: jangan pernah menimpa data
        # valid dengan hasil run yang gagal.
        rc, text = self._run_with(ap.NullProvider())
        self.assertEqual(rc, 0)
        self.assertIn('"OLD"', text, "data lama harus utuh")

    def test_all_calls_failing_leaves_data_untouched(self):
        rc, text = self._run_with(StubProvider(fail_all=True))
        self.assertEqual(rc, 0)
        self.assertIn('"OLD"', text)


class Schema(unittest.TestCase):
    def test_matches_narrate_output_shape(self):
        # Satu bentuk, satu komponen render di UI — apa pun sumbernya.
        from_narrate = {"ringkasan", "teknikal", "fundamental", "sentimen", "katalis",
                        "risiko", "levelKunci", "keyakinan", "horizon"}
        self.assertEqual(set(ab.BRIEF_SCHEMA["properties"]), from_narrate)

    def test_all_fields_required_and_closed(self):
        # Field opsional berarti UI harus menangani bentuk yang berubah-ubah.
        self.assertEqual(set(ab.BRIEF_SCHEMA["required"]),
                         set(ab.BRIEF_SCHEMA["properties"]))
        self.assertIs(ab.BRIEF_SCHEMA["additionalProperties"], False)

    def test_confidence_is_constrained_to_known_values(self):
        self.assertEqual(ab.BRIEF_SCHEMA["properties"]["keyakinan"]["enum"],
                         ["tinggi", "sedang", "rendah"])

    def test_system_prompt_forbids_inventing_numbers(self):
        # Aturan paling penting di prompt; kalau hilang, brief-nya jadi fiksi
        # yang terdengar meyakinkan.
        self.assertIn("Jangan menebak", ab.SYSTEM_PROMPT)
        self.assertIn("nasihat investasi", ab.SYSTEM_PROMPT)


class ProviderSelection(unittest.TestCase):
    def test_null_provider_by_name(self):
        self.assertIsInstance(ap.get_provider("null", "sys"), ap.NullProvider)

    def test_anthropic_is_default(self):
        self.assertIsInstance(ap.get_provider("", "sys"), ap.AnthropicProvider)

    def test_unknown_provider_raises(self):
        with self.assertRaises(ap.ProviderError):
            ap.get_provider("ollama-belum-ada", "sys")

    def test_anthropic_unavailable_without_key(self):
        p = ap.AnthropicProvider("sys", api_key=None)
        with mock.patch.dict("os.environ", {}, clear=True):
            self.assertFalse(ap.AnthropicProvider("sys").available)
        self.assertFalse(p.available or bool(p._key))

    def test_null_provider_returns_nothing(self):
        p = ap.NullProvider()
        self.assertIsNone(p.brief({}, {}))
        self.assertEqual(p.batch({"A": {}}, {}), {})


class RequestParams(unittest.TestCase):
    def setUp(self):
        self.p = ap.AnthropicProvider("SYSTEM", api_key="sk-test")

    def test_forces_structured_output(self):
        # Bentuk keluaran dipaksa schema, bukan diminta lewat prosa —
        # parsing JSON dari teks bebas adalah sumber kegagalan paling sering.
        params = self.p._request_params({"ticker": "A"}, {"type": "object"}, ap.BULK_MODEL)
        self.assertEqual(params["output_config"]["format"]["type"], "json_schema")

    def test_caches_the_shared_system_prompt(self):
        # Dikirim 984 kali per run; hanya perlu dibayar penuh sekali.
        params = self.p._request_params({}, {}, ap.BULK_MODEL)
        self.assertEqual(params["system"][0]["cache_control"], {"type": "ephemeral"})

    def test_disables_thinking_on_models_where_it_defaults_on(self):
        # Sonnet 5 menjalankan adaptive thinking secara default; untuk tugas
        # merangkum angka yang sudah lengkap itu biaya tanpa imbalan.
        sonnet = self.p._request_params({}, {}, "claude-sonnet-5")
        self.assertEqual(sonnet["thinking"], {"type": "disabled"})
        self.assertEqual(sonnet["output_config"]["effort"], "low")

    def test_leaves_haiku_alone(self):
        # Haiku 4.5 tidak menerima parameter effort.
        haiku = self.p._request_params({}, {}, "claude-haiku-4-5")
        self.assertNotIn("thinking", haiku)
        self.assertNotIn("effort", haiku["output_config"])

    def test_bounded_output_tokens(self):
        self.assertLessEqual(self.p._request_params({}, {}, ap.BULK_MODEL)["max_tokens"], 2000)


class ResponseParsing(unittest.TestCase):
    class _Block:
        def __init__(self, text):
            self.type = "text"
            self.text = text

    class _Msg:
        def __init__(self, blocks, stop_reason="end_turn"):
            self.content = blocks
            self.stop_reason = stop_reason

    def test_parses_valid_json(self):
        msg = self._Msg([self._Block('{"ringkasan":"halo"}')])
        self.assertEqual(ap._parse_response(msg), {"ringkasan": "halo"})

    def test_refusal_returns_none_without_indexing_content(self):
        # Klasifikator keamanan bisa menolak dengan content kosong; membaca
        # content[0] tanpa cek akan meledak.
        self.assertIsNone(ap._parse_response(self._Msg([], stop_reason="refusal")))

    def test_malformed_json_returns_none(self):
        self.assertIsNone(ap._parse_response(self._Msg([self._Block("bukan json")])))

    def test_empty_content_returns_none(self):
        self.assertIsNone(ap._parse_response(self._Msg([])))
        self.assertIsNone(ap._parse_response(None))


if __name__ == "__main__":
    unittest.main()
