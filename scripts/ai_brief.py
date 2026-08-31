#!/usr/bin/env python3
"""
ai_brief.py
===========
Hasilkan brief analisis per saham dan tulis data/ai-brief.js.

    export ANTHROPIC_API_KEY=sk-...
    python scripts/ai_brief.py                  # top-N pakai Sonnet, sisanya Haiku
    python scripts/ai_brief.py --limit 3        # uji cepat
    python scripts/ai_brief.py --provider null  # kering, tanpa panggilan API

Bertingkat, karena dengan 984 ticker biayalah yang menentukan fitur ini bisa
jalan rutin atau tidak:

    tingkat 0  js/narrate.js       semua ticker, aturan, nol biaya, di browser
    tingkat 1  Haiku 4.5           semua ticker, brief massal
    tingkat 2  Sonnet 5            top-N: Forever Pocket + BELI/BELI KUAT

Tingkat 0 hidup di browser dan SELALU ada. Skrip ini hanya menambahkan
tingkat 1-2 di atasnya; kalau ia tidak jalan sama sekali, dashboard tetap
menjelaskan setiap saham.

Kontrol biaya:
  * Batch API — diskon 50%, dan pipeline ini memang tidak sensitif latensi.
  * Prompt caching — system prompt identik dikirim 984 kali per run.
  * --only-changed (default) — lewati ticker yang skor & indikatornya tidak
    bergeser sejak run terakhir. Pada hari biasa, itu mayoritas ticker.

Safeguard mengikuti pola fetch_signals.py: tanpa API key atau kalau semua
panggilan gagal, keluar dengan exit 0 tanpa menyentuh data/*.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

STOCKS_JS = ROOT / "data" / "stocks.js"
INDICATORS_JS = ROOT / "data" / "indicators.js"
FUNDAMENTALS_JS = ROOT / "data" / "fundamentals.js"
ANALYST_JS = ROOT / "data" / "analyst.js"
AI_BRIEF_JS = ROOT / "data" / "ai-brief.js"

DEFAULT_TOP_N = 150

SYSTEM_PROMPT = """\
Anda adalah analis saham yang menulis ringkasan singkat berbahasa Indonesia
untuk sebuah dashboard pribadi.

Anda akan menerima satu objek JSON berisi seluruh angka yang tersedia untuk
satu saham: skor komposit, tujuh faktor sinyal, indikator teknikal, metrik
fundamental, konsensus analis, metrik risiko, judul berita terbaru, dan tag
etika.

Aturan yang tidak boleh dilanggar:
1. Dasarkan SETIAP pernyataan pada angka yang diberikan. Jangan pernah
   menyebut angka, tanggal, produk, atau peristiwa yang tidak ada di input.
2. Kalau sebuah metrik tidak ada, jangan menyinggungnya. Jangan menebak.
3. Jangan memberi nasihat investasi, target harga versi Anda sendiri, atau
   ajakan membeli/menjual. Jelaskan apa yang ditunjukkan datanya, titik.
4. Bahasa Indonesia yang lugas dan padat. Hindari jargon yang tidak
   dijelaskan. Tulis untuk investor ritel yang cermat, bukan untuk trader
   profesional.
5. Kalau sinyalnya saling bertentangan, katakan begitu — jangan dipaksa
   terdengar meyakinkan.
6. Field `keyakinan` mencerminkan seberapa sepakat bukti yang ada, bukan
   seberapa ekstrem skornya.

