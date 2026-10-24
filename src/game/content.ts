import type { CardDef, Character, Enemy } from "./types";

// ============================================================================
// Characters — the 3-member field team
// ============================================================================

export const CHARACTERS: Character[] = [
  {
    id: "char_01",
    name: "Hadamard",
    title: "El Superpositor",
    architecture: "superconducting",
    hp: 2000,
    maxHp: 2000,
    shield: 0,
    moxie: 0,
    maxMoxie: 5,
    attack: 320,
    realityDef: 180,
    mentalDef: 140,
    critChance: 0.5,
    critDamage: 1.8,
    alive: true,
    spriteState: "idle",
    buffs: [],
    accent: "#4ea8ff",
    role: "DPS · Conduit",
  },
  {
    id: "char_02",
    name: "Grover",
    title: "El Buscador",
    architecture: "trapped-ion",
    hp: 1740,
    maxHp: 1740,
    shield: 220,
    moxie: 0,
    maxMoxie: 5,
    attack: 265,
    realityDef: 210,
    mentalDef: 240,
    critChance: 0.2,
    critDamage: 1.5,
    alive: true,
    spriteState: "idle",
    buffs: [
      {
        id: "b_amplify",
        name: "Amplitud Amplificada",
        kind: "buff",
        description:
          "Amplificación de amplitud: cada iteración refuerza el estado objetivo. +12% de daño lógico.",
        duration: -1,
        magnitude: 12,
      },
    ],
    accent: "#f4b740",
    role: "Control · Support",
  },
  {
    id: "char_03",
    name: "Shor",
    title: "La Factorizadora",
    architecture: "neutral-atom",
    hp: 1540,
    maxHp: 1900,
    shield: 0,
    moxie: 2,
    maxMoxie: 5,
    attack: 300,
    realityDef: 160,
    mentalDef: 200,
    critChance: 0.3,
    critDamage: 1.65,
    alive: true,
    spriteState: "idle",
    buffs: [
      {
        id: "d_decoherence",
        name: "Decoherencia",
        kind: "debuff",
        description:
          "El entorno colapsa la superposición. -8% de precisión durante 2 turnos.",
        duration: 2,
        magnitude: -8,
      },
    ],
    accent: "#7cf29a",
    role: "DPS · Nuker",
  },
];

// ============================================================================
// Enemy
// ============================================================================

export const ENEMY: Enemy = {
  id: "enemy_01",
  name: "El Primer Error — Lorentz Butterfly",
  architecture: "superconducting",
  hp: 48000,
  maxHp: 48000,
  shield: 3000,
  attack: 480,
  realityDef: 260,
  mentalDef: 300,
  alive: true,
  intent: {
    kind: "attack",
    name: "El Aleteo del Primario",
    description:
      "Ataque a 1 objetivo. Inflige daño mental e impone 3 cargas de [Ruido] antes de golpear.",
    power: 1.4,
  },
  buffs: [
    {
      id: "e_chaos",
      name: "Sensibilidad Caótica",
      kind: "buff",
      description:
        "Efecto mariposa: el daño recibido fluctúa ±10% de forma impredecible.",
      duration: -1,
    },
  ],
  spriteState: "idle",
};

// ============================================================================
// Card definitions — follows the JSON schema from Spec §6.
// Each character owns a Lv1 Physical, a Lv1 Logical and an Ultimate.
// Higher levels are produced by fusion but defined so detail panels can read
// their scaled stats.
// ============================================================================

