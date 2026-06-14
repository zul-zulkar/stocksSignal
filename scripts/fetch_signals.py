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

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Catatan: yfinance & pandas di-import secara lazy di dalam fetch()/main()
# agar modul ini tetap bisa di-import untuk unit test tanpa dependency berat
# terpasang. Fungsi skoring murni (news/profile/valuation/analyst/sentiment/
# update_stock_block) tidak butuh keduanya.

ROOT       = Path(__file__).resolve().parent.parent
STOCKS_JS  = ROOT / "data" / "stocks.js"
META_JS    = ROOT / "data" / "meta.js"
ANALYST_JS = ROOT / "data" / "analyst.js"

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

    div = info.get("dividendYield") or 0   # yfinance: sudah dalam persen (mis. 2.67 = 2.67%)
    if 1.0 <= div <= 7.0: score += 10

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
    # Catatan unit yfinance (2024+): dividendYield sudah dalam PERSEN
    # (mis. 2.67 = 2.67%), sedangkan payoutRatio masih pecahan (0.3 = 30%).
    return {
        "dividendYield": round(info.get("dividendYield") or 0, 2),
        "payoutRatio":   round((info.get("payoutRatio")   or 0) * 100, 1),
        "marketCapB":    round((info.get("marketCap")     or 0) / 1e9, 0),
    }


def analyst_block(info: dict) -> dict:
    """Rekomendasi & target harga konsensus analis (yfinance .info)."""
    def num(x):
        try:
            return round(float(x), 2) if x is not None else None
        except (TypeError, ValueError):
            return None
    return {
        "rating":      info.get("recommendationKey"),                    # "strong_buy"|"buy"|"hold"|"sell"|...
        "ratingMean":  num(info.get("recommendationMean")),              # 1.0 (strong buy) .. 5.0 (sell)
        "numAnalysts": int(info.get("numberOfAnalystOpinions") or 0),
        "targetMean":  num(info.get("targetMeanPrice")),
        "targetHigh":  num(info.get("targetHighPrice")),
        "targetLow":   num(info.get("targetLowPrice")),
        "price":       num(info.get("currentPrice") or info.get("regularMarketPrice")),
        "currency":    info.get("currency") or "USD",
    }


def sentiment_from_analyst(an: dict) -> Optional[int]:
    """
    Map konsensus analis → sinyal sentimen -100..+100.
    ratingMean 1.0 (strong buy) → +100, 3.0 (hold) → 0, 5.0 (sell) → -100.
    Hanya valid jika ada minimal 1 analis & ratingMean tersedia.
    """
    if not an or an.get("numAnalysts", 0) < 1 or an.get("ratingMean") is None:
        return None
    return max(-100, min(100, round((3 - an["ratingMean"]) * 50)))


def fetch(ticker: str, bench_hist: "pd.DataFrame") -> Optional[dict]:
    import yfinance as yf
    try:
        t    = yf.Ticker(ticker.replace(".", "-"))
        hist = t.history(period="2y", auto_adjust=False)
        info = t.info or {}
        news = t.news or []
        analyst = analyst_block(info)
        payload = {
            "technical":    technical_score(hist),
            "momentum":     momentum_score(hist, bench_hist),
            "news":         news_score(news),
            "profile":      profile_score(info),
            "valuation":    valuation_score(info),
            "fundamentals": fundamentals(info),
            "analyst":      analyst,
        }
        sent = sentiment_from_analyst(analyst)
        if sent is not None:
            payload["sentiment"] = sent
        return payload
    except Exception as exc:
        print(f"  ! gagal {ticker}: {exc}", file=sys.stderr)
        return None


# ── editor file stocks.js ──────────────────────────────────────────────────
TICKER_RE = re.compile(r'ticker:\s*"([^"]+)"')


