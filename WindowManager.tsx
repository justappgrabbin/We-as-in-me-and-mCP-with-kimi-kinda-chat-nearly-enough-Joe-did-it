import useOSStore from '../store/useOSStore';
import type { AppId } from '../types/os';
import { Minus, Square, X } from 'lucide-react';

// Import app windows
import ChatApp from './AppWindows/ChatApp';
import IngestApp from './AppWindows/IngestApp';
import BuilderApp from './AppWindows/BuilderApp';
import BrowserApp from './AppWindows/BrowserApp';
import TerminalApp from './AppWindows/TerminalApp';
import ChartApp from './AppWindows/ChartApp';
import MeshApp from './AppWindows/MeshApp';
import SettingsApp from './AppWindows/SettingsApp';
import MirApp from './AppWindows/MirApp';
import LibraryApp from './AppWindows/LibraryApp';
import GameApp from './AppWindows/GameApp';
import FairyApp from './AppWindows/FairyApp';
import AppStoreApp from './AppWindows/AppStoreApp';
import AppCenterApp from './AppWindows/AppCenterApp';
import RagConsoleApp from './AppWindows/RagConsoleApp';

const APP_ICONS: Record<AppId, string> = {
  chat: '💬', ingest: '📥', builder: '🔧', browser: '🌐',
  terminal: '⌨️', chart: '✨', mesh: '🔗', settings: '⚙️',
  mir: '🔮', library: '📚', game: '🎮', fairy: '🧚',
  appstore: '🛒', appcenter: '🏪', rag: '🛰️',
};

const APP_NAMES: Record<AppId, string> = {
  chat: 'Chat', ingest: 'Ingest', builder: 'Builder', browser: 'Browser',
  terminal: 'Terminal', chart: 'Chart', mesh: 'Mesh', settings: 'Settings',
  mir: 'MIR', library: 'Library', game: 'Game', fairy: 'Fairy',
  appstore: 'App Store', appcenter: 'App Center', rag: 'Dual Server',
};

export default function WindowManager() {
  const activeWindow = useOSStore((s) => s.activeWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const toggleMaximize = useOSStore((s) => s.toggleMaximize);
  const windowMaximized = useOSStore((s) => s.windowMaximized);

  if (!activeWindow) return null;

  const renderApp = () => {
    switch (activeWindow) {
      case 'chat': return <ChatApp />;
      case 'ingest': return <IngestApp />;
      case 'builder': return <BuilderApp />;
      case 'browser': return <BrowserApp />;
      case 'terminal': return <TerminalApp />;
      case 'chart': return <ChartApp />;
      case 'mesh': return <MeshApp />;
      case 'settings': return <SettingsApp />;
      case 'mir': return <MirApp />;
      case 'library': return <LibraryApp />;
      case 'game': return <GameApp />;
      case 'fairy': return <FairyApp />;
      case 'appstore': return <AppStoreApp />;
      case 'appcenter': return <AppCenterApp />;
      case 'rag': return <RagConsoleApp />;
      default: return null;
    }
  };

  return (
    <div className="window-overlay" onClick={closeWindow}>
      <div
        className={`window-container ${windowMaximized ? 'maximized' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="window-header">
          <div className="window-title">
            <span>{APP_ICONS[activeWindow]}</span>
            {APP_NAMES[activeWindow]}
          </div>
          <div className="window-controls">
            <button className="window-btn min" onClick={closeWindow} title="Minimize">
              <Minus size={12} />
            </button>
            <button className="window-btn max" onClick={toggleMaximize} title="Maximize">
              <Square size={10} />
            </button>
            <button className="window-btn close" onClick={closeWindow} title="Close">
              <X size={12} />
            </button>
          </div>
        </div>
        <div className="window-body">{renderApp()}</div>
      </div>
    </div>
  );
}
