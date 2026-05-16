import useOSStore from '../store/useOSStore';
import type { AppId } from '../types/os';

const APPS: { id: string; name: string; icon: string; dynamic?: boolean }[] = [
  { id: 'chat', name: 'Chat', icon: '💬' },
  { id: 'ingest', name: 'Ingest', icon: '📥' },
  { id: 'builder', name: 'Builder', icon: '🔧', dynamic: true },
  { id: 'browser', name: 'Browser', icon: '🌐' },
  { id: 'terminal', name: 'Terminal', icon: '⌨️' },
  { id: 'chart', name: 'Chart', icon: '✨' },
  { id: 'mesh', name: 'Mesh', icon: '🔗' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
  { id: 'mir', name: 'MIR', icon: '🔮' },
  { id: 'library', name: 'Library', icon: '📚' },
  { id: 'game', name: 'Game', icon: '🎮' },
  { id: 'fairy', name: 'Fairy', icon: '🧚', dynamic: true },
  { id: 'appstore', name: 'App Store', icon: '🛒', dynamic: true },
  { id: 'appcenter', name: 'App Center', icon: '🏪', dynamic: true },
  { id: 'rag', name: 'Dual Server', icon: '🛰️', dynamic: true },
];

export default function AppGrid() {
  const openWindow = useOSStore((s) => s.openWindow);

  return (
    <div className="app-grid">
      {APPS.map((app) => (
        <button
          key={app.id}
          className={`app-item ${app.dynamic ? 'dynamic' : ''}`}
          onClick={() => openWindow(app.id as AppId)}
        >
          <div className="app-icon-wrap">{app.icon}</div>
          <span className="app-label">{app.name}</span>
        </button>
      ))}
    </div>
  );
}
