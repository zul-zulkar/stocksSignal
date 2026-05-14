# 🇵🇸 Pluang Stock Signal

Dashboard sinyal saham AS yang tersedia di **Pluang**, dengan filter etis terhadap afiliasi Israel dan dukungan kedaulatan Palestina.

> **Bukan nasihat investasi.** Tool ini membantu Anda menyaring saham berdasar kriteria etis pribadi dan agregasi sinyal publik. Selalu lakukan riset & verifikasi mandiri.

---

## ✨ Fitur

- **Universe saham** populer Pluang (~50 ticker, mudah ditambah).
- **5 jenis sinyal** per saham:
  - **Teknikal** — RSI(14), SMA50/SMA200 crossover, momentum 1 bulan
  - **Sentimen** — sentimen pasar/analis (kualitatif)
  - **Berita** — heuristik kata-kunci dari headline yfinance
  - **Kebijakan** — eksposur regulasi/sanksi/geopolitik
  - **Profil** — kualitas perusahaan (mkt cap, margin, dividen, leverage)
- **Filter etis** 3 mode:
  - `strict` – buang semua saham dengan afiliasi Israel kuat.
  - `balanced` – buang afiliasi kuat, beri penalti 25 poin untuk eksposur sedang.
  - `loose` – tampilkan semua, hanya beri tag.
- **Forever Pocket** — list 10 saham long-term terbaik yang lolos filter ketat, cocok untuk fitur **Pocket** Pluang (DCA otomatis).
- **Sortir & cari** berdasar ticker, sektor, atau jenis sinyal.

---

## 🚀 Cara pakai

### 1. Buka dashboard
Cukup buka `index.html` di browser:
```bash
open index.html       # macOS
xdg-open index.html   # Linux
start index.html      # Windows
```

Atau host gratis di GitHub Pages — dashboard ini fully static (HTML+CSS+JS, tanpa build step).

### 2. Refresh data otomatis (cron)
Workflow `.github/workflows/refresh-and-deploy.yml` berjalan **4× sehari** mengelilingi jam pasar AS (pre-market, mid-market, jelang close, post-market WIB). Setiap run:
1. Tarik harga & fundamental dari Yahoo Finance via `yfinance`.
2. Hitung ulang sinyal **teknikal**, **berita**, **profil**.
3. Commit perubahan ke `main` (kalau ada diff).
4. Auto-deploy ke GitHub Pages.

Jadi setiap kali Anda buka URL di HP, data sudah segar (maksimum lag ~6 jam). Badge di header menampilkan status "Segar / Mulai usang / Lama".

Manual trigger juga bisa: tab **Actions** → pilih workflow → **Run workflow**.

### 3. (Opsional) Refresh manual lokal
```bash
pip install -r requirements.txt
python scripts/fetch_signals.py
```
Berguna kalau ingin menambah ticker baru lalu langsung lihat sinyalnya tanpa menunggu cron.

### 3. Pakai di Pluang
- Buka tab **Forever Pocket** di dashboard.
- Catat 5–10 ticker teratas.
- Di app Pluang → fitur **Pocket** → buat pocket baru → masukkan ticker tersebut dengan alokasi yang Anda mau (mis. equal-weight 10% per saham).
- Set DCA mingguan/bulanan.

---

## 🧮 Metodologi skor

### Skor komposit
Bobot:
| Sinyal     | Bobot |
|------------|-------|
| Teknikal   | 25%   |
| Sentimen   | 15%   |
| Berita     | 15%   |
| Kebijakan  | 15%   |
| Profil     | 30%   |

Setiap sinyal di-skor **−100 … +100**. Komposit dipetakan ke skala **0 – 100**.

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
| **GitHub Actions cron (dipakai di sini)** | Gratis, reliable, audit trail via git, no key terekspos | Refresh tidak real-time (max 4×/hari) |
| Client + API key (Alpha Vantage dll) | Real-time saat buka halaman | Key kelihatan di DevTools, rate limit ketat (5 req/menit) |
| Client + CORS proxy publik | Tanpa setup | Proxy bisa mati/lambat, traffic terbaca pihak ketiga |
| Vercel/Cloudflare Workers proxy | Cepat, key tersembunyi | Butuh akun & setup deploy tambahan |
| Scrape HTML di browser | — | Diblok same-origin policy, tidak mungkin |

Untuk dashboard yang hanya butuh refresh ~6 jam sekali (saham jangka panjang, bukan day trading), **GitHub Actions cron adalah pilihan paling sehat**. Saham AS tutup malam WIB, jadi refresh post-close sudah cukup untuk keputusan harian.

## 📁 Struktur file

```
.
├── index.html                              # Halaman dashboard
├── styles.css                              # Styling (incl. mobile)
├── data/
│   ├── stocks.js                           # Universe + dataset etika
│   └── meta.js                             # Timestamp last-refresh (auto-generated)
├── js/
│   ├── signals.js                          # Logic skor komposit & filter
│   └── app.js                              # Render UI, sortir, modal
├── scripts/
│   └── fetch_signals.py                    # Refresh data (dipanggil cron)
├── .github/workflows/
│   └── refresh-and-deploy.yml              # Cron 4×/hari → scrape → commit → deploy
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
  signals: { technical: 0, sentiment: 0, news: 0, policy: 0, profile: 0 }
}
```

Lalu jalankan ulang `python scripts/fetch_signals.py` untuk auto-fill bagian numerik.

---

## 🤝 Kontribusi

Repo ini bersifat **personal-research**. Jika Anda menemukan klasifikasi etika yang outdated atau keliru, silakan buka PR dengan menyertakan **link sumber publik** untuk klaim baru.

## 🔓 Lisensi

MIT — gunakan, fork, modifikasi sesuai kebutuhan Anda.
