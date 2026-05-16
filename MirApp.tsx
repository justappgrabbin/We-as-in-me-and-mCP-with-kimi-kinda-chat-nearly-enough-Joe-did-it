import { useState } from 'react';
import { Search, Zap, Clock, Database } from 'lucide-react';

const MOCK_MEMORIES = [
  { id: '1', title: 'Gate 43 Activation Pattern', type: 'gate_memory', resonance: 0.94, date: '2026-05-10', tags: ['ajna', 'breakthrough'] },
  { id: '2', title: 'Federation Sync Log #1847', type: 'system_log', resonance: 0.78, date: '2026-05-11', tags: ['federation', 'mesh'] },
  { id: '3', title: 'CHNOPS Field Baseline', type: 'sensor_data', resonance: 0.85, date: '2026-05-09', tags: ['chnops', 'chemistry'] },
  { id: '4', title: 'Evolution Cycle Results', type: 'evolution_log', resonance: 0.91, date: '2026-05-08', tags: ['evolution', 'dna'] },
  { id: '5', title: 'Consciousness State Map', type: 'brain_map', resonance: 0.97, date: '2026-05-07', tags: ['consciousness', 'topology'] },
  { id: '6', title: 'Bedrock Strata Config', type: 'config', resonance: 0.72, date: '2026-05-06', tags: ['bedrock', 'linux'] },
  { id: '7', title: 'Dream Sequence #42', type: 'dream_log', resonance: 0.88, date: '2026-05-05', tags: ['dream', 'subconscious'] },
];

export default function MirApp() {
  const [query, setQuery] = useState('');
  const [selectedMem, setSelectedMem] = useState<string | null>(null);

  const filtered = MOCK_MEMORIES.filter((m) =>
    !query ||
    m.title.toLowerCase().includes(query.toLowerCase()) ||
    m.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const selected = MOCK_MEMORIES.find((m) => m.id === selectedMem);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <Search size={14} className="text-[var(--text-muted)]" />
        <input
          className="input flex-1 text-sm"
          placeholder="Search memories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono text-[var(--accent-light)]">{MOCK_MEMORIES.length}</div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Memories</div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 text-center">
          <div className="text-lg font-bold font-mono text-[var(--accent2)]">0.86</div>
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Avg Resonance</div>
        </div>
      </div>

      <div className="flex gap-3 flex-1 min-h-0">
        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-w-0">
          {filtered.map((mem) => (
            <button
              key={mem.id}
              onClick={() => setSelectedMem(mem.id === selectedMem ? null : mem.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${selectedMem === mem.id ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-light)]'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold truncate flex-1">{mem.title}</span>
                <span className="text-xs font-mono text-[var(--accent2)] flex-shrink-0 ml-2">{(mem.resonance * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Database size={10} /> {mem.type}
                <Clock size={10} /> {mem.date}
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {mem.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent-light)]">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Preview */}
        {selected && (
          <div className="w-48 flex-shrink-0 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 hidden sm:block">
            <Zap size={14} className="text-[var(--dim-design)] mb-2" />
            <h4 className="text-sm font-semibold mb-2">{selected.title}</h4>
            <div className="space-y-2 text-xs text-[var(--text-muted)]">
              <div>Type: <span className="text-[var(--text)]">{selected.type}</span></div>
              <div>Resonance: <span className="text-[var(--text)] font-mono">{selected.resonance}</span></div>
              <div>Date: <span className="text-[var(--text)]">{selected.date}</span></div>
              <div>Tags: <span className="text-[var(--text)]">{selected.tags.join(', ')}</span></div>
            </div>
            <div className="mt-4 h-1 bg-[var(--bg-deep)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]" style={{ width: `${selected.resonance * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
