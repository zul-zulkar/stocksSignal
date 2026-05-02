// =====================================================================
// Universe saham Pluang yang dikurasi + dataset etika.
//
// Skala etika (israelTie):
//   "high"    – Terdokumentasi kuat di kampanye BDS / Who Profits / AFSC
//               Investigate / laporan "Don't Buy Into Occupation".
//   "medium"  – Operasi/kemitraan signifikan dengan entitas Israel atau
//               kontroversi publik, tapi belum jadi target boikot utama.
//   "low"     – Eksposur kecil / tidak terkonfirmasi luas.
//   "none"    – Tidak ada keterkaitan signifikan yang terdokumentasi.
//   "unknown" – Belum ditinjau.
//
// palestineSupport:
//   "documented" – Aksi konkret (mis. menarik dari permukiman ilegal).
//   "statements" – Pernyataan publik mendukung gencatan/HAM Palestina.
//   "none"       – Tidak ada pernyataan/aksi yang tercatat.
//
// Skor sinyal: -100 (sangat bearish) … +100 (sangat bullish), 0 = netral.
// Nilai default di sini adalah baseline kualitatif. Untuk data live,
// jalankan scripts/fetch_signals.py (lihat README).
// =====================================================================

window.STOCK_UNIVERSE = [
  // ---------- BIG TECH ----------
  {
    ticker: "AAPL", name: "Apple Inc.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "Memiliki pusat R&D di Herzliya & Haifa (akuisisi PrimeSense, Anobit). Bukan target boikot utama BDS, tapi tergolong eksposur signifikan.",
      sources: ["Apple Israel R&D press", "Who Profits database"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.5, payoutRatio: 15, marketCapB: 3000 },
    signals: { technical: 25, sentiment: 30, news: 10, policy: 15, profile: 60 }
  },
  {
    ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Akuisisi besar perusahaan Israel (mis. AnyVision/Oosto kontroversial), kontrak dengan militer Israel, investasi cloud Azure di Israel.",
      sources: ["+972 Magazine", "Who Profits", "AP News (2024)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.7, payoutRatio: 25, marketCapB: 3100 },
    signals: { technical: 40, sentiment: 35, news: 5, policy: 10, profile: 70 }
  },
  {
    ticker: "GOOGL", name: "Alphabet Inc. (Google)", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Project Nimbus: kontrak USD 1,2 miliar layanan cloud bersama Amazon untuk pemerintah & militer Israel.",
      sources: ["The Intercept", "Time Magazine", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.4, payoutRatio: 8, marketCapB: 2100 },
    signals: { technical: 35, sentiment: 25, news: -5, policy: 0, profile: 65 }
  },
  {
    ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Mitra utama Project Nimbus untuk pemerintah & militer Israel. Dikritik 'No Tech for Apartheid'.",
      sources: ["The Guardian", "Project Nimbus docs", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1900 },
    signals: { technical: 30, sentiment: 30, news: -5, policy: 5, profile: 60 }
  },
  {
    ticker: "META", name: "Meta Platforms Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "medium",
      rationale: "Tuduhan sensor sistematis konten pro-Palestina (laporan BSR 2022 yang dikomisikan Meta sendiri).",
      sources: ["BSR independent report 2022", "Human Rights Watch"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.4, payoutRatio: 10, marketCapB: 1300 },
    signals: { technical: 45, sentiment: 25, news: 0, policy: 5, profile: 55 }
  },
  {
    ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "Pusat R&D besar di Yokneam (eks Mellanox). Bukan target boikot utama.",
      sources: ["NVIDIA Israel press", "Mellanox acquisition"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.03, payoutRatio: 1, marketCapB: 2800 },
    signals: { technical: 70, sentiment: 60, news: 20, policy: 10, profile: 80 }
  },
  {
    ticker: "INTC", name: "Intel Corp.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Pemberi kerja swasta terbesar di Israel; pabrik Fab 28 & Fab 38 (Kiryat Gat) dengan subsidi besar pemerintah Israel.",
      sources: ["Reuters", "Times of Israel", "Investopedia"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.5, payoutRatio: 50, marketCapB: 130 },
    signals: { technical: -20, sentiment: -10, news: -15, policy: -5, profile: 30 }
  },
  {
    ticker: "AMD", name: "Advanced Micro Devices", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "R&D kecil di Israel via akuisisi Xilinx, namun bukan target boikot dan ketergantungan operasional minim.",
      sources: ["AMD investor docs"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 250 },
    signals: { technical: 30, sentiment: 35, news: 10, policy: 5, profile: 60 }
  },
  {
    ticker: "ORCL", name: "Oracle Corp.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Larry Ellison (founder) donor besar pro-Israel; Oracle aktif menyediakan cloud untuk lembaga Israel.",
      sources: ["Forbes", "TechCrunch", "Oracle Israel press"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.2, payoutRatio: 30, marketCapB: 380 },
    signals: { technical: 30, sentiment: 25, news: 5, policy: 10, profile: 50 }
  },
  {
    ticker: "IBM", name: "International Business Machines", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "IBM Israel besar; sejarah kontroversial (laporan kerjasama database populasi).",
      sources: ["Edwin Black 'IBM and the Holocaust'", "IBM Israel press"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.6, payoutRatio: 60, marketCapB: 200 },
    signals: { technical: 20, sentiment: 15, news: 5, policy: 0, profile: 40 }
  },
  {
    ticker: "CRM", name: "Salesforce Inc.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "Akuisisi ClickSoftware (Israel); kantor R&D Tel Aviv.",
      sources: ["Salesforce press"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.5, payoutRatio: 15, marketCapB: 280 },
    signals: { technical: 25, sentiment: 20, news: 0, policy: 0, profile: 55 }
  },
  {
    ticker: "ADBE", name: "Adobe Inc.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "R&D di Petah Tikva via akuisisi Allegorithmic & Magento.",
      sources: ["Adobe Israel"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 220 },
    signals: { technical: 10, sentiment: 15, news: 0, policy: 0, profile: 60 }
  },
  {
    ticker: "TSM", name: "Taiwan Semiconductor Mfg.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan operasional/kontrak pertahanan Israel yang terdokumentasi.",
      sources: ["TSMC annual report"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.4, payoutRatio: 35, marketCapB: 800 },
    signals: { technical: 60, sentiment: 55, news: 20, policy: 10, profile: 75 }
  },
  {
    ticker: "BABA", name: "Alibaba Group", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Investasi minor di startup Israel, namun bukan mitra militer atau target boikot.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 20, marketCapB: 200 },
    signals: { technical: 20, sentiment: 10, news: -5, policy: -15, profile: 50 }
  },
  {
    ticker: "ASML", name: "ASML Holding NV", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Vendor litografi global; tidak ada hubungan militer Israel langsung yang signifikan.",
      sources: ["ASML annual report"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 30, marketCapB: 280 },
    signals: { technical: 30, sentiment: 25, news: 10, policy: 5, profile: 70 }
  },

  // ---------- KONSUMER & RITEL ----------
  {
    ticker: "SBUX", name: "Starbucks Corp.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Target boikot konsumen luas (gugatan vs serikat Starbucks Workers United terkait posting Gaza). Termasuk daftar boikot prioritas BDS Movement.",
      sources: ["BDS Movement", "Reuters", "AP News"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.6, payoutRatio: 65, marketCapB: 90 },
    signals: { technical: -30, sentiment: -40, news: -30, policy: -20, profile: 35 }
  },
  {
    ticker: "MCD", name: "McDonald's Corp.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Franchise McDonald's Israel memberikan ribuan paket makanan gratis ke militer Israel (Okt 2023). Penurunan penjualan global akibat boikot.",
      sources: ["Reuters", "BDS Movement", "Financial Times"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.4, payoutRatio: 60, marketCapB: 200 },
    signals: { technical: -20, sentiment: -35, news: -25, policy: -15, profile: 50 }
  },
  {
    ticker: "KO", name: "The Coca-Cola Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "high",
      rationale: "Mengoperasikan pabrik di kawasan industri Atarot (permukiman ilegal di Yerusalem Timur).",
      sources: ["Who Profits database", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.0, payoutRatio: 75, marketCapB: 270 },
    signals: { technical: 10, sentiment: -10, news: -5, policy: -10, profile: 60 }
  },
  {
    ticker: "PEP", name: "PepsiCo Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "high",
      rationale: "Memiliki SodaStream dengan pabrik bersejarah di Mishor Adumim (permukiman); Sabra (joint venture dengan Strauss Group).",
      sources: ["Who Profits", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.3, payoutRatio: 75, marketCapB: 220 },
    signals: { technical: 5, sentiment: -15, news: -10, policy: -10, profile: 60 }
  },
  {
    ticker: "DIS", name: "The Walt Disney Co.", sector: "Communication Services",
    ethics: {
      israelTie: "high",
      rationale: "Donasi USD 2 juta ke pasukan Israel pasca Okt 2023; dikritik karena bias konten.",
      sources: ["Variety", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 35, marketCapB: 180 },
    signals: { technical: 0, sentiment: -15, news: -10, policy: -5, profile: 45 }
  },
  {
    ticker: "NFLX", name: "Netflix Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "low",
      rationale: "Tidak terdaftar sebagai target boikot utama; produksi konten Israel ada, juga konten Palestina.",
      sources: ["Public reporting"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 280 },
    signals: { technical: 50, sentiment: 40, news: 15, policy: 5, profile: 65 }
  },
  {
    ticker: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "low",
      rationale: "Bukan target boikot utama; eksposur via produk pihak ketiga.",
      sources: ["Public reporting"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 35, marketCapB: 600 },
    signals: { technical: 50, sentiment: 40, news: 15, policy: 5, profile: 75 }
  },
  {
    ticker: "COST", name: "Costco Wholesale", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan operasional/kontrak pertahanan Israel yang terdokumentasi.",
      sources: ["Costco filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.5, payoutRatio: 28, marketCapB: 380 },
    signals: { technical: 55, sentiment: 50, news: 20, policy: 10, profile: 80 }
  },
  {
    ticker: "TGT", name: "Target Corp.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "low",
      rationale: "Bukan target boikot utama.",
      sources: ["Public reporting"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.5, payoutRatio: 50, marketCapB: 65 },
    signals: { technical: 5, sentiment: 5, news: 0, policy: 0, profile: 55 }
  },
  {
    ticker: "HD", name: "Home Depot Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "medium",
      rationale: "Co-founder Bernie Marcus donor besar pro-Israel; perusahaan tidak masuk daftar boikot inti BDS.",
      sources: ["Forbes", "Public donor records"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.4, payoutRatio: 55, marketCapB: 360 },
    signals: { technical: 25, sentiment: 25, news: 10, policy: 5, profile: 65 }
  },
  {
    ticker: "LOW", name: "Lowe's Companies Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan signifikan terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.7, payoutRatio: 35, marketCapB: 140 },
    signals: { technical: 30, sentiment: 30, news: 10, policy: 5, profile: 70 }
  },
  {
    ticker: "NKE", name: "Nike Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Menutup operasi langsung di Israel pertengahan 2024 (transisi ke distributor). Bukan target boikot utama.",
      sources: ["Reuters", "Times of Israel"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.8, payoutRatio: 40, marketCapB: 110 },
    signals: { technical: -10, sentiment: 0, news: 5, policy: 0, profile: 55 }
  },
  {
    ticker: "PG", name: "Procter & Gamble", sector: "Consumer Defensive",
    ethics: {
      israelTie: "low",
      rationale: "Distribusi global, bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.4, payoutRatio: 60, marketCapB: 380 },
    signals: { technical: 35, sentiment: 30, news: 10, policy: 5, profile: 75 }
  },
  {
    ticker: "CL", name: "Colgate-Palmolive", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan signifikan terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.2, payoutRatio: 55, marketCapB: 80 },
    signals: { technical: 25, sentiment: 25, news: 10, policy: 5, profile: 70 }
  },
  {
    ticker: "KMB", name: "Kimberly-Clark", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan signifikan terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.7, payoutRatio: 70, marketCapB: 45 },
    signals: { technical: 20, sentiment: 20, news: 5, policy: 5, profile: 65 }
  },

  // ---------- ENERGI ----------
  {
    ticker: "CVX", name: "Chevron Corp.", sector: "Energy",
    ethics: {
      israelTie: "high",
      rationale: "Operator ladang gas Leviathan & Tamar setelah akuisisi Noble Energy; royalti & ekspor ke Mesir/Yordania.",
      sources: ["Reuters", "Who Profits", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.5, payoutRatio: 65, marketCapB: 290 },
    signals: { technical: 0, sentiment: -10, news: -5, policy: -10, profile: 65 }
  },
  {
    ticker: "XOM", name: "Exxon Mobil Corp.", sector: "Energy",
    ethics: {
      israelTie: "low",
      rationale: "Aktivitas eksplorasi minor; bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.5, payoutRatio: 50, marketCapB: 480 },
    signals: { technical: 25, sentiment: 25, news: 10, policy: 0, profile: 70 }
  },

  // ---------- DEFENCE / INDUSTRIAL ----------
  {
    ticker: "LMT", name: "Lockheed Martin", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Produsen utama F-35 dan sistem rudal yang dikirim ke Israel.",
      sources: ["US DoD records", "Stockholm SIPRI"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.6, payoutRatio: 50, marketCapB: 110 },
    signals: { technical: 15, sentiment: 5, news: -15, policy: -25, profile: 60 }
  },
  {
    ticker: "RTX", name: "RTX Corp. (Raytheon)", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Komponen Iron Dome (Tamir interceptor); pemasok rudal & sistem pertahanan.",
      sources: ["SIPRI", "Reuters"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.2, payoutRatio: 50, marketCapB: 160 },
    signals: { technical: 10, sentiment: 10, news: -10, policy: -20, profile: 55 }
  },
  {
    ticker: "BA", name: "Boeing Co.", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Pemasok bom GBU-39 SDB & helikopter Apache yang digunakan di Gaza.",
      sources: ["AP News", "Washington Post"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 110 },
    signals: { technical: -20, sentiment: -25, news: -30, policy: -25, profile: 30 }
  },
  {
    ticker: "GD", name: "General Dynamics", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Produsen MK-83/MK-84 bombs & komponen pertahanan untuk Israel.",
      sources: ["SIPRI", "US DoD"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.0, payoutRatio: 45, marketCapB: 80 },
    signals: { technical: 20, sentiment: 10, news: -10, policy: -20, profile: 55 }
  },
  {
    ticker: "NOC", name: "Northrop Grumman", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Pemasok teknologi pertahanan, sistem radar & avionik yang digunakan IDF.",
      sources: ["SIPRI"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.7, payoutRatio: 40, marketCapB: 75 },
    signals: { technical: 15, sentiment: 10, news: -10, policy: -20, profile: 55 }
  },
  {
    ticker: "CAT", name: "Caterpillar Inc.", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Buldoser D9 versi militer digunakan untuk pembongkaran rumah Palestina (kasus Rachel Corrie). Target divestasi BDS.",
      sources: ["BDS Movement", "Human Rights Watch"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.5, payoutRatio: 30, marketCapB: 180 },
    signals: { technical: 25, sentiment: 15, news: -10, policy: -15, profile: 60 }
  },

  // ---------- FINANCIAL ----------
  {
    ticker: "JPM", name: "JPMorgan Chase", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Underwriter obligasi pemerintah Israel; eksposur kredit perusahaan Israel.",
      sources: ["Bloomberg", "Don't Buy Into Occupation report"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.0, payoutRatio: 30, marketCapB: 600 },
    signals: { technical: 30, sentiment: 25, news: 10, policy: 5, profile: 70 }
  },
  {
    ticker: "BAC", name: "Bank of America", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Eksposur kredit & investasi perusahaan terdaftar di laporan 'Don't Buy Into Occupation'.",
      sources: ["DBIO 2023 report"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.5, payoutRatio: 30, marketCapB: 320 },
    signals: { technical: 25, sentiment: 20, news: 5, policy: 0, profile: 60 }
  },
  {
    ticker: "V", name: "Visa Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "low",
      rationale: "Pemroses pembayaran global; bukan target utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.7, payoutRatio: 22, marketCapB: 540 },
    signals: { technical: 35, sentiment: 30, news: 10, policy: 5, profile: 75 }
  },
  {
    ticker: "MA", name: "Mastercard Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "low",
      rationale: "Pemroses pembayaran global; bukan target utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.6, payoutRatio: 20, marketCapB: 460 },
    signals: { technical: 35, sentiment: 30, news: 10, policy: 5, profile: 75 }
  },
  {
    ticker: "BRK.B", name: "Berkshire Hathaway", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Memiliki Iscar/IMC (akuisisi 2006) & ISCAR Metalworking Israel. Tidak masuk daftar boikot konsumen.",
      sources: ["Berkshire annual letters"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 900 },
    signals: { technical: 30, sentiment: 30, news: 10, policy: 5, profile: 80 }
  },

  // ---------- HEALTHCARE / PHARMA ----------
  {
    ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Distribusi farmasi global; bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.1, payoutRatio: 55, marketCapB: 380 },
    signals: { technical: 20, sentiment: 25, news: 10, policy: 5, profile: 75 }
  },
  {
    ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "medium",
      rationale: "Israel jadi negara pertama vaksinasi massal Pfizer; perjanjian data populasi yang kontroversial.",
      sources: ["Reuters", "BMJ"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.0, payoutRatio: 80, marketCapB: 160 },
    signals: { technical: -10, sentiment: 0, news: 0, policy: 0, profile: 55 }
  },
  {
    ticker: "MRK", name: "Merck & Co.", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.0, payoutRatio: 50, marketCapB: 290 },
    signals: { technical: 10, sentiment: 15, news: 5, policy: 5, profile: 70 }
  },
  {
    ticker: "ABBV", name: "AbbVie Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.5, payoutRatio: 50, marketCapB: 320 },
    signals: { technical: 25, sentiment: 25, news: 10, policy: 5, profile: 75 }
  },
  {
    ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Asuransi domestik AS; tidak ada keterkaitan signifikan.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.5, payoutRatio: 30, marketCapB: 460 },
    signals: { technical: 20, sentiment: 20, news: 5, policy: 5, profile: 70 }
  },
  {
    ticker: "NVO", name: "Novo Nordisk (ADR)", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Perusahaan Denmark; tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.9, payoutRatio: 40, marketCapB: 380 },
    signals: { technical: 30, sentiment: 30, news: 10, policy: 5, profile: 80 }
  },

  // ---------- TELECOM & UTIL ----------
  {
    ticker: "T", name: "AT&T Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "low",
      rationale: "Operasi jaringan AS; bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.5, payoutRatio: 65, marketCapB: 130 },
    signals: { technical: 25, sentiment: 20, news: 5, policy: 5, profile: 60 }
  },
  {
    ticker: "VZ", name: "Verizon Communications", sector: "Communication Services",
    ethics: {
      israelTie: "low",
      rationale: "Operasi jaringan AS; bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.5, payoutRatio: 65, marketCapB: 170 },
    signals: { technical: 20, sentiment: 20, news: 5, policy: 5, profile: 60 }
  },

  // ---------- AUTO & TRANSPORT ----------
  {
    ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "medium",
      rationale: "Showroom di Tel Aviv; CEO Elon Musk pernyataan publik kontroversial. Bukan target BDS utama.",
      sources: ["Reuters", "Public reporting"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 700 },
    signals: { technical: 5, sentiment: 0, news: -5, policy: -5, profile: 55 }
  },
  {
    ticker: "F", name: "Ford Motor Co.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.0, payoutRatio: 45, marketCapB: 45 },
    signals: { technical: 0, sentiment: 5, news: 0, policy: 0, profile: 50 }
  },
  {
    ticker: "GM", name: "General Motors", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 8, marketCapB: 55 },
    signals: { technical: 10, sentiment: 10, news: 5, policy: 0, profile: 55 }
  },

  // ---------- AIRLINES & TRAVEL ----------
  {
    ticker: "BKNG", name: "Booking Holdings", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Daftar properti di permukiman ilegal Tepi Barat (laporan PBB & HRW).",
      sources: ["UN OHCHR database", "HRW report 2018"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.9, payoutRatio: 25, marketCapB: 130 },
    signals: { technical: 30, sentiment: 25, news: 0, policy: -10, profile: 65 }
  },
  {
    ticker: "ABNB", name: "Airbnb Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Mencabut listing permukiman 2018 lalu membatalkan keputusan 2019; kembali listing properti di Tepi Barat.",
      sources: ["HRW", "UN OHCHR"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 90 },
    signals: { technical: 10, sentiment: 5, news: -10, policy: -15, profile: 55 }
  },

  // ---------- REIT / DIVIDEND ----------
  {
    ticker: "O", name: "Realty Income Corp.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "REIT komersial AS; tidak ada keterkaitan utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.6, payoutRatio: 75, marketCapB: 50 },
    signals: { technical: 15, sentiment: 20, news: 10, policy: 5, profile: 70 }
  },

  // ---------- ETF ----------
  {
    ticker: "SCHD", name: "Schwab US Dividend Equity ETF", sector: "ETF",
    ethics: {
      israelTie: "medium",
      rationale: "Mengikuti Dow Jones US Dividend 100; berisi sebagian saham 'high'/'medium' (mis. KO, PEP, MRK).",
      sources: ["SCHD holdings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.5, payoutRatio: 0, marketCapB: 60 },
    signals: { technical: 25, sentiment: 25, news: 10, policy: 0, profile: 70 }
  },
  {
    ticker: "VYM", name: "Vanguard High Dividend Yield ETF", sector: "ETF",
    ethics: {
      israelTie: "medium",
      rationale: "Indeks dividen luas; berisi beberapa nama 'high' (mis. JPM, CVX). Diversifikasi tinggi.",
      sources: ["VYM holdings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.9, payoutRatio: 0, marketCapB: 60 },
    signals: { technical: 25, sentiment: 25, news: 10, policy: 0, profile: 70 }
  }
];
