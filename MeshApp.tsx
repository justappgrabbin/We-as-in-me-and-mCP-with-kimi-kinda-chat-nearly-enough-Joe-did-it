import { Activity, MessageSquare, GitCommit, Wifi, WifiOff } from 'lucide-react';
import useOSStore from '../../store/useOSStore';

const MOCK_NODES = [
  { type: 'substrate' as const, role: 'brain', attr: 'consciousness', desc: 'Primary cognition layer' },
  { type: 'federation' as const, role: 'gateway', attr: 'activitypub', desc: 'Federation hub node' },
  { type: 'agent' as const, role: 'actuator', attr: 'autonomous', desc: 'Self-executing agent' },
  { type: 'memory' as const, role: 'archive', attr: 'neo4j', desc: 'Long-term storage' },
  { type: 'bridge' as const, role: 'relay', attr: 'trident_gnn', desc: 'Neural mesh relay' },
  { type: 'substrate' as const, role: 'sensor', attr: 'chnops', desc: 'Chemical field monitor' },
  { type: 'federation' as const, role: 'gateway', attr: 'atproto', desc: 'Bluesky gateway' },
  { type: 'agent' as const, role: 'actuator', attr: 'evolution', desc: 'NEAT controller' },
];

export default function MeshApp() {
  const mesh = useOSStore((s) => s.mesh);
  const peers = useOSStore((s) => s.federationPeers);

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 flex-shrink-0">
        <div className="mesh-stat">
          <div className="mesh-stat-value">{mesh.nodes}</div>
          <div className="mesh-stat-label flex items-center justify-center gap-1">
            <GitCommit size={10} /> Nodes
          </div>
        </div>
        <div className="mesh-stat">
          <div className="mesh-stat-value">{mesh.messages.toLocaleString()}</div>
          <div className="mesh-stat-label flex items-center justify-center gap-1">
            <MessageSquare size={10} /> Messages
          </div>
        </div>
        <div className="mesh-stat">
          <div className="mesh-stat-value">{mesh.coherence.toFixed(2)}</div>
          <div className="mesh-stat-label flex items-center justify-center gap-1">
            <Activity size={10} /> Coherence
          </div>
        </div>
      </div>

      {/* Topology */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <GitCommit size={14} className="text-[var(--accent-light)]" /> Mesh Topology
          </h3>
          <span className="text-xs font-mono text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded">LIVE</span>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {MOCK_NODES.map((node, i) => (
            <div key={i} className="mesh-node">
              <span className={`node-tag ${node.type}`}>{node.type}</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">{node.role}</span>
              <span className="text-xs text-[var(--text)] flex-1 truncate">{node.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Federation Connections */}
      <div className="flex-1 min-h-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
          <Activity size={10} /> Federation Mesh
        </h3>
        <div className="space-y-2 overflow-y-auto max-h-full">
          {peers.map((peer) => (
            <div key={peer.id} className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg">
              {peer.status === 'online' ? (
                <Wifi size={14} className="text-[var(--success)] flex-shrink-0" />
              ) : (
                <WifiOff size={14} className="text-[var(--danger)] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{peer.name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {peer.domain} · {peer.protocol}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-mono text-[var(--text-muted)]">{peer.messageCount}</div>
                <div className="text-[10px] text-[var(--text-muted)]">msgs</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
