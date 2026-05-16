import useOSStore from '../store/useOSStore';
import type { AppId } from '../types/os';

const DOCK_ITEMS: { id: AppId | 'home'; icon: string; label: string; isHome?: boolean }[] = [
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'ingest', icon: '📥', label: 'Ingest' },
  { id: 'builder', icon: '🔧', label: 'Builder' },
  { id: 'home', icon: '\u25C8', label: 'Home', isHome: true },
  { id: 'chart', icon: '✨', label: 'Chart' },
  { id: 'appcenter', icon: '🏪', label: 'App Center' },
  { id: 'rag', icon: '🛰️', label: 'Dual Server' },
];

export default function Dock() {
  const openWindow = useOSStore((s) => s.openWindow);
  const goHome = useOSStore((s) => s.goHome);
  const activeWindow = useOSStore((s) => s.activeWindow);

  return (
    <div className="dock">
      {DOCK_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`dock-item ${item.isHome ? 'home' : ''} ${activeWindow === item.id ? 'active' : ''}`}
          onClick={() => {
            if (item.id === 'home') goHome();
            else openWindow(item.id as AppId);
          }}
          title={item.label}
        >
          <span style={{ fontSize: item.isHome ? '28px' : '24px', filter: item.isHome ? 'none' : 'saturate(0.8)' }}>
            {item.icon}
          </span>
          {!item.isHome && activeWindow === item.id && <div className="dock-dot" />}
        </button>
      ))}
    </div>
  );
}
