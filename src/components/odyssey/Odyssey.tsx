"use client";

import { useCallback, useEffect, useState } from "react";
import { QuantumLab } from "./QuantumLab";
import { TacticalLab } from "./TacticalLab";
import { QmlLab } from "./QmlLab";
import styles from "./Odyssey.module.css";

type View = "explore" | "lab" | "tactics" | "qml" | "journal";
type LabMode = "superposition" | "interference" | "entanglement";
type Entry = { id: string; date: string };
const KEY = "quant-nova-odyssey-v1";
const discoveries = [
  { id: "superposition", title: "Una puerta, dos posibilidades", concept: "Superposición", xp: 100, text: "Preparé un estado con amplitudes coherentes de igual magnitud. La medición en la base computacional produce 0 o 1 con probabilidad 1/2." },
  { id: "interference", title: "El eco de la fase", concept: "Interferencia", xp: 125, text: "Comparé HH y HZH. La fase relativa cambia cómo se combinan las amplitudes: HH lleva a 0 y HZH a 1 desde el estado inicial 0." },
  { id: "entanglement", title: "Un vínculo entre mundos", concept: "Entrelazamiento", xp: 150, text: "Preparé un par de Bell. En esta base, ambos bits siempre coinciden, aunque cada resultado individual es aleatorio. Esto no transmite mensajes instantáneos." },
  { id: "tactics", title: "Rescate en el sector fracturado", concept: "Estrategia", xp: 175, text: "Recuperé dos fragmentos y alcancé la salida anticipando los pulsos del tablero. La habilidad de puente es una regla de ficción del juego." },
  { id: "qml", title: "Aprender a detenerse", concept: "Generalización", xp: 150, text: "Elegí una época próxima al mínimo de validación en un modelo ilustrativo. Una menor pérdida de entrenamiento no garantiza mejor generalización." },
  { id: "reflection", title: "La pregunta correcta", concept: "Recuperación activa", xp: 75, text: "Reconocí que medir un qubit produce un resultado por ejecución. Para estimar probabilidades necesito repetir la preparación y la medición." },
];
const sectors = [
  { title: "El laboratorio olvidado", short: "El despertar", subtitle: "SECTOR 01 · ESTADOS", text: "El Núcleo ha despertado, pero la puerta del archivo sigue sellada. Prepara una superposición y observa lo que ocurre al medir.", reward: 100, duration: "3–5 min", id: "superposition" },
  { title: "El puente de las fases", short: "La interferencia", subtitle: "SECTOR 02 · FASES", text: "Dos caminos llegan al mismo destino. Una fase distinta puede hacer que sus amplitudes se refuercen o se cancelen. Descubre cómo abrir la segunda compuerta.", reward: 125, duration: "3–5 min", id: "interference" },
  { title: "Los observatorios gemelos", short: "El vínculo", subtitle: "SECTOR 03 · CORRELACIONES", text: "Dos observatorios guardan fragmentos del mismo registro. Construye un estado de Bell y compara sus mediciones conjuntas.", reward: 150, duration: "4–6 min", id: "entanglement" },
  { title: "La ciudad que aprende", short: "The Learning Machines", subtitle: "SECTOR 04 · INTELIGENCIA", text: "La máquina de la ciudad ha memorizado sus datos. Encuentra cuándo conviene detener el entrenamiento antes de que pierda su capacidad de generalizar.", reward: 150, duration: "3–5 min", id: "qml" },
];
const eras = [
  ["0", "El despertar de la razón", "Lógica, vectores y probabilidades"],
  ["I", "El universo clásico", "Energía, ondas y modelos físicos"],
  ["II", "La crisis de la física", "Luz, átomos y doble rendija"],
  ["III", "El reino de los estados", "Amplitudes, operadores y medición"],
  ["IV", "Arquitectos de la materia", "Espín, túnel y sistemas cuánticos"],
  ["V", "La civilización de los qubits", "Compuertas, Bell y circuitos"],
  ["VI", "La guerra de los algoritmos", "Grover, VQE y QAOA"],
  ["VII", "La inteligencia cuántica", "QML, kernels y modelos híbridos"],
  ["VIII", "La máquina imperfecta", "Ruido y corrección de errores"],
  ["IX", "La materia profunda", "Moléculas y muchos cuerpos"],
  ["X", "Los campos fundamentales", "Partículas e interacciones"],
  ["XI", "La frontera del conocimiento", "Hipótesis, controles y reproducción"],
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    explore: <><path d="m12 3 9 5v9l-9 5-9-5V8z" /><path d="m3 8 9 5 9-5M12 13v9M7 5.5l9 5" /></>,
    lab: <><path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 15h10" /><circle cx="11" cy="17" r=".5" /></>,
    tactics: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></>,
    qml: <><circle cx="5" cy="7" r="2" /><circle cx="5" cy="17" r="2" /><circle cx="19" cy="12" r="2" /><path d="m7 7 10 5M7 17l10-5M12 3v4M12 17v4" /></>,
    journal: <><path d="M5 3h12a2 2 0 0 1 2 2v16H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3M7 3v18M11 8h4M11 12h4" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    spark: <path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8z" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}

export function Odyssey() {
  const [view, setView] = useState<View>("explore");
  const [sector, setSector] = useState(0);
  const [labMode, setLabMode] = useState<LabMode>("superposition");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [toast, setToast] = useState("");
  const [roadmap, setRoadmap] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    try {
      const data: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(data)) {
        const valid: Entry[] = [];
        data.forEach(item => {
          if (item && typeof item.id === "string" && typeof item.date === "string" && Number.isFinite(Date.parse(item.date)) && discoveries.some(d => d.id === item.id) && !valid.some(e => e.id === item.id)) valid.push({ id: item.id, date: item.date });
        });
        setEntries(valid);
      }
    } catch { setSaved(false); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(entries)); setSaved(true); } catch { setSaved(false); }
  }, [entries, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  const complete = useCallback((id: string) => {
    if (!discoveries.some(d => d.id === id)) return;
    setEntries(current => current.some(e => e.id === id) ? current : [...current, { id, date: new Date().toISOString() }]);
    setToast("Descubrimiento registrado en tu bitácora.");
  }, []);
  const xp = entries.reduce((sum, entry) => sum + (discoveries.find(d => d.id === entry.id)?.xp || 0), 0);
  const done = (id: string) => entries.some(e => e.id === id);
  const selected = sectors[sector];
  const missionCount = entries.filter(e => sectors.some(s => s.id === e.id)).length;

  function launch(index: number) {
    if (index === 3) setView("qml");
    else { setLabMode(sectors[index].id as LabMode); setView("lab"); }
  }
  function download() {
    const report = { expedition: "Archivo de Hilbert", version: 1, exportedAt: new Date().toISOString(), xp, discoveries: entries.map(e => ({ ...e, ...discoveries.find(d => d.id === e.id) })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "quantum-odyssey-bitacora.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className={styles.app}>
    <a className={styles.skip} href="#odyssey-content">Ir al contenido</a>
    <aside className={styles.sidebar}>
      <a href="/odyssey" className={styles.brand} aria-label="Quantum Odyssey, inicio"><span className={styles.brandMark}><Icon name="explore" size={27} /></span><span>QUANTUM<span>ODYSSEY</span></span></a>
      <div className={styles.navGroup}>TU EXPEDICIÓN</div>
      <nav className={styles.nav} aria-label="Expedición">{([["explore", "Exploración"], ["lab", "Laboratorio"], ["tactics", "Simulador táctico"], ["qml", "Quantum AI"], ["journal", "Bitácora"]] as [View, string][]).map(([id, label]) => <button key={id} aria-label={label} title={label} className={view === id ? styles.navActive : ""} aria-current={view === id ? "page" : undefined} onClick={() => { setView(id); setRoadmap(false); }}><Icon name={id} /><span>{label}</span>{id === "journal" && <small>{entries.length}</small>}</button>)}</nav>
      <div className={styles.sidebarBottom}><div className={styles.novaAvatar}>N</div><p><strong>La curiosidad es tu brújula.</strong><span>Cada descubrimiento abre un camino.</span></p><a href="/" target="_blank" rel="noreferrer">Abrir combate original <span>↗</span></a><span className={styles.version}>QUANT NOVA / EXPANSIÓN LOCAL 01</span></div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}><div className={styles.breadcrumb}>EL ARCHIVO DE HILBERT <span>/</span> <strong>{view === "explore" ? "Centro de exploración" : view === "lab" ? "Laboratorio cuántico" : view === "tactics" ? "Simulador táctico" : view === "qml" ? "The Learning Machines" : "Bitácora científica"}</strong></div><div className={styles.profile}><span className={styles.onlineDot} /><span>Modo local</span><span className={styles.topDivider} /><Icon name="spark" size={16} /><strong>{xp} XP</strong><span className={styles.profileAvatar}>EX</span></div></header>
      <main id="odyssey-content" className={styles.main}>
        <div className={styles.pageHeading}><div><span className={styles.eyebrow}>AÑO 2247 · SEÑAL DEL NÚCLEO RECUPERADA</span><h1>{view === "explore" ? <>El universo tiene preguntas.<br /><span>Encuentra tu siguiente descubrimiento.</span></> : view === "lab" ? <>Pequeñas operaciones.<br /><span>Grandes posibilidades.</span></> : view === "tactics" ? <>Piensa dos pasos adelante.<br /><span>Recupera lo que se perdió.</span></> : view === "qml" ? <>La inteligencia empieza<br /><span>con una buena pregunta.</span></> : <>Tu conocimiento<br /><span>deja una huella.</span></>}</h1></div><div className={styles.rank}><span className={styles.rankIcon}><Icon name="spark" size={25} /></span><div><span>RANGO DE EXPEDICIÓN</span><strong>{xp >= 500 ? "Arquitecto del Núcleo" : xp >= 200 ? "Explorador de estados" : "Aprendiz del Archivo"}</strong><small>{entries.length} de {discoveries.length} descubrimientos</small></div></div></div>
        {view === "explore" && <>
          <div className={styles.exploreGrid}>
            <section className={styles.mapPanel} aria-label="Mapa de sectores">
              <div className={styles.mapHeader}><div><span className={styles.eyebrow}>CARTOGRAFÍA DEL ARCHIVO</span><h2>Un mundo por reconstruir</h2></div><span className={styles.liveBadge}><i />EXPEDICIÓN INICIAL</span></div>
              <div className={styles.starMap}>
                <div className={styles.starField} />
                <svg className={styles.mapArt} viewBox="0 0 800 400" aria-hidden="true"><defs><radialGradient id="orb"><stop offset="0" stopColor="#b8b0ff" stopOpacity=".3" /><stop offset="1" stopColor="#7a6dd8" stopOpacity="0" /></radialGradient><linearGradient id="route"><stop stopColor="#a4a1ff" /><stop offset="1" stopColor="#62c8c2" /></linearGradient></defs><ellipse cx="388" cy="218" rx="278" ry="98" fill="none" stroke="#3a4357" strokeDasharray="3 9" transform="rotate(-18 388 218)" /><circle cx="385" cy="210" r="170" fill="url(#orb)" /><circle cx="385" cy="210" r="83" fill="none" stroke="#7871c9" strokeOpacity=".16" /><circle cx="385" cy="210" r="115" fill="none" stroke="#7871c9" strokeOpacity=".12" /><path d="M150 264C200 208 271 160 323 185S454 274 495 199S570 100 653 116" fill="none" stroke="url(#route)" strokeWidth="2" strokeDasharray="5 7" /><path d="m385 171 34 20v39l-34 20-34-20v-39z" fill="#181d32" stroke="#8b83cc" strokeWidth="1.2" /><path d="m351 191 34 20 34-20m-34 20v39m0-79v40" fill="none" stroke="#a69dea" strokeWidth="1.2" /><circle cx="385" cy="211" r="6" fill="#c8bdff" /><text x="385" y="288" textAnchor="middle" fontSize="10" letterSpacing="4" fill="#807ca8">EL NÚCLEO</text></svg>
                {sectors.map((s, i) => <button key={s.id} className={`${styles.mapNode} ${styles[`node${i}`]} ${sector === i ? styles.selectedNode : ""} ${done(s.id) ? styles.completedNode : ""}`} onClick={() => setSector(i)} aria-pressed={sector === i} aria-label={`Sector ${i + 1}: ${s.title}${done(s.id) ? ", completado" : ""}`}><span className={styles.nodeOrb}>{done(s.id) ? <Icon name="check" size={22} /> : <Icon name={i === 3 ? "qml" : "spark"} size={20} />}</span><span className={styles.nodeLabel}><small>0{i + 1}</small>{s.short}</span></button>)}
                <div className={styles.mapCoordinates}>HILBERT // 04 REGIONES CONECTADAS</div><div className={styles.mapHint}><i />{missionCount} / 4 sectores restaurados</div>
              </div>
              <div className={styles.mapFooter}><span>Selecciona un sector para descubrir su misión.</span><button onClick={() => setRoadmap(v => !v)} aria-expanded={roadmap}>{roadmap ? "Cerrar ruta" : "Ver las 12 eras"}<Icon name="arrow" size={16} /></button></div>
            </section>
            <aside className={styles.missionPanel}><div className={styles.missionTop}><span className={styles.eyebrow}>MISIÓN DE EXPLORACIÓN</span><span className={styles.missionNumber}>0{sector + 1}</span></div><div className={styles.missionSymbol}><Icon name={sector === 3 ? "qml" : "lab"} size={30} /></div><span className={styles.sectorLabel}>{selected.subtitle}</span><h2>{selected.title}</h2><p>{selected.text}</p><div className={styles.missionMeta}><span><Icon name="spark" size={15} /> +{selected.reward} XP</span><span>◷ {selected.duration}</span></div><button className={styles.primary} onClick={() => launch(sector)}>{done(selected.id) ? "Volver al experimento" : "Iniciar misión"}<Icon name="arrow" size={18} /></button><span className={styles.missionNote}>{done(selected.id) ? "Fragmento recuperado · puedes seguir experimentando" : "Sin cronómetro. Aprende a tu ritmo."}</span></aside>
          </div>
          {roadmap && <section className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>DE LAS PRIMERAS PREGUNTAS A LA FRONTERA</span><h2>Doce eras. Un horizonte abierto.</h2></div><span className={styles.badge}>Hoja de ruta</span></div><p className={styles.muted}>Visión de la campaña futura. Las actividades de esta expansión son los cuatro sectores, el rescate táctico y la pregunta de repaso; estas eras todavía no son capítulos completos.</p><div className={styles.eraGrid}>{eras.map(([n, title, detail]) => <div key={n} className={styles.era}><span>{n}</span><div><strong>{title}</strong><p>{detail}</p></div></div>)}</div></section>}
          <div className={styles.sectionHeading}><h2>Hay más de una forma de descubrir.</h2><span>EXPLORA A TU RITMO</span></div>
          <div className={styles.activityGrid}><button className={styles.activityCard} onClick={() => setView("tactics")}><span className={styles.activityIcon}><Icon name="tactics" size={24} /></span><div><span className={styles.eyebrow}>DESAFÍO TÁCTICO</span><h3>Rescate en el sector fracturado</h3><p>Anticipa los pulsos. Recupera los fragmentos. Encuentra tu salida.</p><span className={styles.cardLink}>{done("tactics") ? "Repetir expedición" : "Explorar tablero"} <Icon name="arrow" size={16} /></span></div></button><button className={styles.activityCard} onClick={() => setView("journal")}><span className={`${styles.activityIcon} ${styles.teal}`}><Icon name="journal" size={24} /></span><div><span className={styles.eyebrow}>MEMORIA CIENTÍFICA</span><h3>Lo que descubres, permanece</h3><p>Guarda tus hallazgos y vuelve a una pregunta para consolidarlos.</p><span className={styles.cardLink}>Abrir bitácora <Icon name="arrow" size={16} /></span></div></button></div>
          <div className={styles.novaMessage}><span className={styles.novaAvatar}>N</span><p><strong>NOVA · Acompañante de expedición</strong>El Archivo no se reconstruye sabiendo todas las respuestas. Se reconstruye atreviéndote a experimentar.</p><span>GUÍA NARRATIVA</span></div>
        </>}
        {view === "lab" && <QuantumLab key={labMode} initialMode={labMode} onComplete={complete} />}
        {view === "tactics" && <TacticalLab onComplete={complete} />}
        {view === "qml" && <QmlLab onComplete={complete} />}
        {view === "journal" && <div className={styles.labLayout}><section className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>REGISTRO DE EXPEDICIÓN</span><h2>{entries.length ? "Tus fragmentos del Archivo" : "Toda expedición empieza con una pregunta."}</h2></div><button className={styles.secondary} onClick={download}>Exportar JSON ↗</button></div><p className={styles.muted}>Los XP registran actividades completadas; no miden tu dominio científico. {saved ? "Tu progreso se guarda en este navegador." : "El almacenamiento no está disponible; el progreso de esta sesión podría no conservarse."}</p><div className={styles.resetProgress}>{confirmReset ? <><p>¿Comenzar una nueva expedición? Se borrarán los descubrimientos y XP de este navegador. Puedes exportarlos primero.</p><button className={styles.secondary} onClick={() => { setEntries([]); setAnswer(null); setConfirmReset(false); setSector(0); setView("explore"); setToast("Nueva expedición preparada. El Archivo te espera."); }}>Sí, comenzar de nuevo</button><button className={styles.secondary} onClick={() => setConfirmReset(false)}>Conservar progreso</button></> : <button className={styles.secondary} onClick={() => setConfirmReset(true)}>Nueva expedición</button>}</div><div className={styles.progressTrack}><span style={{ width: `${entries.length / discoveries.length * 100}%` }} /></div>{entries.length === 0 && <div className={styles.emptyState}><Icon name="journal" size={42} /><h3>Tu primer descubrimiento te espera.</h3><p>Prepara una superposición en el laboratorio para recuperar el primer fragmento.</p><button className={styles.primary} onClick={() => launch(0)}>Ir al laboratorio <Icon name="arrow" size={16} /></button></div>}{entries.slice().reverse().map(entry => { const discovery = discoveries.find(d => d.id === entry.id)!; return <article className={styles.entry} key={entry.id}><span className={styles.entryCheck}><Icon name="check" size={18} /></span><div><span className={styles.eyebrow}>{discovery.concept} · +{discovery.xp} XP</span><h3>{discovery.title}</h3><p>{discovery.text}</p><time dateTime={entry.date}>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "America/Lima" }).format(new Date(entry.date))}</time></div></article>; })}</section><aside className={styles.panel}><span className={styles.eyebrow}>UNA PAUSA PARA RECORDAR</span><h2>Antes de volver al laboratorio…</h2><p className={styles.muted}>Un qubit preparado con H desde |0⟩ se mide una sola vez en la base computacional. ¿Qué observas?</p><div className={styles.answers}>{["0 y 1 a la vez en la pantalla", "Un resultado: 0 o 1", "Siempre un 0"].map((label, i) => <button key={label} aria-pressed={answer === i} className={answer === i ? styles.chosenAnswer : ""} onClick={() => { setAnswer(i); if (i === 1) complete("reflection"); }}>{label}</button>)}</div><p className={styles.feedback} role="status">{answer === null ? "Recupera la idea de memoria. Después puedes comprobarla experimentando." : answer === 1 ? "Exacto. Una ejecución da un resultado. Al repetir la misma preparación y medición, las frecuencias se aproximan a 50 % y 50 %." : "Piensa en una ejecución individual. La superposición describe el estado antes de medir; el registro de medición muestra un solo resultado."}</p><div className={styles.callout}><strong>Vuelve cuando quieras.</strong><p>No hay rachas que perder ni penalizaciones por ausentarte. Puedes repetir cualquier experimento.</p></div></aside></div>}
        <footer className={styles.footer}><span>QUANTUM ODYSSEY <i>·</i> BEYOND REALITY</span><span>{saved ? "Progreso local" : "Progreso de sesión"} <i>·</i> Simulación educativa <i>·</i> <a href="/" target="_blank" rel="noreferrer">Quantum Command ↗</a></span></footer>
      </main>
    </div>
    {toast && <div className={styles.toast} role="status"><Icon name="check" size={18} />{toast}<button aria-label="Cerrar aviso" onClick={() => setToast("")}>×</button></div>}
  </div>;
}
