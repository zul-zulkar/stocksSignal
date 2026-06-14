#!/usr/bin/env python3
"""
build_world_data.py
===================
Hasilkan data/world-data.js — dataset ringkas untuk dunia 3D imersif
(world.html) — dari data live data/stocks.js + data/analyst.js.

Skoring (komposit, skor ter-adjust etis, verdict Aksi) MENGIKUTI PERSIS
js/signals.js + js/advice.js, jadi "Stock Signal World" tidak pernah
melenceng dari dashboard utama.

    python scripts/build_world_data.py

Dijalankan otomatis setelah scripts/fetch_signals.py di pipeline refresh.
"""

from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path
from typing import Optional

ROOT       = Path(__file__).resolve().parent.parent
STOCKS_JS  = ROOT / "data" / "stocks.js"
ANALYST_JS = ROOT / "data" / "analyst.js"
WORLD_JS   = ROOT / "data" / "world-data.js"

# ── konstanta skoring — HARUS cermin js/signals.js ──────────────────
SIGNAL_WEIGHTS = {
    "technical": 0.15, "momentum": 0.15, "sentiment": 0.10, "news": 0.10,
    "policy": 0.15, "profile": 0.20, "valuation": 0.15,
}
ETHICS_PENALTY = {"high": 100, "medium": 25, "low": 5, "none": 0, "unknown": 10}
SIG_KEYS = ["technical", "momentum", "sentiment", "news", "policy", "profile", "valuation"]
CLEAN_TIES = ("none", "low")


def jround(x: float) -> int:
    """JS Math.round: pembulatan setengah ke arah +tak hingga."""
    return math.floor(x + 0.5)


def composite_signal(sig: dict) -> int:
    raw = sum((sig.get(k) or 0) * w for k, w in SIGNAL_WEIGHTS.items())
    return jround((raw + 100) / 2)


def ethics_adjusted(comp: int, tie: str, mode: str) -> Optional[int]:
    if mode in ("strict", "balanced") and tie == "high":
        return None
    penalty = 0 if mode == "loose" else ETHICS_PENALTY.get(tie, 0)
    return max(0, comp - penalty)


def upside_pct(an: Optional[dict]) -> Optional[float]:
    if not an:
        return None
    price, target = an.get("price"), an.get("targetMean")
    if target is not None and isinstance(price, (int, float)) and price > 0:
        return (target - price) / price * 100
    return None


def action_verdict(comp: int, adjB: Optional[int], sig: dict, an: Optional[dict]):
    """Cermin js/advice.js actionVerdict (mode balanced). -> (act, vscore)."""
    up = upside_pct(an)
    if adjB is None:                       # dikecualikan filter etis
        return "AVOID", -99
    pts = 0
    if   comp >= 65: pts += 2
    elif comp >= 55: pts += 1
    elif comp <= 34: pts -= 2
    elif comp <= 45: pts -= 1

    if an and (an.get("numAnalysts") or 0) > 0 and an.get("ratingMean") is not None:
        rm = an["ratingMean"]
        if   rm <= 1.8: pts += 2
        elif rm <= 2.5: pts += 1
        elif rm >= 3.5: pts -= 1

    if up is not None:
        if   up >= 20: pts += 2
        elif up >= 10: pts += 1
        elif up <= -5: pts -= 2

    val = sig.get("valuation") or 0
    if   val >= 20:  pts += 1
    elif val <= -40: pts -= 1
    tech = sig.get("technical") or 0
    if   tech >= 40:  pts += 1
    elif tech <= -40: pts -= 1

    if   pts >= 4:  act = "STRONG_BUY"
    elif pts >= 2:  act = "BUY"
    elif pts >= -1: act = "HOLD"
    elif pts >= -3: act = "REDUCE"
    else:           act = "AVOID"
    return act, pts


def round1(x: Optional[float]):
    """Bulatkan ke 1 desimal ala JS; kembalikan int bila bulat (31.0 -> 31)."""
    if x is None:
        return None
    v = jround(x * 10) / 10
    return int(v) if v == int(v) else v


# ── parsing data/stocks.js (struktur JS, bukan JSON) ────────────────
# Tiap blok saham ditutup "}" pada indentasi 2 spasi ("\n  }"); brace
# bersarang (ethics) ditutup pada indentasi 4 spasi — sama seperti
# asumsi di scripts/fetch_signals.py.
BLOCK_RE = re.compile(r'\{\s*\n\s*ticker:\s*"([^"]+)".*?\n  \}', re.DOTALL)


