"use client";

import { motion } from "framer-motion";
import { ARCHITECTURE_META } from "@/game/affinity";
import type { Character } from "@/game/types";

/**
 * Spec §5.2 — hover panel with exact values (HP 1540/2000), detailed stats,
 * and active buffs / debuffs with explanations.
 */
export function CharacterHoverPanel({ character }: { character: Character }) {
  const meta = ARCHITECTURE_META[character.architecture];

  const stat = (label: string, value: string | number) => (
    <div className="flex items-center justify-between gap-6 text-[11px]">
      <span className="text-white/45">{label}</span>
      <span className="font-display text-white/90">{value}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.16 }}
      className="panel-glass hud-frame w-64 rounded-lg p-3 shadow-2xl"
      style={{ borderColor: `${meta.color}66` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-sm text-white leading-tight">
            {character.name}
          </div>
          <div className="text-[10px] text-white/50">{character.title}</div>
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-display"
          style={{ color: meta.color, border: `1px solid ${meta.color}` }}
        >
          {meta.glyph}
        </div>
      </div>

      <div
        className="my-2 rounded px-2 py-1 text-[10px]"
        style={{ background: `${meta.color}1a`, color: meta.color }}
      >
        {meta.label} · {character.role}
      </div>

      {/* Exact HP / Shield */}
      <div className="space-y-1 border-b border-white/10 pb-2">
        {stat("HP (Integridad)", `${character.hp.toLocaleString()} / ${character.maxHp.toLocaleString()}`)}
        {stat("Escudo Coherencia", character.shield.toLocaleString())}
        {stat("Moxie / Quanta", `${character.moxie} / ${character.maxMoxie}`)}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 py-2">
        {stat("ATQ", character.attack)}
        {stat("DEF Realidad", character.realityDef)}
        {stat("DEF Mental", character.mentalDef)}
        {stat("Crítico", `${Math.round(character.critChance * 100)}%`)}
        {stat("Daño Crít.", `${character.critDamage.toFixed(2)}x`)}
      </div>

      {/* Buffs / debuffs */}
      {character.buffs.length > 0 && (
        <div className="space-y-1 border-t border-white/10 pt-2">
          {character.buffs.map((b) => (
            <div key={b.id} className="text-[10px] leading-snug">
              <div className="flex items-center gap-1">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    b.kind === "buff" ? "bg-atom" : "bg-red-400"
                  }`}
                />
                <span
                  className={
                    b.kind === "buff" ? "text-atom-soft" : "text-red-300"
                  }
                >
                  {b.name}
                </span>
                {b.duration > 0 && (
                  <span className="text-white/35">· {b.duration}t</span>
                )}
              </div>
              <div className="pl-3 text-white/45">{b.description}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
