"use client";

import { useRef, useState } from "react";
import styles from "./TacticalLab.module.css";

type Cell = { row: number; col: number };
const START: Cell = { row: 7, col: 0 };
const EXIT: Cell = { row: 0, col: 7 };
const FRAGMENTS: Cell[] = [{ row: 5, col: 2 }, { row: 2, col: 5 }];
const WALLS = new Set(["3,1", "5,5", "3,5", "1,6", "4,6"]);
const cellKey = ({ row, col }: Cell) => `${row},${col}`;
const cellName = ({ row, col }: Cell) => `${"ABCDEFGH"[col]}${row + 1}`;
const sameCell = (a: Cell, b: Cell) => a.row === b.row && a.col === b.col;
const blocked = (cell: Cell) => cell.row < 0 || cell.row > 7 || cell.col < 0 || cell.col > 7 || cell.col === 3 || WALLS.has(cellKey(cell));

/** Reachability uses paths, rather than Manhattan distance through obstacles. */
function reachableFrom(start: Cell): Set<string> {
  const visited = new Set([cellKey(start)]);
  const reachable = new Set<string>();
  let frontier = [start];
  for (let distance = 0; distance < 2; distance++) {
    const next: Cell[] = [];
    frontier.forEach(({ row, col }) => {
      [{ row: row - 1, col }, { row: row + 1, col }, { row, col: col - 1 }, { row, col: col + 1 }].forEach((cell) => {
        const key = cellKey(cell);
        if (!blocked(cell) && !visited.has(key)) {
          visited.add(key);
          reachable.add(key);
          next.push(cell);
        }
      });
    });
    frontier = next;
  }
  return reachable;
}

