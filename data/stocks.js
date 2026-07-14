// =====================================================================
// Universe saham Pluang yang dikurasi + dataset etika.
//
// Skala sinyal: -100 (sangat bearish) … +100 (sangat bullish), 0 = netral.
// 7 faktor komposit (lihat js/signals.js untuk bobot):
//   technical  – RSI, SMA crossover, volume
//   momentum   – price momentum 3-12 bulan (Fama-French momentum factor)
//   sentiment  – konsensus analis, short interest, social
//   news       – aliran berita, earnings surprise
//   policy     – makro/regulasi/siklus sektor
//   profile    – kualitas: FCF, margin, neraca, moat (quality factor)
//   valuation  – valuasi relatif vs sektor (value factor)
//
// Nilai default adalah baseline kualitatif. Untuk data live:
//   python scripts/fetch_signals.py
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
    fundamentals: { dividendYield: 0.34, payoutRatio: 12.6, marketCapB: 4624 },
    signals: { technical: 39, momentum: 42, sentiment: 50, news: 0, policy: 15, profile: 65, valuation: -38 }
  },
  {
    ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Akuisisi besar perusahaan Israel (mis. AnyVision/Oosto kontroversial), kontrak dengan militer Israel, investasi cloud Azure di Israel.",
      sources: ["+972 Magazine", "Who Profits", "AP News (2024)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.93, payoutRatio: 20.7, marketCapB: 2859 },
    signals: { technical: -40, momentum: -91, sentiment: 84, news: 0, policy: 10, profile: 65, valuation: 0 }
  },
  {
    ticker: "GOOGL", name: "Alphabet Inc. (Google)", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Project Nimbus: kontrak USD 1,2 miliar layanan cloud bersama Amazon untuk pemerintah & militer Israel.",
      sources: ["The Intercept", "Time Magazine", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.25, payoutRatio: 6.4, marketCapB: 4387 },
    signals: { technical: 40, momentum: 0, sentiment: 78, news: 0, policy: 0, profile: 65, valuation: -13 }
  },
  {
    ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Mitra utama Project Nimbus untuk pemerintah & militer Israel. Dikritik 'No Tech for Apartheid'.",
      sources: ["The Guardian", "Project Nimbus docs", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2662 },
    signals: { technical: 41, momentum: -25, sentiment: 84, news: 0, policy: 5, profile: 55, valuation: -15 }
  },
  {
    ticker: "META", name: "Meta Platforms Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "medium",
      rationale: "Tuduhan sensor sistematis konten pro-Palestina (laporan BSR 2022 yang dikomisikan Meta sendiri).",
      sources: ["BSR independent report 2022", "Human Rights Watch"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.32, payoutRatio: 7.6, marketCapB: 1678 },
    signals: { technical: -34, momentum: -17, sentiment: 84, news: 0, policy: 5, profile: 65, valuation: 5 }
  },
  {
    ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "Pusat R&D besar di Yokneam (eks Mellanox). Bukan target boikot utama.",
      sources: ["NVIDIA Israel press", "Mellanox acquisition"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.49, payoutRatio: 0.6, marketCapB: 5130 },
    signals: { technical: 38, momentum: 21, sentiment: 85, news: 0, policy: 10, profile: 65, valuation: 10 }
  },
  {
    ticker: "INTC", name: "Intel Corp.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Pemberi kerja swasta terbesar di Israel; pabrik Fab 28 & Fab 38 (Kiryat Gat) dengan subsidi besar pemerintah Israel.",
      sources: ["Reuters", "Times of Israel", "Investopedia"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 542 },
    signals: { technical: 32, momentum: 100, sentiment: 19, news: 0, policy: -5, profile: 15, valuation: -100 }
  },
  {
    ticker: "AMD", name: "Advanced Micro Devices", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "R&D kecil di Israel via akuisisi Xilinx, namun bukan target boikot dan ketergantungan operasional minim.",
      sources: ["AMD investor docs"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 894 },
    signals: { technical: 43, momentum: 100, sentiment: 76, news: 0, policy: 5, profile: 55, valuation: -63 }
  },
  {
    ticker: "ORCL", name: "Oracle Corp.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Larry Ellison (founder) donor besar pro-Israel; Oracle aktif menyediakan cloud untuk lembaga Israel.",
      sources: ["Forbes", "TechCrunch", "Oracle Israel press"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.52, payoutRatio: 34.3, marketCapB: 369 },
    signals: { technical: -20, momentum: -100, sentiment: 74, news: 0, policy: 10, profile: 45, valuation: 24 }
  },
  {
    ticker: "IBM", name: "International Business Machines", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "IBM Israel besar; sejarah kontroversial (laporan kerjasama database populasi).",
      sources: ["Edwin Black 'IBM and the Holocaust'", "IBM Israel press"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.33, payoutRatio: 59.5, marketCapB: 204 },
    signals: { technical: -45, momentum: -100, sentiment: 52, news: 0, policy: 0, profile: 35, valuation: 11 }
  },
  {
    ticker: "CRM", name: "Salesforce Inc.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "Akuisisi ClickSoftware (Israel); kantor R&D Tel Aviv.",
      sources: ["Salesforce press"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.08, payoutRatio: 19.6, marketCapB: 137 },
    signals: { technical: -39, momentum: -100, sentiment: 69, news: 0, policy: 0, profile: 50, valuation: 27 }
  },
  {
    ticker: "ADBE", name: "Adobe Inc.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "R&D di Petah Tikva via akuisisi Allegorithmic & Magento.",
      sources: ["Adobe Israel"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 88 },
    signals: { technical: -32, momentum: -100, sentiment: 17, news: 0, policy: 0, profile: 35, valuation: 35 }
  },
  {
    ticker: "TSM", name: "Taiwan Semiconductor Mfg.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan operasional/kontrak pertahanan Israel yang terdokumentasi.",
      sources: ["TSMC annual report"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.9, payoutRatio: 27.9, marketCapB: 2180 },
    signals: { technical: 43, momentum: 61, sentiment: 76, news: 0, policy: 10, profile: 65, valuation: -2 }
  },
  {
    ticker: "BABA", name: "Alibaba Group", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Investasi minor di startup Israel, namun bukan mitra militer atau target boikot.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.93, payoutRatio: 17.1, marketCapB: 269 },
    signals: { technical: -44, momentum: -100, sentiment: 84, news: 0, policy: -15, profile: 40, valuation: 22 }
  },
  {
    ticker: "ASML", name: "ASML Holding NV", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Vendor litografi global; tidak ada hubungan militer Israel langsung yang signifikan.",
      sources: ["ASML annual report"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.51, payoutRatio: 25.8, marketCapB: 684 },
    signals: { technical: 36, momentum: 100, sentiment: 78, news: 0, policy: 5, profile: 65, valuation: -46 }
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
    fundamentals: { dividendYield: 2.31, payoutRatio: 187.8, marketCapB: 121 },
    signals: { technical: 36, momentum: 32, sentiment: 30, news: 0, policy: -20, profile: 35, valuation: -45 }
  },
  {
    ticker: "MCD", name: "McDonald's Corp.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Franchise McDonald's Israel memberikan ribuan paket makanan gratis ke militer Israel (Okt 2023). Penurunan penjualan global akibat boikot.",
      sources: ["Reuters", "BDS Movement", "Financial Times"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.73, payoutRatio: 59.9, marketCapB: 191 },
    signals: { technical: -38, momentum: -68, sentiment: 44, news: 0, policy: -15, profile: 60, valuation: 3 }
  },
  {
    ticker: "KO", name: "The Coca-Cola Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "high",
      rationale: "Mengoperasikan pabrik di kawasan industri Atarot (permukiman ilegal di Yerusalem Timur).",
      sources: ["Who Profits database", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.54, payoutRatio: 64.8, marketCapB: 357 },
    signals: { technical: 36, momentum: 32, sentiment: 60, news: 0, policy: -10, profile: 60, valuation: -11 }
  },
  {
    ticker: "PEP", name: "PepsiCo Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "high",
      rationale: "Memiliki SodaStream dengan pabrik bersejarah di Mishor Adumim (permukiman); Sabra (joint venture dengan Strauss Group).",
      sources: ["Who Profits", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.27, payoutRatio: 75.3, marketCapB: 185 },
    signals: { technical: -37, momentum: -40, sentiment: 17, news: 0, policy: -10, profile: 35, valuation: 14 }
  },
  {
    ticker: "DIS", name: "The Walt Disney Co.", sector: "Communication Services",
    ethics: {
      israelTie: "high",
      rationale: "Donasi USD 2 juta ke pasukan Israel pasca Okt 2023; dikritik karena bias konten.",
      sources: ["Variety", "BDS Movement"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.56, payoutRatio: 20.0, marketCapB: 166 },
    signals: { technical: -37, momentum: -77, sentiment: 78, news: 0, policy: -5, profile: 50, valuation: 21 }
  },
  {
    ticker: "NFLX", name: "Netflix Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "low",
      rationale: "Tidak terdaftar sebagai target boikot utama; produksi konten Israel ada, juga konten Palestina.",
      sources: ["Public reporting"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 310 },
    signals: { technical: -40, momentum: -86, sentiment: 66, news: 0, policy: 5, profile: 50, valuation: 2 }
  },
  {
    ticker: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "low",
      rationale: "Bukan target boikot utama; eksposur via produk pihak ketiga.",
      sources: ["Public reporting"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.86, payoutRatio: 33.5, marketCapB: 905 },
    signals: { technical: 38, momentum: -39, sentiment: 74, news: 0, policy: 5, profile: 40, valuation: -43 }
  },
  {
    ticker: "COST", name: "Costco Wholesale", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan operasional/kontrak pertahanan Israel yang terdokumentasi.",
      sources: ["Costco filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.63, payoutRatio: 27.0, marketCapB: 409 },
    signals: { technical: 42, momentum: -34, sentiment: 50, news: 0, policy: 10, profile: 25, valuation: -62 }
  },
  {
    ticker: "TGT", name: "Target Corp.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "low",
      rationale: "Bukan target boikot utama.",
      sources: ["Public reporting"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.44, payoutRatio: 60.0, marketCapB: 61 },
    signals: { technical: 37, momentum: 60, sentiment: 25, news: 0, policy: 0, profile: 20, valuation: 14 }
  },
  {
    ticker: "HD", name: "Home Depot Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "medium",
      rationale: "Co-founder Bernie Marcus donor besar pro-Israel; perusahaan tidak masuk daftar boikot inti BDS.",
      sources: ["Forbes", "Public donor records"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.71, payoutRatio: 65.6, marketCapB: 337 },
    signals: { technical: -38, momentum: -60, sentiment: 53, news: 0, policy: 5, profile: 25, valuation: -2 }
  },
  {
    ticker: "LOW", name: "Lowe's Companies Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan signifikan terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.41, payoutRatio: 40.6, marketCapB: 117 },
    signals: { technical: -36, momentum: -100, sentiment: 60, news: 0, policy: 5, profile: 40, valuation: 13 }
  },
  {
    ticker: "NKE", name: "Nike Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Menutup operasi langsung di Israel pertengahan 2024 (transisi ke distributor). Bukan target boikot utama.",
      sources: ["Reuters", "Times of Israel"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.75, payoutRatio: 77.6, marketCapB: 63 },
    signals: { technical: -42, momentum: -100, sentiment: 25, news: 0, policy: 0, profile: 25, valuation: 5 }
  },
  {
    ticker: "PG", name: "Procter & Gamble", sector: "Consumer Defensive",
    ethics: {
      israelTie: "low",
      rationale: "Distribusi global, bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.87, payoutRatio: 61.8, marketCapB: 340 },
    signals: { technical: -39, momentum: -20, sentiment: 48, news: 0, policy: 5, profile: 50, valuation: -2 }
  },
  {
    ticker: "CL", name: "Colgate-Palmolive", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan signifikan terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.27, payoutRatio: 80.6, marketCapB: 73 },
    signals: { technical: 41, momentum: 9, sentiment: 45, news: 0, policy: 5, profile: 20, valuation: -7 }
  },
  {
    ticker: "KMB", name: "Kimberly-Clark", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ada keterkaitan signifikan terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.65, payoutRatio: 97.9, marketCapB: 35 },
    signals: { technical: -36, momentum: 1, sentiment: 22, news: 0, policy: 5, profile: 20, valuation: 17 }
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
    fundamentals: { dividendYield: 4.04, payoutRatio: 120.4, marketCapB: 362 },
    signals: { technical: 33, momentum: 12, sentiment: 64, news: 0, policy: -10, profile: 40, valuation: 16 }
  },
  {
    ticker: "XOM", name: "Exxon Mobil Corp.", sector: "Energy",
    ethics: {
      israelTie: "low",
      rationale: "Aktivitas eksplorasi minor; bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.97, payoutRatio: 68.0, marketCapB: 601 },
    signals: { technical: 35, momentum: 29, sentiment: 36, news: 0, policy: 0, profile: 55, valuation: 19 }
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
    fundamentals: { dividendYield: 2.65, payoutRatio: 65.4, marketCapB: 119 },
    signals: { technical: -42, momentum: -48, sentiment: 24, news: 0, policy: -25, profile: 25, valuation: 11 }
  },
  {
    ticker: "RTX", name: "RTX Corp. (Raytheon)", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Komponen Iron Dome (Tamir interceptor); pemasok rudal & sistem pertahanan.",
      sources: ["SIPRI", "Reuters"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.49, payoutRatio: 51.0, marketCapB: 260 },
    signals: { technical: -39, momentum: -27, sentiment: 56, news: 0, policy: -20, profile: 40, valuation: -16 }
  },
  {
    ticker: "BA", name: "Boeing Co.", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Pemasok bom GBU-39 SDB & helikopter Apache yang digunakan di Gaza.",
      sources: ["AP News", "Washington Post"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 171 },
    signals: { technical: 43, momentum: -58, sentiment: 68, news: 0, policy: -25, profile: 10, valuation: -99 }
  },
  {
    ticker: "GD", name: "General Dynamics", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Produsen MK-83/MK-84 bombs & komponen pertahanan untuk Israel.",
      sources: ["SIPRI", "US DoD"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.71, payoutRatio: 38.3, marketCapB: 100 },
    signals: { technical: 35, momentum: -19, sentiment: 44, news: 0, policy: -20, profile: 25, valuation: 0 }
  },
  {
    ticker: "NOC", name: "Northrop Grumman", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Pemasok teknologi pertahanan, sistem radar & avionik yang digunakan IDF.",
      sources: ["SIPRI"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.73, payoutRatio: 29.0, marketCapB: 75 },
    signals: { technical: -41, momentum: -80, sentiment: 52, news: 0, policy: -20, profile: 35, valuation: 7 }
  },
  {
    ticker: "CAT", name: "Caterpillar Inc.", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Buldoser D9 versi militer digunakan untuk pembongkaran rumah Palestina (kasus Rachel Corrie). Target divestasi BDS.",
      sources: ["BDS Movement", "Human Rights Watch"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.7, payoutRatio: 29.6, marketCapB: 430 },
    signals: { technical: 44, momentum: 100, sentiment: 45, news: 0, policy: -15, profile: 25, valuation: -32 }
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
    fundamentals: { dividendYield: 1.79, payoutRatio: 28.2, marketCapB: 919 },
    signals: { technical: 35, momentum: -8, sentiment: 42, news: 0, policy: 5, profile: 75, valuation: 17 }
  },
  {
    ticker: "BAC", name: "Bank of America", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Eksposur kredit & investasi perusahaan terdaftar di laporan 'Don't Buy Into Occupation'.",
      sources: ["DBIO 2023 report"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.88, payoutRatio: 27.3, marketCapB: 430 },
    signals: { technical: 33, momentum: 5, sentiment: 75, news: 0, policy: 0, profile: 60, valuation: 24 }
  },
  {
    ticker: "V", name: "Visa Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "low",
      rationale: "Pemroses pembayaran global; bukan target utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.75, payoutRatio: 22.0, marketCapB: 677 },
    signals: { technical: 39, momentum: -14, sentiment: 82, news: 0, policy: 5, profile: 65, valuation: -11 }
  },
  {
    ticker: "MA", name: "Mastercard Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "low",
      rationale: "Pemroses pembayaran global; bukan target utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.65, payoutRatio: 18.2, marketCapB: 475 },
    signals: { technical: -43, momentum: -43, sentiment: 82, news: 0, policy: 5, profile: 35, valuation: -10 }
  },
  {
    ticker: "BRK.B", name: "Berkshire Hathaway", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Memiliki Iscar/IMC (akuisisi 2006) & ISCAR Metalworking Israel. Tidak masuk daftar boikot konsumen.",
      sources: ["Berkshire annual letters"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1059 },
    signals: { technical: -39, momentum: -32, sentiment: 50, news: 0, policy: 5, profile: 55, valuation: -8 }
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
    fundamentals: { dividendYield: 2.08, payoutRatio: 60.2, marketCapB: 611 },
    signals: { technical: 41, momentum: 43, sentiment: 50, news: 0, policy: 5, profile: 75, valuation: 0 }
  },
  {
    ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "medium",
      rationale: "Israel jadi negara pertama vaksinasi massal Pfizer; perjanjian data populasi yang kontroversial.",
      sources: ["Reuters", "BMJ"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.03, payoutRatio: 131.3, marketCapB: 138 },
    signals: { technical: -42, momentum: -40, sentiment: 27, news: 0, policy: 0, profile: 40, valuation: 34 }
  },
  {
    ticker: "MRK", name: "Merck & Co.", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.75, payoutRatio: 93.5, marketCapB: 298 },
    signals: { technical: 43, momentum: 8, sentiment: 57, news: 0, policy: 5, profile: 50, valuation: 22 }
  },
  {
    ticker: "ABBV", name: "AbbVie Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.79, payoutRatio: 326.0, marketCapB: 432 },
    signals: { technical: 43, momentum: 10, sentiment: 63, news: 0, policy: 5, profile: 40, valuation: 14 }
  },
  {
    ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Asuransi domestik AS; tidak ada keterkaitan signifikan.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.16, payoutRatio: 66.6, marketCapB: 386 },
    signals: { technical: 38, momentum: 55, sentiment: 66, news: 0, policy: 5, profile: 35, valuation: 0 }
  },
  {
    ticker: "NVO", name: "Novo Nordisk (ADR)", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Perusahaan Denmark; tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.64, payoutRatio: 42.6, marketCapB: 217 },
    signals: { technical: -38, momentum: -87, sentiment: 28, news: 0, policy: 5, profile: 60, valuation: 14 }
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
    fundamentals: { dividendYield: 5.15, payoutRatio: 37.4, marketCapB: 148 },
    signals: { technical: -41, momentum: -61, sentiment: 46, news: 0, policy: 5, profile: 50, valuation: 34 }
  },
  {
    ticker: "VZ", name: "Verizon Communications", sector: "Communication Services",
    ethics: {
      israelTie: "low",
      rationale: "Operasi jaringan AS; bukan target boikot utama.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.63, payoutRatio: 67.4, marketCapB: 177 },
    signals: { technical: 38, momentum: -5, sentiment: 36, news: 0, policy: 5, profile: 50, valuation: 35 }
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
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1488 },
    signals: { technical: -41, momentum: -66, sentiment: 31, news: 0, policy: -5, profile: 40, valuation: -100 }
  },
  {
    ticker: "F", name: "Ford Motor Co.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.29, payoutRatio: 64.1, marketCapB: 56 },
    signals: { technical: 34, momentum: -29, sentiment: 15, news: 0, policy: 0, profile: -20, valuation: 37 }
  },
  {
    ticker: "GM", name: "General Motors", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Tidak ada keterkaitan utama terdokumentasi.",
      sources: ["Public filings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.94, payoutRatio: 23.0, marketCapB: 69 },
    signals: { technical: 38, momentum: -51, sentiment: 56, news: 0, policy: 0, profile: 10, valuation: 43 }
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
    fundamentals: { dividendYield: 0.91, payoutRatio: 20.7, marketCapB: 135 },
    signals: { technical: -34, momentum: -90, sentiment: 73, news: 0, policy: -10, profile: 50, valuation: 17 }
  },
  {
    ticker: "ABNB", name: "Airbnb Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Mencabut listing permukiman 2018 lalu membatalkan keputusan 2019; kembali listing properti di Tepi Barat.",
      sources: ["HRW", "UN OHCHR"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 87 },
    signals: { technical: 46, momentum: -7, sentiment: 44, news: 0, policy: -15, profile: 25, valuation: -12 }
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
    fundamentals: { dividendYield: 5.07, payoutRatio: 265.0, marketCapB: 59 },
    signals: { technical: 36, momentum: 0, sentiment: 25, news: 0, policy: 5, profile: 35, valuation: -52 }
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
    fundamentals: { dividendYield: 3.3, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 16, sentiment: 25, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VYM", name: "Vanguard High Dividend Yield ETF", sector: "ETF",
    ethics: {
      israelTie: "medium",
      rationale: "Indeks dividen luas; berisi beberapa nama 'high' (mis. JPM, CVX). Diversifikasi tinggi.",
      sources: ["VYM holdings"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.3, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: 1, sentiment: 25, news: 0, policy: 0, profile: -10, valuation: 0 }
  }
,

  // ---------- BARU (auto-generated) ----------
  {
    ticker: "GOOG", name: "Alphabet Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.25, payoutRatio: 6.4, marketCapB: 4360 },
    signals: { technical: 40, momentum: -2, sentiment: 78, news: 0, policy: 0, profile: 65, valuation: -13 }
  },
  {
    ticker: "AVGO", name: "Broadcom Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.65, payoutRatio: 41.3, marketCapB: 1851 },
    signals: { technical: 41, momentum: 7, sentiment: 84, news: 0, policy: 0, profile: 65, valuation: 0 }
  },
  {
    ticker: "LLY", name: "Eli Lilly and Company", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.59, payoutRatio: 22.1, marketCapB: 1028 },
    signals: { technical: 41, momentum: -4, sentiment: 62, news: 0, policy: 0, profile: 65, valuation: -17 }
  },
  {
    ticker: "MU", name: "Micron Technology, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.06, payoutRatio: 1.1, marketCapB: 1110 },
    signals: { technical: 40, momentum: 100, sentiment: 79, news: 0, policy: 0, profile: 65, valuation: 40 }
  },
  {
    ticker: "CSCO", name: "Cisco Systems, Inc.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "Cisco: menyediakan infrastruktur jaringan untuk pemerintah dan lembaga Israel. Tidak secara langsung di daftar BDS utama namun ada kontrak dengan entitas pemerintah Israel.",
      sources: ["Who Profits (partial)", "AFSC Investigate", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.41, payoutRatio: 55.0, marketCapB: 462 },
    signals: { technical: 37, momentum: 100, sentiment: 56, news: 0, policy: 0, profile: 50, valuation: -13 }
  },
  {
    ticker: "PLTR", name: "Palantir Technologies Inc.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Palantir Technologies: platform AI/data analytics digunakan IDF (Project Maven-level). CEO Alex Karp secara terbuka menyatakan dukungan untuk Israel. Masuk target kampanye 'No Tech for Genocide'.",
      sources: ["The Guardian (2024)", "AFSC Investigate", "Drop Palantir campaign", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 321 },
    signals: { technical: -39, momentum: -100, sentiment: 56, news: 0, policy: 0, profile: 50, valuation: -100 }
  },
  {
    ticker: "LRCX", name: "Lam Research Corporation", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Lam Research: peralatan semikonduktor, beberapa pelanggan di Israel. Tidak ada laporan khusus.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.3, payoutRatio: 19.1, marketCapB: 433 },
    signals: { technical: 36, momentum: 100, sentiment: 74, news: 0, policy: 0, profile: 50, valuation: -68 }
  },
  {
    ticker: "HSBC", name: "HSBC Holdings plc", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "HSBC: bank global yang memfasilitasi transaksi keuangan untuk entitas Israel dan underwriting obligasi pemerintah Israel.",
      sources: ["AFSC Investigate (financial)", "Who Profits (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.82, payoutRatio: 62.0, marketCapB: 340 },
    signals: { technical: 38, momentum: 46, sentiment: 34, news: 0, policy: 0, profile: 60, valuation: 29 }
  },
  {
    ticker: "AMAT", name: "Applied Materials, Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Applied Materials: pemasok peralatan semikonduktor ke pabrik di Israel. Tidak spesifik untuk militer.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.37, payoutRatio: 17.3, marketCapB: 473 },
    signals: { technical: 43, momentum: 100, sentiment: 76, news: 0, policy: 0, profile: 50, valuation: -47 }
  },
  {
    ticker: "MS", name: "Morgan Stanley", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Morgan Stanley: underwriting obligasi Israel, investasi di perusahaan-perusahaan yang beroperasi di wilayah pendudukan.",
      sources: ["Who Profits (financial)", "AFSC Investigate", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.81, payoutRatio: 35.5, marketCapB: 359 },
    signals: { technical: 36, momentum: 46, sentiment: 30, news: 0, policy: 0, profile: 45, valuation: 7 }
  },
  {
    ticker: "GE", name: "GE Aerospace", sector: "Industrials",
    ethics: {
      israelTie: "medium",
      rationale: "GE Aerospace (General Electric): mesin jet F110 dan F404 yang digunakan di jet tempur Israel (F-16, F-15). Pemasok komponen signifikan untuk IAF.",
      sources: ["AFSC Investigate", "Federation of American Scientists", "Defense contracts", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.53, payoutRatio: 19.2, marketCapB: 370 },
    signals: { technical: 44, momentum: 3, sentiment: 75, news: 0, policy: 0, profile: 40, valuation: -61 }
  },
  {
    ticker: "GEV", name: "GE Vernova Inc.", sector: "Industrials",
    ethics: {
      israelTie: "medium",
      rationale: "GE Vernova: spin-off GE untuk energi. Tidak terlibat langsung di militer namun proyek infrastruktur energi di Israel.",
      sources: ["AFSC Investigate (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.18, payoutRatio: 5.1, marketCapB: 286 },
    signals: { technical: 53, momentum: 100, sentiment: 71, news: 0, policy: 0, profile: 50, valuation: -69 }
  },
  {
    ticker: "AZN", name: "AstraZeneca PLC", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "AstraZeneca: tidak ada laporan signifikan terkait Israel. Berkantor pusat di Inggris/Swedia.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.84, payoutRatio: 47.7, marketCapB: 255 },
    signals: { technical: -34, momentum: -67, sentiment: 70, news: 0, policy: 0, profile: 50, valuation: 6 }
  },
  {
    ticker: "NVS", name: "Novartis AG", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Novartis: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.09, payoutRatio: 67.9, marketCapB: 287 },
    signals: { technical: 43, momentum: -6, sentiment: 8, news: 0, policy: 0, profile: 60, valuation: 13 }
  },
  {
    ticker: "GS", name: "The Goldman Sachs Group, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Goldman Sachs: underwriter utama obligasi pemerintah Israel, manajemen aset dengan eksposur besar ke perusahaan Israel, kantor di Tel Aviv.",
      sources: ["Who Profits", "AFSC Investigate (financial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.72, payoutRatio: 28.3, marketCapB: 336 },
    signals: { technical: 34, momentum: 39, sentiment: 16, news: 0, policy: 0, profile: 45, valuation: 9 }
  },
  {
    ticker: "PM", name: "Philip Morris International Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Philip Morris International: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.26, payoutRatio: 81.1, marketCapB: 274 },
    signals: { technical: 41, momentum: -5, sentiment: 60, news: 0, policy: 0, profile: 60, valuation: 2 }
  },
  {
    ticker: "TXN", name: "Texas Instruments Incorporated", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Texas Instruments: fasilitas manufaktur di Israel (Migdal Haemek). Komponen semikonduktor umum.",
      sources: ["Company filings", "Who Profits (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.9, payoutRatio: 95.0, marketCapB: 278 },
    signals: { technical: 40, momentum: 100, sentiment: 39, news: 0, policy: 0, profile: 60, valuation: -35 }
  },
  {
    ticker: "RY", name: "Royal Bank of Canada", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Royal Bank of Canada: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.42, payoutRatio: 41.3, marketCapB: 297 },
    signals: { technical: 7, momentum: 60, sentiment: 50, news: 0, policy: 0, profile: 60, valuation: 8 }
  },
  {
    ticker: "SHEL", name: "Shell plc", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Shell: tidak ada laporan signifikan terkait afiliasi Israel.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.8, payoutRatio: 45.0, marketCapB: 234 },
    signals: { technical: 31, momentum: 32, sentiment: 47, news: 0, policy: 0, profile: 40, valuation: 31 }
  },
  {
    ticker: "WFC", name: "Wells Fargo & Company", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Wells Fargo: investasi dan pembiayaan untuk perusahaan-perusahaan yang beroperasi di wilayah pendudukan Israel.",
      sources: ["AFSC Investigate (financial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.07, payoutRatio: 27.1, marketCapB: 261 },
    signals: { technical: -42, momentum: -60, sentiment: 54, news: 0, policy: 0, profile: 60, valuation: 27 }
  },
  {
    ticker: "LIN", name: "Linde plc", sector: "Basic Materials",
    ethics: {
      israelTie: "low",
      rationale: "Linde: gas industri, operasi di Israel. Tidak spesifik untuk militer.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.22, payoutRatio: 40.5, marketCapB: 242 },
    signals: { technical: 40, momentum: 32, sentiment: 66, news: 0, policy: 0, profile: 60, valuation: -19 }
  },
  {
    ticker: "KLAC", name: "KLA Corporation", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "KLA Corporation: peralatan inspeksi semikonduktor, penjualan ke fasilitas chip Israel. Tidak ada laporan keterlibatan militer langsung.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.41, payoutRatio: 21.5, marketCapB: 301 },
    signals: { technical: 31, momentum: 100, sentiment: 52, news: 0, policy: 0, profile: 50, valuation: -74 }
  },
  {
    ticker: "ARM", name: "Arm Holdings plc", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Arm Holdings: arsitektur chip digunakan di perangkat Israel namun sebagai IP universal.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 300 },
    signals: { technical: 28, momentum: 100, sentiment: 54, news: 0, policy: 0, profile: 40, valuation: -100 }
  },
  {
    ticker: "TM", name: "Toyota Motor Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Toyota Motor: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.59, payoutRatio: 31.4, marketCapB: 209 },
    signals: { technical: -40, momentum: -96, sentiment: 75, news: 0, policy: 0, profile: 40, valuation: 26 }
  },
  {
    ticker: "AXP", name: "American Express Company", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "American Express: tidak ada laporan signifikan terkait afiliasi Israel.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.07, payoutRatio: 21.3, marketCapB: 242 },
    signals: { technical: -42, momentum: -31, sentiment: 38, news: 0, policy: 0, profile: 50, valuation: 7 }
  },
  {
    ticker: "ANET", name: "Arista Networks, Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Arista Networks: jaringan komputasi, tidak ada kontrak militer Israel yang terdokumentasi. Memiliki operasi kecil di Israel.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 230 },
    signals: { technical: 44, momentum: 100, sentiment: 85, news: 0, policy: 0, profile: 50, valuation: -62 }
  },
  {
    ticker: "C", name: "Citigroup Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Citigroup: layanan perbankan korporat dan underwriting untuk entitas Israel. Kantor di Tel Aviv.",
      sources: ["AFSC Investigate (financial)", "Who Profits (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.71, payoutRatio: 29.2, marketCapB: 227 },
    signals: { technical: 43, momentum: 17, sentiment: 66, news: 0, policy: 0, profile: 60, valuation: 28 }
  },
  {
    ticker: "TMUS", name: "T-Mobile US, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "T-Mobile US: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.17, payoutRatio: 40.4, marketCapB: 203 },
    signals: { technical: -44, momentum: -44, sentiment: 70, news: 0, policy: 0, profile: 35, valuation: 19 }
  },
  {
    ticker: "TTE", name: "TotalEnergies SE", sector: "Energy",
    ethics: {
      israelTie: "low",
      rationale: "TotalEnergies: pengembangan ladang gas di lepas pantai Israel dan Siprus. Tidak di daftar BDS utama.",
      sources: ["Company disclosures", "Reuters", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.37, payoutRatio: 58.8, marketCapB: 180 },
    signals: { technical: 33, momentum: 56, sentiment: 50, news: 0, policy: 0, profile: 40, valuation: 34 }
  },
  {
    ticker: "NEE", name: "NextEra Energy, Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "NextEra Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.82, payoutRatio: 59.0, marketCapB: 187 },
    signals: { technical: 38, momentum: 7, sentiment: 52, news: 0, policy: 0, profile: 60, valuation: -1 }
  },
  {
    ticker: "BHP", name: "BHP Group Limited", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "BHP Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.27, payoutRatio: 54.6, marketCapB: 214 },
    signals: { technical: 32, momentum: 87, sentiment: 0, news: 0, policy: 0, profile: 50, valuation: 10 }
  },
  {
    ticker: "SAP", name: "SAP SE", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "SAP SE: perangkat lunak ERP digunakan oleh perusahaan dan entitas pemerintah Israel. Tidak spesifik militer, tapi ada kehadiran operasional di Israel.",
      sources: ["Company disclosures", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.83, payoutRatio: 37.2, marketCapB: 183 },
    signals: { technical: -39, momentum: -100, sentiment: 66, news: 0, policy: 0, profile: 50, valuation: 12 }
  },
  {
    ticker: "ADI", name: "Analog Devices, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.14, payoutRatio: 60.6, marketCapB: 191 },
    signals: { technical: 36, momentum: 85, sentiment: 72, news: 0, policy: 0, profile: 60, valuation: -19 }
  },
  {
    ticker: "QCOM", name: "QUALCOMM Incorporated", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Qualcomm: pusat R&D signifikan di Israel (Haifa, Tel Aviv). Komponen chip digunakan di perangkat militer namun bukan target boikot utama.",
      sources: ["Company R&D disclosures", "Who Profits (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.0, payoutRatio: 38.3, marketCapB: 188 },
    signals: { technical: 32, momentum: -9, sentiment: 22, news: 0, policy: 0, profile: 60, valuation: 11 }
  },
  {
    ticker: "AMGN", name: "Amgen Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Amgen: akuisisi perusahaan biotek Israel (deCODE Genetics tidak Israel; Teva partnership). Tidak ada laporan keterlibatan militer.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.8, payoutRatio: 67.2, marketCapB: 192 },
    signals: { technical: 40, momentum: 3, sentiment: 28, news: 0, policy: 0, profile: 45, valuation: 14 }
  },
  {
    ticker: "TD", name: "The Toronto-Dominion Bank", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Toronto-Dominion Bank: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.62, payoutRatio: 50.0, marketCapB: 203 },
    signals: { technical: 32, momentum: 74, sentiment: 47, news: 0, policy: 0, profile: 60, valuation: 11 }
  },
  {
    ticker: "SAN", name: "Banco Santander, S.A.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Banco Santander: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.04, payoutRatio: 25.2, marketCapB: 195 },
    signals: { technical: 42, momentum: 13, sentiment: 0, news: 0, policy: 0, profile: 60, valuation: 26 }
  },
  {
    ticker: "TJX", name: "The TJX Companies, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "TJX Companies: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.28, payoutRatio: 33.1, marketCapB: 166 },
    signals: { technical: 39, momentum: -41, sentiment: 81, news: 0, policy: 0, profile: 40, valuation: -18 }
  },
  {
    ticker: "SHOP", name: "Shopify Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Shopify: perusahaan Kanada, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 163 },
    signals: { technical: -34, momentum: -100, sentiment: 66, news: 0, policy: 0, profile: 40, valuation: -100 }
  },
  {
    ticker: "ETN", name: "Eaton Corporation plc", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Eaton: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.09, payoutRatio: 41.3, marketCapB: 161 },
    signals: { technical: 44, momentum: 60, sentiment: 68, news: 0, policy: 0, profile: 50, valuation: -19 }
  },
  {
    ticker: "BLK", name: "BlackRock, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "BlackRock: pemegang saham besar di banyak perusahaan yang masuk daftar Who Profits dan BDS, termasuk pemasok senjata.",
      sources: ["AFSC Investigate", "BlackRock shareholder records", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.22, payoutRatio: 53.8, marketCapB: 167 },
    signals: { technical: -42, momentum: -46, sentiment: 70, news: 0, policy: 0, profile: 60, valuation: 10 }
  },
  {
    ticker: "GILD", name: "Gilead Sciences, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Gilead Sciences: tidak ada laporan signifikan terkait afiliasi Israel.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.5, payoutRatio: 43.4, marketCapB: 161 },
    signals: { technical: -37, momentum: -6, sentiment: 69, news: 0, policy: 0, profile: 60, valuation: 19 }
  },
  {
    ticker: "STX", name: "Seagate Technology Holdings plc", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Seagate Technology: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.34, payoutRatio: 27.7, marketCapB: 199 },
    signals: { technical: 36, momentum: 100, sentiment: 78, news: 0, policy: 0, profile: 35, valuation: -35 }
  },
  {
    ticker: "ISRG", name: "Intuitive Surgical, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Intuitive Surgical: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 134 },
    signals: { technical: -34, momentum: -100, sentiment: 55, news: 0, policy: 0, profile: 50, valuation: -36 }
  },
  {
    ticker: "SCHW", name: "The Charles Schwab Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.25, payoutRatio: 22.5, marketCapB: 176 },
    signals: { technical: -42, momentum: -29, sentiment: 66, news: 0, policy: 0, profile: 60, valuation: 19 }
  },
  {
    ticker: "UNP", name: "Union Pacific Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Union Pacific: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.91, payoutRatio: 45.1, marketCapB: 171 },
    signals: { technical: 31, momentum: 58, sentiment: 60, news: 0, policy: 0, profile: 60, valuation: -2 }
  },
  {
    ticker: "DE", name: "Deere & Company", sector: "Industrials",
    ethics: {
      israelTie: "medium",
      rationale: "Deere & Co (John Deere): peralatan berat digunakan di proyek konstruksi di wilayah pendudukan, namun tidak seprofil Caterpillar. Lebih sedikit terdokumentasi.",
      sources: ["Who Profits (partial)", "Media reports", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.11, payoutRatio: 36.7, marketCapB: 158 },
    signals: { technical: 44, momentum: 36, sentiment: 44, news: 0, policy: 0, profile: 35, valuation: -16 }
  },
  {
    ticker: "ABT", name: "Abbott Laboratories", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Abbott Laboratories: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.74, payoutRatio: 67.2, marketCapB: 155 },
    signals: { technical: -34, momentum: -100, sentiment: 68, news: 0, policy: 0, profile: 50, valuation: 15 }
  },
  {
    ticker: "BX", name: "Blackstone Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Blackstone: investasi properti dan infrastruktur yang mencakup aset di Israel.",
      sources: ["AFSC Investigate (financial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.07, payoutRatio: 121.5, marketCapB: 152 },
    signals: { technical: -44, momentum: -95, sentiment: 48, news: 0, policy: 0, profile: 60, valuation: 9 }
  },
  {
    ticker: "APP", name: "AppLovin Corporation", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "AppLovin: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 151 },
    signals: { technical: -41, momentum: -100, sentiment: 80, news: 0, policy: 0, profile: 50, valuation: -2 }
  },
  {
    ticker: "UBER", name: "Uber Technologies, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Uber: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 147 },
    signals: { technical: -34, momentum: -76, sentiment: 76, news: 0, policy: 0, profile: 40, valuation: 11 }
  },
  {
    ticker: "COP", name: "ConocoPhillips", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "ConocoPhillips: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.98, payoutRatio: 54.9, marketCapB: 136 },
    signals: { technical: 34, momentum: 30, sentiment: 64, news: 0, policy: 0, profile: 50, valuation: 22 }
  },
  {
    ticker: "PANW", name: "Palo Alto Networks, Inc.", sector: "Technology",
    ethics: {
      israelTie: "medium",
      rationale: "Palo Alto Networks: layanan keamanan siber untuk pemerintah Israel. Beberapa produk digunakan oleh entitas militer/intelijen Israel.",
      sources: ["AFSC Investigate (partial)", "Reuters (2023)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 288 },
    signals: { technical: 48, momentum: 100, sentiment: 68, news: 0, policy: 0, profile: 30, valuation: -100 }
  },
  {
    ticker: "WDC", name: "Western Digital Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Western Digital: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.11, payoutRatio: 2.7, marketCapB: 194 },
    signals: { technical: 41, momentum: 100, sentiment: 75, news: 0, policy: 0, profile: 50, valuation: -31 }
  },
  {
    ticker: "BUD", name: "Anheuser-Busch InBev SA/NV", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "AB InBev: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.7, payoutRatio: 36.0, marketCapB: 153 },
    signals: { technical: 40, momentum: 35, sentiment: 68, news: 0, policy: 0, profile: 50, valuation: 11 }
  },
  {
    ticker: "MRVL", name: "Marvell Technology, Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Marvell Technology: beberapa R&D di Israel pasca akuisisi. Tidak ada kontrak militer terdokumentasi.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.11, payoutRatio: 8.2, marketCapB: 200 },
    signals: { technical: 25, momentum: 100, sentiment: 78, news: 0, policy: 0, profile: 50, valuation: -47 }
  },
  {
    ticker: "SCCO", name: "Southern Copper Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Southern Copper: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.27, payoutRatio: 56.3, marketCapB: 152 },
    signals: { technical: 34, momentum: -8, sentiment: -34, news: 0, policy: 0, profile: 60, valuation: -16 }
  },
  {
    ticker: "DELL", name: "Dell Technologies Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Dell Technologies: pusat R&D di Beersheba (Israel). Menyediakan infrastruktur IT umum.",
      sources: ["Company R&D disclosures", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.59, payoutRatio: 17.6, marketCapB: 296 },
    signals: { technical: 45, momentum: 100, sentiment: 61, news: 0, policy: 0, profile: 30, valuation: -3 }
  },
  {
    ticker: "GLW", name: "Corning Incorporated", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.61, payoutRatio: 53.8, marketCapB: 161 },
    signals: { technical: 46, momentum: 100, sentiment: 62, news: 0, policy: 0, profile: 40, valuation: -71 }
  },
  {
    ticker: "PBR", name: "Petróleo Brasileiro S.A. - Petrobras", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Petrobras: perusahaan Brazil, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 10.18, payoutRatio: 41.6, marketCapB: 115 },
    signals: { technical: 32, momentum: 100, sentiment: 60, news: 0, policy: 0, profile: 50, valuation: 46 }
  },
  {
    ticker: "HON", name: "Honeywell International Inc.", sector: "Industrials",
    ethics: {
      israelTie: "medium",
      rationale: "Honeywell: komponen avionik dan sistem pertahanan yang digunakan dalam platform militer Israel. Tidak di daftar BDS utama namun eksposur signifikan.",
      sources: ["AFSC Investigate", "Defense contract records", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.28, payoutRatio: 74.1, marketCapB: 71 },
    signals: { technical: 42, momentum: -21, sentiment: 50, news: 0, policy: 0, profile: 20, valuation: -8 }
  },
  {
    ticker: "PLD", name: "Prologis, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Prologis: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.01, payoutRatio: 103.0, marketCapB: 136 },
    signals: { technical: 35, momentum: 7, sentiment: 50, news: 0, policy: 0, profile: 60, valuation: -66 }
  },
  {
    ticker: "UL", name: "Unilever PLC", sector: "Consumer Defensive",
    ethics: {
      israelTie: "medium",
      rationale: "Unilever: sebelumnya memiliki Ben & Jerry's yang menghentikan penjualan di wilayah pendudukan Israel (2021). Kemudian menjual merek tersebut ke franchisee Israel yang melanjutkan penjualan.",
      sources: ["BBC News (2021-2022)", "BDS Movement", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.71, payoutRatio: 78.6, marketCapB: 131 },
    signals: { technical: -40, momentum: -45, sentiment: 70, news: 0, policy: 0, profile: 50, valuation: 13 }
  },
  {
    ticker: "BTI", name: "British American Tobacco p.l.c.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "British American Tobacco: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.66, payoutRatio: 68.7, marketCapB: 126 },
    signals: { technical: 44, momentum: -11, sentiment: 75, news: 0, policy: 0, profile: 60, valuation: 26 }
  },
  {
    ticker: "CB", name: "Chubb Limited", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Chubb: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.15, payoutRatio: 13.7, marketCapB: 134 },
    signals: { technical: 42, momentum: 15, sentiment: 26, news: 0, policy: 0, profile: 50, valuation: 24 }
  },
  {
    ticker: "SPGI", name: "S&P Global Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "low",
      rationale: "S&P Global: rating obligasi Israel. Tidak ada keterlibatan langsung lebih jauh.",
      sources: ["AFSC Investigate (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.89, payoutRatio: 24.4, marketCapB: 130 },
    signals: { technical: -41, momentum: -76, sentiment: 84, news: 0, policy: 0, profile: 50, valuation: -4 }
  },
  {
    ticker: "VRT", name: "Vertiv Holdings Co", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Vertiv Holdings: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.08, payoutRatio: 5.0, marketCapB: 117 },
    signals: { technical: 42, momentum: 100, sentiment: 77, news: 0, policy: 0, profile: 40, valuation: -42 }
  },
  {
    ticker: "MO", name: "Altria Group, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Altria Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.9, payoutRatio: 87.7, marketCapB: 117 },
    signals: { technical: 42, momentum: 39, sentiment: 19, news: 0, policy: 0, profile: 60, valuation: 24 }
  },
  {
    ticker: "DHR", name: "Danaher Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Danaher: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.8, payoutRatio: 26.4, marketCapB: 141 },
    signals: { technical: -40, momentum: -82, sentiment: 75, news: 0, policy: 0, profile: 40, valuation: -4 }
  },
  {
    ticker: "BBVA", name: "Banco Bilbao Vizcaya Argentaria, S.A.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "BBVA: bank Spanyol, tidak ada laporan signifikan terkait Israel.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.25, payoutRatio: 39.7, marketCapB: 142 },
    signals: { technical: 40, momentum: -7, sentiment: 0, news: 0, policy: 0, profile: 60, valuation: 27 }
  },
  {
    ticker: "COF", name: "Capital One Financial Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Capital One: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.59, payoutRatio: 86.1, marketCapB: 126 },
    signals: { technical: -35, momentum: -66, sentiment: 73, news: 0, policy: 0, profile: 40, valuation: 34 }
  },
  {
    ticker: "ENB", name: "Enbridge Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Enbridge: perusahaan Kanada, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.11, payoutRatio: 128.7, marketCapB: 122 },
    signals: { technical: 36, momentum: 45, sentiment: 26, news: 0, policy: 0, profile: 50, valuation: -14 }
  },
  {
    ticker: "BMY", name: "Bristol-Myers Squibb Company", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Bristol-Myers Squibb: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.25, payoutRatio: 70.0, marketCapB: 116 },
    signals: { technical: 40, momentum: -19, sentiment: 25, news: 0, policy: 0, profile: 35, valuation: 32 }
  },
  {
    ticker: "PGR", name: "The Progressive Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Progressive: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.93, payoutRatio: 70.7, marketCapB: 132 },
    signals: { technical: -35, momentum: -11, sentiment: 14, news: 0, policy: 0, profile: 50, valuation: 18 }
  },
  {
    ticker: "NEM", name: "Newmont Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Newmont: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.12, payoutRatio: 13.1, marketCapB: 101 },
    signals: { technical: 40, momentum: -80, sentiment: 68, news: 0, policy: 0, profile: 60, valuation: 34 }
  },
  {
    ticker: "SONY", name: "Sony Group Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Sony Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.77, payoutRatio: 14.2, marketCapB: 122 },
    signals: { technical: -39, momentum: -84, sentiment: 75, news: 0, policy: 0, profile: 0, valuation: 7 }
  },
  {
    ticker: "CRWD", name: "CrowdStrike Holdings, Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "CrowdStrike: beberapa laporan tentang layanan keamanan siber ke entitas pemerintah Israel. Tidak masuk daftar BDS utama.",
      sources: ["AFSC Investigate (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 215 },
    signals: { technical: 45, momentum: 100, sentiment: 66, news: 0, policy: 0, profile: 0, valuation: -100 }
  },
  {
    ticker: "SYK", name: "Stryker Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Stryker: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.06, payoutRatio: 39.8, marketCapB: 119 },
    signals: { technical: -37, momentum: -73, sentiment: 66, news: 0, policy: 0, profile: 50, valuation: 4 }
  },
  {
    ticker: "SNY", name: "Sanofi", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Sanofi: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.5, payoutRatio: 97.7, marketCapB: 103 },
    signals: { technical: -42, momentum: -57, sentiment: 50, news: 0, policy: 0, profile: 50, valuation: 34 }
  },
  {
    ticker: "CEG", name: "Constellation Energy Corporation", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Constellation Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.66, payoutRatio: 13.8, marketCapB: 92 },
    signals: { technical: -38, momentum: -100, sentiment: 74, news: 0, policy: 0, profile: 25, valuation: 3 }
  },
  {
    ticker: "PWR", name: "Quanta Services, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Quanta Services: kontraktor infrastruktur AS, tidak ada laporan Israel.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.07, payoutRatio: 5.8, marketCapB: 99 },
    signals: { technical: 39, momentum: 100, sentiment: 70, news: 0, policy: 0, profile: 10, valuation: -60 }
  },
  {
    ticker: "ACN", name: "Accenture plc", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Accenture: layanan konsultasi IT ke berbagai pemerintah termasuk Israel. Tidak spesifik militer.",
      sources: ["Company disclosures", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.71, payoutRatio: 50.9, marketCapB: 82 },
    signals: { technical: -53, momentum: -100, sentiment: 47, news: 0, policy: 0, profile: 35, valuation: 32 }
  },
  {
    ticker: "INTU", name: "Intuit Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Intuit: pusat R&D di Israel (akuisisi beberapa startup Israel). Produk keuangan konsumen.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.66, payoutRatio: 28.3, marketCapB: 77 },
    signals: { technical: -37, momentum: -100, sentiment: 69, news: 0, policy: 0, profile: 45, valuation: 29 }
  },
  {
    ticker: "VRTX", name: "Vertex Pharmaceuticals Incorporated", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Vertex Pharmaceuticals: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 121 },
    signals: { technical: 47, momentum: -15, sentiment: 68, news: 0, policy: 0, profile: 50, valuation: -7 }
  },
  {
    ticker: "EQIX", name: "Equinix, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Equinix: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.9, payoutRatio: 133.0, marketCapB: 101 },
    signals: { technical: 43, momentum: 74, sentiment: 74, news: 0, policy: 0, profile: 50, valuation: -99 }
  },
  {
    ticker: "BMO", name: "Bank of Montreal", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Bank of Montreal: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.77, payoutRatio: 50.7, marketCapB: 127 },
    signals: { technical: 32, momentum: 89, sentiment: 15, news: 0, policy: 0, profile: 60, valuation: 12 }
  },
  {
    ticker: "CVS", name: "CVS Health Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "CVS Health: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.51, payoutRatio: 116.7, marketCapB: 135 },
    signals: { technical: 32, momentum: 79, sentiment: 75, news: 0, policy: 0, profile: 35, valuation: 22 }
  },
  {
    ticker: "MDT", name: "Medtronic plc", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Medtronic: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.45, payoutRatio: 76.1, marketCapB: 102 },
    signals: { technical: -38, momentum: -87, sentiment: 55, news: 0, policy: 0, profile: 50, valuation: 22 }
  },
  {
    ticker: "GSK", name: "GSK plc", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "GSK (GlaxoSmithKline): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.43, payoutRatio: 46.5, marketCapB: 103 },
    signals: { technical: 40, momentum: -21, sentiment: -7, news: 0, policy: 0, profile: 50, valuation: 29 }
  },
  {
    ticker: "DUK", name: "Duke Energy Corporation", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Duke Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.39, payoutRatio: 65.2, marketCapB: 99 },
    signals: { technical: 41, momentum: 0, sentiment: 39, news: 0, policy: 0, profile: 35, valuation: 7 }
  },
  {
    ticker: "MCK", name: "McKesson Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "McKesson: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.41, payoutRatio: 8.3, marketCapB: 94 },
    signals: { technical: -43, momentum: -36, sentiment: 76, news: 0, policy: 0, profile: 10, valuation: 12 }
  },
  {
    ticker: "EQNR", name: "Equinor ASA", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Equinor: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.22, payoutRatio: 67.0, marketCapB: 86 },
    signals: { technical: 32, momentum: 100, sentiment: -17, news: 0, policy: 0, profile: 25, valuation: 31 }
  },
  {
    ticker: "CNQ", name: "Canadian Natural Resources Limited", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Canadian Natural Resources: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.09, payoutRatio: 45.5, marketCapB: 89 },
    signals: { technical: 34, momentum: 79, sentiment: 38, news: 0, policy: 0, profile: 45, valuation: 24 }
  },
  {
    ticker: "CMCSA", name: "Comcast Corporation", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Comcast: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.51, payoutRatio: 25.9, marketCapB: 83 },
    signals: { technical: -41, momentum: -94, sentiment: 22, news: 0, policy: 0, profile: 35, valuation: 41 }
  },
  {
    ticker: "HCA", name: "HCA Healthcare, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "HCA Healthcare: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.8, payoutRatio: 10.1, marketCapB: 81 },
    signals: { technical: -34, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: 15, valuation: 26 }
  },
  {
    ticker: "HWM", name: "Howmet Aerospace Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.18, payoutRatio: 10.7, marketCapB: 111 },
    signals: { technical: 38, momentum: 58, sentiment: 78, news: 0, policy: 0, profile: 50, valuation: -77 }
  },
  {
    ticker: "BNS", name: "The Bank of Nova Scotia", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Bank of Nova Scotia: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.65, payoutRatio: 60.7, marketCapB: 109 },
    signals: { technical: 32, momentum: 49, sentiment: 15, news: 0, policy: 0, profile: 60, valuation: 19 }
  },
  {
    ticker: "CDNS", name: "Cadence Design Systems, Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Cadence Design Systems: R&D di Israel. Perangkat lunak EDA digunakan industri chip.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 104 },
    signals: { technical: 38, momentum: 25, sentiment: 77, news: 0, policy: 0, profile: 50, valuation: -60 }
  },
  {
    ticker: "MAR", name: "Marriott International, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Marriott: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.8, payoutRatio: 28.1, marketCapB: 96 },
    signals: { technical: 39, momentum: 14, sentiment: 38, news: 0, policy: 0, profile: 35, valuation: -23 }
  },
  {
    ticker: "NOW", name: "ServiceNow, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "ServiceNow: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 108 },
    signals: { technical: -38, momentum: -100, sentiment: 79, news: 0, policy: 0, profile: 40, valuation: -2 }
  },
  {
    ticker: "FDX", name: "FedEx Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "FedEx: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.56, payoutRatio: 31.3, marketCapB: 75 },
    signals: { technical: 36, momentum: 55, sentiment: 60, news: 0, policy: 0, profile: 20, valuation: 14 }
  },
  {
    ticker: "MELI", name: "MercadoLibre, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "MercadoLibre: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 95 },
    signals: { technical: -63, momentum: -69, sentiment: 73, news: 0, policy: 0, profile: 15, valuation: -36 }
  },
  {
    ticker: "SNPS", name: "Synopsys, Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Synopsys: R&D semikonduktor di Israel. Tidak ada laporan keterlibatan militer.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 82 },
    signals: { technical: 45, momentum: -94, sentiment: 61, news: 0, policy: 0, profile: 15, valuation: -14 }
  },
  {
    ticker: "KKR", name: "KKR & Co. Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "KKR: portofolio investasi mencakup perusahaan dengan operasi di Israel.",
      sources: ["AFSC Investigate (financial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.77, payoutRatio: 25.2, marketCapB: 91 },
    signals: { technical: -43, momentum: -100, sentiment: 72, news: 0, policy: 0, profile: 25, valuation: 20 }
  },
  {
    ticker: "WMB", name: "The Williams Companies, Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Williams Companies: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.82, payoutRatio: 88.8, marketCapB: 93 },
    signals: { technical: 40, momentum: 64, sentiment: 74, news: 0, policy: 0, profile: 45, valuation: -28 }
  },
  {
    ticker: "WM", name: "Waste Management, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Waste Management: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.5, payoutRatio: 49.5, marketCapB: 94 },
    signals: { technical: -42, momentum: -3, sentiment: 62, news: 0, policy: 0, profile: 20, valuation: -16 }
  },
  {
    ticker: "BK", name: "The Bank of New York Mellon Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "low",
      rationale: "Bank of New York Mellon: layanan kustodian untuk aset Israel. Tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.02, payoutRatio: 25.6, marketCapB: 94 },
    signals: { technical: 0, momentum: 0, sentiment: 44, news: 0, policy: 0, profile: 35, valuation: 17 }
  },
  {
    ticker: "AEM", name: "Agnico Eagle Mines Limited", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Agnico Eagle Mines: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.25, payoutRatio: 15.5, marketCapB: 72 },
    signals: { technical: -39, momentum: -100, sentiment: 59, news: 0, policy: 0, profile: 45, valuation: 27 }
  },
  {
    ticker: "UPS", name: "United Parcel Service, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "UPS: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.81, payoutRatio: 106.2, marketCapB: 97 },
    signals: { technical: 35, momentum: -9, sentiment: 43, news: 0, policy: 0, profile: 25, valuation: 17 }
  },
  {
    ticker: "SPOT", name: "Spotify Technology S.A.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Spotify: berkantor pusat di Swedia, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 99 },
    signals: { technical: -41, momentum: -57, sentiment: 72, news: 0, policy: 0, profile: 25, valuation: -19 }
  },
  {
    ticker: "JCI", name: "Johnson Controls International plc", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.11, payoutRatio: 48.0, marketCapB: 89 },
    signals: { technical: 37, momentum: 74, sentiment: 45, news: 0, policy: 0, profile: 35, valuation: -15 }
  },
  {
    ticker: "USB", name: "U.S. Bancorp", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "U.S. Bancorp: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.34, payoutRatio: 43.2, marketCapB: 97 },
    signals: { technical: 36, momentum: 20, sentiment: 50, news: 0, policy: 0, profile: 45, valuation: 27 }
  },
  {
    ticker: "ADP", name: "Automatic Data Processing, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Automatic Data Processing: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.71, payoutRatio: 60.5, marketCapB: 99 },
    signals: { technical: -43, momentum: -47, sentiment: 17, news: 0, policy: 0, profile: 45, valuation: 0 }
  },
  {
    ticker: "SLB", name: "SLB N.V.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "SLB (Schlumberger): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.49, payoutRatio: 50.7, marketCapB: 71 },
    signals: { technical: 32, momentum: -9, sentiment: 70, news: 0, policy: 0, profile: 25, valuation: 17 }
  },
  {
    ticker: "AMT", name: "American Tower Corporation", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "American Tower: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.12, payoutRatio: 82.3, marketCapB: 79 },
    signals: { technical: -44, momentum: -32, sentiment: 72, news: 0, policy: 0, profile: 30, valuation: -13 }
  },
  {
    ticker: "BSX", name: "Boston Scientific Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Boston Scientific: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 63 },
    signals: { technical: -36, momentum: -100, sentiment: 76, news: 0, policy: 0, profile: 25, valuation: 25 }
  },
  {
    ticker: "CSX", name: "CSX Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "CSX Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.13, payoutRatio: 32.5, marketCapB: 93 },
    signals: { technical: 4, momentum: 100, sentiment: 52, news: 0, policy: 0, profile: 45, valuation: -7 }
  },
  {
    ticker: "ING", name: "ING Groep N.V.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "ING Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.92, payoutRatio: 48.0, marketCapB: 94 },
    signals: { technical: 38, momentum: 19, sentiment: 17, news: 0, policy: 0, profile: 45, valuation: 28 }
  },
  {
    ticker: "E", name: "Eni S.p.A.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Eni: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.94, payoutRatio: 104.0, marketCapB: 72 },
    signals: { technical: 33, momentum: 77, sentiment: 10, news: 0, policy: 0, profile: 20, valuation: 31 }
  },
  {
    ticker: "FCX", name: "Freeport-McMoRan Inc.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Freeport-McMoRan: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 31.8, marketCapB: 89 },
    signals: { technical: 32, momentum: -8, sentiment: 65, news: 0, policy: 0, profile: 35, valuation: 13 }
  },
  {
    ticker: "MRSH", name: "Marsh & McLennan Companies, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.22, payoutRatio: 43.9, marketCapB: 86 },
    signals: { technical: -42, momentum: -40, sentiment: 30, news: 0, policy: 0, profile: 35, valuation: 12 }
  },
  {
    ticker: "BCS", name: "Barclays PLC", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Barclays: tidak ada laporan signifikan terkait Israel.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.68, payoutRatio: 19.6, marketCapB: 93 },
    signals: { technical: 41, momentum: -2, sentiment: 38, news: 0, policy: 0, profile: 45, valuation: 35 }
  },
  {
    ticker: "SU", name: "Suncor Energy Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Suncor Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.75, payoutRatio: 44.5, marketCapB: 72 },
    signals: { technical: 33, momentum: 75, sentiment: 45, news: 0, policy: 0, profile: 35, valuation: 26 }
  },
  {
    ticker: "MCO", name: "Moody's Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "low",
      rationale: "Moody's: rating obligasi Israel.",
      sources: ["AFSC Investigate (partial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.85, payoutRatio: 27.6, marketCapB: 86 },
    signals: { technical: -41, momentum: -52, sentiment: 61, news: 0, policy: 0, profile: 20, valuation: -19 }
  },
  {
    ticker: "MDLZ", name: "Mondelez International, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Mondelez: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.34, payoutRatio: 97.5, marketCapB: 75 },
    signals: { technical: 38, momentum: -3, sentiment: 55, news: 0, policy: 0, profile: 25, valuation: 7 }
  },
  {
    ticker: "MPWR", name: "Monolithic Power Systems, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Monolithic Power Systems: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.62, payoutRatio: 47.8, marketCapB: 68 },
    signals: { technical: 29, momentum: 100, sentiment: 80, news: 0, policy: 0, profile: 35, valuation: -76 }
  },
  {
    ticker: "EMR", name: "Emerson Electric Co.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Emerson Electric: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.64, payoutRatio: 50.1, marketCapB: 76 },
    signals: { technical: 42, momentum: -48, sentiment: 56, news: 0, policy: 0, profile: 35, valuation: 3 }
  },
  {
    ticker: "NET", name: "Cloudflare, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Cloudflare: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 100 },
    signals: { technical: 45, momentum: 100, sentiment: 56, news: 0, policy: 0, profile: -15, valuation: -100 }
  },
  {
    ticker: "DASH", name: "DoorDash, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "DoorDash: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 82 },
    signals: { technical: -27, momentum: -68, sentiment: 71, news: 0, policy: 0, profile: 15, valuation: -12 }
  },
  {
    ticker: "MNST", name: "Monster Beverage Corporation", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Monster Beverage: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 96 },
    signals: { technical: 32, momentum: 61, sentiment: 47, news: 0, policy: 0, profile: 35, valuation: -53 }
  },
  {
    ticker: "APO", name: "Apollo Global Management, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Apollo Global Management: investasi di sektor pertahanan dan infrastruktur dengan eksposur ke Israel.",
      sources: ["AFSC Investigate (financial)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.89, payoutRatio: 128.3, marketCapB: 69 },
    signals: { technical: 35, momentum: -82, sentiment: 60, news: 0, policy: 0, profile: 20, valuation: 26 }
  },
  {
    ticker: "CI", name: "The Cigna Group", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Cigna: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.05, payoutRatio: 25.8, marketCapB: 80 },
    signals: { technical: 30, momentum: 5, sentiment: 73, news: 0, policy: 0, profile: 20, valuation: 32 }
  },
  {
    ticker: "EOG", name: "EOG Resources, Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "EOG Resources: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.92, payoutRatio: 39.2, marketCapB: 74 },
    signals: { technical: 36, momentum: 75, sentiment: 42, news: 0, policy: 0, profile: 45, valuation: 31 }
  },
  {
    ticker: "AEP", name: "American Electric Power Company, Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "American Electric Power: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.81, payoutRatio: 55.6, marketCapB: 73 },
    signals: { technical: 42, momentum: 25, sentiment: 50, news: 0, policy: 0, profile: 35, valuation: 0 }
  },
  {
    ticker: "MMM", name: "3M Company", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.98, payoutRatio: 57.2, marketCapB: 82 },
    signals: { technical: -39, momentum: -49, sentiment: 36, news: 0, policy: 0, profile: 20, valuation: 10 }
  },
  {
    ticker: "VLO", name: "Valero Energy Corporation", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Valero Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.62, payoutRatio: 33.5, marketCapB: 90 },
    signals: { technical: 16, momentum: 100, sentiment: 29, news: 0, policy: 0, profile: 20, valuation: 19 }
  },
  {
    ticker: "ROST", name: "Ross Stores, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Ross Stores: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.81, payoutRatio: 23.2, marketCapB: 71 },
    signals: { technical: 33, momentum: 22, sentiment: 66, news: 0, policy: 0, profile: 15, valuation: -17 }
  },
  {
    ticker: "ITW", name: "Illinois Tool Works Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Illinois Tool Works: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.37, payoutRatio: 58.8, marketCapB: 78 },
    signals: { technical: -43, momentum: -3, sentiment: -12, news: 0, policy: 0, profile: 20, valuation: -7 }
  },
  {
    ticker: "REGN", name: "Regeneron Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Regeneron: co-founder secara publik mendukung Israel. Tidak ada kontrak militer.",
      sources: ["Public statements", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.57, payoutRatio: 8.7, marketCapB: 69 },
    signals: { technical: -37, momentum: -75, sentiment: 64, news: 0, policy: 0, profile: 35, valuation: 23 }
  },
  {
    ticker: "ECL", name: "Ecolab Inc.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Ecolab: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.06, payoutRatio: 37.4, marketCapB: 76 },
    signals: { technical: -37, momentum: -28, sentiment: 64, news: 0, policy: 0, profile: 35, valuation: -25 }
  },
  {
    ticker: "NTES", name: "NetEase, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "NetEase: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.3, payoutRatio: 39.7, marketCapB: 82 },
    signals: { technical: -41, momentum: -66, sentiment: 87, news: 0, policy: 0, profile: 45, valuation: 23 }
  },
  {
    ticker: "HLT", name: "Hilton Worldwide Holdings Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Hilton: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.18, payoutRatio: 9.2, marketCapB: 74 },
    signals: { technical: 41, momentum: 1, sentiment: 42, news: 0, policy: 0, profile: 35, valuation: -33 }
  },
  {
    ticker: "MPC", name: "Marathon Petroleum Corporation", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Marathon Petroleum: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.32, payoutRatio: 25.1, marketCapB: 89 },
    signals: { technical: 15, momentum: 100, sentiment: 34, news: 0, policy: 0, profile: 20, valuation: 23 }
  },
  {
    ticker: "MSI", name: "Motorola Solutions, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.14, payoutRatio: 37.1, marketCapB: 69 },
    signals: { technical: -40, momentum: -2, sentiment: 68, news: 0, policy: 0, profile: 20, valuation: -7 }
  },
  {
    ticker: "KMI", name: "Kinder Morgan, Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Kinder Morgan: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.64, payoutRatio: 78.5, marketCapB: 72 },
    signals: { technical: 38, momentum: 42, sentiment: 44, news: 0, policy: 0, profile: 35, valuation: -4 }
  },
  {
    ticker: "RCL", name: "Royal Caribbean Cruises Ltd.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Royal Caribbean: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.73, payoutRatio: 25.9, marketCapB: 76 },
    signals: { technical: -39, momentum: -46, sentiment: 64, news: 0, policy: 0, profile: 30, valuation: 17 }
  },
  {
    ticker: "NSC", name: "Norfolk Southern Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Norfolk Southern: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.65, payoutRatio: 45.5, marketCapB: 73 },
    signals: { technical: 33, momentum: 16, sentiment: 22, news: 0, policy: 0, profile: 45, valuation: -11 }
  },
  {
    ticker: "PSX", name: "Phillips 66", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Phillips 66: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.56, payoutRatio: 48.1, marketCapB: 81 },
    signals: { technical: 12, momentum: 100, sentiment: 48, news: 0, policy: 0, profile: 20, valuation: 26 }
  },
  {
    ticker: "NU", name: "Nu Holdings Ltd.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Nu Holdings: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 68 },
    signals: { technical: -35, momentum: -86, sentiment: 68, news: 0, policy: 0, profile: 35, valuation: 23 }
  },
  {
    ticker: "DLR", name: "Digital Realty Trust, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.74, payoutRatio: 129.4, marketCapB: 65 },
    signals: { technical: 45, momentum: 5, sentiment: 65, news: 0, policy: 0, profile: 45, valuation: -100 }
  },
  {
    ticker: "NOK", name: "Nokia Oyj", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.32, payoutRatio: 99.8, marketCapB: 65 },
    signals: { technical: 28, momentum: 100, sentiment: 46, news: 0, policy: 0, profile: 20, valuation: -11 }
  },
  {
    ticker: "VALE", name: "Vale S.A.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Vale: perusahaan Brazil, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 8.87, payoutRatio: 120.5, marketCapB: 62 },
    signals: { technical: 38, momentum: -10, sentiment: 42, news: 0, policy: 0, profile: 15, valuation: 38 }
  },
  {
    ticker: "BKR", name: "Baker Hughes Company", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Baker Hughes: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.6, payoutRatio: 29.4, marketCapB: 57 },
    signals: { technical: 34, momentum: 41, sentiment: 63, news: 0, policy: 0, profile: 35, valuation: 0 }
  },
  {
    ticker: "CTAS", name: "Cintas Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Cintas: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.98, payoutRatio: 36.7, marketCapB: 74 },
    signals: { technical: -45, momentum: -42, sentiment: 35, news: 0, policy: 0, profile: 25, valuation: -41 }
  },
  {
    ticker: "CNI", name: "Canadian National Railway Company", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Canadian National Railway: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.06, payoutRatio: 47.1, marketCapB: 76 },
    signals: { technical: 29, momentum: 59, sentiment: 40, news: 0, policy: 0, profile: 45, valuation: 0 }
  },
  {
    ticker: "APD", name: "Air Products and Chemicals, Inc.", sector: "Basic Materials",
    ethics: {
      israelTie: "low",
      rationale: "Air Products: proyek infrastruktur gas di kawasan termasuk Israel. Tidak ada laporan khusus BDS.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.4, payoutRatio: 75.7, marketCapB: 67 },
    signals: { technical: 42, momentum: 13, sentiment: 57, news: 0, policy: 0, profile: 35, valuation: -2 }
  },
  {
    ticker: "AON", name: "Aon plc", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Aon: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.89, payoutRatio: 16.4, marketCapB: 77 },
    signals: { technical: -43, momentum: -19, sentiment: 50, news: 0, policy: 0, profile: 35, valuation: 9 }
  },
  {
    ticker: "ASX", name: "ASE Technology Holding Co., Ltd.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "ASE Technology (Taiwan): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.98, payoutRatio: 50.9, marketCapB: 89 },
    signals: { technical: 45, momentum: 100, sentiment: 100, news: 0, policy: 0, profile: 15, valuation: 0 }
  },
  {
    ticker: "HOOD", name: "Robinhood Markets, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Robinhood: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 102 },
    signals: { technical: -29, momentum: -38, sentiment: 64, news: 0, policy: 0, profile: 50, valuation: -50 }
  },
  {
    ticker: "SPG", name: "Simon Property Group, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Simon Property Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.01, payoutRatio: 60.2, marketCapB: 84 },
    signals: { technical: 37, momentum: 38, sentiment: 28, news: 0, policy: 0, profile: 30, valuation: -38 }
  },
  {
    ticker: "FIX", name: "Comfort Systems USA, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.15, payoutRatio: 6.5, marketCapB: 62 },
    signals: { technical: 37, momentum: 100, sentiment: 89, news: 0, policy: 0, profile: 25, valuation: -38 }
  },
  {
    ticker: "MFC", name: "Manulife Financial Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Manulife Financial: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.23, payoutRatio: 52.0, marketCapB: 69 },
    signals: { technical: 31, momentum: 13, sentiment: 47, news: 0, policy: 0, profile: 45, valuation: 23 }
  },
  {
    ticker: "B", name: "Barrick Mining Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.95, payoutRatio: 23.3, marketCapB: 61 },
    signals: { technical: -44, momentum: -100, sentiment: 52, news: 0, policy: 0, profile: 45, valuation: 35 }
  },
  {
    ticker: "FTNT", name: "Fortinet, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Fortinet: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 122 },
    signals: { technical: 41, momentum: 100, sentiment: 12, news: 0, policy: 0, profile: 50, valuation: -86 }
  },
  {
    ticker: "MSTR", name: "Strategy Inc", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 35 },
    signals: { technical: -54, momentum: -100, sentiment: 86, news: 0, policy: 0, profile: 10, valuation: -5 }
  },
  {
    ticker: "RACE", name: "Ferrari N.V.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Ferrari: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.12, payoutRatio: 33.2, marketCapB: 65 },
    signals: { technical: -37, momentum: -34, sentiment: 78, news: 0, policy: 0, profile: 45, valuation: -29 }
  },
  {
    ticker: "KEYS", name: "Keysight Technologies, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Keysight Technologies: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 56 },
    signals: { technical: 35, momentum: 100, sentiment: 69, news: 0, policy: 0, profile: 25, valuation: -22 }
  },
  {
    ticker: "DB", name: "Deutsche Bank Aktiengesellschaft", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "Deutsche Bank: operasi perbankan di Israel, termasuk layanan untuk perusahaan-perusahaan yang beroperasi di wilayah pendudukan.",
      sources: ["Who Profits (partial)", "AFSC Investigate", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.3, payoutRatio: 21.5, marketCapB: 68 },
    signals: { technical: -39, momentum: -58, sentiment: 50, news: 0, policy: 0, profile: 45, valuation: 39 }
  },
  {
    ticker: "AZO", name: "AutoZone, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "AutoZone: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 49 },
    signals: { technical: -38, momentum: -73, sentiment: 76, news: 0, policy: 0, profile: 25, valuation: 8 }
  },
  {
    ticker: "FANG", name: "Diamondback Energy, Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Diamondback Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.4, payoutRatio: 413.3, marketCapB: 54 },
    signals: { technical: 36, momentum: 70, sentiment: 78, news: 0, policy: 0, profile: 20, valuation: 27 }
  },
  {
    ticker: "LHX", name: "L3Harris Technologies, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "L3Harris Technologies: sistem elektronik militer dan komunikasi yang digunakan IDF. Pemasok langsung ke angkatan bersenjata Israel.",
      sources: ["AFSC Investigate", "Who Profits", "Defense contracts", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.73, payoutRatio: 52.7, marketCapB: 54 },
    signals: { technical: -40, momentum: -76, sentiment: 70, news: 0, policy: 0, profile: 35, valuation: -3 }
  },
  {
    ticker: "OXY", name: "Occidental Petroleum Corporation", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Occidental Petroleum: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.9, payoutRatio: 132.4, marketCapB: 54 },
    signals: { technical: 33, momentum: 65, sentiment: 31, news: 0, policy: 0, profile: 45, valuation: 17 }
  },
  {
    ticker: "AFL", name: "Aflac Incorporated", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Aflac: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.0, payoutRatio: 26.9, marketCapB: 62 },
    signals: { technical: 35, momentum: 13, sentiment: -3, news: 0, policy: 0, profile: 45, valuation: 11 }
  },
  {
    ticker: "MPLX", name: "MPLX LP", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "MPLX LP: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.53, payoutRatio: 88.0, marketCapB: 57 },
    signals: { technical: 40, momentum: -10, sentiment: 44, news: 0, policy: 0, profile: 35, valuation: 25 }
  },
  {
    ticker: "WPM", name: "Wheaton Precious Metals Corp.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Wheaton Precious Metals: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.71, payoutRatio: 17.4, marketCapB: 49 },
    signals: { technical: -38, momentum: -78, sentiment: 84, news: 0, policy: 0, profile: 35, valuation: 1 }
  },
  {
    ticker: "D", name: "Dominion Energy, Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Dominion Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.81, payoutRatio: 78.8, marketCapB: 63 },
    signals: { technical: 31, momentum: 46, sentiment: 9, news: 0, policy: 0, profile: 35, valuation: 3 }
  },
  {
    ticker: "ALL", name: "The Allstate Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Allstate: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.68, payoutRatio: 9.0, marketCapB: 64 },
    signals: { technical: 41, momentum: 39, sentiment: 34, news: 0, policy: 0, profile: 35, valuation: 31 }
  },
  {
    ticker: "CVNA", name: "Carvana Co.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Carvana: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 77 },
    signals: { technical: -35, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: 15, valuation: -36 }
  },
  {
    ticker: "CVE", name: "Cenovus Energy Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Cenovus Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.25, payoutRatio: 31.9, marketCapB: 51 },
    signals: { technical: 33, momentum: 100, sentiment: 76, news: 0, policy: 0, profile: 25, valuation: 26 }
  },
  {
    ticker: "GWW", name: "W.W. Grainger, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "W.W. Grainger: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.67, payoutRatio: 24.3, marketCapB: 65 },
    signals: { technical: 37, momentum: 82, sentiment: 16, news: 0, policy: 0, profile: 15, valuation: -21 }
  },
  {
    ticker: "TER", name: "Teradyne, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Teradyne: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.15, payoutRatio: 9.1, marketCapB: 55 },
    signals: { technical: 32, momentum: 100, sentiment: 64, news: 0, policy: 0, profile: 35, valuation: -47 }
  },
  {
    ticker: "PSA", name: "Public Storage", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Public Storage: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.73, payoutRatio: 124.0, marketCapB: 56 },
    signals: { technical: 38, momentum: 20, sentiment: 26, news: 0, policy: 0, profile: 45, valuation: -31 }
  },
  {
    ticker: "AME", name: "AMETEK, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "AMETEK: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.58, payoutRatio: 19.2, marketCapB: 54 },
    signals: { technical: 43, momentum: 11, sentiment: 65, news: 0, policy: 0, profile: 35, valuation: -19 }
  },
  {
    ticker: "SE", name: "Sea Limited", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Sea Limited: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 67 },
    signals: { technical: -35, momentum: -83, sentiment: 83, news: 0, policy: 0, profile: 15, valuation: -2 }
  },
  {
    ticker: "VST", name: "Vistra Corp.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Vistra Corp: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.58, payoutRatio: 15.2, marketCapB: 53 },
    signals: { technical: -34, momentum: -54, sentiment: 80, news: 0, policy: 0, profile: 10, valuation: 16 }
  },
  {
    ticker: "NDAQ", name: "Nasdaq, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Nasdaq Inc: bursa saham umum. Nasdaq Israel adalah afiliasi terpisah.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.26, payoutRatio: 32.5, marketCapB: 50 },
    signals: { technical: -45, momentum: -65, sentiment: 64, news: 0, policy: 0, profile: 45, valuation: 1 }
  },
  {
    ticker: "ADSK", name: "Autodesk, Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "Autodesk: R&D di Israel, perangkat lunak desain digunakan secara umum termasuk di Israel.",
      sources: ["Company disclosures", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 43 },
    signals: { technical: -35, momentum: -100, sentiment: 81, news: 0, policy: 0, profile: 25, valuation: 16 }
  },
  {
    ticker: "XEL", name: "Xcel Energy Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Xcel Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.96, payoutRatio: 66.3, marketCapB: 50 },
    signals: { technical: 41, momentum: 0, sentiment: 79, news: 0, policy: 0, profile: 35, valuation: 6 }
  },
  {
    ticker: "NUE", name: "Nucor Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Nucor: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.96, payoutRatio: 22.0, marketCapB: 53 },
    signals: { technical: 28, momentum: 100, sentiment: 74, news: 0, policy: 0, profile: 15, valuation: 19 }
  },
  {
    ticker: "MCHP", name: "Microchip Technology Incorporated", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.16, payoutRatio: 827.3, marketCapB: 47 },
    signals: { technical: 34, momentum: 35, sentiment: 72, news: 0, policy: 0, profile: 20, valuation: -3 }
  },
  {
    ticker: "EA", name: "Electronic Arts Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Electronic Arts: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.37, payoutRatio: 21.6, marketCapB: 52 },
    signals: { technical: 1, momentum: -23, sentiment: 5, news: 0, policy: 0, profile: 25, valuation: -4 }
  },
  {
    ticker: "INFY", name: "Infosys Limited", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Infosys: perusahaan India, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.55, payoutRatio: 64.5, marketCapB: 45 },
    signals: { technical: -43, momentum: -100, sentiment: 27, news: 0, policy: 0, profile: 35, valuation: 22 }
  },
  {
    ticker: "COIN", name: "Coinbase Global, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Coinbase: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 43 },
    signals: { technical: -39, momentum: -100, sentiment: 53, news: 0, policy: 0, profile: 25, valuation: -39 }
  },
  {
    ticker: "DDOG", name: "Datadog, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Datadog: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 96 },
    signals: { technical: 44, momentum: 100, sentiment: 77, news: 0, policy: 0, profile: 10, valuation: -100 }
  },
  {
    ticker: "ZTS", name: "Zoetis Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.81, payoutRatio: 33.3, marketCapB: 31 },
    signals: { technical: -37, momentum: -100, sentiment: 48, news: 0, policy: 0, profile: 30, valuation: 29 }
  },
  {
    ticker: "STM", name: "STMicroelectronics N.V.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "STMicroelectronics: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.53, payoutRatio: 225.0, marketCapB: 63 },
    signals: { technical: 31, momentum: 100, sentiment: 50, news: 0, policy: 0, profile: 10, valuation: -24 }
  },
  {
    ticker: "CLS", name: "Celestica Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Celestica: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 40 },
    signals: { technical: 32, momentum: 5, sentiment: 86, news: 0, policy: 0, profile: 15, valuation: -9 }
  },
  {
    ticker: "SNOW", name: "Snowflake Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Snowflake: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 96 },
    signals: { technical: 18, momentum: 57, sentiment: 76, news: 0, policy: 0, profile: -15, valuation: -100 }
  },
  {
    ticker: "AU", name: "AngloGold Ashanti plc", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "AngloGold Ashanti: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.77, payoutRatio: 52.3, marketCapB: 41 },
    signals: { technical: -40, momentum: -83, sentiment: 56, news: 0, policy: 0, profile: 45, valuation: 37 }
  },
  {
    ticker: "GRMN", name: "Garmin Ltd.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Garmin: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.72, payoutRatio: 40.2, marketCapB: 47 },
    signals: { technical: 40, momentum: 20, sentiment: 12, news: 0, policy: 0, profile: 45, valuation: -10 }
  },
  {
    ticker: "EBAY", name: "eBay Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "eBay: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.08, payoutRatio: 27.3, marketCapB: 50 },
    signals: { technical: 42, momentum: 41, sentiment: 18, news: 0, policy: 0, profile: 35, valuation: 9 }
  },
  {
    ticker: "CAH", name: "Cardinal Health, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Cardinal Health: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.88, payoutRatio: 31.2, marketCapB: 54 },
    signals: { technical: 39, momentum: 18, sentiment: 76, news: 0, policy: 0, profile: 10, valuation: 2 }
  },
  {
    ticker: "ROK", name: "Rockwell Automation, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Rockwell Automation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.2, payoutRatio: 55.9, marketCapB: 52 },
    signals: { technical: 41, momentum: 17, sentiment: 38, news: 0, policy: 0, profile: 35, valuation: -36 }
  },
  {
    ticker: "RKLB", name: "Rocket Lab Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Rocket Lab: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 49 },
    signals: { technical: 30, momentum: -61, sentiment: 72, news: 0, policy: 0, profile: -15, valuation: 0 }
  },
  {
    ticker: "PYPL", name: "PayPal Holdings, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "medium",
      rationale: "PayPal: telah mendiskriminasi pengguna Palestina — memblokir akun dan layanan di Gaza/Tepi Barat sementara layanan Israel berjalan normal.",
      sources: ["Human Rights Watch (2021)", "Mondoweiss", "Electronic Intifada", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.21, payoutRatio: 5.2, marketCapB: 42 },
    signals: { technical: -37, momentum: -84, sentiment: 4, news: 0, policy: 0, profile: 35, valuation: 35 }
  },
  {
    ticker: "DAL", name: "Delta Air Lines, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Delta Air Lines: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.9, payoutRatio: 12.4, marketCapB: 56 },
    signals: { technical: 43, momentum: 40, sentiment: 82, news: 0, policy: 0, profile: 15, valuation: 30 }
  },
  {
    ticker: "IDXX", name: "IDEXX Laboratories, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "IDEXX Laboratories: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 43 },
    signals: { technical: -39, momentum: -100, sentiment: 44, news: 0, policy: 0, profile: 35, valuation: -38 }
  },
  {
    ticker: "DEO", name: "Diageo plc", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Diageo: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.05, payoutRatio: 95.6, marketCapB: 45 },
    signals: { technical: -40, momentum: -63, sentiment: 44, news: 0, policy: 0, profile: 35, valuation: 21 }
  },
  {
    ticker: "MT", name: "ArcelorMittal S.A.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "ArcelorMittal: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.91, payoutRatio: 18.3, marketCapB: 51 },
    signals: { technical: 30, momentum: 100, sentiment: 50, news: 0, policy: 0, profile: 10, valuation: 32 }
  },
  {
    ticker: "YUM", name: "Yum! Brands, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "medium",
      rationale: "Yum! Brands: KFC dan Pizza Hut beroperasi di Israel melalui franchisee. KFC Israel mendistribusikan makanan gratis ke tentara Israel (Oktober 2023).",
      sources: ["Times of Israel (2023)", "BDS Movement campaign", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.86, payoutRatio: 46.5, marketCapB: 44 },
    signals: { technical: 42, momentum: -24, sentiment: 36, news: 0, policy: 0, profile: 45, valuation: -4 }
  },
  {
    ticker: "ODFL", name: "Old Dominion Freight Line, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Old Dominion Freight: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.5, payoutRatio: 23.6, marketCapB: 48 },
    signals: { technical: 30, momentum: 78, sentiment: 23, news: 0, policy: 0, profile: 25, valuation: -46 }
  },
  {
    ticker: "MSCI", name: "MSCI Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "MSCI Inc: penyedia indeks, Israel termasuk dalam indeks EM/DM standar.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.36, payoutRatio: 42.5, marketCapB: 44 },
    signals: { technical: 37, momentum: -12, sentiment: 74, news: 0, policy: 0, profile: 45, valuation: -20 }
  },
  {
    ticker: "XYZ", name: "Block, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 48 },
    signals: { technical: 46, momentum: 19, sentiment: 74, news: 0, policy: 0, profile: 10, valuation: 12 }
  },
  {
    ticker: "DHI", name: "D.R. Horton, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "D.R. Horton: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.19, payoutRatio: 16.0, marketCapB: 43 },
    signals: { technical: -38, momentum: -47, sentiment: 24, news: 0, policy: 0, profile: 25, valuation: 22 }
  },
  {
    ticker: "BDX", name: "Becton, Dickinson and Company", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Becton Dickinson: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.73, payoutRatio: 73.0, marketCapB: 42 },
    signals: { technical: -37, momentum: -45, sentiment: 43, news: 0, policy: 0, profile: 25, valuation: 26 }
  },
  {
    ticker: "CMG", name: "Chipotle Mexican Grill, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Chipotle: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 47 },
    signals: { technical: -38, momentum: -59, sentiment: 66, news: 0, policy: 0, profile: 10, valuation: -20 }
  },
  {
    ticker: "AIG", name: "American International Group, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "American International Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.5, payoutRatio: 31.7, marketCapB: 42 },
    signals: { technical: -41, momentum: -4, sentiment: 36, news: 0, policy: 0, profile: 35, valuation: 33 }
  },
  {
    ticker: "KR", name: "The Kroger Co.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Kroger: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.43, payoutRatio: 80.1, marketCapB: 36 },
    signals: { technical: -45, momentum: -39, sentiment: 46, news: 0, policy: 0, profile: 5, valuation: 28 }
  },
  {
    ticker: "TRI", name: "Thomson Reuters Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.78, payoutRatio: 71.3, marketCapB: 40 },
    signals: { technical: -35, momentum: -100, sentiment: 61, news: 0, policy: 0, profile: 35, valuation: 5 }
  },
  {
    ticker: "BIDU", name: "Baidu, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 37 },
    signals: { technical: -38, momentum: -100, sentiment: 75, news: 0, policy: 0, profile: 10, valuation: 23 }
  },
  {
    ticker: "ED", name: "Consolidated Edison, Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Consolidated Edison: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.13, payoutRatio: 58.0, marketCapB: 41 },
    signals: { technical: 38, momentum: 17, sentiment: -16, news: 0, policy: 0, profile: 35, valuation: 8 }
  },
  {
    ticker: "JD", name: "JD.com, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "JD.com: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.55, payoutRatio: 78.5, marketCapB: 39 },
    signals: { technical: -48, momentum: -47, sentiment: 79, news: 0, policy: 0, profile: 20, valuation: 39 }
  },
  {
    ticker: "TTWO", name: "Take-Two Interactive Software, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Take-Two Interactive: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 44 },
    signals: { technical: 52, momentum: -42, sentiment: 92, news: 0, policy: 0, profile: -15, valuation: -11 }
  },
  {
    ticker: "ALNY", name: "Alnylam Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Alnylam Pharmaceuticals: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 38 },
    signals: { technical: -32, momentum: -100, sentiment: 62, news: 0, policy: 0, profile: 10, valuation: -2 }
  },
  {
    ticker: "NBIS", name: "Nebius Group N.V.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Nebius Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 49 },
    signals: { technical: 32, momentum: 100, sentiment: 47, news: 0, policy: 0, profile: 35, valuation: 0 }
  },
  {
    ticker: "CCI", name: "Crown Castle Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Crown Castle: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.32, payoutRatio: 179.3, marketCapB: 35 },
    signals: { technical: -49, momentum: -50, sentiment: 43, news: 0, policy: 0, profile: 45, valuation: -21 }
  },
  {
    ticker: "KB", name: "KB Financial Group Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "KB Financial (Korea): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.55, payoutRatio: 27.0, marketCapB: 43 },
    signals: { technical: 40, momentum: 100, sentiment: 100, news: 0, policy: 0, profile: 45, valuation: 33 }
  },
  {
    ticker: "GFI", name: "Gold Fields Limited", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Gold Fields: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.92, payoutRatio: 20.0, marketCapB: 30 },
    signals: { technical: -42, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: 45, valuation: 42 }
  },
  {
    ticker: "HPE", name: "Hewlett Packard Enterprise Company", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "HP Enterprise: menyediakan sistem biometrik dan infrastruktur IT untuk checkpoint militer Israel di Tepi Barat. Pisah dari HP Inc namun mewarisi kontrak serupa.",
      sources: ["Who Profits database", "AFSC Investigate", "Don't Buy Into Occupation report", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.21, payoutRatio: 50.9, marketCapB: 66 },
    signals: { technical: 34, momentum: 100, sentiment: 46, news: 0, policy: 0, profile: 20, valuation: 22 }
  },
  {
    ticker: "IRM", name: "Iron Mountain Incorporated", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Iron Mountain: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.82, payoutRatio: 358.5, marketCapB: 36 },
    signals: { technical: 38, momentum: 96, sentiment: 64, news: 0, policy: 0, profile: 20, valuation: -77 }
  },
  {
    ticker: "PUK", name: "Prudential plc", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Prudential plc (UK): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.89, payoutRatio: 15.6, marketCapB: 36 },
    signals: { technical: -40, momentum: -61, sentiment: 84, news: 0, policy: 0, profile: 45, valuation: 20 }
  },
  {
    ticker: "LYV", name: "Live Nation Entertainment, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Live Nation Entertainment: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 42 },
    signals: { technical: 39, momentum: 46, sentiment: 71, news: 0, policy: 0, profile: -5, valuation: -100 }
  },
  {
    ticker: "CPNG", name: "Coupang, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Coupang: perusahaan Korea/AS, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 32 },
    signals: { technical: -35, momentum: -93, sentiment: 56, news: 0, policy: 0, profile: -15, valuation: -100 }
  },
  {
    ticker: "HSY", name: "The Hershey Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Hershey: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.31, payoutRatio: 103.6, marketCapB: 35 },
    signals: { technical: -38, momentum: -64, sentiment: 26, news: 0, policy: 0, profile: 25, valuation: 7 }
  },
  {
    ticker: "CCL", name: "Carnival Corporation & plc", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Carnival: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.69, payoutRatio: 13.5, marketCapB: 36 },
    signals: { technical: -44, momentum: -80, sentiment: 68, news: 0, policy: 0, profile: 20, valuation: 29 }
  },
  {
    ticker: "JBL", name: "Jabil Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Jabil: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.1, payoutRatio: 4.0, marketCapB: 34 },
    signals: { technical: 33, momentum: 100, sentiment: 70, news: 0, policy: 0, profile: -5, valuation: 1 }
  },
  {
    ticker: "ADM", name: "Archer-Daniels-Midland Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Archer-Daniels-Midland: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.54, payoutRatio: 91.5, marketCapB: 40 },
    signals: { technical: 31, momentum: 80, sentiment: -9, news: 0, policy: 0, profile: 20, valuation: 14 }
  },
  {
    ticker: "ALC", name: "Alcon Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.52, payoutRatio: 20.4, marketCapB: 33 },
    signals: { technical: -39, momentum: -84, sentiment: 73, news: 0, policy: 0, profile: 15, valuation: 9 }
  },
  {
    ticker: "NTR", name: "Nutrien Ltd.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Nutrien: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.25, payoutRatio: 44.5, marketCapB: 33 },
    signals: { technical: 33, momentum: 25, sentiment: 46, news: 0, policy: 0, profile: 25, valuation: 20 }
  },
  {
    ticker: "LVS", name: "Las Vegas Sands Corp.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Las Vegas Sands: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.4, payoutRatio: 38.8, marketCapB: 30 },
    signals: { technical: -36, momentum: -100, sentiment: 68, news: 0, policy: 0, profile: 20, valuation: 23 }
  },
  {
    ticker: "SYY", name: "Sysco Corporation", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Sysco: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.62, payoutRatio: 60.0, marketCapB: 40 },
    signals: { technical: -42, momentum: 11, sentiment: 34, news: 0, policy: 0, profile: 5, valuation: 9 }
  },
  {
    ticker: "KGC", name: "Kinross Gold Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Kinross Gold: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.62, payoutRatio: 5.7, marketCapB: 29 },
    signals: { technical: -41, momentum: -100, sentiment: 66, news: 0, policy: 0, profile: 35, valuation: 37 }
  },
  {
    ticker: "HAL", name: "Halliburton Company", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Halliburton: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.93, payoutRatio: 37.6, marketCapB: 30 },
    signals: { technical: 31, momentum: 9, sentiment: 57, news: 0, policy: 0, profile: 25, valuation: 23 }
  },
  {
    ticker: "PRU", name: "Prudential Financial, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Prudential Financial: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.82, payoutRatio: 56.1, marketCapB: 40 },
    signals: { technical: 34, momentum: -35, sentiment: -20, news: 0, policy: 0, profile: 25, valuation: 36 }
  },
  {
    ticker: "CRDO", name: "Credo Technology Group Holding Ltd", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Credo Technology: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 44 },
    signals: { technical: 37, momentum: 100, sentiment: 84, news: 0, policy: 0, profile: 35, valuation: -19 }
  },
  {
    ticker: "HBAN", name: "Huntington Bancshares Incorporated", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.47, payoutRatio: 47.7, marketCapB: 36 },
    signals: { technical: 35, momentum: -27, sentiment: 66, news: 0, policy: 0, profile: 45, valuation: 31 }
  },
  {
    ticker: "TCOM", name: "Trip.com Group Limited", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Trip.com: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.57, payoutRatio: 0, marketCapB: 27 },
    signals: { technical: -43, momentum: -100, sentiment: 76, news: 0, policy: 0, profile: 35, valuation: 30 }
  },
  {
    ticker: "PAYX", name: "Paychex, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Paychex: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.3, payoutRatio: 90.6, marketCapB: 39 },
    signals: { technical: -44, momentum: -36, sentiment: -8, news: 0, policy: 0, profile: 45, valuation: 8 }
  },
  {
    ticker: "WDAY", name: "Workday, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Workday: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 35 },
    signals: { technical: -39, momentum: -100, sentiment: 52, news: 0, policy: 0, profile: 15, valuation: 26 }
  },
  {
    ticker: "NRG", name: "NRG Energy, Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "NRG Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.36, payoutRatio: 197.2, marketCapB: 29 },
    signals: { technical: -30, momentum: -50, sentiment: 70, news: 0, policy: 0, profile: 5, valuation: 24 }
  },
  {
    ticker: "AXON", name: "Axon Enterprise, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "low",
      rationale: "Axon Enterprise: produk penegakan hukum, ada kemungkinan penjualan ke Israel namun tidak terdokumentasi spesifik.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 44 },
    signals: { technical: -25, momentum: -71, sentiment: 70, news: 0, policy: 0, profile: 15, valuation: -95 }
  },
  {
    ticker: "A", name: "Agilent Technologies, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Agilent Technologies: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.76, payoutRatio: 20.2, marketCapB: 38 },
    signals: { technical: -43, momentum: -55, sentiment: 69, news: 0, policy: 0, profile: 25, valuation: -1 }
  },
  {
    ticker: "RBLX", name: "Roblox Corporation", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Roblox: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 39 },
    signals: { technical: -25, momentum: -100, sentiment: 59, news: 0, policy: 0, profile: -30, valuation: 0 }
  },
  {
    ticker: "RDDT", name: "Reddit, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Reddit: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 39 },
    signals: { technical: -30, momentum: -82, sentiment: 53, news: 0, policy: 0, profile: 35, valuation: -6 }
  },
  {
    ticker: "MTB", name: "M&T Bank Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "M&T Bank: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.47, payoutRatio: 32.8, marketCapB: 35 },
    signals: { technical: 33, momentum: 20, sentiment: 18, news: 0, policy: 0, profile: 45, valuation: 25 }
  },
  {
    ticker: "VICI", name: "VICI Properties Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "VICI Properties: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.82, payoutRatio: 61.0, marketCapB: 29 },
    signals: { technical: -42, momentum: -46, sentiment: 58, news: 0, policy: 0, profile: 45, valuation: 33 }
  },
  {
    ticker: "DVN", name: "Devon Energy Corporation", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Devon Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.38, payoutRatio: 26.7, marketCapB: 50 },
    signals: { technical: 36, momentum: 44, sentiment: 85, news: 0, policy: 0, profile: 35, valuation: 35 }
  },
  {
    ticker: "ATO", name: "Atmos Energy Corporation", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Atmos Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.23, payoutRatio: 46.1, marketCapB: 30 },
    signals: { technical: -42, momentum: -5, sentiment: 14, news: 0, policy: 0, profile: 45, valuation: 0 }
  },
  {
    ticker: "MTZ", name: "MasTec, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "MasTec: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 29 },
    signals: { technical: 43, momentum: 100, sentiment: 87, news: 0, policy: 0, profile: 10, valuation: -38 }
  },
  {
    ticker: "UMC", name: "United Microelectronics Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "United Microelectronics (Taiwan): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.69, payoutRatio: 71.4, marketCapB: 60 },
    signals: { technical: 50, momentum: 100, sentiment: -38, news: 0, policy: 0, profile: 45, valuation: -27 }
  },
  {
    ticker: "ZM", name: "Zoom Communications, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Zoom Video: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 27 },
    signals: { technical: 38, momentum: -10, sentiment: 52, news: 0, policy: 0, profile: 35, valuation: 16 }
  },
  {
    ticker: "DOV", name: "Dover Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Dover Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.97, payoutRatio: 25.9, marketCapB: 29 },
    signals: { technical: 42, momentum: -9, sentiment: 64, news: 0, policy: 0, profile: 25, valuation: 4 }
  },
  {
    ticker: "RJF", name: "Raymond James Financial, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Raymond James Financial: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.29, payoutRatio: 19.6, marketCapB: 33 },
    signals: { technical: -44, momentum: -33, sentiment: 28, news: 0, policy: 0, profile: 35, valuation: 24 }
  },
  {
    ticker: "EXPE", name: "Expedia Group, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Expedia: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.66, payoutRatio: 14.8, marketCapB: 32 },
    signals: { technical: -29, momentum: -55, sentiment: 42, news: 0, policy: 0, profile: 0, valuation: 25 }
  },
  {
    ticker: "UAL", name: "United Airlines Holdings, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "United Airlines: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 39 },
    signals: { technical: 45, momentum: -12, sentiment: 82, news: 0, policy: 0, profile: 15, valuation: 35 }
  },
  {
    ticker: "EXR", name: "Extra Space Storage Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Extra Space Storage: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.46, payoutRatio: 145.6, marketCapB: 32 },
    signals: { technical: 37, momentum: -14, sentiment: 32, news: 0, policy: 0, profile: 45, valuation: -31 }
  },
  {
    ticker: "RMD", name: "ResMed Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "ResMed: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.21, payoutRatio: 22.5, marketCapB: 28 },
    signals: { technical: -35, momentum: -100, sentiment: 34, news: 0, policy: 0, profile: 45, valuation: 12 }
  },
  {
    ticker: "OTIS", name: "Otis Worldwide Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.32, payoutRatio: 44.7, marketCapB: 28 },
    signals: { technical: -38, momentum: -90, sentiment: 43, news: 0, policy: 0, profile: 35, valuation: 13 }
  },
  {
    ticker: "EC", name: "Ecopetrol S.A.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.09, payoutRatio: 43.2, marketCapB: 33 },
    signals: { technical: 29, momentum: 100, sentiment: -32, news: 0, policy: 0, profile: 25, valuation: 28 }
  },
  {
    ticker: "DOW", name: "Dow Inc.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Dow Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.61, payoutRatio: 700.0, marketCapB: 22 },
    signals: { technical: 31, momentum: 20, sentiment: 30, news: 0, policy: 0, profile: -5, valuation: 14 }
  },
  {
    ticker: "TPR", name: "Tapestry, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tapestry: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.18, payoutRatio: 47.3, marketCapB: 27 },
    signals: { technical: 42, momentum: -22, sentiment: 57, news: 0, policy: 0, profile: 10, valuation: 7 }
  },
  {
    ticker: "EL", name: "The Estée Lauder Companies Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Estée Lauder: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.73, payoutRatio: 471.4, marketCapB: 29 },
    signals: { technical: -45, momentum: -100, sentiment: 32, news: 0, policy: 0, profile: -20, valuation: -16 }
  },
  {
    ticker: "HUM", name: "Humana Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Humana: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.9, payoutRatio: 37.8, marketCapB: 49 },
    signals: { technical: 7, momentum: 100, sentiment: 25, news: 0, policy: 0, profile: 10, valuation: -17 }
  },
  {
    ticker: "TWLO", name: "Twilio Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Twilio: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 33 },
    signals: { technical: 35, momentum: 100, sentiment: 69, news: 0, policy: 0, profile: 10, valuation: -38 }
  },
  {
    ticker: "BIIB", name: "Biogen Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "low",
      rationale: "Biogen: R&D di Israel melalui kemitraan. Tidak ada laporan signifikan BDS.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 28 },
    signals: { technical: 42, momentum: -15, sentiment: 54, news: 0, policy: 0, profile: 25, valuation: 25 }
  },
  {
    ticker: "XYL", name: "Xylem Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.42, payoutRatio: 40.6, marketCapB: 29 },
    signals: { technical: -43, momentum: -69, sentiment: 56, news: 0, policy: 0, profile: 35, valuation: 0 }
  },
  {
    ticker: "RYAAY", name: "Ryanair Holdings plc", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Ryanair: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.54, payoutRatio: 20.5, marketCapB: 33 },
    signals: { technical: -38, momentum: -50, sentiment: 90, news: 0, policy: 0, profile: 35, valuation: 23 }
  },
  {
    ticker: "FE", name: "FirstEnergy Corp.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "FirstEnergy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.88, payoutRatio: 96.7, marketCapB: 28 },
    signals: { technical: -45, momentum: 6, sentiment: 38, news: 0, policy: 0, profile: 25, valuation: 9 }
  },
  {
    ticker: "KHC", name: "The Kraft Heinz Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "low",
      rationale: "Kraft Heinz: sebelumnya bagian dari H.J. Heinz yang memiliki pabrik di Israel. Eksposur terbatas pasca merger.",
      sources: ["Historical records", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.34, payoutRatio: 73.1, marketCapB: 30 },
    signals: { technical: -44, momentum: -2, sentiment: -5, news: 0, policy: 0, profile: -5, valuation: 24 }
  },
  {
    ticker: "CNC", name: "Centene Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Centene: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 34 },
    signals: { technical: 33, momentum: 100, sentiment: 26, news: 0, policy: 0, profile: -15, valuation: 13 }
  },
  {
    ticker: "FOX", name: "Fox Corporation", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Fox Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.12, payoutRatio: 14.7, marketCapB: 21 },
    signals: { technical: -53, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: 35, valuation: 32 }
  },
  {
    ticker: "FOXA", name: "Fox Corporation", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Fox Corporation (A): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 14.7, marketCapB: 23 },
    signals: { technical: -54, momentum: -100, sentiment: 48, news: 0, policy: 0, profile: 35, valuation: 31 }
  },
  {
    ticker: "SYF", name: "Synchrony Financial", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Synchrony Financial: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.64, payoutRatio: 12.4, marketCapB: 25 },
    signals: { technical: -40, momentum: -51, sentiment: 58, news: 0, policy: 0, profile: 45, valuation: 39 }
  },
  {
    ticker: "FN", name: "Fabrinet", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Fabrinet: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 17 },
    signals: { technical: 30, momentum: -12, sentiment: 61, news: 0, policy: 0, profile: 5, valuation: -23 }
  },
  {
    ticker: "DG", name: "Dollar General Corporation", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Dollar General: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.91, payoutRatio: 33.4, marketCapB: 27 },
    signals: { technical: -42, momentum: -91, sentiment: 27, news: 0, policy: 0, profile: 20, valuation: 14 }
  },
  {
    ticker: "CINF", name: "Cincinnati Financial Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Cincinnati Financial: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.06, payoutRatio: 20.3, marketCapB: 28 },
    signals: { technical: 44, momentum: 6, sentiment: 38, news: 0, policy: 0, profile: 45, valuation: 1 }
  },
  {
    ticker: "PHG", name: "Koninklijke Philips N.V.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.7, payoutRatio: 85.3, marketCapB: 25 },
    signals: { technical: -34, momentum: -68, sentiment: 20, news: 0, policy: 0, profile: 25, valuation: 21 }
  },
  {
    ticker: "AWK", name: "American Water Works Company, Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "American Water Works: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.72, payoutRatio: 58.7, marketCapB: 26 },
    signals: { technical: -39, momentum: -23, sentiment: 19, news: 0, policy: 0, profile: 45, valuation: 0 }
  },
  {
    ticker: "CTSH", name: "Cognizant Technology Solutions Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Cognizant: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.99, payoutRatio: 27.3, marketCapB: 20 },
    signals: { technical: -53, momentum: -100, sentiment: 42, news: 0, policy: 0, profile: 35, valuation: 39 }
  },
  {
    ticker: "VRSN", name: "VeriSign, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "VeriSign: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.2, payoutRatio: 34.5, marketCapB: 24 },
    signals: { technical: 37, momentum: 0, sentiment: 50, news: 0, policy: 0, profile: 45, valuation: -16 }
  },
  {
    ticker: "BNTX", name: "BioNTech SE", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "BioNTech: berkantor pusat di Jerman, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 23 },
    signals: { technical: -37, momentum: -65, sentiment: 72, news: 0, policy: 0, profile: -15, valuation: 0 }
  },
  {
    ticker: "FTAI", name: "FTAI Aviation Ltd.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.71, payoutRatio: 26.9, marketCapB: 21 },
    signals: { technical: 39, momentum: -79, sentiment: 80, news: 0, policy: 0, profile: 10, valuation: 8 }
  },
  {
    ticker: "LYB", name: "LyondellBasell Industries N.V.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "LyondellBasell: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.06, payoutRatio: 1146.8, marketCapB: 19 },
    signals: { technical: 32, momentum: 44, sentiment: 14, news: 0, policy: 0, profile: -25, valuation: 33 }
  },
  {
    ticker: "FIS", name: "Fidelity National Information Services, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.0, payoutRatio: 31.8, marketCapB: 21 },
    signals: { technical: -37, momentum: -100, sentiment: 47, news: 0, policy: 0, profile: 45, valuation: 42 }
  },
  {
    ticker: "PPG", name: "PPG Industries, Inc.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "PPG Industries: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.49, payoutRatio: 40.3, marketCapB: 26 },
    signals: { technical: 40, momentum: -6, sentiment: 39, news: 0, policy: 0, profile: 25, valuation: 20 }
  },
  {
    ticker: "KEY", name: "KeyCorp", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "KeyCorp: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.53, payoutRatio: 50.3, marketCapB: 25 },
    signals: { technical: 36, momentum: 8, sentiment: 48, news: 0, policy: 0, profile: 45, valuation: 27 }
  },
  {
    ticker: "DXCM", name: "DexCom, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Dexcom: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 29 },
    signals: { technical: 35, momentum: -12, sentiment: 84, news: 0, policy: 0, profile: 25, valuation: -12 }
  },
  {
    ticker: "JBHT", name: "J.B. Hunt Transport Services, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "J.B. Hunt Transport: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.64, payoutRatio: 27.5, marketCapB: 26 },
    signals: { technical: 36, momentum: 93, sentiment: 48, news: 0, policy: 0, profile: 15, valuation: -28 }
  },
  {
    ticker: "TEAM", name: "Atlassian Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Atlassian: perusahaan Australia, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 23 },
    signals: { technical: -41, momentum: -100, sentiment: 74, news: 0, policy: 0, profile: -15, valuation: 16 }
  },
  {
    ticker: "ULTA", name: "Ulta Beauty, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Ulta Beauty: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 20 },
    signals: { technical: -40, momentum: -100, sentiment: 60, news: 0, policy: 0, profile: 15, valuation: 15 }
  },
  {
    ticker: "ALB", name: "Albemarle Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Albemarle: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.29, payoutRatio: 58.0, marketCapB: 15 },
    signals: { technical: 34, momentum: -100, sentiment: 52, news: 0, policy: 0, profile: -15, valuation: 30 }
  },
  {
    ticker: "FSLR", name: "First Solar, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "First Solar: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 24 },
    signals: { technical: 33, momentum: -51, sentiment: 45, news: 0, policy: 0, profile: 35, valuation: 31 }
  },
  {
    ticker: "CHD", name: "Church & Dwight Co., Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Church & Dwight: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.27, payoutRatio: 39.2, marketCapB: 23 },
    signals: { technical: 41, momentum: 6, sentiment: 38, news: 0, policy: 0, profile: 35, valuation: -10 }
  },
  {
    ticker: "PHM", name: "PulteGroup, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "PulteGroup: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.84, payoutRatio: 9.3, marketCapB: 24 },
    signals: { technical: -37, momentum: -48, sentiment: 40, news: 0, policy: 0, profile: 25, valuation: 26 }
  },
  {
    ticker: "AFRM", name: "Affirm Holdings, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Affirm: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 28 },
    signals: { technical: 50, momentum: 8, sentiment: 65, news: 0, policy: 0, profile: 0, valuation: -6 }
  },
  {
    ticker: "ZS", name: "Zscaler, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Zscaler: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 25 },
    signals: { technical: -30, momentum: -100, sentiment: 74, news: 0, policy: 0, profile: -15, valuation: -39 }
  },
  {
    ticker: "TSN", name: "Tyson Foods, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tyson Foods: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.52, payoutRatio: 159.1, marketCapB: 20 },
    signals: { technical: 45, momentum: -37, sentiment: 19, news: 0, policy: 0, profile: 20, valuation: 21 }
  },
  {
    ticker: "TROW", name: "T. Rowe Price Group, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "T. Rowe Price: manajer aset umum.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.58, payoutRatio: 54.8, marketCapB: 25 },
    signals: { technical: 38, momentum: 1, sentiment: -19, news: 0, policy: 0, profile: 45, valuation: 26 }
  },
  {
    ticker: "WIT", name: "Wipro Limited", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Wipro: perusahaan India, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 10.09, payoutRatio: 87.9, marketCapB: 18 },
    signals: { technical: -47, momentum: -100, sentiment: -50, news: 0, policy: 0, profile: 15, valuation: 24 }
  },
  {
    ticker: "NTAP", name: "NetApp, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "NetApp: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.27, payoutRatio: 32.8, marketCapB: 34 },
    signals: { technical: 36, momentum: 100, sentiment: 30, news: 0, policy: 0, profile: 20, valuation: 6 }
  },
  {
    ticker: "NMR", name: "Nomura Holdings, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Nomura Holdings: perusahaan Jepang, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.35, payoutRatio: 41.9, marketCapB: 28 },
    signals: { technical: 11, momentum: -5, sentiment: 100, news: 0, policy: 0, profile: 20, valuation: 7 }
  },
  {
    ticker: "RL", name: "Ralph Lauren Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Ralph Lauren: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.0, payoutRatio: 24.2, marketCapB: 22 },
    signals: { technical: 40, momentum: -21, sentiment: 68, news: 0, policy: 0, profile: 35, valuation: 5 }
  },
  {
    ticker: "OMC", name: "Omnicom Group Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Omnicom Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.88, payoutRatio: 41.3, marketCapB: 23 },
    signals: { technical: -42, momentum: -15, sentiment: 46, news: 0, policy: 0, profile: 20, valuation: 40 }
  },
  {
    ticker: "TEF", name: "TEF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "LEN", name: "Lennar Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Lennar: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.37, payoutRatio: 31.4, marketCapB: 20 },
    signals: { technical: -40, momentum: -100, sentiment: -22, news: 0, policy: 0, profile: 20, valuation: 21 }
  },
  {
    ticker: "FUTU", name: "Futu Holdings Limited", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Futu Holdings: perusahaan Hong Kong, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.7, payoutRatio: 0, marketCapB: 14 },
    signals: { technical: -38, momentum: -100, sentiment: 80, news: 0, policy: 0, profile: 35, valuation: 35 }
  },
  {
    ticker: "ENTG", name: "Entegris, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Entegris: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.29, payoutRatio: 23.1, marketCapB: 21 },
    signals: { technical: 37, momentum: 99, sentiment: 41, news: 0, policy: 0, profile: 15, valuation: -30 }
  },
  {
    ticker: "WSM", name: "Williams-Sonoma, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.4, payoutRatio: 30.7, marketCapB: 26 },
    signals: { technical: 39, momentum: -4, sentiment: 38, news: 0, policy: 0, profile: 35, valuation: -4 }
  },
  {
    ticker: "DGX", name: "Quest Diagnostics Incorporated", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Quest Diagnostics: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.66, payoutRatio: 36.0, marketCapB: 23 },
    signals: { technical: 40, momentum: 29, sentiment: 42, news: 0, policy: 0, profile: 25, valuation: 7 }
  },
  {
    ticker: "MDB", name: "MongoDB, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "MongoDB: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 28 },
    signals: { technical: -41, momentum: -85, sentiment: 68, news: 0, policy: 0, profile: -15, valuation: -80 }
  },
  {
    ticker: "ASTS", name: "AST SpaceMobile, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "AST SpaceMobile: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 27 },
    signals: { technical: 32, momentum: -100, sentiment: 9, news: 0, policy: 0, profile: 10, valuation: 0 }
  },
  {
    ticker: "CHTR", name: "Charter Communications, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Charter Communications: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 20 },
    signals: { technical: -44, momentum: -100, sentiment: 5, news: 0, policy: 0, profile: 0, valuation: 51 }
  },
  {
    ticker: "SOFI", name: "SoFi Technologies, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "SoFi Technologies: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 24 },
    signals: { technical: -34, momentum: -100, sentiment: 13, news: 0, policy: 0, profile: 25, valuation: -8 }
  },
  {
    ticker: "CHRW", name: "C.H. Robinson Worldwide, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "C.H. Robinson: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.28, payoutRatio: 50.6, marketCapB: 24 },
    signals: { technical: 30, momentum: 25, sentiment: 52, news: 0, policy: 0, profile: 20, valuation: -20 }
  },
  {
    ticker: "ILMN", name: "Illumina, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Illumina: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 29 },
    signals: { technical: 46, momentum: 77, sentiment: 32, news: 0, policy: 0, profile: 25, valuation: -36 }
  },
  {
    ticker: "AS", name: "Amer Sports, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 20 },
    signals: { technical: -42, momentum: -59, sentiment: 86, news: 0, policy: 0, profile: 5, valuation: -5 }
  },
  {
    ticker: "DKS", name: "DICK'S Sporting Goods, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Dick's Sporting Goods: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.31, payoutRatio: 47.6, marketCapB: 19 },
    signals: { technical: 44, momentum: -33, sentiment: 50, news: 0, policy: 0, profile: 10, valuation: 21 }
  },
  {
    ticker: "BURL", name: "Burlington Stores, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Burlington Stores: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 21 },
    signals: { technical: 32, momentum: 8, sentiment: 66, news: 0, policy: 0, profile: 0, valuation: -12 }
  },
  {
    ticker: "GPN", name: "Global Payments Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Global Payments: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.3, payoutRatio: 36.8, marketCapB: 21 },
    signals: { technical: -35, momentum: -42, sentiment: 31, news: 0, policy: 0, profile: -5, valuation: 45 }
  },
  {
    ticker: "RIVN", name: "Rivian Automotive, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Rivian: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 25 },
    signals: { technical: -39, momentum: -55, sentiment: 21, news: 0, policy: 0, profile: -15, valuation: 0 }
  },
  {
    ticker: "SNA", name: "Snap-on Incorporated", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Snap-on: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.43, payoutRatio: 47.3, marketCapB: 21 },
    signals: { technical: 37, momentum: 16, sentiment: 23, news: 0, policy: 0, profile: 35, valuation: 3 }
  },
  {
    ticker: "EXPD", name: "Expeditors International of Washington, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Expeditors International: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.92, payoutRatio: 24.9, marketCapB: 23 },
    signals: { technical: 6, momentum: 8, sentiment: -9, news: 0, policy: 0, profile: 15, valuation: -16 }
  },
  {
    ticker: "PKG", name: "Packaging Corporation of America", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Packaging Corp: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.66, payoutRatio: 60.8, marketCapB: 20 },
    signals: { technical: 42, momentum: -13, sentiment: 50, news: 0, policy: 0, profile: 25, valuation: 6 }
  },
  {
    ticker: "INCY", name: "Incyte Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Incyte: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 23 },
    signals: { technical: 37, momentum: 0, sentiment: 34, news: 0, policy: 0, profile: 35, valuation: 19 }
  },
  {
    ticker: "LNT", name: "Alliant Energy Corporation", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Alliant Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.73, payoutRatio: 64.7, marketCapB: 20 },
    signals: { technical: 40, momentum: 29, sentiment: 57, news: 0, policy: 0, profile: 25, valuation: -2 }
  },
  {
    ticker: "HPQ", name: "HP Inc.", sector: "Technology",
    ethics: {
      israelTie: "low",
      rationale: "HP Inc (HPQ): spin-off dari Hewlett-Packard. Mewarisi koneksi ke sistem biometrik dan printer di pos pemeriksaan Israel, meski lebih sedikit dari HPE.",
      sources: ["Who Profits (partial)", "BDS Movement", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.84, payoutRatio: 43.7, marketCapB: 23 },
    signals: { technical: 31, momentum: 27, sentiment: -12, news: 0, policy: 0, profile: 20, valuation: 35 }
  },
  {
    ticker: "DD", name: "DuPont de Nemours, Inc.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "DuPont: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.78, payoutRatio: 321.0, marketCapB: 18 },
    signals: { technical: 40, momentum: -17, sentiment: 74, news: 0, policy: 0, profile: -15, valuation: 6 }
  },
  {
    ticker: "LUV", name: "Southwest Airlines Co.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Southwest Airlines: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.5, payoutRatio: 48.0, marketCapB: 23 },
    signals: { technical: 44, momentum: 1, sentiment: 22, news: 0, policy: 0, profile: 20, valuation: 30 }
  },
  {
    ticker: "CF", name: "CF Industries Holdings, Inc.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "CF Industries: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.98, payoutRatio: 18.0, marketCapB: 18 },
    signals: { technical: 39, momentum: 100, sentiment: 9, news: 0, policy: 0, profile: 35, valuation: 28 }
  },
  {
    ticker: "DLTR", name: "Dollar Tree, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Dollar Tree: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 24 },
    signals: { technical: -40, momentum: -57, sentiment: 19, news: 0, policy: 0, profile: 0, valuation: 11 }
  },
  {
    ticker: "GIS", name: "General Mills, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "General Mills: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.67, payoutRatio: 59.4, marketCapB: 19 },
    signals: { technical: -39, momentum: -80, sentiment: 0, news: 0, policy: 0, profile: -30, valuation: 26 }
  },
  {
    ticker: "FFIV", name: "F5, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 24 },
    signals: { technical: 36, momentum: 100, sentiment: 23, news: 0, policy: 0, profile: 35, valuation: -13 }
  },
  {
    ticker: "BEKE", name: "KE Holdings Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "KE Holdings: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.72, payoutRatio: 88.1, marketCapB: 18 },
    signals: { technical: -49, momentum: -56, sentiment: 81, news: 0, policy: 0, profile: 10, valuation: 17 }
  },
  {
    ticker: "MRNA", name: "Moderna, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Moderna: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 27 },
    signals: { technical: 58, momentum: 100, sentiment: 2, news: 0, policy: 0, profile: -15, valuation: 0 }
  },
  {
    ticker: "TSCO", name: "Tractor Supply Company", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tractor Supply: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.17, payoutRatio: 45.8, marketCapB: 16 },
    signals: { technical: -41, momentum: -100, sentiment: 45, news: 0, policy: 0, profile: 0, valuation: 19 }
  },
  {
    ticker: "CG", name: "The Carlyle Group Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.17, payoutRatio: 95.9, marketCapB: 16 },
    signals: { technical: -44, momentum: -100, sentiment: 40, news: 0, policy: 0, profile: 25, valuation: 33 }
  },
  {
    ticker: "IOT", name: "Samsara Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Samsara: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 22 },
    signals: { technical: -41, momentum: 7, sentiment: 70, news: 0, policy: 0, profile: 10, valuation: -63 }
  },
  {
    ticker: "LI", name: "Li Auto Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Li Auto: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 12 },
    signals: { technical: -45, momentum: -100, sentiment: 34, news: 0, policy: 0, profile: -25, valuation: 23 }
  },
  {
    ticker: "VTRS", name: "Viatris Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Viatris: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.93, payoutRatio: 960.0, marketCapB: 19 },
    signals: { technical: 38, momentum: 68, sentiment: 40, news: 0, policy: 0, profile: -15, valuation: 41 }
  },
  {
    ticker: "AMCR", name: "Amcor plc", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Amcor: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.13, payoutRatio: 206.8, marketCapB: 20 },
    signals: { technical: -38, momentum: -29, sentiment: 58, news: 0, policy: 0, profile: 10, valuation: 30 }
  },
  {
    ticker: "CDW", name: "CDW Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "CDW Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.75, payoutRatio: 30.6, marketCapB: 18 },
    signals: { technical: -40, momentum: -12, sentiment: 60, news: 0, policy: 0, profile: -5, valuation: 24 }
  },
  {
    ticker: "YUMC", name: "Yum China Holdings, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Yum China: operasi terpisah sepenuhnya di China, tidak terkait YUM Brands Israel.",
      sources: ["Company separation disclosure", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.64, payoutRatio: 38.7, marketCapB: 15 },
    signals: { technical: -44, momentum: -63, sentiment: 82, news: 0, policy: 0, profile: 15, valuation: 20 }
  },
  {
    ticker: "HOLX", name: "Hologic, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Hologic: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IONQ", name: "IonQ, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "IonQ: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 15 },
    signals: { technical: 35, momentum: -100, sentiment: 81, news: 0, policy: 0, profile: 25, valuation: 0 }
  },
  {
    ticker: "ESS", name: "Essex Property Trust, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.48, payoutRatio: 115.9, marketCapB: 21 },
    signals: { technical: 34, momentum: 36, sentiment: 18, news: 0, policy: 0, profile: 45, valuation: -88 }
  },
  {
    ticker: "NLY", name: "Annaly Capital Management, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Annaly Capital: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 13.32, payoutRatio: 90.3, marketCapB: 17 },
    signals: { technical: -42, momentum: -29, sentiment: 54, news: 0, policy: 0, profile: 10, valuation: 36 }
  },
  {
    ticker: "BIP", name: "Brookfield Infrastructure Partners L.P.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Brookfield Infrastructure: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.84, payoutRatio: 264.4, marketCapB: 30 },
    signals: { technical: 34, momentum: 11, sentiment: 66, news: 0, policy: 0, profile: 5, valuation: -19 }
  },
  {
    ticker: "SMCI", name: "Super Micro Computer, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Super Micro Computer: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 18 },
    signals: { technical: -43, momentum: -54, sentiment: 8, news: 0, policy: 0, profile: 0, valuation: 33 }
  },
  {
    ticker: "THC", name: "Tenet Healthcare Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tenet Healthcare: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 16 },
    signals: { technical: -31, momentum: -53, sentiment: 78, news: 0, policy: 0, profile: 5, valuation: 28 }
  },
  {
    ticker: "ZBH", name: "Zimmer Biomet Holdings, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Zimmer Biomet: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.05, payoutRatio: 24.9, marketCapB: 18 },
    signals: { technical: -41, momentum: -28, sentiment: 22, news: 0, policy: 0, profile: 15, valuation: 29 }
  },
  {
    ticker: "NIO", name: "NIO Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "NIO Inc: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: -41, momentum: -16, sentiment: 64, news: 0, policy: 0, profile: -25, valuation: -26 }
  },
  {
    ticker: "BEN", name: "Franklin Resources, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Franklin Templeton: manajer aset umum.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.02, payoutRatio: 99.2, marketCapB: 17 },
    signals: { technical: 42, momentum: 70, sentiment: 14, news: 0, policy: 0, profile: 15, valuation: 28 }
  },
  {
    ticker: "LULU", name: "lululemon athletica inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Lululemon: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: -40, momentum: -100, sentiment: -4, news: 0, policy: 0, profile: 15, valuation: 29 }
  },
  {
    ticker: "H", name: "Hyatt Hotels Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Hyatt Hotels: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.32, payoutRatio: 13.6, marketCapB: 18 },
    signals: { technical: 36, momentum: 22, sentiment: 52, news: 0, policy: 0, profile: -25, valuation: -56 }
  },
  {
    ticker: "AKAM", name: "Akamai Technologies, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Akamai Technologies: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 18 },
    signals: { technical: 35, momentum: 100, sentiment: 44, news: 0, policy: 0, profile: 15, valuation: 7 }
  },
  {
    ticker: "IREN", name: "IREN Limited", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Iris Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 14 },
    signals: { technical: 31, momentum: -100, sentiment: 69, news: 0, policy: 0, profile: 25, valuation: 0 }
  },
  {
    ticker: "GRAB", name: "Grab Holdings Limited", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Grab Holdings: perusahaan Asia Tenggara, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 16 },
    signals: { technical: -29, momentum: -100, sentiment: 89, news: 0, policy: 0, profile: 15, valuation: -22 }
  },
  {
    ticker: "XPEV", name: "XPeng Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "XPeng: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: -44, momentum: -100, sentiment: 64, news: 0, policy: 0, profile: -25, valuation: -9 }
  },
  {
    ticker: "SITM", name: "SiTime Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "SiTime Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 19 },
    signals: { technical: 29, momentum: 100, sentiment: 81, news: 0, policy: 0, profile: -25, valuation: -91 }
  },
  {
    ticker: "JLL", name: "Jones Lang LaSalle Incorporated", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Jones Lang LaSalle: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 15 },
    signals: { technical: -37, momentum: -61, sentiment: 58, news: 0, policy: 0, profile: 0, valuation: 24 }
  },
  {
    ticker: "WMG", name: "Warner Music Group Corp.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Warner Music Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.62, payoutRatio: 89.3, marketCapB: 14 },
    signals: { technical: 42, momentum: -63, sentiment: 68, news: 0, policy: 0, profile: 0, valuation: 17 }
  },
  {
    ticker: "GPC", name: "Genuine Parts Company", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.44, payoutRatio: 943.8, marketCapB: 17 },
    signals: { technical: -31, momentum: -45, sentiment: 45, news: 0, policy: 0, profile: 10, valuation: 16 }
  },
  {
    ticker: "DECK", name: "Deckers Outdoor Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Deckers Outdoor: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 15 },
    signals: { technical: 33, momentum: -11, sentiment: 32, news: 0, policy: 0, profile: 15, valuation: 21 }
  },
  {
    ticker: "LOGI", name: "Logitech International S.A.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Logitech: berkantor pusat di Swiss, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.66, payoutRatio: 32.9, marketCapB: 14 },
    signals: { technical: 34, momentum: -16, sentiment: 10, news: 0, policy: 0, profile: 25, valuation: 11 }
  },
  {
    ticker: "HII", name: "Huntington Ingalls Industries, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "medium",
      rationale: "Huntington Ingalls Industries: galangan kapal militer AS, membangun kapal perang yang dapat beroperasi di Mediterania (dekat Israel). Tidak secara khusus ditargetkan BDS namun pemasok militer AS.",
      sources: ["AFSC Investigate (defense sector)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.94, payoutRatio: 35.5, marketCapB: 11 },
    signals: { technical: -36, momentum: -100, sentiment: 38, news: 0, policy: 0, profile: 10, valuation: 18 }
  },
  {
    ticker: "MOD", name: "Modine Manufacturing Company", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 12 },
    signals: { technical: 33, momentum: 100, sentiment: 94, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "TKO", name: "TKO Group Holdings, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "TKO Group (UFC/WWE): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.69, payoutRatio: 100.4, marketCapB: 35 },
    signals: { technical: -41, momentum: -51, sentiment: 70, news: 0, policy: 0, profile: 20, valuation: -58 }
  },
  {
    ticker: "TME", name: "Tencent Music Entertainment Group", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Tencent Music: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.72, payoutRatio: 29.2, marketCapB: 14 },
    signals: { technical: -44, momentum: -100, sentiment: 66, news: 0, policy: 0, profile: 35, valuation: 35 }
  },
  {
    ticker: "ARCC", name: "Ares Capital Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Ares Capital: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 10.22, payoutRatio: 117.8, marketCapB: 13 },
    signals: { technical: -46, momentum: -55, sentiment: 64, news: 0, policy: 0, profile: 25, valuation: 30 }
  },
  {
    ticker: "ASND", name: "Ascendis Pharma A/S", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 17 },
    signals: { technical: 52, momentum: 63, sentiment: 89, news: 0, policy: 0, profile: 25, valuation: -16 }
  },
  {
    ticker: "MKC", name: "McCormick & Company, Incorporated", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "McCormick: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.57, payoutRatio: 30.9, marketCapB: 14 },
    signals: { technical: -41, momentum: -96, sentiment: 44, news: 0, policy: 0, profile: 35, valuation: 12 }
  },
  {
    ticker: "HAS", name: "Hasbro, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Hasbro: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.55, payoutRatio: 92.4, marketCapB: 11 },
    signals: { technical: 43, momentum: -58, sentiment: 76, news: 0, policy: 0, profile: -30, valuation: 23 }
  },
  {
    ticker: "OKTA", name: "Okta, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Okta: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 27 },
    signals: { technical: 20, momentum: 100, sentiment: 62, news: 0, policy: 0, profile: 15, valuation: -48 }
  },
  {
    ticker: "ALLY", name: "Ally Financial Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Ally Financial: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.66, payoutRatio: 29.1, marketCapB: 14 },
    signals: { technical: 40, momentum: -19, sentiment: 66, news: 0, policy: 0, profile: 25, valuation: 39 }
  },
  {
    ticker: "BBIO", name: "BridgeBio Pharma, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 16 },
    signals: { technical: 46, momentum: 4, sentiment: 78, news: 0, policy: 0, profile: -25, valuation: -100 }
  },
  {
    ticker: "NBIX", name: "Neurocrine Biosciences, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 17 },
    signals: { technical: 42, momentum: 71, sentiment: 80, news: 0, policy: 0, profile: 25, valuation: 19 }
  },
  {
    ticker: "SNN", name: "Smith & Nephew plc", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.52, payoutRatio: 53.2, marketCapB: 13 },
    signals: { technical: -40, momentum: -65, sentiment: 30, news: 0, policy: 0, profile: 25, valuation: 20 }
  },
  {
    ticker: "APTV", name: "Aptiv PLC", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 12 },
    signals: { technical: -47, momentum: -100, sentiment: 78, news: 0, policy: 0, profile: 0, valuation: 34 }
  },
  {
    ticker: "ALGN", name: "Align Technology, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Align Technology: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: 41, momentum: -14, sentiment: 59, news: 0, policy: 0, profile: 15, valuation: 16 }
  },
  {
    ticker: "NYT", name: "The New York Times Company", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "New York Times: tidak ada laporan signifikan terkait afiliasi bisnis.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.23, payoutRatio: 40.8, marketCapB: 12 },
    signals: { technical: 41, momentum: -15, sentiment: 55, news: 0, policy: 0, profile: 25, valuation: -8 }
  },
  {
    ticker: "FIVE", name: "Five Below, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Five Below: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 11 },
    signals: { technical: 37, momentum: -44, sentiment: 60, news: 0, policy: 0, profile: 5, valuation: 0 }
  },
  {
    ticker: "BBY", name: "Best Buy Co., Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Best Buy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.7, payoutRatio: 70.6, marketCapB: 18 },
    signals: { technical: 6, momentum: 56, sentiment: 14, news: 0, policy: 0, profile: 10, valuation: 24 }
  },
  {
    ticker: "AGNC", name: "AGNC Investment Corp.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "AGNC Investment: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 12.94, payoutRatio: 112.5, marketCapB: 13 },
    signals: { technical: -41, momentum: -32, sentiment: 23, news: 0, policy: 0, profile: 10, valuation: 37 }
  },
  {
    ticker: "SMMT", name: "Summit Therapeutics Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Summit Therapeutics: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 12 },
    signals: { technical: -32, momentum: -57, sentiment: 50, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "AEG", name: "Aegon Ltd.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Aegon: perusahaan Belanda, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.3, payoutRatio: 62.8, marketCapB: 13 },
    signals: { technical: 32, momentum: 20, sentiment: 25, news: 0, policy: 0, profile: 15, valuation: 31 }
  },
  {
    ticker: "HUBS", name: "HubSpot, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "HubSpot: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 11 },
    signals: { technical: -34, momentum: -100, sentiment: 60, news: 0, policy: 0, profile: 0, valuation: 19 }
  },
  {
    ticker: "OKLO", name: "Oklo Inc.", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Oklo Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: -48, momentum: -100, sentiment: 48, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "SWK", name: "Stanley Black & Decker, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Stanley Black & Decker: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.84, payoutRatio: 135.7, marketCapB: 14 },
    signals: { technical: 43, momentum: -6, sentiment: 26, news: 0, policy: 0, profile: 10, valuation: 17 }
  },
  {
    ticker: "CHKP", name: "Check Point Software Technologies Ltd.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Check Point Software Technologies: perusahaan keamanan siber yang berkantor pusat di Tel Aviv, Israel. Pendiri dan mayoritas operasi di Israel.",
      sources: ["Who Profits", "Company headquarters: Tel Aviv", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 14 },
    signals: { technical: -36, momentum: -100, sentiment: 41, news: 0, policy: 0, profile: 25, valuation: 24 }
  },
  {
    ticker: "MEDP", name: "Medpace Holdings, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 15 },
    signals: { technical: -35, momentum: -62, sentiment: 4, news: 0, policy: 0, profile: 15, valuation: -25 }
  },
  {
    ticker: "GME", name: "GameStop Corp.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "GameStop: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 10 },
    signals: { technical: -40, momentum: -4, sentiment: 0, news: 0, policy: 0, profile: 25, valuation: 10 }
  },
  {
    ticker: "U", name: "Unity Software Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Unity Software: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 14 },
    signals: { technical: -36, momentum: -100, sentiment: 57, news: 0, policy: 0, profile: -25, valuation: -12 }
  },
  {
    ticker: "HRL", name: "Hormel Foods Corporation", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Hormel Foods: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.78, payoutRatio: 137.1, marketCapB: 14 },
    signals: { technical: -43, momentum: 1, sentiment: 20, news: 0, policy: 0, profile: 10, valuation: 12 }
  },
  {
    ticker: "ALLE", name: "Allegion plc", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.55, payoutRatio: 28.4, marketCapB: 12 },
    signals: { technical: -40, momentum: -78, sentiment: 41, news: 0, policy: 0, profile: 25, valuation: 17 }
  },
  {
    ticker: "PINS", name: "Pinterest, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Pinterest: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: -37, momentum: -79, sentiment: 48, news: 0, policy: 0, profile: 5, valuation: 29 }
  },
  {
    ticker: "AMH", name: "American Homes 4 Rent", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "American Homes 4 Rent: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.91, payoutRatio: 100.0, marketCapB: 14 },
    signals: { technical: 35, momentum: 3, sentiment: 46, news: 0, policy: 0, profile: 35, valuation: -94 }
  },
  {
    ticker: "GDDY", name: "GoDaddy Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "GoDaddy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 12 },
    signals: { technical: -30, momentum: -89, sentiment: 44, news: 0, policy: 0, profile: 0, valuation: 34 }
  },
  {
    ticker: "IVZ", name: "Invesco Ltd.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.03, payoutRatio: 56.5, marketCapB: 13 },
    signals: { technical: 34, momentum: -27, sentiment: 27, news: 0, policy: 0, profile: -15, valuation: 32 }
  },
  {
    ticker: "WMS", name: "Advanced Drainage Systems, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.54, payoutRatio: 13.2, marketCapB: 12 },
    signals: { technical: -33, momentum: -39, sentiment: 90, news: 0, policy: 0, profile: 15, valuation: -1 }
  },
  {
    ticker: "ONON", name: "On Holding AG", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "On Holding: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: -44, momentum: -100, sentiment: 70, news: 0, policy: 0, profile: 5, valuation: 7 }
  },
  {
    ticker: "DKNG", name: "DraftKings Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "DraftKings: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: -50, momentum: -100, sentiment: 72, news: 0, policy: 0, profile: -15, valuation: 15 }
  },
  {
    ticker: "TTD", name: "The Trade Desk, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "The Trade Desk: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 9 },
    signals: { technical: -38, momentum: -100, sentiment: 24, news: 0, policy: 0, profile: 15, valuation: 33 }
  },
  {
    ticker: "NTNX", name: "Nutanix, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Nutanix: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 15 },
    signals: { technical: -42, momentum: -13, sentiment: 44, news: 0, policy: 0, profile: 15, valuation: -15 }
  },
  {
    ticker: "DPZ", name: "Domino's Pizza, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Domino's Pizza: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.57, payoutRatio: 41.5, marketCapB: 10 },
    signals: { technical: -45, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: 25, valuation: 15 }
  },
  {
    ticker: "WYNN", name: "Wynn Resorts, Limited", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Wynn Resorts: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.03, payoutRatio: 28.6, marketCapB: 10 },
    signals: { technical: -42, momentum: -86, sentiment: 90, news: 0, policy: 0, profile: 15, valuation: 6 }
  },
  {
    ticker: "AFG", name: "American Financial Group, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "American Financial Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.46, payoutRatio: 31.9, marketCapB: 12 },
    signals: { technical: 39, momentum: -2, sentiment: 28, news: 0, policy: 0, profile: 25, valuation: 24 }
  },
  {
    ticker: "ACM", name: "AECOM", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "AECOM: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.73, payoutRatio: 23.8, marketCapB: 9 },
    signals: { technical: -38, momentum: -100, sentiment: 77, news: 0, policy: 0, profile: 10, valuation: 29 }
  },
  {
    ticker: "DOCN", name: "DigitalOcean Holdings, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "DigitalOcean: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 13 },
    signals: { technical: 29, momentum: 100, sentiment: 64, news: 0, policy: 0, profile: 25, valuation: -100 }
  },
  {
    ticker: "CHWY", name: "Chewy, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Chewy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: -35, momentum: -100, sentiment: 64, news: 0, policy: 0, profile: 0, valuation: 26 }
  },
  {
    ticker: "SNAP", name: "Snap Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Snap Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: -46, momentum: -100, sentiment: 15, news: 0, policy: 0, profile: -40, valuation: 40 }
  },
  {
    ticker: "CAVA", name: "CAVA Group, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "CAVA Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 28, momentum: -30, sentiment: 54, news: 0, policy: 0, profile: 0, valuation: -100 }
  },
  {
    ticker: "CLX", name: "The Clorox Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Clorox: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.22, payoutRatio: 80.3, marketCapB: 11 },
    signals: { technical: -41, momentum: -65, sentiment: -5, news: 0, policy: 0, profile: 10, valuation: 13 }
  },
  {
    ticker: "WULF", name: "TeraWulf Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "TeraWulf: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 10 },
    signals: { technical: 31, momentum: 100, sentiment: 86, news: 0, policy: 0, profile: 0, valuation: -100 }
  },
  {
    ticker: "SWKS", name: "Skyworks Solutions, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.88, payoutRatio: 117.9, marketCapB: 9 },
    signals: { technical: 35, momentum: -39, sentiment: 6, news: 0, policy: 0, profile: 15, valuation: 26 }
  },
  {
    ticker: "ZG", name: "Zillow Group, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Zillow Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: -36, momentum: -100, sentiment: 46, news: 0, policy: 0, profile: 0, valuation: 28 }
  },
  {
    ticker: "Z", name: "Zillow Group, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Zillow Group (C): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: -35, momentum: -100, sentiment: 22, news: 0, policy: 0, profile: 0, valuation: 28 }
  },
  {
    ticker: "SJM", name: "The J. M. Smucker Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "J.M. Smucker: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.94, payoutRatio: 86.1, marketCapB: 12 },
    signals: { technical: 36, momentum: 1, sentiment: 45, news: 0, policy: 0, profile: -15, valuation: 29 }
  },
  {
    ticker: "AES", name: "The AES Corporation", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "AES Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.77, payoutRatio: 36.7, marketCapB: 11 },
    signals: { technical: 29, momentum: -9, sentiment: 0, news: 0, policy: 0, profile: 10, valuation: 41 }
  },
  {
    ticker: "DVA", name: "DaVita Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "DaVita: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 15 },
    signals: { technical: 36, momentum: 100, sentiment: 12, news: 0, policy: 0, profile: -10, valuation: 19 }
  },
  {
    ticker: "GTLS", name: "Chart Industries, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 10 },
    signals: { technical: 27, momentum: -21, sentiment: 0, news: 0, policy: 0, profile: -25, valuation: -1 }
  },
  {
    ticker: "HMY", name: "Harmony Gold Mining Company Limited", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Harmony Gold: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.72, payoutRatio: 14.6, marketCapB: 10 },
    signals: { technical: -41, momentum: -100, sentiment: 34, news: 0, policy: 0, profile: 35, valuation: 46 }
  },
  {
    ticker: "IT", name: "Gartner, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Gartner: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 9 },
    signals: { technical: -46, momentum: -100, sentiment: 14, news: 0, policy: 0, profile: 0, valuation: 33 }
  },
  {
    ticker: "MGM", name: "MGM Resorts International", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "MGM Resorts: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 12 },
    signals: { technical: 35, momentum: 86, sentiment: 29, news: 0, policy: 0, profile: -15, valuation: -2 }
  },
  {
    ticker: "RVTY", name: "Revvity, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Revvity: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.25, payoutRatio: 13.5, marketCapB: 12 },
    signals: { technical: 44, momentum: -3, sentiment: 36, news: 0, policy: 0, profile: 5, valuation: 2 }
  },
  {
    ticker: "LUMN", name: "Lumen Technologies, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Lumen Technologies: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: 60, momentum: -93, sentiment: -4, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "APLD", name: "Applied Digital Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Applied Digital: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 60, momentum: -100, sentiment: 91, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "BAH", name: "Booz Allen Hamilton Holding Corporation", sector: "Industrials",
    ethics: {
      israelTie: "high",
      rationale: "Booz Allen Hamilton: firma konsultan pertahanan yang mendukung operasi intelijen dan militer Israel melalui kontrak AS-Israel.",
      sources: ["AFSC Investigate", "Federal contracts database", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.64, payoutRatio: 32.5, marketCapB: 8 },
    signals: { technical: -50, momentum: -100, sentiment: 7, news: 0, policy: 0, profile: 0, valuation: 32 }
  },
  {
    ticker: "DOCU", name: "DocuSign, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "DocuSign: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 9 },
    signals: { technical: -39, momentum: -100, sentiment: 14, news: 0, policy: 0, profile: 5, valuation: 30 }
  },
  {
    ticker: "CNM", name: "Core & Main, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 9 },
    signals: { technical: -40, momentum: -93, sentiment: 50, news: 0, policy: 0, profile: 5, valuation: 15 }
  },
  {
    ticker: "SIRI", name: "Sirius XM Holdings Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Sirius XM: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.52, payoutRatio: 45.8, marketCapB: 10 },
    signals: { technical: 39, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: 15, valuation: 32 }
  },
  {
    ticker: "CUBE", name: "CubeSmart", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "CubeSmart: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.22, payoutRatio: 146.8, marketCapB: 9 },
    signals: { technical: 37, momentum: -4, sentiment: 32, news: 0, policy: 0, profile: 35, valuation: -21 }
  },
  {
    ticker: "GAP", name: "The Gap, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.54, payoutRatio: 26.6, marketCapB: 7 },
    signals: { technical: -48, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: 15, valuation: 36 }
  },
  {
    ticker: "MTCH", name: "Match Group, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Match Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.08, payoutRatio: 29.4, marketCapB: 9 },
    signals: { technical: 43, momentum: 38, sentiment: 31, news: 0, policy: 0, profile: 25, valuation: 32 }
  },
  {
    ticker: "BILI", name: "Bilibili Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Bilibili: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: -40, momentum: -100, sentiment: 88, news: 0, policy: 0, profile: 0, valuation: 20 }
  },
  {
    ticker: "BAX", name: "Baxter International Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.89, payoutRatio: 307.7, marketCapB: 11 },
    signals: { technical: 40, momentum: 0, sentiment: 7, news: 0, policy: 0, profile: -25, valuation: 27 }
  },
  {
    ticker: "WAL", name: "Western Alliance Bancorporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.09, payoutRatio: 18.6, marketCapB: 9 },
    signals: { technical: -43, momentum: -54, sentiment: 60, news: 0, policy: 0, profile: 35, valuation: 38 }
  },
  {
    ticker: "AGCO", name: "AGCO Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.05, payoutRatio: 11.2, marketCapB: 8 },
    signals: { technical: 42, momentum: -18, sentiment: 22, news: 0, policy: 0, profile: 15, valuation: 17 }
  },
  {
    ticker: "CELH", name: "Celsius Holdings, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Celsius Holdings: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: -36, momentum: -100, sentiment: 72, news: 0, policy: 0, profile: 5, valuation: 14 }
  },
  {
    ticker: "HUT", name: "Hut 8 Corp.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Hut 8 Corp: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 11 },
    signals: { technical: 29, momentum: 100, sentiment: 86, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "W", name: "Wayfair Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "low",
      rationale: "Wayfair: karyawan melakukan walkout (2019) memprotes penjualan furnitur ke kamp detensi. Tidak terkait langsung Israel namun ada preseden aksi kolektif.",
      sources: ["Boston Globe (2019)", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 12 },
    signals: { technical: -29, momentum: -100, sentiment: 52, news: 0, policy: 0, profile: -25, valuation: -11 }
  },
  {
    ticker: "TECH", name: "Bio-Techne Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.45, payoutRatio: 45.7, marketCapB: 11 },
    signals: { technical: -60, momentum: -3, sentiment: 14, news: 0, policy: 0, profile: 5, valuation: -44 }
  },
  {
    ticker: "NCLH", name: "Norwegian Cruise Line Holdings Ltd.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Norwegian Cruise Line: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 9 },
    signals: { technical: -40, momentum: -93, sentiment: 47, news: 0, policy: 0, profile: -10, valuation: 31 }
  },
  {
    ticker: "LEVI", name: "Levi Strauss & Co.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.65, payoutRatio: 40.0, marketCapB: 9 },
    signals: { technical: 40, momentum: 10, sentiment: 70, news: 0, policy: 0, profile: 15, valuation: 18 }
  },
  {
    ticker: "SBSW", name: "Sibanye Stillwater Limited", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Sibanye Stillwater: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.69, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: -44, momentum: -100, sentiment: 38, news: 0, policy: 0, profile: -15, valuation: 53 }
  },
  {
    ticker: "AOS", name: "A. O. Smith Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.35, payoutRatio: 37.3, marketCapB: 8 },
    signals: { technical: -39, momentum: -74, sentiment: 23, news: 0, policy: 0, profile: 25, valuation: 16 }
  },
  {
    ticker: "MANH", name: "Manhattan Associates, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Manhattan Associates: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 9 },
    signals: { technical: -42, momentum: -60, sentiment: 58, news: 0, policy: 0, profile: 15, valuation: -19 }
  },
  {
    ticker: "ACI", name: "Albertsons Companies, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Albertsons: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.6, payoutRatio: 150.0, marketCapB: 7 },
    signals: { technical: -45, momentum: -77, sentiment: 45, news: 0, policy: 0, profile: -5, valuation: 42 }
  },
  {
    ticker: "CRL", name: "Charles River Laboratories International, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 11 },
    signals: { technical: 45, momentum: -8, sentiment: 64, news: 0, policy: 0, profile: -25, valuation: 3 }
  },
  {
    ticker: "NE", name: "Noble Corporation plc", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Noble Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.79, payoutRatio: 139.9, marketCapB: 7 },
    signals: { technical: 29, momentum: 100, sentiment: 32, news: 0, policy: 0, profile: 15, valuation: 10 }
  },
  {
    ticker: "CYTK", name: "Cytokinetics, Incorporated", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 11 },
    signals: { technical: 53, momentum: 62, sentiment: 75, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "AAL", name: "American Airlines Group Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "American Airlines: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 10 },
    signals: { technical: 47, momentum: -33, sentiment: 38, news: 0, policy: 0, profile: 0, valuation: 41 }
  },
  {
    ticker: "NUVL", name: "Nuvalent, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 10 },
    signals: { technical: 26, momentum: 56, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "QBTS", name: "D-Wave Quantum Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "D-Wave Quantum: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: -48, momentum: -100, sentiment: 90, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "RIG", name: "Transocean Ltd.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Transocean: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 31, momentum: 54, sentiment: 18, news: 0, policy: 0, profile: -25, valuation: 5 }
  },
  {
    ticker: "VFC", name: "V.F. Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "VF Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.15, payoutRatio: 56.2, marketCapB: 7 },
    signals: { technical: -44, momentum: -78, sentiment: 24, news: 0, policy: 0, profile: 0, valuation: 23 }
  },
  {
    ticker: "SYM", name: "Symbotic Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Symbotic: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 26 },
    signals: { technical: -36, momentum: -100, sentiment: 37, news: 0, policy: 0, profile: -15, valuation: -100 }
  },
  {
    ticker: "MBLY", name: "Mobileye Global Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Mobileye: perusahaan teknologi kendaraan otonom yang didirikan di Israel (Jerusalem). Anak perusahaan Intel, berkantor pusat di Jerusalem.",
      sources: ["Company HQ: Jerusalem, Israel", "Intel acquisition disclosure", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: -39, momentum: -66, sentiment: 34, news: 0, policy: 0, profile: -25, valuation: -26 }
  },
  {
    ticker: "UEC", name: "Uranium Energy Corp.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: -40, momentum: -100, sentiment: 78, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "ARE", name: "Alexandria Real Estate Equities, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Alexandria Real Estate: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.99, payoutRatio: 689.5, marketCapB: 8 },
    signals: { technical: -42, momentum: -69, sentiment: 3, news: 0, policy: 0, profile: -15, valuation: 0 }
  },
  {
    ticker: "BIO", name: "Bio-Rad Laboratories, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Bio-Rad Laboratories: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: -40, momentum: -52, sentiment: 0, news: 0, policy: 0, profile: 5, valuation: -32 }
  },
  {
    ticker: "ICL", name: "ICL Group Ltd", sector: "Basic Materials",
    ethics: {
      israelTie: "high",
      rationale: "ICL Group: perusahaan bahan kimia yang berkantor pusat di Tel Aviv, Israel. Operasi utama di Israel termasuk penambangan di Laut Mati.",
      sources: ["Company HQ: Tel Aviv, Israel", "Who Profits", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.87, payoutRatio: 85.6, marketCapB: 6 },
    signals: { technical: 35, momentum: -50, sentiment: 0, news: 0, policy: 0, profile: 10, valuation: 26 }
  },
  {
    ticker: "RIOT", name: "Riot Platforms, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Riot Platforms: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 34, momentum: 48, sentiment: 80, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "VIPS", name: "Vipshop Holdings Limited", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Vipshop: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.45, payoutRatio: 23.4, marketCapB: 7 },
    signals: { technical: -43, momentum: -100, sentiment: 45, news: 0, policy: 0, profile: 15, valuation: 44 }
  },
  {
    ticker: "CIFR", name: "Cipher Digital Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Cipher Mining: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 29, momentum: 14, sentiment: 84, news: 0, policy: 0, profile: -15, valuation: -64 }
  },
  {
    ticker: "CAG", name: "Conagra Brands, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Conagra Brands: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 10.12, payoutRatio: 79.1, marketCapB: 7 },
    signals: { technical: -41, momentum: -77, sentiment: -15, news: 0, policy: 0, profile: -25, valuation: 33 }
  },
  {
    ticker: "GXO", name: "GXO Logistics, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "GXO Logistics: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: -39, momentum: -73, sentiment: 84, news: 0, policy: 0, profile: 0, valuation: 17 }
  },
  {
    ticker: "CORZ", name: "Core Scientific, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Core Scientific: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: 30, momentum: 60, sentiment: 80, news: 0, policy: 0, profile: 0, valuation: -100 }
  },
  {
    ticker: "HIMS", name: "Hims & Hers Health, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Hims & Hers Health: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: -26, momentum: 1, sentiment: 10, news: 0, policy: 0, profile: -40, valuation: -58 }
  },
  {
    ticker: "PAYC", name: "Paycom Software, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Paycom Software: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.02, payoutRatio: 17.4, marketCapB: 7 },
    signals: { technical: -41, momentum: -59, sentiment: 30, news: 0, policy: 0, profile: 35, valuation: 24 }
  },
  {
    ticker: "AXTI", name: "AXT, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "AXT Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: 28, momentum: 100, sentiment: 60, news: 0, policy: 0, profile: -25, valuation: -100 }
  },
  {
    ticker: "CPB", name: "The Campbell's Company", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Campbell Soup: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.05, payoutRatio: 76.5, marketCapB: 7 },
    signals: { technical: -43, momentum: -81, sentiment: -15, news: 0, policy: 0, profile: 5, valuation: 26 }
  },
  {
    ticker: "ADT", name: "ADT Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "ADT Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.24, payoutRatio: 28.9, marketCapB: 5 },
    signals: { technical: -41, momentum: -86, sentiment: 30, news: 0, policy: 0, profile: 10, valuation: 39 }
  },
  {
    ticker: "NICE", name: "NICE Ltd.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "NICE Systems: perusahaan teknologi berkantor pusat di Ra'anana, Israel.",
      sources: ["Company HQ: Ra'anana, Israel", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: -37, momentum: -67, sentiment: 53, news: 0, policy: 0, profile: 15, valuation: 35 }
  },
  {
    ticker: "LW", name: "Lamb Weston Holdings, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.24, payoutRatio: 69.9, marketCapB: 6 },
    signals: { technical: -44, momentum: 13, sentiment: 25, news: 0, policy: 0, profile: -5, valuation: 13 }
  },
  {
    ticker: "ACT", name: "Enact Holdings, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.91, payoutRatio: 18.2, marketCapB: 6 },
    signals: { technical: 37, momentum: 23, sentiment: 20, news: 0, policy: 0, profile: 35, valuation: 32 }
  },
  {
    ticker: "ETSY", name: "Etsy, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Etsy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 45, momentum: 97, sentiment: 23, news: 0, policy: 0, profile: 5, valuation: 21 }
  },
  {
    ticker: "DBX", name: "Dropbox, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Dropbox: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: 36, momentum: 5, sentiment: -25, news: 0, policy: 0, profile: 15, valuation: 33 }
  },
  {
    ticker: "EPAM", name: "EPAM Systems, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "EPAM Systems: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -47, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: 5, valuation: 42 }
  },
  {
    ticker: "RGTI", name: "Rigetti Computing, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Rigetti Computing: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: -51, momentum: -100, sentiment: 66, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "FLG", name: "Flagstar Bank, National Association", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.27, payoutRatio: 21.0, marketCapB: 6 },
    signals: { technical: 36, momentum: 30, sentiment: 53, news: 0, policy: 0, profile: -25, valuation: 30 }
  },
  {
    ticker: "CZR", name: "Caesars Entertainment, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 38, momentum: 44, sentiment: 22, news: 0, policy: 0, profile: -40, valuation: -46 }
  },
  {
    ticker: "OTEX", name: "Open Text Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.67, payoutRatio: 52.8, marketCapB: 5 },
    signals: { technical: -39, momentum: -100, sentiment: 12, news: 0, policy: 0, profile: 15, valuation: 44 }
  },
  {
    ticker: "PATH", name: "UiPath, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "UiPath: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: -36, momentum: -100, sentiment: 10, news: 0, policy: 0, profile: 15, valuation: 20 }
  },
  {
    ticker: "OSCR", name: "Oscar Health, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Oscar Health: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 9 },
    signals: { technical: 41, momentum: 100, sentiment: 9, news: 0, policy: 0, profile: -25, valuation: -2 }
  },
  {
    ticker: "YOU", name: "Clear Secure, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.13, payoutRatio: 42.0, marketCapB: 7 },
    signals: { technical: 48, momentum: 100, sentiment: 30, news: 0, policy: 0, profile: 25, valuation: -2 }
  },
  {
    ticker: "LYFT", name: "Lyft, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Lyft: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: -34, momentum: -96, sentiment: 26, news: 0, policy: 0, profile: 25, valuation: 37 }
  },
  {
    ticker: "DLB", name: "Dolby Laboratories, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.86, payoutRatio: 54.8, marketCapB: 5 },
    signals: { technical: -32, momentum: -100, sentiment: 62, news: 0, policy: 0, profile: 25, valuation: 28 }
  },
  {
    ticker: "KMX", name: "CarMax, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "CarMax: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 35, momentum: 55, sentiment: 5, news: 0, policy: 0, profile: -15, valuation: 4 }
  },
  {
    ticker: "TGTX", name: "TG Therapeutics, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 43, momentum: 100, sentiment: 66, news: 0, policy: 0, profile: 25, valuation: 8 }
  },
  {
    ticker: "GLBE", name: "Global-E Online Ltd.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "high",
      rationale: "Global-E Online: solusi e-commerce cross-border, berkantor pusat di Petah Tikva, Israel.",
      sources: ["Company HQ: Petah Tikva, Israel", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: -36, momentum: -44, sentiment: 81, news: 0, policy: 0, profile: 15, valuation: 0 }
  },
  {
    ticker: "MATX", name: "Matson, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.74, payoutRatio: 10.5, marketCapB: 6 },
    signals: { technical: 31, momentum: 100, sentiment: 84, news: 0, policy: 0, profile: 15, valuation: 18 }
  },
  {
    ticker: "OPEN", name: "Opendoor Technologies Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Opendoor: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -36, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "APLS", name: "Apellis Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: 0, momentum: 0, sentiment: 6, news: 0, policy: 0, profile: 15, valuation: 0 }
  },
  {
    ticker: "DUOL", name: "Duolingo, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Duolingo: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: -40, momentum: -95, sentiment: 8, news: 0, policy: 0, profile: 25, valuation: 10 }
  },
  {
    ticker: "M", name: "Macy's, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.36, payoutRatio: 30.5, marketCapB: 6 },
    signals: { technical: 32, momentum: -7, sentiment: 4, news: 0, policy: 0, profile: 10, valuation: 30 }
  },
  {
    ticker: "BC", name: "Brunswick Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Brunswick Corporation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.29, payoutRatio: 193.2, marketCapB: 5 },
    signals: { technical: 39, momentum: -59, sentiment: 45, news: 0, policy: 0, profile: -15, valuation: 16 }
  },
  {
    ticker: "CROX", name: "Crocs, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Crocs: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: 36, momentum: 100, sentiment: 34, news: 0, policy: 0, profile: -25, valuation: 32 }
  },
  {
    ticker: "MAIN", name: "Main Street Capital Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Main Street Capital: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 8.34, payoutRatio: 89.9, marketCapB: 5 },
    signals: { technical: -45, momentum: -68, sentiment: 7, news: 0, policy: 0, profile: 25, valuation: 19 }
  },
  {
    ticker: "ESTC", name: "Elastic N.V.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Elastic NV: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: -44, momentum: -89, sentiment: 53, news: 0, policy: 0, profile: 25, valuation: 11 }
  },
  {
    ticker: "CRSP", name: "CRISPR Therapeutics AG", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: -32, momentum: -56, sentiment: 48, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "RELY", name: "Remitly Global, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Remitly Global: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: 51, momentum: 100, sentiment: 90, news: 0, policy: 0, profile: 5, valuation: 17 }
  },
  {
    ticker: "WIX", name: "Wix.com Ltd.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Wix.com: platform web hosting yang berkantor pusat di Tel Aviv, Israel. Perusahaan Israel.",
      sources: ["Company HQ: Tel Aviv, Israel", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -31, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: -25, valuation: 38 }
  },
  {
    ticker: "ZETA", name: "Zeta Global Holdings Corp.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Zeta Global: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 41, momentum: -51, sentiment: 78, news: 0, policy: 0, profile: -25, valuation: 1 }
  },
  {
    ticker: "MMYT", name: "MakeMyTrip Limited", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "MakeMyTrip: perusahaan India, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: -27, momentum: -100, sentiment: 92, news: 0, policy: 0, profile: 0, valuation: -13 }
  },
  {
    ticker: "PI", name: "Impinj, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Impinj: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -36, momentum: -100, sentiment: 62, news: 0, policy: 0, profile: -25, valuation: -93 }
  },
  {
    ticker: "QS", name: "QuantumScape Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "QuantumScape: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -41, momentum: -100, sentiment: -22, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "ENPH", name: "Enphase Energy, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Enphase Energy: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 27, momentum: 48, sentiment: 26, news: 0, policy: 0, profile: 5, valuation: 4 }
  },
  {
    ticker: "ACHR", name: "Archer Aviation Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Archer Aviation: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -39, momentum: -100, sentiment: 56, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "FSLY", name: "Fastly, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Fastly: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 43, momentum: 100, sentiment: 27, news: 0, policy: 0, profile: -25, valuation: -98 }
  },
  {
    ticker: "MNSO", name: "MINISO Group Holding Limited", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "MINISO Group: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.83, payoutRatio: 66.5, marketCapB: 3 },
    signals: { technical: -44, momentum: -100, sentiment: 84, news: 0, policy: 0, profile: 15, valuation: 39 }
  },
  {
    ticker: "CVLT", name: "Commvault Systems, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Commvault: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 43, momentum: 29, sentiment: 62, news: 0, policy: 0, profile: -10, valuation: -13 }
  },
  {
    ticker: "KC", name: "Kingsoft Cloud Holdings Limited", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Kingsoft Cloud: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -43, momentum: -100, sentiment: 88, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "TDW", name: "Tidewater Inc.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Tidewater: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: 33, momentum: 70, sentiment: 12, news: 0, policy: 0, profile: 25, valuation: 24 }
  },
  {
    ticker: "MARA", name: "MARA Holdings, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Marathon Digital: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: 32, momentum: 20, sentiment: 40, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "LMND", name: "Lemonade, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Lemonade: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 5 },
    signals: { technical: -28, momentum: -90, sentiment: 0, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "MAT", name: "Mattel, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Mattel: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -44, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: 5, valuation: 34 }
  },
  {
    ticker: "PLUG", name: "Plug Power Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Plug Power: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 37, momentum: -28, sentiment: 10, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "EPR", name: "EPR Properties", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "EPR Properties: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.24, payoutRatio: 109.7, marketCapB: 5 },
    signals: { technical: 36, momentum: 13, sentiment: 17, news: 0, policy: 0, profile: 35, valuation: 0 }
  },
  {
    ticker: "VSCO", name: "Victoria's Secret & Co.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: 0, momentum: 0, sentiment: 60, news: 0, policy: 0, profile: -15, valuation: 20 }
  },
  {
    ticker: "GTLB", name: "GitLab Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "GitLab: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: -30, momentum: -52, sentiment: 24, news: 0, policy: 0, profile: -25, valuation: -36 }
  },
  {
    ticker: "LBTYK", name: "Liberty Global Ltd.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -44, momentum: -37, sentiment: 0, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "SOUN", name: "SoundHound AI, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "SoundHound AI: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -40, momentum: -100, sentiment: 88, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "LEU", name: "Centrus Energy Corp.", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -37, momentum: -100, sentiment: 64, news: 0, policy: 0, profile: 15, valuation: -61 }
  },
  {
    ticker: "SMR", name: "NuScale Power Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "NuScale Power: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -43, momentum: -100, sentiment: 24, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "BBWI", name: "Bath & Body Works, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Bath & Body Works: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.92, payoutRatio: 22.7, marketCapB: 4 },
    signals: { technical: -35, momentum: -64, sentiment: 17, news: 0, policy: 0, profile: 25, valuation: 38 }
  },
  {
    ticker: "BILL", name: "BILL Holdings, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Bill.com: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -30, momentum: -100, sentiment: 52, news: 0, policy: 0, profile: 0, valuation: 23 }
  },
  {
    ticker: "COCO", name: "The Vita Coco Company, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: 31, momentum: 82, sentiment: 68, news: 0, policy: 0, profile: 15, valuation: -47 }
  },
  {
    ticker: "ANF", name: "Abercrombie & Fitch Co.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Abercrombie & Fitch: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -45, momentum: -59, sentiment: 47, news: 0, policy: 0, profile: 5, valuation: 36 }
  },
  {
    ticker: "ACAD", name: "ACADIA Pharmaceuticals Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -30, momentum: -40, sentiment: 62, news: 0, policy: 0, profile: 25, valuation: -25 }
  },
  {
    ticker: "MNDY", name: "monday.com Ltd.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Monday.com: perusahaan SaaS yang berkantor pusat di Tel Aviv, Israel. Perusahaan Israel.",
      sources: ["Company HQ: Tel Aviv, Israel", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -38, momentum: -100, sentiment: 66, news: 0, policy: 0, profile: 5, valuation: 14 }
  },
  {
    ticker: "TWST", name: "Twist Bioscience Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 54, momentum: 100, sentiment: 72, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "ELF", name: "e.l.f. Beauty, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "e.l.f. Beauty: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -27, momentum: -82, sentiment: 58, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "BMI", name: "Badger Meter, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.11, payoutRatio: 34.8, marketCapB: 4 },
    signals: { technical: -36, momentum: -85, sentiment: 34, news: 0, policy: 0, profile: 25, valuation: -22 }
  },
  {
    ticker: "AAP", name: "Advance Auto Parts, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.81, payoutRatio: 89.3, marketCapB: 3 },
    signals: { technical: 36, momentum: 69, sentiment: 0, news: 0, policy: 0, profile: -5, valuation: 18 }
  },
  {
    ticker: "BOX", name: "Box, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Box Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -62, momentum: -22, sentiment: 30, news: 0, policy: 0, profile: -40, valuation: 10 }
  },
  {
    ticker: "TMDX", name: "TransMedics Group, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "TransMedics Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -40, momentum: -100, sentiment: 64, news: 0, policy: 0, profile: 25, valuation: -18 }
  },
  {
    ticker: "ACMR", name: "ACM Research, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "ACM Research: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 7 },
    signals: { technical: 44, momentum: 100, sentiment: 75, news: 0, policy: 0, profile: 5, valuation: -71 }
  },
  {
    ticker: "AVNT", name: "Avient Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.09, payoutRatio: 63.3, marketCapB: 3 },
    signals: { technical: 37, momentum: -12, sentiment: 72, news: 0, policy: 0, profile: 10, valuation: 28 }
  },
  {
    ticker: "IAC", name: "IAC Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "IAC Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 0, momentum: 0, sentiment: 58, news: 0, policy: 0, profile: 0, valuation: 11 }
  },
  {
    ticker: "SKYW", name: "SkyWest, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: -40, momentum: -31, sentiment: 66, news: 0, policy: 0, profile: 15, valuation: 35 }
  },
  {
    ticker: "TRMD", name: "TORM plc", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 9.7, payoutRatio: 62.2, marketCapB: 3 },
    signals: { technical: 34, momentum: 76, sentiment: 50, news: 0, policy: 0, profile: 25, valuation: 40 }
  },
  {
    ticker: "KD", name: "Kyndryl Holdings, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -38, momentum: -100, sentiment: -8, news: 0, policy: 0, profile: -15, valuation: 46 }
  },
  {
    ticker: "MANU", name: "Manchester United plc", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Manchester United: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 4 },
    signals: { technical: 36, momentum: 86, sentiment: 66, news: 0, policy: 0, profile: -40, valuation: -100 }
  },
  {
    ticker: "FIZZ", name: "National Beverage Corp.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 34, momentum: -47, sentiment: -100, news: 0, policy: 0, profile: 15, valuation: 14 }
  },
  {
    ticker: "ZIM", name: "ZIM Integrated Shipping Services Ltd.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.88, payoutRatio: 242.7, marketCapB: 3 },
    signals: { technical: 37, momentum: -10, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "BB", name: "BlackBerry Limited", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 53, momentum: 100, sentiment: -6, news: 0, policy: 0, profile: 15, valuation: -84 }
  },
  {
    ticker: "AMBA", name: "Ambarella, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 47, momentum: -6, sentiment: 43, news: 0, policy: 0, profile: -25, valuation: -100 }
  },
  {
    ticker: "UPST", name: "Upstart Holdings, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Upstart Holdings: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -35, momentum: -100, sentiment: 44, news: 0, policy: 0, profile: -15, valuation: 31 }
  },
  {
    ticker: "CLSK", name: "CleanSpark, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "CleanSpark: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 27, momentum: 14, sentiment: 84, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "WK", name: "Workiva Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Workiva: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -39, momentum: -100, sentiment: 91, news: 0, policy: 0, profile: 0, valuation: 13 }
  },
  {
    ticker: "RUN", name: "Sunrun Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Sunrun: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -38, momentum: -100, sentiment: 48, news: 0, policy: 0, profile: 0, valuation: 15 }
  },
  {
    ticker: "AWR", name: "American States Water Company", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.37, payoutRatio: 57.6, marketCapB: 3 },
    signals: { technical: 9, momentum: 20, sentiment: -17, news: 0, policy: 0, profile: 25, valuation: -7 }
  },
  {
    ticker: "RSI", name: "Rush Street Interactive, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 8 },
    signals: { technical: 40, momentum: 100, sentiment: 82, news: 0, policy: 0, profile: 0, valuation: -63 }
  },
  {
    ticker: "AEHR", name: "Aehr Test Systems, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 27, momentum: 100, sentiment: 75, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "TXG", name: "10x Genomics, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 20, momentum: 100, sentiment: 34, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "SEZL", name: "Sezzle Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 6 },
    signals: { technical: 50, momentum: 100, sentiment: 36, news: 0, policy: 0, profile: 25, valuation: -23 }
  },
  {
    ticker: "WU", name: "The Western Union Company", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Western Union: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 11.94, payoutRatio: 69.1, marketCapB: 2 },
    signals: { technical: -39, momentum: -84, sentiment: -30, news: 0, policy: 0, profile: 0, valuation: 47 }
  },
  {
    ticker: "BTDR", name: "Bitdeer Technologies Group", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 30, momentum: -24, sentiment: 75, news: 0, policy: 0, profile: -40, valuation: 0 }
  },
  {
    ticker: "WDFC", name: "WD-40 Company", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.54, payoutRatio: 59.6, marketCapB: 3 },
    signals: { technical: 44, momentum: 72, sentiment: 75, news: 0, policy: 0, profile: 25, valuation: -52 }
  },
  {
    ticker: "SBLK", name: "Star Bulk Carriers Corp.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.88, payoutRatio: 46.4, marketCapB: 3 },
    signals: { technical: 35, momentum: 90, sentiment: 88, news: 0, policy: 0, profile: 25, valuation: 37 }
  },
  {
    ticker: "PAGS", name: "PagSeguro Digital Ltd.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 11.21, payoutRatio: 10.8, marketCapB: 3 },
    signals: { technical: -42, momentum: -63, sentiment: 40, news: 0, policy: 0, profile: 15, valuation: 45 }
  },
  {
    ticker: "HOG", name: "Harley-Davidson, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Harley-Davidson: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.92, payoutRatio: 37.7, marketCapB: 3 },
    signals: { technical: 38, momentum: 41, sentiment: 19, news: 0, policy: 0, profile: 15, valuation: 21 }
  },
  {
    ticker: "SLNO", name: "Soleno Therapeutics, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Soleno Therapeutics: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 25, valuation: 0 }
  },
  {
    ticker: "EXK", name: "Endeavour Silver Corp.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -42, momentum: -100, sentiment: 88, news: 0, policy: 0, profile: -25, valuation: 41 }
  },
  {
    ticker: "RLX", name: "RLX Technology Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.13, payoutRatio: 103.0, marketCapB: 2 },
    signals: { technical: -45, momentum: -65, sentiment: 75, news: 0, policy: 0, profile: 35, valuation: 24 }
  },
  {
    ticker: "BRZE", name: "Braze, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -33, momentum: -71, sentiment: 86, news: 0, policy: 0, profile: -25, valuation: -21 }
  },
  {
    ticker: "UAA", name: "Under Armour, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Under Armour: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 43, momentum: 33, sentiment: 4, news: 0, policy: 0, profile: -25, valuation: -24 }
  },
  {
    ticker: "UA", name: "Under Armour, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Under Armour (Class C): tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 43, momentum: 38, sentiment: 0, news: 0, policy: 0, profile: -25, valuation: 8 }
  },
  {
    ticker: "SEDG", name: "SolarEdge Technologies, Inc.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "SolarEdge Technologies: perusahaan teknologi surya yang didirikan dan berkantor pusat di Israel (Herzliya). Perusahaan Israel yang listing di NASDAQ.",
      sources: ["Company HQ: Herzliya, Israel", "Company disclosures", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 32, momentum: 100, sentiment: -9, news: 0, policy: 0, profile: -25, valuation: -46 }
  },
  {
    ticker: "DJT", name: "Trump Media & Technology Group Corp.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Trump Media & Technology Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -32, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "FIGS", name: "FIGS, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "FIGS: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 34, momentum: -92, sentiment: 50, news: 0, policy: 0, profile: -15, valuation: -30 }
  },
  {
    ticker: "ACHC", name: "Acadia Healthcare Company, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 48, momentum: 100, sentiment: 50, news: 0, policy: 0, profile: -25, valuation: 6 }
  },
  {
    ticker: "AMSC", name: "American Superconductor Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 38, momentum: 27, sentiment: 100, news: 0, policy: 0, profile: 5, valuation: -11 }
  },
  {
    ticker: "ADMA", name: "ADMA Biologics, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -33, momentum: -100, sentiment: 70, news: 0, policy: 0, profile: 25, valuation: 33 }
  },
  {
    ticker: "FRSH", name: "Freshworks Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -37, momentum: -71, sentiment: 40, news: 0, policy: 0, profile: 25, valuation: 20 }
  },
  {
    ticker: "LU", name: "Lufax Holding Ltd", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -35, momentum: -100, sentiment: 12, news: 0, policy: 0, profile: -45, valuation: 45 }
  },
  {
    ticker: "LCID", name: "Lucid Group, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Lucid Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -40, momentum: -100, sentiment: -8, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "VNET", name: "VNET Group, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "VNET Group: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -46, momentum: -100, sentiment: 75, news: 0, policy: 0, profile: -40, valuation: -52 }
  },
  {
    ticker: "HTO", name: "H2O America", sector: "Utilities",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.82, payoutRatio: 58.2, marketCapB: 3 },
    signals: { technical: 36, momentum: 44, sentiment: 64, news: 0, policy: 0, profile: 25, valuation: -8 }
  },
  {
    ticker: "XRAY", name: "DENTSPLY SIRONA Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Dentsply Sirona: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.04, payoutRatio: 28.8, marketCapB: 3 },
    signals: { technical: -35, momentum: -21, sentiment: 5, news: 0, policy: 0, profile: -15, valuation: 35 }
  },
  {
    ticker: "CPRI", name: "Capri Holdings Limited", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Capri Holdings: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -47, momentum: -100, sentiment: 47, news: 0, policy: 0, profile: -35, valuation: 40 }
  },
  {
    ticker: "AXGN", name: "Axogen, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 41, momentum: 49, sentiment: 89, news: 0, policy: 0, profile: -25, valuation: -99 }
  },
  {
    ticker: "PTON", name: "Peloton Interactive, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Peloton Interactive: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -39, momentum: -49, sentiment: 40, news: 0, policy: 0, profile: 0, valuation: -15 }
  },
  {
    ticker: "ADPT", name: "Adaptive Biotechnologies Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: 45, momentum: 92, sentiment: 75, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "SAM", name: "The Boston Beer Company, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -39, momentum: -90, sentiment: -7, news: 0, policy: 0, profile: -45, valuation: 14 }
  },
  {
    ticker: "ARR", name: "ARMOUR Residential REIT, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 17.07, payoutRatio: 115.7, marketCapB: 2 },
    signals: { technical: -41, momentum: -54, sentiment: 34, news: 0, policy: 0, profile: 10, valuation: 42 }
  },
  {
    ticker: "EOSE", name: "Eos Energy Enterprises, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -20, momentum: -100, sentiment: 25, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "DAC", name: "Danaos Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.78, payoutRatio: 12.4, marketCapB: 2 },
    signals: { technical: 32, momentum: 69, sentiment: 50, news: 0, policy: 0, profile: 35, valuation: 44 }
  },
  {
    ticker: "QUBT", name: "Quantum Computing Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -49, momentum: -100, sentiment: 66, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "MESO", name: "Mesoblast Limited", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -34, momentum: -61, sentiment: 66, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "SEM", name: "Select Medical Holdings Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.02, payoutRatio: 23.4, marketCapB: 2 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: 0, valuation: 24 }
  },
  {
    ticker: "GT", name: "The Goodyear Tire & Rubber Company", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -39, momentum: -100, sentiment: 15, news: 0, policy: 0, profile: -60, valuation: 29 }
  },
  {
    ticker: "AGRO", name: "Adecoagro S.A.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.85, payoutRatio: 1943.6, marketCapB: 2 },
    signals: { technical: 30, momentum: 62, sentiment: 7, news: 0, policy: 0, profile: -10, valuation: 34 }
  },
  {
    ticker: "WB", name: "Weibo Corporation", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Weibo: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.94, payoutRatio: 57.3, marketCapB: 2 },
    signals: { technical: -41, momentum: -100, sentiment: 32, news: 0, policy: 0, profile: 5, valuation: 44 }
  },
  {
    ticker: "BBAI", name: "BigBear.ai Holdings, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "BigBear.ai: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -45, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "LAC", name: "Lithium Americas Corp.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -20, momentum: -100, sentiment: 12, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "WGS", name: "GeneDx Holdings Corp.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -36, momentum: -100, sentiment: 94, news: 0, policy: 0, profile: -45, valuation: -100 }
  },
  {
    ticker: "AGYS", name: "Agilysys, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 3 },
    signals: { technical: -31, momentum: -62, sentiment: 75, news: 0, policy: 0, profile: 15, valuation: -38 }
  },
  {
    ticker: "LTC", name: "LTC Properties, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.75, payoutRatio: 89.4, marketCapB: 2 },
    signals: { technical: 35, momentum: 14, sentiment: 6, news: 0, policy: 0, profile: 35, valuation: -13 }
  },
  {
    ticker: "RDW", name: "Redwire Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 31, momentum: -55, sentiment: 65, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "FMC", name: "FMC Corporation", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.93, payoutRatio: 223.1, marketCapB: 1 },
    signals: { technical: -40, momentum: -100, sentiment: 17, news: 0, policy: 0, profile: -50, valuation: 44 }
  },
  {
    ticker: "MQ", name: "Marqeta, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -35, momentum: -71, sentiment: 7, news: 0, policy: 0, profile: -20, valuation: -55 }
  },
  {
    ticker: "JBLU", name: "JetBlue Airways Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "JetBlue: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 49, momentum: 2, sentiment: -21, news: 0, policy: 0, profile: -60, valuation: 0 }
  },
  {
    ticker: "AHCO", name: "AdaptHealth Corp.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: 40, momentum: -39, sentiment: 69, news: 0, policy: 0, profile: -45, valuation: 33 }
  },
  {
    ticker: "RXRX", name: "Recursion Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -31, momentum: -100, sentiment: 28, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "AMLX", name: "Amylyx Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 51, momentum: 100, sentiment: 92, news: 0, policy: 0, profile: 0, valuation: 0 }
  },
  {
    ticker: "WOLF", name: "Wolfspeed, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 0, momentum: 100, sentiment: -25, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "FIVN", name: "Five9, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Five9: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 47, momentum: 72, sentiment: 62, news: 0, policy: 0, profile: -20, valuation: 39 }
  },
  {
    ticker: "PAYO", name: "Payoneer Global Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Payoneer: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 5, momentum: 75, sentiment: 19, news: 0, policy: 0, profile: 5, valuation: 3 }
  },
  {
    ticker: "HLF", name: "Herbalife Ltd.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -35, momentum: -93, sentiment: 50, news: 0, policy: 0, profile: -20, valuation: 48 }
  },
  {
    ticker: "APPN", name: "Appian Corporation", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Appian: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -43, momentum: -100, sentiment: 7, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ASAN", name: "Asana, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Asana: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -43, momentum: -100, sentiment: 17, news: 0, policy: 0, profile: -45, valuation: 12 }
  },
  {
    ticker: "GCT", name: "GigaCloud Technology Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "GigaCloud Technology: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -41, momentum: -94, sentiment: 62, news: 0, policy: 0, profile: -5, valuation: 38 }
  },
  {
    ticker: "KSS", name: "Kohl's Corporation", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.98, payoutRatio: 21.0, marketCapB: 2 },
    signals: { technical: -48, momentum: -82, sentiment: -15, news: 0, policy: 0, profile: -10, valuation: 26 }
  },
  {
    ticker: "IIPR", name: "Innovative Industrial Properties, Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Innovative Industrial Properties: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 11.91, payoutRatio: 193.9, marketCapB: 2 },
    signals: { technical: 36, momentum: 51, sentiment: 8, news: 0, policy: 0, profile: 5, valuation: 20 }
  },
  {
    ticker: "ENVX", name: "Enovix Corporation", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Enovix: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -50, momentum: -100, sentiment: 71, news: 0, policy: 0, profile: -35, valuation: 0 }
  },
  {
    ticker: "INOD", name: "Innodata Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 31, momentum: 2, sentiment: 88, news: 0, policy: 0, profile: 15, valuation: -40 }
  },
  {
    ticker: "BAND", name: "Bandwidth Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Bandwidth Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 42, momentum: 100, sentiment: 60, news: 0, policy: 0, profile: -25, valuation: -40 }
  },
  {
    ticker: "PSEC", name: "Prospect Capital Corporation", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 22.03, payoutRatio: 211.8, marketCapB: 1 },
    signals: { technical: -41, momentum: -90, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 40 }
  },
  {
    ticker: "ABCL", name: "AbCellera Biologics Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 59, momentum: 100, sentiment: 94, news: 0, policy: 0, profile: -25, valuation: 0 }
  },
  {
    ticker: "AI", name: "C3.ai, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "C3.ai: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -52, momentum: -100, sentiment: -25, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "TRIP", name: "Tripadvisor, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tripadvisor: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -36, momentum: -45, sentiment: 15, news: 0, policy: 0, profile: -20, valuation: 33 }
  },
  {
    ticker: "NVAX", name: "Novavax, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: 44, momentum: 1, sentiment: 34, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "UPWK", name: "Upwork Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -38, momentum: -100, sentiment: 25, news: 0, policy: 0, profile: -5, valuation: 44 }
  },
  {
    ticker: "WEN", name: "The Wendy's Company", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Wendy's: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.47, payoutRatio: 72.7, marketCapB: 1 },
    signals: { technical: -31, momentum: -69, sentiment: -2, news: 0, policy: 0, profile: -30, valuation: 25 }
  },
  {
    ticker: "IQ", name: "iQIYI, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "iQIYI: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -36, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 17 }
  },
  {
    ticker: "TDOC", name: "Teladoc Health, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Teladoc Health: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 49, momentum: 65, sentiment: 26, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "COUR", name: "Coursera, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Coursera: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: -35, momentum: -100, sentiment: 38, news: 0, policy: 0, profile: -45, valuation: 39 }
  },
  {
    ticker: "AMPL", name: "Amplitude, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Amplitude: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -60, momentum: -63, sentiment: 62, news: 0, policy: 0, profile: -45, valuation: -100 }
  },
  {
    ticker: "OXLC", name: "Oxford Lane Capital Corp.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 26.29, payoutRatio: 1215.9, marketCapB: 1 },
    signals: { technical: -42, momentum: -100, sentiment: 100, news: 0, policy: 0, profile: -45, valuation: 54 }
  },
  {
    ticker: "CRON", name: "Cronos Group Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Cronos Group: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: 42, momentum: -18, sentiment: 75, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "AMPH", name: "Amphastar Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -42, momentum: -100, sentiment: -7, news: 0, policy: 0, profile: -5, valuation: 41 }
  },
  {
    ticker: "SLI", name: "Standard Lithium Ltd.", sector: "Basic Materials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -20, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "INMD", name: "InMode Ltd.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -38, momentum: -17, sentiment: 0, news: 0, policy: 0, profile: 5, valuation: 29 }
  },
  {
    ticker: "SANA", name: "Sana Biotechnology, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -22, momentum: -100, sentiment: 78, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "JMIA", name: "Jumia Technologies AG", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -43, momentum: -100, sentiment: 90, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "AMC", name: "AMC Entertainment Holdings, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "AMC Entertainment: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 24, momentum: 17, sentiment: 15, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "ARKO", name: "Arko Corp.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Arko Corp: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.48, payoutRatio: 60.0, marketCapB: 1 },
    signals: { technical: 31, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -25, valuation: -100 }
  },
  {
    ticker: "CRSR", name: "Corsair Gaming, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Corsair Gaming: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: 48, momentum: 100, sentiment: 31, news: 0, policy: 0, profile: -20, valuation: 22 }
  },
  {
    ticker: "TLRY", name: "Tilray Brands, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tilray Brands: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -42, momentum: -100, sentiment: 25, news: 0, policy: 0, profile: -45, valuation: 8 }
  },
  {
    ticker: "EH", name: "EHang Holdings Limited", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "EHang Holdings: perusahaan China, tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -43, momentum: -100, sentiment: 55, news: 0, policy: 0, profile: -45, valuation: 36 }
  },
  {
    ticker: "NRDS", name: "NerdWallet, Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -36, momentum: -100, sentiment: 50, news: 0, policy: 0, profile: -15, valuation: 46 }
  },
  {
    ticker: "NEGG", name: "Newegg Commerce, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -20, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "FCEL", name: "FuelCell Energy, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 2 },
    signals: { technical: 61, momentum: 100, sentiment: 19, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "DNUT", name: "Krispy Kreme, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Krispy Kreme: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.47, payoutRatio: 700.0, marketCapB: 1 },
    signals: { technical: -55, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -50, valuation: -100 }
  },
  {
    ticker: "AIV", name: "Apartment Investment and Management Company", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -3, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: 5, valuation: 0 }
  },
  {
    ticker: "VITL", name: "Vital Farms, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -31, momentum: -100, sentiment: 25, news: 0, policy: 0, profile: -15, valuation: -28 }
  },
  {
    ticker: "TASK", name: "TaskUs, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -44, momentum: -100, sentiment: 12, news: 0, policy: 0, profile: -15, valuation: 48 }
  },
  {
    ticker: "TDUP", name: "ThredUp Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -25, momentum: -15, sentiment: 86, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "GEMI", name: "Gemini Space Station, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -46, momentum: -100, sentiment: 17, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "DNA", name: "Ginkgo Bioworks Holdings, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -25, momentum: -45, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "BMBL", name: "Bumble Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -29, momentum: -85, sentiment: -3, news: 0, policy: 0, profile: -45, valuation: 50 }
  },
  {
    ticker: "SFIX", name: "Stitch Fix, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 17, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "BTBT", name: "Bit Digital, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Bit Digital: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: -39, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "PUBM", name: "PubMatic, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "PubMatic: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 1 },
    signals: { technical: 45, momentum: 100, sentiment: 46, news: 0, policy: 0, profile: -45, valuation: -24 }
  },
  {
    ticker: "CGC", name: "Canopy Growth Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Canopy Growth: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 19, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "BBW", name: "Build-A-Bear Workshop, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.74, payoutRatio: 20.8, marketCapB: 0 },
    signals: { technical: -38, momentum: -100, sentiment: 88, news: 0, policy: 0, profile: 5, valuation: 37 }
  },
  {
    ticker: "BYND", name: "Beyond Meat, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Beyond Meat: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -38, momentum: -100, sentiment: -40, news: 0, policy: 0, profile: 5, valuation: 0 }
  },
  {
    ticker: "FVRR", name: "Fiverr International Ltd.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Fiverr International: berkantor pusat di Tel Aviv, Israel — perusahaan Israel.",
      sources: ["Company HQ: Tel Aviv, Israel", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -32, momentum: -100, sentiment: 25, news: 0, policy: 0, profile: -15, valuation: 44 }
  },
  {
    ticker: "ATOM", name: "Atomera Incorporated", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 28, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "OSPN", name: "OneSpan Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.44, payoutRatio: 27.1, marketCapB: 1 },
    signals: { technical: 35, momentum: 35, sentiment: 50, news: 0, policy: 0, profile: 15, valuation: 24 }
  },
  {
    ticker: "FUBO", name: "FuboTV Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Fubo TV: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 65, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "NNDM", name: "Nano Dimension Ltd.", sector: "Technology",
    ethics: {
      israelTie: "high",
      rationale: "Nano Dimension: perusahaan Israel yang berkantor pusat di Nes Ziona. Manufaktur elektronik aditif, sebagian untuk aplikasi pertahanan.",
      sources: ["Company HQ: Nes Ziona, Israel", "Company disclosures", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -66, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: -100 }
  },
  {
    ticker: "HNST", name: "The Honest Company, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 100, sentiment: 36, news: 0, policy: 0, profile: -45, valuation: -40 }
  },
  {
    ticker: "TCPC", name: "BlackRock TCP Capital Corp.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 26.67, payoutRatio: 377.8, marketCapB: 0 },
    signals: { technical: -46, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 46 }
  },
  {
    ticker: "ASPN", name: "Aspen Aerogels, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "OTLY", name: "Oatly Group AB", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -26, momentum: -77, sentiment: 40, news: 0, policy: 0, profile: -60, valuation: 0 }
  },
  {
    ticker: "CLPT", name: "ClearPoint Neuro, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -21, momentum: -20, sentiment: 100, news: 0, policy: 0, profile: -60, valuation: 0 }
  },
  {
    ticker: "EGHT", name: "8x8, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 50, momentum: 14, sentiment: 25, news: 0, policy: 0, profile: -35, valuation: 41 }
  },
  {
    ticker: "MLAC", name: "Mountain Lake Acquisition Corp.", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "API", name: "Agora, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: -78, sentiment: 50, news: 0, policy: 0, profile: -15, valuation: 0 }
  },
  {
    ticker: "ANGI", name: "Angi Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Angi Inc: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -34, momentum: -100, sentiment: 28, news: 0, policy: 0, profile: -20, valuation: 40 }
  },
  {
    ticker: "ABEO", name: "Abeona Therapeutics Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 20, momentum: 100, sentiment: 100, news: 0, policy: 0, profile: 5, valuation: -13 }
  },
  {
    ticker: "GPRO", name: "GoPro, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "GoPro: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 18 }
  },
  {
    ticker: "SPCE", name: "Virgin Galactic Holdings, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 25, momentum: -87, sentiment: 15, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "FNKO", name: "Funko, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 41, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: -15 }
  },
  {
    ticker: "HRTX", name: "Heron Therapeutics, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -60, momentum: 18, sentiment: 0, news: 0, policy: 0, profile: -60, valuation: 52 }
  },
  {
    ticker: "ARQQ", name: "Arqit Quantum Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -17, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "KLTR", name: "Kaltura, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -43, momentum: -90, sentiment: 0, news: 0, policy: 0, profile: -60, valuation: 1 }
  },
  {
    ticker: "ACB", name: "Aurora Cannabis Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -100, sentiment: 42, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "VERI", name: "Veritone, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -20, momentum: -100, sentiment: 62, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "PLBY", name: "Playboy, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -46, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -60, valuation: -27 }
  },
  {
    ticker: "ONL", name: "Orion Properties Inc.", sector: "Real Estate",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.94, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 46, momentum: 59, sentiment: 0, news: 0, policy: 0, profile: -35, valuation: 0 }
  },
  {
    ticker: "RENT", name: "Rent the Runway, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -15, valuation: 0 }
  },
  {
    ticker: "BYRN", name: "Byrna Technologies Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -20, momentum: -100, sentiment: 34, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "SKLZ", name: "Skillz Inc.", sector: "Communication Services",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 0, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "EXFY", name: "Expensify, Inc.", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 52, momentum: 70, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: -17 }
  },
  {
    ticker: "AMWL", name: "American Well Corporation", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 19, momentum: 100, sentiment: 15, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "INO", name: "Inovio Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -35, momentum: -100, sentiment: 38, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "GGR", name: "Gogoro Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 46, momentum: 45, sentiment: 0, news: 0, policy: 0, profile: -60, valuation: 0 }
  },
  {
    ticker: "FLNA", name: "Filana Therapeutics, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 75, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "PRTS", name: "CarParts.com, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 32, momentum: 3, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "BIRD", name: "Allbirds, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -46, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -60, valuation: 0 }
  },
  {
    ticker: "INDO", name: "Indonesia Energy Corporation Limited", sector: "Energy",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -32, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "FLUX", name: "Flux Power Holdings, Inc.", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -45, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "CTXR", name: "Citius Pharmaceuticals, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -35, momentum: -100, sentiment: 100, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SLAI", name: "SOLAI Limited", sector: "Technology",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "BNGO", name: "Bionano Genomics, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -38, momentum: -100, sentiment: 75, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "SMX", name: "SMX (Security Matters) Public Limited Company", sector: "Industrials",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -25, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ATER", name: "Aterian, Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "ENVB", name: "Enveric Biosciences, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "NUWE", name: "Nuwellis, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -20, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "QVCAQ", name: "QVC Group Inc.", sector: "Consumer Cyclical",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -48, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "XXII", name: "22nd Century Group, Inc.", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Tidak ditemukan dalam laporan publik BDS Movement, Who Profits, AFSC Investigate, atau media kredibel yang mengaitkan perusahaan ini dengan pendudukan Israel. Klasifikasi default konservatif — lakukan verifikasi mandiri.",
      sources: ["(auto-default: tidak ada laporan spesifik ditemukan)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -20, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -45, valuation: 0 }
  },
  {
    ticker: "BF.B", name: "Brown-Forman Corporation", sector: "Consumer Defensive",
    ethics: {
      israelTie: "none",
      rationale: "Brown-Forman: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.5, payoutRatio: 59.8, marketCapB: 12 },
    signals: { technical: -40, momentum: -46, sentiment: -8, news: 0, policy: 0, profile: 25, valuation: 16 }
  },
  {
    ticker: "FCNCA", name: "First Citizens BancShares, Inc.", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.4, payoutRatio: 4.7, marketCapB: 24 },
    signals: { technical: 39, momentum: -42, sentiment: 17, news: 0, policy: 0, profile: 35, valuation: 29 }
  },
  {
    ticker: "TEM", name: "Tempus AI, Inc.", sector: "Healthcare",
    ethics: {
      israelTie: "none",
      rationale: "Tempus AI: tidak ada laporan signifikan.",
      sources: ["Company filings", "(auto-klasifikasi, perlu verifikasi)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 11 },
    signals: { technical: -24, momentum: -77, sentiment: 45, news: 0, policy: 0, profile: -40, valuation: 0 }
  },
  {
    ticker: "ACP", name: "Abrdn Income Credit Strategies Fund", sector: "Financial Services",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 17.92, payoutRatio: 140.9, marketCapB: 1 },
    signals: { technical: -38, momentum: -50, sentiment: 0, news: 0, policy: 0, profile: 5, valuation: 0 }
  },
  {
    ticker: "SLV", name: "iShares Silver Trust", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VTV", name: "Vanguard Value Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.88, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: 9, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "PGX", name: "Invesco Preferred ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.27, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -35, momentum: -41, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VIG", name: "Vanguard Dividend Appreciation Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.51, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: -9, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "TLT", name: "iShares 20+ Year Treasury Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.53, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -30, momentum: -40, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "BND", name: "Vanguard Total Bond Market Index Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.95, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -33, momentum: -33, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "QQQ", name: "Invesco QQQ Trust", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.41, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 22, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SMH", name: "VanEck Semiconductor ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.17, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IEF", name: "iShares 7-10 Year Treasury Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.88, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -34, momentum: -36, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "MBB", name: "iShares MBS ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.26, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -35, momentum: -33, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "ICLN", name: "iShares Global Clean Energy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.9, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 1, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IGOV", name: "iShares International Treasury Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.43, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -36, momentum: -34, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VNQI", name: "Vanguard Global ex-U.S. Real Estate Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.81, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -41, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SKYY", name: "First Trust Cloud Computing ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: -4, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VTIP", name: "Vanguard Short-Term Inflation-Protected Securities Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.6, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 79, momentum: -26, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "BNDX", name: "Vanguard Total International Bond Index Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.46, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -35, momentum: -31, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "PDBC", name: "Invesco Optimum Yield Diversified Commodity Strategy No K-1 ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.2, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 53, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "CIBR", name: "First Trust NASDAQ Cybersecurity ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.44, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: 72, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BOTZ", name: "Global X Robotics & Artificial Intelligence ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.47, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 44, momentum: -49, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SPY", name: "State Street SPDR S&P 500 ETF Trust", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.01, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "DIA", name: "State Street SPDR Dow Jones Industrial Average ETF Trust", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.38, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: -7, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XLE", name: "State Street Energy Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.85, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 33, momentum: 49, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XLV", name: "State Street Health Care Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.6, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -25, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XLF", name: "State Street Financial Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.51, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 31, momentum: -21, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XLP", name: "State Street Consumer Staples Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.64, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -13, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XLU", name: "State Street Utilities Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.64, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -2, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XLY", name: "State Street Consumer Discretionary Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.77, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -50, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "XLB", name: "State Street Materials Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.67, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -12, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "IWM", name: "iShares Russell 2000 ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.88, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 15, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VTI", name: "Vanguard Total Stock Market Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.05, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "LQD", name: "iShares iBoxx $ Investment Grade Corporate Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.55, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -30, momentum: -36, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VGT", name: "Vanguard Information Technology Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.36, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 47, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VNQ", name: "Vanguard Real Estate Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.6, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 2, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "FXI", name: "iShares China Large-Cap ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.14, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -46, momentum: -83, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VWO", name: "Vanguard Emerging Markets Stock Index Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.32, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 41, momentum: -10, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "USO", name: "United States Oil Fund, LP", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 33, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "GDX", name: "VanEck Gold Miners ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.84, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -99, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "DBA", name: "Invesco DB Agriculture Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.42, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: -1, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VEA", name: "Vanguard FTSE Developed Markets Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.54, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 2, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "AOR", name: "iShares Core 60/40 Balanced Allocation ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.47, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -13, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EIDO", name: "iShares MSCI Indonesia ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.63, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "ACWI", name: "iShares MSCI ACWI ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.43, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "HDV", name: "iShares Core High Dividend ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.9, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 11, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SPLV", name: "Invesco S&P 500 Low Volatility ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.14, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: -8, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SPHD", name: "Invesco S&P 500 High Dividend Low Volatility ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.58, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: -3, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "ARKK", name: "ARK Innovation ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 45, momentum: -39, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "JPIN", name: "JPMorgan Diversified Return International Equity ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.23, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -11, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "BLOK", name: "Amplify Blockchain Technology ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.78, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -32, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "GLD", name: "SPDR Gold Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -66, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IBIT", name: "iShares Bitcoin Trust ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "TQQQ", name: "ProShares UltraPro QQQ", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.46, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 86, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "TSLL", name: "Direxion Daily TSLA Bull 2X Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.94, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -46, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SQQQ", name: "ProShares UltraPro Short QQQ", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 11.03, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "CONL", name: "GraniteShares 2x Long COIN Daily ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SOXS", name: "Direxion Daily Semiconductor Bear 3X Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 70.0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -44, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BITO", name: "ProShares Bitcoin ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 75.49, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "NVDL", name: "GraniteShares 2x Long NVDA Daily ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 41, momentum: 24, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SGOV", name: "iShares 0-3 Month Treasury Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.85, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -26, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SOXL", name: "Direxion Daily Semiconductor Bull 3X Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 23, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VCIT", name: "Vanguard Intermediate-Term Corporate Bond Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.78, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -33, momentum: -35, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VXUS", name: "Vanguard Total International Stock Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.56, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -1, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "QYLD", name: "Global X NASDAQ 100 Covered Call ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.94, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: -18, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWZ", name: "iShares MSCI Brazil ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.24, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: 4, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "MSTU", name: "T-Rex 2X Long MSTR Daily Target ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -50, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VCSH", name: "Vanguard Short-Term Corporate Bond Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.44, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -35, momentum: -31, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "JEPQ", name: "JPMorgan Nasdaq Equity Premium Income ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 9.95, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -21, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EMB", name: "iShares J.P. Morgan USD Emerging Markets Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.02, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -35, momentum: -29, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SOXX", name: "iShares Semiconductor ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.23, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EWY", name: "iShares MSCI South Korea ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.01, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SHY", name: "iShares 1-3 Year Treasury Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.68, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -38, momentum: -30, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "KWEB", name: "KraneShares CSI China Internet ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 8.61, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -43, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "MCHI", name: "iShares MSCI China ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.14, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -42, momentum: -84, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "HYG", name: "iShares iBoxx $ High Yield Corporate Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 5.9, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -38, momentum: -32, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XBI", name: "State Street SPDR S&P Biotech ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.36, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 50, momentum: 57, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "XLK", name: "State Street Technology Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.42, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 56, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "QQQM", name: "Invesco NASDAQ 100 ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.43, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 22, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "FNGU", name: "MicroSectors FANG+ 3X Leveraged", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 46, momentum: 21, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BOIL", name: "ProShares Ultra Bloomberg Natural Gas", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -44, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "UNG", name: "United States Natural Gas Fund, LP", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -46, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "XLRE", name: "State Street Real Estate Select Sector SPDR ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.19, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 4, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "KOLD", name: "ProShares UltraShort Bloomberg Natural Gas", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -36, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IEI", name: "iShares 3-7 Year Treasury Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.63, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -36, momentum: -34, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.17, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 14, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "BUG", name: "Global X Cybersecurity ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.03, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 20, momentum: 94, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "MSTZ", name: "T-Rex 2X Inverse MSTR Daily Target ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -20, momentum: -93, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SCHG", name: "Schwab U.S. Large-Cap Growth ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.39, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: -10, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "AIQ", name: "Global X Artificial Intelligence & Technology ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.07, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 28, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BITU", name: "Proshares Ultra Bitcoin ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 25.0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "USIG", name: "iShares Broad USD Investment Grade Corporate Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.72, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -32, momentum: -34, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "NVDY", name: "YieldMax NVDA Option Income Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 34.01, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -63, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IEFA", name: "iShares Core MSCI EAFE ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.4, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -11, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VT", name: "Vanguard Total World Stock Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.58, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWT", name: "iShares MSCI Taiwan ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.92, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 41, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VYMI", name: "Vanguard International High Dividend Yield Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.68, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 5, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "IAU", name: "iShares Gold Trust", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -66, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "AGQ", name: "ProShares Ultra Silver", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -50, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "COPX", name: "Global X Copper Miners ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.51, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 32, momentum: -32, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "TMF", name: "Direxion Daily 20+ Year Treasury Bull 3X Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.09, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -34, momentum: -69, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWJ", name: "iShares MSCI Japan ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.81, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 6, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWH", name: "iShares MSCI Hong Kong ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.95, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -42, momentum: -39, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "URA", name: "Global X Uranium ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.79, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -92, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWA", name: "iShares MSCI Australia ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.01, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: 1, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "YINN", name: "Direxion Daily FTSE China Bull 3X Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.77, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -52, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XHB", name: "State Street SPDR S&P Homebuilders ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.68, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -43, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VOO", name: "Vanguard S&P 500 ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.07, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "QLD", name: "ProShares Ultra QQQ", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.12, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 58, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "GDXJ", name: "VanEck Junior Gold Miners ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.7, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SPYI", name: "Neos S&P 500(R) High Income ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.46, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: -25, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.97, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -33, momentum: -34, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SGOL", name: "abrdn Physical Gold Shares ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -66, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "UGL", name: "ProShares Ultra Gold", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "JEPI", name: "JPMorgan Equity Premium Income ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 8.11, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -43, momentum: -36, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IVV", name: "iShares Core S&P 500 ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.09, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 0, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XRT", name: "State Street SPDR S&P Retail ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.77, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -44, momentum: -34, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "QQQE", name: "Direxion NASDAQ-100 Equal Weighted Index Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.56, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 17, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "JNK", name: "State Street SPDR Bloomberg High Yield Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.6, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -33, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "MAGS", name: "Roundhill Magnificent Seven ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.52, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: -21, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWU", name: "iShares MSCI United Kingdom ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.27, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -18, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "UPRO", name: "ProShares UltraPro S&P500", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.76, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 33, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "AAAU", name: "Goldman Sachs Physical Gold ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -66, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "JETS", name: "U.S. Global Jets ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.7, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 45, momentum: -8, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SPXL", name: "Direxion Daily S&P500 Bull 3X Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.53, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 33, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "INDA", name: "iShares MSCI India ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -56, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "URNM", name: "Sprott Uranium Miners ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.32, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -97, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "FEPI", name: "REX FANG & Innovation Equity Premium Income ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.76, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -51, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "TAN", name: "Invesco Solar ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: -7, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "YMAX", name: "YieldMax Universe Fund of Option Income ETFs", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 40.25, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -37, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "REMX", name: "VanEck Rare Earth and Strategic Metals ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.47, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: -63, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWC", name: "iShares MSCI Canada ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.3, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 31, momentum: -2, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "PPLT", name: "abrdn Physical Platinum Shares ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SJNK", name: "State Street SPDR Bloomberg Short Term High Yield Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -36, momentum: -33, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "DBC", name: "Invesco DB Commodity Index Tracking Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.8, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 51, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SPMO", name: "Invesco S&P 500 Momentum ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.65, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 62, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SHLD", name: "Global X Defense Tech ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.71, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -97, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "JPST", name: "JPMorgan Ultra-Short Income ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.25, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -28, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "USD", name: "ProShares Ultra Semiconductors", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.29, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BNO", name: "United States Brent Oil Fund, LP", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EMLC", name: "VanEck J.P. Morgan EM Local Currency Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 6.15, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -33, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "AIPI", name: "REX AI Equity Premium Income ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.72, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -57, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "MSTY", name: "Yieldmax MSTR Option Income Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 28.38, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -51, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "TIP", name: "iShares TIPS Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.77, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -29, momentum: -33, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EWG", name: "iShares MSCI Germany ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.01, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -45, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "CLOU", name: "Global X Cloud Computing ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: -5, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "QTEC", name: "First Trust NASDAQ-100-Technology Sector Index Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.01, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 77, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "LIT", name: "Global X Lithium & Battery Tech ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.64, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -19, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "CPER", name: "United States Copper Index Fund, LP", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: -12, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "TLH", name: "iShares 10-20 Year Treasury Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.44, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -32, momentum: -39, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "CWEB", name: "Direxion Daily CSI China Internet Bull 2X Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.61, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -44, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "VUG", name: "Vanguard Growth Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.39, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: -7, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "PALL", name: "abrdn Physical Palladium Shares ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 59 }
  },
  {
    ticker: "AMZY", name: "YieldMax AMZN Option Income Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 22.82, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -38, momentum: -95, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BIL", name: "State Street SPDR Bloomberg 1-3 Month T-Bill ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.85, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -26, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "AVUV", name: "Avantis US Small Cap Value ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.25, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 26, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "AVDV", name: "Avantis International Small Cap Value ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.83, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -6, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "DRIV", name: "Global X Autonomous & Electric Vehicles ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.57, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: 8, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "TSLY", name: "YieldMax TSLA Option Income Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 33.05, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SLVO", name: "UBS ETRACS Silver Shares Covered Call ETN", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 69.25, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -47, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "DBO", name: "Invesco DB Oil Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.45, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 33, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "QCLN", name: "First Trust NASDAQ Clean Edge Green Energy Index Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.14, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: 12, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "CONY", name: "YieldMax COIN Option Income Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 32.55, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "FLOT", name: "iShares Floating Rate Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.53, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -26, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "YMAG", name: "YieldMax Magnificent 7 Fund of Option Income ETFs", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 37.89, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -82, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EWS", name: "iShares MSCI Singapore ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.99, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 8, momentum: 10, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "HLAL", name: "Wahed FTSE USA Shariah ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.45, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: 17, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "PBW", name: "Invesco WilderHill Clean Energy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.21, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: -22, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SPUS", name: "SP Funds S&P 500 Sharia Industry Exclusions ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.53, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: 8, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ARKW", name: "ARK Next Generation Internet ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.62, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -33, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VNM", name: "VanEck Vietnam ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.2, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 48, momentum: -60, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ROBO", name: "Robo Global Robotics and Automation Index ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.34, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 43, momentum: 5, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EWQ", name: "iShares MSCI France ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.9, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -34, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VOOG", name: "Vanguard S&P 500 Growth Index Fund ETF Shares", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.45, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: 6, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EWI", name: "iShares MSCI Italy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.16, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: 4, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "VUSB", name: "Vanguard Ultra-Short Bond ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.38, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -28, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "SDIV", name: "Global X SuperDividend ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 9.28, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: -29, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "THD", name: "iShares MSCI Thailand ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.52, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 35, momentum: 45, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "MGK", name: "Vanguard Mega Cap Growth Index Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.33, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: -5, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "FLRN", name: "State Street SPDR Bloomberg Investment Grade Floating Rate ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.5, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 41, momentum: -26, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "QDTE", name: "Roundhill Innovation-100 0DTE Covered Call Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.04, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -36, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "ARKF", name: "ARK Blockchain & Fintech Innovation ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.11, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -38, momentum: -75, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BITQ", name: "Bitwise Crypto Industry Innovators ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: -20, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "USOI", name: "UBS ETRACS Crude Oil Shares Covered Call ETN", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 49.17, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 31, momentum: -40, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EWP", name: "iShares MSCI Spain ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.81, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: -1, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "WEAT", name: "Teucrium Wheat Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 37, momentum: 34, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IXN", name: "iShares Global Tech ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.24, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 69, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "HACK", name: "Amplify Cybersecurity ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.06, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 18, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "BTCO", name: "Invesco Galaxy Bitcoin ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ARGT", name: "Global X MSCI Argentina ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.12, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: -25, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "EZA", name: "iShares MSCI South Africa ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 7.97, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -69, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ARKQ", name: "ARK Autonomous Technology & Robotics ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.23, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 41, momentum: -50, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "EWM", name: "iShares MSCI Malaysia ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.69, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 33, momentum: -25, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "ESPO", name: "VanEck Video Gaming and eSports ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.43, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -41, momentum: -72, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "AMDY", name: "YieldMax AMD Option Income Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 34.21, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: 100, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ARKG", name: "ARK Genomic Revolution ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 53, momentum: 69, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "RDTE", name: "Roundhill Russell 2000 0DTE Covered Call Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 2.59, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -42, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "KTEC", name: "KraneShares Hang Seng TECH Index ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 4.32, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -43, momentum: -100, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "GSG", name: "iShares S&P GSCI Commodity-Indexed Trust", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 34, momentum: 73, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "IDRV", name: "iShares Self-Driving EV and Tech ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.68, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -51, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "QDTY", name: "YieldMax Nasdaq 100 0DTE Covered Call Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 15.6, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -46, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "NVDW", name: "Roundhill ETF Trust - Roundhill NVDA WeeklyPay ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -42, momentum: -51, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "CORN", name: "Teucrium Corn Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -39, momentum: -20, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "CTEC", name: "Global X ClimateTech ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.55, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 38, momentum: -26, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "SOYB", name: "Teucrium Soybean Fund", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 36, momentum: 22, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "KARS", name: "KraneShares Electric Vehicles and Future Mobility Index ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0.18, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 40, momentum: -50, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ARKX", name: "ARK Space & Defense Innovation ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 0, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 41, momentum: -49, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  },
  {
    ticker: "ASEA", name: "Global X FTSE Southeast Asia ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 3.97, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 30, momentum: 10, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "XDTE", name: "Roundhill S&P 500 0DTE Covered Call Strategy ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 1.45, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: -40, momentum: -36, sentiment: 0, news: 0, policy: 0, profile: -10, valuation: 0 }
  },
  {
    ticker: "GPTY", name: "YieldMax AI & Tech Portfolio Option Income ETF", sector: "Other",
    ethics: {
      israelTie: "none",
      rationale: "ETF / dana indeks — tidak mengikat ke satu perusahaan spesifik, bukan target boikot BDS.",
      sources: ["ETF classification (auto)"],
      palestineSupport: "none"
    },
    fundamentals: { dividendYield: 28.11, payoutRatio: 0, marketCapB: 0 },
    signals: { technical: 39, momentum: -28, sentiment: 0, news: 0, policy: 0, profile: -20, valuation: 0 }
  }
];
