/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     RESONANCE ORCHESTRATOR v7.5 — FOCUSED EDITION                          ║
 * ║                                                                              ║
 * ║  v7 coherence + essential capabilities:                                      ║
 * ║  • RAG — ingest documents, query knowledge, map to mesh                      ║
 * ║  • MCP — register tools, call them, learn from results                       ║
 * ║  • Code — generate from intent + context                                     ║
 * ║                                                                              ║
 * ║  Same clean architecture. Same adaptive heartbeat. Same observability.       ║
 * ║  No bloat. No over-engineering. Just what works.                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CANON — Single source of truth
// ═══════════════════════════════════════════════════════════════════════════════

export const CANON = {
  MESH_COUNT: 5, LAYER_COUNT: 13, CENTER_COUNT: 9, NODE_COUNT: 64,
  LINE_COUNT: 6, COLOR_COUNT: 6, TONE_COUNT: 6,
  ZODIAC_COUNT: 12, HOUSE_COUNT: 12,
  TICKS_PER_MINUTE: 72, ARCSEC_PER_HEX: 20250, NODES_PER_PLANET: 69120,
  SEED_GATES: [10, 20, 34, 57] as const,
  BASE_STATES: ['STABLE','CHANGING','RESOLVING','RESONANT','DORMANT'] as const,
  MOD_TYPES: ['gain','noise','bleed','magnitude','sensitivity','resonance'] as const,
  SENSE_TYPES: ['sight','taste','touch','smell','sound','proprioception'] as const,
  POINT_TYPES: ['input','output','memory','lateral','temporal','field'] as const,
  ATTITUDES: ['curious','playful','serious','mystical','analytical'] as const,
} as const;

export type MeshIndex = 0|1|2|3|4;
export type LayerIndex = 0|1|2|3|4|5|6|7|8|9|10|11|12;
export type CenterIndex = 0|1|2|3|4|5|6|7|8;
export type NodeIndex = number;
export type LineIndex = 1|2|3|4|5|6;
export type ColorIndex = 0|1|2|3|4|5;
export type ToneIndex = 0|1|2|3|4|5;
export type ZodiacIndex = 0|1|2|3|4|5|6|7|8|9|10|11;
export type HouseIndex = 0|1|2|3|4|5|6|7|8|9|10|11;
export type BaseState = typeof CANON.BASE_STATES[number];
export type ModType = typeof CANON.MOD_TYPES[number];
export type SenseType = typeof CANON.SENSE_TYPES[number];
export type PointType = typeof CANON.POINT_TYPES[number];
export type Attitude = typeof CANON.ATTITUDES[number];

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ResonanceConfig {
  baseTickIntervalMs: number;
  adaptiveTickRate: boolean;
  minTickIntervalMs: number;
  maxTickIntervalMs: number;
  maxLoadedNodes: number;
  proximityRadius: number;
  maxNeighborScan: number;
  tensionAccumulationRate: number;
  tensionDecayRate: number;
  coherenceDecayRate: number;
  coherenceBoostResonant: number;
  senseDecayRate: number;
  connectionDecayRate: number;
  noiseIntervalTicks: number;
  learningIntervalTicks: number;
  stableToChangingThreshold: number;
  changingToResolvingThreshold: number;
  resolvingToStableThreshold: number;
  neighborResonanceThreshold: number;
  changingMutationRate: number;
  resonantSenseBoost: number;
  dormantWakeRate: number;
  witPool: string[];
  defaultAttitude: Attitude;
  attitudeMorphThresholds: { mystical: number; analytical: number };
  apiBase: string;
  autoStart: boolean;
  // Essential integrations
  mcpEndpoint: string;
  mcpEnabled: boolean;
  chunkSize: number;
  chunkOverlap: number;
  embeddingDimension: number;
  codeGenEnabled: boolean;
}

