// =====================================================================
// Agregasi sinyal 7-faktor berbasis riset akademis & praktisi:
//
//   1. technical  (15%) – RSI, SMA crossover, volume
//   2. momentum   (15%) – Price momentum 3-12 bln (Jegadeesh & Titman 1993,
//                          Fama-French momentum factor)
//   3. sentiment  (10%) – Konsensus analis, short interest, social
//   4. news       (10%) – Aliran berita, earnings surprise
//   5. policy     (15%) – Makro: siklus suku bunga, USD, tailwind sektor
//   6. profile    (20%) – Quality factor: FCF, margin, neraca, moat
//                          (Fama-French profitability + AQR quality)
//   7. valuation  (15%) – Value factor: P/E vs sektor, PEG, EV/FCF
//                          (Research Affiliates, GMO value framework)
//
// Referensi metodologi:
//   Fama & French (2015) 5-factor model; AQR Capital "Quality Minus Junk";
//   BlackRock factor investing; MSCI Barra multi-factor.
// =====================================================================

const SIGNAL_WEIGHTS = {
  technical: 0.15,
  momentum:  0.15,
  sentiment: 0.10,
  news:      0.10,
  policy:    0.15,
  profile:   0.20,
  valuation: 0.15,
};

const ETHICS_PENALTY = {
  high:    100,   // efektif eliminasi
  medium:   25,
  low:       5,
  none:      0,
  unknown:  10,
};

function compositeSignal(stock) {
  const s = stock.signals;
  const raw =
    (s.technical || 0) * SIGNAL_WEIGHTS.technical +
    (s.momentum  || 0) * SIGNAL_WEIGHTS.momentum  +
    (s.sentiment || 0) * SIGNAL_WEIGHTS.sentiment +
    (s.news      || 0) * SIGNAL_WEIGHTS.news      +
    (s.policy    || 0) * SIGNAL_WEIGHTS.policy    +
    (s.profile   || 0) * SIGNAL_WEIGHTS.profile   +
    (s.valuation || 0) * SIGNAL_WEIGHTS.valuation;
  // raw range -100..+100 → map ke 0..100
  return Math.round((raw + 100) / 2);
}

function ethicsAdjustedScore(stock, mode = "balanced") {
  const base = compositeSignal(stock);
  const tie = stock.ethics.israelTie;
  if (mode === "strict"   && tie === "high") return null;
  if (mode === "balanced" && tie === "high") return null;
  const penalty = mode === "loose" ? 0 : (ETHICS_PENALTY[tie] ?? 0);
  return Math.max(0, base - penalty);
}

function ethicsBadge(tie) {
  return ({
    high:    { label: "BERAFILIASI KUAT", color: "red"    },
    medium:  { label: "EKSPOSUR SEDANG",  color: "orange" },
    low:     { label: "EKSPOSUR RENDAH",  color: "yellow" },
    none:    { label: "BERSIH",           color: "green"  },
    unknown: { label: "BELUM DITINJAU",   color: "gray"   },
  }[tie] || { label: tie, color: "gray" });
}

function signalBar(score) {
  const pct = Math.round((score + 100) / 2);
  const color = score > 20 ? "var(--up)"
              : score < -20 ? "var(--down)"
              : "var(--flat)";
  return { pct, color };
}

// Forever Pocket: bersih/eksposur rendah + quality tinggi + yield/size memadai
function buildForeverPocket(universe, max = 10) {
  return universe
    .filter(s => ["none", "low"].includes(s.ethics.israelTie))
    .filter(s => s.signals.profile >= 60)
    .filter(s => (s.fundamentals.dividendYield >= 1.0) || (s.fundamentals.marketCapB >= 200))
    .map(s => ({ stock: s, score: ethicsAdjustedScore(s, "strict") }))
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

window.SIGNAL_LIB = {
  SIGNAL_WEIGHTS,
  compositeSignal,
  ethicsAdjustedScore,
  ethicsBadge,
  signalBar,
  buildForeverPocket,
};