export function TacticalLab({ onComplete }: { onComplete: (id: string) => void }) {
  const [position, setPosition] = useState<Cell>(START);
  const [fragments, setFragments] = useState<string[]>([]);
  const [turn, setTurn] = useState(0);
  const [stability, setStability] = useState(3);
  const [bridgeUsed, setBridgeUsed] = useState(false);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState("La baliza está en A8. Recupera el primer fragmento en C6 para activar el puente.");
  const rewarded = useRef(false);
  const reachable = reachableFrom(position);
  const rowPulse = turn % 2 === 0;
  const bridgeTarget = { row: position.row, col: 4 };
  const canBridge = fragments.includes(cellKey(FRAGMENTS[0])) && !bridgeUsed && position.col === 2 && !blocked(bridgeTarget) && status === "playing";

  function arrive(destination: Cell, bridge = false) {
    const key = cellKey(destination);
    const nextFragments = FRAGMENTS.some((fragment) => sameCell(fragment, destination)) && !fragments.includes(key)
      ? [...fragments, key]
      : fragments;
    const hit = rowPulse ? destination.row === 4 : destination.col === 6;
    const nextStability = Math.max(0, stability - (hit ? 1 : 0));
    setPosition(destination);
    setTurn(turn + 1);
    setFragments(nextFragments);
    setStability(nextStability);
    if (bridge) setBridgeUsed(true);

    if (nextStability === 0) {
      setStatus("lost");
      setMessage("La baliza perdió estabilidad. Conserva lo aprendido: mira el pulso anunciado antes de moverte y vuelve a intentarlo.");
    } else if (sameCell(destination, EXIT) && nextFragments.length === 2) {
      setStatus("won");
      setMessage(`Extracción completada en ${turn + 1} turnos. Recuperaste los dos fragmentos del Archivo de Hilbert.`);
      if (!rewarded.current) {
        rewarded.current = true;
        onComplete("tactics");
      }
    } else if (nextFragments.length > fragments.length) {
      setMessage(nextFragments.length === 1
        ? "Primer fragmento recuperado. Desde cualquier casilla de la columna C, activa el puente para cruzar a E."
        : "Archivo reconstruido. Alcanza la salida H1; anticipa el siguiente pulso.");
    } else if (sameCell(destination, EXIT)) {
      setMessage("La salida necesita ambos fragmentos. Busca los rombos marcados en el mapa.");
    } else if (hit) {
      setMessage(`El pulso alcanzó ${cellName(destination)}: −1 de estabilidad. La siguiente zona de impacto ya está señalada.`);
    } else {
      setMessage(bridge ? "Puente utilizado. Ya estás al otro lado de la grieta; el segundo fragmento te espera en F3." : `Posición ${cellName(destination)}. Movimiento seguro; observa la siguiente intención del centinela.`);
    }
  }

  function reset() {
    setPosition(START);
    setFragments([]);
    setTurn(0);
    setStability(3);
    setBridgeUsed(false);
    setStatus("playing");
    setMessage("Expedición reiniciada. Objetivo: C6 → cruzar la grieta → F3 → H1.");
  }

  return (
    <section className={styles.lab} aria-label="Expedición táctica">
      <div className={styles.intro}>
        <div><p className={styles.eyebrow}>SIMULADOR TÁCTICO · 8 × 8</p><h2>El archivo fragmentado</h2><p>Dos fragmentos. Una grieta. Cada movimiento es una decisión.</p></div>
        <button className={styles.reset} onClick={reset}>↻ Reiniciar expedición</button>
      </div>
      <div className={styles.layout}>
        <div className={styles.boardPanel}>
          <div className={styles.boardMeta}><span>TURNO <b>{String(turn + 1).padStart(2, "0")}</b></span><span>ESTABILIDAD <b aria-label={`${stability} de 3`}>{"●".repeat(stability)}{"○".repeat(3 - stability)}</b></span></div>
          <div className={styles.coordinates} aria-hidden="true">{"ABCDEFGH".split("").map((letter) => <span key={letter}>{letter}</span>)}</div>
          <div className={styles.board} role="group" aria-label="Tablero de expedición; selecciona una casilla iluminada para moverte">
            {Array.from({ length: 64 }, (_, index) => {
              const cell = { row: Math.floor(index / 8), col: index % 8 };
              const key = cellKey(cell);
              const here = sameCell(position, cell);
              const fragment = FRAGMENTS.some((item) => sameCell(item, cell)) && !fragments.includes(key);
              const exit = sameCell(cell, EXIT);
              const rift = cell.col === 3;
              const wall = WALLS.has(key);
              const sentry = cell.row === 4 && cell.col === 6;
              const danger = !rift && !wall && (rowPulse ? cell.row === 4 : cell.col === 6);
              const canMove = status === "playing" && reachable.has(key);
              const description = [here && "tu explorador", fragment && "fragmento del archivo", exit && "salida", rift && "grieta", sentry && "centinela", wall && !sentry && "obstáculo", danger && "próximo pulso", canMove && "al alcance"].filter(Boolean).join(", ");
              return <button key={key} className={[styles.cell, (cell.row + cell.col) % 2 ? styles.dark : "", rift ? styles.rift : "", wall ? styles.wall : "", danger ? styles.danger : "", canMove ? styles.reachable : "", here ? styles.current : "", exit ? styles.exit : ""].filter(Boolean).join(" ")}
                aria-label={`Casilla ${cellName(cell)}${description ? `, ${description}` : ""}`}
                aria-disabled={!canMove} onClick={() => { if (canMove) arrive(cell); }}>
                {cell.col === 0 && <small className={styles.rowNumber} aria-hidden="true">{cell.row + 1}</small>}
                {here ? <span className={styles.explorer} aria-hidden="true">⌖</span> : fragment ? <span className={styles.fragment} aria-hidden="true">◇</span> : exit ? <span className={styles.exitIcon} aria-hidden="true">↗</span> : sentry ? <span className={styles.sentry} aria-hidden="true">✣</span> : wall ? <span className={styles.block} aria-hidden="true" /> : canMove ? <span className={styles.reachableDot} aria-hidden="true" /> : null}
              </button>;
            })}
          </div>
          <div className={styles.legend}><span><i className={styles.playerSwatch} />Explorador</span><span><i className={styles.archiveSwatch} />Fragmento</span><span><i className={styles.pulseSwatch} />Próximo pulso</span></div>
        </div>
        <aside className={styles.sidebar}>
          <div className={styles.objective}><p className={styles.eyebrow}>OBJETIVO DE EXPEDICIÓN</p><h3>Reconstruye el Archivo</h3><ol><li className={fragments.includes(cellKey(FRAGMENTS[0])) ? styles.complete : ""}><span>01</span>Recupera el fragmento C6.</li><li className={bridgeUsed ? styles.complete : ""}><span>02</span>Cruza la grieta con el puente.</li><li className={fragments.includes(cellKey(FRAGMENTS[1])) ? styles.complete : ""}><span>03</span>Recupera el fragmento F3.</li><li className={status === "won" ? styles.complete : ""}><span>04</span>Extrae el archivo por H1.</li></ol></div>
          <div className={styles.intent}><span className={styles.intentIcon} aria-hidden="true">!</span><div><p>INTENCIÓN DEL CENTINELA</p><strong>Pulso en {rowPulse ? "fila 5" : "columna G"}</strong><span>Al terminar tu movimiento, esa zona pierde 1 de estabilidad. Luego alterna.</span></div></div>
          <div className={styles.ability}><div><h3>Puente de fase</h3><span>{bridgeUsed ? "UTILIZADO" : "UN SOLO USO"}</span></div><p>{fragments.length === 0 ? "El fragmento C6 contiene la llave del puente." : "Desde C, salta a E en la misma fila. Consume un turno y permite cruzar la grieta D."}</p><button disabled={!canBridge} onClick={() => arrive(bridgeTarget, true)}>{bridgeUsed ? "Puente consumido" : canBridge ? `Cruzar a ${cellName(bridgeTarget)} →` : "Puente no disponible"}</button></div>
        </aside>
      </div>
      <div className={`${styles.status} ${status === "won" ? styles.success : ""}`} role="status" aria-live="polite"><span aria-hidden="true">{status === "won" ? "✓" : "⌁"}</span><p>{message}</p>{status === "won" && <b>EXPEDICIÓN COMPLETADA</b>}</div>
      <details className={styles.help}><summary>Reglas y límites de esta representación</summary><p>Selecciona una casilla iluminada: puedes avanzar hasta 2 pasos ortogonales por turno. No puedes atravesar obstáculos ni la grieta; el alcance se calcula siguiendo caminos válidos. El centinela afecta tu casilla de llegada, no las casillas que atraviesas. No hay límite de tiempo.</p><p>Este tablero es un acertijo de estrategia y ciencia ficción. El puente de fase es una habilidad narrativa; no representa teleportación física ni simula un sistema cuántico. Experimenta con estados y mediciones reales del modelo en el laboratorio cuántico.</p></details>
    </section>
  );
}
