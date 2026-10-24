"use client";

import { useGame } from "@/game/store";
import { ARCHITECTURE_META } from "@/game/affinity";

const PHASE_LABEL: Record<string, string> = {
  deal: "Reparto",
  fusion: "Fusiones",
  orders: "Órdenes",
  measurement: "Medición",
  enemy: "Enemigo",
  end: "Fin de Turno",
  victory: "Victoria",
  defeat: "Derrota",
};

const PHASE_ORDER = ["deal", "orders", "measurement", "enemy", "end"];

export function TopHud() {
  const turn = useGame((s) => s.turn);
  const phase = useGame((s) => s.phase);
  const characters = useGame((s) => s.characters);

  const livingTeam = characters.filter((c) => c.alive);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-4">
      {/* left: wave + round + team roster */}
      <div className="panel-glass hud-frame pointer-events-auto rounded-md px-3 py-2">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40">
              Oleada
            </div>
            <div className="font-display text-sm text-white">1 / 1</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40">
              Turno
            </div>
            <div className="font-display text-sm text-quantum-gold">{turn} / 20</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex gap-1">
            {characters.map((c) => {
              const meta = ARCHITECTURE_META[c.architecture];
              return (
                <div
                  key={c.id}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-display ${
                    c.alive ? "" : "opacity-30 grayscale"
                  }`}
                  style={{ borderColor: meta.color, color: meta.color }}
                  title={`${c.name} · ${c.hp}/${c.maxHp}`}
                >
                  {meta.glyph}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* center: phase tracker */}
      <div className="panel-glass pointer-events-auto rounded-full px-4 py-1.5">
        <div className="flex items-center gap-2">
          {PHASE_ORDER.map((p, i) => {
            const active = phase === p;
            const done = PHASE_ORDER.indexOf(phase) > i;
            return (
              <div key={p} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 text-[10px] font-display uppercase tracking-wider ${
                    active
                      ? "text-quantum-gold"
                      : done
                      ? "text-white/40"
                      : "text-white/25"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      active ? "bg-quantum-gold animate-pulse" : done ? "bg-white/30" : "bg-white/15"
                    }`}
                  />
                  {PHASE_LABEL[p]}
                </div>
                {i < PHASE_ORDER.length - 1 && (
                  <span className="text-white/15">›</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* right: team count */}
      <div className="panel-glass hud-frame pointer-events-auto rounded-md px-3 py-2 text-right">
        <div className="text-[9px] uppercase tracking-widest text-white/40">
          Unidades activas
        </div>
        <div className="font-display text-sm text-white">
          {livingTeam.length} / {characters.length}
        </div>
      </div>
    </div>
  );
}
