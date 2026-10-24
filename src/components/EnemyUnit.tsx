"use client";

import { motion } from "framer-motion";
import { ARCHITECTURE_META } from "@/game/affinity";
import type { Enemy } from "@/game/types";

export function EnemyUnit({ enemy }: { enemy: Enemy }) {
  const meta = ARCHITECTURE_META[enemy.architecture];
  const hpPct = (enemy.hp / enemy.maxHp) * 100;
  const shieldPct = Math.min(100, (enemy.shield / enemy.maxHp) * 100);
  const state = enemy.spriteState;

  const anim = (() => {
    switch (state) {
      case "attack-physical":
        return { x: [0, -70, -10], transition: { duration: 0.7 } };
      case "hit":
        return { x: [0, 16, 0], filter: ["none", "brightness(2)", "none"], transition: { duration: 0.3 } };
      case "dead":
        return { opacity: 0.15, scale: 0.9, filter: "grayscale(1)" };
      default:
        return {};
    }
  })();

  return (
    <div className="relative flex flex-col items-center">
      {/* Enemy HP header */}
      <div className="mb-2 w-72">
        <div className="flex items-end justify-between">
          <span className="font-display text-xs uppercase tracking-wider text-red-300/90">
            {enemy.name}
          </span>
          <span className="text-[10px] text-white/50">
            {enemy.hp.toLocaleString()} / {enemy.maxHp.toLocaleString()}
          </span>
        </div>
        <div className="relative mt-1 h-2 w-full overflow-hidden rounded-sm border border-red-500/30 bg-black/60">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400"
            style={{ width: `${hpPct}%`, boxShadow: "0 0 8px #ef4444" }}
          />
        </div>
        {enemy.shield > 0 && (
          <div className="relative mt-0.5 h-1 w-full overflow-hidden rounded-sm bg-black/60">
            <div
              className="absolute inset-y-0 left-0 bg-quantum-shield"
              style={{ width: `${shieldPct}%` }}
            />
          </div>
        )}
      </div>

      <motion.div
        className={state === "idle" ? "animate-float" : ""}
        animate={anim}
      >
        <div
          className="relative flex items-center justify-center rounded-[40%_60%_55%_45%] border"
          style={{
            width: 190,
            height: 150,
            background:
              "radial-gradient(circle at 50% 35%, rgba(120,20,40,0.85), rgba(10,0,5,0.95))",
            borderColor: "#7f1d1d",
            boxShadow: "0 0 40px rgba(180,20,40,0.4), inset 0 0 40px rgba(0,0,0,0.8)",
          }}
        >
          {/* glitching core */}
          <div className="animate-glitch text-5xl opacity-80" style={{ color: meta.color }}>
            ✺
          </div>
          {/* wing shards */}
          <div className="absolute -left-6 top-6 h-24 w-10 -rotate-12 rounded-full bg-gradient-to-b from-red-900/70 to-transparent blur-[2px]" />
          <div className="absolute -right-6 top-6 h-24 w-10 rotate-12 rounded-full bg-gradient-to-b from-red-900/70 to-transparent blur-[2px]" />
        </div>
      </motion.div>

      {/* Architecture tag */}
      <div
        className="mt-2 rounded px-2 py-0.5 text-[10px] font-display"
        style={{ color: meta.color, border: `1px solid ${meta.color}55` }}
      >
        {meta.glyph} {meta.label}
      </div>
    </div>
  );
}
