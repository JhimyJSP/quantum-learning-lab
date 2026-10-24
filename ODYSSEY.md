# Quantum Odyssey · expansión local

Rama: `feat/quantum-learning-lab`.

Base original: `3550c016f5f4426eead1b1df491a34c36f19e8bb` (`origin/main` al clonar).
La expansión solo añade archivos. El combate, sus reglas, estilos y ruta `/` permanecen intactos.

## Ejecutar

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

- Expansión: http://localhost:3000/odyssey
- Combate original: http://localhost:3000/

## Qué se puede jugar

- Mapa narrativo del Archivo de Hilbert, con cuatro sectores seleccionables.
- Laboratorio ideal de uno/dos qubits: H, X, Z, CX, probabilidades, amplitudes y mediciones. Cada muestra vuelve a preparar el circuito.
- Tres misiones verificadas con el estado simulado: superposición, interferencia y entrelazamiento.
- Rescate táctico 8×8: dos pasos ortogonales, obstáculos, pulsos anunciados, dos fragmentos y un puente de un uso.
- Laboratorio de entrenamiento y validación con dos modelos ilustrativos. Las curvas son sintéticas; no ejecuta entrenamiento ni demuestra ventaja cuántica.
- Bitácora, pregunta de recuperación activa, XP sin duplicados y exportación JSON.
- Progreso guardado en localStorage, con degradación a sesión si el navegador impide guardarlo. No hay cuenta, servidor de progreso ni penalizaciones por ausencia.
- Hoja de ruta de doce eras, identificada como contenido futuro.

La guía NOVA usa textos escritos para esta demo, sin conexión a un servicio de IA. Las afinidades del combate y el puente táctico son ficción; el laboratorio usa un modelo matemático de amplitudes reales. No se conecta a hardware cuántico.

## Comprobaciones

```sh
node scripts/verify-odyssey.mjs
npx tsc --noEmit --incremental false
npm run build
git diff --exit-code origin/main -- . ':!src/app/odyssey' ':!src/components/odyssey' ':!scripts/verify-odyssey.mjs' ':!ODYSSEY.md'
```

Solución táctica segura: A8 → C8 → C6 → puente E6 → E4 → F3 → H3 → H1.
QML: el modelo complejo tiene mínimo de validación cerca de la época 35 y el simple cerca de la 70.

## Referencias científicas

- [IBM Quantum: fundamentos de mecánica cuántica](https://quantum.cloud.ibm.com/learning/en/courses/use-a-qc-today/quantum-mechanics-basics)
- [scikit-learn: subajuste y sobreajuste](https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html)
- [IBM Quantum: introducción a QML](https://quantum.cloud.ibm.com/learning/en/courses/quantum-machine-learning/introduction)

Se tomó `obligatorio.txt` como contexto del MVP de combate y `recomendacion.txt` como orientación de la expansión. Su visión de varios años se representa mediante una primera expedición funcional y una hoja de ruta, sin afirmar que existe toda la campaña.
