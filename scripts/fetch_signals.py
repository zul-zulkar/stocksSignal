#!/usr/bin/env python3
"""
fetch_signals.py
================
Tarik data live untuk memperbarui sinyal di data/stocks.js.
Dijalankan otomatis oleh GitHub Actions setiap Senin, atau manual:

    pip install -r requirements.txt
    python scripts/fetch_signals.py

Sinyal yang di-update:
    technical  – 8 sub-sinyal berbobot (EMA+ADX, MACD, RSI, Stochastic,
                 Bollinger %B, konfirmasi volume/OBV, Supertrend, posisi 52mg)
    momentum   – return 6-bulan + 12-1 bulan, keduanya relatif vs S&P500
    sentiment  – konsensus analis + short interest + kepemilikan institusi
    news       – rata-rata sentimen judul berbobot recency
    profile    – ukuran, margin, dividen, utang, ROE, FCF yield, likuiditas,
                 pertumbuhan (quality factor)
    valuation  – relatif MEDIAN SEKTOR pada 5 metrik (value factor)
    fundamentals.* – dividendYield, payoutRatio, marketCapB

Hanya `policy` (makro) yang tetap manual/kualitatif.

Skrip ini juga menulis data/indicators.js dari riwayat harga yang memang
sudah ditarik. Menariknya lagi di skrip terpisah akan melipatduakan pekerjaan
30–60 menit ini, sementara refresh.yml dibatasi 55 menit.

Alurnya dua lintasan: lintasan 1 mengambil semua dari jaringan, lintasan 2
menilai tanpa jaringan. Valuasi wajib menunggu lintasan 2 karena butuh median
sektor dari seluruh universe — sebuah saham baru bisa disebut "murah" setelah
ada pembandingnya.
"""

from __future__ import annotations

import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Skoring teknikal tinggal di indicators.py bersama matematika indikatornya:
# ia murni turunan dari indikator, dan js/indicators.js memuat port persisnya.
# Sepasang berkas yang bercermin membuat jaminan paritas mudah dipegang.
from indicators import (
    TECH_WEIGHTS,
    clamp,
    jround,
    technical_parts,
    technical_score,
)

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


def momentum_score(hist: "pd.DataFrame", bench_hist: "pd.DataFrame") -> int:
    """
    Momentum harga relatif vs S&P500, gabungan dua horizon.

    Selain return 6 bulan yang sudah dipakai, ditambahkan momentum 12-1 bulan
    — yaitu 12 bulan terakhir TANPA bulan terakhir. Melewatkan bulan terakhir
    adalah praktik standar sejak Jegadeesh & Titman (1993): return jangka
    sangat pendek cenderung berbalik arah dan mengotori sinyal momentum.
    """
    if hist is None or bench_hist is None or len(hist) < 126 or len(bench_hist) < 126:
        return 0

    close, bench = hist["Close"], bench_hist["Close"]

    def relative(lookback: int, skip: int = 0) -> Optional[float]:
        if len(close) < lookback + 1 or len(bench) < lookback + 1:
            return None
        end = -1 - skip
        rs = close.iloc[end] / close.iloc[-lookback - 1] - 1
        rb = bench.iloc[end] / bench.iloc[-lookback - 1] - 1
        return (rs - rb) * 100

    six = relative(126)
    twelve_one = relative(252, skip=21)

    if six is None:
        return 0
    # Map ±30 poin persen relatif ke ±100.
    blended = six if twelve_one is None else 0.6 * six + 0.4 * twelve_one
    return int(clamp(jround(blended * 3.33), -100, 100))


POS_KW = ("beat", "surge", "record", "upgrade", "raise", "bull",
          "strong", "outperform", "soar", "rally", "growth", "win")
NEG_KW = ("miss", "plunge", "downgrade", "cut", "bear", "weak",
          "lawsuit", "probe", "fall", "decline", "loss", "fraud", "boycott")


def news_score(news: list) -> int:
    """
    Sentimen berita dari judul yfinance — rata-rata berbobot recency.

    Versi lama menjumlahkan +5/-7 per kata kunci di seluruh artikel, jadi
    skornya ikut BANYAKNYA berita, bukan arahnya: saham yang diliput 15 kali
    secara netral bisa keluar lebih ekstrem daripada saham yang diliput sekali
    dengan sangat negatif. Sekarang tiap artikel dinilai sendiri di rentang
    -1..+1, lalu dirata-rata dengan bobot yang meluruh — yfinance memulangkan
    berita terbaru lebih dulu, dan berita kemarin memang lebih relevan
    daripada berita dua minggu lalu.
    """
    if not news:
        return 0

    total_w = 0.0
    acc = 0.0
    for i, item in enumerate(news[:15]):
        title = (item.get("title") or "").lower()
        if not title:
            continue
        pos = sum(1 for k in POS_KW if k in title)
        neg = sum(1 for k in NEG_KW if k in title)
        if pos == 0 and neg == 0:
            article = 0.0
        else:
            # Kata negatif diberi bobot lebih besar: berita buruk terbukti
            # menggerakkan harga lebih kuat daripada berita baik.
            article = clamp((pos - 1.4 * neg) / 2.0, -1.0, 1.0)
        w = 1.0 / (1.0 + i * 0.15)
        acc += article * w
        total_w += w

    if total_w == 0:
        return 0
    return int(clamp(jround(acc / total_w * 100), -100, 100))


