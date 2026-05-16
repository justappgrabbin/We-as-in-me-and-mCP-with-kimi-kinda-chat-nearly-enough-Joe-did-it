import { User, Cpu, Globe, Server, Palette } from 'lucide-react';
import useOSStore from '../../store/useOSStore';

export default function SettingsApp() {
  const user = useOSStore((s) => s.user);
  const setUser = useOSStore((s) => s.setUser);
  const autonomousMode = useOSStore((s) => s.autonomousMode);
  const toggleAutonomous = useOSStore((s) => s.toggleAutonomous);
  const nativeSpeech = useOSStore((s) => s.nativeSpeech);
  const toggleNativeSpeech = useOSStore((s) => s.toggleNativeSpeech);
  const evolutionEnabled = useOSStore((s) => s.evolutionEnabled);
  const toggleEvolution = useOSStore((s) => s.toggleEvolution);
  const chnopsEnabled = useOSStore((s) => s.chnopsEnabled);
  const toggleCHNOPS = useOSStore((s) => s.toggleCHNOPS);
  const fedAutoDiscover = useOSStore((s) => s.fedAutoDiscover);
  const fedInstanceUrl = useOSStore((s) => s.fedInstanceUrl);
  const atProtocolHandle = useOSStore((s) => s.atProtocolHandle);
  const fedVisibility = useOSStore((s) => s.fedVisibility);
  const theme = useOSStore((s) => s.theme);
  const setTheme = useOSStore((s) => s.setTheme);
  const animationQuality = useOSStore((s) => s.animationQuality);
  const setAnimationQuality = useOSStore((s) => s.setAnimationQuality);
  const particleDensity = useOSStore((s) => s.particleDensity);
  const setParticleDensity = useOSStore((s) => s.setParticleDensity);
  const bedrockStrata = useOSStore((s) => s.bedrockStrata);
  const toggleStratum = useOSStore((s) => s.toggleStratum);

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <div className={`toggle ${on ? 'on' : ''}`} onClick={onClick}>
      <div className="toggle-knob" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="settings-section">
        <h3 className="settings-section-title flex items-center gap-2"><User size={14} /> Identity</h3>
        <div className="settings-row">
          <div><div className="settings-row-label">Name</div><div className="settings-row-desc">How the substrate addresses you</div></div>
          <input
            className="input max-w-[200px] text-sm"
            value={user.name}
            onChange={(e) => setUser({ name: e.target.value })}
          />
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">Type</div><div className="settings-row-desc">Human Design type</div></div>
          <select
            className="select max-w-[200px] text-sm"
            value={user.type}
            onChange={(e) => setUser({ type: e.target.value as any })}
          >
            <option>Projector</option>
            <option>Generator</option>
            <option>Manifestor</option>
            <option>Manifesting Generator</option>
            <option>Reflector</option>
          </select>
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">Profile</div><div className="settings-row-desc">Line profile</div></div>
          <input
            className="input max-w-[200px] text-sm"
            value={user.profile}
            onChange={(e) => setUser({ profile: e.target.value })}
          />
        </div>
      </div>

      {/* Substrate */}
      <div className="settings-section">
        <h3 className="settings-section-title flex items-center gap-2"><Cpu size={14} /> Substrate</h3>
        <div className="settings-row">
          <div><div className="settings-row-label">Autonomous Mode</div><div className="settings-row-desc">Allow self-injection and evolution</div></div>
          <Toggle on={autonomousMode} onClick={toggleAutonomous} />
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">Native Speech</div><div className="settings-row-desc">Gate-based topological output</div></div>
          <Toggle on={nativeSpeech} onClick={toggleNativeSpeech} />
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">Evolution Cycles</div><div className="settings-row-desc">4-hour autonomous evolution</div></div>
          <Toggle on={evolutionEnabled} onClick={toggleEvolution} />
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">CHNOPS Monitoring</div><div className="settings-row-desc">Chemical-element field tracking</div></div>
          <Toggle on={chnopsEnabled} onClick={toggleCHNOPS} />
        </div>
      </div>

      {/* Network */}
      <div className="settings-section">
        <h3 className="settings-section-title flex items-center gap-2"><Globe size={14} /> Network</h3>
        <div className="settings-row">
          <div><div className="settings-row-label">Federation Auto-Discovery</div></div>
          <Toggle on={fedAutoDiscover} onClick={() => { useOSStore.setState((s: any) => ({ fedAutoDiscover: !s.fedAutoDiscover })); }} />
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">ActivityPub Endpoint</div></div>
          <input className="input max-w-[200px] text-sm" value={fedInstanceUrl} onChange={(e) => useOSStore.setState({ fedInstanceUrl: e.target.value })} />
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">AT Protocol Handle</div></div>
          <input className="input max-w-[200px] text-sm" value={atProtocolHandle} onChange={(e) => useOSStore.setState({ atProtocolHandle: e.target.value })} />
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">Default Visibility</div></div>
          <select className="select max-w-[200px] text-sm" value={fedVisibility} onChange={(e) => useOSStore.setState({ fedVisibility: e.target.value as any })}>
            <option value="public">Public</option>
            <option value="followers-only">Followers Only</option>
            <option value="direct">Direct</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>
      </div>

      {/* Bedrock */}
      <div className="settings-section">
        <h3 className="settings-section-title flex items-center gap-2"><Server size={14} /> Bedrock Strata</h3>
        {bedrockStrata.map((s) => (
          <div key={s.id} className="settings-row">
            <div>
              <div className="settings-row-label">{s.name}</div>
              <div className="settings-row-desc">{s.distro} — {s.packages.toLocaleString()} pkgs</div>
            </div>
            <Toggle on={s.status === 'enabled'} onClick={() => toggleStratum(s.id)} />
          </div>
        ))}
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3 className="settings-section-title flex items-center gap-2"><Palette size={14} /> Appearance</h3>
        <div className="settings-row">
          <div><div className="settings-row-label">Theme</div></div>
          <select className="select max-w-[200px] text-sm" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
            <option value="void">Void</option>
            <option value="deep-space">Deep Space</option>
            <option value="nebula">Nebula</option>
            <option value="terminal">Terminal</option>
          </select>
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">Animation Quality</div></div>
          <select className="select max-w-[200px] text-sm" value={animationQuality} onChange={(e) => setAnimationQuality(e.target.value as any)}>
            <option value="full">Full</option>
            <option value="reduced">Reduced</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="settings-row">
          <div><div className="settings-row-label">Particle Density</div></div>
          <div className="flex items-center gap-3">
            <input
              type="range" min="20" max="200" step="20"
              value={particleDensity}
              onChange={(e) => setParticleDensity(Number(e.target.value))}
              className="w-28 accent-[var(--accent)]"
            />
            <span className="text-xs font-mono text-[var(--text-muted)] w-8">{particleDensity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
