#!/usr/bin/env python3
"""
build_indicators.py
===================
Hitung indikator teknikal lengkap untuk seluruh universe lalu tulis
data/indicators.js.

    pip install -r requirements.txt
    python scripts/build_indicators.py            # semua ticker
    python scripts/build_indicators.py --limit 5  # uji cepat

Kenapa file terpisah, bukan menambah field ke data/stocks.js:
fetch_signals.update_stock_block() menyunting stocks.js lewat regex per blok
ticker. Menambah puluhan field ke sana membuat regex itu jauh lebih rapuh
tanpa alasan. analyst.js sudah membuktikan pola yang lebih baik — file
generated utuh yang ditulis ulang sebagai JSON — dan ini mengikutinya.

Ukuran: ~780 byte per ticker setelah pembulatan → sekitar 750 KB untuk 984
ticker, atau ~100 KB lewat kabel karena GitHub Pages menyajikannya ter-gzip.
File ini di-load LAZY oleh dashboard (baru diambil saat panel detail dibuka),
jadi tidak menambah waktu muat awal sama sekali.
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
STOCKS_JS = ROOT / "data" / "stocks.js"
ANALYST_JS = ROOT / "data" / "analyst.js"
INDICATORS_JS = ROOT / "data" / "indicators.js"

BENCHMARK = "^GSPC"
TICKER_RE = re.compile(r'ticker:\s*"([^"]+)"')

# Presisi per kunci. Angka harga butuh 2 desimal, osilator cukup 1, rasio
# butuh 3 karena nilainya kecil. Pembulatan agresif ini memangkas ukuran
# file jauh lebih efektif daripada memendekkan nama kunci — dan nama kunci
# yang terbaca membuat js/narrate.js serta panel Indikator jauh lebih mudah
# dirawat. Nama kunci yang berulang-ulang juga hampir gratis setelah gzip,
# yang memang dipakai GitHub Pages.
DECIMALS = {
    "rsi": 1, "adx": 1, "plusDI": 1, "minusDI": 1, "k": 1, "d": 1,
    "pctB": 1, "bandwidth": 1, "atrPct": 2, "williamsR": 1, "mfi": 1,
    "cci": 1, "pct": 1, "distEma200": 1, "volatility": 1, "maxDrawdown": 1,
    "line": 3, "signal": 3, "hist": 3,
    "obvSlope": 3, "volRatio": 3, "beta": 3, "riskReward": 2,
}
DEFAULT_DECIMALS = 2

# Nilai yang tidak berguna disimpan: OBV mentah skalanya ikut ukuran saham
# sehingga tidak bisa dibandingkan antar-ticker — yang informatif hanya
# kemiringannya, dan itu sudah ternormalisasi.
DROP_KEYS = {"obv"}


def _round(key: str, value):
    if isinstance(value, bool) or value is None or isinstance(value, str):
        return value
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return round(value, DECIMALS.get(key, DEFAULT_DECIMALS))
    return value


def compact(tree: dict) -> dict:
    """
    Bulatkan dan buang entri kosong secara rekursif.

    Kunci bernilai None dihilangkan dari file, bukan ditulis sebagai null:
    banyak ticker tidak punya riwayat cukup untuk SMA200 atau Ichimoku, dan
    menuliskan ratusan `null` per ticker itu murni pemborosan. Konsumen tetap
    aman karena compute_all() di kedua bahasa menjamin bentuk kunci yang
    konsisten SAAT DIHITUNG — file simpanan hanya menghilangkan yang kosong.
    """
    out = {}
    for key, value in tree.items():
        if key in DROP_KEYS:
            continue
        if isinstance(value, dict):
            nested = compact(value)
            if nested:
                out[key] = nested
        elif value is not None:
            out[key] = _round(key, value)
    return out


def load_targets() -> dict:
    """Target harga analis dari data/analyst.js, untuk rasio risk/reward."""
    if not ANALYST_JS.exists():
        return {}
    try:
        raw = ANALYST_JS.read_text(encoding="utf-8")
        m = re.search(r"window\.STOCK_ANALYST\s*=\s*(\{.*\})\s*;", raw, re.DOTALL)
        if not m:
            return {}
        data = json.loads(m.group(1))
    except (UnicodeDecodeError, json.JSONDecodeError, OSError):
        return {}
    return {
        t: v.get("targetMean")
        for t, v in data.items()
        if isinstance(v, dict) and v.get("targetMean") is not None
    }


def load_existing() -> dict:
    """Entri lama dipertahankan supaya --limit tidak menghapus sisa universe."""
    if not INDICATORS_JS.exists():
        return {}
    try:
        raw = INDICATORS_JS.read_text(encoding="utf-8")
        m = re.search(r"window\.STOCK_INDICATORS\s*=\s*(\{.*?\})\s*;\s*$", raw, re.DOTALL)
        if not m:
            return {}
        return json.loads(m.group(1))
    except (UnicodeDecodeError, json.JSONDecodeError, OSError):
        return {}


def fetch_one(ticker: str, bench_hist, target: Optional[float]) -> Optional[dict]:
    import yfinance as yf

    import indicators as ind

    try:
        t = yf.Ticker(ticker.replace(".", "-"))
        hist = t.history(period="2y", auto_adjust=False)
        if hist is None or len(hist) == 0:
            return None
        payload = ind.compute_all(hist, bench_hist)
        # risk_block dihitung ulang dengan target supaya risk/reward terisi;
        # compute_all() tidak tahu soal target analis.
        payload["risk"] = ind.risk_block(
            hist, bench_hist, atr_val=payload.get("atr"), target=target
        )
        return compact(payload)
    except Exception as exc:  # noqa: BLE001 — satu ticker cacat jangan jatuhkan run
        print(f"  ! gagal {ticker}: {exc}", file=sys.stderr)
        return None


def write_file(data: dict, updated: int, failed: list[str]) -> None:
    meta = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "tickers": len(data),
        "updated": updated,
        "failed": failed[:20],
    }
    INDICATORS_JS.write_text(
        "// Auto-generated by scripts/build_indicators.py — jangan edit manual.\n"
        "// Di-load LAZY oleh dashboard (lihat js/app.js), bukan saat muat awal.\n"
        "// Kunci bernilai kosong dihilangkan; lihat compact() di generator.\n"
        "window.INDICATORS_META = " + json.dumps(meta, indent=2) + ";\n"
        "window.STOCK_INDICATORS = " + json.dumps(data, separators=(",", ":"), sort_keys=True) + ";\n",
        encoding="utf-8",
    )
    size_kb = INDICATORS_JS.stat().st_size / 1024
    print(f"Indikator ditulis ke {INDICATORS_JS} ({len(data)} ticker, {size_kb:.0f} KB)")


def parse_limit(args: list[str]) -> Optional[int]:
    for i, a in enumerate(args):
        if a == "--limit" and i + 1 < len(args):
            try:
                return int(args[i + 1])
            except ValueError:
                pass
        elif a.startswith("--limit="):
            try:
                return int(a.split("=", 1)[1])
            except ValueError:
                pass
    return None


def main() -> int:
    limit = parse_limit(sys.argv[1:])

    try:
        import yfinance as yf
    except ImportError:
        print("Install dulu: pip install -r requirements.txt", file=sys.stderr)
        return 1

    sys.path.insert(0, str(ROOT / "scripts"))

    all_tickers = TICKER_RE.findall(STOCKS_JS.read_text(encoding="utf-8"))
    tickers = all_tickers[:limit] if limit else all_tickers
    targets = load_targets()
    print(f"Menghitung indikator untuk {len(tickers)} ticker + benchmark…")

    print(f"  - {BENCHMARK} (benchmark untuk beta)")
    try:
        bench_hist = yf.Ticker(BENCHMARK).history(period="2y", auto_adjust=False)
    except Exception as exc:  # noqa: BLE001
        print(f"  ! benchmark gagal: {exc} — beta akan kosong", file=sys.stderr)
        bench_hist = None

    data = load_existing()
    updated = 0
    failed: list[str] = []
    for tk in tickers:
        print(f"  - {tk}")
        payload = fetch_one(tk, bench_hist, targets.get(tk))
        if payload is None:
            failed.append(tk)
            continue
        data[tk] = payload
        updated += 1

    if updated == 0:
        # Safeguard yang sama seperti fetch_signals.py: Yahoo rutin
        # me-rate-limit IP datacenter GitHub, dan menimpa file dengan hasil
        # kosong akan menghapus data valid terakhir.
        print(
            "⚠ Tidak ada ticker berhasil (kemungkinan Yahoo memblokir IP runner). "
            "data/indicators.js tidak diubah.",
            file=sys.stderr,
        )
        return 0

    write_file(data, updated, failed)
    if failed:
        print(f"  {len(failed)} ticker gagal: {', '.join(failed[:10])}…")
    return 0


if __name__ == "__main__":
    sys.exit(main())
