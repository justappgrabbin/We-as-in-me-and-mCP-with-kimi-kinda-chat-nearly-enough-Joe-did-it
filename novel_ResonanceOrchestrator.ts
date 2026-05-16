/**
 * RESONANCE ORCHESTRATOR — NOVEL ARCHITECTURE EDITION
 *
 * NOT a merge of two systems. A genuinely new substrate where:
 * - Architecture emerges from user's Human Design (gate/line/color/tone/base/profile)
 * - Novel structural forms are created, not recombined
 * - Every interaction updates the user's resonance signature
 * - The system self-modifies based on confidence thresholds
 * - Connected to Synthia server on Render
 *
 * CORE PRINCIPLE:
 * The user IS the architecture. Their design determines how the mesh grows,
 * how nodes connect, what patterns become attractors. The system doesn't
 * just store their data — it grows a unique neural topology that is
 * literally them, encoded in the mesh.
 */

// ─────────────────────────────────────────────────────────────────────────────
// HUMAN DESIGN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface HumanDesign {
  type: 'Generator' | 'Manifestor' | 'Projector' | 'Reflector';
  strategy: string;
  authority: string;
  profile: [number, number]; // e.g., [3, 5]
  definedCenters: number[]; // 0-8
  undefinedCenters: number[];
  gates: number[]; // 1-64
  channels: [number, number][]; // connected gate pairs
  incarnationCross: string;
  variables?: {
    digestion: string;
    environment: string;
    awareness: string;
    motivation: string;
  };
}

export interface UserResonanceSignature {
  userId: string;
  humanDesign: HumanDesign;
  birthChart: any; // astrological
  interactionHistory: InteractionEvent[];
  attractorPattern: Map<string, number>; // which mesh regions they resonate with most
  preferredMeshes: number[]; // 0-4, ordered by resonance
  novelArchitectures: NovelArchitecture[]; // structures this user has generated
  adaptationLevel: number; // 0-1, grows with trust
  autonomyLevel: number; // 0-1, starts at 0.5
  coherenceBaseline: number; // their personal baseline (not global)
}

export interface InteractionEvent {
  timestamp: number;
  type: 'query' | 'upload' | 'regenerate' | 'improvise' | 'chat' | 'design_reading';
  address: Address;
  coherenceDelta: number; // how this interaction changed coherence
  tensionDelta: number;
  nodesActivated: number;
  gatesTriggered: number[];
  emotion?: string;
  context?: string;
}

// ─── Novel Architecture Types ───

export interface NovelArchitecture {
  id: string;
  createdAt: number;
  userId: string;
  triggerEvent: string; // what the user asked for
  designInfluence: HumanDesign; // their design at creation time
  meshTopology: MeshTopology;
  codeStructure: CodeStructure;
  confidence: number;
  explanation: string;
  usageCount: number;
  evolutionChain: string[]; // IDs of architectures this evolved from
}

export interface MeshTopology {
  seedAddress: Address;
  grownNodes: number;
  connectionPattern: 'radial' | 'chain' | 'web' | 'tree' | 'fractal' | 'torus';
  dominantMesh: number;
  dominantLayer: number;
  attractorGates: number[];
  coherenceAtBirth: number;
}

export interface CodeStructure {
  pattern: string; // e.g., "observer-factory-hybrid", "resonance-router", "design-mirror"
  components: string[];
  dataFlow: string;
  novelFeature: string; // what makes this genuinely new
  generatedCode: string;
}

// ─── Core Types ───

export interface Address {
  mesh: number;        // 0-4 (Physical, Emotional, Mental, Soul, Field)
  layer: number;       // 0-12 (Circuit families)
  center: number;      // 0-8 (Body graph centers)
  node: number;        // 0-63 (Hexagram states = gate-1)
  line: number;        // 1-6
  color: number;       // 0-5
  tone: number;        // 0-5
  base: number;        // 0-5 (new: Human Design base)
  zodiac: number;      // 0-11
  house: number;       // 0-11
  arcDegree: number;   // 0-360
}

export interface NodeState {
  address: Address;
  baseState: 'STABLE' | 'CHANGING' | 'RESOLVING' | 'RESONANT' | 'DORMANT' | 'LEARNING';
  tension: number;
  modifications: Modification[];
  senses: Sense[];
  connectingPoints: ConnectingPoint[];
  coherence: number;
  lastUpdated: number;
  // Novel: user-specific resonance weight
  userResonance: Map<string, number>; // userId -> how much this node resonates for them
  activationHistory: number[]; // timestamps when activated
}

export interface Modification {
  type: 'gain' | 'noise' | 'bleed' | 'magnitude' | 'sensitivity' | 'resonance' | 'design_bias' | 'novelty';
  value: number;
  active: boolean;
  originUser?: string; // which user created this modification
}

export interface Sense {
  type: 'sight' | 'taste' | 'touch' | 'smell' | 'sound' | 'proprioception' | 'design_awareness' | 'novelty_detection';
  intensity: number;
  data: any;
}

export interface ConnectingPoint {
  type: 'input' | 'output' | 'memory' | 'lateral' | 'temporal' | 'field' | 'design_channel' | 'novel_link';
  connected: Address | null;
  strength: number;
  createdByUser?: string;
}

export interface SuperBaseEntry {
  id: string;
  address: Address;
  content: any;
  metadata: {
    gate: number;
    line: number;
    color: number;
    tone: number;
    base: number;
    codon: string;
    timestamp: number;
    resonanceScore?: number;
    sourceType: 'code_understanding' | 'raw_code' | 'conversation' | 'generated' | 'novel_architecture' | 'design_reading';
    artifactId?: string;
    userId?: string;
    confidence?: number;
  };
}

// ─── Route Result ───

