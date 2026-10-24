"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGame, type GameState } from "@/game/store";
import { CARD_DEF_BY_ID } from "@/game/content";
import type { CardDef, CardType, Phase } from "@/game/types";

export type MissionId = "first-signal" | "phase-link" | "first-error";
export type CampaignMission = {
  id: MissionId;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  reward: string;
  xp: number;
  prerequisite?: MissionId;
  concept: string;
};

export const CAMPAIGN_MISSIONS: readonly CampaignMission[] = [
  {
    id: "first-signal", number: "01", title: "La primera señal", subtitle: "EL DESPERTAR DEL NÚCLEO",
    description: "Hadamard, Grover y Shor han localizado al Primer Error. Aprende a emitir órdenes y restaura la primera señal del Archivo.",
    objective: "Resuelve 3 cartas durante una expedición.", reward: "Fragmento Hadamard", xp: 120, concept: "Medición y decisiones",
  },
  {
    id: "phase-link", number: "02", title: "El eco de la fase", subtitle: "APRENDE A COMBINAR",
    description: "Un golpe físico acumula Ruido; una operación lógica puede aprovecharlo. Planea la secuencia antes de medir.",
    objective: "Resuelve una carta Physical y después una Logical en la misma medición.", reward: "Prisma de coherencia", xp: 180,
    prerequisite: "first-signal", concept: "Orden de operaciones",
  },
  {
    id: "first-error", number: "03", title: "El Primer Error", subtitle: "LA CAÍDA DE LORENTZ",
    description: "La mariposa sigue extendiendo la anomalía. Anticipa su intención, combina afinidades y carga tus habilidades especiales.",
    objective: "Derrota al Lorentz Butterfly con el equipo original.", reward: "Ala de Lorentz", xp: 300,
    prerequisite: "phase-link", concept: "Estrategia y coherencia",
  },
];

export const CAMPAIGN_BADGES = {
  fusion: { title: "Arquitecto de fusiones", detail: "Has fusionado cartas en el combate original.", xp: 35 },
  ultimate: { title: "Poder del Núcleo", detail: "Has resuelto una carta Ultimate.", xp: 60 },
  combo: { title: "Resonancia táctica", detail: "Has resuelto Physical → Logical en una misma medición.", xp: 45 },
} as const;
export type BadgeId = keyof typeof CAMPAIGN_BADGES;

export const LEARNING_DISCOVERIES = {
  superposition: { title: "Superposición", detail: "Preparaste y mediste amplitudes coherentes de igual magnitud.", xp: 60 },
  interference: { title: "Interferencia", detail: "Comprobaste cómo una fase relativa modifica la medición después de recombinar amplitudes.", xp: 60 },
  entanglement: { title: "Entrelazamiento", detail: "Preparaste un estado de Bell y observaste sus correlaciones.", xp: 80 },
  qml: { title: "Generalización", detail: "Elegiste una época cercana al mínimo de validación en una curva ilustrativa.", xp: 60 },
  tactics: { title: "Anticipación táctica", detail: "Recuperaste los fragmentos en el tablero de rescate.", xp: 60 },
  reflection: { title: "Una medición, un resultado", detail: "Recuperaste de memoria el significado de una medición individual.", xp: 35 },
} as const;
export type LearningId = keyof typeof LEARNING_DISCOVERIES;

export interface CampaignStats {
  resolvedCards: number;
  physicalCards: number;
  logicalCards: number;
  measuredTurns: number;
  completedBattles: number;
  victories: number;
  combos: number;
  ultimates: number;
  fusions: number;
}
export interface CampaignJournalEntry {
  id: string;
  kind: "mission" | "learning" | "badge";
  title: string;
  detail: string;
  date: string;
}
export interface CampaignProgress {
  version: 1;
  activeMission: MissionId;
  completedMissions: MissionId[];
  learnedConcepts: LearningId[];
  badges: BadgeId[];
  xp: number;
  missionCards: number;
  stats: CampaignStats;
  journal: CampaignJournalEntry[];
  bestVictoryTurns: number | null;
}
export type CampaignEvent =
  | { type: "encounter-start"; at: string }
  | { type: "measurement"; at: string }
  | { type: "card-resolved"; cardType: CardType; ultimate: boolean; combo: boolean; at: string }
  | { type: "fusion"; at: string }
  | { type: "outcome"; victory: boolean; turns: number; at: string }
  | { type: "learning"; id: LearningId; at: string }
  | { type: "select-mission"; id: MissionId; at: string };

