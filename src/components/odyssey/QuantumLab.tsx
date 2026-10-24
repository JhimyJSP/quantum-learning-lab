"use client";

import { useMemo, useState } from "react";
import { ExperimentId, GateName, QuantumGate, measure, probabilities, runCircuit, satisfiesMission } from "./quantum";
import styles from "./QuantumLab.module.css";

const experiments: { id: ExperimentId; title: string; short: string; description: string; mission: string; hint: string; formula: string }[] = [
  { id: "superposition", title: "Una puerta, dos posibilidades", short: "Superposición", description: "El Núcleo ha despertado, pero su señal sigue atrapada en un único estado. Dale una nueva posibilidad.", mission: "Prepara un qubit con 50% de probabilidad de 0 y 50% de 1. Después, mídelo.", hint: "Empieza desde |0⟩ y aplica H. X intercambia amplitudes; Z cambia el signo de la amplitud de |1⟩.", formula: "H |0⟩ = (|0⟩ + |1⟩) / √2" },
  { id: "interference", title: "El eco que cambia el destino", short: "Interferencia", description: "Dos rutas pueden reforzarse o cancelarse. La fase de una amplitud cambia lo que ocurre al volver a combinarlas.", mission: "Usa H, una fase Z y otra H para obtener 1 con certeza. Compruébalo midiendo.", hint: "Compara H → H con H → Z → H. Z no cambia las probabilidades inmediatamente; la segunda H revela su efecto.", formula: "H H |0⟩ = |0⟩  ·  H Z H |0⟩ = |1⟩" },
  { id: "entanglement", title: "Dos señales, un estado compartido", short: "Entrelazamiento", description: "Reconecta dos estaciones del Archivo preparando un estado conjunto con resultados de medición correlacionados.", mission: "Prepara un estado de Bell: solo 00 y 11, cada uno con 50%. Después, mide ambos qubits.", hint: "Desde |00⟩ aplica H a q0 y luego CX. q0 controla a q1. Estas correlaciones no permiten enviar mensajes más rápido que la luz.", formula: "CX (H ⊗ I) |00⟩ = (|00⟩ + |11⟩) / √2" },
];

