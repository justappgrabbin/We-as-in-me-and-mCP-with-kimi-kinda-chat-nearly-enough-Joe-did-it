import useOSStore from '../../store/useOSStore';

export default function AppCenterApp() {
  const portedApps = useOSStore((s) => s.portedApps);
  const installedAppIds = useOSStore((s) => s.installedAppIds);
  const openWindow = useOSStore((s) => s.openWindow);
  const installed = portedApps.filter((app) => installedAppIds.includes(app.id));
  const available = portedApps.length;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Installed Capsules</div>
          <div className="mt-2 text-3xl font-bold text-[var(--accent2)]">{installed.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Available Ports</div>
          <div className="mt-2 text-3xl font-bold text-[var(--accent-light)]">{available}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Backend</div>
          <div className="mt-2 text-sm font-mono text-[var(--success)]">dual-server ready</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold">App Center</div>
          <div className="text-xs text-[var(--text-muted)]">Installed app capsules plus the OS integration bridge.</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => openWindow('appstore')}>Open Store</button>
          <button className="btn btn-ghost btn-sm" onClick={() => openWindow('rag')}>Dual Server</button>
        </div>
      </div>

      {installed.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] text-center text-[var(--text-muted)]">
          <div>
            <div className="text-3xl mb-2">📦</div>
            <div>No capsules installed yet.</div>
            <button className="btn btn-primary btn-sm mt-4" onClick={() => openWindow('appstore')}>Install from App Store</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-1">
          {installed.map((app) => (
            <div key={app.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{app.icon}</div>
                <div>
                  <div className="font-bold">{app.name}</div>
                  <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{app.type}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--text-muted)]">{app.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--text-muted)]">{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