const STORAGE_KEY = "quant-nova-campaign-v1";
const BUSY_PHASES: readonly Phase[] = ["measurement", "enemy", "end", "deal", "fusion"];
const emptyStats = (): CampaignStats => ({ resolvedCards: 0, physicalCards: 0, logicalCards: 0, measuredTurns: 0, completedBattles: 0, victories: 0, combos: 0, ultimates: 0, fusions: 0 });
export const initialCampaignProgress = (): CampaignProgress => ({ version: 1, activeMission: "first-signal", completedMissions: [], learnedConcepts: [], badges: [], xp: 0, missionCards: 0, stats: emptyStats(), journal: [], bestVictoryTurns: null });

export function missionIsUnlocked(id: MissionId, progress: CampaignProgress): boolean {
  const target = CAMPAIGN_MISSIONS.find(item => item.id === id);
  return !!target && (!target.prerequisite || progress.completedMissions.includes(target.prerequisite));
}

function calculateXp(progress: CampaignProgress) {
  return progress.completedMissions.reduce((sum, id) => sum + (CAMPAIGN_MISSIONS.find(m => m.id === id)?.xp ?? 0), 0)
    + progress.badges.reduce((sum, id) => sum + CAMPAIGN_BADGES[id].xp, 0)
    + progress.learnedConcepts.reduce((sum, id) => sum + LEARNING_DISCOVERIES[id].xp, 0);
}

/** Pure progression reducer: a reward can only be earned once per saved profile. */
export function advanceCampaign(previous: CampaignProgress, event: CampaignEvent): CampaignProgress {
  const next: CampaignProgress = { ...previous, stats: { ...previous.stats }, completedMissions: [...previous.completedMissions], learnedConcepts: [...previous.learnedConcepts], badges: [...previous.badges], journal: [...previous.journal] };
  const journal = (id: string, kind: CampaignJournalEntry["kind"], title: string, detail: string) => {
    next.journal = [{ id, kind, title, detail, date: event.at }, ...next.journal].slice(0, 80);
  };
  const finishMission = (id: MissionId) => {
    if (next.completedMissions.includes(id)) return;
    const mission = CAMPAIGN_MISSIONS.find(item => item.id === id)!;
    next.completedMissions.push(id);
    journal(`mission:${id}`, "mission", mission.title, `${mission.objective} Recompensa: ${mission.reward}.`);
  };
  const badge = (id: BadgeId) => {
    if (next.badges.includes(id)) return;
    next.badges.push(id);
    journal(`badge:${id}`, "badge", CAMPAIGN_BADGES[id].title, CAMPAIGN_BADGES[id].detail);
  };
  switch (event.type) {
    case "encounter-start": next.missionCards = 0; break;
    case "measurement": next.stats.measuredTurns++; break;
    case "select-mission":
      if (!missionIsUnlocked(event.id, previous)) return previous;
      next.activeMission = event.id;
      next.missionCards = 0;
      break;
    case "card-resolved":
      next.stats.resolvedCards++;
      next.stats[event.cardType === "Physical" ? "physicalCards" : "logicalCards"]++;
      next.missionCards++;
      if (event.ultimate) { next.stats.ultimates++; badge("ultimate"); }
      if (event.combo) {
        next.stats.combos++;
        badge("combo");
        if (next.activeMission === "phase-link") finishMission("phase-link");
      }
      if (next.activeMission === "first-signal" && next.missionCards >= 3) finishMission("first-signal");
      break;
    case "fusion": next.stats.fusions++; badge("fusion"); break;
    case "outcome":
      next.stats.completedBattles++;
      if (event.victory) {
        next.stats.victories++;
        next.bestVictoryTurns = next.bestVictoryTurns === null ? event.turns : Math.min(next.bestVictoryTurns, event.turns);
        if (next.activeMission === "first-error") finishMission("first-error");
      }
      break;
    case "learning":
      if (!next.learnedConcepts.includes(event.id)) {
        next.learnedConcepts.push(event.id);
        journal(`learning:${event.id}`, "learning", LEARNING_DISCOVERIES[event.id].title, LEARNING_DISCOVERIES[event.id].detail);
      }
      break;
  }
  next.xp = calculateXp(next);
  return next;
}