export function QuantumLab({ onComplete, initialMode = "superposition" }: { onComplete: (id: string) => void; initialMode?: ExperimentId }) {
  const [mode, setMode] = useState<ExperimentId>(initialMode);
  const [gates, setGates] = useState<QuantumGate[]>([]);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const [last, setLast] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const qubits = mode === "entanglement" ? 2 : 1;
  const experiment = experiments.find(item => item.id === mode)!;
  const state = useMemo(() => runCircuit(qubits, gates), [qubits, gates]);
  const probs = probabilities(state);
  const total = counts.reduce((sum, value) => sum + value, 0);
  const ready = satisfiesMission(mode, state, gates);
  const ket = (i: number) => `|${i.toString(2).padStart(qubits, "0")}⟩`;

  function clearSamples() { setCounts([0, 0, 0, 0]); setLast(null); setFeedback(""); }
  function changeExperiment(id: ExperimentId) { setMode(id); setGates([]); clearSamples(); setShowHint(false); }
  function editCircuit(next: QuantumGate[]) { setGates(next); clearSamples(); }
  function addGate(name: GateName, target: 0 | 1 = 0) { if (gates.length < 12) editCircuit([...gates, { name, target }]); }
  function sample(shots: number) {
    const nextCounts = [...counts];
    let result = 0;
    for (let i = 0; i < shots; i++) { result = measure(state).outcome; nextCounts[result]++; }
    setCounts(nextCounts); setLast(result);
    if (ready) { setFeedback("Descubrimiento registrado. Has restaurado este fragmento del Archivo."); onComplete(mode); }
    else setFeedback("Medición registrada. Revisa las probabilidades y ajusta el circuito para resolver la misión.");
  }

  return <section className={styles.qlab} aria-label="Laboratorio de circuitos cuánticos">
    <div className={styles.qlabTabs} role="group" aria-label="Experimento">
      {experiments.map((item, i) => <button key={item.id} aria-pressed={mode === item.id} className={mode === item.id ? styles.qlabActive : ""} onClick={() => changeExperiment(item.id)}><span>0{i + 1}</span>{item.short}</button>)}
    </div>
    <div className={styles.qlabLayout}>
      <aside className={styles.qlabBrief}>
        <span className={styles.qlabEyebrow}>TRANSMISIÓN DEL NÚCLEO</span>
        <div className={styles.qlabSignal} aria-hidden="true"><span>ψ</span><i /><i /></div>
        <h2>{experiment.title}</h2><p>{experiment.description}</p>
        <div className={styles.qlabMission}><strong>Tu misión</strong><p>{experiment.mission}</p><span className={ready ? styles.qlabReady : ""}>{ready ? "● Estado objetivo preparado" : "○ Esperando estado objetivo"}</span></div>
        <button className={styles.qlabHint} aria-expanded={showHint} onClick={() => setShowHint(!showHint)}>{showHint ? "Ocultar pista" : "Necesito una pista"}<span>{showHint ? "−" : "+"}</span></button>
        {showHint && <p className={styles.qlabHintText}>{experiment.hint}</p>}
        <div className={styles.qlabFormula}>{experiment.formula}</div>
      </aside>
      <div className={styles.qlabWorkspace}>
        <div className={styles.qlabPanelHead}><div><span className={styles.qlabEyebrow}>MESA DE EXPERIMENTACIÓN</span><h3>Construye. Observa. Comprueba.</h3></div><span className={styles.qlabBadge}>SIMULADOR LOCAL</span></div>
        <div className={styles.qlabCircuit} aria-label={`Circuito: ${gates.length ? gates.map(g => g.name + (g.name === "CX" ? " q0 a q1" : ` q${g.target}`)).join(", ") : "vacío"}`}>
          {Array.from({ length: qubits }, (_, q) => <div className={styles.qlabWire} key={q}><span className={styles.qlabQubit}>q{q} <b>|0⟩</b></span><div className={styles.qlabGateLine}>{gates.map((gate, i) => <span className={`${styles.qlabGateSlot} ${gate.name === "CX" ? styles.qlabConnected : ""}`} key={i}>{gate.name === "CX" ? <b className={styles.qlabControl}>{q === 0 ? "●" : "⊕"}</b> : gate.target === q ? <b className={gate.name === "Z" ? styles.qlabPhase : styles.qlabGate}>{gate.name}</b> : <i />}</span>)}{!gates.length && <span className={styles.qlabEmpty}>Añade una compuerta</span>}</div><span className={styles.qlabMeter}>M</span></div>)}
        </div>
        <div className={styles.qlabControls}><span>Añadir a q0</span>{(["H", "X", "Z"] as GateName[]).map(name => <button key={name} disabled={gates.length >= 12} aria-label={`Aplicar ${name} a q0`} onClick={() => addGate(name)}>{name}</button>)}{qubits === 2 && <button disabled={gates.length >= 12} aria-label="Aplicar CX de q0 a q1" onClick={() => addGate("CX")}>CX</button>}<div className={styles.qlabControlSpacer} /><button className={styles.qlabSubtle} disabled={!gates.length} onClick={() => editCircuit(gates.slice(0, -1))}>Deshacer</button><button className={styles.qlabSubtle} onClick={() => editCircuit([])}>Reiniciar</button></div>
        {mode === "interference" && <div className={styles.qlabCompare}><span>Compara dos rutas</span><button onClick={() => editCircuit([{ name: "H", target: 0 }, { name: "H", target: 0 }])}>H → H</button><button onClick={() => editCircuit([{ name: "H", target: 0 }, { name: "Z", target: 0 }, { name: "H", target: 0 }])}>H → Z → H</button></div>}
        <div className={styles.qlabReadouts}>
          <div className={styles.qlabProbabilities}><h4>Probabilidad teórica <span>|amplitud|²</span></h4>{probs.map((p, i) => <div className={styles.qlabBarRow} key={i}><code>{ket(i)}</code><div className={styles.qlabTrack}><span style={{ width: `${p * 100}%` }} /></div><b>{Math.round(p * 100)}%</b></div>)}<div className={styles.qlabAmplitudes}>Amplitudes: {state.map((a, i) => <span key={i}>{a < 0 ? "−" : "+"}{Math.abs(a).toFixed(3)} {ket(i)} </span>)}</div></div>
          <div className={styles.qlabHistogram}><h4>Resultados observados <span>{total} mediciones</span></h4><div className={styles.qlabColumns}>{probs.map((_, i) => <div key={i}><b>{counts[i]}</b><div><span style={{ height: total ? `${counts[i] / total * 100}%` : "0%" }} /></div><code>{ket(i)}</code></div>)}</div></div>
        </div>
        <div className={styles.qlabMeasure}><div><strong>{last === null ? "¿Qué resultado esperas?" : `Última lectura: ${ket(last)}`}</strong><span>Cada muestra prepara de nuevo el circuito y mide en base Z.</span></div><button onClick={() => sample(1)}>Medir una vez</button><button className={styles.qlabPrimary} onClick={() => sample(128)}>Medir ×128 <span>↗</span></button></div>
        {feedback && <p role="status" className={ready ? styles.qlabSuccess : styles.qlabFeedback}>{feedback}</p>}
        <p className={styles.qlabFootnote}>Simulación ideal con amplitudes reales, sin ruido ni hardware cuántico. Las frecuencias de una muestra finita pueden diferir de la probabilidad teórica. {mode === "entanglement" && "El entrelazamiento no transmite información instantáneamente."} <a href="https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today/quantum-mechanics-basics" target="_blank" rel="noreferrer">Fundamento científico ↗</a></p>
      </div>
    </div>
  </section>;
}
