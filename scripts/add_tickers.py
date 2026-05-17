#!/usr/bin/env python3
"""
add_tickers.py
==============
Tambah saham baru ke data/stocks.js dari daftar ticker.

Cara pakai:
  1. Buat file scripts/new_tickers.txt — satu ticker per baris, contoh:
       UBER
       LYFT
       SPOT
       # baris yang diawali # diabaikan
  2. Jalankan:
       pip install -r requirements.txt
       python scripts/add_tickers.py

Apa yang dilakukan script ini:
  - Ticker yang sudah ada di stocks.js → di-skip (tidak dobel)
  - Fetch nama perusahaan, sektor, dan sinyal live dari yfinance
  - Tambah entri baru di akhir array STOCK_UNIVERSE dengan placeholder etika
  - Field ethics.israelTie diisi "unknown" → harus kamu ganti manual

Catatan:
  - Sinyal sentimen, policy/makro → diisi 0 (harus diisi manual, bersifat kualitatif)
  - Setelah script selesai, cari "PERLU_REVIEW" di stocks.js untuk menemukan
    entri baru yang perlu dicek etika & sinyalnya
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import yfinance as yf
    import pandas as pd
except ImportError:
    print("Install dulu: pip install -r requirements.txt", file=sys.stderr)
    raise

ROOT         = Path(__file__).resolve().parent.parent
STOCKS_JS    = ROOT / "data" / "stocks.js"
TICKERS_FILE = Path(__file__).parent / "new_tickers.txt"

BENCHMARK = "^GSPC"

# ── Reuse scoring functions dari fetch_signals.py ─────────────────────────────

def rsi(series: "pd.Series", period: int = 14) -> float:
    delta = series.diff()
    up   = delta.clip(lower=0).ewm(alpha=1/period, adjust=False).mean()
    down = -delta.clip(upper=0).ewm(alpha=1/period, adjust=False).mean()
    rs   = up / down.replace(0, 1e-9)
    return float(100 - 100 / (1 + rs.iloc[-1]))


def technical_score(hist: "pd.DataFrame") -> int:
    if hist is None or len(hist) < 200:
        return 0
    close = hist["Close"]
    sma50  = close.rolling(50).mean().iloc[-1]
    sma200 = close.rolling(200).mean().iloc[-1]
    cross_score = 40 if sma50 > sma200 else -40
    rsi_val = rsi(close)
    if rsi_val < 30:
        rsi_score = 40
    elif rsi_val > 70:
        rsi_score = -40
    else:
        rsi_score = int((50 - rsi_val) * 0.8)
    mom1m = (close.iloc[-1] / close.iloc[-21] - 1) * 100
    mom_score = max(-20, min(20, int(mom1m)))
    return max(-100, min(100, cross_score + rsi_score + mom_score))


def momentum_score(hist: "pd.DataFrame", bench_hist: "pd.DataFrame") -> int:
    if hist is None or bench_hist is None or len(hist) < 126 or len(bench_hist) < 126:
        return 0
    ret_stock = hist["Close"].iloc[-1] / hist["Close"].iloc[-126] - 1
    ret_bench = bench_hist["Close"].iloc[-1] / bench_hist["Close"].iloc[-126] - 1
    relative  = (ret_stock - ret_bench) * 100
    return max(-100, min(100, int(relative * 3.33)))


def news_score(news: list) -> int:
    if not news:
        return 0
    pos_kw = ("beat", "surge", "record", "upgrade", "raise", "bull",
              "strong", "outperform", "soar", "rally", "growth", "win")
    neg_kw = ("miss", "plunge", "downgrade", "cut", "bear", "weak",
              "lawsuit", "probe", "fall", "decline", "loss", "fraud", "boycott")
    score = 0
    for item in news[:15]:
        title = (item.get("title") or "").lower()
        score += sum(5 for k in pos_kw if k in title)
        score -= sum(7 for k in neg_kw if k in title)
    return max(-100, min(100, score))


def profile_score(info: dict) -> int:
    score = 0
    cap = (info.get("marketCap") or 0) / 1e9
    if cap >= 500:    score += 40
    elif cap >= 100:  score += 25
    elif cap >= 20:   score += 10
    elif cap < 2:     score -= 20
    margin = info.get("profitMargins") or 0
    if margin >= 0.20:   score += 25
    elif margin >= 0.10: score += 15
    elif margin >= 0.05: score += 5
    elif margin < 0:     score -= 25
    div = info.get("dividendYield") or 0
    if 0.01 <= div <= 0.07: score += 10
    de = info.get("debtToEquity")
    if de is not None and de > 200: score -= 15
    return max(-100, min(100, score))


def valuation_score(info: dict) -> int:
    fpe = info.get("forwardPE")
    if fpe is None or fpe <= 0 or fpe > 200:
        return 0
    return max(-100, min(100, int((20 - fpe) * 3)))


# ── Sektor mapping yfinance → label yang dipakai di stocks.js ─────────────────

SECTOR_MAP = {
    "Technology":               "Technology",
    "Consumer Cyclical":        "Consumer Cyclical",
    "Consumer Defensive":       "Consumer Defensive",
    "Financial Services":       "Financial Services",
    "Healthcare":               "Healthcare",
    "Industrials":              "Industrials",
    "Communication Services":   "Communication Services",
    "Energy":                   "Energy",
    "Basic Materials":          "Basic Materials",
    "Real Estate":              "Real Estate",
    "Utilities":                "Utilities",
    "Financial":                "Financial Services",
    "Consumer, Non-cyclical":   "Consumer Defensive",
    "Consumer, Cyclical":       "Consumer Cyclical",
}


def normalize_sector(raw: str | None) -> str:
    if not raw:
        return "Other"
    return SECTOR_MAP.get(raw, raw)


# ── Fetch satu ticker ──────────────────────────────────────────────────────────

def fetch_ticker(ticker: str, bench_hist: "pd.DataFrame") -> dict | None:
    try:
        t    = yf.Ticker(ticker.replace(".", "-"))
        info = t.info or {}
        hist = t.history(period="2y", auto_adjust=False)
        news = t.news or []

        name   = (info.get("longName") or info.get("shortName") or ticker)
        sector = normalize_sector(info.get("sector"))

        div_yield   = round((info.get("dividendYield")  or 0) * 100, 2)
        payout      = round((info.get("payoutRatio")    or 0) * 100, 1)
        mkt_cap_b   = round((info.get("marketCap")      or 0) / 1e9, 0)

        return {
            "ticker":  ticker,
            "name":    name,
            "sector":  sector,
            "div":     div_yield,
            "payout":  payout,
            "cap":     int(mkt_cap_b),
            "signals": {
                "technical":  technical_score(hist),
                "momentum":   momentum_score(hist, bench_hist),
                "sentiment":  0,   # manual
                "news":       news_score(news),
                "policy":     0,   # manual
                "profile":    profile_score(info),
                "valuation":  valuation_score(info),
            },
        }
    except Exception as exc:
        print(f"  ! gagal {ticker}: {exc}", file=sys.stderr)
        return None


# ── Render entri JS ────────────────────────────────────────────────────────────

def render_entry(d: dict) -> str:
    s = d["signals"]
    # Escape nama perusahaan (apostrof, kutip ganda)
    name_safe = d["name"].replace("\\", "\\\\").replace('"', '\\"')
    return (
        f'  {{\n'
        f'    ticker: "{d["ticker"]}", name: "{name_safe}", sector: "{d["sector"]}",\n'
        f'    ethics: {{\n'
        f'      israelTie: "unknown",  // PERLU_REVIEW: isi none/low/medium/high\n'
        f'      rationale: "Belum dikaji — perlu verifikasi manual.",\n'
        f'      sources: ["PERLU_REVIEW"],\n'
        f'      palestineSupport: "none"\n'
        f'    }},\n'
        f'    fundamentals: {{ dividendYield: {d["div"]}, payoutRatio: {d["payout"]}, marketCapB: {d["cap"]} }},\n'
        f'    signals: {{ technical: {s["technical"]}, momentum: {s["momentum"]}, '
        f'sentiment: {s["sentiment"]}, news: {s["news"]}, policy: {s["policy"]}, '
        f'profile: {s["profile"]}, valuation: {s["valuation"]} }}\n'
        f'  }}'
    )


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> int:
    if not TICKERS_FILE.exists():
        print(f"ERROR: Buat dulu file {TICKERS_FILE}", file=sys.stderr)
        print("  Isi satu ticker per baris, contoh:", file=sys.stderr)
        print("    UBER\n    LYFT\n    SPOT", file=sys.stderr)
        return 1

    # Baca ticker baru
    new_tickers: list[str] = []
    for line in TICKERS_FILE.read_text(encoding="utf-8").splitlines():
        tk = line.split("#")[0].strip().upper()
        if tk:
            new_tickers.append(tk)

    if not new_tickers:
        print("Tidak ada ticker di new_tickers.txt.")
        return 0

    # Baca ticker yang sudah ada
    text = STOCKS_JS.read_text(encoding="utf-8")
    existing = set(re.findall(r'ticker:\s*"([^"]+)"', text))

    to_add = [tk for tk in new_tickers if tk not in existing]
    skipped = [tk for tk in new_tickers if tk in existing]

    if skipped:
        print(f"Skip {len(skipped)} ticker sudah ada: {', '.join(skipped)}")
    if not to_add:
        print("Tidak ada ticker baru untuk ditambahkan.")
        return 0

    print(f"Akan menambah {len(to_add)} ticker baru: {', '.join(to_add)}")

    # Fetch benchmark
    print("  - ^GSPC (benchmark S&P 500)")
    try:
        bench_hist = yf.Ticker(BENCHMARK).history(period="1y", auto_adjust=False)
    except Exception as exc:
        print(f"  ! benchmark gagal: {exc}", file=sys.stderr)
        bench_hist = None

    # Fetch setiap ticker baru
    entries: list[str] = []
    failed: list[str]  = []
    for tk in to_add:
        print(f"  - {tk}")
        data = fetch_ticker(tk, bench_hist)
        if data:
            entries.append(render_entry(data))
        else:
            failed.append(tk)

    if not entries:
        print("Semua ticker gagal di-fetch.")
        return 1

    # Sisipkan sebelum penutup array "];
    close_marker = "];"
    insert_pos = text.rfind(close_marker)
    if insert_pos == -1:
        print("ERROR: Tidak ketemu penutup ]; di stocks.js", file=sys.stderr)
        return 1

    # Cari apakah baris sebelumnya perlu koma
    before = text[:insert_pos].rstrip()
    separator = ",\n" if not before.endswith(",") else "\n"

    new_block = separator + "\n  // ---------- BARU (auto-generated) ----------\n" + \
                ",\n".join(entries) + "\n"

    new_text = text[:insert_pos] + new_block + text[insert_pos:]
    STOCKS_JS.write_text(new_text, encoding="utf-8")

    print(f"\nSelesai.")
    print(f"  + {len(entries)} ticker ditambahkan ke {STOCKS_JS}")
    if failed:
        print(f"  ! {len(failed)} gagal (cek koneksi / ticker salah): {', '.join(failed)}")
    print()
    print("Langkah berikutnya:")
    print("  1. Buka data/stocks.js")
    print('  2. Cari teks "PERLU_REVIEW" dan isi field ethics (israelTie, rationale, sources)')
    print("  3. Isi sinyal sentiment dan policy secara manual jika perlu")
    print("  4. Commit perubahan ke git")
    return 0


if __name__ == "__main__":
    sys.exit(main())