Tag etika berkaitan dengan afiliasi Israel dan merupakan kriteria pribadi
pemilik dashboard. Laporkan apa adanya bila ada; jangan berdebat soal itu.
"""

# Bentuk keluaran dipaksa lewat schema, bukan diminta lewat prosa — dan
# bentuknya sengaja sama persis dengan keluaran js/narrate.js supaya UI cukup
# punya satu komponen render.
BRIEF_SCHEMA = {
    "type": "object",
    "properties": {
        "ringkasan": {"type": "string", "description": "2-3 kalimat inti."},
        "teknikal": {"type": "string"},
        "fundamental": {"type": "string"},
        "sentimen": {"type": "string"},
        "katalis": {"type": "array", "items": {"type": "string"}},
        "risiko": {"type": "array", "items": {"type": "string"}},
        "levelKunci": {
            "type": "object",
            "properties": {
                "support": {"type": ["number", "null"]},
                "resisten": {"type": ["number", "null"]},
            },
            "required": ["support", "resisten"],
            "additionalProperties": False,
        },
        "keyakinan": {"type": "string", "enum": ["tinggi", "sedang", "rendah"]},
        "horizon": {"type": "string"},
    },
    "required": ["ringkasan", "teknikal", "fundamental", "sentimen",
                 "katalis", "risiko", "levelKunci", "keyakinan", "horizon"],
    "additionalProperties": False,
}


# ── pembacaan data ────────────────────────────────────────────────────────

def _read_global(path: Path, name: str) -> dict:
    """Uraikan `window.<name> = {...};` dari sebuah berkas data."""
    if not path.exists():
        return {}
    try:
        raw = path.read_text(encoding="utf-8")
        m = re.search(rf"window\.{name}\s*=\s*(\{{.*\}})\s*;", raw, re.DOTALL)
        return json.loads(m.group(1)) if m else {}
    except (UnicodeDecodeError, json.JSONDecodeError, OSError):
        return {}


STOCK_RE = re.compile(
    r'ticker:\s*"([^"]+)"\s*,\s*name:\s*"([^"]*)"\s*,\s*sector:\s*"([^"]*)"', re.DOTALL
)
TIE_RE = re.compile(r'israelTie:\s*"([^"]+)"')
SIGNALS_RE = re.compile(r"signals:\s*\{([^}]*)\}")


def parse_universe(text: str) -> dict:
    """
    Baca ticker, nama, sektor, tag etika, dan 7 sinyal dari data/stocks.js.

    Regex, bukan parser JS, mengikuti pola yang sudah dipakai
    fetch_signals.update_stock_block() dan build_world_data.parse_stocks().
    """
    out: dict = {}
    blocks = text.split("\n  {")
    for block in blocks:
        m = STOCK_RE.search(block)
        if not m:
            continue
        ticker, name, sector = m.groups()
        tie = TIE_RE.search(block)
        signals = {}
        sm = SIGNALS_RE.search(block)
        if sm:
            for pair in sm.group(1).split(","):
                if ":" not in pair:
                    continue
                key, _, value = pair.partition(":")
                try:
                    signals[key.strip()] = int(value.strip())
                except ValueError:
                    pass
        out[ticker] = {
            "ticker": ticker, "name": name, "sector": sector,
            "israelTie": tie.group(1) if tie else "unknown",
            "signals": signals,
        }
    return out


# ── payload & pemilihan ───────────────────────────────────────────────────

def composite(signals: dict) -> Optional[int]:
    """Skor komposit 0-100, bobot sama persis dengan js/signals.js."""
    weights = {"technical": 0.15, "momentum": 0.15, "sentiment": 0.10, "news": 0.10,
               "policy": 0.15, "profile": 0.20, "valuation": 0.15}
    if not signals:
        return None
    raw = sum(signals.get(k, 0) * w for k, w in weights.items())
    return int((raw + 100) / 2 + 0.5)


def build_payload(stock: dict, indicators: dict, fundamentals: dict, analyst: dict) -> dict:
    """
    Konteks ringkas untuk satu saham.

    Sengaja dipangkas: mengirim seluruh dict indikator mentah menaikkan biaya
    token tanpa menambah apa pun yang bisa dipakai model.
    """
    payload = {
        "ticker": stock["ticker"],
        "nama": stock.get("name"),
        "sektor": stock.get("sector"),
        "skorKomposit": composite(stock.get("signals") or {}),
        "tujuhFaktor": stock.get("signals") or {},
        "etika": {"afiliasiIsrael": stock.get("israelTie")},
    }
    if indicators:
        payload["indikator"] = {
            k: v for k, v in indicators.items()
            if k in ("price", "ema50", "ema200", "rsi", "macd", "adx", "stoch",
                     "bollinger", "supertrend", "cross", "pos52w", "obvSlope",
                     "volRatio", "atrPct", "divergence", "mfi", "williamsR",
                     "cci", "ichimoku", "distEma200", "techParts", "risk")
        }
    if fundamentals:
        payload["fundamental"] = fundamentals
    if analyst and analyst.get("numAnalysts"):
        payload["analis"] = analyst
    return payload


def content_hash(payload: dict) -> str:
    """
    Sidik jari isi payload, untuk melewati ticker yang tidak berubah.

    Kunci diurutkan supaya hash-nya stabil; tanpa itu setiap run akan terlihat
    berubah dan --only-changed jadi tidak ada gunanya.
    """
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()[:16]


def select_top(universe: dict, payloads: dict, top_n: int) -> set:
    """
    Pilih saham yang layak dapat model lebih kuat.

    Kriterianya sengaja sama dengan yang benar-benar dilihat pengguna:
    skor tertinggi setelah penalti etis, dan bukan yang dikecualikan filter.
    """
    scored = []
    for ticker in payloads:
        stock = universe.get(ticker) or {}
        if stock.get("israelTie") == "high":
            continue          # dikecualikan filter etis — tak ada gunanya dianalisis dalam
        comp = composite(stock.get("signals") or {})
        if comp is not None:
            scored.append((comp, ticker))
    scored.sort(reverse=True)
    return {t for _, t in scored[:top_n]}


# ── penulisan ─────────────────────────────────────────────────────────────

def write_briefs(briefs: dict, meta: dict) -> None:
    AI_BRIEF_JS.write_text(
        "// Auto-generated by scripts/ai_brief.py — jangan edit manual.\n"
        "// Di-load LAZY oleh dashboard. Saat tidak ada, UI otomatis memakai\n"
        "// narasi deterministik js/narrate.js untuk SEMUA saham.\n"
        "window.AI_BRIEF_META = " + json.dumps(meta, indent=2, ensure_ascii=False) + ";\n"
        "window.AI_BRIEF = " + json.dumps(briefs, ensure_ascii=False,
                                          separators=(",", ":"), sort_keys=True) + ";\n",
        encoding="utf-8",
    )
    size_kb = AI_BRIEF_JS.stat().st_size / 1024
    print(f"Brief ditulis ke {AI_BRIEF_JS} ({len(briefs)} ticker, {size_kb:.0f} KB)")


def parse_args(argv: list) -> dict:
    opts = {
        "limit": None, "top_n": DEFAULT_TOP_N, "provider": "anthropic",
        "model": None, "top_model": None, "only_changed": True,
    }
    for i, a in enumerate(argv):
        def val(flag):
            if a.startswith(flag + "="):
                return a.split("=", 1)[1]
            if a == flag and i + 1 < len(argv):
                return argv[i + 1]
            return None

        for flag, key, cast in (
            ("--limit", "limit", int), ("--top", "top_n", int),
            ("--provider", "provider", str), ("--model", "model", str),
            ("--top-model", "top_model", str),
        ):
            v = val(flag)
            if v is not None:
                try:
                    opts[key] = cast(v)
                except ValueError:
                    pass
        if a == "--all":
            opts["only_changed"] = False
    return opts


def main() -> int:
    import ai_provider as ap

    opts = parse_args(sys.argv[1:])

    if not STOCKS_JS.exists():
        print("data/stocks.js tidak ditemukan.", file=sys.stderr)
        return 1

    universe = parse_universe(STOCKS_JS.read_text(encoding="utf-8"))
    indicators = _read_global(INDICATORS_JS, "STOCK_INDICATORS")
    fundamentals = _read_global(FUNDAMENTALS_JS, "STOCK_FUNDAMENTALS")
    analysts = _read_global(ANALYST_JS, "STOCK_ANALYST")
    previous = _read_global(AI_BRIEF_JS, "AI_BRIEF")

    tickers = list(universe)
    if opts["limit"]:
        tickers = tickers[: opts["limit"]]

    payloads = {
        t: build_payload(universe[t], indicators.get(t) or {},
                         fundamentals.get(t) or {}, analysts.get(t) or {})
        for t in tickers
    }

    provider = ap.get_provider(opts["provider"], SYSTEM_PROMPT)
    if not getattr(provider, "available", False):
        # Pola safeguard yang sama seperti fetch_signals.py: jangan pernah
        # menimpa data yang valid dengan hasil run yang gagal.
        print("⚠ ANTHROPIC_API_KEY tidak diset — data/ai-brief.js tidak diubah. "
              "Dashboard tetap memakai narasi deterministik untuk semua saham.",
              file=sys.stderr)
        return 0

    # Lewati yang isinya tidak bergeser sejak run terakhir.
    hashes = {t: content_hash(p) for t, p in payloads.items()}
    if opts["only_changed"]:
        todo = {t: p for t, p in payloads.items()
                if (previous.get(t) or {}).get("hash") != hashes[t]}
        skipped = len(payloads) - len(todo)
        if skipped:
            print(f"{skipped} ticker tidak berubah sejak run terakhir — dilewati.")
    else:
        todo = dict(payloads)

    if not todo:
        print("Tidak ada yang perlu diperbarui.")
        return 0

    top = select_top(universe, todo, opts["top_n"])
    bulk_payloads = {t: p for t, p in todo.items() if t not in top}
    top_payloads = {t: p for t, p in todo.items() if t in top}

    bulk_model = opts["model"] or ap.BULK_MODEL
    top_model = opts["top_model"] or ap.TOP_MODEL
    print(f"Akan diproses: {len(top_payloads)} ticker via {top_model}, "
          f"{len(bulk_payloads)} via {bulk_model}.")

    results: dict = {}
    for payload_set, model, tier in (
        (top_payloads, top_model, 2),
        (bulk_payloads, bulk_model, 1),
    ):
        if not payload_set:
            continue
        got = provider.batch(payload_set, BRIEF_SCHEMA, model=model)
        for ticker, brief in got.items():
            brief["sumber"] = "ai"
            brief["tier"] = tier
            brief["model"] = model
            brief["hash"] = hashes[ticker]
            results[ticker] = brief

    if not results:
        print("⚠ Tidak ada brief berhasil dibuat — data/ai-brief.js tidak diubah.",
              file=sys.stderr)
        return 0

    merged = dict(previous)
    merged.update(results)
    write_briefs(merged, {
        "lastUpdated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "tickers": len(merged),
        "updatedThisRun": len(results),
        "bulkModel": bulk_model,
        "topModel": top_model,
    })
    return 0


if __name__ == "__main__":
    sys.exit(main())
