"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useGame } from "@/game/store";
import { CharacterSprite } from "./CharacterSprite";
import { FloatingBars } from "./FloatingBars";
import { CharacterHoverPanel } from "./CharacterHoverPanel";
import { EnemyUnit } from "./EnemyUnit";
import { EnemyIntentBanner } from "./EnemyIntentBanner";

export function Battlefield() {
  const characters = useGame((s) => s.characters);
  const enemy = useGame((s) => s.enemy);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 500px at 70% 20%, rgba(40,60,100,0.45), transparent 60%)," +
            "radial-gradient(900px 600px at 20% 90%, rgba(80,30,60,0.35), transparent 60%)," +
            "linear-gradient(180deg, #0a1018 0%, #070a11 55%, #05070c 100%)",
        }}
      />
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <div className="absolute inset-0 scanlines opacity-50" />
      {/* distant fog */}
      <div className="absolute inset-x-0 top-1/3 h-40 bg-gradient-to-b from-slate-400/10 to-transparent blur-2xl" />

      {/* Enemy intent (top-left) */}
      <div className="absolute left-4 top-20 z-20">
        <EnemyIntentBanner />
      </div>

      {/* Enemy (right / center) */}
      <div className="absolute right-[12%] top-[26%] z-10">
        <EnemyUnit enemy={enemy} />
      </div>

      {/* Allies — bottom-left cluster, staggered like the references */}
      <div className="absolute bottom-[30%] left-[6%] z-10 flex items-end gap-10">
        {characters.map((ch, i) => (
          <div
            key={ch.id}
            className="relative flex flex-col items-center"
            style={{ transform: `translateY(${i % 2 === 0 ? 0 : 26}px)` }}
            onMouseEnter={() => setHovered(ch.id)}
            onMouseLeave={() => setHovered((h) => (h === ch.id ? null : h))}
          >
            {/* floating bars above head */}
            <div className="mb-1">
              <FloatingBars character={ch} />
            </div>

            <CharacterSprite character={ch} />

            {/* Hover panel */}
            <AnimatePresence>
              {hovered === ch.id && (
                <div className="absolute bottom-full left-1/2 z-40 mb-3 -translate-x-1/2">
                  <CharacterHoverPanel character={ch} />
                </div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
