// =====================================================================
// Agregasi sinyal & filter etis.
//
// Skor komposit = rata-rata berbobot 5 sinyal:
//   technical 25%, sentiment 15%, news 15%, policy 15%, profile 30%
// Lalu di-shift ke 0..100 supaya enak dibaca.
//
// Filter etis (mode):
//   "strict"   – buang "high".
//   "balanced" – buang "high"; "medium" diberi penalty 25 poin.
//   "loose"    – tidak buang apa-apa, hanya tampilkan tag.
// =====================================================================

const SIGNAL_WEIGHTS = {
  technical: 0.25,
  sentiment: 0.15,
  news: 0.15,
  policy: 0.15,
  profile: 0.30
};

const ETHICS_PENALTY = {
  high: 100,    // efektif eliminasi
  medium: 25,
  low: 5,
  none: 0,
  unknown: 10
};

function compositeSignal(stock) {
  const s = stock.signals;
  const raw =
    s.technical * SIGNAL_WEIGHTS.technical +
    s.sentiment * SIGNAL_WEIGHTS.sentiment +
    s.news * SIGNAL_WEIGHTS.news +
    s.policy * SIGNAL_WEIGHTS.policy +
    s.profile * SIGNAL_WEIGHTS.profile;
  // raw range -100..+100 → map ke 0..100
  return Math.round((raw + 100) / 2);
}

function ethicsAdjustedScore(stock, mode = "balanced") {
  const base = compositeSignal(stock);
  const tie = stock.ethics.israelTie;
  if (mode === "strict" && tie === "high") return null;
  if (mode === "balanced" && tie === "high") return null;
  const penalty =
    mode === "loose" ? 0 : ETHICS_PENALTY[tie] ?? 0;
  return Math.max(0, base - penalty);
}

function ethicsBadge(tie) {
  return {
    high:    { label: "BERAFILIASI KUAT", color: "red"    },
    medium:  { label: "EKSPOSUR SEDANG",  color: "orange" },
    low:     { label: "EKSPOSUR RENDAH",  color: "yellow" },
    none:    { label: "BERSIH",           color: "green"  },
    unknown: { label: "BELUM DITINJAU",   color: "gray"   }
  }[tie] || { label: tie, color: "gray" };
}

function signalBar(score) {
  // score: -100..+100 → 0..100% dengan warna tergantung tanda
  const pct = Math.round((score + 100) / 2);
  const color = score > 20 ? "var(--up)"
              : score < -20 ? "var(--down)"
              : "var(--flat)";
  return { pct, color };
}

// Daftar pendek "Forever Pocket" yang lolos filter ketat:
//   - ethics: none atau low
//   - profile signal >= 60 (kualitas perusahaan/diversifikasi tinggi)
//   - dividendYield >= 1.0 ATAU marketCapB >= 200 (mature/likuid)
// Diurutkan berdasar skor komposit yang sudah dipenalti.
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
  compositeSignal,
  ethicsAdjustedScore,
  ethicsBadge,
  signalBar,
  buildForeverPocket,
  SIGNAL_WEIGHTS
};
