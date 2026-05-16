import { useEffect, useState } from 'react';
import useOSStore from '../store/useOSStore';

const PHASES = [
  'VOID', 'MOVEMENT', 'EVOLUTION', 'BEING', 'DESIGN',
  'SPACE', '9 CENTERS', '64 HEXAGRAMS', '384 LINES'
];

export default function BootScreen() {
  const [phase, setPhase] = useState(-1);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const setBootComplete = useOSStore((s) => s.setBootComplete);
  const setBootPhase = useOSStore((s) => s.setBootPhase);

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    // Start boot sequence
    timeouts.push(setTimeout(() => {
      let currentPhase = 0;

      const advance = () => {
        setPhase(currentPhase);
        setBootPhase(currentPhase);

        if (currentPhase < PHASES.length - 1) {
          const delay = 400 + Math.random() * 300;
          currentPhase++;
          timeouts.push(setTimeout(advance, delay));
        } else {
          // All phases complete, fade out
          timeouts.push(setTimeout(() => {
            setDone(true);
            timeouts.push(setTimeout(() => {
              setVisible(false);
              setBootComplete(true);
            }, 1500));
          }, 800));
        }
      };

      advance();
    }, 600));

    return () => {
      for (const t of timeouts) clearTimeout(t);
    };
  }, [setBootComplete, setBootPhase]);

  if (!visible) return null;

  const progress = phase >= 0 ? ((phase + 1) / PHASES.length) * 100 : 0;

  return (
    <div className={`boot-screen ${done ? 'done' : ''}`}>
      <div className="boot-core">&#x25C8;</div>
      <div className="boot-title">Morph OS</div>
      <div className="boot-subtitle">v4.0 — Federated Substrate</div>
      <div className="boot-progress">
        <div className="boot-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="boot-phases">
        {PHASES.map((name, i) => (
          <div
            key={name}
            className={`boot-phase ${i === phase ? 'active' : ''} ${i < phase ? 'complete' : ''}`}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
