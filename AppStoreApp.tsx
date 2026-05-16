import { useMemo, useState } from 'react';
import { Copy, Download, ExternalLink, Play, Search } from 'lucide-react';
import useOSStore from '../../store/useOSStore';

export default function AppStoreApp() {
  const portedApps = useOSStore((s) => s.portedApps);
  const installedAppIds = useOSStore((s) => s.installedAppIds);
  const installPortedApp = useOSStore((s) => s.installPortedApp);
  const uninstallPortedApp = useOSStore((s) => s.uninstallPortedApp);
  const pushToast = useOSStore((s) => s.pushToast);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(portedApps[0]?.id || '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return portedApps;
    return portedApps.filter((app) =>
      [app.name, app.desc, app.type, app.source, ...app.tags].join(' ').toLowerCase().includes(q)
    );
  }, [portedApps, query]);

  const active = portedApps.find((app) => app.id === activeId) || filtered[0] || portedApps[0];
  const installed = active ? installedAppIds.includes(active.id) : false;

  const copyCode = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.code);
    pushToast({ type: 'success', message: `${active.name} code copied` });
  };

  const openStandalone = () => {
    if (!active) return;
    const blob = new Blob([active.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold">App Store</div>
          <div className="text-xs text-[var(--text-muted)]">Ported Expo gallery apps preserved as runnable HTML capsules.</div>
        </div>
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search capsules..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 flex-1 min-h-0">
        <div className="space-y-2 overflow-y-auto pr-1">
          {filtered.map((app) => (
            <button
              key={app.id}
              onClick={() => setActiveId(app.id)}
              className={`w-full text-left rounded-2xl border p-3 transition ${active?.id === app.id ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-light)]'}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{app.icon}</div>
                <div className="min-w-0">
                  <div className="font-bold truncate">{app.name}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{app.type} · {installedAppIds.includes(app.id) ? 'installed' : 'available'}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2">{app.desc}</p>
            </button>
          ))}
        </div>

        {active && (
          <div className="flex flex-col min-h-0 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
              <div>
                <div className="flex items-center gap-2 text-xl font-bold"><span>{active.icon}</span>{active.name}</div>
                <div className="text-xs text-[var(--text-muted)]">Source: {active.source}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-ghost btn-sm" onClick={copyCode}><Copy size={12} /> Copy</button>
                <button className="btn btn-ghost btn-sm" onClick={openStandalone}><ExternalLink size={12} /> Open</button>
                <button
                  className={`btn btn-sm ${installed ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => installed ? uninstallPortedApp(active.id) : installPortedApp(active.id)}
                >
                  {installed ? <Download size={12} /> : <Play size={12} />}
                  {installed ? 'Remove' : 'Install'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 flex-1 min-h-0">
              <div className="flex flex-col min-h-[320px]">
                <div className="mb-2 text-xs uppercase tracking-wider text-[var(--text-muted)]">Live Preview</div>
                <iframe
                  title={`${active.name} preview`}
                  sandbox="allow-scripts allow-forms allow-pointer-lock"
                  srcDoc={active.code}
                  className="h-full min-h-[320px] w-full rounded-xl border border-[var(--border)] bg-black"
                />
              </div>
              <div className="flex flex-col min-h-[320px]">
                <div className="mb-2 text-xs uppercase tracking-wider text-[var(--text-muted)]">Capsule Code</div>
                <pre className="h-full min-h-[320px] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--bg-void)] p-3 text-xs leading-relaxed text-[var(--text)] whitespace-pre-wrap">{active.code}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
