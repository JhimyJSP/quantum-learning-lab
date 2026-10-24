"use client";

import { motion } from "framer-motion";
import type { Character } from "@/game/types";
import { ARCHITECTURE_META } from "@/game/affinity";

/**
 * Stand-in for the Spine 2D / Live2D skeletal sprite described in Spec §5.1.
 * Built in layers (body, head, weapon/terminal, aura) so each reacts to the
 * combat rhythm. The real asset pipeline would swap these divs for a Spine
 * WebGL / PixiJS canvas driven by the same `spriteState`.
 */
export function CharacterSprite({ character }: { character: Character }) {
  const meta = ARCHITECTURE_META[character.architecture];
  const state = character.spriteState;

  // Body-level motion per spec: idle breathing, physical dash, logical float,
  // ultimate pose, hit recoil, death collapse.
  const bodyAnim = (() => {
    switch (state) {
      case "attack-physical":
        return { x: [0, 90, 10], rotate: [0, -6, 0], transition: { duration: 0.7 } };
      case "attack-logical":
        return { y: [0, -24, -10], transition: { duration: 0.75 } };
      case "ultimate":
        return { scale: [1, 1.15, 1.08], y: [0, -30, -14], transition: { duration: 1.2 } };
      case "hit":
        return { x: [0, -14, 0], transition: { duration: 0.3 } };
      case "dead":
        return { opacity: 0.25, y: 20, rotate: -8, filter: "grayscale(1)" };
      default:
        return {};
    }
  })();

  const idleClass =
    state === "idle" ? "animate-breathe" : "";

  return (
    <div className="relative flex flex-col items-center" style={{ width: 120 }}>
      <motion.div
        className={`relative ${idleClass}`}
        animate={bodyAnim}
        style={{ transformOrigin: "bottom center" }}
      >
        {/* Aura / affinity glow ring at the feet */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-1 h-6 w-24 rounded-[50%] blur-md opacity-70"
          style={{ background: `radial-gradient(ellipse, ${meta.color}66, transparent 70%)` }}
        />

        {/* Layered "sprite": terminal/weapon behind, body, head */}
        <div className="relative" style={{ width: 96, height: 150 }}>
          {/* weapon / quantum terminal — subtle independent sway */}
          <div
            className={`absolute -right-3 top-6 h-24 w-3 rounded-full ${
              state === "idle" ? "animate-sway" : ""
            }`}
            style={{
              background: `linear-gradient(${meta.color}, transparent)`,
              transformOrigin: "bottom center",
              boxShadow: `0 0 12px ${meta.color}`,
            }}
          />
          {/* body */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-[36px] rounded-b-lg"
            style={{
              width: 62,
              height: 104,
              background: `linear-gradient(180deg, ${meta.color}cc, ${meta.color}33)`,
              border: `1px solid ${meta.color}`,
              boxShadow: `inset 0 0 20px ${meta.color}55`,
            }}
          />
          {/* head */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              top: 10,
              width: 40,
              height: 40,
              background: `radial-gradient(circle at 35% 30%, #fff8, ${meta.color})`,
              border: `1px solid ${meta.color}`,
              boxShadow: `0 0 14px ${meta.color}aa`,
            }}
          />
          {/* glyph badge on chest */}
          <div
            className="absolute left-1/2 -translate-x-1/2 text-black/70 font-display"
            style={{ top: 64, fontSize: 20 }}
          >
            {meta.glyph}
          </div>
        </div>

        {/* Physical impact: glitch sparks */}
        {state === "attack-physical" && (
          <motion.div
            className="absolute inset-0 animate-glitch pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.7 }}
          >
            <div className="absolute right-0 top-1/3 h-[2px] w-16 bg-white" />
            <div className="absolute right-2 top-1/2 h-[2px] w-10 bg-ion" />
          </motion.div>
        )}

        {/* Logical: holographic interface gestures */}
        {state === "attack-logical" && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 1.3], rotate: 180 }}
            transition={{ duration: 0.75 }}
          >
            <div
              className="h-16 w-16 rounded-full border-2"
              style={{ borderColor: meta.color, boxShadow: `0 0 16px ${meta.color}` }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* name tag */}
      <div className="mt-1 text-[10px] uppercase tracking-widest text-white/70 font-display">
        {character.name}
      </div>
    </div>
  );
}
