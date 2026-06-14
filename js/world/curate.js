// Curate the 984-stock universe into the cast for each scene of the journey.
// All numbers are REAL — computed from the original Pluang Signal dataset.

const D = window.WORLD_DATA || [];
const META = window.WORLD_META || {};

const isBuy = (o) => o.act === "STRONG_BUY" || o.act === "BUY";
const byField = (f, dir = -1) => (a, b) => (((a[f] ?? -1e9) - (b[f] ?? -1e9)) * dir);

// Scene 2 — Top Opportunities: real BUY/STRONG_BUY with genuine upside to target,
// the rising luminous monoliths. Highest ethics-adjusted score first.
export const topOpps = D
  .filter((o) => isBuy(o) && (o.upside ?? -1) > 0 && ["none", "low", "medium"].includes(o.tie))
  .sort(byField("adjB"))
  .slice(0, 9);

// Scene 3 — Ethical core. The flagged (strong Israel-affiliation) megacaps that the
// filter casts into shadow, sorted by sheer market weight (the giants that sink).
export const flagged = D
  .filter((o) => o.tie === "high")
  .sort(byField("cap"))
  .slice(0, 10);

// ...and the luminous clean counterparts that rise in their place.
export const cleanRising = D
  .filter((o) => ["none", "low"].includes(o.tie) && isBuy(o) && (o.comp ?? 0) >= 58)
  .sort(byField("comp"))
  .slice(0, 8);

// Scene 4 — Forever Pocket sanctuary (the strict-filter long-term ten).
const foreverSet = new Set(META.forever || []);
export const forever = (META.forever || [])
  .map((t) => D.find((o) => o.t === t))
  .filter(Boolean);

// Ambient field — the rest of the universe as distant drifting forms.
export const ambient = D.filter((o) => !foreverSet.has(o.t));

export const meta = {
  total: META.total || D.length,
  clean: META.clean || 0,
  flagged: META.flagged || 0,
  opps: META.opps || 0,
};

// Helper: tie -> palette role
export function tieRole(tie) {
  if (tie === "high") return "shadow";
  if (tie === "medium") return "warn";
  return "clean"; // none / low / unknown
}
