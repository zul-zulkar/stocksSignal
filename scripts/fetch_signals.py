#!/usr/bin/env python3
"""
fetch_signals.py
================
Tarik data live untuk memperbarui sinyal di data/stocks.js.
Dijalankan otomatis oleh GitHub Actions setiap Senin, atau manual:

    pip install -r requirements.txt
    python scripts/fetch_signals.py

Sinyal yang di-update:
    technical  – RSI(14) + SMA50/SMA200 crossover
    momentum   – return 6-bulan relatif vs S&P500 (Fama-French momentum factor)
    news       – heuristik headline yfinance
    profile    – market cap + profitabilitas + dividen + utang (quality factor)
    valuation  – P/E forward vs rata-rata sektor (value factor)
    fundamentals.* – dividendYield, payoutRatio, marketCapB

Sentimen & makro tetap manual (sumber kualitatif).
"""

from __future__ import annotations

import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

try:
    import yfinance as yf
    import pandas as pd
except ImportError:
    print("Install dulu: pip install -r requirements.txt", file=sys.stderr)
    raise

ROOT      = Path(__file__).resolve().parent.parent
STOCKS_JS = ROOT / "data" / "stocks.js"
META_JS = ROOT / "data" / "meta.js"

# Benchmark untuk momentum relatif
BENCHMARK = "^GSPC"  # S&P 500


def rsi(series: "pd.Series", period: int = 14) -> float:
    delta = series.diff()
    up   = delta.clip(lower=0).ewm(alpha=1/period, adjust=False).mean()
    down = -delta.clip(upper=0).ewm(alpha=1/period, adjust=False).mean()
    rs   = up / down.replace(0, 1e-9)
    return float(100 - 100 / (1 + rs.iloc[-1]))


def technical_score(hist: "pd.DataFrame") -> int:
    """RSI(14) + SMA50/SMA200 + 1-month momentum → -100..+100"""
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
    """
    6-bulan price momentum relatif vs S&P500.
    Positif = outperform benchmark (Fama-French momentum factor).
    """
    if hist is None or bench_hist is None or len(hist) < 126 or len(bench_hist) < 126:
        return 0
    ret_stock = hist["Close"].iloc[-1] / hist["Close"].iloc[-126] - 1
    ret_bench = bench_hist["Close"].iloc[-1] / bench_hist["Close"].iloc[-126] - 1
    relative  = (ret_stock - ret_bench) * 100  # poin persentase relatif
    # Map -30% s/d +30% relative ke -100..+100
    return max(-100, min(100, int(relative * 3.33)))


def news_score(news: list) -> int:
    """Heuristik kasar dari judul berita yfinance."""
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
    """Kualitas perusahaan: market cap + margin + dividen + utang (quality factor)."""
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
    """
    Valuasi relatif: forward P/E vs median pasar (~20x S&P500 historis).
    Negatif = mahal, Positif = murah/wajar (value factor).
    """
    fpe = info.get("forwardPE")
    if fpe is None or fpe <= 0 or fpe > 200:
        return 0
    # Baseline market forward P/E ~20x; setiap 1x deviation = 3 poin
    deviation = (20 - fpe) * 3
    return max(-100, min(100, int(deviation)))


def fundamentals(info: dict) -> dict:
    return {
        "dividendYield": round((info.get("dividendYield") or 0) * 100, 2),
        "payoutRatio":   round((info.get("payoutRatio")   or 0) * 100, 1),
        "marketCapB":    round((info.get("marketCap")     or 0) / 1e9, 0),
    }


def fetch(ticker: str, bench_hist: "pd.DataFrame") -> Optional[dict]:
    try:
        t    = yf.Ticker(ticker.replace(".", "-"))
        hist = t.history(period="2y", auto_adjust=False)
        info = t.info or {}
        news = t.news or []
        return {
            "technical":    technical_score(hist),
            "momentum":     momentum_score(hist, bench_hist),
            "news":         news_score(news),
            "profile":      profile_score(info),
            "valuation":    valuation_score(info),
            "fundamentals": fundamentals(info),
        }
    except Exception as exc:
        print(f"  ! gagal {ticker}: {exc}", file=sys.stderr)
        return None


# ── editor file stocks.js ──────────────────────────────────────────────────
TICKER_RE = re.compile(r'ticker:\s*"([^"]+)"')


def update_stock_block(text: str, ticker: str, payload: dict) -> str:
    pattern = re.compile(
        r"(\{\s*\n\s*ticker:\s*\"" + re.escape(ticker) + r"\".*?\n\s*\})",
        re.DOTALL,
    )
    m = pattern.search(text)
    if not m:
        print(f"  · blok {ticker} tidak ketemu, skip")
        return text
    block     = m.group(1)
    new_block = block

    for key in ("technical", "momentum", "news", "profile", "valuation"):
        new_block = re.sub(
            rf"({key}:\s*)(-?\d+)",
            lambda mm, v=payload[key]: f"{mm.group(1)}{int(v)}",
            new_block,
            count=1,
        )

    f = payload["fundamentals"]
    new_block = re.sub(r"(dividendYield:\s*)([\d.]+)",
        lambda mm: f"{mm.group(1)}{f['dividendYield']}", new_block, count=1)
    new_block = re.sub(r"(payoutRatio:\s*)([\d.]+)",
        lambda mm: f"{mm.group(1)}{f['payoutRatio']}", new_block, count=1)
    new_block = re.sub(r"(marketCapB:\s*)([\d.]+)",
        lambda mm: f"{mm.group(1)}{int(f['marketCapB'])}", new_block, count=1)

    return text.replace(block, new_block, 1)


def write_meta(updated: int, total: int, failed: list[str]) -> None:
    meta = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "tickersTotal": total,
        "tickersUpdated": updated,
        "tickersFailed": failed,
        "source": "yfinance (Yahoo Finance)",
    }
    META_JS.write_text(
        "// Auto-generated by scripts/fetch_signals.py — jangan diedit manual.\n"
        "window.STOCK_META = " + json.dumps(meta, indent=2) + ";\n"
    )
    print(f"Metadata ditulis ke {META_JS}")


def main() -> int:
    text    = STOCKS_JS.read_text(encoding="utf-8")
    tickers = TICKER_RE.findall(text)
    print(f"Mengambil data untuk {len(tickers)} ticker + benchmark S&P500…")

    print("  - ^GSPC (benchmark)")
    try:
        bench_hist = yf.Ticker(BENCHMARK).history(period="1y", auto_adjust=False)
    except Exception as exc:
        print(f"  ! benchmark gagal: {exc}", file=sys.stderr)
        bench_hist = None

    updated = 0
    failed: list[str] = []
    for tk in tickers:
        print(f"  - {tk}")
        payload = fetch(tk, bench_hist)
        if payload is None:
            failed.append(tk)
            continue
        text    = update_stock_block(text, tk, payload)
        updated += 1

    STOCKS_JS.write_text(text)
    write_meta(updated, len(tickers), failed)
    print(f"Selesai. {updated}/{len(tickers)} ticker diperbarui di {STOCKS_JS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
