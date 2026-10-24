"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ARCHITECTURE_META } from "@/game/affinity";
import type { Architecture } from "@/game/types";

const ORDER: Architecture[] = ["trapped-ion", "superconducting", "neutral-atom"];

/** The hardware weakness triangle, collapsible, bottom-right. */
export function AffinityLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="panel-glass flex items-center gap-1 rounded-md px-3 py-2 text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
      >
        ⟁ Arquitecturas
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="panel-glass absolute bottom-full right-0 mb-2 w-60 rounded-md p-3"
          >
            <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
              Triángulo de debilidades
            </div>
            <div className="space-y-2">
              {ORDER.map((a) => {
                const m = ARCHITECTURE_META[a];
                return (
                  <div key={a} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs"
                      style={{ color: m.color, border: `1px solid ${m.color}` }}
                    >
                      {m.glyph}
                    </span>
                    <div>
                      <div className="text-[11px] font-display" style={{ color: m.color }}>
                        {m.label}
                      </div>
                      <div className="text-[10px] leading-snug text-white/50">
                        {m.blurb}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-white/50">
              Ion ▸ Superconductor ▸ Átomo Neutro ▸ Ion (ventaja ×1.5)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
