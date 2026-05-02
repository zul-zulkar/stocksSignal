#!/usr/bin/env python3
"""
scrape_ethics.py
================
Scraping otomatis data etika dari sumber-sumber publik:
  1. Who Profits Research Center  (whoprofits.org)
  2. BDS Movement boycott list    (bdsmovement.net)
  3. AFSC Investigate             (investigate.afsc.org)
  4. DuckDuckGo search            (fallback untuk semua entri)

Output: scripts/ethics_scraped.json
  → Dipakai oleh review_ethics.py sebagai lapisan tambahan sebelum default.

Cara pakai:
  pip install -r requirements.txt
  python scripts/scrape_ethics.py          # scrape semua PERLU_REVIEW
  python scripts/scrape_ethics.py AAPL     # scrape satu ticker saja
  python scripts/scrape_ethics.py --apply  # scrape lalu langsung update stocks.js

Catatan:
  · Hormat robots.txt & rate limit (delay 2–4 detik antar request)
  · Hasil scraping bersifat indikatif — tetap lakukan verifikasi mandiri
  · Gunakan --apply dengan hati-hati; backup stocks.js sebelum dijalankan
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import random
from pathlib import Path
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Install dulu: pip install requests beautifulsoup4", file=sys.stderr)
    raise

# duckduckgo_search opsional
try:
    from duckduckgo_search import DDGS
    HAS_DDG = True
except ImportError:
    HAS_DDG = False
    print("Info: duckduckgo-search tidak terinstall, DDG fallback dinonaktifkan.", file=sys.stderr)
    print("      pip install duckduckgo-search  (opsional)", file=sys.stderr)

ROOT        = Path(__file__).resolve().parent.parent
STOCKS_JS   = ROOT / "data" / "stocks.js"
OUTPUT_JSON = Path(__file__).parent / "ethics_scraped.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def delay(lo: float = 2.0, hi: float = 4.5) -> None:
    time.sleep(random.uniform(lo, hi))


# ── 1. Who Profits ─────────────────────────────────────────────────────────────

def search_whoprofits(company_name: str) -> Optional[dict]:
    """
    Cari perusahaan di database Who Profits.
    URL pencarian: https://whoprofits.org/?s=<query>
    """
    try:
        url = "https://whoprofits.org/"
        params = {"s": company_name}
        r = SESSION.get(url, params=params, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        # Ambil hasil pencarian (artikel/entry)
        results = soup.select("article.post, .entry-title a, h2.entry-title a")
        if not results:
            return None

        # Ambil link pertama yang relevan
        for tag in results[:3]:
            link = tag.get("href") or (tag.find("a") and tag.find("a").get("href"))
            title = tag.get_text(strip=True)
            if link and company_name.lower().split()[0] in title.lower():
                return _parse_whoprofits_page(link, title)

        return None
    except Exception as e:
        print(f"    WhoP error ({company_name}): {e}", file=sys.stderr)
        return None


def _parse_whoprofits_page(url: str, title: str) -> dict:
    """Ambil detail dari halaman perusahaan Who Profits."""
    try:
        delay(1.0, 2.5)
        r = SESSION.get(url, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")

        content = soup.select_one(".entry-content, .post-content, article")
        text = content.get_text(" ", strip=True)[:1000] if content else ""

        # Tentukan level berdasarkan kata kunci
        tie = _classify_from_text(text)

        return {
            "source": "Who Profits",
            "url": url,
            "title": title,
            "snippet": text[:300],
            "tie": tie,
        }
    except Exception:
        return {"source": "Who Profits", "url": url, "title": title, "tie": "medium"}


# ── 2. BDS Movement ────────────────────────────────────────────────────────────

# Cache daftar boikot BDS agar tidak di-fetch ulang setiap query
_BDS_BOYCOTT_CACHE: Optional[set] = None

def get_bds_boycott_list() -> set[str]:
    """Ambil daftar perusahaan boikot dari bdsmovement.net (di-cache)."""
    global _BDS_BOYCOTT_CACHE
    if _BDS_BOYCOTT_CACHE is not None:
        return _BDS_BOYCOTT_CACHE

    targets: set[str] = set()
    try:
        urls = [
            "https://bdsmovement.net/get-involved/what-to-boycott",
            "https://bdsmovement.net/Act-Now-Against-These-Companies-Profiting-from-Genocide",
        ]
        for url in urls:
            r = SESSION.get(url, timeout=20)
            if r.status_code != 200:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            # Ambil semua teks dari h2-h4 dan paragraph
            for tag in soup.find_all(["h2", "h3", "h4", "li", "strong", "b"]):
                t = tag.get_text(strip=True)
                if t and len(t) < 80:
                    targets.add(t.lower())
            delay(1.5, 3.0)
    except Exception as e:
        print(f"    BDS fetch error: {e}", file=sys.stderr)

    _BDS_BOYCOTT_CACHE = targets
    print(f"  BDS list: {len(targets)} entri dimuat.")
    return targets


def check_bds(company_name: str) -> Optional[dict]:
    """Cek apakah nama perusahaan ada di daftar BDS."""
    boycott_list = get_bds_boycott_list()
    name_lower = company_name.lower()
    words = [w for w in re.split(r'\W+', name_lower) if len(w) > 3]

    matched = any(
        word in entry or entry in name_lower
        for word in words
        for entry in boycott_list
    )

    if matched:
        return {
            "source": "BDS Movement",
            "url": "https://bdsmovement.net/get-involved/what-to-boycott",
            "tie": "high",
            "snippet": f"'{company_name}' ditemukan dalam daftar boikot BDS Movement.",
        }
    return None


# ── 3. AFSC Investigate ────────────────────────────────────────────────────────

def search_afsc(company_name: str, ticker: str) -> Optional[dict]:
    """
    Cari di AFSC Investigate (investigate.afsc.org).
    AFSC menggunakan React/JS, sehingga kita gunakan endpoint pencarian mereka.
    """
    try:
        # AFSC menggunakan Algolia search di balik layar
        url = "https://investigate.afsc.org/company/" + ticker.lower().replace(".", "-")
        r = SESSION.get(url, timeout=15)
        if r.status_code == 404:
            # Coba search endpoint
            url2 = f"https://investigate.afsc.org/search?q={requests.utils.quote(company_name)}"
            r = SESSION.get(url2, timeout=15)
        if r.status_code != 200:
            return None

        soup = BeautifulSoup(r.text, "html.parser")
        text = soup.get_text(" ", strip=True)

        if company_name.lower().split()[0] not in text.lower():
            return None

        tie = _classify_from_text(text)
        return {
            "source": "AFSC Investigate",
            "url": url,
            "snippet": text[:300],
            "tie": tie,
        }
    except Exception as e:
        print(f"    AFSC error ({ticker}): {e}", file=sys.stderr)
        return None


# ── 4. DuckDuckGo Search ───────────────────────────────────────────────────────

def search_ddg(company_name: str, ticker: str) -> Optional[dict]:
    """Cari informasi etika via DuckDuckGo."""
    if not HAS_DDG:
        return None

    queries = [
        f'"{company_name}" Israel BDS boycott "Who Profits" OR "AFSC"',
        f'"{company_name}" Israel military contract occupation Palestine',
        f'site:whoprofits.org "{company_name}"',
    ]

    for query in queries:
        try:
            delay(1.0, 2.0)
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=5))
            if not results:
                continue

            combined_text = " ".join(
                (r.get("title", "") + " " + r.get("body", ""))
                for r in results
            ).lower()

            tie = _classify_from_text(combined_text)
            if tie != "none":
                snippets = [r.get("title", "") for r in results[:2]]
                return {
                    "source": "DuckDuckGo search",
                    "query": query,
                    "tie": tie,
                    "snippet": " | ".join(snippets)[:300],
                }
        except Exception as e:
            print(f"    DDG error: {e}", file=sys.stderr)
            delay(3.0, 6.0)
            continue

    return None


# ── Klasifikasi teks ───────────────────────────────────────────────────────────

HIGH_SIGNALS = (
    "military contract", "idf", "israeli defense forces", "weapons",
    "bombs", "missiles", "f-35", "f-16", "apartheid", "occupation technology",
    "checkpoint system", "biometric", "surveillance occupation",
    "blacklisted", "boycott target", "who profits", "don't buy into occupation",
    "no tech for apartheid", "genocide", "war crimes",
    "headquartered in israel", "based in israel", "tel aviv", "herzliya",
    "beersheba", "haifa offices", "jerusalem headquarters",
)
MEDIUM_SIGNALS = (
    "israel operations", "israel office", "invested in israel",
    "israel bonds", "underwriting israel", "israel r&d",
    "complicit", "israel military", "defense contractor",
    "settlement", "west bank", "occupied territories",
    "human rights concerns", "afsc investigate",
)
LOW_SIGNALS = (
    "israel connection", "israel partnership", "israel presence",
    "minor exposure", "indirect", "supply chain israel",
)
CLEAN_SIGNALS = (
    "no evidence", "not listed", "not found", "no connection",
    "clean", "no ties",
)


def _classify_from_text(text: str) -> str:
    t = text.lower()
    if any(s in t for s in CLEAN_SIGNALS):
        return "none"
    score = 0
    score += sum(3 for s in HIGH_SIGNALS   if s in t)
    score += sum(2 for s in MEDIUM_SIGNALS if s in t)
    score += sum(1 for s in LOW_SIGNALS    if s in t)
    if score >= 6:  return "high"
    if score >= 3:  return "medium"
    if score >= 1:  return "low"
    return "none"


# ── Merge hasil scraping ───────────────────────────────────────────────────────

TIE_RANK = {"none": 0, "low": 1, "medium": 2, "high": 3}


def merge_results(results: list[dict]) -> tuple[str, str, list[str]]:
    """Gabungkan hasil dari beberapa sumber, ambil yang paling serius."""
    if not results:
        return "none", "Tidak ditemukan informasi spesifik dari sumber publik yang dikonsultasikan.", ["(scraping: tidak ada hasil)"]

    # Ambil tingkat tertinggi
    best = max(results, key=lambda r: TIE_RANK.get(r.get("tie", "none"), 0))
    tie = best["tie"]

    # Kumpulkan sumber
    sources = list({r["source"] for r in results})
    snippets = [r.get("snippet", "") for r in results if r.get("snippet")]

    rationale = snippets[0][:200] if snippets else f"Ditemukan referensi di: {', '.join(sources)}."
    rationale += " (hasil scraping otomatis — verifikasi mandiri disarankan)"

    sources.append("(auto-scraping)")
    return tie, rationale, sources


# ── Apply ke stocks.js ─────────────────────────────────────────────────────────

def apply_to_stocks_js(scraped: dict[str, dict]) -> int:
    text = STOCKS_JS.read_text(encoding="utf-8")

    block_pattern = re.compile(
        r'(\{[^{}]*?ticker:\s*"([^"]+)"[^{}]*?israelTie:\s*"unknown"[^{}]*?\})',
        re.DOTALL,
    )

    count = 0
    for m in block_pattern.finditer(text):
        ticker = m.group(2)
        if ticker not in scraped:
            continue
        data = scraped[ticker]
        block_orig = m.group(1)

        tie       = data["tie"]
        rationale = data["rationale"].replace("\\", "\\\\").replace('"', '\\"')
        src_list  = data["sources"]
        src_str   = ", ".join(f'"{s.replace(chr(34), chr(92)+chr(34))}"' for s in src_list)

        new_block = re.sub(r'israelTie:\s*"unknown".*', f'israelTie: "{tie}"', block_orig)
        new_block = re.sub(r'rationale:\s*"Belum dikaji[^"]*"', f'rationale: "{rationale}"', new_block)
        new_block = re.sub(r'sources:\s*\["PERLU_REVIEW"\]', f'sources: [{src_str}]', new_block)

        if new_block != block_orig:
            text = text.replace(block_orig, new_block, 1)
            count += 1

    STOCKS_JS.write_text(text, encoding="utf-8")
    return count


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Scrape ethics data for stocks")
    parser.add_argument("tickers", nargs="*", help="Ticker spesifik (kosong = semua PERLU_REVIEW)")
    parser.add_argument("--apply", action="store_true", help="Langsung update stocks.js setelah scraping")
    parser.add_argument("--skip-bds", action="store_true", help="Skip scraping BDS website")
    parser.add_argument("--skip-whoprofits", action="store_true", help="Skip scraping Who Profits")
    parser.add_argument("--skip-afsc", action="store_true", help="Skip scraping AFSC")
    parser.add_argument("--ddg-only", action="store_true", help="Hanya gunakan DuckDuckGo")
    args = parser.parse_args()

    # Tentukan daftar ticker yang akan diproses
    if args.tickers:
        todo = [(tk.upper(), tk.upper()) for tk in args.tickers]
    else:
        # Baca dari stocks.js
        text = STOCKS_JS.read_text(encoding="utf-8")
        matches = re.findall(
            r'ticker:\s*"([^"]+)"[^{}]*?name:\s*"([^"]+)"[^{}]*?israelTie:\s*"unknown"',
            text, re.DOTALL,
        )
        todo = [(tk, nm) for tk, nm in matches]

    if not todo:
        print("Tidak ada entri untuk diproses.")
        return 0

    print(f"Akan memproses {len(todo)} ticker...")
    if not args.skip_bds and not args.ddg_only:
        print("Memuat daftar BDS Movement...")
        get_bds_boycott_list()

    # Load hasil scraping sebelumnya jika ada
    existing: dict[str, dict] = {}
    if OUTPUT_JSON.exists():
        try:
            existing = json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))
            print(f"  {len(existing)} entri dimuat dari {OUTPUT_JSON.name}")
        except Exception:
            pass

    scraped = dict(existing)
    new_count = 0

    for i, (ticker, name) in enumerate(todo, 1):
        if ticker in scraped and scraped[ticker].get("tie") != "unknown":
            print(f"  [{i:4}/{len(todo)}] {ticker:8} (skip — sudah ada)")
            continue

        print(f"  [{i:4}/{len(todo)}] {ticker:8} {name[:35]}")
        results = []

        if not args.ddg_only:
            # BDS check
            if not args.skip_bds:
                bds = check_bds(name)
                if bds:
                    results.append(bds)
                    print(f"             ✓ BDS: {bds['tie']}")

            # Who Profits
            if not args.skip_whoprofits:
                delay()
                wp = search_whoprofits(name)
                if wp:
                    results.append(wp)
                    print(f"             ✓ Who Profits: {wp['tie']}")

            # AFSC
            if not args.skip_afsc:
                delay()
                afsc = search_afsc(name, ticker)
                if afsc:
                    results.append(afsc)
                    print(f"             ✓ AFSC: {afsc['tie']}")

        # DuckDuckGo fallback
        if HAS_DDG and (not results or args.ddg_only):
            delay()
            ddg = search_ddg(name, ticker)
            if ddg:
                results.append(ddg)
                print(f"             ✓ DDG: {ddg['tie']}")

        tie, rationale, sources = merge_results(results)
        scraped[ticker] = {"tie": tie, "rationale": rationale, "sources": sources}
        new_count += 1

        # Simpan setiap 10 ticker (checkpoint)
        if new_count % 10 == 0:
            OUTPUT_JSON.write_text(json.dumps(scraped, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  · Checkpoint disimpan ({new_count} baru)")

    # Simpan final
    OUTPUT_JSON.write_text(json.dumps(scraped, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nHasil disimpan ke {OUTPUT_JSON}")

    # Statistik
    from collections import Counter
    dist = Counter(v["tie"] for v in scraped.values())
    print(f"\nDistribusi: high={dist['high']} medium={dist['medium']} low={dist['low']} none={dist['none']}")

    if args.apply:
        print("\nMengaplikasikan ke stocks.js...")
        n = apply_to_stocks_js(scraped)
        print(f"  {n} entri diperbarui di stocks.js.")
    else:
        print(f"\nJalankan dengan --apply untuk update stocks.js:")
        print(f"  python scripts/scrape_ethics.py --apply")

    return 0


if __name__ == "__main__":
    sys.exit(main())
