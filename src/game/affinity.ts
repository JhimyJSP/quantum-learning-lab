import type { Architecture } from "./types";

/**
 * Weakness triangle (attacker beats defender):
 *   trapped-ion     -> superconducting
 *   superconducting -> neutral-atom
 *   neutral-atom    -> trapped-ion
 */
const BEATS: Record<Architecture, Architecture> = {
  "trapped-ion": "superconducting",
  superconducting: "neutral-atom",
  "neutral-atom": "trapped-ion",
};

export const ARCHITECTURE_META: Record<
  Architecture,
  { label: string; short: string; color: string; glyph: string; blurb: string }
> = {
  "trapped-ion": {
    label: "Trapped-Ion",
    short: "ION",
    color: "#f4b740",
    glyph: "◇",
    blurb:
      "Cúbits codificados en iones suspendidos por campos electromagnéticos. Alta fidelidad, lentos pero precisos.",
  },
  superconducting: {
    label: "Superconducting",
    short: "SUP",
    color: "#4ea8ff",
    glyph: "⬡",
    blurb:
      "Circuitos superconductores operando a temperaturas cercanas al cero absoluto. Rápidos y escalables.",
  },
  "neutral-atom": {
    label: "Neutral-Atom",
    short: "ATM",
    color: "#7cf29a",
    glyph: "✦",
    blurb:
      "Átomos neutros atrapados por pinzas ópticas (tweezers). Reconfigurables y masivamente paralelos.",
  },
};

export type AffinityResult = "strong" | "weak" | "neutral";

export function affinity(
  attacker: Architecture,
  defender: Architecture
): AffinityResult {
  if (BEATS[attacker] === defender) return "strong";
  if (BEATS[defender] === attacker) return "weak";
  return "neutral";
}

/** Damage multiplier for the affinity relationship. */
export function affinityMultiplier(result: AffinityResult): number {
  switch (result) {
    case "strong":
      return 1.5;
    case "weak":
      return 0.75;
    default:
      return 1;
  }
}
