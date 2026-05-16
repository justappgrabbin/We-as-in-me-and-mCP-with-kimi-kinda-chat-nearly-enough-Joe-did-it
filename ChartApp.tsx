import { useState } from 'react';
import { Sun, Moon, Star } from 'lucide-react';
import useOSStore from '../../store/useOSStore';

const CENTER_POSITIONS = [
  { id: 'head', x: 150, y: 40, label: 'Head' },
  { id: 'ajna', x: 150, y: 90, label: 'Ajna' },
  { id: 'throat', x: 150, y: 140, label: 'Throat' },
  { id: 'g-center', x: 100, y: 180, label: 'G' },
  { id: 'sacral', x: 150, y: 240, label: 'Sacral' },
  { id: 'root', x: 210, y: 280, label: 'Root' },
  { id: 'spleen', x: 50, y: 220, label: 'Spleen' },
  { id: 'solar', x: 200, y: 200, label: 'Solar' },
  { id: 'heart', x: 250, y: 160, label: 'Heart' },
];

const CHANNELS = [
  ['head', 'ajna'], ['ajna', 'throat'], ['throat', 'g-center'],
  ['throat', 'sacral'], ['g-center', 'sacral'], ['sacral', 'root'],
  ['spleen', 'sacral'], ['solar', 'sacral'], ['heart', 'g-center'],
];

export default function ChartApp() {
  const [chartType, setChartType] = useState<'tropical' | 'sidereal' | 'draconic'>('tropical');
  const [generated, setGenerated] = useState(false);
  const showMorph = useOSStore((s) => s.showMorph);
  const hideMorph = useOSStore((s) => s.hideMorph);
  const pushToast = useOSStore((s) => s.pushToast);

  const handleGenerate = (type: 'tropical' | 'sidereal' | 'draconic') => {
    setChartType(type);
    showMorph(`Generating ${type} chart...`, 'Computing ephemeris data');
    setTimeout(() => {
      setGenerated(true);
      hideMorph();
      pushToast({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} chart generated`, type: 'success' });
    }, 1200);
  };

  const activeGates = [43, 23, 10, 4, 14, 34];
  const definedCenters = ['ajna', 'throat', 'sacral'];

  return (
    <div className="flex flex-col h-full">
      {/* Chart Display */}
      <div className="chart-display mb-4">
        {generated ? (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent">
                BodyGraph
              </h3>
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider bg-[var(--accent)]/10 px-2 py-1 rounded">
                {chartType}
              </span>
            </div>
            <svg viewBox="0 0 300 320" className="w-full max-w-[300px] mx-auto">
              {/* Channels */}
              {CHANNELS.map(([from, to], i) => {
                const fromCenter = CENTER_POSITIONS.find((c) => c.id === from);
                const toCenter = CENTER_POSITIONS.find((c) => c.id === to);
                if (!fromCenter || !toCenter) return null;
                const isDefined = definedCenters.includes(from) && definedCenters.includes(to);
                return (
                  <line
                    key={i}
                    x1={fromCenter.x} y1={fromCenter.y}
                    x2={toCenter.x} y2={toCenter.y}
                    stroke={isDefined ? '#773cdd' : '#2a1f3d'}
                    strokeWidth={isDefined ? 3 : 1}
                    opacity={isDefined ? 0.8 : 0.3}
                  />
                );
              })}
              {/* Centers */}
              {CENTER_POSITIONS.map((center) => {
                const isDefined = definedCenters.includes(center.id);
                return (
                  <g key={center.id}>
                    <circle
                      cx={center.x} cy={center.y} r={22}
                      fill={isDefined ? 'rgba(119,60,221,0.15)' : 'rgba(26,16,37,0.8)'}
                      stroke={isDefined ? '#773cdd' : '#2a1f3d'}
                      strokeWidth={2}
                    />
                    <text
                      x={center.x} y={center.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isDefined ? '#e8e0f0' : '#8a7a9e'}
                      fontSize="10"
                      fontFamily="system-ui"
                      fontWeight="600"
                    >
                      {center.label}
                    </text>
                  </g>
                );
              })}
              {/* Active gate markers */}
              {activeGates.map((gate, i) => {
                const angle = (gate / 64) * Math.PI * 2 - Math.PI / 2;
                const radius = 140;
                const x = 150 + Math.cos(angle) * radius;
                const y = 160 + Math.sin(angle) * radius;
                return (
                  <g key={`gate-${i}`}>
                    <circle cx={x} cy={y} r={5} fill="#00d4aa" opacity={0.8} />
                    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="#06040b" fontSize="7" fontWeight="bold">
                      {gate}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex justify-center gap-4 mt-3 text-xs font-mono text-[var(--text-muted)]">
              <span>Gate: 43.1 → 23.3 → 10.4</span>
              <span>|</span>
              <span>Color: Hope</span>
              <span>|</span>
              <span>Tone: Action</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--text-muted)]">
            <Star size={32} className="mx-auto mb-2 opacity-50" />
            <p>Select a chart type to generate your BodyGraph</p>
          </div>
        )}
      </div>

      {/* Chart Types */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        <button onClick={() => handleGenerate('tropical')} className="chart-type-card">
          <Sun size={20} className="text-[var(--dim-design)] mx-auto mb-2" />
          <div className="text-sm font-semibold">Tropical</div>
          <div className="text-xs text-[var(--text-muted)]">Body · Seasonal zodiac</div>
        </button>
        <button onClick={() => handleGenerate('sidereal')} className="chart-type-card">
          <Moon size={20} className="text-[var(--dim-being)] mx-auto mb-2" />
          <div className="text-sm font-semibold">Sidereal</div>
          <div className="text-xs text-[var(--text-muted)]">Mind · Fixed stars</div>
        </button>
        <button onClick={() => handleGenerate('draconic')} className="chart-type-card">
          <Star size={20} className="text-[var(--dim-evolution)] mx-auto mb-2" />
          <div className="text-sm font-semibold">Draconic</div>
          <div className="text-xs text-[var(--text-muted)]">Heart · Soul purpose</div>
        </button>
      </div>

      {/* Profile */}
      {generated && (
        <div className="mt-4 p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--text-muted)] flex-shrink-0">
          <div className="flex gap-4 flex-wrap">
            <span>Type: <span className="text-[var(--text)]">Projector</span></span>
            <span>Authority: <span className="text-[var(--text)]">Splenic</span></span>
            <span>Definition: <span className="text-[var(--text)]">Split</span></span>
            <span>Profile: <span className="text-[var(--text)]">1/3</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