/** Validate local data rather than trusting malformed or older browser storage. */
export function parseCampaignProgress(value: unknown): CampaignProgress {
  const clean = initialCampaignProgress();
  if (!value || typeof value !== "object" || Array.isArray(value)) return clean;
  const raw = value as Record<string, unknown>;
  const uniqueKnown = <T extends string>(items: unknown, keys: readonly T[]): T[] => Array.isArray(items) ? [...new Set(items.filter((id): id is T => typeof id === "string" && keys.includes(id as T)))] : [];
  const missionIds = CAMPAIGN_MISSIONS.map(m => m.id);
  clean.completedMissions = uniqueKnown(raw.completedMissions, missionIds);
  clean.learnedConcepts = uniqueKnown(raw.learnedConcepts, Object.keys(LEARNING_DISCOVERIES) as LearningId[]);
  clean.badges = uniqueKnown(raw.badges, Object.keys(CAMPAIGN_BADGES) as BadgeId[]);
  if (typeof raw.activeMission === "string" && missionIds.includes(raw.activeMission as MissionId) && missionIsUnlocked(raw.activeMission as MissionId, clean)) clean.activeMission = raw.activeMission as MissionId;
  const integer = (input: unknown) => typeof input === "number" && Number.isFinite(input) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(input))) : 0;
  if (raw.stats && typeof raw.stats === "object" && !Array.isArray(raw.stats)) {
    const stats = raw.stats as Record<string, unknown>;
    for (const key of Object.keys(clean.stats) as (keyof CampaignStats)[]) clean.stats[key] = integer(stats[key]);
  }
  clean.missionCards = integer(raw.missionCards);
  clean.bestVictoryTurns = typeof raw.bestVictoryTurns === "number" && raw.bestVictoryTurns > 0 && Number.isFinite(raw.bestVictoryTurns) ? integer(raw.bestVictoryTurns) : null;
  // Rebuild known achievements, preventing unsafe text from entering the journal.
  const dates = new Map<string, string>();
  if (Array.isArray(raw.journal)) raw.journal.forEach(item => {
    if (item && typeof item.id === "string" && typeof item.date === "string" && Number.isFinite(Date.parse(item.date))) dates.set(item.id, item.date);
  });
  const fallbackDate = new Date(0).toISOString();
  clean.completedMissions.forEach(id => {
    const mission = CAMPAIGN_MISSIONS.find(m => m.id === id)!;
    clean.journal.push({ id: `mission:${id}`, kind: "mission", title: mission.title, detail: `${mission.objective} Recompensa: ${mission.reward}.`, date: dates.get(`mission:${id}`) ?? fallbackDate });
  });
  clean.learnedConcepts.forEach(id => clean.journal.push({ id: `learning:${id}`, kind: "learning", title: LEARNING_DISCOVERIES[id].title, detail: LEARNING_DISCOVERIES[id].detail, date: dates.get(`learning:${id}`) ?? fallbackDate }));
  clean.badges.forEach(id => clean.journal.push({ id: `badge:${id}`, kind: "badge", title: CAMPAIGN_BADGES[id].title, detail: CAMPAIGN_BADGES[id].detail, date: dates.get(`badge:${id}`) ?? fallbackDate }));
  clean.journal.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  clean.xp = calculateXp(clean);
  return clean;
}

type PendingCard = { def: CardDef; casterId: string; consumed: boolean };
function pendingCards(state: GameState): PendingCard[] {
  return state.queue.flatMap(command => {
    const instance = state.hand.find(card => card.uid === command.cardUid);
    const def = instance && CARD_DEF_BY_ID[instance.defId];
    return def ? [{ def, casterId: command.casterId, consumed: false }] : [];
  });
}

