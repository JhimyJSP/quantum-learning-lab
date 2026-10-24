# Quantum Command: Entangled Fates

Webapp de un juego de cartas por turnos estilo "Command Cards" que usa la
computación cuántica como base temática y mecánica (Spec v1.3).

## Stack

- **Next.js 14** (App Router) + **React 18**
- **Zustand** — gestor de estado del combate
- **Framer Motion** — animaciones de UI y de sprites
- **Tailwind CSS** — estilos

## Mecánicas implementadas

- **Equipo de 3 personajes** con HP (Integridad del Sistema), Escudo de
  Coherencia y Moxie/Quanta (0–5). A 5 de Moxie se habilita la carta
  **Ultimate**.
- **Afinidad elemental (arquitecturas cuánticas):** triángulo
  Trapped-Ion ▸ Superconducting ▸ Neutral-Atom ▸ Trapped-Ion (ventaja ×1.5).
- **Cartas** de nivel 1–3 con **fusión automática** de cartas idénticas
  adyacentes (+1 Moxie), tipos **Physical Qubit** (daño directo, acumula Ruido)
  y **Logical Qubit** (control, consume Ruido).
- **Flujo del turno:** Reparto (mano a 6) → Fusiones → Órdenes (1 AP por
  personaje vivo; mover una carta cuesta 1 AP) → Medición → Turno del Enemigo →
  Fin de Turno.
- **Animaciones de sprite por estado:** idle (respiración/balanceo), ataque
  Physical (dash + glitch), ataque Logical (levitación + interfaz holográfica),
  Ultimate (pose especial), hit y muerte.
- **HUD e interactividad (hover):** panel de personaje con valores exactos
  (HP 1540/2000), estadísticas y buffs/debuffs; cartas que se elevan y muestran
  el detalle mecánico + el concepto cuántico educativo.

## Cómo ejecutar

```bash
npm install
npm run dev     # http://localhost:3000
```

Para producción:

```bash
npm run build
npm start
```

## Cómo se juega

1. En la **Fase de Órdenes** haz clic en una carta de la mano para
   seleccionarla y luego pulsa **Confirmar objetivo** (cuesta 1 AP).
2. Repite hasta gastar tus AP (1 por personaje vivo).
3. Pulsa el botón **Medir** (✓) para ejecutar la Fase de Medición.
4. El enemigo responde, se resuelven los efectos y empieza el siguiente turno.

> Las capas de sprite son _placeholders_ animados con Framer Motion. El pipeline
> real sustituiría cada capa por un canvas de **Spine WebGL / PixiJS / Live2D**
> accionado por el mismo `spriteState`.
