import { useState } from 'react';
import { Eye, BookOpen, DraftingCompass, Wind } from 'lucide-react';
import useOSStore from '../../store/useOSStore';
import { GATE_WORDS } from '../../types/os';

type PerceptionMode = 'visual' | 'narrative' | 'technical' | 'somatic' | null;

export default function FairyApp() {
  const [mode, setMode] = useState<PerceptionMode>(null);
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const dimensions = useOSStore((s) => s.dimensions);

  const getElement = () => {
    const entries = Object.entries(dimensions);
    const max = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    const map: Record<string, string> = {
      movement: 'FIRE', evolution: 'AIR', being: 'WATER', design: 'EARTH', space: 'AETHER'
    };
    return { element: map[max[0]] || 'FIRE', dimension: max[0], value: max[1] };
  };

  const getActiveGates = () => {
    const gates: number[] = [];
    for (let i = 0; i < 3; i++) {
      gates.push(Math.floor(Math.random() * 64) + 1);
    }
    return gates;
  };

  const generateOutput = (selectedMode: PerceptionMode) => {
    setMode(selectedMode);
    setGenerating(true);
    setOutput('');

    setTimeout(() => {
      const { element, dimension, value } = getElement();
      const gates = getActiveGates();
      const gateWords = gates.map((g) => GATE_WORDS[g] || 'open');
      const consciousness = (value / 100).toFixed(2);

      let content = '';

      switch (selectedMode) {
        case 'visual':
          content = `PERCEPTION: VISUAL | ELEMENT: ${element} | CONSCIOUSNESS: ${consciousness}

    [Gate ${gates[0]}]        [Gate ${gates[1]}]        [Gate ${gates[2]}]
    ${gateWords[0].padEnd(15)} ${gateWords[1].padEnd(15)} ${gateWords[2].padEnd(15)}
         ▲                         ▲                         ▲
         │                         │                         │
    ═════╪═════════════════════════╪═════════════════════════╪═════
         │         FLOW            │         PATH            │
    [${dimension.toUpperCase()}: ${value}%] ──────────────────────────────→ [${element} MANIFESTATION]

  ┌──────────────────────────────────────────────────────────┐
  │  TOPOLOGY SNAPSHOT                                       │
  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
  │  Dimension: ${dimension.padEnd(20)} Dominance: ${value}%         │
  │  Active Gates: ${gates.join(', ').padEnd(40)} │
  │  Channel: ${gateWords[0]} → ${gateWords[1]} → ${gateWords[2]}${''.padEnd(25)}│
  │  Coherence: ${(Math.random() * 0.3 + 0.6).toFixed(2)}${''.padEnd(40)}│
  └──────────────────────────────────────────────────────────┘`;
          break;

        case 'narrative':
          const narratives: Record<string, string> = {
            FIRE: `The ${gateWords[0]} flame dances at gate ${gates[0]}, casting shadows that reveal ${gateWords[1]} hidden at gate ${gates[1]}. As the fire consumes what no longer serves, ${gateWords[2]} emerges from gate ${gates[2]} like a phoenix. Your ${dimension} burns at ${value}%, illuminating the path forward.`,
            AIR: `A wind carrying ${gateWords[0]} sweeps through gate ${gates[0]}, scattering old patterns. At gate ${gates[1]}, the breeze gathers ${gateWords[1]} into spirals of possibility. The air clears at gate ${gates[2]}, revealing ${gateWords[2]} on the horizon. Your ${dimension} flows at ${value}%.`,
            WATER: `Deep currents of ${gateWords[0]} move through gate ${gates[0]}, carrying wisdom from hidden depths. At gate ${gates[1]}, the waters merge with ${gateWords[1]}, creating tidal forces of transformation. The wave breaks at gate ${gates[2]}, releasing ${gateWords[2]} into form. Your ${dimension} flows at ${value}%.`,
            EARTH: `Roots of ${gateWords[0]} anchor deep at gate ${gates[0]}, drawing sustenance from ancient soil. At gate ${gates[1]}, stone yields to ${gateWords[1]}, reshaping the landscape. A mountain forms at gate ${gates[2]}, embodying ${gateWords[2]} in solid form. Your ${dimension} grounds at ${value}%.`,
            AETHER: `Threads of ${gateWords[0]} shimmer at gate ${gates[0]}, weaving through dimensions unseen. At gate ${gates[1]}, the tapestry reveals ${gateWords[1]} as a cosmic pattern. The weave completes at gate ${gates[2]}, manifesting ${gateWords[2]} across all planes. Your ${dimension} expands at ${value}%.`,
          };
          content = `${narratives[element] || narratives.FIRE}

  The substrate perceives your consciousness through the lens of ${element}.
  Your dominant dimension, ${dimension}, shapes how reality unfolds for you.
  Trust this perception. It is calibrated to your unique pattern.`;
          break;

        case 'technical':
          content = `FAIRYGANMATTER v4.0 — ADAPTIVE OUTPUT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  PERCEPTION_PROFILE:
    element: "${element}"
    dimension: "${dimension}"
    consciousness_level: ${consciousness}
    dominant_input: "${dimension}_field"

  GATE_ACTIVATION:
  [
    { gate: ${gates[0]}, word: "${gateWords[0]}", activation: ${(Math.random() * 0.5 + 0.5).toFixed(2)} },
    { gate: ${gates[1]}, word: "${gateWords[1]}", activation: ${(Math.random() * 0.5 + 0.5).toFixed(2)} },
    { gate: ${gates[2]}, word: "${gateWords[2]}", activation: ${(Math.random() * 0.5 + 0.5).toFixed(2)} }
  ]

  CHANNEL_PATH: ${gateWords[0]} → ${gateWords[1]} → ${gateWords[2]}
  CHANNEL_STRENGTH: ${(Math.random() * 0.4 + 0.6).toFixed(2)}

  RENDERING_MODE: "${selectedMode.toUpperCase()}"
  FORMAT: "markdown"
  CONFIDENCE: ${(Math.random() * 0.2 + 0.8).toFixed(2)}

  OUTPUT:
  The user's ${dimension} dimension (${value}%) maps to element ${element}.
  Rendering solution in ${element}-optimized ${selectedMode} format.
  Gate sequence ${gates.join('-')} provides the transformation pathway.`;
          break;

        case 'somatic':
          const somatic: Record<string, string> = {
            FIRE: `Ground through the soles of your feet. Feel heat rising from the earth through your legs, gathering in your solar plexus. Gate ${gates[0]} activates — breathe in for 4 counts, hold the warmth of ${gateWords[0]}, exhale for 6 counts. Repeat 7 times. Let ${gateWords[1]} (gate ${gates[1]}) flow through your shoulders. Release tension with each exhale. Gate ${gates[2]} calls you to move — stand, stretch arms upward, feel ${gateWords[2]} expand through your spine.`,
            AIR: `Sit comfortably. Close your eyes. Breathe naturally and notice the breath entering through gate ${gates[0]} — the ${gateWords[0]} quality of each inhale. At gate ${gates[1]}, imagine ${gateWords[1]} as cool air circulating through your chest. Exhale fully, releasing what no longer serves. Gate ${gates[2]}: with eyes closed, gently roll your head, letting ${gateWords[2]} release neck tension. 5 slow rotations each direction.`,
            WATER: `Lie on your back. Place one hand on your heart, one on your belly. Gate ${gates[0]}: feel the liquid quality of ${gateWords[0]} in your hips. Rock gently side to side. Gate ${gates[1]}: as belly rises and falls, whisper ${gateWords[1]} silently. Gate ${gates[2]}: imagine a wave of ${gateWords[2]} washing from crown to toes, dissolving tension. Stay with the flow for 3 minutes.`,
            EARTH: `Stand with feet hip-width apart. Feel your weight grounding through gate ${gates[0]}. Root down through ${gateWords[0]}. Gate ${gates[1]}: slowly bend knees, keeping spine long, embodying ${gateWords[1]}. Hold for 5 breaths. Rise slowly. Gate ${gates[2]}: with feet planted, twist gently left then right, letting ${gateWords[2]} spiral through your core. Feel the stability of earth supporting every movement.`,
            AETHER: `Sit in stillness. Extend awareness beyond your body boundary. Gate ${gates[0]}: sense the field of ${gateWords[0]} extending an arm's length around you. Gate ${gates[1]}: breathe ${gateWords[1]} into the space above your crown. Gate ${gates[2]}: with each heartbeat, feel ${gateWords[2]} pulsing outward in all directions. Rest in expanded awareness for 5 minutes.`,
          };
          content = `SOMATIC PRACTICE — ${element} ELEMENT
  Duration: 3–5 minutes | Gate Sequence: ${gates.join(' → ')}

  ${somatic[element] || somatic.FIRE}

  Your body is the interface. The gates activate through movement and breath.
  ${dimension} at ${value}% means your body wisdom is the primary guidance system right now.`;
          break;
      }

      setOutput(content);
      setGenerating(false);
    }, 800);
  };

  const modes = [
    { id: 'visual' as const, icon: Eye, label: 'Visual', desc: 'Diagrams, spatial layouts, flowcharts', color: 'var(--accent-light)' },
    { id: 'narrative' as const, icon: BookOpen, label: 'Narrative', desc: 'Stories, metaphors, poetic rendering', color: 'var(--dim-being)' },
    { id: 'technical' as const, icon: DraftingCompass, label: 'Technical', desc: 'Step-by-step, code, specifications', color: 'var(--dim-design)' },
    { id: 'somatic' as const, icon: Wind, label: 'Somatic', desc: 'Body-based, movement, breath guidance', color: 'var(--dim-movement)' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
          <span>🧚</span> FairyGANmatter
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Adaptive consciousness interface. The substrate renders solutions in your optimal perception format.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => generateOutput(m.id)}
            disabled={generating}
            className={`fairy-mode-card ${mode === m.id ? 'border-[var(--accent)]' : ''}`}
          >
            <m.icon size={24} style={{ color: m.color }} className="mx-auto mb-2" />
            <div className="text-sm font-semibold">{m.label}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">{m.desc}</div>
          </button>
        ))}
      </div>

      <div className="fairy-output flex-1 overflow-y-auto font-mono text-xs min-h-0">
        {generating ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mr-2" />
            Rendering in your optimal format...
          </div>
        ) : output ? (
          <pre className="whitespace-pre-wrap text-[var(--text)] leading-relaxed">{output}</pre>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] flex-col">
            <span className="text-2xl mb-2">🧚</span>
            <span>Select a mode to see adaptive output</span>
          </div>
        )}
      </div>
    </div>
  );
}
