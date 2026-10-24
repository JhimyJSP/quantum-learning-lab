"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/store";

export function ResultOverlay() {
  const phase = useGame((s) => s.phase);
  const reset = useGame((s) => s.resetGame);
  const show = phase === "victory" || phase === "defeat";
  const win = phase === "victory";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="text-center"
          >
            <div
              className={`font-display text-6xl tracking-widest ${
                win ? "text-quantum-gold" : "text-red-400"
              }`}
              style={{ textShadow: `0 0 30px ${win ? "#e8b06a" : "#ef4444"}` }}
            >
              {win ? "COLAPSO EXITOSO" : "DECOHERENCIA TOTAL"}
            </div>
            <p className="mt-2 text-sm text-white/60">
              {win
                ? "El algoritmo convergió. El Primer Error fue factorizado."
                : "El entorno colapsó la función de onda del equipo."}
            </p>
            <button
              onClick={() => reset()}
              className="mt-6 rounded-full border border-quantum-gold/70 bg-quantum-gold/15 px-6 py-2 font-display text-quantum-gold transition hover:bg-quantum-gold/25"
            >
              ↻ Reinicializar Simulación
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
