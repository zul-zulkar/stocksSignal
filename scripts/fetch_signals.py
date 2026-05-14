#!/usr/bin/env python3
"""
fetch_signals.py
================
Tarik data live untuk memperbarui sinyal teknikal, berita, dan profil
di data/stocks.js.

Cara pakai:
    pip install -r requirements.txt
    python scripts/fetch_signals.py

Yang di-update:
    - signals.technical : skor -100..+100 dari RSI(14) + SMA50/SMA200 crossover
    - signals.news      : skor sederhana dari rata-rata headline yfinance
    - signals.profile   : skor dari market cap, profitabilitas, dividen
    - fundamentals.*    : dividendYield, payoutRatio, marketCapB

Kebijakan & sentimen tetap manual (sumber kualitatif).

Catatan: skrip ini parse data/stocks.js sebagai teks (bukan eksekusi JS),
lalu menulis ulang nilai numerik tertentu. Field lain tidak disentuh.
"""

from __future__ import annotations

import json
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

ROOT = Path(__file__).resolve().parent.parent
STOCKS_JS = ROOT / "data" / "stocks.js"
META_JS = ROOT / "data" / "meta.js"


def rsi(series: "pd.Series", period: int = 14) -> float:
    delta = series.diff()
    up = delta.clip(lower=0).ewm(alpha=1 / period, adjust=False).mean()
    down = -delta.clip(upper=0).ewm(alpha=1 / period, adjust=False).mean()
    rs = up / down.replace(0, 1e-9)
    return float(100 - 100 / (1 + rs.iloc[-1]))


def technical_score(hist: "pd.DataFrame") -> int:
    """RSI(14) + SMA50/SMA200 crossover → -100..+100"""
    if hist is None or len(hist) < 200:
        return 0
    close = hist["Close"]
    sma50 = close.rolling(50).mean().iloc[-1]
    sma200 = close.rolling(200).mean().iloc[-1]
    cross_score = 40 if sma50 > sma200 else -40
    rsi_val = rsi(close)
    if rsi_val < 30:
        rsi_score = 40   # oversold → bullish setup
    elif rsi_val > 70:
        rsi_score = -40  # overbought → bearish setup
    else:
        rsi_score = int((50 - rsi_val) * 0.8)  # tilt halus ke mean
    momentum = (close.iloc[-1] / close.iloc[-21] - 1) * 100  # 1-month return %
    momentum_score = max(-20, min(20, int(momentum)))
    return max(-100, min(100, cross_score + rsi_score + momentum_score))


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
    """Profil kualitas: market cap + margin + dividen + utang."""
    score = 0
    cap = (info.get("marketCap") or 0) / 1e9
    if cap >= 500:   score += 40
    elif cap >= 100: score += 25
    elif cap >= 20:  score += 10
    elif cap < 2:    score -= 20
    margin = info.get("profitMargins") or 0
    if margin >= 0.20: score += 25
    elif margin >= 0.10: score += 15
    elif margin >= 0.05: score += 5
    elif margin < 0:    score -= 25
    div = info.get("dividendYield") or 0
    if 0.01 <= div <= 0.07: score += 10
    de = info.get("debtToEquity")
    if de is not None and de > 200: score -= 15
    return max(-100, min(100, score))


def fundamentals(info: dict) -> dict:
    return {
        "dividendYield": round((info.get("dividendYield") or 0) * 100, 2),
        "payoutRatio":   round((info.get("payoutRatio")   or 0) * 100, 1),
        "marketCapB":    round((info.get("marketCap")     or 0) / 1e9, 0),
    }


def fetch(ticker: str) -> Optional[dict]:
    try:
        t = yf.Ticker(ticker.replace(".", "-"))  # BRK.B → BRK-B di yfinance
        hist = t.history(period="2y", auto_adjust=False)
        info = t.info or {}
        news = t.news or []
        return {
            "technical":    technical_score(hist),
            "news":         news_score(news),
            "profile":      profile_score(info),
            "fundamentals": fundamentals(info),
        }
    except Exception as exc:
        print(f"  ! gagal {ticker}: {exc}", file=sys.stderr)
        return None


# --- editor file stocks.js -------------------------------------------------
TICKER_RE = re.compile(r'ticker:\s*"([^"]+)"')


def update_stock_block(text: str, ticker: str, payload: dict) -> str:
    """Update field signals.technical/news/profile + fundamentals untuk satu blok."""
    # Cari blok obj yang dimulai dengan { ... ticker: "<TICKER>" ... } sampai "}"
    pattern = re.compile(
        r"(\{\s*\n\s*ticker:\s*\"" + re.escape(ticker) + r"\".*?\n\s*\})",
        re.DOTALL,
    )
    m = pattern.search(text)
    if not m:
        print(f"  · blok {ticker} tidak ketemu, skip")
        return text
    block = m.group(1)
    new_block = block

    # signals
    for key in ("technical", "news", "profile"):
        new_block = re.sub(
            rf"({key}:\s*)(-?\d+)",
            lambda mm, v=payload[key]: f"{mm.group(1)}{int(v)}",
            new_block,
            count=1,
        )
    # fundamentals
    f = payload["fundamentals"]
    new_block = re.sub(
        r"(dividendYield:\s*)([\d.]+)",
        lambda mm: f"{mm.group(1)}{f['dividendYield']}",
        new_block, count=1)
    new_block = re.sub(
        r"(payoutRatio:\s*)([\d.]+)",
        lambda mm: f"{mm.group(1)}{f['payoutRatio']}",
        new_block, count=1)
    new_block = re.sub(
        r"(marketCapB:\s*)([\d.]+)",
        lambda mm: f"{mm.group(1)}{int(f['marketCapB'])}",
        new_block, count=1)

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
    text = STOCKS_JS.read_text()
    tickers = TICKER_RE.findall(text)
    print(f"Mengambil data untuk {len(tickers)} ticker…")

    updated = 0
    failed: list[str] = []
    for tk in tickers:
        print(f"  - {tk}")
        payload = fetch(tk)
        if payload is None:
            failed.append(tk)
            continue
        text = update_stock_block(text, tk, payload)
        updated += 1

    STOCKS_JS.write_text(text)
    write_meta(updated, len(tickers), failed)
    print(f"Selesai. {updated}/{len(tickers)} ticker diperbarui di {STOCKS_JS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
