"use client";

import { useEffect, useRef } from "react";
import { useGame } from "@/game/store";

const TONE_COLOR: Record<string, string> = {
  info: "text-white/55",
  damage: "text-orange-300",
  heal: "text-emerald-300",
  fusion: "text-cyan-300",
  ultimate: "text-quantum-gold",
  enemy: "text-red-300",
  system: "text-fuchsia-300",
};

export function CombatLog() {
  const log = useGame((s) => s.log);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  return (
    <div className="panel-glass hud-frame w-64 rounded-md p-2">
      <div className="mb-1 flex items-center gap-1 text-[9px] uppercase tracking-widest text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-quantum-gold animate-pulse" />
        Registro de Combate
      </div>
      <div ref={ref} className="h-28 overflow-y-auto pr-1 text-[10px] leading-relaxed">
        {log.map((l) => (
          <div key={l.id} className={TONE_COLOR[l.tone] ?? "text-white/55"}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
