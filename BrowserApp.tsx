import { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Bookmark, Lock } from 'lucide-react';

const DEFAULT_PAGE = `
  <div style="font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto; color: #333;">
    <h1 style="font-size: 28px; margin-bottom: 20px; color: #773cdd;">🌐 Federation Dashboard</h1>
    <p style="margin-bottom: 20px; line-height: 1.6;">Welcome to the Morph OS web navigator. Browse the federation and external resources from here.</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
      <a href="#" style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 12px; text-decoration: none; color: inherit; display: block;">
        <h3 style="font-size: 16px; margin-bottom: 4px; color: #773cdd;">Substrate Core</h3>
        <p style="font-size: 12px; color: #666;">Primary Morph OS federation hub</p>
      </a>
      <a href="#" style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 12px; text-decoration: none; color: inherit; display: block;">
        <h3 style="font-size: 16px; margin-bottom: 4px; color: #00d4aa;">Neural Mesh</h3>
        <p style="font-size: 12px; color: #666;">Distributed neural network nodes</p>
      </a>
      <a href="#" style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 12px; text-decoration: none; color: inherit; display: block;">
        <h3 style="font-size: 16px; margin-bottom: 4px; color: #8b5cf6;">Ancient Mesh</h3>
        <p style="font-size: 12px; color: #666;">I Ching and Human Design knowledge</p>
      </a>
      <a href="#" style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 12px; text-decoration: none; color: inherit; display: block;">
        <h3 style="font-size: 16px; margin-bottom: 4px; color: #f59e0b;">Bedrock Hub</h3>
        <p style="font-size: 12px; color: #666;">Linux distribution stratum layer</p>
      </a>
    </div>
    <div style="margin-top: 40px; padding: 20px; background: #f8f8f8; border-radius: 12px;">
      <h2 style="font-size: 18px; margin-bottom: 10px;">ActivityPub Resources</h2>
      <ul style="font-size: 14px; line-height: 1.8; color: #555;">
        <li><a href="https://www.w3.org/TR/activitypub/" style="color: #773cdd;">ActivityPub Spec (W3C)</a></li>
        <li><a href="https://docs.joinmastodon.org/" style="color: #773cdd;">Mastodon API Docs</a></li>
        <li><a href="https://github.com/bedrocklinux/" style="color: #773cdd;">Bedrock Linux GitHub</a></li>
        <li><a href="https://atproto.com/" style="color: #773cdd;">AT Protocol (Bluesky)</a></li>
      </ul>
    </div>
  </div>
`;

export default function BrowserApp() {
  const [url, setUrl] = useState('federation://dashboard');
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <button className="p-1.5 rounded hover:bg-[var(--bg-elev)] transition-colors">
          <ArrowLeft size={14} className="text-[var(--text-muted)]" />
        </button>
        <button className="p-1.5 rounded hover:bg-[var(--bg-elev)] transition-colors">
          <ArrowRight size={14} className="text-[var(--text-muted)]" />
        </button>
        <button className="p-1.5 rounded hover:bg-[var(--bg-elev)] transition-colors" onClick={handleNavigate}>
          <RefreshCw size={14} className={`text-[var(--text-muted)] ${loading ? 'animate-spin' : ''}`} />
        </button>
        <div className="flex items-center gap-2 flex-1 bg-[var(--bg-void)] border border-[var(--border)] rounded-lg px-3 py-1.5">
          <Lock size={12} className="text-[var(--success)] flex-shrink-0" />
          <input
            className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--text)] font-mono"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          />
        </div>
        <button className="p-1.5 rounded hover:bg-[var(--bg-elev)] transition-colors">
          <Bookmark size={14} className="text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 bg-white rounded-lg border border-[var(--border)] overflow-hidden">
        <iframe
          srcDoc={DEFAULT_PAGE}
          className="w-full h-full border-none"
          title="Browser"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
