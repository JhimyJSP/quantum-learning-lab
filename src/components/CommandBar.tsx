"use client";

import { motion } from "framer-motion";
import { useGame } from "@/game/store";

/** AP pips, Noise meter, and the End-Turn / Measurement trigger (Spec §4). */
export function CommandBar() {
  const ap = useGame((s) => s.ap);
  const maxAp = useGame((s) => s.maxAp);
  const noise = useGame((s) => s.noise);
  const phase = useGame((s) => s.phase);
  const queue = useGame((s) => s.queue);
  const run = useGame((s) => s.runMeasurement);

  const canMeasure = phase === "orders" && queue.length > 0;
  const busy = phase === "measurement" || phase === "enemy" || phase === "end";

  return (
    <div className="flex items-center gap-4">
      {/* AP */}
      <div className="panel-glass rounded-md px-3 py-2">
        <div className="text-[9px] uppercase tracking-widest text-white/40">
          Puntos de Acción
        </div>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: maxAp }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-3 rotate-45 border"
              style={{
                borderColor: i < ap ? "#e8b06a" : "rgba(255,255,255,0.2)",
                background: i < ap ? "#e8b06a" : "transparent",
                boxShadow: i < ap ? "0 0 8px #e8b06a" : "none",
              }}
            />
          ))}
          <span className="ml-2 font-display text-sm text-quantum-gold">
            {ap}/{maxAp}
          </span>
        </div>
      </div>

      {/* Noise meter */}
      <div className="panel-glass rounded-md px-3 py-2">
        <div className="text-[9px] uppercase tracking-widest text-white/40">
          Ruido (Noise)
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="relative h-2 w-24 overflow-hidden rounded-full bg-black/60">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-fuchsia-400"
              style={{ width: `${Math.min(100, noise * 8)}%` }}
            />
          </div>
          <span className="font-display text-sm text-fuchsia-300">{noise}</span>
        </div>
      </div>

      {/* Measure / End turn */}
      <motion.button
        whileHover={canMeasure ? { scale: 1.05 } : {}}
        whileTap={canMeasure ? { scale: 0.96 } : {}}
        disabled={!canMeasure}
        onClick={() => run()}
        className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-xs ${
          canMeasure
            ? "border-quantum-gold text-quantum-gold"
            : "border-white/15 text-white/25"
        }`}
        style={{
          boxShadow: canMeasure ? "0 0 22px rgba(232,176,106,0.6)" : "none",
        }}
      >
        {busy ? (
          <span className="animate-pulse">···</span>
        ) : (
          <div className="text-center leading-tight">
            <div className="text-lg">✓</div>
            <div className="text-[8px] uppercase">Medir</div>
          </div>
        )}
        {canMeasure && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-quantum-gold text-[10px] font-bold text-black">
            {queue.length}
          </span>
        )}
      </motion.button>
    </div>
  );
}
