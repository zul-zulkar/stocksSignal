# 🇵🇸 Pluang Stock Signal

Dashboard sinyal saham AS yang tersedia di **Pluang**, dengan filter etis terhadap afiliasi Israel dan dukungan kedaulatan Palestina.

> **Bukan nasihat investasi.** Tool ini membantu Anda menyaring saham berdasar kriteria etis pribadi dan agregasi sinyal publik. Selalu lakukan riset & verifikasi mandiri.

---

## ✨ Fitur

- **Universe saham** populer Pluang (~984 ticker, mudah ditambah).
- **7 faktor sinyal** per saham (masing-masing −100…+100, bobot di [Metodologi](#-metodologi-skor)):
  - **Teknikal** — RSI(14), SMA50/SMA200 crossover, momentum 1 bulan
  - **Momentum** — return 6 bulan relatif vs S&P 500 (Fama-French)
  - **Sentimen** — konsensus analis (otomatis dari yfinance) & short interest
  - **Berita** — heuristik kata-kunci dari headline yfinance
  - **Makro/Kebijakan** — eksposur regulasi/sanksi/geopolitik (kualitatif)
  - **Kualitas/Profil** — market cap, margin, dividen, leverage (quality factor)
  - **Valuasi** — forward P/E vs rata-rata pasar (value factor)
- **Filter etis** 3 mode:
  - `strict` – buang semua saham dengan afiliasi Israel kuat.
  - `balanced` – buang afiliasi kuat, beri penalti 25 poin untuk eksposur sedang.
  - `loose` – tampilkan semua, hanya beri tag.
- **Forever Pocket** — saham long-term terbaik yang lolos filter ketat, cocok untuk fitur **Pocket** Pluang (DCA otomatis).
- **Sortir & cari** berdasar ticker, sektor, aksi, harga, atau jenis sinyal.

### 🆕 Fitur pendapatan & interaksi (baru)

- **Rekomendasi Aksi** — setiap saham mendapat badge **BELI KUAT / BELI / TAHAN / KURANGI / HINDARI**, hasil gabungan skor komposit + konsensus analis + upside ke target + valuasi + teknikal + filter etis. Lihat `js/advice.js`.
- **Data analis riil** — rating konsensus (Strong Buy…Sell), jumlah analis, dan **target harga** ditarik dari yfinance ke `data/analyst.js`. Sinyal **Sentimen** kini terisi otomatis dari `recommendationMean`.
- **Tampilan (view) cepat**: **Semua · Peluang · Watchlist · Dividen** — segmented tab di desktop, bottom-nav ala app di mobile.
  - **Peluang** — hanya saham ber-rekomendasi BELI/BELI KUAT.
  - **Watchlist + Portofolio** — tandai ★, catat lembar & harga beli, lihat untung/rugi + estimasi dividen tahunan (disimpan di `localStorage`).
  - **Dividen** — diurut yield + estimator pendapatan pasif.
- **Refresh per-saham** — tombol ↻ di kartu/modal memperbarui harga & teknikal satu saham secara instan (in-memory, tanpa PAT).
- **Update Penuh** — tombol di header memicu pipeline lengkap di GitHub Actions (`refresh.yml`) via API; butuh PAT izin **Actions: Read and write**.
- **Mobile-friendly & interaktif** — kartu kaya (harga live, %perubahan, badge aksi), gestur **geser-tutup** modal & **tarik-untuk-refresh**, skeleton loading, animasi angka, serta **tema terang/gelap** (tersimpan).

---

## 🚀 Cara pakai

### 1. Buka dashboard
Dashboard ini **fully static** (HTML+CSS+JS, tanpa build step) dan di-host gratis di **GitHub Pages**: [zul-zulkar.github.io/stocksSignal](https://zul-zulkar.github.io/stocksSignal/).

Untuk menjalankan lokal, **jangan** buka `index.html` lewat klik dua kali (`file://` membuat data gagal dimuat). Pakai server statis:
```bash
python -m http.server 8000   # lalu buka http://localhost:8000
```

### 2. Cara data diperbarui

Ada 3 jalur. **Yang paling andal = dari laptop (B).**

**A. Otomatis (terjadwal) — GitHub Actions.** `refresh.yml` jalan **tiap Senin 08:00 WIB**, `refresh-and-deploy.yml` **4× sehari** (hari kerja). Keduanya menjalankan `scripts/fetch_signals.py` (yfinance) lalu commit + deploy.
> ⚠️ **Catatan penting:** Yahoo Finance sering **rate-limit / blokir IP datacenter GitHub**, jadi sebuah run terjadwal bisa hanya memperbarui sebagian (atau, jarang, nol) ticker. Run terjadwal berikutnya melengkapinya. Skrip punya **safeguard**: kalau 0 ticker berhasil, `data/*` **tidak ditimpa** sehingga dashboard tetap menampilkan status valid terakhir (tak muncul badge keliru "0/984").
> Catatan billing: kalau Actions akun ter-pause (mis. spending limit), **semua** run + deploy Pages ikut beku sampai dibereskan — lihat [Troubleshooting](#-troubleshooting).

**B. Manual dari laptop (paling andal — IP rumah tidak diblokir Yahoo).**
```bash
pip install -r requirements.txt
python scripts/fetch_signals.py          # ~30–60 menit untuk 984 ticker
git add data/ && git commit -m "data refresh" && git push
```
Ini memperbarui **semua**: teknikal, momentum, berita, kualitas, valuasi, fundamental, **data analis** (`data/analyst.js`), dan sinyal sentimen turunannya. Tambahkan `--limit N` untuk uji cepat.

**C. Tombol di aplikasi.**
- **Update Penuh** (header) — memicu `refresh.yml` di GitHub via API. Butuh PAT izin **Actions: Read and write**. (Tetap tunduk pada batasan yfinance↔GitHub di atas.)
- **Refresh** & **↻ per-saham** — menarik harga+teknikal dari Stooq lewat *CORS proxy publik*. **Rapuh**: proxy sering down, dan di **Safari iOS** kerap muncul "Load failed". Untuk hasil pasti, pakai jalur A/B.

**Setup PAT (untuk tombol Refresh/Update Penuh):** [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) → Only select repositories `zul-zulkar/stocksSignal` → Permissions → **Contents: Read and write** + **Actions: Read and write** → Generate → paste ke modal di dashboard (disimpan di `localStorage` HP saja).

### 3. Pakai di Pluang
- Buka tab **Forever Pocket** di dashboard.
- Catat 5–10 ticker teratas.
- Di app Pluang → fitur **Pocket** → buat pocket baru → masukkan ticker tersebut dengan alokasi yang Anda mau (mis. equal-weight 10% per saham).
- Set DCA mingguan/bulanan.

---

## 🧮 Metodologi skor

### Skor komposit
Bobot 7-faktor (metodologi Fama-French momentum & quality, AQR "Quality Minus Junk", value framework Research Affiliates):
| Sinyal           | Bobot |
|------------------|-------|
| Teknikal         | 15%   |
| Momentum         | 15%   |
| Sentimen         | 10%   |
| Berita           | 10%   |
| Makro/Kebijakan  | 15%   |
| Kualitas/Profil  | 20%   |
| Valuasi          | 15%   |

Setiap sinyal di-skor **−100 … +100**. Komposit dipetakan ke skala **0 – 100**, lalu dikurangi penalti etis.

### Rekomendasi Aksi
Skor komposit **bukan** sinyal beli/jual mentah. `js/advice.js` menerjemahkannya jadi verdict **BELI KUAT / BELI / TAHAN / KURANGI / HINDARI** dengan menggabungkan: skor komposit, konsensus analis (`recommendationMean`), upside ke target harga, valuasi, teknikal, dan filter etis. Target harga & % upside diambil dari `data/analyst.js`.

### Penalti etis
Setelah komposit dihitung, dikurangi penalti:

| Tag etika                | strict      | balanced | loose |
|--------------------------|-------------|----------|-------|
| `high` (afiliasi kuat)   | dikeluarkan | dikeluarkan | 0   |
| `medium` (eksposur sedang) | 25        | 25       | 0     |
| `low`                    | 5           | 5        | 0     |
| `none`                   | 0           | 0        | 0     |
| `unknown`                | 10          | 10       | 0     |

### Kriteria Forever Pocket
Saham terpilih harus memenuhi **semua**:
1. `israelTie ∈ {none, low}`
2. `signal.profile ≥ 60` (kualitas/likuiditas tinggi)
3. `dividendYield ≥ 1%` **atau** `marketCap ≥ $200B` (mature & stabil)

Lalu diurutkan berdasar skor komposit setelah penalti etis (mode strict).

---

## 🕊️ Sumber data etika

Penilaian afiliasi Israel mengacu pada laporan publik yang kredibel:

| Sumber | Kontribusi |
|--------|------------|
| [BDS Movement](https://bdsmovement.net) | Daftar resmi target boikot konsumen & divestasi |
| [AFSC Investigate](https://investigate.afsc.org) | Database perusahaan & pendudukan |
| [Who Profits Research Center](https://whoprofits.org) | Riset perusahaan yang mendapat untung dari pendudukan |
| [Don't Buy Into Occupation](https://dontbuyintooccupation.org) | Laporan koalisi 27 LSM tentang lembaga keuangan |
| [UN OHCHR Database](https://www.ohchr.org/en/hr-bodies/hrc/regular-sessions/session43/list-database) | Daftar PBB perusahaan beroperasi di permukiman |
| Human Rights Watch, +972 Magazine, Reuters, AP, Times of Israel | Verifikasi berita |

> **Penting:** kondisi perusahaan bisa berubah (mis. Nike menutup operasi langsung di Israel pertengahan 2024, Puma berhenti sponsor IFA 2024). Lakukan verifikasi terbaru sebelum keputusan akhir. Edit `data/stocks.js` jika menemukan info baru.

---

## ⚖️ Catatan etis & batasan

1. **"Mendukung kedaulatan Palestina"** sangat jarang dinyatakan eksplisit oleh korporasi besar AS. Yang realistis dilakukan dashboard ini adalah **menghindari yang berafiliasi kuat dengan pendudukan/militer Israel**, bukan mencari yang aktif memperjuangkan Palestina. Field `palestineSupport` disediakan untuk ditandai jika ada bukti konkret.
2. **ETF** (mis. SCHD, VYM) ditandai `medium` karena keranjangnya berisi sebagian saham `high`. Jika Anda ingin sangat ketat, gunakan saham individual.
3. **Sektor pertahanan** (LMT, RTX, BA, GD, NOC) semuanya `high` karena merupakan pemasok utama persenjataan Israel — apapun mode filter, sebaiknya dihindari jika kriteria etis Anda ketat.
4. **Big Tech** (MSFT, GOOGL, AMZN) `high` karena Project Nimbus dan kontrak militer, INTC `high` karena fasilitas fab utama di Israel. Alternatifnya: **TSM**, **AMD**, **ASML** (relatif bersih).
5. Penilaian ini **tidak menggantikan** fatwa keagamaan. Untuk kepatuhan syariah penuh, gunakan screening DSN-MUI/AAOIFI tambahan.

---

## 🔄 Kenapa scraping tidak di client?

**Singkat: CORS.** Browser memblok JS dari fetch langsung ke Yahoo Finance, Reuters, dll. — server-server itu tidak mengirim header `Access-Control-Allow-Origin: *`. Workaround yang ada semuanya kompromi:

| Pendekatan | Pro | Kontra |
|------------|-----|--------|
| **GitHub Actions cron (dipakai di sini)** | Gratis, audit trail via git, no key terekspos | Tidak real-time; **Yahoo sering rate-limit IP runner GitHub** → sebagian/seluruh ticker bisa gagal (run berikutnya melengkapi) |
| Client + API key (Alpha Vantage dll) | Real-time saat buka halaman | Key kelihatan di DevTools, rate limit ketat (5 req/menit) |
| Client + CORS proxy publik | Tanpa setup | Proxy bisa mati/lambat, traffic terbaca pihak ketiga |
| Vercel/Cloudflare Workers proxy | Cepat, key tersembunyi | Butuh akun & setup deploy tambahan |
| Scrape HTML di browser | — | Diblok same-origin policy, tidak mungkin |

Untuk dashboard jangka panjang (bukan day trading), refresh terjadwal sudah cukup. Catatan jujur: karena Yahoo memblokir IP datacenter, refresh **paling andal** tetap dari **laptop** (IP rumah) — lihat [Cara data diperbarui](#2-cara-data-diperbarui) jalur B.

## 🛟 Troubleshooting

**Situs live tidak meng-update padahal sudah `git push`.**
GitHub Pages "Deploy from a branch" diam-diam memakai Actions (workflow internal *pages build and deployment*). Kalau Actions akun ter-**pause** (mis. *spending limit* tercapai gara-gara repo privat lain memakai menit ber-bayar), **semua** deploy ikut beku — perubahan masuk ke repo tapi situs tetap versi lama. Ciri khas: run Actions `failure` dengan **`steps=0`** (job tak pernah mulai). Repo public itu Actions-nya gratis; periksa **github.com/settings/billing** (spending limit) dan matikan/publik-kan repo privat yang memakai Actions.

**Run terjadwal "gagal" / hanya sebagian ticker ter-update.**
Wajar — Yahoo me-rate-limit IP runner GitHub. Run terjadwal berikutnya melengkapi. Kalau 0 ticker berhasil, `scripts/fetch_signals.py` **tidak menimpa** `data/*` (dashboard tetap pakai data valid terakhir). Untuk hasil pasti, jalankan dari laptop (jalur B).

**Tombol Refresh / Update Penuh "Load failed" di HP.**
Browser (terutama **Safari iOS**) memblokir permintaan keluar ke CORS proxy / api.github.com. Coba: matikan *Prevent Cross-Site Tracking*, atau pakai browser/laptop lain. Paling pasti: jalankan workflow langsung dari **tab Actions GitHub** (tombol *Run workflow*), atau refresh dari laptop.

## 📁 Struktur file

```
.
├── index.html              # Dashboard utama
├── compare.html            # Halaman bandingkan 2 saham
├── styles.css              # Styling + tema terang/gelap (incl. mobile)
├── data/
│   ├── stocks.js           # Universe 984 ticker + dataset etika + 7 sinyal
│   ├── analyst.js          # Rekomendasi & target harga analis (yfinance)
│   ├── signals-overlay.js  # Overlay teknikal hasil tombol Refresh (Stooq)
│   └── meta.js             # Status refresh terakhir
├── js/
│   ├── signals.js          # Skor komposit 7-faktor + filter etis + Forever Pocket
│   ├── advice.js           # Verdict Aksi (Beli/Tahan/Jual) + target/upside
│   ├── watchlist.js        # Watchlist & portofolio (localStorage)
│   ├── refresh.js          # Refresh Stooq + commit/dispatch GitHub
│   ├── app.js              # Render UI, views, modal, gestur, tema, wiring
│   └── compare.js          # Logika halaman bandingkan
├── scripts/
│   ├── fetch_signals.py    # Refresh penuh dari laptop (yfinance) + data analis
│   ├── review_ethics.py    # Klasifikasi etika cepat (database offline)
│   ├── scrape_ethics.py    # Scrape etika (Who Profits/BDS/AFSC)
│   ├── add_tickers.py      # Tambah ticker baru massal
│   └── run_full_update.py  # Orkestrasi pipeline penuh
├── tests/
│   ├── test_fetch_signals.py   # Unit test Python (unittest)
│   └── js/*.test.cjs           # Unit test JS (node:test, via vm)
├── .github/workflows/
│   ├── refresh.yml             # Cron Senin + dispatch (tombol Update Penuh)
│   ├── refresh-and-deploy.yml  # Cron 4×/hari + deploy Pages
│   └── tests.yml               # Jalankan test tiap push/PR
├── requirements.txt
└── README.md
```

## 🛠️ Menambah ticker baru

Edit `data/stocks.js` dan tambahkan blok:

```js
{
  ticker: "XYZ",
  name: "Contoh Corp.",
  sector: "Technology",
  ethics: {
    israelTie: "none",          // high | medium | low | none | unknown
    rationale: "Penjelasan singkat & evidence.",
    sources: ["Sumber 1", "Sumber 2"],
    palestineSupport: "none"    // documented | statements | none
  },
  fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
  signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 0 }
}
```

Atau pakai `scripts/add_tickers.py` (isi `scripts/new_tickers.txt`, satu ticker per baris). Lalu jalankan `python scripts/fetch_signals.py` untuk auto-fill bagian numerik + data analis.

---

## 🧪 Testing

Logika murni (skor, verdict aksi, watchlist, matematika refresh) punya unit test. Tidak ada build step — test berjalan dengan runner bawaan.

**Python** (fungsi skoring + analis + sentimen + `update_stock_block`):
```bash
pip install "pandas>=2.0"        # untuk uji sinyal teknikal (opsional)
python -m unittest discover -s tests -p "test_*.py" -v
```

**JavaScript** (`signals.js`, `advice.js`, `refresh.js`, `watchlist.js`) — butuh Node ≥ 18:
```bash
node --test tests/js/
```

Keduanya juga jalan otomatis di CI via `.github/workflows/tests.yml` setiap push & PR.

---

## 🤝 Kontribusi

Repo ini bersifat **personal-research**. Jika Anda menemukan klasifikasi etika yang outdated atau keliru, silakan buka PR dengan menyertakan **link sumber publik** untuk klaim baru.

## 🔓 Lisensi

MIT — gunakan, fork, modifikasi sesuai kebutuhan Anda.
