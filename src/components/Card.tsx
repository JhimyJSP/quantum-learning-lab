"use client";

import { motion } from "framer-motion";
import { CARD_DEF_BY_ID, CHARACTERS } from "@/game/content";
import { ARCHITECTURE_META } from "@/game/affinity";
import type { CardInstance } from "@/game/types";

const TYPE_STYLE = {
  Physical: {
    label: "Physical Qubit",
    tag: "DAÑO DIRECTO · +RUIDO",
    from: "#7c2d12",
    to: "#b45309",
    accent: "#f4b740",
  },
  Logical: {
    label: "Logical Qubit",
    tag: "CONTROL · −RUIDO",
    from: "#1e3a5f",
    to: "#4c1d95",
    accent: "#8fcaff",
  },
} as const;

export function Card({
  card,
  selected,
  queued,
  onClick,
}: {
  card: CardInstance;
  selected: boolean;
  queued: boolean;
  onClick: () => void;
}) {
  const def = CARD_DEF_BY_ID[card.defId];
  const owner = CHARACTERS.find((c) => c.id === def.characterId);
  const meta = owner ? ARCHITECTURE_META[owner.architecture] : null;
  const ts = TYPE_STYLE[def.type];
  const levelScale = 1 + (card.level - 1) * 0.6;

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={card.justFused ? { scale: 1.3, rotate: -6 } : false}
      animate={{
        scale: card.justFused ? [1.3, 1] : 1,
        y: selected || queued ? -26 : 0,
      }}
      whileHover={{ y: -40, scale: 1.05, zIndex: 50 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={`group relative h-44 w-28 shrink-0 cursor-pointer select-none rounded-lg border ${
        queued ? "opacity-60" : ""
      }`}
      style={{
        background: `linear-gradient(160deg, ${ts.from}, ${ts.to})`,
        borderColor: selected ? ts.accent : "rgba(255,255,255,0.18)",
        boxShadow: selected
          ? `0 0 20px ${ts.accent}`
          : def.ultimate
          ? "0 0 22px rgba(255,210,74,0.6)"
          : "0 6px 14px rgba(0,0,0,0.5)",
      }}
    >
      {/* Ultimate shimmer frame */}
      {def.ultimate && (
        <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-quantum-moxie/70 animate-pulse" />
      )}

      {/* Level stars */}
      <div className="absolute left-1 top-1 flex gap-0.5">
        {Array.from({ length: card.level }).map((_, i) => (
          <span key={i} className="text-[10px] text-quantum-moxie text-glow">
            ★
          </span>
        ))}
      </div>

      {/* Architecture glyph */}
      {meta && (
        <div
          className="absolute right-1 top-1 text-xs font-display"
          style={{ color: meta.color }}
        >
          {meta.glyph}
        </div>
      )}

      {/* Art panel placeholder */}
      <div className="mx-2 mt-6 h-16 rounded bg-black/30 flex items-center justify-center overflow-hidden">
        <span className="text-3xl opacity-40" style={{ color: ts.accent }}>
          {def.type === "Physical" ? "⚔" : "✶"}
        </span>
      </div>

      {/* Name + type */}
      <div className="px-2 pt-1">
        <div className="truncate font-display text-[11px] leading-tight text-white">
          {def.name}
        </div>
        <div className="text-[8px] uppercase tracking-wide" style={{ color: ts.accent }}>
          {ts.label}
        </div>
      </div>

      {/* bottom meta */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between rounded-b-lg bg-black/40 px-2 py-1 text-[8px] text-white/60">
        <span>PWR {(def.power * levelScale).toFixed(2)}×</span>
        <span>{def.noise >= 0 ? `+${def.noise}` : def.noise} Ruido</span>
      </div>

      {queued && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
          <span className="rounded bg-quantum-gold/90 px-2 py-0.5 text-[9px] font-display text-black">
            EN COLA
          </span>
        </div>
      )}

      {/* Hover detail tooltip — mechanical detail + quantum concept (Spec §5.2) */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-60 -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <div
          className="panel-glass rounded-lg p-3 text-left shadow-2xl"
          style={{ borderColor: `${ts.accent}66` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-xs text-white">{def.name}</span>
            <span
              className="rounded px-1.5 py-0.5 text-[8px]"
              style={{ background: `${ts.accent}22`, color: ts.accent }}
            >
              {ts.label} · Lv{card.level}
            </span>
          </div>

          <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">
            Detalle Mecánico
          </div>
          <p className="text-[11px] leading-snug text-white/80">{def.combatEffect}</p>

          <div
            className="mt-2 rounded p-2"
            style={{ background: `${ts.accent}12` }}
          >
            <div
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: ts.accent }}
            >
              Concepto Cuántico · {def.quantumConceptTitle}
            </div>
            <p className="mt-0.5 text-[11px] italic leading-snug text-white/70">
              {def.quantumConcept}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