def profile_score(info: dict) -> int:
    """
    Kualitas perusahaan (quality factor).

    Selain ukuran + margin + dividen + utang yang sudah ada, kini menilai
    imbal hasil modal (ROE), FCF yield, likuiditas jangka pendek, dan
    pertumbuhan. AQR "Quality Minus Junk" mendefinisikan kualitas sebagai
    profitabilitas + pertumbuhan + keamanan; sebelumnya hanya sisi keamanan
    dan ukuran yang benar-benar terwakili di sini.
    """
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

    # ── tambahan: profitabilitas modal, kas, likuiditas, pertumbuhan ──
    roe = info.get("returnOnEquity")
    if roe is not None:
        if roe >= 0.20:   score += 10
        elif roe >= 0.10: score += 5
        elif roe < 0:     score -= 10

    # FCF yield lebih sulit dimanipulasi akuntansi ketimbang laba bersih.
    fcf, mcap = info.get("freeCashflow"), info.get("marketCap")
    if fcf is not None and mcap:
        fcf_yield = fcf / mcap
        if fcf_yield >= 0.06:   score += 10
        elif fcf_yield >= 0.03: score += 5
        elif fcf_yield < 0:     score -= 10

    cr = info.get("currentRatio")
    if cr is not None:
        if cr >= 1.5:  score += 5
        elif cr < 1.0: score -= 5

    rev_growth = info.get("revenueGrowth")
    if rev_growth is not None:
        if rev_growth >= 0.15:   score += 8
        elif rev_growth >= 0.05: score += 4
        elif rev_growth < 0:     score -= 8

    eps_growth = info.get("earningsGrowth")
    if eps_growth is not None:
        if eps_growth >= 0.15: score += 7
        elif eps_growth < 0:   score -= 7

    return int(clamp(score, -100, 100))


# Metrik valuasi: nama → (kunci yfinance, "lebih rendah lebih murah"?, bobot).
# Bobotnya tidak sama karena kualitas datanya tidak sama: forward P/E paling
# lengkap terisi di universe ini, PEG paling sering kosong atau aneh.
VALUATION_METRICS = {
    "forwardPE":  ("forwardPE", True, 0.35),
    "priceToBook": ("priceToBook", True, 0.15),
    "evEbitda":   ("enterpriseToEbitda", True, 0.20),
    "fcfYield":   (None, False, 0.20),   # dihitung, bukan diambil langsung
    "peg":        ("trailingPegRatio", True, 0.10),
}

# Batas kewajaran; di luar ini biasanya artefak data (laba negatif, EBITDA
# mendekati nol) dan bukan sinyal valuasi.
VALUATION_BOUNDS = {
    "forwardPE": (0.5, 200.0),
    "priceToBook": (0.05, 50.0),
    "evEbitda": (0.5, 100.0),
    "fcfYield": (-1.0, 1.0),
    "peg": (0.05, 10.0),
}

# Dipakai kalau sektornya terlalu sedikit anggota berdata untuk dipercaya.
ABSOLUTE_BASELINE = {"forwardPE": 20.0, "priceToBook": 3.0, "evEbitda": 14.0,
                     "fcfYield": 0.04, "peg": 1.5}

# Di bawah ini median sektor dianggap terlalu tipis untuk jadi pembanding.
MIN_SECTOR_PEERS = 5


def valuation_metrics(info: dict) -> dict:
    """Ambil metrik valuasi mentah dari .info, buang yang di luar batas wajar."""
    out = {}
    for name, (key, _lower_better, _w) in VALUATION_METRICS.items():
        if name == "fcfYield":
            fcf, mcap = info.get("freeCashflow"), info.get("marketCap")
            value = (fcf / mcap) if (fcf is not None and mcap) else None
        else:
            value = info.get(key)
        if value is None:
            continue
        try:
            value = float(value)
        except (TypeError, ValueError):
            continue
        lo, hi = VALUATION_BOUNDS[name]
        if lo <= value <= hi:
            out[name] = value
    return out


