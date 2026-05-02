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

### 2. (Opsional) Refresh data live
```bash
pip install -r requirements.txt
python scripts/fetch_signals.py
```
Script akan menarik data dari Yahoo Finance dan memperbarui sinyal **teknikal**, **berita**, **profil**, plus fundamental (dividen, market cap, payout ratio) di `data/stocks.js`. Sinyal **sentimen** dan **kebijakan** tetap manual karena bersifat kualitatif.

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

## 📁 Struktur file

```
.
├── index.html              # Halaman dashboard
├── styles.css              # Styling
├── data/
│   └── stocks.js           # Universe + dataset etika
├── js/
│   ├── signals.js          # Logic skor komposit & filter
│   └── app.js              # Render UI, sortir, modal
├── scripts/
│   └── fetch_signals.py    # (Opsional) refresh data live
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
