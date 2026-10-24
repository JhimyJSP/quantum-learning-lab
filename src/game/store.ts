import { create } from "zustand";
import {
  CARD_DEF_BY_ID,
  CHARACTERS,
  ENEMY,
  basePoolForCharacter,
  ultimateForCharacter,
} from "./content";
import { affinity, affinityMultiplier } from "./affinity";
import type {
  CardInstance,
  Character,
  Enemy,
  LogEntry,
  Phase,
  QueuedCommand,
} from "./types";

const HAND_SIZE = 6;

// -------------------------------------------------------------------------
// Small helpers
// -------------------------------------------------------------------------

let UID = 0;
const uid = () => `c${++UID}_${Math.random().toString(36).slice(2, 7)}`;

let LOG_ID = 0;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// -------------------------------------------------------------------------
// Store shape
// -------------------------------------------------------------------------

export interface GameState {
  characters: Character[];
  enemy: Enemy;
  hand: CardInstance[];
  phase: Phase;
  turn: number;
  /** Action Points available this turn (1 per living ally). */
  ap: number;
  maxAp: number;
  /** Accumulated field "Ruido" (noise). Physical adds, Logical consumes. */
  noise: number;
  /** Queued commands during the Orders phase (cardUid -> command). */
  queue: QueuedCommand[];
  selectedCardUid: string | null;
  log: LogEntry[];
  /** Transient uid currently playing an attack animation (for sequencing). */
  activeAnim: string | null;

  // actions
  init: () => void;
  startTurn: () => void;
  selectCard: (uid: string | null) => void;
  queueCommand: (cardUid: string, casterId: string, targetEnemyId: string) => void;
  unqueue: (cardUid: string) => void;
  moveCard: (fromIndex: number, toIndex: number) => void;
  runMeasurement: () => Promise<void>;
  resetGame: () => void;
}

// -------------------------------------------------------------------------
// Deck / dealing
// -------------------------------------------------------------------------

function buildDealPool(characters: Character[]): CardInstance[] {
  const pool: CardInstance[] = [];
  for (const ch of characters) {
    if (!ch.alive) continue;
    const defs = basePoolForCharacter(ch.id);
    // weight: a couple of copies per def so fusions can happen
    for (const d of defs) {
      pool.push({ uid: uid(), defId: d.id, level: 1 });
      pool.push({ uid: uid(), defId: d.id, level: 1 });
    }
  }
  return pool;
}

function dealHand(
  characters: Character[],
  existing: CardInstance[]
): CardInstance[] {
  const hand = [...existing];
  const pool = buildDealPool(characters);
  // inject ready ultimates first (moxie == max)
  for (const ch of characters) {
    if (ch.alive && ch.moxie >= ch.maxMoxie) {
      const ult = ultimateForCharacter(ch.id);
      const alreadyHas = hand.some(
        (c) => CARD_DEF_BY_ID[c.defId]?.ultimate && c.defId === ult?.id
      );
      if (ult && !alreadyHas && hand.length < HAND_SIZE) {
        hand.push({ uid: uid(), defId: ult.id, level: 3 });
      }
    }
  }
  while (hand.length < HAND_SIZE && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    hand.push(pool.splice(idx, 1)[0]);
  }
  return hand;
}

// -------------------------------------------------------------------------
// Fusion — identical adjacent cards (same def + level) merge into level+1.
// Returns the fused hand and the number of fusions (for Moxie gain).
// -------------------------------------------------------------------------

function resolveFusions(hand: CardInstance[]): {
  hand: CardInstance[];
  fusions: { characterId: string }[];
} {
  const out: CardInstance[] = [];
  const fusions: { characterId: string }[] = [];
  let i = 0;
  while (i < hand.length) {
    const a = hand[i];
    const b = hand[i + 1];
    const defA = CARD_DEF_BY_ID[a.defId];
    if (
      b &&
      a.defId === b.defId &&
      a.level === b.level &&
      a.level < 3 &&
      !defA?.ultimate
    ) {
      out.push({
        uid: uid(),
        defId: a.defId,
        level: (a.level + 1) as 1 | 2 | 3,
        justFused: true,
      });
      fusions.push({ characterId: defA.characterId });
      i += 2; // consume both
    } else {
      out.push(a);
      i += 1;
    }
  }
  // A fusion may create new adjacencies — resolve again until stable.
  if (fusions.length > 0) {
    const next = resolveFusions(out);
    return { hand: next.hand, fusions: [...fusions, ...next.fusions] };
  }
  return { hand: out, fusions };
}