def sector_medians(rows: dict) -> dict:
    """
    Median tiap metrik per sektor.

    rows: ticker → {"sector": str, "metrics": {...}}
    Hasil: sektor → metrik → median, hanya untuk sektor yang punya minimal
    MIN_SECTOR_PEERS anggota berdata pada metrik itu.
    """
    buckets: dict = {}
    for row in rows.values():
        sector = row.get("sector") or "?"
        for name, value in (row.get("metrics") or {}).items():
            buckets.setdefault(sector, {}).setdefault(name, []).append(value)

    out: dict = {}
    for sector, metrics in buckets.items():
        for name, values in metrics.items():
            if len(values) < MIN_SECTOR_PEERS:
                continue
            values = sorted(values)
            mid = len(values) // 2
            median = values[mid] if len(values) % 2 else (values[mid - 1] + values[mid]) / 2
            out.setdefault(sector, {})[name] = median
    return out


def valuation_score(metrics: dict, sector: str, medians: dict) -> int:
    """
    Valuasi relatif SEKTOR, bukan relatif satu angka pasar.

    Versi lama membandingkan forward P/E setiap saham dengan patokan tetap
    20×. Itu menghukum seluruh sektor yang secara struktural memang berdagang
    di kelipatan tinggi (perangkat lunak) dan memberi hadiah gratis ke sektor
    yang selalu murah (bank, energi) — jadi yang terukur sebenarnya "sektor
    apa ini", bukan "mahal atau murah dibanding sepadannya".

    Positif = lebih murah dari sepadannya, negatif = lebih mahal.
    """
    if not metrics:
        return 0
    sector_ref = medians.get(sector, {})

    total_w = 0.0
    acc = 0.0
    for name, value in metrics.items():
        _key, lower_better, weight = VALUATION_METRICS[name]
        ref = sector_ref.get(name)
        if ref is None or ref == 0:
            ref = ABSOLUTE_BASELINE[name]
        if ref == 0:
            continue

        if lower_better:
            if value <= 0:
                continue
            rel = ref / value - 1.0     # value di bawah median → positif
        else:
            rel = value / ref - 1.0 if ref > 0 else 0.0

        acc += clamp(rel, -1.0, 1.0) * weight
        total_w += weight

    if total_w == 0:
        return 0
    return int(clamp(jround(acc / total_w * 100), -100, 100))


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


def sentiment_from_analyst(an: dict, info: Optional[dict] = None) -> Optional[int]:
    """
    Sentimen pasar: konsensus analis + short interest + kepemilikan institusi.

    Konsensus analis saja hanya menangkap satu sisi. Short interest tinggi
    berarti ada uang yang bertaruh melawan saham ini — itu sinyal sentimen
    langsung yang tidak tercermin di rating, dan bisa berkebalikan arah dengan
    rekomendasi analis pada saham yang sama.

    ratingMean 1.0 (strong buy) → +100, 3.0 (hold) → 0, 5.0 (sell) → -100.
    Hanya valid jika ada minimal 1 analis & ratingMean tersedia.
    """
    if not an or an.get("numAnalysts", 0) < 1 or an.get("ratingMean") is None:
        return None
    score = (3 - an["ratingMean"]) * 50

    if info:
        short = info.get("shortPercentOfFloat")
        if short is not None:
            if short >= 0.20:   score -= 25
            elif short >= 0.10: score -= 12
            elif short <= 0.02: score += 5

        inst = info.get("heldPercentInstitutions")
        if inst is not None:
            if inst >= 0.70:   score += 8
            elif inst <= 0.20: score -= 5

    return int(clamp(jround(score), -100, 100))


def fetch(ticker: str, bench_hist: "pd.DataFrame") -> Optional[dict]:
    """
    Satu lintasan jaringan per ticker → semua yang bisa diturunkan darinya.

    Indikator dihitung DI SINI dari riwayat yang memang sudah ditarik, bukan
    di skrip terpisah. Menariknya dua kali akan melipatduakan pekerjaan 30–60
    menit menjadi 60–120 menit, sementara refresh.yml dibatasi 55 menit —
    build_indicators.py tetap ada, tapi sebagai alat regenerasi mandiri.

    Skor valuasi TIDAK dihitung di sini: ia butuh median sektor dari seluruh
    universe, jadi baru bisa dinilai setelah semua ticker terkumpul. Yang
    dipulangkan cuma metriknya.
    """
    import yfinance as yf

    import indicators as ind

    try:
        t    = yf.Ticker(ticker.replace(".", "-"))
        hist = t.history(period="2y", auto_adjust=False)
        info = t.info or {}
        news = t.news or []
        analyst = analyst_block(info)

        indicators = ind.compute_all(hist, bench_hist)
        if indicators:
            indicators["risk"] = ind.risk_block(
                hist, bench_hist,
                atr_val=indicators.get("atr"),
                target=analyst.get("targetMean"),
            )
            indicators["techParts"] = technical_parts(indicators)

        payload = {
            "technical":    technical_score(indicators),
            "momentum":     momentum_score(hist, bench_hist),
            "news":         news_score(news),
            "profile":      profile_score(info),
            "fundamentals": fundamentals(info),
            "analyst":      analyst,
            "_indicators":  indicators,
            "_valMetrics":  valuation_metrics(info),
        }
        sent = sentiment_from_analyst(analyst, info)
        if sent is not None:
            payload["sentiment"] = sent
        return payload
    except Exception as exc:
        print(f"  ! gagal {ticker}: {exc}", file=sys.stderr)
        return None


