import { useState } from 'react';
import { DUAL_SERVER_ENDPOINTS, RENDER_BASE_URL } from '../../data/portedApps';
import { callSynthisEndpoint } from '../../lib/synthisClient';
import useOSStore from '../../store/useOSStore';

export default function RagConsoleApp() {
  const pushToast = useOSStore((s) => s.pushToast);
  const [selectedId, setSelectedId] = useState(DUAL_SERVER_ENDPOINTS[0]?.id || '');
  const selected = DUAL_SERVER_ENDPOINTS.find((endpoint) => endpoint.id === selectedId) || DUAL_SERVER_ENDPOINTS[0];
  const [payload, setPayload] = useState(JSON.stringify(selected?.payload || {}, null, 2));
  const [result, setResult] = useState('No request sent yet.');
  const [loading, setLoading] = useState(false);

  const selectEndpoint = (id: string) => {
    const endpoint = DUAL_SERVER_ENDPOINTS.find((item) => item.id === id);
    setSelectedId(id);
    setPayload(JSON.stringify(endpoint?.payload || {}, null, 2));
  };

  const send = async () => {
    if (!selected) return;
    setLoading(true);
    setResult('Sending request...');
    try {
      const options: RequestInit = selected.method === 'POST'
        ? { method: 'POST', body: payload || '{}' }
        : { method: 'GET' };
      const body = await callSynthisEndpoint(selected.path, options);
      setResult(JSON.stringify(body, null, 2));
      pushToast({ type: 'success', message: `${selected.name} returned` });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult(message);
      pushToast({ type: 'warn', message: `Backend request failed: ${selected.path}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
        <div className="text-lg font-bold">Dual Server / RAG Console</div>
        <div className="mt-1 text-xs text-[var(--text-muted)]">Render base URL: <span className="font-mono text-[var(--accent2)]">{RENDER_BASE_URL}</span></div>
        <div className="mt-2 text-xs text-[var(--text-muted)]">Imported from trident_dualserver_rag_endpoint_patch.zip as frontend integration scaffolding. Backend code preserved under integration payload notes.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 flex-1 min-h-0">
        <div className="space-y-2 overflow-y-auto pr-1">
          {DUAL_SERVER_ENDPOINTS.map((endpoint) => (
            <button
              key={endpoint.id}
              onClick={() => selectEndpoint(endpoint.id)}
              className={`w-full rounded-2xl border p-3 text-left ${selected?.id === endpoint.id ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-light)]'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold">{endpoint.name}</div>
                <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] font-mono text-[var(--text-muted)]">{endpoint.method}</span>
              </div>
              <div className="mt-1 font-mono text-xs text-[var(--accent2)]">{endpoint.path}</div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{endpoint.desc}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
            <div className="flex flex-col min-h-0 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="mb-2 text-xs uppercase tracking-wider text-[var(--text-muted)]">Request Payload</div>
              <textarea
                className="builder-editor min-h-[260px] flex-1"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                disabled={selected.method === 'GET'}
              />
              <button className="btn btn-primary btn-sm mt-3" onClick={send} disabled={loading}>{loading ? 'Sending...' : `Send ${selected.method}`}</button>
            </div>
            <div className="flex flex-col min-h-0 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="mb-2 text-xs uppercase tracking-wider text-[var(--text-muted)]">Response</div>
              <pre className="flex-1 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--bg-void)] p-3 text-xs leading-relaxed whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
