import { useState } from 'react';
import { X, Globe, Users, Server, Send, Search, Plus } from 'lucide-react';
import useOSStore from '../store/useOSStore';
import type { FedPost, FedVisibility } from '../types/os';

export default function FederationPanel() {
  const open = useOSStore((s) => s.federationPanelOpen);
  const toggle = useOSStore((s) => s.toggleFederationPanel);
  const identity = useOSStore((s) => s.federationIdentity);
  const status = useOSStore((s) => s.federationStatus);
  const timeline = useOSStore((s) => s.federationTimeline);
  const instances = useOSStore((s) => s.fedInstances);
  const peers = useOSStore((s) => s.federationPeers);
  const strata = useOSStore((s) => s.bedrockStrata);
  const toggleStratum = useOSStore((s) => s.toggleStratum);
  const addFedPost = useOSStore((s) => s.addFedPost);
  const pushToast = useOSStore((s) => s.pushToast);
  const [composerText, setComposerText] = useState('');
  const [visibility, setVisibility] = useState<FedVisibility>('public');
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoverFilter, setDiscoverFilter] = useState('');

  if (!open) return null;

  const handlePost = () => {
    if (!composerText.trim()) return;
    const post: FedPost = {
      id: `post-${Date.now()}`,
      author: 'You',
      handle: identity,
      avatar: '',
      content: composerText.trim(),
      timestamp: Date.now(),
      visibility,
      replies: 0,
      boosts: 0,
      likes: 0,
    };
    addFedPost(post);
    setComposerText('');
    pushToast({ message: 'Posted to federation', type: 'success' });
  };

  const filteredInstances = instances.filter(
    (i) =>
      !discoverFilter ||
      i.name.toLowerCase().includes(discoverFilter.toLowerCase()) ||
      i.category.toLowerCase().includes(discoverFilter.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <>
      <div className="federation-panel">
        <div className="fed-panel-header">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-[var(--accent-light)]" />
            <span className="font-bold text-[var(--text)]">Federation</span>
          </div>
          <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="fed-panel-body">
          {/* Identity Card */}
          <div className="fed-identity-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <div className="font-semibold text-sm">{identity}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'federated' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--warn)]/20 text-[var(--warn)]'}`}>
                    {status === 'federated' ? 'Federated' : 'Standalone'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded bg-[var(--accent)]/10 text-[var(--accent-light)] border border-[var(--accent)]/20">
                ActivityPub
              </span>
              <span className="text-xs px-2 py-1 rounded bg-[var(--accent2)]/10 text-[var(--accent2)] border border-[var(--accent2)]/20">
                AT Protocol
              </span>
              <span className="text-xs px-2 py-1 rounded bg-[var(--dim-design)]/10 text-[var(--dim-design)] border border-[var(--dim-design)]/20">
                Bedrock
              </span>
            </div>
          </div>

          {/* Post Composer */}
          <div className="fed-composer">
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="Share with the federation..."
            />
            <div className="flex items-center justify-between mt-2">
              <select
                className="select text-xs py-1 px-2"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as FedVisibility)}
              >
                <option value="public">Public</option>
                <option value="followers-only">Followers</option>
                <option value="direct">Direct</option>
                <option value="unlisted">Unlisted</option>
              </select>
              <button
                onClick={handlePost}
                disabled={!composerText.trim()}
                className="btn btn-primary btn-sm disabled:opacity-50"
              >
                <Send size={12} /> Post
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-[var(--border)] pb-2">
            <button className="text-xs font-semibold px-3 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent-light)]">
              Timeline
            </button>
            <button
              onClick={() => setShowDiscovery(!showDiscovery)}
              className="text-xs font-semibold px-3 py-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elev)] transition-colors"
            >
              {showDiscovery ? 'Instances' : 'Discovery'}
            </button>
          </div>

          {showDiscovery ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Search size={14} className="text-[var(--text-muted)]" />
                <input
                  className="input text-xs"
                  placeholder="Search instances..."
                  value={discoverFilter}
                  onChange={(e) => setDiscoverFilter(e.target.value)}
                />
              </div>
              {filteredInstances.map((inst) => (
                <div key={inst.id} className="fed-instance">
                  <div className={`fed-instance-dot ${inst.online ? 'online' : 'offline'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{inst.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{inst.domain} · {inst.category}</div>
                  </div>
                  <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
                    <Plus size={14} className="text-[var(--accent-light)]" />
                  </button>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Timeline */}
              {timeline.map((post) => (
                <div key={post.id} className="fed-post">
                  <div className="fed-post-header">
                    <div className="fed-avatar">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{post.author}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {post.handle} · {formatTime(post.timestamp)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text)] leading-relaxed">{post.content}</p>
                  <div className="fed-post-actions">
                    <span className="fed-post-action">
                      <MessageIcon /> {post.replies}
                    </span>
                    <span className="fed-post-action">
                      <BoostIcon /> {post.boosts}
                    </span>
                    <span className="fed-post-action">
                      <LikeIcon /> {post.likes}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Connected Peers */}
          <div className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <Users size={12} /> Connected Peers
          </div>
          {peers.map((peer) => (
            <div key={peer.id} className="fed-instance">
              <div className={`fed-instance-dot ${peer.status}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{peer.name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {peer.domain} · {peer.protocol} · {peer.messageCount} msgs
                </div>
              </div>
            </div>
          ))}

          {/* Bedrock Strata */}
          <div className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <Server size={12} /> Bedrock Strata
          </div>
          {strata.map((s) => (
            <div key={s.id} className="stratum-row">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {s.distro} · {s.packages.toLocaleString()} pkgs
                </div>
              </div>
              <div
                className={`stratum-toggle ${s.status === 'enabled' ? 'enabled' : ''}`}
                onClick={() => toggleStratum(s.id)}
              >
                <div className="stratum-toggle-knob" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[440]"
        onClick={toggle}
      />
    </>
  );
}

function MessageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BoostIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 11 12 6 7 11" /><polyline points="17 18 12 13 7 18" />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
