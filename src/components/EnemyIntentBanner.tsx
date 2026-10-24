"use client";

import { motion } from "framer-motion";
import { useGame } from "@/game/store";

/** Telegraphed enemy action, styled like the reference "Primer's Flutter" box. */
export function EnemyIntentBanner() {
  const enemy = useGame((s) => s.enemy);
  const characters = useGame((s) => s.characters);
  const phase = useGame((s) => s.phase);

  if (!enemy.alive || phase === "victory" || phase === "defeat") return null;
  const target =
    enemy.intent.targetIndex != null
      ? characters[enemy.intent.targetIndex]
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="panel-glass max-w-xs rounded-md p-3"
      style={{ borderColor: "rgba(239,68,68,0.35)" }}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-red-300">
          Intención Enemiga
        </span>
      </div>
      <div className="font-display text-sm text-white">{enemy.intent.name}</div>
      <p className="mt-1 text-[11px] leading-snug text-white/60">
        {enemy.intent.description}
      </p>
      {target && (
        <div className="mt-2 text-[10px] text-red-300/80">
          Objetivo previsto: <span className="font-display">{target.name}</span>
        </div>
      )}
    </motion.div>
  );
}
