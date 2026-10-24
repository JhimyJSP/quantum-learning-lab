import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/components/odyssey/quantum.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } });
const { runCircuit, probabilities, measure, satisfiesMission } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const H = { name: "H", target: 0 };
const X = { name: "X", target: 0 };
const Z = { name: "Z", target: 0 };
const CX = { name: "CX", target: 1 };
function close(actual, expected) { assert.equal(actual.length, expected.length); actual.forEach((x, i) => assert.ok(Math.abs(x - expected[i]) < 1e-10, `${actual} != ${expected}`)); }

close(probabilities(runCircuit(1, [H])), [.5, .5]);
close(probabilities(runCircuit(1, [H, H])), [1, 0]);
close(probabilities(runCircuit(1, [H, Z, H])), [0, 1]);
close(probabilities(runCircuit(2, [H, CX])), [.5, 0, 0, .5]);
// Z changes the relative sign before it changes computational-basis probabilities.
close(probabilities(runCircuit(1, [H])), probabilities(runCircuit(1, [H, Z])));
assert.ok(runCircuit(1, [H, Z])[1] < 0);
// A separable equal superposition must not satisfy the Bell mission.
assert.equal(satisfiesMission("entanglement", runCircuit(2, [H, { ...H, target: 1 }]), []), false);
assert.equal(satisfiesMission("entanglement", runCircuit(2, [H, CX]), [H, CX]), true);
assert.equal(satisfiesMission("interference", runCircuit(1, [X]), [X]), false);
assert.equal(satisfiesMission("interference", runCircuit(1, [H, Z, H]), [H, Z, H]), true);
const bell = runCircuit(2, [H, CX]);
for (let i = 0; i < 1000; i++) {
  const { outcome, collapsed } = measure(bell, () => (i + .5) / 1000);
  assert.ok(outcome === 0 || outcome === 3);
  close(probabilities(collapsed), Array.from({ length: 4 }, (_, j) => j === outcome ? 1 : 0));
}
// Exercise both targets and a longer gate sequence, checking normalization throughout.
const gates = [];
for (let i = 0; i < 60; i++) {
  gates.push(i % 4 === 0 ? CX : { name: ["H", "X", "Z"][i % 3], target: i % 2 });
  const state = runCircuit(2, gates);
  assert.ok(Math.abs(state.reduce((sum, a) => sum + a * a, 0) - 1) < 1e-10);
}
assert.throws(() => measure(bell, () => 1));
console.log("Odyssey: H, HH, HZH, Bell, phase, mission validation, 1000 measurements and norm preservation passed.");
