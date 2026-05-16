import { useEffect, useState } from 'react';
import { Terminal, Shield, Settings } from 'lucide-react';
import useOSStore from '../store/useOSStore';

export default function Topbar() {
  const [clock, setClock] = useState('');
  const toggleTerminal = useOSStore((s) => s.toggleTerminal);
  const toggleAdmin = useOSStore((s) => s.toggleAdmin);
  const openSettings = useOSStore((s) => s.openSettings);
  const toggleFederationPanel = useOSStore((s) => s.toggleFederationPanel);
  const dimensions = useOSStore((s) => s.dimensions);
  const isAdmin = useOSStore((s) => s.isAdmin);
  const federationStatus = useOSStore((s) => s.federationStatus);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine status text
  const allHigh = Object.values(dimensions).every((v) => v > 50);
  const anyHigh = Object.values(dimensions).some((v) => v > 80);
  let statusText = 'MESH ONLINE';
  let statusClass = '';
  if (federationStatus === 'federated') {
    statusText = 'FEDERATED';
  } else if (anyHigh) {
    statusText = 'GATE ACTIVE';
    statusClass = 'status-dot-warn';
  } else if (allHigh) {
    statusText = 'EVOLVING';
    statusClass = 'status-dot-warn';
  }

  return (
    <div className="topbar">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #773cdd, #00d4aa)' }}
        >
          &#x25C8;
        </div>
        <div>
          <div className="topbar-title">Morph OS</div>
          <div className="topbar-version">v4.0 — Federated Substrate</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleFederationPanel} className="status-pill cursor-pointer hover:border-[var(--accent-light)] transition-colors">
          <span className={`status-dot ${statusClass}`} />
          <span>{statusText}</span>
        </button>

        <button
          onClick={toggleTerminal}
          className="p-2 rounded-lg hover:bg-[var(--bg-elev)] transition-colors"
          title="Neural Terminal (Ctrl+`)"
        >
          <Terminal size={16} className="text-[var(--text-muted)]" />
        </button>

        <button
          onClick={toggleAdmin}
          className={`p-2 rounded-lg transition-colors ${isAdmin ? 'bg-[var(--accent)]/20' : 'hover:bg-[var(--bg-elev)]'}`}
          title="Admin Mode (Ctrl+Shift+A)"
        >
          <Shield size={16} className={isAdmin ? 'text-[var(--accent-light)]' : 'text-[var(--text-muted)]'} />
        </button>

        <button
          onClick={openSettings}
          className="p-2 rounded-lg hover:bg-[var(--bg-elev)] transition-colors"
          title="Settings"
        >
          <Settings size={16} className="text-[var(--text-muted)]" />
        </button>

        <span className="text-sm font-mono text-[var(--text-muted)] ml-2">{clock}</span>
      </div>
    </div>
  );
}
