"use client";

import { useState } from "react";
import styles from "./Odyssey.module.css";

type Model = "simple" | "complex";
function losses(epoch: number, model: Model) {
  return {
    train: 0.055 + 0.82 * Math.exp(-epoch / (model === "simple" ? 23 : 12)),
    validation: model === "simple"
      ? 0.24 + 0.65 * Math.exp(-epoch / 18) + 0.00004 * Math.max(0, epoch - 60) ** 2
      : 0.12 + 0.7 * Math.exp(-epoch / 10) + 0.00017 * Math.max(0, epoch - 28) ** 2,
  };
}

export function QmlLab({ onComplete }: { onComplete: (id: string) => void }) {
  const [model, setModel] = useState<Model>("complex");
  const [epoch, setEpoch] = useState(65);
  const [feedback, setFeedback] = useState("");
  const current = losses(epoch, model);
  const best = Math.min(...Array.from({ length: 100 }, (_, i) => losses(i + 1, model).validation));
  const points = (key: "train" | "validation") => Array.from({ length: epoch + 1 }, (_, x) => `${48 + x * 6.5},${254 - Math.min(1, losses(x, model)[key]) * 210}`).join(" ");

  function record() {
    if (current.validation <= best + 0.012) {
      onComplete("qml");
      setFeedback("Experimento registrado. Elegiste una época cerca del mínimo de validación. El error de entrenamiento por sí solo no basta para decidir.");
    } else {
      setFeedback(current.validation > current.train + 0.15 && epoch > 40
        ? "El modelo sigue mejorando en entrenamiento, pero empeora al validar. Prueba detenerlo antes: busca el mínimo de la curva ámbar."
        : "Todavía puedes reducir la pérdida de validación. Ajusta las épocas y busca el punto más bajo de la curva ámbar.");
    }
  }

  return <div className={styles.labLayout}>
    <section className={styles.panel}>
      <div className={styles.panelHeading}><div><span className={styles.eyebrow}>EXPERIMENTO 04 / THE LEARNING MACHINES</span><h2>Aprender a detenerse.</h2></div><span className={styles.badge}>Modelo ilustrativo</span></div>
      <p className={styles.muted}>La ciudad confía en una máquina que memoriza todo. Ayúdala a encontrar el equilibrio entre aprender los datos y generalizar.</p>
      <div className={styles.segmented} aria-label="Capacidad del modelo">{(["simple", "complex"] as Model[]).map(value => <button key={value} aria-pressed={model === value} onClick={() => { setModel(value); setFeedback(""); }}>{value === "simple" ? "Modelo simple" : "Modelo complejo"}</button>)}</div>
      <div className={styles.chartWrap}>
        <svg viewBox="0 0 750 300" role="img" aria-label={`Curvas sintéticas de pérdida. Época ${epoch}, entrenamiento ${current.train.toFixed(3)}, validación ${current.validation.toFixed(3)}`}>
          {[0, .25, .5, .75, 1].map(y => <g key={y}><line x1="48" x2="698" y1={254 - y * 210} y2={254 - y * 210} stroke="#263142" strokeDasharray="3 6" /><text x="8" y={258 - y * 210} fill="#93a2b9" fontSize="12">{y.toFixed(2)}</text></g>)}
          {[0, 25, 50, 75, 100].map(x => <text key={x} x={44 + x * 6.5} y="282" fill="#93a2b9" fontSize="12">{x}</text>)}
          <polyline points={points("train")} stroke="#a8a0ff" strokeWidth="3" fill="none" />
          <polyline points={points("validation")} stroke="#efbf74" strokeWidth="3" fill="none" />
          <circle cx={48 + epoch * 6.5} cy={254 - Math.min(1, current.validation) * 210} r="6" fill="#efbf74" />
        </svg>
      </div>
      <div className={styles.chartLegend}><span><i style={{ background: "#a8a0ff" }} />Entrenamiento</span><span><i style={{ background: "#efbf74" }} />Validación</span><span>Menor pérdida = mejor</span></div>
      <label className={styles.sliderLabel} htmlFor="epochs">Épocas de entrenamiento <strong>{epoch} / 100</strong></label>
      <input className={styles.range} id="epochs" type="range" min="1" max="100" value={epoch} onChange={event => { setEpoch(Number(event.target.value)); setFeedback(""); }} />
      <div className={styles.metricRow}><div><span>Pérdida de entrenamiento</span><strong>{current.train.toFixed(3)}</strong></div><div><span>Pérdida de validación</span><strong style={{ color: "#efbf74" }}>{current.validation.toFixed(3)}</strong></div></div>
      <p className={styles.footnote}>Curvas sintéticas calculadas con funciones ilustrativas. Aquí no se entrena una red neuronal ni un modelo cuántico real. <a href="https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html" target="_blank" rel="noreferrer">Fundamento: entrenamiento y validación ↗</a></p>
    </section>
    <aside className={styles.panel}><span className={styles.eyebrow}>TU MISIÓN</span><h2>Generalizar, no memorizar.</h2><p className={styles.muted}>Ajusta las épocas hasta encontrar una pérdida de validación próxima a su mínimo. Después, registra tu decisión.</p><div className={styles.callout}><strong>Una pista de NOVA</strong><p>Si el error de entrenamiento baja y el de validación sube, observa el sobreajuste. Más entrenamiento no siempre ayuda.</p></div><button className={styles.primary} onClick={record}>Registrar experimento <span>↗</span></button><p className={styles.feedback} role="status">{feedback}</p><p className={styles.footnote}>El QML combina circuitos cuánticos y aprendizaje automático. Este primer ejercicio enseña una idea clásica que también importa al evaluar esos modelos; no demuestra ventaja cuántica.</p></aside>
  </div>;
}