/** Observe the original engine; only its own reset action is used by the lobby. */
export function useCampaignProgress() {
  const [progress, setProgress] = useState<CampaignProgress>(initialCampaignProgress);
  const [hydrated, setHydrated] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(parseCampaignProgress(JSON.parse(saved)));
    } catch { setStorageAvailable(false); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
  }, [progress, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let pending = pendingCards(useGame.getState());
    let physicalResolved = false;
    let comboRecorded = false;
    let seen = new Set(useGame.getState().log.map(entry => entry.id));
    // A page reload starts a fresh combat; the profile itself persists.
    setProgress(previous => ({ ...previous, missionCards: 0 }));
    return useGame.subscribe((state, previous) => {
      const at = new Date().toISOString();
      const events: CampaignEvent[] = [];
      if (state.turn === 0 && previous.turn !== 0) {
        pending = [];
        physicalResolved = false;
        comboRecorded = false;
        seen = new Set();
        events.push({ type: "encounter-start", at });
      }
      if (state.phase === "measurement" && previous.phase !== "measurement") {
        pending = pendingCards(state);
        physicalResolved = false;
        comboRecorded = false;
        events.push({ type: "measurement", at });
      }
      for (const entry of state.log) {
        if (seen.has(entry.id)) continue;
        seen.add(entry.id);
        if (entry.tone === "fusion") events.push({ type: "fusion", at });
        if (entry.tone !== "damage" && entry.tone !== "ultimate") continue;
        const resolved = pending.find(item => !item.consumed && entry.text.includes(` lanza ${item.def.name} →`));
        if (!resolved) continue;
        resolved.consumed = true;
        const isCombo = physicalResolved && resolved.def.type === "Logical" && !comboRecorded;
        if (resolved.def.type === "Physical") physicalResolved = true;
        if (isCombo) comboRecorded = true;
        events.push({ type: "card-resolved", cardType: resolved.def.type, ultimate: !!resolved.def.ultimate, combo: isCombo, at });
      }
      if ((state.phase === "victory" || state.phase === "defeat") && state.phase !== previous.phase) events.push({ type: "outcome", victory: state.phase === "victory", turns: state.turn, at });
      if (events.length) setProgress(current => events.reduce(advanceCampaign, current));
    });
  }, [hydrated]);

  const selectMission = useCallback((id: MissionId): boolean => {
    const state = useGame.getState();
    if (!hydrated || (state.characters.length > 0 && BUSY_PHASES.includes(state.phase)) || !missionIsUnlocked(id, progressRef.current)) return false;
    setProgress(current => advanceCampaign(current, { type: "select-mission", id, at: new Date().toISOString() }));
    state.resetGame();
    return true;
  }, [hydrated]);

  const recordLearning = useCallback((id: string) => {
    if (!(id in LEARNING_DISCOVERIES)) return;
    setProgress(current => advanceCampaign(current, { type: "learning", id: id as LearningId, at: new Date().toISOString() }));
  }, []);

  const resetProgress = useCallback((): boolean => {
    const state = useGame.getState();
    if (state.characters.length > 0 && BUSY_PHASES.includes(state.phase)) return false;
    setProgress(initialCampaignProgress());
    state.resetGame();
    return true;
  }, []);

  const mission = CAMPAIGN_MISSIONS.find(item => item.id === progress.activeMission)!;
  const phase = useGame(state => state.phase);
  const enemyHp = useGame(state => state.enemy.hp);
  const enemyMaxHp = useGame(state => state.enemy.maxHp);
  const completed = progress.completedMissions.includes(progress.activeMission);
  const activeGoal = progress.activeMission === "first-signal"
    ? { current: Math.min(progress.missionCards, 3), target: 3, label: "cartas resueltas", completed }
    : progress.activeMission === "phase-link"
      ? { current: completed ? 1 : 0, target: 1, label: "secuencia Physical → Logical", completed }
      : { current: Math.max(0, enemyMaxHp - enemyHp), target: enemyMaxHp, label: "integridad enemiga eliminada", completed };

  return { progress, hydrated, storageAvailable, mission, activeGoal, selectMission, launchMission: selectMission, recordLearning, resetProgress, busy: BUSY_PHASES.includes(phase), missions: CAMPAIGN_MISSIONS };
}
