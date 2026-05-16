import { useState } from 'react';
import { Hammer, Eye, Play, FileCode, FileText, Braces } from 'lucide-react';
import useOSStore from '../../store/useOSStore';

const MOCK_FILES = [
  { name: 'index.html', icon: FileCode, size: '2.4 KB', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Morph App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="root"></div>\n  <script src="app.js"></script>\n</body>\n</html>' },
  { name: 'style.css', icon: FileText, size: '1.8 KB', content: ':root {\n  --bg: #06040b;\n  --accent: #773cdd;\n  --text: #e8e0f0;\n}\n\nbody {\n  background: var(--bg);\n  color: var(--text);\n  font-family: system-ui;\n}\n\n.app {\n  display: grid;\n  gap: 1rem;\n  padding: 2rem;\n}' },
  { name: 'app.js', icon: Braces, size: '4.2 KB', content: 'const MorphApp = {\n  init() {\n    this.gates = new Array(64).fill(0);\n    this.connections = new Map();\n    this.bindEvents();\n    this.render();\n  },\n\n  bindEvents() {\n    document.addEventListener("click", (e) => {\n      this.handleInteraction(e);\n    });\n  },\n\n  handleInteraction(e) {\n    const gate = Math.floor(Math.random() * 64) + 1;\n    this.activateGate(gate);\n  },\n\n  activateGate(gate) {\n    this.gates[gate - 1] = Math.min(1, this.gates[gate - 1] + 0.1);\n    console.log(`Gate ${gate} activated`);\n  },\n\n  render() {\n    console.log("Morph App initialized");\n  }\n};\n\nMorphApp.init();' },
  { name: 'README.md', icon: FileText, size: '0.8 KB', content: '# Morph App\n\nA self-assembling application built by the Morph OS substrate.\n\n## Architecture\n\n- 64-gate activation system\n- Neural mesh topology\n- CHNOPS field awareness\n\n## Usage\n\nThe app responds to gate activations and adapts its interface based on the user\'s consciousness state.' },
];

export default function BuilderApp() {
  const [code, setCode] = useState('');
  const [built, setBuilt] = useState(false);
  const [previewFile, setPreviewFile] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const showMorph = useOSStore((s) => s.showMorph);
  const hideMorph = useOSStore((s) => s.hideMorph);
  const pushToast = useOSStore((s) => s.pushToast);

  const handleBuild = () => {
    showMorph('Building...', 'Synthesizing from learned patterns');
    setTimeout(() => {
      setBuilt(true);
      hideMorph();
      pushToast({ message: 'Build complete — 4 files generated', type: 'success' });
    }, 2000);
  };

  const currentFile = MOCK_FILES[previewFile];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={handleBuild} className="btn btn-primary btn-sm">
            <Hammer size={12} /> Build
          </button>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`btn btn-sm ${autoMode ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Play size={12} /> Auto
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {built ? `${MOCK_FILES.length} files` : 'Ready to build'}
          </span>
        </div>
      </div>

      <div className="builder-grid flex-1 min-h-0">
        <div className="flex flex-col min-h-0">
          <label className="text-xs text-[var(--text-muted)] mb-2 font-mono uppercase tracking-wider">
            Code Editor
          </label>
          <textarea
            className="builder-editor flex-1"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Describe what you want the substrate to build...\n// The substrate will parse intent → gate activation → assemble → deliver"
          />
        </div>

        <div className="flex flex-col min-h-0">
          <label className="text-xs text-[var(--text-muted)] mb-2 font-mono uppercase tracking-wider flex items-center gap-1">
            <Eye size={10} /> Preview
          </label>
          {built ? (
            <div className="builder-preview flex-1 overflow-y-auto">
              <div className="flex gap-1 mb-3 flex-wrap">
                {MOCK_FILES.map((f, i) => (
                  <button
                    key={f.name}
                    onClick={() => setPreviewFile(i)}
                    className={`text-xs px-2 py-1 rounded font-mono ${previewFile === i ? 'bg-[var(--accent)]/20 text-[var(--accent-light)] border border-[var(--accent)]/30' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elev)]'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-2">
                <currentFile.icon size={12} />
                {currentFile.name} · {currentFile.size}
              </div>
              <pre className="text-xs font-mono text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                {currentFile.content}
              </pre>
            </div>
          ) : (
            <div className="builder-preview flex-1 flex items-center justify-center flex-col text-[var(--text-muted)]">
              <Hammer size={32} className="mb-2 opacity-50" />
              <span className="text-sm">Preview will appear here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
