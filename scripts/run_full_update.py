#!/usr/bin/env python3
"""
run_full_update.py
==================
Master script — jalankan seluruh pipeline update data stocks.js secara berurutan:

  Langkah 1 · review_ethics.py   → isi ethics offline (ETF + ~250 known + default)
  Langkah 2 · scrape_ethics.py   → sempurnakan ethics via web scraping (Who Profits,
                                    BDS, AFSC, DuckDuckGo)
  Langkah 3 · fetch_signals.py   → update sinyal teknikal/fundamental dari yfinance

Cara pakai:
  pip install -r requirements.txt
  python scripts/run_full_update.py                 # jalankan semua langkah
  python scripts/run_full_update.py --ethics-only   # hanya update ethics
  python scripts/run_full_update.py --signals-only  # hanya update sinyal
  python scripts/run_full_update.py --skip-scrape   # skip web scraping (hemat waktu)
  python scripts/run_full_update.py --skip-signals  # jangan sentuh sinyal
  python scripts/run_full_update.py --dry-run       # lihat apa yang akan dijalankan

Estimasi waktu:
  review_ethics  ~1–5 menit   (tidak ada network, cepat)
  scrape_ethics  ~30–120 menit (984 ticker × 2–4 detik delay = lambat, bisa resume)
  fetch_signals  ~30–60 menit  (984 ticker × yfinance API)
  Total full     ~1–3 jam
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent


def run(cmd: list[str], label: str, dry: bool) -> bool:
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"  Perintah: {' '.join(cmd)}")
    print(f"{'='*60}")
    if dry:
        print("  [DRY-RUN] dilewati.")
        return True
    t0 = time.time()
    result = subprocess.run(cmd, check=False)
    elapsed = time.time() - t0
    mins, secs = divmod(int(elapsed), 60)
    status = "SELESAI" if result.returncode == 0 else f"GAGAL (exit {result.returncode})"
    print(f"\n  → {status} dalam {mins}m {secs}s")
    return result.returncode == 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Pipeline update lengkap: ethics + sinyal untuk semua saham"
    )
    parser.add_argument("--ethics-only",   action="store_true",
                        help="Hanya jalankan langkah ethics (review + scrape)")
    parser.add_argument("--signals-only",  action="store_true",
                        help="Hanya jalankan fetch_signals.py")
    parser.add_argument("--skip-review",   action="store_true",
                        help="Lewati review_ethics.py (offline classification)")
    parser.add_argument("--skip-scrape",   action="store_true",
                        help="Lewati scrape_ethics.py (web scraping, hemat waktu)")
    parser.add_argument("--skip-signals",  action="store_true",
                        help="Lewati fetch_signals.py")
    parser.add_argument("--skip-bds",      action="store_true",
                        help="Teruskan ke scrape_ethics: skip BDS source")
    parser.add_argument("--skip-whoprofits", action="store_true",
                        help="Teruskan ke scrape_ethics: skip Who Profits source")
    parser.add_argument("--skip-afsc",     action="store_true",
                        help="Teruskan ke scrape_ethics: skip AFSC source")
    parser.add_argument("--ddg-only",      action="store_true",
                        help="Teruskan ke scrape_ethics: gunakan DuckDuckGo saja")
    parser.add_argument("--dry-run",       action="store_true",
                        help="Tampilkan langkah tanpa mengeksekusi")
    args = parser.parse_args()

    py = sys.executable

    do_review  = not args.skip_review  and not args.signals_only
    do_scrape  = not args.skip_scrape  and not args.signals_only
    do_signals = not args.skip_signals and not args.ethics_only

    print("\n╔══════════════════════════════════════════════╗")
    print("║        run_full_update.py — Pipeline         ║")
    print("╚══════════════════════════════════════════════╝")
    print(f"  Langkah 1 · review_ethics : {'AKTIF' if do_review  else 'DILEWATI'}")
    print(f"  Langkah 2 · scrape_ethics : {'AKTIF' if do_scrape  else 'DILEWATI'}")
    print(f"  Langkah 3 · fetch_signals : {'AKTIF' if do_signals else 'DILEWATI'}")
    if args.dry_run:
        print("\n  *** DRY-RUN MODE — tidak ada yang diubah ***")

    success = True

    # ── Langkah 1: offline classification ─────────────────────────────────────
    if do_review:
        ok = run(
            [py, str(SCRIPTS / "review_ethics.py")],
            "Langkah 1/3 · review_ethics.py  (offline ethics classification)",
            args.dry_run,
        )
        if not ok:
            print("\n  PERINGATAN: review_ethics gagal — lanjut ke langkah berikutnya.")
            success = False

    # ── Langkah 2: web scraping ethics ────────────────────────────────────────
    if do_scrape:
        scrape_cmd = [py, str(SCRIPTS / "scrape_ethics.py"), "--apply"]
        if args.skip_bds:          scrape_cmd.append("--skip-bds")
        if args.skip_whoprofits:   scrape_cmd.append("--skip-whoprofits")
        if args.skip_afsc:         scrape_cmd.append("--skip-afsc")
        if args.ddg_only:          scrape_cmd.append("--ddg-only")
        ok = run(
            scrape_cmd,
            "Langkah 2/3 · scrape_ethics.py  (web scraping: Who Profits, BDS, AFSC, DDG)",
            args.dry_run,
        )
        if not ok:
            print("\n  PERINGATAN: scrape_ethics gagal — lanjut ke langkah berikutnya.")
            success = False

    # ── Langkah 3: update sinyal keuangan ─────────────────────────────────────
    if do_signals:
        ok = run(
            [py, str(SCRIPTS / "fetch_signals.py")],
            "Langkah 3/3 · fetch_signals.py  (update sinyal teknikal + fundamental)",
            args.dry_run,
        )
        if not ok:
            print("\n  PERINGATAN: fetch_signals gagal.")
            success = False

    # ── Ringkasan ─────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    if args.dry_run:
        print("  DRY-RUN selesai. Tidak ada file yang diubah.")
    elif success:
        print("  ✓ Semua langkah selesai. data/stocks.js telah diperbarui.")
        print()
        print("  Langkah selanjutnya (opsional):")
        print("  · Verifikasi manual entri dengan '(auto-klasifikasi)' di sources")
        print("  · git diff data/stocks.js  ← lihat perubahan")
        print("  · git commit -am 'data: full ethics + signals update'")
    else:
        print("  PERINGATAN: Satu atau lebih langkah gagal — periksa output di atas.")
    print("="*60 + "\n")

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