# ── editor file stocks.js ──────────────────────────────────────────────────
TICKER_RE = re.compile(r'ticker:\s*"([^"]+)"')
# Di data/stocks.js ketiganya selalu berada di satu baris yang sama
# (diverifikasi: 984 dari 984 blok), jadi satu regex cukup.
SECTOR_RE = re.compile(r'ticker:\s*"([^"]+)"\s*,\s*name:\s*"[^"]*"\s*,\s*sector:\s*"([^"]+)"')


def parse_sectors(text: str) -> dict:
    """Peta ticker → sektor, untuk median valuasi per sektor."""
    return dict(SECTOR_RE.findall(text))


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


def write_indicators(updates: dict, failed: list) -> None:
    """
    Tulis data/indicators.js dari indikator yang sudah dihitung di lintasan 1.

    Pembulatan, pembuangan entri kosong, dan penggabungan dengan entri lama
    dipinjam dari build_indicators.py supaya kedua jalur (pipeline penuh vs
    regenerasi mandiri) menghasilkan file dengan bentuk yang persis sama.
    """
    if not updates:
        return
    try:
        import build_indicators as bidx
    except ImportError as exc:  # pragma: no cover — hanya kalau file terhapus
        print(f"  ! lewati indicators.js: {exc}", file=sys.stderr)
        return

    data = bidx.load_existing()
    for ticker, payload in updates.items():
        data[ticker] = bidx.compact(payload)
    bidx.write_file(data, len(updates), failed)


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
        # 2 tahun, bukan 1: momentum 12-1 bulan butuh 273 bar dan beta
        # memakai 252 bar. Riwayat 1 tahun membuat keduanya diam-diam kosong.
        bench_hist = yf.Ticker(BENCHMARK).history(period="2y", auto_adjust=False)
    except Exception as exc:
        print(f"  ! benchmark gagal: {exc}", file=sys.stderr)
        bench_hist = None

    # ── Lintasan 1: ambil dari jaringan (bagian yang lambat) ──
    results: dict = {}
    failed: list[str] = []
    for tk in tickers:
        print(f"  - {tk}")
        payload = fetch(tk, bench_hist)
        if payload is None:
            failed.append(tk)
            continue
        results[tk] = payload

    if not results:
        # Semua ticker gagal — lazim di runner GitHub saat Yahoo me-rate-limit
        # IP datacenter. Jangan timpa data/meta agar status terakhir yang valid
        # tetap tampil (hindari badge "0/984" yang keliru di dashboard).
        print("⚠ Tidak ada ticker berhasil (kemungkinan Yahoo memblokir IP runner). "
              "data/* tidak diubah; status terakhir yang valid dipertahankan.", file=sys.stderr)
        return 0

    # ── Lintasan 2: skoring murni, tanpa jaringan ──
    # Valuasi harus menunggu di sini karena butuh median sektor dari seluruh
    # universe — sebuah saham baru bisa disebut "murah" setelah ada
    # pembandingnya.
    sectors = parse_sectors(text)
    medians = sector_medians({
        tk: {"sector": sectors.get(tk), "metrics": p.get("_valMetrics") or {}}
        for tk, p in results.items()
    })
    print(f"Median sektor dihitung untuk {len(medians)} sektor "
          f"(minimal {MIN_SECTOR_PEERS} anggota berdata; sisanya pakai baseline absolut).")

    analyst_updates: dict = {}
    indicator_updates: dict = {}
    for tk, payload in results.items():
        payload["valuation"] = valuation_score(
            payload.get("_valMetrics") or {}, sectors.get(tk), medians
        )
        text = update_stock_block(text, tk, payload)
        analyst_updates[tk] = payload["analyst"]
        if payload.get("_indicators"):
            indicator_updates[tk] = payload["_indicators"]

    updated = len(results)
    STOCKS_JS.write_text(text, encoding="utf-8")
    merge_analyst_file(analyst_updates)
    write_indicators(indicator_updates, failed)
    write_meta(updated, len(all_tickers), failed)
    print(f"Selesai. {updated}/{len(tickers)} ticker diperbarui di {STOCKS_JS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
