import { useState } from 'react';
import { Search, FileText, Code, Image, BookOpen } from 'lucide-react';

const CATEGORIES = ['All', 'Documents', 'Code', 'Media', 'Federation', 'System'];

const MOCK_ITEMS = [
  { id: '1', title: 'Morph OS Architecture v4.0', category: 'Documents', type: 'pdf', size: '2.4 MB', date: '2026-05-01' },
  { id: '2', title: 'Gate Topology Reference', category: 'Documents', type: 'pdf', size: '1.8 MB', date: '2026-04-28' },
  { id: '3', title: 'main.rs — Substrate Core', category: 'Code', type: 'rust', size: '45 KB', date: '2026-05-10' },
  { id: '4', title: 'neural_bridge.py', category: 'Code', type: 'python', size: '28 KB', date: '2026-05-09' },
  { id: '5', title: 'BodyGraph_Sidereal.svg', category: 'Media', type: 'svg', size: '120 KB', date: '2026-05-05' },
  { id: '6', title: 'Consciousness_Field_Audio', category: 'Media', type: 'audio', size: '14 MB', date: '2026-04-30' },
  { id: '7', title: 'Federation_Protocol_Spec', category: 'Federation', type: 'md', size: '18 KB', date: '2026-05-08' },
  { id: '8', title: 'Bedrock_Strata_Config.json', category: 'System', type: 'json', size: '4 KB', date: '2026-05-11' },
  { id: '9', title: 'CHNOPS_Baseline_Log', category: 'System', type: 'csv', size: '2.1 MB', date: '2026-05-07' },
  { id: '10', title: 'Evolution_DNA_Snapshot', category: 'System', type: 'bin', size: '8.5 MB', date: '2026-05-06' },
];

export default function LibraryApp() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = MOCK_ITEMS.filter(
    (item) =>
      (category === 'All' || item.category === category) &&
      (!query || item.title.toLowerCase().includes(query.toLowerCase()))
  );

  const typeIcon = (type: string) => {
    if (type === 'pdf' || type === 'md') return <BookOpen size={14} className="text-[var(--warn)]" />;
    if (['rust', 'python', 'json'].includes(type)) return <Code size={14} className="text-[var(--accent2)]" />;
    if (['svg', 'audio'].includes(type)) return <Image size={14} className="text-[var(--dim-being)]" />;
    return <FileText size={14} className="text-[var(--text-muted)]" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Search size={14} className="text-[var(--text-muted)]" />
        <input
          className="input flex-1 text-sm"
          placeholder="Search library..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto flex-shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${category === cat ? 'bg-[var(--accent)]/20 text-[var(--accent-light)] border border-[var(--accent)]/30' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--border-light)]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-deep)] flex items-center justify-center flex-shrink-0">
              {typeIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{item.title}</div>
              <div className="text-xs text-[var(--text-muted)] flex gap-2">
                <span>{item.type.toUpperCase()}</span>
                <span>·</span>
                <span>{item.size}</span>
                <span>·</span>
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