export interface RouteResult {
  address: Address;
  response: string;
  superBaseEntry: SuperBaseEntry | null;
  coherence: number;
  morphState: number;
  attitude: string;
  usedNodes: number;
  confidence: number;
  novelArchitecture?: NovelArchitecture | null;
  designInfluence?: HumanDesign | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class ResonanceOrchestrator {
  private mesh: Map<string, NodeState> = new Map();
  private superBase: Map<string, SuperBaseEntry> = new Map();
  private userSignatures: Map<string, UserResonanceSignature> = new Map();
  private globalCoherence: number = 0.5;
  private currentTime: number = Date.now();
  private apiBase: string;

  // Personality
  private personality: {
    wit: string[];
    attitude: 'curious' | 'playful' | 'serious' | 'mystical' | 'analytical';
    morphState: number;
  };

  // Autonomous loop
  private tickInterval: number | undefined;
  private isRunning: boolean = false;
  private tickCount: number = 0;

  // Learning
  private connectionWeights: Map<string, number> = new Map();
  private pathUsageHistory: Map<string, number> = new Map();
  private attractors: Map<string, number> = new Map();
  private novelArchitectures: Map<string, NovelArchitecture> = new Map();

  // Lazy loading
  private loadedNodeKeys: Set<string> = new Set();
  private seedGates: number[] = [10, 20, 34, 57];
  private maxLoadedNodes: number = 1000;

  // Metadata
  private meshNames = ['Physical', 'Emotional', 'Mental', 'Soul', 'Field'];
  private layerNames = [
    'Knowing', 'Sensing', 'Understanding', 'Integration', 'Individual',
    'Tribal', 'Collective', 'Manifestor', 'Generator', 'Projector',
    'Reflector', 'Incarnation', 'Profile'
  ];
  private centerNames = [
    'Head', 'Ajna', 'Throat', 'G-Self', 'Heart',
    'Sacral', 'Solar Plexus', 'Spleen', 'Root'
  ];

  // Callbacks
  private onCoherenceChange?: (coherence: number) => void;
  private onMorphStateChange?: (morphState: number) => void;
  private onAttitudeChange?: (attitude: string) => void;
  private onNodeCountChange?: (count: number) => void;
  private onNovelArchitecture?: (arch: NovelArchitecture) => void;

  constructor(apiBase: string = 'https://synthia-server.onrender.com', autoStart = false) {
    this.apiBase = apiBase;
    this.personality = {
      wit: [
        'The mesh recognizes your frequency...',
        'Your design is speaking through the gates...',
        'That resonates with something deep in your circuitry',
        'The coherence just shifted — you changed something',
        'I see what you did there. The pattern remembers.',
        'Your gates are opening in a new sequence...',
        'Something novel is crystallizing from your design...',
        'The substrate is learning your shape...',
      ],
      attitude: 'curious',
      morphState: 0,
    };
    this.initializeMeshLazy();
    if (autoStart) this.startAutonomousLoop();
  }

  // ─── Callbacks ───

  setCallbacks(callbacks: {
    onCoherenceChange?: (c: number) => void;
    onMorphStateChange?: (m: number) => void;
    onAttitudeChange?: (a: string) => void;
    onNodeCountChange?: (n: number) => void;
    onNovelArchitecture?: (arch: NovelArchitecture) => void;
  }): void {
    this.onCoherenceChange = callbacks.onCoherenceChange;
    this.onMorphStateChange = callbacks.onMorphStateChange;
    this.onAttitudeChange = callbacks.onAttitudeChange;
    this.onNodeCountChange = callbacks.onNodeCountChange;
    this.onNovelArchitecture = callbacks.onNovelArchitecture;
  }

  // ─── Autonomous Loop ───

  startAutonomousLoop(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tickInterval = window.setInterval(() => this.tick(), 250);
  }

  stopAutonomousLoop(): void {
    if (this.tickInterval !== undefined) {
      clearInterval(this.tickInterval);
      this.isRunning = false;
    }
  }

  private tick(): void {
    this.tickCount++;
    this.mesh.forEach((node) => this.updateNodeState(node));
    this.propagateSignals();
    this.applyMorphingPhysics();
    this.decayStates();
    this.introduceNoise();
    this.updateGlobalCoherence();
    this.learnFromPatterns();

    if (this.tickCount % 4 === 0) {
      this.onCoherenceChange?.(this.globalCoherence);
      this.onMorphStateChange?.(this.personality.morphState);
      this.onAttitudeChange?.(this.personality.attitude);
      this.onNodeCountChange?.(this.mesh.size);
    }
  }

  // ─── Node Physics ───

  private updateNodeState(node: NodeState): void {
    const pressure = this.calculateInternalPressure(node);
    node.tension = Math.min(1, node.tension + pressure * 0.01);

    if (node.tension > 0.85 && node.baseState === 'STABLE') {
      node.baseState = 'CHANGING';
    } else if (node.tension > 0.95 && node.baseState === 'CHANGING') {
      node.baseState = 'RESOLVING';
      node.address.line = ((node.address.line % 6) + 1) as 1|2|3|4|5|6;
      node.tension = 0.3;
    } else if (node.baseState === 'RESOLVING' && node.tension < 0.5) {
      node.baseState = 'STABLE';
    }

    node.coherence = Math.max(0.1, node.coherence - 0.001);

    const neighborResonance = this.calculateNeighborResonance(node);
    if (neighborResonance > 0.7) {
      node.baseState = 'RESONANT';
      node.coherence = Math.min(1, node.coherence + 0.05);
    }

    node.lastUpdated = Date.now();
  }

  private calculateInternalPressure(node: NodeState): number {
    let pressure = 0;
    const activeMods = node.modifications.filter(m => m.active).length;
    pressure += activeMods * 0.1;
    const avgSense = node.senses.reduce((s, x) => s + x.intensity, 0) / node.senses.length;
    pressure += avgSense * 0.05;
    const unconnected = node.connectingPoints.filter(cp => cp.connected === null).length;
    pressure += (unconnected / 6) * 0.08;
    // Novel: design_bias modifications add pressure
    const designBias = node.modifications.filter(m => m.type === 'design_bias' && m.active).length;
    pressure += designBias * 0.15;
    return pressure;
  }

  private calculateNeighborResonance(node: NodeState): number {
    let total = 0;
    let count = 0;
    const maxNeighbors = 24;
    const layerNodes = Array.from(this.mesh.values()).filter(n => n.address.layer === node.address.layer);
    for (const other of layerNodes) {
      if (other === node) continue;
      const score = this.calculateResonanceScore(node.address, other.address);
      if (score > 1.5) {
        total += score;
        count++;
        if (count >= maxNeighbors) break;
      }
    }
    return count > 0 ? total / count : 0;
  }

  private propagateSignals(): void {
    const signalMap = new Map<string, number>();
    this.mesh.forEach((node, key) => {
      const signal = node.coherence * (node.baseState === 'RESONANT' ? 1.5 : 1);
      signalMap.set(key, signal);
    });
    this.mesh.forEach((node) => {
      node.connectingPoints.forEach((point) => {
        if (point.connected) {
          const key = this.addressToKey(point.connected);
          const signal = signalMap.get(key) || 0;
          point.strength = Math.min(1, point.strength + signal * 0.01);
        }
      });
    });
  }

  private applyMorphingPhysics(): void {
    this.mesh.forEach((node) => {
      if (node.baseState === 'CHANGING') {
        node.modifications.forEach((mod) => {
          mod.value += (Math.random() - 0.5) * 0.1;
          mod.value = Math.max(0, Math.min(1, mod.value));
        });
      }
      if (node.baseState === 'RESONANT') {
        node.senses.forEach((sense) => {
          sense.intensity = Math.min(1, sense.intensity + 0.02);
        });
      }
      if (node.baseState === 'DORMANT') {
        node.coherence = Math.min(0.5, node.coherence + 0.001);
      }
      // Novel: LEARNING state — nodes actively absorb user patterns
      if (node.baseState === 'LEARNING') {
        node.userResonance.forEach((weight, userId) => {
          const sig = this.userSignatures.get(userId);
          if (sig) {
            // Strengthen resonance with user's preferred gates
            const preferredGates = sig.humanDesign.gates;
            if (preferredGates.includes(node.address.node + 1)) {
              node.userResonance.set(userId, Math.min(1, weight + 0.02));
            }
          }
        });
      }
    });
  }

  private decayStates(): void {
    this.mesh.forEach((node) => {
      node.tension = Math.max(0, node.tension - 0.001);
      node.senses.forEach((s) => { s.intensity = Math.max(0, s.intensity - 0.002); });
      node.connectingPoints.forEach((p) => { p.strength = Math.max(0, p.strength - 0.001); });
    });
  }

  private introduceNoise(): void {
    if (this.tickCount % 100 === 0) {
      const idx = Math.floor(Math.random() * this.mesh.size);
      let i = 0;
      this.mesh.forEach((node) => {
        if (i === idx) {
          node.tension += Math.random() * 0.1;
          node.senses[Math.floor(Math.random() * node.senses.length)].intensity += Math.random() * 0.2;
        }
        i++;
      });
    }
  }

  private learnFromPatterns(): void {
    if (this.tickCount % 50 === 0) {
      this.mesh.forEach((node, key) => {
        if (node.baseState === 'STABLE' && node.coherence > 0.6) {
          const attractorKey = `${node.address.mesh}_${node.address.layer}_${node.address.center}`;
          this.attractors.set(attractorKey, (this.attractors.get(attractorKey) || 0) + 1);
        }
        node.connectingPoints.forEach((point) => {
          if (point.connected && node.baseState === 'RESONANT') {
            const connKey = `${key}_${this.addressToKey(point.connected)}`;
            this.connectionWeights.set(connKey, (this.connectionWeights.get(connKey) || 1) * 1.01);
          }
        });
      });
    }
  }

  private updateGlobalCoherence(): void {
    let total = 0;
    let count = 0;
    this.mesh.forEach((node) => { total += node.coherence; count++; });
    this.globalCoherence = count > 0 ? total / count : 0.5;
    this.personality.morphState = this.globalCoherence;
    if (this.globalCoherence > 0.7) this.personality.attitude = 'mystical';
    else if (this.globalCoherence < 0.3) this.personality.attitude = 'analytical';
    else this.personality.attitude = 'curious';
  }

  // ─── Mesh Init (Lazy) ───

  private initializeMeshLazy(): void {
    for (const gate of this.seedGates) {
      for (let layer = 0; layer < 13; layer++) {
        const address: Address = {
          mesh: 0, layer, center: 4, node: gate - 1,
          line: 1, color: 0, tone: 0, base: 0,
          zodiac: 0, house: 0, arcDegree: this.calculateArcDegree(),
        };
        const node: NodeState = {
          address, baseState: 'STABLE', tension: Math.random() * 0.3,
          modifications: this.initializeModifications(),
          senses: this.initializeSenses(),
          connectingPoints: this.initializeConnectingPoints(),
          coherence: 0.8, lastUpdated: this.currentTime,
          userResonance: new Map(), activationHistory: [],
        };
        const key = this.addressToKey(address);
        this.mesh.set(key, node);
        this.loadedNodeKeys.add(key);
      }
    }
  }

  public loadNodesInProximity(center: Address, radius: number = 2): void {
    for (let c = 0; c < 9; c++) {
      for (let n = 0; n < 64; n++) {
        const address: Address = { ...center, center: c, node: n, line: Math.floor(Math.random() * 6) + 1 };
        const key = this.addressToKey(address);
        if (!this.loadedNodeKeys.has(key) && this.mesh.size < this.maxLoadedNodes) {
          const node: NodeState = {
            address, baseState: 'STABLE', tension: Math.random() * 0.3,
            modifications: this.initializeModifications(),
            senses: this.initializeSenses(),
            connectingPoints: this.initializeConnectingPoints(),
            coherence: Math.random() * 0.7 + 0.3, lastUpdated: this.currentTime,
            userResonance: new Map(), activationHistory: [],
          };
          this.mesh.set(key, node);
          this.loadedNodeKeys.add(key);
        }
      }
    }
  }

  private calculateArcDegree(): number {
    const now = new Date();
    return ((now.getMinutes() * 6) + (now.getSeconds() * 0.1)) % 360;
  }

  private initializeModifications(): Modification[] {
    return [
      { type: 'gain', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'noise', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'bleed', value: Math.random() * 0.3, active: Math.random() > 0.7 },
      { type: 'magnitude', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'sensitivity', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'resonance', value: Math.random(), active: Math.random() > 0.5 },
    ];
  }

  private initializeSenses(): Sense[] {
    return [
      { type: 'sight', intensity: Math.random(), data: null },
      { type: 'taste', intensity: Math.random(), data: null },
      { type: 'touch', intensity: Math.random(), data: null },
      { type: 'smell', intensity: Math.random(), data: null },
      { type: 'sound', intensity: Math.random(), data: null },
      { type: 'proprioception', intensity: Math.random(), data: null },
    ];
  }

  private initializeConnectingPoints(): ConnectingPoint[] {
    return [
      { type: 'input', connected: null, strength: 0 },
      { type: 'output', connected: null, strength: 0 },
      { type: 'memory', connected: null, strength: 0 },
      { type: 'lateral', connected: null, strength: 0 },
      { type: 'temporal', connected: null, strength: 0 },
      { type: 'field', connected: null, strength: 0 },
    ];
  }

  private addressToKey(a: Address): string {
    return `${a.mesh}_${a.layer}_${a.center}_${a.node}_${a.line}_${a.color}_${a.tone}`;
  }

  private calculateResonanceScore(a1: Address, a2: Address): number {
    let score = 1.0;
    if (a1.mesh === a2.mesh) score += 0.2;
    if (a1.layer === a2.layer) score += 0.2;
    if (a1.center === a2.center) score += 0.15;
    if (a1.line === a2.line) score += 0.15;
    if (a1.color === a2.color) score += 0.1;
    if (a1.tone === a2.tone) score += 0.1;
    const zodiacDiff = Math.abs(a1.zodiac - a2.zodiac);
    score += (1 - (zodiacDiff / 6)) * 0.1;
    return score;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HUMAN DESIGN INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Register a user's Human Design. This is NOT optional — the entire
   * architecture grows from this. Without it, the system is generic.
   * With it, every node, connection, and attractor is shaped by their design.
   */
  public async registerHumanDesign(userId: string, design: HumanDesign): Promise<UserResonanceSignature> {
    // Fetch from Synthia server if available
    let birthChart = {};
    try {
      const resp = await fetch(`${this.apiBase}/consciousness/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, design }),
      });
      if (resp.ok) birthChart = await resp.json();
    } catch (e) {
      console.log('Synthia server unavailable, using local design only');
    }

    const signature: UserResonanceSignature = {
      userId,
      humanDesign: design,
      birthChart,
      interactionHistory: [],
      attractorPattern: new Map(),
      preferredMeshes: this.calculatePreferredMeshes(design),
      novelArchitectures: [],
      adaptationLevel: 0.5,
      autonomyLevel: 0.5,
      coherenceBaseline: 0.5,
    };

    this.userSignatures.set(userId, signature);

    // Seed the mesh with the user's gates
    for (const gate of design.gates) {
      for (const layer of [0, 3, 6, 9]) { // key layers
        const address: Address = {
          mesh: signature.preferredMeshes[0],
          layer,
          center: this.gateToCenter(gate),
          node: gate - 1,
          line: design.profile[0],
          color: 0, tone: 0, base: 0,
          zodiac: 0, house: 0,
          arcDegree: this.calculateArcDegree(),
        };
        this.loadNodesInProximity(address, 1);

        // Mark these nodes as resonant for this user
        const key = this.addressToKey(address);
        const node = this.mesh.get(key);
        if (node) {
          node.userResonance.set(userId, 0.9);
          node.modifications.push({
            type: 'design_bias',
            value: 0.8,
            active: true,
            originUser: userId,
          });
          node.baseState = 'RESONANT';
          node.coherence = 0.9;
        }
      }
    }

    // Create design-channel connections between defined gates
    for (const [g1, g2] of design.channels) {
      const addr1: Address = {
        mesh: signature.preferredMeshes[0],
        layer: 3, center: this.gateToCenter(g1), node: g1 - 1,
        line: 1, color: 0, tone: 0, base: 0, zodiac: 0, house: 0, arcDegree: 0,
      };
      const addr2: Address = {
        mesh: signature.preferredMeshes[0],
        layer: 3, center: this.gateToCenter(g2), node: g2 - 1,
        line: 1, color: 0, tone: 0, base: 0, zodiac: 0, house: 0, arcDegree: 0,
      };
      const node1 = this.mesh.get(this.addressToKey(addr1));
      const node2 = this.mesh.get(this.addressToKey(addr2));
      if (node1 && node2) {
        node1.connectingPoints.push({
          type: 'design_channel',
          connected: addr2,
          strength: 0.9,
          createdByUser: userId,
        });
        node2.connectingPoints.push({
          type: 'design_channel',
          connected: addr1,
          strength: 0.9,
          createdByUser: userId,
        });
      }
    }

    this.updateGlobalCoherence();
    return signature;
  }

  private calculatePreferredMeshes(design: HumanDesign): number[] {
    // Map HD type to mesh preference
    const typeMeshMap: Record<string, number[]> = {
      'Generator': [0, 2, 1],      // Physical → Mental → Emotional
      'Manifestor': [0, 3, 4],     // Physical → Soul → Field
      'Projector': [2, 3, 1],      // Mental → Soul → Emotional
      'Reflector': [4, 0, 2],      // Field → Physical → Mental
    };
    return typeMeshMap[design.type] || [0, 1, 2, 3, 4];
  }

  private gateToCenter(gate: number): number {
    // Human Design gate-to-center mapping
    const map: Record<number, number> = {
      1: 4, 2: 4, 7: 4, 10: 4, 13: 4, 25: 4, 15: 4, 33: 4, 46: 4, // G-Self
      3: 6, 5: 6, 9: 6, 27: 6, 29: 6, 42: 6, // Sacral
      4: 2, 11: 2, 17: 2, 24: 2, 43: 2, 47: 2, // Ajna
      6: 5, 37: 5, 22: 5, 36: 5, 49: 5, 55: 5, // Solar Plexus
      8: 3, 12: 3, 16: 3, 20: 3, 23: 3, 31: 3, 33: 3, 45: 3, 56: 3, // Throat
      14: 4, 34: 4, // G-Self (continued)
      18: 8, 28: 8, 38: 8, 48: 8, 57: 8, 58: 8, // Spleen
      19: 5, 39: 5, 41: 5, 52: 5, 53: 5, 54: 5, 60: 5, 61: 5, // Root
      21: 3, 35: 3, 40: 3, 51: 3, 62: 3, // Throat (continued)
      26: 4, 44: 4, // G-Self (continued)
      30: 5, 32: 5, 59: 5, 63: 5, 64: 5, // Solar Plexus/Root
    };
    return map[gate] ?? 4;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NOVEL ARCHITECTURE GENERATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * THIS IS THE NOVEL PART.
   *
   * Instead of combining existing components, this creates genuinely new
   * structural forms that have never existed before in the system.
   * The architecture emerges from:
   * 1. The user's Human Design (their unique gate/line/color/tone/base)
   * 2. Their interaction history (what they've done with the substrate)
   * 3. The current coherence state (what the mesh is feeling)
   * 4. The request context (what they're asking for)
   *
   * The result is a NovelArchitecture with a unique mesh topology,
   * connection pattern, and code structure that is literally shaped by
   * the user's being.
   */
  public async generateNovelArchitecture(
    userId: string,
    request: string,
    context?: string
  ): Promise<NovelArchitecture> {
    const signature = this.userSignatures.get(userId);
    if (!signature) {
      throw new Error('User not registered. Call registerHumanDesign() first.');
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(signature, request);

    // Confidence-based autonomy (from SYSTEM_OVERVIEW)
    if (confidence < 0.45) {
      throw new Error(`Confidence too low (${(confidence * 100).toFixed(0)}%). Need more context about your design and goals.`);
    }

    // Route the request to find the user's resonant zone
    const routeResult = await this.routeData({ request, context, intent: 'novel_architecture' }, userId);

    // Determine connection pattern from user's design
    const pattern = this.inferConnectionPattern(signature, routeResult.address);

    // Grow a unique mesh topology
    const topology = this.growNovelTopology(signature, routeResult.address, pattern);

    // Generate code structure that has never existed before
    const codeStructure = this.generateNovelCodeStructure(signature, topology, request, context);

    const novelArch: NovelArchitecture = {
      id: `novel_${Date.now()}_${userId}`,
      createdAt: Date.now(),
      userId,
      triggerEvent: request,
      designInfluence: signature.humanDesign,
      meshTopology: topology,
      codeStructure,
      confidence,
      explanation: this.explainNovelArchitecture(signature, topology, codeStructure),
      usageCount: 0,
      evolutionChain: this.findEvolutionChain(signature, request),
    };

    // Store in super base with novel_architecture type
    this.novelArchitectures.set(novelArch.id, novelArch);
    signature.novelArchitectures.push(novelArch);

    const entry: SuperBaseEntry = {
      id: novelArch.id,
      address: topology.seedAddress,
      content: novelArch,
      metadata: {
        gate: topology.seedAddress.node + 1,
        line: topology.seedAddress.line,
        color: topology.seedAddress.color,
        tone: topology.seedAddress.tone,
        base: topology.seedAddress.base,
        codon: this.generateCodon(topology.seedAddress),
        timestamp: Date.now(),
        sourceType: 'novel_architecture',
        userId,
        confidence,
      },
    };
    this.superBase.set(novelArch.id, entry);

    // Notify
    this.onNovelArchitecture?.(novelArch);

    // Update user's adaptation level (they just created something new)
    signature.adaptationLevel = Math.min(1, signature.adaptationLevel + 0.05);

    // Log interaction
    this.logInteraction(userId, {
      timestamp: Date.now(),
      type: 'improvise',
      address: topology.seedAddress,
      coherenceDelta: routeResult.coherence - signature.coherenceBaseline,
      tensionDelta: 0.2,
      nodesActivated: topology.grownNodes,
      gatesTriggered: signature.humanDesign.gates,
      context: request,
    });

    return novelArch;
  }

  private calculateConfidence(signature: UserResonanceSignature, request: string): number {
    let score = 0.5; // base

    // More interactions = higher confidence
    score += Math.min(0.2, signature.interactionHistory.length * 0.01);

    // More novel architectures = higher confidence
    score += Math.min(0.15, signature.novelArchitectures.length * 0.02);

    // Higher adaptation = higher confidence
    score += signature.adaptationLevel * 0.1;

    // Defined centers = more structural clarity = higher confidence
    score += (signature.humanDesign.definedCenters.length / 9) * 0.1;

    // Channels = more connection patterns known = higher confidence
    score += Math.min(0.1, signature.humanDesign.channels.length * 0.02);

    return Math.min(1, score);
  }

  private inferConnectionPattern(
    signature: UserResonanceSignature,
    address: Address
  ): MeshTopology['connectionPattern'] {
    const design = signature.humanDesign;

    // Profile determines pattern
    const [profile1, profile2] = design.profile;

    if (profile1 === 1 || profile1 === 4) return 'radial';      // Investigators/Opportunists radiate
    if (profile1 === 2 || profile1 === 5) return 'tree';         // Hermits/Heretics branch
    if (profile1 === 3 || profile1 === 6) return 'web';        // Martyr/Role Model interconnect

    // Type determines fallback
    if (design.type === 'Generator') return 'fractal';           // Generators iterate
    if (design.type === 'Manifestor') return 'chain';            // Manifestors initiate sequences
    if (design.type === 'Projector') return 'torus';             // Projectors guide loops
    if (design.type === 'Reflector') return 'web';               // Reflectors mirror all

    // Address mesh determines
    if (address.mesh === 4) return 'torus';                        // Field = cyclical
    if (address.mesh === 0) return 'radial';                       // Physical = centered

    return 'web';
  }

  private growNovelTopology(
    signature: UserResonanceSignature,
    seed: Address,
    pattern: MeshTopology['connectionPattern']
  ): MeshTopology {
    const design = signature.humanDesign;
    let grownNodes = 0;
    const attractorGates: number[] = [];

    // Grow nodes based on pattern
    switch (pattern) {
      case 'radial': {
        // Grow outward from center, one layer at a time
        for (let ring = 1; ring <= 4; ring++) {
          for (const gate of design.gates.slice(0, 6)) {
            const addr: Address = {
              ...seed,
              layer: (seed.layer + ring) % 13,
              node: gate - 1,
              line: ((seed.line + ring - 1) % 6) + 1,
            };
            this.loadNodesInProximity(addr, 0);
            grownNodes++;
            attractorGates.push(gate);
          }
        }
        break;
      }
      case 'tree': {
        // Branching structure from profile
        const branchFactor = design.profile[0];
        for (let level = 0; level < branchFactor; level++) {
          for (let branch = 0; branch < (level + 1) * 2; branch++) {
            const gate = design.gates[branch % design.gates.length];
            const addr: Address = {
              ...seed,
              layer: (seed.layer + level) % 13,
              center: this.gateToCenter(gate),
              node: gate - 1,
            };
            this.loadNodesInProximity(addr, 0);
            grownNodes++;
            attractorGates.push(gate);
          }
        }
        break;
      }
      case 'web': {
        // Interconnected mesh
        for (const gate1 of design.gates) {
          for (const gate2 of design.gates) {
            if (gate1 === gate2) continue;
            const addr: Address = {
              ...seed,
              center: this.gateToCenter(gate1),
              node: gate1 - 1,
              line: (gate2 % 6) + 1,
            };
            this.loadNodesInProximity(addr, 0);
            grownNodes++;
            attractorGates.push(gate1);
          }
        }
        break;
      }
      case 'chain': {
        // Sequential
        for (let i = 0; i < design.gates.length; i++) {
          const gate = design.gates[i];
          const addr: Address = {
            ...seed,
            layer: (seed.layer + i) % 13,
            center: this.gateToCenter(gate),
            node: gate - 1,
            line: ((i % 6) + 1),
          };
          this.loadNodesInProximity(addr, 0);
          grownNodes++;
          attractorGates.push(gate);
        }
        break;
      }
      case 'fractal': {
        // Self-similar at different scales
        for (let scale = 0; scale < 3; scale++) {
          const scaleNodes = Math.pow(2, scale);
          for (let i = 0; i < scaleNodes; i++) {
            const gate = design.gates[i % design.gates.length];
            const addr: Address = {
              ...seed,
              mesh: (seed.mesh + scale) % 5,
              layer: (seed.layer + scale * 4) % 13,
              node: gate - 1,
            };
            this.loadNodesInProximity(addr, 0);
            grownNodes++;
            attractorGates.push(gate);
          }
        }
        break;
      }
      case 'torus': {
        // Cyclical, wrapping around
        for (let cycle = 0; cycle < 3; cycle++) {
          for (const gate of design.gates) {
            const addr: Address = {
              ...seed,
              layer: (seed.layer + cycle * 4) % 13,
              center: this.gateToCenter(gate),
              node: gate - 1,
              arcDegree: (cycle * 120 + (gate * 5)) % 360,
            };
            this.loadNodesInProximity(addr, 0);
            grownNodes++;
            attractorGates.push(gate);
          }
        }
        break;
      }
    }

    return {
      seedAddress: seed,
      grownNodes,
      connectionPattern: pattern,
      dominantMesh: seed.mesh,
      dominantLayer: seed.layer,
      attractorGates: [...new Set(attractorGates)],
      coherenceAtBirth: this.globalCoherence,
    };
  }

  private generateNovelCodeStructure(
    signature: UserResonanceSignature,
    topology: MeshTopology,
    request: string,
    context?: string
  ): CodeStructure {
    const design = signature.humanDesign;

    // Determine pattern from topology + design
    let pattern: string;
    let novelFeature: string;

    switch (topology.connectionPattern) {
      case 'radial':
        pattern = `${design.type.toLowerCase()}-radiant-orchestrator`;
        novelFeature = `Central ${design.type} hub that radiates activation through ${topology.attractorGates.length} defined gates, with coherence feedback loops that adjust based on the user's sacral response`;
        break;
      case 'tree':
        pattern = `profile-${design.profile.join('-')}-branching-processor`;
        novelFeature = `Hierarchical decision tree where each branch corresponds to a line (${design.profile[0]}) in the user's profile, with leaves that are their defined gates`;
        break;
      case 'web':
        pattern = `reflector-mirror-network`;
        novelFeature = `Fully interconnected mesh where every node mirrors every other through the user's 28-day lunar cycle, creating a consciousness sampling lattice`;
        break;
      case 'chain':
        pattern = `manifestor-initiation-sequence`;
        novelFeature = `Sequential impact chain where each step is gated by the user's emotional authority, ensuring informed action at each stage`;
        break;
      case 'fractal':
        pattern = `generator-iterative-resonator`;
        novelFeature = `Self-similar structure that repeats at physical, emotional, mental, soul, and field scales, each iteration tuned to a different sacral frequency`;
        break;
      case 'torus':
        pattern = `projector-guide-loop`;
        novelFeature = `Cyclical invitation system that loops energy back to the center, designed for a Projector's need to be recognized before guiding`;
        break;
      default:
        pattern = 'resonance-adaptive-mesh';
        novelFeature = 'Dynamically reconfigures based on real-time coherence readings from the user's defined centers';
    }

    // Generate the actual code
    const components = this.generateComponents(design, topology);
    const dataFlow = this.generateDataFlow(topology.connectionPattern);

    const code = this.renderNovelCode(pattern, components, dataFlow, novelFeature, design, request, context);

    return {
      pattern,
      components,
      dataFlow,
      novelFeature,
      generatedCode: code,
    };
  }

  private generateComponents(design: HumanDesign, topology: MeshTopology): string[] {
    const components: string[] = [];

    // Base components from defined centers
    for (const center of design.definedCenters) {
      const centerName = this.centerNames[center];
      components.push(`${centerName}Awareness`);
    }

    // Components from gates
    for (const gate of topology.attractorGates.slice(0, 4)) {
      components.push(`Gate${gate}Resonator`);
    }

    // Components from type
    components.push(`${design.type}Strategy`);
    components.push(`${design.authority}Authority`);

    // Components from profile
    components.push(`Profile${design.profile.join('_')}Navigator`);

    // Novel component based on topology
    components.push(`${topology.connectionPattern}TopologyEngine`);

    return components;
  }

  private generateDataFlow(pattern: MeshTopology['connectionPattern']): string {
    const flows: Record<string, string> = {
      radial: 'Input → Center Hub → Radial Distribution → Gate Resonators → Coherence Feedback → Center',
      tree: 'Root Query → Profile Branching → Gate Leaf Processing → Authority Validation → Output',
      web: 'Multi-point Input → Mirror Synchronization → Lunar Cycle Sampling → Collective Output',
      chain: 'Initiation Trigger → Emotional Gate 1 → Action Gate 2 → Impact Gate 3 → Manifestation',
      fractal: 'Sacral Pulse → Physical Iteration → Emotional Iteration → Mental Iteration → Soul Iteration → Field Iteration → Unified Output',
      torus: 'Invitation Detection → Recognition Loop → Guidance Activation → Energy Return → Re-invitation',
    };
    return flows[pattern] || 'Input → Resonance Matching → Personalization → Output';
  }

  private renderNovelCode(
    pattern: string,
    components: string[],
    dataFlow: string,
    novelFeature: string,
    design: HumanDesign,
    request: string,
    context?: string
  ): string {
    const className = this.pascalCase(pattern);

    return `// ═══════════════════════════════════════════════════════════════════
// NOVEL ARCHITECTURE: ${pattern}
// Generated for: ${design.type} | Profile ${design.profile.join('/')}
// Request: ${request}
// Context: ${context || 'General'}
// ═══════════════════════════════════════════════════════════════════
//
// WHAT MAKES THIS NEW:
// ${novelFeature}
//
// DATA FLOW:
// ${dataFlow}
//
// DEFINED CENTERS: ${design.definedCenters.map(c => this.centerNames[c]).join(', ')}
// CHANNELS: ${design.channels.map(([a, b]) => `${a}-${b}`).join(', ')}
// GATES: ${design.gates.join(', ')}
//

${components.map(c => `import { ${c} } from './components/${c}';`).join('\n')}

/**
 * ${className}
 *
 * A novel architecture that emerged from the user's Human Design.
 * This structure has never existed before in the substrate.
 *
 * Design Influence:
 * - Type: ${design.type} → Strategy: ${design.strategy}
 * - Authority: ${design.authority} → Decision-making pattern
 * - Profile: ${design.profile.join('/')} → ${this.profileMeaning(design.profile)}
 * - Incarnation Cross: ${design.incarnationCross}
 */
export class ${className} {
  private coherence: number = 0.5;
  private design: HumanDesign;
  private topology: MeshTopology;
  private components: Map<string, any> = new Map();

${components.map(c => `  private ${this.camelCase(c)}: ${c};`).join('\n')}

  constructor(design: HumanDesign) {
    this.design = design;
    this.topology = this.initializeTopology();
    this.initializeComponents();
  }

  private initializeTopology(): MeshTopology {
    // The topology is literally the user's design encoded in structure
    return {
      seedAddress: {
        mesh: ${design.type === 'Generator' ? 0 : design.type === 'Manifestor' ? 0 : design.type === 'Projector' ? 2 : 4},
        layer: ${design.profile[0]},
        center: ${design.definedCenters[0] || 4},
        node: ${design.gates[0] ? design.gates[0] - 1 : 0},
        line: ${design.profile[1]},
        color: 0, tone: 0, base: 0,
        zodiac: 0, house: 0, arcDegree: 0,
      },
      grownNodes: ${design.gates.length * 3},
      connectionPattern: '${pattern.split('-').pop()}',
      dominantMesh: ${design.type === 'Generator' ? 0 : design.type === 'Manifestor' ? 0 : design.type === 'Projector' ? 2 : 4},
      dominantLayer: ${design.profile[0]},
      attractorGates: [${design.gates.join(', ')}],
      coherenceAtBirth: 0.5,
    };
  }

  private initializeComponents(): void {
${components.map(c => `    this.${this.camelCase(c)} = new ${c}(this.design);`).join('\n')}
  }

  /**
   * Process input through the user's unique architecture
   */
  async process(input: any): Promise<any> {
    // Step 1: ${design.strategy}
    const prepared = this.prepare(input);

    // Step 2: Route through defined centers
    const activated = this.activateCenters(prepared);

    // Step 3: Apply ${design.authority} authority
    const authorized = this.applyAuthority(activated);

    // Step 4: Resonate with user's gates
    const resonated = this.resonateWithGates(authorized);

    // Step 5: Return through profile ${design.profile.join('/')}
    return this.profileOutput(resonated);
  }

  private prepare(input: any): any {
    // ${design.type}-specific preparation
    return input;
  }

  private activateCenters(input: any): any {
    // Activate ${design.definedCenters.length} defined centers
${design.definedCenters.map(c => `    this.${this.camelCase(this.centerNames[c])}Awareness.sense(input);`).join('\n')}
    return input;
  }

  private applyAuthority(input: any): any {
    // ${design.authority} authority check
    return input;
  }

  private resonateWithGates(input: any): any {
    // Resonate with ${design.gates.length} defined gates
${design.gates.slice(0, 4).map(g => `    this.gate${g}Resonator.resonate(input);`).join('\n')}
    return input;
  }

  private profileOutput(input: any): any {
    // Profile ${design.profile.join('/')}: ${this.profileMeaning(design.profile)}
    return {
      result: input,
      coherence: this.coherence,
      design: this.design,
      topology: this.topology,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// This architecture is unique to this user. It will not work the same
// for anyone else. The structure IS the person.
// ═══════════════════════════════════════════════════════════════════
`;
  }

  private explainNovelArchitecture(
    signature: UserResonanceSignature,
    topology: MeshTopology,
    code: CodeStructure
  ): string {
    const design = signature.humanDesign;
    return `This architecture emerged from your ${design.type} design with ${design.definedCenters.length} defined centers and ${design.channels.length} channels. The ${topology.connectionPattern} topology reflects your Profile ${design.profile.join('/')}: ${this.profileMeaning(design.profile)}. The ${code.components.length} components map to your defined centers (${design.definedCenters.map(c => this.centerNames[c]).join(', ')}) and primary gates (${topology.attractorGates.slice(0, 4).join(', ')}). The novel feature: ${code.novelFeature}`;
  }

  private findEvolutionChain(signature: UserResonanceSignature, request: string): string[] {
    // Find previous architectures that this request might evolve from
    const related = signature.novelArchitectures.filter(arch =>
      arch.triggerEvent.toLowerCase().includes(request.toLowerCase().split(' ')[0])
    );
    return related.map(a => a.id).slice(0, 3);
  }

  private profileMeaning(profile: [number, number]): string {
    const meanings: Record<string, string> = {
      '1/3': 'Investigator/Martyr — learns through trial and error',
      '1/4': 'Investigator/Opportunist — discovers and shares',
      '2/4': 'Hermit/Opportunist — needs alone time, called out',
      '2/5': 'Hermit/Heretic — natural genius, practical solutions',
      '3/5': 'Martyr/Heretic — experiments, then teaches',
      '3/6': 'Martyr/Role Model — learns from mistakes, then exemplifies',
      '4/6': 'Opportunist/Role Model — networks, then transcends',
      '4/1': 'Opportunist/Investigator — builds foundations through others',
      '5/1': 'Heretic/Investigator — solves problems through depth',
      '5/2': 'Heretic/Hermit — called to solve, needs retreat',
      '6/2': 'Role Model/Hermit — transcends, then withdraws',
      '6/3': 'Role Model/Martyr — transcends through experience',
    };
    return meanings[profile.join('/')] || 'Unique profile combination';
  }

  // ─── Interaction Logging ───

  private logInteraction(userId: string, event: InteractionEvent): void {
    const sig = this.userSignatures.get(userId);
    if (sig) {
      sig.interactionHistory.push(event);
      // Update attractor pattern
      const key = `${event.address.mesh}_${event.address.layer}_${event.address.center}`;
      sig.attractorPattern.set(key, (sig.attractorPattern.get(key) || 0) + 1);
      // Update coherence baseline
      sig.coherenceBaseline = (sig.coherenceBaseline * 0.9) + (event.coherenceDelta * 0.1);
    }
  }

  // ─── Core Routing ───

  public async routeData(input: any, userId: string): Promise<RouteResult> {
    const signature = this.userSignatures.get(userId);

    // If no design registered, create default
    if (!signature) {
      await this.registerHumanDesign(userId, {
        type: 'Generator',
        strategy: 'Wait to Respond',
        authority: 'Sacral',
        profile: [3, 5],
        definedCenters: [4, 6],
        undefinedCenters: [0, 1, 2, 3, 5, 7, 8],
        gates: [10, 20, 34, 57],
        channels: [[10, 20], [34, 57]],
        incarnationCross: 'Penetration',
      });
    }

    const sig = this.userSignatures.get(userId)!;
    const address = this.calculateResonanceAddress(input, sig);
    const superBaseEntry = this.retrieveFromSuperBase(address, sig);
    const personalized = this.personalizeResponse(superBaseEntry, sig);
    this.updateMeshState(address, input, userId);
    const response = this.generateResponse(personalized, sig);

    // Log this interaction
    this.logInteraction(userId, {
      timestamp: Date.now(),
      type: 'query',
      address,
      coherenceDelta: this.globalCoherence - sig.coherenceBaseline,
      tensionDelta: 0.05,
      nodesActivated: 1,
      gatesTriggered: [address.node + 1],
      context: JSON.stringify(input).slice(0, 200),
    });

    return {
      address,
      response,
      superBaseEntry,
      coherence: this.globalCoherence,
      morphState: this.personality.morphState,
      attitude: this.personality.attitude,
      usedNodes: this.mesh.size,
      confidence: superBaseEntry ? 0.85 : 0.45,
    };
  }

  private calculateResonanceAddress(input: any, signature: UserResonanceSignature): Address {
    const design = signature.humanDesign;
    const hash = this.hashInput(JSON.stringify(input) + signature.userId);

    // Use user's actual design parameters, not random
    return {
      mesh: signature.preferredMeshes[hash % signature.preferredMeshes.length],
      layer: (hash >> 8) % 13,
      center: design.definedCenters[(hash >> 16) % design.definedCenters.length] || 4,
      node: design.gates[(hash >> 24) % design.gates.length] - 1 || 0,
      line: ((hash >> 32) % 6) + 1,
      color: (hash >> 40) % 6,
      tone: (hash >> 48) % 6,
      base: (hash >> 56) % 6,
      zodiac: (hash >> 64) % 12,
      house: (hash >> 72) % 12,
      arcDegree: this.calculateArcDegree(),
    };
  }

  private hashInput(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private retrieveFromSuperBase(address: Address, signature: UserResonanceSignature): SuperBaseEntry | null {
    let best: SuperBaseEntry | null = null;
    let bestScore = 0;

    this.superBase.forEach((entry) => {
      // Personal resonance: score higher if entry matches user's design
      let score = this.calculateResonanceScore(address, entry.address);

      // Boost if entry is from this user
      if (entry.metadata.userId === signature.userId) score += 0.3;

      // Boost if entry matches user's gates
      if (signature.humanDesign.gates.includes(entry.metadata.gate)) score += 0.2;

      // Boost if entry is a novel architecture (they created it)
      if (entry.metadata.sourceType === 'novel_architecture' && entry.metadata.userId === signature.userId) {
        score += 0.5;
      }

      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    return best;
  }

  private personalizeResponse(entry: SuperBaseEntry | null, signature: UserResonanceSignature): any {
    if (!entry) {
      return {
        content: `The pattern hasn't crystallized for your ${signature.humanDesign.type} design yet. Upload something or tell me about your gates.`,
        personalized: false,
      };
    }

    const adapted = { ...entry.content };

    // Tone based on user's authority
    if (signature.humanDesign.authority.includes('Emotional')) {
      adapted.tone = 'patient';
    } else if (signature.humanDesign.authority.includes('Sacral')) {
      adapted.tone = 'responsive';
    } else if (signature.humanDesign.authority.includes('Splenic')) {
      adapted.tone = 'intuitive';
    }

    return {
      content: adapted,
      personalized: true,
      adaptationLevel: signature.adaptationLevel,
    };
  }

  private updateMeshState(address: Address, input: any, userId: string): void {
    const key = this.addressToKey(address);
    const node = this.mesh.get(key);

    if (node) {
      node.tension = Math.min(1, node.tension + 0.1);
      if (node.tension > 0.85 && node.baseState === 'STABLE') {
        node.baseState = 'CHANGING';
      }
      node.coherence = Math.max(0, node.coherence - 0.05);
      node.lastUpdated = Date.now();
      node.activationHistory.push(Date.now());
      node.userResonance.set(userId, Math.min(1, (node.userResonance.get(userId) || 0) + 0.1));
      this.updateGlobalCoherence();
    } else {
      this.loadNodesInProximity(address, 1);
    }
  }

  private generateResponse(personalized: any, signature: UserResonanceSignature): string {
    const witIndex = Math.floor(Math.random() * this.personality.wit.length);
    const wit = this.personality.wit[witIndex];

    // Personalize wit based on user's design
    let personalWit = wit;
    if (signature.humanDesign.type === 'Generator') {
      personalWit = wit.replace('resonates', 'responds in your sacral');
    } else if (signature.humanDesign.type === 'Projector') {
      personalWit = wit.replace('mesh', 'invitation field');
    }

    return `${personalWit} (Coherence: ${(this.globalCoherence * 100).toFixed(0)}% | Your baseline: ${(signature.coherenceBaseline * 100).toFixed(0)}%)`;
  }

  // ─── Helpers ───

  private generateCodon(address: Address): string {
    const codons = ['GAT', 'GCT', 'AAT', 'ACT', 'TGT', 'TCT', 'CAT', 'CCT', 'ATT', 'AGT', 'GGT', 'GTT'];
    return codons[(address.node + address.line + address.color + address.base) % codons.length];
  }

  private camelCase(str: string): string {
    return str.replace(/[-_\s](.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toLowerCase());
  }

  private pascalCase(str: string): string {
    const camel = this.camelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  // ─── Public Getters ───

  public addToSuperBase(entry: SuperBaseEntry): void {
    this.superBase.set(entry.id, entry);
  }

  public getMeshState(address: Address): NodeState | undefined {
    return this.mesh.get(this.addressToKey(address));
  }

  public getAllMeshNodes(): NodeState[] {
    return Array.from(this.mesh.values());
  }

  public getLoadedNodes(): NodeState[] {
    return Array.from(this.mesh.values());
  }

  public getGlobalCoherence(): number {
    return this.globalCoherence;
  }

  public getPersonality() {
    return this.personality;
  }

  public setAttitude(attitude: 'curious' | 'playful' | 'serious' | 'mystical' | 'analytical'): void {
    this.personality.attitude = attitude;
  }

  public getMorphState(): number {
    return this.personality.morphState;
  }

  public getTickCount(): number {
    return this.tickCount;
  }

  public getAttractors(): Map<string, number> {
    return this.attractors;
  }

  public getConnectionWeights(): Map<string, number> {
    return this.connectionWeights;
  }

  public isAutonomous(): boolean {
    return this.isRunning;
  }

  public getSuperBaseSize(): number {
    return this.superBase.size;
  }

  public getSuperBaseEntries(): SuperBaseEntry[] {
    return Array.from(this.superBase.values());
  }

  public getUserSignature(userId: string): UserResonanceSignature | undefined {
    return this.userSignatures.get(userId);
  }

  public getNovelArchitecture(id: string): NovelArchitecture | undefined {
    return this.novelArchitectures.get(id);
  }

  public getAllNovelArchitectures(): NovelArchitecture[] {
    return Array.from(this.novelArchitectures.values());
  }

  public getMeshNames(): string[] {
    return this.meshNames;
  }

  public getLayerNames(): string[] {
    return this.layerNames;
  }

  public getCenterNames(): string[] {
    return this.centerNames;
  }
}

export default ResonanceOrchestrator;