def _str(field: str, block: str) -> Optional[str]:
    m = re.search(rf'{field}:\s*"((?:[^"\\]|\\.)*)"', block)
    if not m:
        return None
    return m.group(1).replace('\\"', '"').replace("\\\\", "\\")


def _num(field: str, block: str):
    m = re.search(rf"{field}:\s*(-?[\d.]+)", block)
    if not m:
        return None
    raw = m.group(1)
    return float(raw) if "." in raw else int(raw)


def parse_stocks(text: str) -> list[dict]:
    out = []
    for m in BLOCK_RE.finditer(text):
        block = m.group(0)
        sig = {k: (_num(k, block) or 0) for k in SIG_KEYS}
        out.append({
            "t":   m.group(1),
            "n":   _str("name", block) or m.group(1),
            "sec": _str("sector", block) or "Other",
            "tie": _str("israelTie", block) or "unknown",
            "why": _str("rationale", block) or "",
            "dy":  _num("dividendYield", block) or 0,
            "cap": _num("marketCapB", block) or 0,
            "sig": sig,
        })
    return out


def load_analyst() -> dict:
    if not ANALYST_JS.exists():
        return {}
    raw = ANALYST_JS.read_text(encoding="utf-8")
    m = re.search(r"window\.STOCK_ANALYST\s*=\s*(\{.*\})\s*;", raw, re.DOTALL)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}


def build_forever(rows: list[dict], max_n: int = 10) -> list[str]:
    """Cermin buildForeverPocket() di js/signals.js (urut skor strict ↓)."""
    cand = [
        r for r in rows
        if r["tie"] in CLEAN_TIES
        and r["sig"]["profile"] >= 60
        and (r["dy"] >= 1.0 or r["cap"] >= 200)
    ]
    cand.sort(key=lambda r: ethics_adjusted(r["comp"], r["tie"], "strict"), reverse=True)
    return [r["t"] for r in cand[:max_n]]


def build_rows(stocks: list[dict], analyst: dict) -> list[dict]:
    rows = []
    for s in stocks:
        sig, tie = s["sig"], s["tie"]
        an = analyst.get(s["t"])
        comp = composite_signal(sig)
        adjB = ethics_adjusted(comp, tie, "balanced")
        adjL = ethics_adjusted(comp, tie, "loose")
        adjS = ethics_adjusted(comp, tie, "strict")
        act, vscore = action_verdict(comp, adjB, sig, an)
        rows.append({
            **s,
            "comp": comp, "adjB": adjB, "adjL": adjL, "adjS": adjS,
            "act": act, "vscore": vscore,
            "price":  an.get("price") if an else None,
            "target": an.get("targetMean") if an else None,
            "upside": round1(upside_pct(an)),
            "rating": an.get("rating") if an else None,
            "nA":     int(an.get("numAnalysts") or 0) if an else 0,
            "rMean":  an.get("ratingMean") if an else None,
        })
    return rows


def main() -> int:
    if not STOCKS_JS.exists():
        print(f"! tidak ada {STOCKS_JS}", file=sys.stderr)
        return 1
    stocks  = parse_stocks(STOCKS_JS.read_text(encoding="utf-8"))
    analyst = load_analyst()
    if not stocks:
        print("! gagal mem-parse satu pun saham dari data/stocks.js", file=sys.stderr)
        return 1
    rows = build_rows(stocks, analyst)

    meta = {
        "total":   len(rows),
        "flagged": sum(1 for r in rows if r["tie"] == "high"),
        "clean":   sum(1 for r in rows if r["tie"] in CLEAN_TIES),
        "opps":    sum(1 for r in rows if r["act"] in ("BUY", "STRONG_BUY")),
        "forever": build_forever(rows),
    }

    sep = (",", ":")
    body = (
        "// Auto-generated by scripts/build_world_data.py — jangan diedit manual.\n"
        "// Dataset ringkas untuk dunia 3D imersif (world.html).\n"
        "window.WORLD_DATA = "
        + json.dumps(rows, separators=sep, ensure_ascii=False) + ";\n"
        "window.WORLD_META = "
        + json.dumps(meta, separators=sep, ensure_ascii=False) + ";\n"
    )
    WORLD_JS.write_text(body, encoding="utf-8")
    print(f"OK - {meta['total']} saham -> {WORLD_JS.name} "
          f"(bersih {meta['clean']}, dikecualikan {meta['flagged']}, peluang {meta['opps']})")
    print(f"   Forever Pocket: {', '.join(meta['forever'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