// -------------------------------------------------------------------------
// Damage model
// -------------------------------------------------------------------------

function computeCardDamage(
  caster: Character,
  card: CardInstance,
  noise: number
): { damage: number; crit: boolean; noiseDelta: number; note: string } {
  const def = CARD_DEF_BY_ID[card.defId];
  const levelScale = 1 + (card.level - 1) * 0.6; // lv1=1, lv2=1.6, lv3=2.2
  let base = caster.attack * def.power * levelScale;

  let note = "";
  let noiseDelta = def.noise;

  if (def.type === "Physical") {
    // Physical accumulates noise (already positive in def.noise)
    note = "Físico";
  } else {
    // Logical consumes noise for a bonus, then the def.noise (negative) applies
    const consumable = Math.max(0, noise);
    const bonus = Math.min(consumable, 9) * 0.25; // +25% per noise, cap 9
    base *= 1 + bonus;
    if (bonus > 0) note = `Lógico · Ruido consumido +${Math.round(bonus * 100)}%`;
    else note = "Lógico";
  }

  // Affinity
  const aff = affinity(caster.architecture, ENEMY.architecture);
  base *= affinityMultiplier(aff);
  if (aff === "strong") note += " · VENTAJA";
  if (aff === "weak") note += " · resistido";

  // Crit
  const crit = Math.random() < caster.critChance;
  if (crit) base *= caster.critDamage;

  // Chaos fluctuation from the enemy buff (±10%)
  base *= rand(0.9, 1.1);

  return { damage: Math.round(base), crit, noiseDelta, note };
}

function applyDamageToEnemy(enemy: Enemy, dmg: number, ignoreShieldPct = 0) {
  let remaining = dmg;
  const shieldHit = Math.round(remaining * (1 - ignoreShieldPct));
  const toShield = Math.min(enemy.shield, shieldHit);
  enemy.shield -= toShield;
  remaining -= toShield;
  enemy.hp = Math.max(0, enemy.hp - remaining);
  if (enemy.hp <= 0) {
    enemy.alive = false;
    enemy.spriteState = "dead";
  } else {
    enemy.spriteState = "hit";
  }
}

