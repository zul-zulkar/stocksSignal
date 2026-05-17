# Tests

Test suite tanpa dependency. Cakupan:

- **Syntax check** semua file JS (`data/*.js`, `js/*.js`)
- **`signals.js`** — `compositeSignal`, `ethicsAdjustedScore` (3 mode × 5 tier), `ethicsBadge`, `signalBar`, `buildForeverPocket`
- **`refresh.js`** — `rsi14` (5 case), `computeTechScore` (bull/bear linier & multiplicative), `stooqSymbol`, `parseStooqCSV` (valid/empty/missing-col/non-numeric/CRLF), `serializeOverlay`/`serializeMeta` round-trip, `applyOverlay`, PAT helpers
- **`data/stocks.js`** — schema, no duplicate tickers, semua nilai sinyal ∈ [-100,100], fundamentals ≥ 0, ticker format Stooq-compatible
- **Integrasi** — full-chain load, mode strict mengeliminasi semua `high`, mode loose tidak mengeliminasi siapa pun

## Jalankan lokal

```bash
node tests/run.js
```

Exit code: `0` = lulus, `1` = ada gagal. Tidak butuh `npm install` — pure Node ≥18 (pakai modul built-in `vm`, `fs`, `path`).

## Auto-run di GitHub

Workflow `.github/workflows/test.yml` jalankan test tiap push ke `main` atau branch `claude/*`, dan tiap PR. Status (lulus/gagal) bisa dilihat di tab **Actions** repo — bisa dipantau dari browser HP, tidak perlu Node terinstall di HP.
