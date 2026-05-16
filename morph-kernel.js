/* Unified Morphing Kernel v0.1 - static, dependency-free */
const PHI = 1.61803398875;
const CENTERS = ['Head','Ajna','Throat','G','Heart','Spleen','Sacral','Solar','Root'];
const BASE_GATES = [1,2,7,10,13,15,25,46,5,14,29,34,59,3,27,42,50,32,28,44,57,48,16,20,31,33,35,45,8,12,56,62,23,43,11,24,61,63,64,6,22,30,36,37,49,55,19,39,41,52,53,54,58,60,18,17,21,26,40,51,4,47,9,38];

export function createBirthSignature(input = {}) {
  const seedText = `${input.name || 'operator'}|${input.birth || ''}|${input.intent || 'morph'}|${new Date().toDateString()}`;
  let hash = 2166136261;
  for (const ch of seedText) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  const gates = Array.from({ length: 5 }, (_, i) => BASE_GATES[Math.abs((hash >> (i * 5)) + i * 13) % BASE_GATES.length]);
  const centers = gates.map((g, i) => CENTERS[(g + i + Math.abs(hash % 9)) % CENTERS.length]);
  return { id: `UMK-${Math.abs(hash).toString(36).toUpperCase()}`, seedText, gates, centers, createdAt: new Date().toISOString() };
}

export function morphStep(state, signal = 'observe') {
  const t = Date.now() / 1000;
  const pressure = Number(((Math.sin(t / PHI) + 1) / 2).toFixed(3));
  const clarity = Number(((Math.cos(t / (PHI * PHI)) + 1) / 2).toFixed(3));
  const gate = BASE_GATES[(Math.floor(t) + state.cycle + signal.length) % BASE_GATES.length];
  const center = CENTERS[(gate + state.cycle) % CENTERS.length];
  const mode = pressure > .66 ? 'transmute' : clarity > .62 ? 'stabilize' : 'listen';
  return {
    ...state,
    cycle: state.cycle + 1,
    activeGate: gate,
    activeCenter: center,
    mode,
    pressure,
    clarity,
    trace: [{ gate, center, mode, signal, pressure, clarity, at: new Date().toLocaleTimeString() }, ...state.trace].slice(0, 13)
  };
}

export function initKernel(input) {
  return { signature: createBirthSignature(input), cycle: 0, mode: 'boot', activeGate: 1, activeCenter: 'G', pressure: 0, clarity: 0, trace: [] };
}

export const shellRegistry = [
  { id: 'kernel', title: 'Kernel Dashboard', file: null, kind: 'native', blurb: 'Run morph cycles, inspect gates, trace state.' },
  { id: 'arcadia', title: 'Arcadia Full Shell', file: 'shells/ARCADIA_v2_Full.html', kind: 'html', blurb: '81-layer Arcadia shell from bundle.' },
  { id: 'youniverse', title: 'Youniverse', file: 'shells/youniverse.html', kind: 'html', blurb: 'Personal cosmology shell.' },
  { id: 'synth', title: 'Synth Standalone', file: 'shells/synth-ai-standalone.html', kind: 'html', blurb: 'Synth AI standalone OS shell.' },
  { id: 'movement', title: 'Movement Shell', file: 'shells/movement.html', kind: 'html', blurb: 'Movement/transit detector interface.' },
  { id: 'swarm', title: 'Swarm v5', file: 'shells/swarm-v5.html', kind: 'html', blurb: 'Consciousness swarm shell.' }
];