def update_stock_block(text: str, ticker: str, payload: dict) -> str:
    # Catatan: blok tiap saham ditutup oleh "}" pada indentasi 2 spasi
    # ("\n  }"). Brace bersarang (ethics) ditutup pada indentasi 4 spasi,
    # jadi anchor "\n  \}" memastikan kita menangkap SELURUH objek saham
    # (termasuk fundamentals & signals), bukan berhenti di blok ethics.
    pattern = re.compile(
        r"(\{\s*\n\s*ticker:\s*\"" + re.escape(ticker) + r"\".*?\n  \})",
        re.DOTALL,
    )
    m = pattern.search(text)
    if not m:
        print(f"  · blok {ticker} tidak ketemu, skip")
        return text
    block     = m.group(1)
    new_block = block

    # sentiment hanya ditulis bila ada konsensus analis (kalau tidak, biarkan manual)
    keys = ["technical", "momentum", "news", "profile", "valuation"]
    if "sentiment" in payload:
        keys.append("sentiment")
    for key in keys:
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
        "window.STOCK_META = " + json.dumps(meta, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Metadata ditulis ke {META_JS}")


def merge_analyst_file(updates: dict) -> None:
    """
    Regenerasi data/analyst.js secara utuh, mempertahankan entri lama
    untuk ticker yang tidak diproses (mis. saat dipakai --limit).
    """
    existing: dict = {}
    if ANALYST_JS.exists():
        try:
            raw = ANALYST_JS.read_text(encoding="utf-8")
            m = re.search(r"window\.STOCK_ANALYST\s*=\s*(\{.*\})\s*;", raw, re.DOTALL)
            if m:
                existing = json.loads(m.group(1))
        except (UnicodeDecodeError, json.JSONDecodeError, OSError):
            existing = {}  # file lama korup/tak terbaca → mulai bersih
    existing.update(updates)
    ANALYST_JS.write_text(
        "// Auto-generated by scripts/fetch_signals.py — jangan diedit manual.\n"
        "window.STOCK_ANALYST = " + json.dumps(existing, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Data analis ditulis ke {ANALYST_JS} ({len(updates)} diperbarui, {len(existing)} total)")


def main() -> int:
    # --limit N: proses N ticker pertama saja (untuk uji cepat)
    limit: Optional[int] = None
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a == "--limit" and i + 1 < len(args):
            try:
                limit = int(args[i + 1])
            except ValueError:
                pass
        elif a.startswith("--limit="):
            try:
                limit = int(a.split("=", 1)[1])
            except ValueError:
                pass

    try:
        import yfinance as yf
    except ImportError:
        print("Install dulu: pip install -r requirements.txt", file=sys.stderr)
        return 1

    text        = STOCKS_JS.read_text(encoding="utf-8")
    all_tickers = TICKER_RE.findall(text)
    tickers     = all_tickers[:limit] if limit else all_tickers
    print(f"Mengambil data untuk {len(tickers)} ticker + benchmark S&P500…")

    print("  - ^GSPC (benchmark)")
    try:
        bench_hist = yf.Ticker(BENCHMARK).history(period="1y", auto_adjust=False)
    except Exception as exc:
        print(f"  ! benchmark gagal: {exc}", file=sys.stderr)
        bench_hist = None

    updated = 0
    failed: list[str] = []
    analyst_updates: dict = {}
    for tk in tickers:
        print(f"  - {tk}")
        payload = fetch(tk, bench_hist)
        if payload is None:
            failed.append(tk)
            continue
        text = update_stock_block(text, tk, payload)
        analyst_updates[tk] = payload["analyst"]
        updated += 1

    if updated == 0:
        # Semua ticker gagal — lazim di runner GitHub saat Yahoo me-rate-limit
        # IP datacenter. Jangan timpa data/meta agar status terakhir yang valid
        # tetap tampil (hindari badge "0/984" yang keliru di dashboard).
        print("⚠ Tidak ada ticker berhasil (kemungkinan Yahoo memblokir IP runner). "
              "data/* tidak diubah; status terakhir yang valid dipertahankan.", file=sys.stderr)
        return 0

    STOCKS_JS.write_text(text, encoding="utf-8")
    merge_analyst_file(analyst_updates)
    write_meta(updated, len(all_tickers), failed)
    print(f"Selesai. {updated}/{len(tickers)} ticker diperbarui di {STOCKS_JS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