export const CARD_DEFS: CardDef[] = [
  // ---- Hadamard (superconducting) ----
  {
    id: "card_hadamard_01",
    characterId: "char_01",
    name: "Puerta Hadamard",
    type: "Physical",
    animationTrigger: "anim_attack_physical_01",
    level: 1,
    power: 1.0,
    combatEffect: "Aplica daño físico. 50% de probabilidad de daño crítico.",
    quantumConceptTitle: "Superposición",
    quantumConcept:
      "La puerta Hadamard crea una superposición, poniendo un cúbit en una mezcla igualitaria de los estados 0 y 1.",
    noise: 2,
  },
  {
    id: "card_phase_01",
    characterId: "char_01",
    name: "Cambio de Fase",
    type: "Logical",
    animationTrigger: "anim_attack_logical_01",
    level: 1,
    power: 0.8,
    combatEffect:
      "Daño psíquico. Consume Ruido acumulado para amplificar el impacto (+25% por carga).",
    quantumConceptTitle: "Puerta de Fase",
    quantumConcept:
      "Una puerta de fase rota la fase relativa del estado |1⟩, alterando la interferencia sin cambiar las probabilidades de medición.",
    noise: -3,
  },
  {
    id: "card_hadamard_ult",
    characterId: "char_01",
    name: "ULT · Interferencia Total",
    type: "Logical",
    animationTrigger: "anim_ultimate_01",
    level: 3,
    power: 3.6,
    combatEffect:
      "Colapsa todas las superposiciones en fase. Daño psíquico masivo a todos los enemigos e ignora el escudo.",
    quantumConceptTitle: "Interferencia Cuántica",
    quantumConcept:
      "La interferencia hace que las amplitudes se sumen o se cancelen. Un algoritmo cuántico amplifica las respuestas correctas y cancela las erróneas.",
    noise: -5,
    ultimate: true,
  },

  // ---- Grover (trapped-ion) ----
  {
    id: "card_oracle_01",
    characterId: "char_02",
    name: "Consulta al Oráculo",
    type: "Logical",
    animationTrigger: "anim_attack_logical_02",
    level: 1,
    power: 0.7,
    combatEffect:
      "Daño psíquico de control. Marca al objetivo: recibe +20% de daño durante 2 turnos.",
    quantumConceptTitle: "Oráculo de Grover",
    quantumConcept:
      "El oráculo marca el estado solución invirtiendo su signo, permitiendo que el algoritmo de búsqueda lo distinga del resto.",
    noise: -2,
  },
  {
    id: "card_iontrap_01",
    characterId: "char_02",
    name: "Trampa de Iones",
    type: "Physical",
    animationTrigger: "anim_attack_physical_02",
    level: 1,
    power: 0.95,
    combatEffect:
      "Daño físico contundente. Genera Ruido estático que se adhiere al campo enemigo.",
    quantumConceptTitle: "Confinamiento Iónico",
    quantumConcept:
      "Campos electromagnéticos oscilantes atrapan iones en el vacío, suspendiéndolos como cúbits estables de larga coherencia.",
    noise: 3,
  },
  {
    id: "card_grover_ult",
    characterId: "char_02",
    name: "ULT · Búsqueda Amplificada",
    type: "Logical",
    animationTrigger: "anim_ultimate_02",
    level: 3,
    power: 3.0,
    combatEffect:
      "Amplitud amplificada √N veces. Daño psíquico enorme a 1 objetivo y reduce su defensa a la mitad.",
    quantumConceptTitle: "Algoritmo de Grover",
    quantumConcept:
      "El algoritmo de Grover halla un elemento en una base desordenada en √N pasos, una aceleración cuadrática frente al caso clásico.",
    noise: -5,
    ultimate: true,
  },

  // ---- Shor (neutral-atom) ----
  {
    id: "card_factor_01",
    characterId: "char_03",
    name: "Factorización",
    type: "Physical",
    animationTrigger: "anim_attack_physical_03",
    level: 1,
    power: 1.05,
    combatEffect:
      "Daño físico penetrante que ignora el 30% del Escudo de Coherencia. Acumula Ruido.",
    quantumConceptTitle: "Algoritmo de Shor",
    quantumConcept:
      "El algoritmo de Shor factoriza enteros grandes en tiempo polinómico, amenazando la criptografía RSA basada en la dificultad de factorizar.",
    noise: 2,
  },
  {
    id: "card_qft_01",
    characterId: "char_03",
    name: "Transformada de Fourier",
    type: "Logical",
    animationTrigger: "anim_attack_logical_03",
    level: 1,
    power: 0.85,
    combatEffect:
      "Daño psíquico. Consume Ruido para encontrar el 'periodo' y repetir el golpe (+1 impacto por cada 3 Ruido).",
    quantumConceptTitle: "QFT",
    quantumConcept:
      "La Transformada de Fourier Cuántica revela periodicidades ocultas en un estado y es el corazón del algoritmo de Shor.",
    noise: -3,
  },
  {
    id: "card_shor_ult",
    characterId: "char_03",
    name: "ULT · Colapso de Período",
    type: "Physical",
    animationTrigger: "anim_ultimate_03",
    level: 3,
    power: 4.0,
    combatEffect:
      "Reduce el objetivo a sus factores primos. Daño físico devastador a 1 objetivo que escala con el Ruido total acumulado.",
    quantumConceptTitle: "Medición y Colapso",
    quantumConcept:
      "Al medir, la función de onda colapsa a un único autoestado. El resultado probabilístico se vuelve un hecho clásico definitivo.",
    noise: 4,
    ultimate: true,
  },
];

export const CARD_DEF_BY_ID: Record<string, CardDef> = Object.fromEntries(
  CARD_DEFS.map((c) => [c.id, c])
);

/** Non-ultimate, Lv1 pool a living character contributes to the deal. */
export function basePoolForCharacter(characterId: string): CardDef[] {
  return CARD_DEFS.filter(
    (c) => c.characterId === characterId && !c.ultimate && c.level === 1
  );
}

export function ultimateForCharacter(characterId: string): CardDef | undefined {
  return CARD_DEFS.find((c) => c.characterId === characterId && c.ultimate);
}
