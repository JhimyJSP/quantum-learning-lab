// Real-amplitude state-vector simulator for H, X, Z and controlled-X.
// Basis order is |q0 q1>: q0 is the leftmost (most significant) bit.
export type GateName = "H" | "X" | "Z" | "CX";
export type QuantumGate = { name: GateName; target: 0 | 1 };
export type ExperimentId = "superposition" | "interference" | "entanglement";

export function initialState(qubits: 1 | 2): number[] {
  return Array.from({ length: 2 ** qubits }, (_, i) => i === 0 ? 1 : 0);
}

export function applyGate(state: readonly number[], gate: QuantumGate): number[] {
  const qubits = Math.log2(state.length);
  if ((qubits !== 1 && qubits !== 2) || gate.target >= qubits) {
    throw new Error("Invalid qubit or state dimension");
  }
  const next = [...state];
  if (gate.name === "CX") {
    if (qubits !== 2) throw new Error("CX needs two qubits");
    // q0 controls q1; |10> and |11> exchange their amplitudes.
    [next[2], next[3]] = [next[3], next[2]];
    return next;
  }
  const bit = 1 << (qubits - gate.target - 1);
  for (let i = 0; i < state.length; i++) {
    if (i & bit) continue;
    const j = i | bit;
    const a = state[i];
    const b = state[j];
    if (gate.name === "H") {
      next[i] = (a + b) * Math.SQRT1_2;
      next[j] = (a - b) * Math.SQRT1_2;
    } else if (gate.name === "X") {
      next[i] = b;
      next[j] = a;
    } else {
      next[i] = a;
      next[j] = -b;
    }
  }
  return next.map(value => Math.abs(value) < 1e-12 ? 0 : value);
}

export function runCircuit(qubits: 1 | 2, gates: readonly QuantumGate[]): number[] {
  return gates.reduce<number[]>((state, gate) => applyGate(state, gate), initialState(qubits));
}

export function probabilities(state: readonly number[]): number[] {
  const weights = state.map(amplitude => amplitude ** 2);
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map(value => value / total);
}

export function measure(state: readonly number[], random = Math.random): { outcome: number; collapsed: number[] } {
  const values = probabilities(state);
  const sample = random();
  if (sample < 0 || sample >= 1) throw new Error("Random sample must lie in [0, 1)");
  let cumulative = 0;
  let outcome = values.length - 1;
  for (let i = 0; i < values.length; i++) {
    cumulative += values[i];
    if (sample < cumulative) { outcome = i; break; }
  }
  return { outcome, collapsed: values.map((_, i) => i === outcome ? 1 : 0) };
}

export function satisfiesMission(id: ExperimentId, state: readonly number[], gates: readonly QuantumGate[]): boolean {
  const p = probabilities(state);
  if (id === "superposition") return state.length === 2 && Math.abs(p[0] - 0.5) < 1e-8;
  if (id === "interference") return state.length === 2 && p[1] > 0.999999 && gates.filter(g => g.name === "H").length >= 2 && gates.some(g => g.name === "Z");
  if (state.length !== 4) return false;
  // For a pure two-qubit real state, concurrence is 2|ad-bc|.
  const concurrence = 2 * Math.abs(state[0] * state[3] - state[1] * state[2]);
  return concurrence > 0.999999 && Math.abs(p[0] - 0.5) < 1e-8 && Math.abs(p[3] - 0.5) < 1e-8;
}