export const DEFAULT_CONFIG: ResonanceConfig = {
  baseTickIntervalMs: 250,
  adaptiveTickRate: true,
  minTickIntervalMs: 100,
  maxTickIntervalMs: 1000,
  maxLoadedNodes: 1000,
  proximityRadius: 2,
  maxNeighborScan: 24,
  tensionAccumulationRate: 0.01,
  tensionDecayRate: 0.001,
  coherenceDecayRate: 0.001,
  coherenceBoostResonant: 0.05,
  senseDecayRate: 0.002,
  connectionDecayRate: 0.001,
  noiseIntervalTicks: 100,
  learningIntervalTicks: 50,
  stableToChangingThreshold: 0.85,
  changingToResolvingThreshold: 0.95,
  resolvingToStableThreshold: 0.5,
  neighborResonanceThreshold: 1.5,
  changingMutationRate: 0.1,
  resonantSenseBoost: 0.02,
  dormantWakeRate: 0.001,
  witPool: [
    'Oh, you stink like a fish 🐟',
    'Interesting choice, very... you',
    'The universe is listening',
    'That resonates with something deep',
    'I see what you did there',
    'The coherence just spiked',
    'Patterns are emerging from the noise',
    'The mesh is whispering your name',
    'A node just woke up for you',
    'Reality bends at the edges',
  ],
  defaultAttitude: 'curious',
  attitudeMorphThresholds: { mystical: 0.7, analytical: 0.3 },
  apiBase: 'http://localhost:10000',
  autoStart: false,
  mcpEndpoint: 'http://localhost:3000/mcp',
  mcpEnabled: false,
  chunkSize: 512,
  chunkOverlap: 50,
  embeddingDimension: 384,
  codeGenEnabled: true,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORE INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Address {
  mesh: MeshIndex;
  layer: LayerIndex;
  center: CenterIndex;
  node: NodeIndex;
  line: LineIndex;
  color: ColorIndex;
  tone: ToneIndex;
  zodiac: ZodiacIndex;
  house: HouseIndex;
  dimension: number;
  arcDegree: number;
}

export interface Modification {
  type: ModType;
  value: number;
  active: boolean;
  origin: 'seed' | 'morph' | 'external' | 'resonance';
  createdAt: number;
}

export interface Sense {
  type: SenseType;
  intensity: number;
  data: unknown;
  lastStimulus: number;
}

export interface ConnectingPoint {
  type: PointType;
  connected: Address | null;
  strength: number;
  bandwidth: number;
  latency: number;
}

export interface NodeState {
  address: Address;
  baseState: BaseState;
  tension: number;
  modifications: Modification[];
  senses: Sense[];
  connectingPoints: ConnectingPoint[];
  coherence: number;
  lastUpdated: number;
  birthTick: number;
  activationCount: number;
}

export interface SuperBaseEntry {
  id: string;
  address: Address;
  content: unknown;
  metadata: {
    gate?: number;
    line?: number;
    codon?: string;
    timestamp: number;
    resonanceScore?: number;
    source?: string;
    confidence?: number;
  };
}

export interface PersonalityProfile {
  userId: string;
  birthChart: Record<string, unknown>;
  preferences: Record<string, unknown>;
  learningHistory: Array<{
    timestamp: number;
    input: unknown;
    address: Address;
    coherence: number;
  }>;
  adaptationLevel: number;
  lastInteraction: number;
  interactionCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAG INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DocumentChunk {
  id: string;
  sourceId: string;
  content: string;
  embedding: number[];
  address: Address;
  metadata: {
    startChar: number;
    endChar: number;
    lineNumber: number;
    fileType: string;
    confidence: number;
  };
}

export interface IngestedDocument {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  chunks: DocumentChunk[];
  ingestedAt: number;
  meshNodes: string[];
}

export interface RAGQuery {
  query: string;
  topK: number;
  minConfidence?: number;
}

export interface RAGResult {
  chunks: DocumentChunk[];
  combinedContext: string;
  meshResonance: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MCP INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  endpoint: string;
  enabled: boolean;
  lastUsed: number;
  successRate: number;
}

export interface MCPRequest {
  tool: string;
  params: Record<string, unknown>;
  correlationId: string;
}

export interface MCPResponse {
  correlationId: string;
  result: unknown;
  error?: string;
  latency: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CODE GENERATION INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CodeArtifact {
  id: string;
  filename: string;
  language: string;
  content: string;
  generatedFrom: string;
  meshAddress: Address;
  dependencies: string[];
  tested: boolean;
  testResults?: string;
}

export interface CodeRequest {
  intent: string;
  context: string;
  language: string;
  constraints?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBSERVABILITY
// ═══════════════════════════════════════════════════════════════════════════════

export interface RoutingTrace {
  tickCount: number;
  hashPath: string;
  resonanceScore: number;
  personalizationDepth: number;
  meshNodesTouched: number;
  superBaseMatches: number;
  elapsedMs: number;
  ragChunksRetrieved?: number;
  mcpToolsUsed?: string[];
  mcpLatency?: number;
  codeGenerated?: boolean;
  codeArtifactId?: string;
}

export interface RoutingResult {
  address: Address;
  response: string;
  superBaseEntry: SuperBaseEntry | null;
  coherence: number;
  morphState: number;
  personality: {
    attitude: Attitude;
    wit: string;
  };
  trace: RoutingTrace;
  ragResult?: RAGResult;
  codeArtifact?: CodeArtifact;
}

export interface SystemMetrics {
  tickCount: number;
  isRunning: boolean;
  currentTickInterval: number;
  globalCoherence: number;
  loadedNodeCount: number;
  totalNodeCapacity: number;
  activeConnections: number;
  attractorCount: number;
  personalityCount: number;
  superBaseSize: number;
  averageNodeAge: number;
  loadFactor: number;
  documentsIngested: number;
  totalChunks: number;
  toolsAvailable: number;
  toolsOnline: number;
  artifactsGenerated: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PURE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export function hashInput(input: unknown): number {
  const str = JSON.stringify(input);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

export function calculateArcDegree(): number {
  const now = new Date();
  return ((now.getMinutes() * 6) + (now.getSeconds() * 0.1)) % 360;
}

export function calculateResonanceScore(addr1: Address, addr2: Address): number {
  let score = 1.0;
  if (addr1.mesh === addr2.mesh) score += 0.20;
  if (addr1.layer === addr2.layer) score += 0.20;
  if (addr1.center === addr2.center) score += 0.15;
  if (addr1.line === addr2.line) score += 0.15;
  if (addr1.node === addr2.node) score += 0.10;
  if (addr1.color === addr2.color) score += 0.08;
  if (addr1.tone === addr2.tone) score += 0.08;
  const zodiacDiff = Math.abs(addr1.zodiac - addr2.zodiac);
  score += (1 - Math.min(zodiacDiff, CANON.ZODIAC_COUNT - zodiacDiff) / 6) * 0.10;
  const houseDiff = Math.abs(addr1.house - addr2.house);
  score += (1 - Math.min(houseDiff, CANON.HOUSE_COUNT - houseDiff) / 6) * 0.05;
  return score;
}

export function addressToKey(address: Address): string {
  return `${address.mesh}_${address.layer}_${address.center}_${address.node}_${address.line}`;
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function random01(seed?: number): number {
  if (seed !== undefined) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }
  return Math.random();
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORIES
// ═══════════════════════════════════════════════════════════════════════════════

export function createAddress(partial: Partial<Address> = {}): Address {
  return {
    mesh: (partial.mesh ?? 0) as MeshIndex,
    layer: (partial.layer ?? 0) as LayerIndex,
    center: (partial.center ?? 4) as CenterIndex,
    node: partial.node ?? 0,
    line: (partial.line ?? 1) as LineIndex,
    color: (partial.color ?? 0) as ColorIndex,
    tone: (partial.tone ?? 0) as ToneIndex,
    zodiac: (partial.zodiac ?? 0) as ZodiacIndex,
    house: (partial.house ?? 0) as HouseIndex,
    dimension: partial.dimension ?? random01(),
    arcDegree: partial.arcDegree ?? calculateArcDegree(),
  };
}

export function createModification(type: ModType, seed?: number): Modification {
  return {
    type, value: random01(seed), active: random01(seed ? seed + 1 : undefined) > 0.5,
    origin: 'seed', createdAt: Date.now(),
  };
}

export function createSense(type: SenseType, seed?: number): Sense {
  return { type, intensity: random01(seed), data: null, lastStimulus: 0 };
}

export function createConnectingPoint(type: PointType): ConnectingPoint {
  return {
    type, connected: null, strength: 0,
    bandwidth: random01(), latency: Math.floor(random01() * 50),
  };
}

export function createNodeState(partial: Partial<NodeState> = {}): NodeState {
  const address = partial.address ?? createAddress();
  const seed = hashInput(address);
  return {
    address,
    baseState: partial.baseState ?? 'STABLE',
    tension: partial.tension ?? random01(seed) * 0.3,
    modifications: partial.modifications ?? CANON.MOD_TYPES.map((t, i) => createModification(t, seed + i)),
    senses: partial.senses ?? CANON.SENSE_TYPES.map((t, i) => createSense(t, seed + i + 10)),
    connectingPoints: partial.connectingPoints ?? CANON.POINT_TYPES.map(t => createConnectingPoint(t)),
    coherence: partial.coherence ?? (random01(seed + 20) * 0.7 + 0.3),
    lastUpdated: Date.now(),
    birthTick: partial.birthTick ?? 0,
    activationCount: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

export class ResonanceOrchestrator {
  private mesh: Map<string, NodeState> = new Map();
  private superBase: Map<string, SuperBaseEntry> = new Map();
  private personalities: Map<string, PersonalityProfile> = new Map();
  private connectionWeights: Map<string, number> = new Map();
  private pathUsageHistory: Map<string, number> = new Map();
  private attractors: Map<string, number> = new Map();
  private loadedNodeKeys: Set<string> = new Set();
  private seedGates: readonly number[] = CANON.SEED_GATES;

  private globalCoherence: number = 0.5;
  private currentTime: number = Date.now();
  private tickCount: number = 0;
  private isRunning: boolean = false;
  private tickInterval: number | undefined;
  private currentTickIntervalMs: number;

  private personality: {
    witPool: string[];
    currentWitIndex: number;
    attitude: Attitude;
    morphState: number;
  };

  private config: ResonanceConfig;

  // RAG
  private documents: Map<string, IngestedDocument> = new Map();
  private chunks: Map<string, DocumentChunk> = new Map();

  // MCP
  private mcpTools: Map<string, MCPTool> = new Map();

  // Code
  private codeArtifacts: Map<string, CodeArtifact> = new Map();

  // Events
  private onTickCallbacks: Array<(metrics: SystemMetrics) => void> = [];
  private onStateChangeCallbacks: Array<(node: NodeState, oldState: BaseState) => void> = [];
  private onRouteCallbacks: Array<(result: RoutingResult) => void> = [];
  private onIngestCallbacks: Array<(doc: IngestedDocument) => void> = [];
  private onCodeGenCallbacks: Array<(artifact: CodeArtifact) => void> = [];

  constructor(config: Partial<ResonanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentTickIntervalMs = this.config.baseTickIntervalMs;

    this.personality = {
      witPool: [...this.config.witPool],
      currentWitIndex: Math.floor(random01() * this.config.witPool.length),
      attitude: this.config.defaultAttitude,
      morphState: 0,
    };

    this.initializeMeshLazy();
    if (this.config.autoStart) this.startAutonomousLoop();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROL
  // ═══════════════════════════════════════════════════════════════════════════

  public startAutonomousLoop(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const tick = () => {
      if (!this.isRunning) return;
      const startTime = performance.now();
      this.tick();
      const elapsed = performance.now() - startTime;

      if (this.config.adaptiveTickRate) {
        const loadFactor = elapsed / this.currentTickIntervalMs;
        if (loadFactor > 0.8 && this.currentTickIntervalMs < this.config.maxTickIntervalMs) {
          this.currentTickIntervalMs = Math.min(this.config.maxTickIntervalMs, this.currentTickIntervalMs * 1.1);
        } else if (loadFactor < 0.2 && this.currentTickIntervalMs > this.config.minTickIntervalMs) {
          this.currentTickIntervalMs = Math.max(this.config.minTickIntervalMs, this.currentTickIntervalMs * 0.95);
        }
      }

      this.tickInterval = window.setTimeout(tick, this.currentTickIntervalMs);
    };

    this.tickInterval = window.setTimeout(tick, this.currentTickIntervalMs);
  }

  public stopAutonomousLoop(): void {
    if (this.tickInterval !== undefined) {
      clearTimeout(this.tickInterval);
      this.tickInterval = undefined;
    }
    this.isRunning = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAG
  // ═══════════════════════════════════════════════════════════════════════════

  public async ingestDocument(filename: string, content: string, contentType: string = 'text/plain'): Promise<IngestedDocument> {
    const docId = `doc_${hashInput(filename + Date.now())}`;
    const chunks = this.chunkDocument(docId, content, contentType);

    for (const chunk of chunks) {
      chunk.embedding = this.generateEmbedding(chunk.content);
      this.chunks.set(chunk.id, chunk);
    }

    const meshNodes: string[] = [];
    for (const chunk of chunks) {
      const address = this.calculateResonanceAddress(chunk.content, {
        userId: 'system', birthChart: {}, preferences: {},
        learningHistory: [], adaptationLevel: 1, lastInteraction: Date.now(), interactionCount: 0,
      });
      chunk.address = address;

      const key = addressToKey(address);
      if (!this.mesh.has(key)) this.loadNodesInProximity(address, 1);
      meshNodes.push(key);

      this.addToSuperBase({
        id: chunk.id, address, content: chunk.content,
        metadata: { timestamp: Date.now(), source: filename, confidence: 0.9 },
      });
    }

    const doc: IngestedDocument = {
      id: docId, filename, contentType, size: content.length,
      chunks, ingestedAt: Date.now(), meshNodes,
    };

    this.documents.set(docId, doc);
    this.onIngestCallbacks.forEach(cb => cb(doc));
    return doc;
  }

  public async queryRAG(query: RAGQuery): Promise<RAGResult> {
    const queryEmbedding = this.generateEmbedding(query.query);

    const scored = Array.from(this.chunks.values())
      .map(chunk => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
      .filter(s => s.score > (query.minConfidence ?? 0.6))
      .sort((a, b) => b.score - a.score)
      .slice(0, query.topK);

    const chunks = scored.map(s => s.chunk);
    const combinedContext = chunks.map(c => c.content).join('\n\n---\n\n');

    return { chunks, combinedContext, meshResonance: scored.length > 0 ? scored[0].score : 0 };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MCP
  // ═══════════════════════════════════════════════════════════════════════════

  public registerMCPTool(tool: MCPTool): void {
    this.mcpTools.set(tool.name, tool);
  }

  public async callMCPTool(request: MCPRequest): Promise<MCPResponse> {
    const tool = this.mcpTools.get(request.tool);
    if (!tool) {
      return { correlationId: request.correlationId, result: null, error: `Tool ${request.tool} not found`, latency: 0 };
    }

    const start = performance.now();
    try {
      const response = await fetch(`${this.config.mcpEndpoint}/${request.tool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.params),
      });

      const result = await response.json();
      const latency = performance.now() - start;

      tool.lastUsed = Date.now();
      tool.successRate = tool.successRate * 0.9 + 0.1;

      return { correlationId: request.correlationId, result, latency };
    } catch (error) {
      const latency = performance.now() - start;
      tool.successRate = tool.successRate * 0.9;
      return { correlationId: request.correlationId, result: null, error: String(error), latency };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CODE GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  public async generateCode(request: CodeRequest): Promise<CodeArtifact> {
    const ragResult = await this.queryRAG({ query: request.intent, topK: 5, minConfidence: 0.7 });

    const artifactId = `code_${hashInput(request.intent + Date.now())}`;
    const content = this.composeCode(request, ragResult.combinedContext);

    const artifact: CodeArtifact = {
      id: artifactId,
      filename: `generated_${artifactId}.${request.language}`,
      language: request.language,
      content,
      generatedFrom: request.intent,
      meshAddress: createAddress(),
      dependencies: this.extractDependencies(content),
      tested: false,
    };

    this.codeArtifacts.set(artifactId, artifact);
    this.onCodeGenCallbacks.forEach(cb => cb(artifact));
    return artifact;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ROUTING
  // ═══════════════════════════════════════════════════════════════════════════

  public async routeData(input: unknown, userId: string): Promise<RoutingResult> {
    const startTime = performance.now();

    let profile = this.personalities.get(userId);
    if (!profile) {
      profile = await this.createPersonalityProfile(userId);
      this.personalities.set(userId, profile);
    }

    profile.lastInteraction = Date.now();
    profile.interactionCount++;

    const address = this.calculateResonanceAddress(input, profile);
    this.loadNodesInProximity(address, this.config.proximityRadius);

    let ragResult: RAGResult | undefined;
    let ragChunksRetrieved = 0;
    if (this.documents.size > 0 && typeof input === 'string' && input.length > 10) {
      ragResult = await this.queryRAG({ query: input, topK: 3, minConfidence: 0.6 });
      ragChunksRetrieved = ragResult.chunks.length;
    }

    const superBaseEntry = this.retrieveFromSuperBase(address, profile);

    let mcpToolsUsed: string[] | undefined;
    let mcpLatency: number | undefined;
    if (this.config.mcpEnabled && typeof input === 'string') {
      for (const [name, tool] of this.mcpTools) {
        if (input.toLowerCase().includes(name.toLowerCase()) && tool.enabled) {
          const mcpRes = await this.callMCPTool({ tool: name, params: { query: input }, correlationId: `corr_${Date.now()}` });
          mcpToolsUsed = [name];
          mcpLatency = mcpRes.latency;
          break;
        }
      }
    }

    const personalized = this.personalizeResponse(superBaseEntry, profile, ragResult);
    this.updateMeshState(address, input);
    const response = this.generateResponse(personalized, profile, ragResult);

    let codeArtifact: CodeArtifact | undefined;
    let codeGenerated = false;
    if (this.config.codeGenEnabled && typeof input === 'string' &&
        (input.includes('code') || input.includes('build') || input.includes('create'))) {
      codeArtifact = await this.generateCode({ intent: input, context: ragResult?.combinedContext ?? '', language: 'typescript' });
      codeGenerated = true;
    }

    const trace: RoutingTrace = {
      tickCount: this.tickCount,
      hashPath: addressToKey(address),
      resonanceScore: superBaseEntry?.metadata.resonanceScore ?? 0,
      personalizationDepth: profile.adaptationLevel,
      meshNodesTouched: this.mesh.size,
      superBaseMatches: this.superBase.size,
      elapsedMs: performance.now() - startTime,
      ragChunksRetrieved,
      mcpToolsUsed,
      mcpLatency,
      codeGenerated,
      codeArtifactId: codeArtifact?.id,
    };

    const result: RoutingResult = {
      address, response, superBaseEntry,
      coherence: this.globalCoherence,
      morphState: this.personality.morphState,
      personality: { attitude: this.personality.attitude, wit: this.personality.witPool[this.personality.currentWitIndex] },
      trace, ragResult, codeArtifact,
    };

    this.onRouteCallbacks.forEach(cb => cb(result));
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  public onTick(callback: (metrics: SystemMetrics) => void): () => void {
    this.onTickCallbacks.push(callback);
    return () => { const idx = this.onTickCallbacks.indexOf(callback); if (idx >= 0) this.onTickCallbacks.splice(idx, 1); };
  }

  public onStateChange(callback: (node: NodeState, oldState: BaseState) => void): () => void {
    this.onStateChangeCallbacks.push(callback);
    return () => { const idx = this.onStateChangeCallbacks.indexOf(callback); if (idx >= 0) this.onStateChangeCallbacks.splice(idx, 1); };
  }

  public onRoute(callback: (result: RoutingResult) => void): () => void {
    this.onRouteCallbacks.push(callback);
    return () => { const idx = this.onRouteCallbacks.indexOf(callback); if (idx >= 0) this.onRouteCallbacks.splice(idx, 1); };
  }

  public onIngest(callback: (doc: IngestedDocument) => void): () => void {
    this.onIngestCallbacks.push(callback);
    return () => { const idx = this.onIngestCallbacks.indexOf(callback); if (idx >= 0) this.onIngestCallbacks.splice(idx, 1); };
  }

  public onCodeGen(callback: (artifact: CodeArtifact) => void): () => void {
    this.onCodeGenCallbacks.push(callback);
    return () => { const idx = this.onCodeGenCallbacks.indexOf(callback); if (idx >= 0) this.onCodeGenCallbacks.splice(idx, 1); };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE ACCESS
  // ═══════════════════════════════════════════════════════════════════════════

  public getMetrics(): SystemMetrics {
    const now = Date.now();
    let totalAge = 0;
    this.mesh.forEach(node => { totalAge += now - node.birthTick; });
    const avgAge = this.mesh.size > 0 ? totalAge / this.mesh.size : 0;
    const loadFactor = this.mesh.size / this.config.maxLoadedNodes;
    let activeConnections = 0;
    this.mesh.forEach(node => { activeConnections += node.connectingPoints.filter(cp => cp.connected !== null).length; });

    return {
      tickCount: this.tickCount, isRunning: this.isRunning,
      currentTickInterval: this.currentTickIntervalMs,
      globalCoherence: this.globalCoherence,
      loadedNodeCount: this.mesh.size, totalNodeCapacity: this.config.maxLoadedNodes,
      activeConnections, attractorCount: this.attractors.size,
      personalityCount: this.personalities.size, superBaseSize: this.superBase.size,
      averageNodeAge: avgAge, loadFactor,
      documentsIngested: this.documents.size,
      totalChunks: this.chunks.size,
      toolsAvailable: this.mcpTools.size,
      toolsOnline: Array.from(this.mcpTools.values()).filter(t => t.successRate > 0.5).length,
      artifactsGenerated: this.codeArtifacts.size,
    };
  }

  public getLoadedNodes(): NodeState[] { return Array.from(this.mesh.values()); }
  public getMeshState(address: Address): NodeState | undefined { return this.mesh.get(addressToKey(address)); }
  public getGlobalCoherence(): number { return this.globalCoherence; }
  public getPersonality() { return { attitude: this.personality.attitude, morphState: this.personality.morphState, currentWit: this.personality.witPool[this.personality.currentWitIndex], witPoolSize: this.personality.witPool.length }; }
  public setAttitude(attitude: Attitude): void { this.personality.attitude = attitude; }
  public getTickCount(): number { return this.tickCount; }
  public isAutonomous(): boolean { return this.isRunning; }
  public getAttractors(): Map<string, number> { return new Map(this.attractors); }
  public getConnectionWeights(): Map<string, number> { return new Map(this.connectionWeights); }
  public getConfig(): ResonanceConfig { return { ...this.config }; }
  public updateConfig(updates: Partial<ResonanceConfig>): void { this.config = { ...this.config, ...updates }; }
  public addToSuperBase(entry: SuperBaseEntry): void { this.superBase.set(entry.id, entry); }
  public getDocuments(): IngestedDocument[] { return Array.from(this.documents.values()); }
  public getCodeArtifacts(): CodeArtifact[] { return Array.from(this.codeArtifacts.values()); }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE — Engine
  // ═══════════════════════════════════════════════════════════════════════════

  private tick(): void {
    this.tickCount++;
    this.currentTime = Date.now();
    this.mesh.forEach((nodeState) => { this.updateNodeState(nodeState); });
    this.propagateSignals();
    this.applyMorphingPhysics();
    this.decayStates();
    this.introduceNoise();
    this.updateGlobalCoherence();
    this.learnFromPatterns();
    const metrics = this.getMetrics();
    this.onTickCallbacks.forEach(cb => cb(metrics));
  }

  private updateNodeState(nodeState: NodeState): void {
    const oldState = nodeState.baseState;
    const cfg = this.config;
    const internalPressure = this.calculateInternalPressure(nodeState);
    nodeState.tension = clamp01(nodeState.tension + internalPressure * cfg.tensionAccumulationRate);

    if (nodeState.tension > cfg.stableToChangingThreshold && nodeState.baseState === 'STABLE') {
      nodeState.baseState = 'CHANGING';
    } else if (nodeState.tension > cfg.changingToResolvingThreshold && nodeState.baseState === 'CHANGING') {
      nodeState.baseState = 'RESOLVING';
      nodeState.address.line = ((nodeState.address.line % CANON.LINE_COUNT) + 1) as LineIndex;
      nodeState.tension = 0.3;
    } else if (nodeState.baseState === 'RESOLVING' && nodeState.tension < cfg.resolvingToStableThreshold) {
      nodeState.baseState = 'STABLE';
    }

    nodeState.coherence = Math.max(0.1, nodeState.coherence - cfg.coherenceDecayRate);
    const neighborResonance = this.calculateNeighborResonance(nodeState);
    if (neighborResonance > cfg.neighborResonanceThreshold) {
      nodeState.baseState = 'RESONANT';
      nodeState.coherence = clamp01(nodeState.coherence + cfg.coherenceBoostResonant);
    }
    nodeState.lastUpdated = this.currentTime;
    if (nodeState.baseState !== oldState) {
      this.onStateChangeCallbacks.forEach(cb => cb(nodeState, oldState));
    }
  }

  private calculateInternalPressure(nodeState: NodeState): number {
    let pressure = 0;
    const activeModifications = nodeState.modifications.filter(m => m.active).length;
    pressure += (activeModifications / CANON.MOD_TYPES.length) * 0.3;
    const avgSenseIntensity = nodeState.senses.reduce((sum, s) => sum + s.intensity, 0) / nodeState.senses.length;
    pressure += avgSenseIntensity * 0.2;
    const unconnectedPoints = nodeState.connectingPoints.filter(cp => cp.connected === null).length;
    pressure += (unconnectedPoints / CANON.POINT_TYPES.length) * 0.2;
    pressure += (1 - nodeState.coherence) * 0.1;
    const age = this.currentTime - nodeState.birthTick;
    pressure += Math.min(age / 60000, 1) * 0.1;
    return clamp01(pressure);
  }

  private calculateNeighborResonance(nodeState: NodeState): number {
    let totalResonance = 0, neighborCount = 0;
    const cfg = this.config;
    const layerNodes = Array.from(this.mesh.values()).filter(
      (n) => n.address.layer === nodeState.address.layer && n !== nodeState
    );
    for (const otherNode of layerNodes) {
      const resonanceScore = calculateResonanceScore(nodeState.address, otherNode.address);
      if (resonanceScore > cfg.neighborResonanceThreshold) {
        totalResonance += resonanceScore; neighborCount++;
        if (neighborCount >= cfg.maxNeighborScan) break;
      }
    }
    return neighborCount > 0 ? totalResonance / neighborCount : 0;
  }

  private propagateSignals(): void {
    const signalMap = new Map<string, number>();
    this.mesh.forEach((nodeState, key) => {
      const signal = nodeState.coherence * (nodeState.baseState === 'RESONANT' ? 1.5 : 1);
      signalMap.set(key, signal);
    });
    this.mesh.forEach((nodeState) => {
      nodeState.connectingPoints.forEach((point) => {
        if (point.connected) {
          const connectedKey = addressToKey(point.connected);
          const signal = signalMap.get(connectedKey) || 0;
          point.strength = clamp01(point.strength + signal * 0.01);
        }
      });
    });
  }

  private applyMorphingPhysics(): void {
    const cfg = this.config;
    this.mesh.forEach((nodeState) => {
      if (nodeState.baseState === 'CHANGING') {
        nodeState.modifications.forEach((mod) => {
          mod.value = clamp01(mod.value + (Math.random() - 0.5) * cfg.changingMutationRate);
          mod.origin = 'morph';
        });
      }
      if (nodeState.baseState === 'RESONANT') {
        nodeState.senses.forEach((sense) => { sense.intensity = clamp01(sense.intensity + cfg.resonantSenseBoost); });
      }
      if (nodeState.baseState === 'DORMANT') {
        nodeState.coherence = Math.min(0.5, nodeState.coherence + cfg.dormantWakeRate);
      }
    });
  }

  private decayStates(): void {
    const cfg = this.config;
    this.mesh.forEach((nodeState) => {
      nodeState.tension = Math.max(0, nodeState.tension - cfg.tensionDecayRate);
      nodeState.senses.forEach((sense) => { sense.intensity = Math.max(0, sense.intensity - cfg.senseDecayRate); });
      nodeState.connectingPoints.forEach((point) => { point.strength = Math.max(0, point.strength - cfg.connectionDecayRate); });
    });
  }

  private introduceNoise(): void {
    if (this.tickCount % this.config.noiseIntervalTicks !== 0) return;
    if (this.mesh.size === 0) return;
    const randomNodeIndex = Math.floor(Math.random() * this.mesh.size);
    let index = 0;
    this.mesh.forEach((nodeState) => {
      if (index === randomNodeIndex) {
        nodeState.tension = clamp01(nodeState.tension + Math.random() * 0.1);
        const senseIdx = Math.floor(Math.random() * nodeState.senses.length);
        nodeState.senses[senseIdx].intensity = clamp01(nodeState.senses[senseIdx].intensity + Math.random() * 0.2);
      }
      index++;
    });
  }

  private learnFromPatterns(): void {
    if (this.tickCount % this.config.learningIntervalTicks !== 0) return;
    this.mesh.forEach((nodeState, key) => {
      if (nodeState.baseState === 'STABLE' && nodeState.coherence > 0.6) {
        const attractorKey = `${nodeState.address.mesh}_${nodeState.address.layer}_${nodeState.address.center}`;
        this.attractors.set(attractorKey, (this.attractors.get(attractorKey) || 0) + 1);
      }
      nodeState.connectingPoints.forEach((point) => {
        if (point.connected && nodeState.baseState === 'RESONANT') {
          const connectionKey = `${key}_${addressToKey(point.connected)}`;
          const currentWeight = this.connectionWeights.get(connectionKey) || 1;
          this.connectionWeights.set(connectionKey, currentWeight * 1.01);
        }
      });
    });
  }

  private updateGlobalCoherence(): void {
    let totalCoherence = 0, count = 0;
    this.mesh.forEach((nodeState) => { totalCoherence += nodeState.coherence; count++; });
    this.globalCoherence = count > 0 ? totalCoherence / count : 0.5;
    this.personality.morphState = this.globalCoherence;
    const thresholds = this.config.attitudeMorphThresholds;
    if (this.globalCoherence > thresholds.mystical) this.personality.attitude = 'mystical';
    else if (this.globalCoherence < thresholds.analytical) this.personality.attitude = 'analytical';
    else this.personality.attitude = 'curious';
  }

  private initializeMeshLazy(): void {
    for (const gate of this.seedGates) {
      for (let layer = 0; layer < CANON.LAYER_COUNT; layer++) {
        const address = createAddress({ mesh: 0, layer: layer as LayerIndex, center: 4, node: gate - 1, line: 1 });
        const nodeState = createNodeState({ address, baseState: 'STABLE', coherence: 0.8, birthTick: this.tickCount });
        const key = addressToKey(address);
        this.mesh.set(key, nodeState);
        this.loadedNodeKeys.add(key);
      }
    }
  }

  public loadNodesInProximity(centerAddress: Address, radius: number = this.config.proximityRadius): void {
    for (let center = 0; center < CANON.CENTER_COUNT; center++) {
      for (let node = 0; node < CANON.NODE_COUNT; node++) {
        const address = createAddress({
          ...centerAddress, center: center as CenterIndex, node,
          line: Math.floor(Math.random() * CANON.LINE_COUNT) + 1 as LineIndex,
        });
        const key = addressToKey(address);
        if (!this.loadedNodeKeys.has(key) && this.mesh.size < this.config.maxLoadedNodes) {
          this.mesh.set(key, createNodeState({ address, birthTick: this.tickCount }));
          this.loadedNodeKeys.add(key);
        }
      }
    }
  }

  private calculateResonanceAddress(input: unknown, profile: PersonalityProfile): Address {
    const hash = hashInput(input);
    const profileHash = hashInput(profile.userId);
    const combined = hash ^ profileHash;
    return createAddress({
      mesh: (combined % CANON.MESH_COUNT) as MeshIndex,
      layer: ((combined >> 4) % CANON.LAYER_COUNT) as LayerIndex,
      center: ((combined >> 8) % CANON.CENTER_COUNT) as CenterIndex,
      node: (combined >> 12) % CANON.NODE_COUNT,
      line: (((combined >> 16) % CANON.LINE_COUNT) + 1) as LineIndex,
      color: ((combined >> 20) % CANON.COLOR_COUNT) as ColorIndex,
      tone: ((combined >> 24) % CANON.TONE_COUNT) as ToneIndex,
      zodiac: ((combined >> 28) % CANON.ZODIAC_COUNT) as ZodiacIndex,
      house: ((combined >> 32) % CANON.HOUSE_COUNT) as HouseIndex,
    });
  }

  private retrieveFromSuperBase(address: Address, profile: PersonalityProfile): SuperBaseEntry | null {
    let bestMatch: SuperBaseEntry | null = null, bestScore = 0;
    this.superBase.forEach((entry) => {
      const score = calculateResonanceScore(address, entry.address);
      if (score > bestScore) { bestScore = score; bestMatch = entry; }
    });
    return bestMatch;
  }

  private personalizeResponse(entry: SuperBaseEntry | null, profile: PersonalityProfile, ragResult?: RAGResult): unknown {
    if (!entry && !ragResult) {
      return { content: "The pattern hasn't crystallized yet. Let me listen deeper.", personalized: false };
    }
    const adapted: Record<string, unknown> = entry ? { ...entry.content as Record<string, unknown> } : {};
    if (ragResult) {
      adapted.ragContext = ragResult.combinedContext;
      adapted.ragConfidence = ragResult.chunks.length > 0 ? 0.8 : 0;
    }
    if (profile.adaptationLevel > 0.7) adapted.tone = 'intimate';
    else if (profile.adaptationLevel < 0.3) adapted.tone = 'formal';
    else adapted.tone = 'conversational';
    return { content: adapted, personalized: true, adaptationLevel: profile.adaptationLevel };
  }

  private updateMeshState(address: Address, input: unknown): void {
    const key = addressToKey(address);
    const nodeState = this.mesh.get(key);
    if (nodeState) {
      nodeState.tension = clamp01(nodeState.tension + 0.1);
      nodeState.activationCount++;
      if (nodeState.tension > this.config.stableToChangingThreshold && nodeState.baseState === 'STABLE') {
        nodeState.baseState = 'CHANGING';
      }
      nodeState.coherence = Math.max(0, nodeState.coherence - 0.05);
      nodeState.lastUpdated = Date.now();
      this.updateGlobalCoherence();
    }
  }

  private generateResponse(personalized: unknown, profile: PersonalityProfile, ragResult?: RAGResult): string {
    this.personality.currentWitIndex = (this.personality.currentWitIndex + 1) % this.personality.witPool.length;
    const wit = this.personality.witPool[this.personality.currentWitIndex];
    let context = '';
    if (ragResult && ragResult.chunks.length > 0) {
      context = ` | Knowledge: ${ragResult.chunks.length} chunks`;
    }
    return `${wit} (Coherence: ${(this.globalCoherence * 100).toFixed(0)}% | Attitude: ${this.personality.attitude}${context})`;
  }

  private async createPersonalityProfile(userId: string): Promise<PersonalityProfile> {
    try {
      const response = await fetch(`${this.config.apiBase}/consciousness/profile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const birthChart = await response.json();
      return { userId, birthChart, preferences: {}, learningHistory: [], adaptationLevel: 0.5, lastInteraction: Date.now(), interactionCount: 0 };
    } catch (error) {
      console.error('Failed to create personality profile:', error);
      return { userId, birthChart: {}, preferences: {}, learningHistory: [], adaptationLevel: 0.5, lastInteraction: Date.now(), interactionCount: 0 };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE — RAG Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  private chunkDocument(docId: string, content: string, contentType: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const chunkSize = this.config.chunkSize;
    const overlap = this.config.chunkOverlap;
    let start = 0;
    let chunkIndex = 0;
    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      chunks.push({
        id: `chunk_${docId}_${chunkIndex}`,
        sourceId: docId,
        content: content.slice(start, end),
        embedding: [],
        address: createAddress(),
        metadata: {
          startChar: start, endChar: end,
          lineNumber: content.slice(0, start).split('\n').length,
          fileType: contentType,
          confidence: 0.8,
        },
      });
      start = end - overlap;
      chunkIndex++;
    }
    return chunks;
  }

  private generateEmbedding(text: string): number[] {
    const dim = this.config.embeddingDimension;
    const hash = hashInput(text);
    const embedding: number[] = [];
    for (let i = 0; i < dim; i++) {
      embedding.push(Math.sin(hash * (i + 1) * 0.1) * 0.5 + 0.5);
    }
    return embedding;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE — Code Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  private composeCode(request: CodeRequest, context: string): string {
    return `// Generated from: "${request.intent}"
// Context: ${context.slice(0, 200)}...
// Language: ${request.language}

export function generatedFunction() {
  // TODO: Implement based on intent
  console.log("Generated from orchestrator");
  return true;
}`;
  }

  private extractDependencies(code: string): string[] {
    const deps: string[] = [];
    const importMatches = code.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const dep = match.match(/from\s+['"]([^'"]+)['"]/)?.[1];
        if (dep) deps.push(dep);
      });
    }
    return [...new Set(deps)];
  }
}

export default ResonanceOrchestrator;
