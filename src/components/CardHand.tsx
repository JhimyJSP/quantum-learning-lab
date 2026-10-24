"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/game/store";
import { CARD_DEF_BY_ID } from "@/game/content";
import { Card } from "./Card";

export function CardHand() {
  const hand = useGame((s) => s.hand);
  const phase = useGame((s) => s.phase);
  const queue = useGame((s) => s.queue);
  const selected = useGame((s) => s.selectedCardUid);
  const enemy = useGame((s) => s.enemy);
  const ap = useGame((s) => s.ap);
  const selectCard = useGame((s) => s.selectCard);
  const queueCommand = useGame((s) => s.queueCommand);
  const unqueue = useGame((s) => s.unqueue);
  const moveCard = useGame((s) => s.moveCard);

  const queuedUids = new Set(queue.map((q) => q.cardUid));
  const canAct = phase === "orders";

  const handleCardClick = (uid: string) => {
    if (!canAct) return;
    if (queuedUids.has(uid)) {
      unqueue(uid);
      return;
    }
    // toggle selection; a selected card is confirmed by clicking the enemy
    selectCard(selected === uid ? null : uid);
  };

  const confirmOnEnemy = () => {
    if (!selected || !canAct) return;
    const def = CARD_DEF_BY_ID[hand.find((c) => c.uid === selected)!.defId];
    queueCommand(selected, def.characterId, enemy.id);
  };

  return (
    <div className="relative">
      {/* Target hint when a card is selected */}
      <AnimatePresence>
        {selected && canAct && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={confirmOnEnemy}
            className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full border border-quantum-gold/70 bg-quantum-gold/15 px-4 py-1.5 text-xs font-display text-quantum-gold hover:bg-quantum-gold/25"
          >
            ▶ Confirmar objetivo: {enemy.name.split("—")[0].trim()} (−1 AP)
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex items-end justify-center gap-2 px-4">
        <AnimatePresence mode="popLayout">
          {hand.map((card, i) => (
            <div key={card.uid} className="relative">
              <Card
                card={card}
                selected={selected === card.uid}
                queued={queuedUids.has(card.uid)}
                onClick={() => handleCardClick(card.uid)}
              />
              {/* Manual move arrows (cost 1 AP) */}
              {canAct && !queuedUids.has(card.uid) && (
                <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
                  <button
                    disabled={i === 0 || ap <= 0}
                    onClick={() => moveCard(i, i - 1)}
                    className="rounded bg-black/60 px-1.5 text-[10px] text-white/70 disabled:opacity-20"
                    title="Mover izquierda (−1 AP)"
                  >
                    ◀
                  </button>
                  <button
                    disabled={i === hand.length - 1 || ap <= 0}
                    onClick={() => moveCard(i, i + 1)}
                    className="rounded bg-black/60 px-1.5 text-[10px] text-white/70 disabled:opacity-20"
                    title="Mover derecha (−1 AP)"
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
