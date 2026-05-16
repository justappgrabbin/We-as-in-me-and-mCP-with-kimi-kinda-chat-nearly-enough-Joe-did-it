import { useEffect } from 'react';
import { Activity, Brain, Heart, Compass, Sparkles } from 'lucide-react';
import useOSStore from '../store/useOSStore';

const WIDGETS = [
  { key: 'movement', label: 'MOVEMENT', icon: Activity, color: 'var(--dim-movement)', sub: 'energy / action' },
  { key: 'evolution', label: 'EVOLUTION', icon: Brain, color: 'var(--dim-evolution)', sub: 'pattern / mind' },
  { key: 'being', label: 'BEING', icon: Heart, color: 'var(--dim-being)', sub: 'essence / heart' },
  { key: 'design', label: 'DESIGN', icon: Compass, color: 'var(--dim-design)', sub: 'structure / soul' },
  { key: 'space', label: 'SPACE', icon: Sparkles, color: 'var(--dim-space)', sub: 'relation / spirit' },
];

export default function WidgetArea() {
  const dimensions = useOSStore((s) => s.dimensions);
  const setDimension = useOSStore((s) => s.setDimension);

  useEffect(() => {
    const interval = setInterval(() => {
      for (const w of WIDGETS) {
        const current = dimensions[w.key as keyof typeof dimensions];
        const delta = (Math.random() - 0.5) * 10;
        setDimension(w.key, Math.max(0, Math.min(100, current + delta)));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [dimensions, setDimension]);

  return (
    <div className="widget-row">
      {WIDGETS.map((w) => {
        const value = Math.round(dimensions[w.key as keyof typeof dimensions]);
        const isHigh = value > 80;
        return (
          <div
            key={w.key}
            className="widget"
            style={{
              ['--dim-color' as string]: w.color,
              boxShadow: isHigh ? `0 0 16px ${w.color}30` : 'none',
            }}
          >
            <div className="widget-header">
              <w.icon size={12} style={{ color: w.color }} />
              {w.label}
            </div>
            <div className="widget-value" style={{ color: w.color }}>{value}</div>
            <div className="widget-sub">{w.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
