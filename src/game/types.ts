// ============================================================================
// Quantum Command: Entangled Fates — Core type definitions (Spec v1.3)
// ============================================================================

/**
 * Quantum Architectures = elemental affinities.
 * Weakness triangle:
 *   Trapped-Ion  >  Superconducting
 *   Superconducting > Neutral-Atom
 *   Neutral-Atom > Trapped-Ion
 */
export type Architecture = "trapped-ion" | "superconducting" | "neutral-atom";

/** Card archetype. */
export type CardType = "Physical" | "Logical";

/** Card level. Identical adjacent cards of the same level fuse into level+1. */
export type CardLevel = 1 | 2 | 3;

export interface Buff {
  id: string;
  name: string;
  /** "buff" | "debuff" — drives the color in the hover panel. */
  kind: "buff" | "debuff";
  description: string;
  /** Remaining turns. -1 = permanent for the fight. */
  duration: number;
  /** Optional numeric magnitude (e.g. +15% ATK). */
  magnitude?: number;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  architecture: Architecture;
  /** HP — "Integridad del Sistema". */
  hp: number;
  maxHp: number;
  /** Coherence Shield — temporary armour absorbed before HP. */
  shield: number;
  /** Individual Moxie / Quanta charge 0..5. At 5 -> Ultimate card available. */
  moxie: number;
  maxMoxie: number;
  attack: number;
  realityDef: number;
  mentalDef: number;
  critChance: number; // 0..1
  critDamage: number; // multiplier e.g. 1.5
  alive: boolean;
  /** Current transient visual state for the sprite layer. */
  spriteState: SpriteState;
  buffs: Buff[];
  /** Portrait accent color used across HUD elements for this character. */
  accent: string;
  role: string;
}

export type SpriteState =
  | "idle"
  | "attack-physical"
  | "attack-logical"
  | "ultimate"
  | "hit"
  | "dead";

/** Static definition for a card archetype (one per concept/level family). */
export interface CardDef {
  id: string;
  characterId: string;
  name: string;
  type: CardType;
  animationTrigger: string;
  level: CardLevel;
  /** Base power scalar — multiplied by the owner's attack. */
  power: number;
  combatEffect: string;
  quantumConcept: string;
  quantumConceptTitle: string;
  /** For Physical: noise generated. For Logical: noise consumed for bonus. */
  noise: number;
  /** True if this is an Ultimate (only enters hand at Moxie 5). */
  ultimate?: boolean;
}

/** A concrete card instance living in the hand. */
export interface CardInstance {
  /** Unique instance id. */
  uid: string;
  /** Reference to a CardDef. */
  defId: string;
  level: CardLevel;
  /** Transient flag used to animate a freshly-fused card. */
  justFused?: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  architecture: Architecture;
  hp: number;
  maxHp: number;
  shield: number;
  attack: number;
  realityDef: number;
  mentalDef: number;
  alive: boolean;
  /** Telegraphed next action shown to the player. */
  intent: EnemyIntent;
  buffs: Buff[];
  spriteState: SpriteState;
}

export interface EnemyIntent {
  kind: "attack" | "buff" | "shield";
  name: string;
  description: string;
  power: number;
  /** Target ally index, decided at telegraph time. */
  targetIndex?: number;
}

export type Phase =
  | "deal" // Fase de Reparto
  | "fusion" // Resolución de Fusiones
  | "orders" // Fase de Órdenes (AP)
  | "measurement" // Fase de Medición
  | "enemy" // Turno del Enemigo
  | "end" // Fin de Turno
  | "victory"
  | "defeat";

/** A queued command during the Orders phase. */
export interface QueuedCommand {
  cardUid: string;
  casterId: string;
  targetEnemyId: string;
}

export interface LogEntry {
  id: number;
  text: string;
  tone: "info" | "damage" | "heal" | "fusion" | "ultimate" | "enemy" | "system";
}
