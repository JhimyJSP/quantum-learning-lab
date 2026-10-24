"use client";

import { ARCHITECTURE_META } from "@/game/affinity";
import type { Character } from "@/game/types";

/**
 * Floating HP / Coherence-Shield / Moxie meters that hover above a sprite,
 * matching the reference battle HUD.
 */
export function FloatingBars({ character }: { character: Character }) {
  const meta = ARCHITECTURE_META[character.architecture];
  const hpPct = (character.hp / character.maxHp) * 100;
  const shieldPct = Math.min(100, (character.shield / character.maxHp) * 100);

  return (
    <div className="w-32 select-none">
      <div className="flex items-center gap-1 mb-0.5">
        <span
          className="text-[10px] font-display leading-none"
          style={{ color: meta.color }}
          title={meta.label}
        >
          {meta.glyph}
        </span>
        <span className="text-[9px] text-white/50 uppercase tracking-wider">
          {meta.short}
        </span>
      </div>

      {/* HP + shield track */}
      <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden border border-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-quantum-hp"
          style={{ width: `${hpPct}%`, boxShadow: "0 0 6px #7ee081" }}
        />
      </div>
      {character.shield > 0 && (
        <div className="relative mt-0.5 h-1 w-full rounded-full bg-black/60 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-quantum-shield"
            style={{ width: `${shieldPct}%`, boxShadow: "0 0 6px #8fcaff" }}
          />
        </div>
      )}

      {/* Moxie pips 0..5 */}
      <div className="mt-1 flex items-center gap-0.5">
        {Array.from({ length: character.maxMoxie }).map((_, i) => {
          const filled = i < character.moxie;
          const full = character.moxie >= character.maxMoxie;
          return (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-sm transition-all ${
                full ? "animate-pulse" : ""
              }`}
              style={{
                background: filled
                  ? full
                    ? "#ffd24a"
                    : meta.color
                  : "rgba(255,255,255,0.12)",
                boxShadow: filled ? `0 0 6px ${full ? "#ffd24a" : meta.color}` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