function applyDamageToCharacter(ch: Character, dmg: number) {
  let remaining = dmg;
  const toShield = Math.min(ch.shield, remaining);
  ch.shield -= toShield;
  remaining -= toShield;
  ch.hp = Math.max(0, ch.hp - remaining);
  if (ch.hp <= 0) {
    ch.alive = false;
    ch.spriteState = "dead";
  } else {
    ch.spriteState = "hit";
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function logLine(
  log: LogEntry[],
  text: string,
  tone: LogEntry["tone"]
): LogEntry[] {
  const next = [...log, { id: ++LOG_ID, text, tone }];
  return next.slice(-40);
}

// -------------------------------------------------------------------------
// Store
// -------------------------------------------------------------------------

export const useGame = create<GameState>((set, get) => ({
  characters: [],
  enemy: clone(ENEMY),
  hand: [],
  phase: "deal",
  turn: 0,
  ap: 0,
  maxAp: 0,
  noise: 0,
  queue: [],
  selectedCardUid: null,
  log: [],
  activeAnim: null,

  init: () => {
    UID = 0;
    LOG_ID = 0;
    set({
      characters: clone(CHARACTERS),
      enemy: clone(ENEMY),
      hand: [],
      phase: "deal",
      turn: 0,
      ap: 0,
      maxAp: 0,
      noise: 0,
      queue: [],
      selectedCardUid: null,
      log: logLine([], "Sistema cuántico inicializado. Decoherencia estable.", "system"),
      activeAnim: null,
    });
    get().startTurn();
  },

  resetGame: () => get().init(),

  startTurn: () => {
    const s = get();
    const characters = clone(s.characters);
    characters.forEach((c) => {
      if (c.alive) c.spriteState = "idle";
    });

    // Phase 1: Deal up to HAND_SIZE
    let hand = dealHand(characters, s.hand);

    // Phase 2: Resolve fusions (+1 Moxie to the owning character per fusion)
    const fused = resolveFusions(hand);
    hand = fused.hand;
    let log = s.log;
    for (const f of fused.fusions) {
      const owner = characters.find((c) => c.id === f.characterId);
      if (owner && owner.moxie < owner.maxMoxie) owner.moxie += 1;
      log = logLine(
        log,
        `Fusión automática — ${owner?.name ?? "?"} gana +1 Moxie (${owner?.moxie}/5).`,
        "fusion"
      );
    }
    // top up again if fusion left gaps
    hand = dealHand(characters, hand);
    // re-resolve in case the refill created new pairs
    const refused = resolveFusions(hand);
    hand = refused.hand;
    for (const f of refused.fusions) {
      const owner = characters.find((c) => c.id === f.characterId);
      if (owner && owner.moxie < owner.maxMoxie) owner.moxie += 1;
    }

    // Phase 3: AP = living characters
    const living = characters.filter((c) => c.alive).length;

    // Telegraph enemy intent for this turn
    const enemy = clone(s.enemy);
    const livingIdx = characters
      .map((c, i) => (c.alive ? i : -1))
      .filter((i) => i >= 0);
    enemy.intent = {
      ...enemy.intent,
      targetIndex: livingIdx.length ? pick(livingIdx) : undefined,
    };

    set({
      characters,
      enemy,
      hand: hand.map((c) => ({ ...c, justFused: false })),
      turn: s.turn + 1,
      phase: "orders",
      ap: living,
      maxAp: living,
      noise: s.noise,
      queue: [],
      selectedCardUid: null,
      log: logLine(log, `— Turno ${s.turn + 1} · Fase de Órdenes (${living} AP) —`, "info"),
    });
  },

  selectCard: (uid) => set({ selectedCardUid: uid }),

  queueCommand: (cardUid, casterId, targetEnemyId) => {
    const s = get();
    if (s.phase !== "orders") return;
    const already = s.queue.find((q) => q.cardUid === cardUid);
    if (already) return;
    if (s.ap <= 0) {
      set({ log: logLine(s.log, "Sin AP suficiente para emitir el comando.", "system") });
      return;
    }
    set({
      queue: [...s.queue, { cardUid, casterId, targetEnemyId }],
      ap: s.ap - 1,
      selectedCardUid: null,
      log: logLine(
        s.log,
        `Comando en cola: ${CARD_DEF_BY_ID[
          s.hand.find((c) => c.uid === cardUid)?.defId ?? ""
        ]?.name}.`,
        "info"
      ),
    });
  },

  unqueue: (cardUid) => {
    const s = get();
    if (!s.queue.find((q) => q.cardUid === cardUid)) return;
    set({
      queue: s.queue.filter((q) => q.cardUid !== cardUid),
      ap: Math.min(s.maxAp, s.ap + 1),
    });
  },

  // Moving a card manually costs 1 AP (Spec §4.3).
  moveCard: (fromIndex, toIndex) => {
    const s = get();
    if (s.phase !== "orders") return;
    if (fromIndex === toIndex) return;
    if (s.ap <= 0) {
      set({ log: logLine(s.log, "Mover una carta cuesta 1 AP — sin AP.", "system") });
      return;
    }
    const hand = [...s.hand];
    const [moved] = hand.splice(fromIndex, 1);
    hand.splice(toIndex, 0, moved);
    // Manual moves can create new adjacencies -> resolve fusions
    const fused = resolveFusions(hand);
    const characters = clone(s.characters);
    let log = logLine(s.log, "Carta reordenada (-1 AP).", "info");
    for (const f of fused.fusions) {
      const owner = characters.find((c) => c.id === f.characterId);
      if (owner && owner.moxie < owner.maxMoxie) owner.moxie += 1;
      log = logLine(log, `Fusión por movimiento — ${owner?.name} +1 Moxie.`, "fusion");
    }
    set({
      hand: fused.hand,
      characters,
      ap: s.ap - 1,
      log,
    });
  },

  runMeasurement: async () => {
    const s = get();
    if (s.phase !== "orders") return;
    if (s.queue.length === 0) {
      set({ log: logLine(s.log, "No hay comandos que medir.", "system") });
      return;
    }

    set({ phase: "measurement", selectedCardUid: null });

    let characters = clone(get().characters);
    let enemy = clone(get().enemy);
    let noise = get().noise;
    let log = get().log;

    log = logLine(log, "— Fase de Medición: colapsando comandos —", "info");
    set({ log });

    for (const cmd of get().queue) {
      const card = get().hand.find((c) => c.uid === cmd.cardUid);
      if (!card) continue;
      const def = CARD_DEF_BY_ID[card.defId];
      const caster = characters.find((c) => c.id === cmd.casterId);
      if (!caster || !caster.alive) continue;

      // set sprite state based on card type
      caster.spriteState = def.ultimate
        ? "ultimate"
        : def.type === "Physical"
        ? "attack-physical"
        : "attack-logical";
      set({
        characters: clone(characters),
        activeAnim: caster.id,
      });
      await wait(def.ultimate ? 1300 : 750);

      // compute + apply
      const { damage, crit, noiseDelta, note } = computeCardDamage(
        caster,
        card,
        noise
      );
      const ignoreShield =
        def.id === "card_factor_01" ? 0.3 : def.ultimate && def.type === "Logical" ? 1 : 0;
      applyDamageToEnemy(enemy, damage, ignoreShield);
      noise = Math.max(0, noise + noiseDelta);

      // gain moxie for using a card
      if (caster.moxie < caster.maxMoxie && !def.ultimate) caster.moxie += 1;
      if (def.ultimate) caster.moxie = 0; // ultimate consumes the charge

      log = logLine(
        log,
        `${caster.name} lanza ${def.name} → ${damage.toLocaleString()} ${
          crit ? "CRÍTICO " : ""
        }dmg (${note}).`,
        def.ultimate ? "ultimate" : "damage"
      );
      enemy.spriteState = "hit";
      set({ characters: clone(characters), enemy: clone(enemy), noise, log });
      await wait(450);

      caster.spriteState = "idle";
      enemy.spriteState = enemy.alive ? "idle" : "dead";
      set({ characters: clone(characters), enemy: clone(enemy), activeAnim: null });

      if (!enemy.alive) break;
    }

    // consume the measured cards from hand
    const measuredUids = new Set(get().queue.map((q) => q.cardUid));
    const hand = get().hand.filter((c) => !measuredUids.has(c.uid));
    set({ hand, queue: [] });

    if (!enemy.alive) {
      set({
        phase: "victory",
        log: logLine(log, "El Primer Error ha sido factorizado. VICTORIA.", "system"),
      });
      return;
    }

    // --- Enemy turn ---
    await wait(500);
    set({ phase: "enemy", log: logLine(get().log, "— Turno del Enemigo —", "enemy") });
    await wait(400);

    enemy = clone(get().enemy);
    characters = clone(get().characters);
    enemy.spriteState = "attack-physical";
    set({ enemy: clone(enemy) });
    await wait(700);

    const intent = enemy.intent;
    const targetIdx =
      intent.targetIndex != null && characters[intent.targetIndex]?.alive
        ? intent.targetIndex
        : characters.findIndex((c) => c.alive);

    if (targetIdx >= 0) {
      const target = characters[targetIdx];
      const aff = affinity(enemy.architecture, target.architecture);
      let dmg = Math.round(
        enemy.attack * intent.power * affinityMultiplier(aff) * rand(0.9, 1.1)
      );
      applyDamageToCharacter(target, dmg);
      // enemy attack imposes noise on the field
      noise = noise + 3;
      log = logLine(
        get().log,
        `${enemy.name} usa ${intent.name} sobre ${target.name} → ${dmg.toLocaleString()} dmg. +3 Ruido.`,
        "enemy"
      );
      if (!target.alive) {
        log = logLine(log, `${target.name} ha caído. Capacidad de AP reducida.`, "system");
      }
      set({ characters: clone(characters), noise, log });
    }

    await wait(500);
    characters.forEach((c) => {
      if (c.alive) c.spriteState = "idle";
    });
    enemy.spriteState = "idle";

    // --- End of turn: tick buff/debuff durations ---
    const tick = (list: Character["buffs"]) =>
      list
        .map((b) => (b.duration > 0 ? { ...b, duration: b.duration - 1 } : b))
        .filter((b) => b.duration !== 0);
    characters.forEach((c) => (c.buffs = tick(c.buffs)));

    const anyAlive = characters.some((c) => c.alive);
    set({
      characters: clone(characters),
      enemy: clone(enemy),
      noise,
      phase: "end",
      log: logLine(get().log, "— Fin de Turno: verificando efectos —", "info"),
    });
    await wait(500);

    if (!anyAlive) {
      set({ phase: "defeat", log: logLine(get().log, "Todo el equipo ha decoherido. DERROTA.", "system") });
      return;
    }

    // next turn
    get().startTurn();
  },
}));
